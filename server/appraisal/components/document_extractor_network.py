import subprocess
import copy
import tensorflow as tf
from appraisal.components.document_generator import DocumentGenerator
from tensorflow.python.client import device_lib
import numpy
import pickle
import math
import random
import json
import io
from pprint import pprint
import concurrent.futures
import csv
import datetime
import multiprocessing
import traceback
from appraisal.components.document_extractor_dataset import DocumentExtractorDataset


from appraisal.libs.transformer.model.attention_layer import SelfAttention
from appraisal.libs.transformer.model import model_utils


class DocumentExtractorNetwork:
    def __init__(self, networkOutputs, dataset, configuration, allowColumnProcessing):
        self.dataset = dataset

        self.networkOutputs = networkOutputs
        self.allowColumnProcessing = allowColumnProcessing

        self.name = "-".join(networkOutputs)

        self.wordVectorSize = self.dataset.wordVectorSize
        self.batchSize = configuration['batchSize']

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        self.session = tf.Session(config=session_conf)

        self.lstmSize = configuration['lstmSize']
        self.lstmDropout = configuration['lstmDropout']
        self.denseSize = configuration['denseSize']

        self.attentionDropout = configuration['attentionDropout']
        self.attentionSize = configuration['attentionSize']
        self.attentionHeads = configuration['attentionHeads']

        self.denseDropout = configuration['denseDropout']
        self.learningRate = configuration['learningRate']
        self.layers = configuration['layers']
        self.epochs = configuration['epochs']
        self.stepsPerEpoch = configuration['stepsPerEpoch']

        self.maxWorkers = configuration['maxWorkers']
        self.batchPreload = configuration['batchPreload']

        self.rollingAverageAccuracies = {}
        self.rollingAverageHorizon = configuration['rollingAverageHorizon']
        self.testingRollingAverageHorizon = configuration['testingRollingAverageHorizon']
        self.printTime = configuration['printTime']

        if configuration['numGPUs'] == -1:
            self.numGPUs = len(self.getAvailableGpus())
        else:
            self.numGPUs = min(configuration['numGPUs'], len(self.getAvailableGpus()))


    def getAvailableGpus(self):
        local_device_protos = device_lib.list_local_devices()
        return [x.name for x in local_device_protos if x.device_type == 'GPU']

    def applyRollingAverage(self, name, value, horizon=None):
        if horizon is None:
            horizon = self.rollingAverageHorizon

        if name not in self.rollingAverageAccuracies:
            self.rollingAverageAccuracies[name] = [value]
            return value
        else:
            self.rollingAverageAccuracies[name].append(value)
            if len(self.rollingAverageAccuracies[name]) > self.rollingAverageHorizon:
                self.rollingAverageAccuracies[name].pop(0)
            return numpy.average(self.rollingAverageAccuracies[name])


    def trainAlgorithm(self):
        with self.session.as_default():
            primaryDevice = "/cpu:0"
            if self.numGPUs == 1:
                primaryDevice = "/gpu:0"

            with tf.device(primaryDevice):
                self.createNetwork()

            # Define Training procedure
            global_step = tf.Variable(0, name="global_step", trainable=False)
            train_op = tf.train.AdamOptimizer(self.learningRate, beta1=0.99).minimize(self.loss, global_step=global_step)

            with concurrent.futures.ProcessPoolExecutor(max_workers=self.maxWorkers) as executor:
                testBatchFutures = []
                for n in range(self.batchPreload):
                    testBatchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, True, self.allowColumnProcessing))

                for future in testBatchFutures:
                    future.result()

                trainBatchFutures = []
                for n in range(self.batchPreload):
                    trainBatchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, False, self.allowColumnProcessing))

                for future in trainBatchFutures:
                    future.result()

                lastTime = datetime.datetime.now()

                self.createSaver()

                # Initialize all variables
                self.session.run(tf.global_variables_initializer())

                for epoch in range(self.epochs):
                    # Training loop. For each batch...
                    for batchIndex in range(self.stepsPerEpoch):
                        try:
                            batchFuture = trainBatchFutures.pop(0)
                            trainBatchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, False, self.allowColumnProcessing))

                            batch = batchFuture.result()

                            wordVectors = batch[0]
                            lineWordIndexes = batch[5]
                            lineReverseWordIndexes = batch[6]

                            columnWordIndexes = batch[7]
                            columnReverseWordIndexes = batch[8]


                            classificationOutputs = batch[9]
                            modifierOutputs = batch[10]
                            groupOutputs = batch[11]
                            textTypeOutputs = batch[12]

                            # Train
                            feed_dict = {
                                self.inputWordVectors: wordVectors,
                                self.lineWordIndexesInput: lineWordIndexes,
                                self.lineReverseIndexesInput: lineReverseWordIndexes,
                                self.columnWordIndexesInput: columnWordIndexes,
                                self.columnReverseIndexesInput: columnReverseWordIndexes,
                                self.trainingInput: True
                            }

                            operations = [train_op, global_step, self.loss]

                            if 'classification' in self.networkOutputs:
                                feed_dict[self.inputClassification] = classificationOutputs
                                operations.append(self.classificationAccuracy)
                                operations.append(self.classificationNonNullAccuracy)
                                operations.append(self.confusionMatrix)

                            if 'modifiers' in self.networkOutputs:
                                feed_dict[self.inputModifiers] = modifierOutputs
                                operations.append(self.modifierAccuracy)
                                operations.append(self.modifierNonNullAccuracy)

                            if 'groups' in self.networkOutputs:
                                feed_dict[self.inputGroups] = groupOutputs
                                for groupSet in self.dataset.groupSets:
                                    operations.append(self.groupSetAccuracy[groupSet])
                                    operations.append(self.groupNonNullAccuracy[groupSet])

                            if 'textType' in self.networkOutputs:
                                feed_dict[self.inputTextType] = textTypeOutputs
                                operations.append(self.textTypeAccuracy)

                            results = self.session.run(operations, feed_dict)

                            step = results[1]
                            loss = results[2]

                            message = f"Epoch: {epoch} Batch: {batchIndex} Loss: {loss}"


                            resultIndex = 3
                            if 'classification' in self.networkOutputs:
                                accuracy = self.applyRollingAverage("classification", results[resultIndex])
                                nonNullAccuracy = self.applyRollingAverage("classificationNonNull", results[resultIndex + 1])
                                confusionMatrix = results[resultIndex + 2]
                                resultIndex += 3

                                if batchIndex % 10 == 0:
                                    with open("matrix.csv", "wt") as file:
                                        file.write(self.formatConfusionMatrix(confusionMatrix))


                                message += f" Classification: {nonNullAccuracy:.3f}"

                            if 'modifiers' in self.networkOutputs:
                                accuracy = self.applyRollingAverage("modifiers", results[resultIndex])
                                nonNullAccuracy = self.applyRollingAverage("modifiersNonNull", results[resultIndex + 1])
                                resultIndex += 2

                                message += f" Modifiers: {nonNullAccuracy:.3f}"

                            if 'groups' in self.networkOutputs:
                                for groupSet in self.dataset.groupSets:
                                    accuracy = self.applyRollingAverage(f"group-{groupSet}", results[resultIndex])
                                    nonNullAccuracy = self.applyRollingAverage(f"groupNonNull-{groupSet}", results[resultIndex + 1])
                                    resultIndex += 2

                                    message += f" {groupSet}: {nonNullAccuracy:.3f}"

                            if 'textType' in self.networkOutputs:
                                accuracy = self.applyRollingAverage("textType", results[resultIndex])
                                resultIndex += 1

                                message += f" Text-Type: {accuracy:.3f}"

                            if batchIndex % self.printTime == 0:
                                print(f"{(datetime.datetime.now() - lastTime).total_seconds() / self.printTime:.2f}s", message, flush=True)
                                lastTime = datetime.datetime.now()

                            if batchIndex % 10 == 0:
                                batchFuture = testBatchFutures.pop(0)
                                testBatchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, True, self.allowColumnProcessing))

                                batch = batchFuture.result()

                                wordVectors = batch[0]
                                lineWordIndexes = batch[5]
                                lineReverseWordIndexes = batch[6]

                                columnWordIndexes = batch[7]
                                columnReverseWordIndexes = batch[8]

                                classificationOutputs = batch[9]
                                modifierOutputs = batch[10]
                                groupOutputs = batch[11]
                                textTypeOutputs = batch[12]

                                # Train
                                feed_dict = {
                                    self.inputWordVectors: wordVectors,
                                    self.lineWordIndexesInput: lineWordIndexes,
                                    self.lineReverseIndexesInput: lineReverseWordIndexes,
                                    self.columnWordIndexesInput: columnWordIndexes,
                                    self.columnReverseIndexesInput: columnReverseWordIndexes,
                                    self.trainingInput: False
                                }

                                operations = [self.loss]

                                if 'classification' in self.networkOutputs:
                                    feed_dict[self.inputClassification] = classificationOutputs
                                    operations.append(self.classificationAccuracy)
                                    operations.append(self.classificationNonNullAccuracy)
                                    operations.append(self.confusionMatrix)

                                if 'modifiers' in self.networkOutputs:
                                    feed_dict[self.inputModifiers] = modifierOutputs
                                    operations.append(self.modifierAccuracy)
                                    operations.append(self.modifierNonNullAccuracy)

                                if 'groups' in self.networkOutputs:
                                    feed_dict[self.inputGroups] = groupOutputs
                                    for groupSet in self.dataset.groupSets:
                                        operations.append(self.groupSetAccuracy[groupSet])
                                        operations.append(self.groupNonNullAccuracy[groupSet])

                                if 'textType' in self.networkOutputs:
                                    feed_dict[self.inputTextType] = textTypeOutputs
                                    operations.append(self.textTypeAccuracy)

                                results = self.session.run(operations, feed_dict)

                                loss = results[0]

                                message = f"Testing Loss: {loss}"


                                resultIndex = 1
                                if 'classification' in self.networkOutputs:
                                    accuracy = self.applyRollingAverage("testing-classification", results[resultIndex], self.testingRollingAverageHorizon)
                                    nonNullAccuracy = self.applyRollingAverage("testing-classificationNonNull", results[resultIndex + 1], self.testingRollingAverageHorizon)
                                    confusionMatrix = results[resultIndex + 2]
                                    resultIndex += 3

                                    if batchIndex % 10 == 0:
                                        with open("matrix.csv", "wt") as file:
                                            file.write(self.formatConfusionMatrix(confusionMatrix))


                                    message += f" Classification: {nonNullAccuracy:.3f}"

                                if 'modifiers' in self.networkOutputs:
                                    accuracy = self.applyRollingAverage("testing-modifiers", results[resultIndex], self.testingRollingAverageHorizon)
                                    nonNullAccuracy = self.applyRollingAverage("testing-modifiersNonNull", results[resultIndex + 1], self.testingRollingAverageHorizon)
                                    resultIndex += 2

                                    message += f" Modifiers: {nonNullAccuracy:.3f}"

                                if 'groups' in self.networkOutputs:
                                    for groupSet in self.dataset.groupSets:
                                        accuracy = self.applyRollingAverage(f"testing-group-{groupSet}", results[resultIndex], self.testingRollingAverageHorizon)
                                        nonNullAccuracy = self.applyRollingAverage(f"testing-groupNonNull-{groupSet}", results[resultIndex + 1], self.testingRollingAverageHorizon)
                                        resultIndex += 2

                                        message += f" {groupSet}: {nonNullAccuracy:.3f}"

                                if 'textType' in self.networkOutputs:
                                    accuracy = self.applyRollingAverage("testing-textType", results[resultIndex], self.testingRollingAverageHorizon)
                                    resultIndex += 1

                                    message += f" Text-Type: {accuracy:.3f}"
                                    
                                print(message, flush=True)

                        except Exception as e:
                            traceback.print_exc()
                            # Otherwise just ignore the exception and try to move on to the next batch.
                            # This helps to hedge against any rare errors in data prep from killing the
                            # training process entirely.

                    # self.saver.save(self.session, f"models/model-{self.name}-{epoch}.ckpt")
                    self.saver.save(self.session, f"models/model-{self.name}.ckpt")
                self.saver.save(self.session, f"models/model-{self.name}.ckpt")

    def formatConfusionMatrix(self, matrix):
        try:
            results = []

            for labelIndex, label in enumerate(self.dataset.labels):
                rowTotal = numpy.sum(matrix[labelIndex])

                result = {
                    "actual": label
                }
                for labelIndex2, label2 in enumerate(self.dataset.labels):
                    if rowTotal == 0:
                        result[f"predicted {label2}"] = 0
                    else:
                        result[f"predicted {label2}"] = matrix[labelIndex][labelIndex2] / rowTotal
                results.append(result)

            buffer = io.StringIO()

            writer = csv.DictWriter(buffer, fieldnames=list(results[0].keys()))

            writer.writeheader()
            writer.writerows(results)

            return buffer.getvalue()
        except IndexError:
            print("Error creating confusion matrix.")
            return ""

    def loadAlgorithm(self):
        with self.session.as_default():
            primaryDevice = "/cpu:0"
            if self.numGPUs == 1:
                primaryDevice = "/gpu:0"

            with tf.device(primaryDevice):
                self.createNetwork()

            self.createSaver()

            # Initialize all variables
            self.saver.restore(self.session, f"models/model-{self.name}.ckpt")

    def createSaver(self):
        all_variables = tf.get_collection_ref(tf.GraphKeys.GLOBAL_VARIABLES)
        self.saver = tf.train.Saver(var_list=[v for v in all_variables])

    def predictDocument(self, file):
        self.loadAlgorithm()

        data = self.dataset.prepareDocument(file, self.allowColumnProcessing)

        wordVectors = [data[0]]
        lineWordIndexes = [data[7]]
        lineReverseWordIndexes = [data[8]]
        columnWordIndexes = [data[10]]
        columnReverseWordIndexes = [data[11]]

        # Train
        feed_dict = {
            self.inputWordVectors: wordVectors,
            self.lineWordIndexesInput: lineWordIndexes,
            self.lineReverseIndexesInput: lineReverseWordIndexes,
            self.columnWordIndexesInput: columnWordIndexes,
            self.columnReverseIndexesInput: columnReverseWordIndexes,
            self.trainingInput: False
        }
        
        outputDesired = []
        
        if 'classification' in self.networkOutputs:
            outputDesired.append(self.classificationPredictions)
            outputDesired.append(self.classificationProbabilities)
        
        if 'modifiers' in self.networkOutputs:
            outputDesired.append(self.modifierPredictions)
            outputDesired.append(self.modifierProbabilities)
        
        if 'groups' in self.networkOutputs:
            for groupSet in self.dataset.groupSets:
                outputDesired.append(self.groupPredictions[groupSet])
                outputDesired.append(self.groupProbabilities[groupSet])
        
        if 'textType' in self.networkOutputs:
            outputDesired.append(self.textTypePredictions)
            outputDesired.append(self.textTypeProbabilities)

        outputs = self.session.run(outputDesired, feed_dict)
        currentGroup = {}
        currentGroupNumbers = {}
        currentGroupStartLineNumbers = {}

        for wordIndex in range(len(wordVectors[0])):
            word = file.words[wordIndex]

            outputIndex = 0
            if 'classification' in self.networkOutputs:
                predictions = outputs[outputIndex]
                probabilities = outputs[outputIndex + 1]
                outputIndex += 2
            
            
                wordPrediction = predictions[0][wordIndex]

                word['classification'] = self.dataset.labels[wordPrediction]
                word['classificationProbabilities'] = {
                    label: float(probabilities[0][wordIndex][labelIndex])
                    for labelIndex, label in enumerate(self.dataset.labels)
                }

            if 'modifiers' in self.networkOutputs:
                predictions = outputs[outputIndex]
                probabilities = outputs[outputIndex + 1]
                outputIndex += 2
                    
                word['modifiers'] = [modifier for index, modifier in enumerate(self.dataset.modifiers) if predictions[0][wordIndex][index]]
                word['modifierProbabilities'] = {
                    label: float(probabilities[0][wordIndex][labelIndex])
                    for labelIndex, label in enumerate(self.dataset.modifiers)
                }
        
            if 'groups' in self.networkOutputs:
                for groupSet in self.dataset.groupSets:
                    predictions = outputs[outputIndex]
                    probabilities = outputs[outputIndex + 1]
                    outputIndex += 2
                    
                    groupPrediction = predictions[0][wordIndex]

                    groupIndex = math.floor(groupPrediction/3)
                    startEndIndex = groupPrediction % 3

                    group = self.dataset.groups[groupSet][groupIndex]

                    word['groupProbabilities'][groupSet] = {}
                    for labelIndex, label in enumerate(self.dataset.groups[groupSet]):
                        word['groupProbabilities'][groupSet][label+"-start"] = float(probabilities[0][wordIndex][labelIndex * 3])
                        word['groupProbabilities'][groupSet][label+"-middle"] = float(probabilities[0][wordIndex][labelIndex * 3 + 1])
                        word['groupProbabilities'][groupSet][label+"-end"] = float(probabilities[0][wordIndex][labelIndex * 3 + 2])

                    if group != "null":
                        word['groups'][groupSet] = group
                        if group == currentGroup.get(groupSet, None):
                            if startEndIndex == 0:
                                if currentGroupStartLineNumbers[groupSet] == word.documentLineNumber:
                                    word['groupNumbers'][groupSet] = currentGroupNumbers[groupSet]
                                else:
                                    currentGroupNumbers[groupSet] += 1
                                    currentGroupStartLineNumbers[groupSet] = word.documentLineNumber
                                    word['groupNumbers'][groupSet] = currentGroupNumbers[groupSet]
                            elif startEndIndex == 1 or startEndIndex == 2:
                                word['groupNumbers'][groupSet] = currentGroupNumbers[groupSet]
                        else:
                            currentGroup[groupSet] = group
                            if groupSet not in currentGroupNumbers:
                                currentGroupNumbers[groupSet] = 0
                            else:
                                currentGroupNumbers[groupSet] += 1

                            currentGroupStartLineNumbers[groupSet] = word.documentLineNumber
                            word['groupNumbers'][groupSet] = currentGroupNumbers[groupSet]
                    else:
                        currentGroup[groupSet] = None
                        currentGroupStartLineNumbers[groupSet] = None

            if 'textType' in self.networkOutputs:
                predictions = outputs[outputIndex]
                probabilities = outputs[outputIndex + 1]
                outputIndex += 2
                
                textTypePrediction = predictions[0][wordIndex]
                    
                word['textType'] = self.dataset.textTypes[textTypePrediction]
                word['textTypeProbabilities'] = {
                    label: float(probabilities[0][wordIndex][labelIndex])
                    for labelIndex, label in enumerate(self.dataset.textTypes)
                }

    def createRecurrentAttentionLayer(self, inputs, wordIndexes, mode):
        batchSize = tf.shape(inputs)[0]
        length = tf.shape(inputs)[1]
        vectorSize = inputs.shape[2]

        sequencesPerSample = tf.shape(wordIndexes)[1]
        sequenceLength = tf.shape(wordIndexes)[2]

        blank = tf.zeros(shape=[batchSize, 1, vectorSize])

        indexesReshaped = tf.reshape(wordIndexes, shape=[batchSize, sequencesPerSample * sequenceLength ])

        inputs = tf.batch_gather(tf.concat((blank, inputs), axis=1), indexesReshaped + tf.ones_like(indexesReshaped))

        inputs = tf.reshape(inputs, shape=[batchSize, sequencesPerSample, sequenceLength, vectorSize ])
        inputs = tf.reshape(inputs, shape=[batchSize * sequencesPerSample, sequenceLength, vectorSize ])

        # inputs = tf.reshape(inputs, shape=[batchSize, length, vectorSize])

        if mode == 'attention':
            # positionEncoding = model_utils.get_position_encoding(sequenceLength, vectorSize)
            attention_bias = model_utils.get_padding_bias(tf.reduce_sum(inputs, axis=2))
            # attention = SelfAttention(self.attentionSize, self.attentionHeads, self.attentionDropout, True)(inputs + positionEncoding, attention_bias)
            attention = SelfAttention(self.attentionSize, self.attentionHeads, self.attentionDropout, True)(inputs, attention_bias)
            #
            denseInput = tf.reshape(attention, shape=[batchSize * sequencesPerSample * sequenceLength, self.attentionSize])
            dense = tf.layers.dense(denseInput, self.lstmSize, activation=tf.nn.relu)
            output = tf.reshape(dense, [batchSize* sequencesPerSample, sequenceLength, self.lstmSize])

            reshapedOutput = tf.reshape(output, shape=[batchSize, sequencesPerSample, sequenceLength, self.lstmSize])
            return reshapedOutput
        elif mode == 'recurrent':
            rnnInput = inputs
            rnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(self.lstmSize), output_keep_prob=self.lstmDropoutAdjusted),
                                                            cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(self.lstmSize), output_keep_prob=self.lstmDropoutAdjusted),
                                                            inputs=rnnInput,
                                                            # sequence_length=self.inputLength,
                                                            dtype=tf.float32)

            # output = tf.batch_gather(rnnOutputs[0] + rnnOutputs[1], reverseWordIndexes)
            # output = tf.batch_gather(rnnInput, reverseWordIndexes)

            output = rnnOutputs[0] + rnnOutputs[1]

            reshapedOutput = tf.reshape(output, shape=[batchSize, sequencesPerSample, sequenceLength, self.lstmSize])

            return reshapedOutput

    def debug(self, tensor):
        return tf.Print(tensor, [tensor.name, tf.shape(tensor)], summarize=1000)

    def createComboLineColumnLayer(self, inputs):
        batchSize = tf.shape(inputs)[0]
        length = tf.shape(inputs)[1]
        vectorSize = self.wordVectorSize

        with tf.name_scope("lineSorted"), tf.variable_scope("lineSorted"):
            rawLineOutput = self.createRecurrentAttentionLayer(inputs, self.lineWordIndexesInput, "attention")

            # rawLineOutput = self.debug(rawLineOutput)

            sequencesPerSample = tf.shape(self.lineWordIndexesInput)[1]
            sequenceLength = tf.shape(self.lineWordIndexesInput)[2]

            rawLineOutput = tf.reshape(rawLineOutput, shape=[batchSize, sequencesPerSample * sequenceLength, self.lstmSize])

            newIndexes = self.lineReverseIndexesInput[:, :, 0] * sequenceLength + self.lineReverseIndexesInput[:, :, 1]

            lineOutput = tf.batch_gather(rawLineOutput, newIndexes)

            lineOutput = tf.reshape(lineOutput, shape=[batchSize, length, self.lstmSize])

        with tf.name_scope("column"), tf.variable_scope("column"):
            rawColumnOutput = self.createRecurrentAttentionLayer(inputs, self.columnWordIndexesInput, "attention")

            # rawColumnOutput = self.debug(rawColumnOutput)

            sequencesPerSample = tf.shape(self.columnWordIndexesInput)[1]
            sequenceLength = tf.shape(self.columnWordIndexesInput)[2]

            rawColumnOutput = tf.reshape(rawColumnOutput, shape=[batchSize, sequencesPerSample * sequenceLength, self.lstmSize])

            newIndexes = self.columnReverseIndexesInput[:, :, 0] * sequenceLength + self.columnReverseIndexesInput[:, :, 1]

            columnOutput = tf.batch_gather(rawColumnOutput, newIndexes)

            columnOutput = tf.reshape(columnOutput, shape=[batchSize, length, self.lstmSize])

        layerOutputs = tf.concat(values=[lineOutput, columnOutput], axis=2)

        # layerOutputs = tf.layers.batch_normalization(layerOutputs, training=self.trainingInput)

        return layerOutputs

    def createNetwork(self):
        with tf.name_scope(self.name), tf.variable_scope(self.name, reuse=tf.AUTO_REUSE):
            numClasses = len(self.dataset.labels)
            numModifiers = len(self.dataset.modifiers)

            numGroups = self.dataset.totalGroupLabels * 3
            numTextType = len(self.dataset.textTypes)

            # Placeholders for input, output and dropout
            self.inputWordVectors = tf.placeholder(tf.float32, shape=[None, None, self.wordVectorSize], name='input_word_vectors')
            # self.inputLength = tf.placeholder(tf.int32, shape=[None], name='input_length')

            self.inputClassification = tf.placeholder(tf.float32, shape=[None, None, numClasses], name='input_classification')
            self.inputModifiers = tf.placeholder(tf.float32, shape=[None, None, numModifiers], name='input_modifiers')
            self.inputGroups = tf.placeholder(tf.float32, shape=[None, None, numGroups], name='input_groups')
            self.inputTextType = tf.placeholder(tf.float32, shape=[None, None, numTextType], name='input_text_types')

            self.lineWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None, None], name='line_indexes')
            self.lineReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None, None], name='line_reverse_indexes')

            self.columnWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None, None], name='column_indexes')
            self.columnReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None, None], name='column_reverse_indexes')

            self.trainingInput = tf.placeholder(tf.bool, name='training')

            self.lstmDropoutAdjusted = tf.where(self.trainingInput, self.lstmDropout, 1.0)

            # Recurrent Neural Network
            with tf.name_scope("rnn"), tf.variable_scope("rnn", reuse=tf.AUTO_REUSE):
                currentOutput = self.inputWordVectors
                for layer in range(self.layers):
                    with tf.name_scope(f"layer{layer}"), tf.variable_scope(f"layer{layer}"):
                        currentOutput = self.createComboLineColumnLayer(currentOutput)

                batchSize = tf.shape(currentOutput)[0]
                length = tf.shape(currentOutput)[1]
                vectorSize = currentOutput.shape[2]

                reshaped = tf.reshape(currentOutput, shape=(batchSize * length, vectorSize))

                with tf.name_scope("denseLayers"), tf.variable_scope("denseLayers"):
                    dense1 = tf.layers.dense(tf.layers.dropout(reshaped, rate=self.denseDropout, training=self.trainingInput), self.denseSize, activation=tf.nn.relu)
                    batchNorm1 = tf.layers.batch_normalization(dense1, training=self.trainingInput)
                    dense2 = tf.layers.dense(tf.layers.dropout(batchNorm1, rate=self.denseDropout, training=self.trainingInput), self.denseSize, activation=tf.nn.relu)
                    batchNorm2 = tf.layers.batch_normalization(dense2, training=self.trainingInput)

                    if 'classification' in self.networkOutputs:
                        self.classificationLogits = tf.layers.dense(batchNorm2, numClasses)
                        self.classificationProbabilities = tf.reshape(tf.nn.softmax(self.classificationLogits), shape=[batchSize, length, numClasses])
                        self.classificationPredictions = tf.reshape(tf.argmax(self.classificationLogits, 1, name="classificationPredictions"), shape=[batchSize, length])

                    if 'modifiers' in self.networkOutputs:
                        self.modifierLogits = tf.layers.dense(batchNorm2, numModifiers)
                        self.modifierProbabilities = tf.reshape(tf.nn.sigmoid(self.modifierLogits), shape=[batchSize, length, numModifiers])
                        self.modifierPredictions = tf.reshape(tf.round(tf.nn.sigmoid(self.modifierLogits)), shape=[batchSize, length, numModifiers])

                    if 'groups' in self.networkOutputs:
                        self.groupLogits = {}
                        self.groupProbabilities = {}
                        self.groupPredictions = {}

                        for groupSet in self.dataset.groupSets:
                            numGroupSetItems = len(self.dataset.groups[groupSet]) * 3

                            self.groupLogits[groupSet] = tf.layers.dense(batchNorm2, numGroupSetItems)
                            self.groupProbabilities[groupSet] = tf.reshape(tf.nn.sigmoid(self.groupLogits[groupSet]), shape=[batchSize, length, numGroupSetItems])
                            self.groupPredictions[groupSet] = tf.reshape(tf.round(tf.nn.sigmoid(self.groupLogits[groupSet])), shape=[batchSize, length, numGroupSetItems])

                    if 'textType' in self.networkOutputs:
                        self.textTypeLogits = tf.layers.dense(batchNorm2, numTextType)
                        self.textTypeProbabilities = tf.reshape(tf.nn.softmax(self.textTypeLogits), shape=[batchSize, length, numTextType])
                        self.textTypePredictions = tf.reshape(tf.argmax(self.textTypeLogits, 1, name="textTypePredictions"), shape=[batchSize, length])

            # Calculate mean cross-entropy loss
            with tf.name_scope("loss"):
                losses = []

                if 'classification' in self.networkOutputs:
                    classificationLosses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.classificationLogits,
                                                                                      labels=tf.reshape(self.inputClassification, shape=[batchSize * length, numClasses]))
                    losses.append(tf.reduce_mean(classificationLosses))

                if 'modifiers' in self.networkOutputs:
                    modifierLosses = tf.nn.sigmoid_cross_entropy_with_logits(logits=self.modifierLogits, labels=tf.reshape(self.inputModifiers, shape=[batchSize * length, numModifiers]))
                    losses.append(tf.reduce_mean(modifierLosses))

                if 'groups' in self.networkOutputs:
                    groupInputIndex = 0
                    for groupSet in self.dataset.groupSets:
                        numGroupSetItems = len(self.dataset.groups[groupSet]) * 3

                        groupSetLosses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.groupLogits[groupSet],
                                                                                          labels=tf.reshape(self.inputGroups[:, :, groupInputIndex:groupInputIndex+numGroupSetItems], shape=[batchSize * length, numGroupSetItems]))
                        losses.append(tf.reduce_mean(groupSetLosses))

                        groupInputIndex += numGroupSetItems

                if 'textType' in self.networkOutputs:
                    textTypeLosses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.textTypeLogits,
                                                                                labels=tf.reshape(self.inputTextType, shape=[batchSize * length, numTextType]))
                    losses.append(tf.reduce_mean(textTypeLosses))

                self.loss = tf.reduce_sum(losses)

            if 'classification' in self.networkOutputs:
                classificationPredictionsFlat = tf.cast(tf.reshape(self.classificationPredictions, shape=[batchSize * length]), tf.int32)
                classificationActualFlat = tf.cast(tf.argmax(tf.reshape(self.inputClassification, shape=[batchSize * length, numClasses]), axis=1), tf.int32)

                # Accuracy
                with tf.name_scope("accuracy"):
                    correct_classifications = tf.equal(classificationPredictionsFlat, classificationActualFlat)

                    self.classificationAccuracy = tf.reduce_mean(tf.cast(correct_classifications, tf.float32), name="classificationAccuracy")

                    # Replace class_id_preds with class_id_true for recall here
                    classificationAccuracyMask = tf.cast(tf.equal(classificationPredictionsFlat, self.dataset.labels.index('null')), tf.int32) * \
                                                 tf.cast(tf.equal(classificationActualFlat, self.dataset.labels.index('null')), tf.int32)

                    classificationAccuracyMask = 1 - classificationAccuracyMask

                    class_acc_tensor = tf.cast(tf.equal(classificationActualFlat, classificationPredictionsFlat), tf.int32) * classificationAccuracyMask
                    class_acc = tf.reduce_sum(class_acc_tensor) / tf.maximum(tf.reduce_sum(classificationAccuracyMask), 1)

                    self.classificationNonNullAccuracy = class_acc

                with tf.device('/cpu:0'):
                    with tf.name_scope("confusion_matrix"):
                        self.confusionMatrix = tf.confusion_matrix(classificationActualFlat, classificationPredictionsFlat)

            if 'modifiers' in self.networkOutputs:
                modifierPredictionsFlat = tf.cast(tf.reshape(self.modifierPredictions, shape=[batchSize * length, numModifiers]), tf.int32)
                modifierActualFlat = tf.cast(tf.reshape(self.inputModifiers, shape=[batchSize * length, numModifiers]), tf.int32)

                # Accuracy
                with tf.name_scope("accuracy"):
                    correct_modifiers = tf.equal(modifierPredictionsFlat, modifierActualFlat)

                    self.modifierAccuracy = tf.reduce_mean(tf.cast(correct_modifiers, tf.float32), name="modifierAccuracy")

                    modifierAccuracyMask = tf.cast(tf.equal(modifierPredictionsFlat, 0), tf.int32) * \
                                           tf.cast(tf.equal(modifierActualFlat, 0), tf.int32)

                    modifierAccuracyMask = 1 - modifierAccuracyMask

                    modifier_class_acc_tensor = tf.cast(tf.equal(modifierActualFlat, modifierPredictionsFlat), tf.int32) * modifierAccuracyMask
                    modifier_class_acc = tf.reduce_sum(modifier_class_acc_tensor) / tf.maximum(tf.reduce_sum(modifierAccuracyMask), 1)

                    self.modifierNonNullAccuracy = modifier_class_acc

            if 'groups' in self.networkOutputs:
                self.groupSetAccuracy = {}
                self.groupNonNullAccuracy = {}

                groupInputIndex = 0
                for groupSet in self.dataset.groupSets:
                    numGroupSetItems = len(self.dataset.groups[groupSet]) * 3

                    groupSetPredictionsFlat = tf.cast(tf.reshape(self.groupPredictions[groupSet], shape=[batchSize * length, numGroupSetItems]), tf.int32)
                    groupSetActualFlat = tf.cast(tf.reshape(self.inputGroups[:, :, groupInputIndex:groupInputIndex+numGroupSetItems], shape=[batchSize * length, numGroupSetItems]), tf.int32)

                    # Accuracy
                    with tf.name_scope("accuracy"):
                        correct_group = tf.equal(groupSetPredictionsFlat, groupSetActualFlat)

                        self.groupSetAccuracy[groupSet] = tf.reduce_mean(tf.cast(correct_group, tf.float32))

                        nullIndex = self.dataset.groups[groupSet].index('null') * 3 + 1

                        groupAccuracyMask = tf.cast(tf.equal(groupSetPredictionsFlat, nullIndex), tf.int32) * \
                                               tf.cast(tf.equal(groupSetActualFlat, nullIndex), tf.int32)

                        groupAccuracyMask = 1 - groupAccuracyMask

                        group_class_acc_tensor = tf.cast(tf.equal(groupSetActualFlat, groupSetPredictionsFlat), tf.int32) * groupAccuracyMask
                        group_class_acc = tf.reduce_sum(group_class_acc_tensor) / tf.maximum(tf.reduce_sum(groupAccuracyMask), 1)

                        self.groupNonNullAccuracy[groupSet] = group_class_acc

                    groupInputIndex += numGroupSetItems

            if 'textType' in self.networkOutputs:
                textTypePredictionsFlat = tf.cast(tf.reshape(self.textTypePredictions, shape=[batchSize * length]), tf.int32)
                textTypeActualFlat = tf.cast(tf.argmax(tf.reshape(self.inputTextType, shape=[batchSize * length, numTextType]), axis=1), tf.int32)

                # Accuracy
                with tf.name_scope("accuracy"):
                    correctTextType = tf.equal(textTypePredictionsFlat, textTypeActualFlat)

                    self.textTypeAccuracy = tf.reduce_mean(tf.cast(correctTextType, tf.float32), name="textTypeAccuracy")

    @staticmethod
    def _get_cell(hidden_size, cell_type):
        if cell_type == "vanilla":
            return tf.nn.rnn_cell.RNNCell(hidden_size)
        elif cell_type == "lstm":
            return tf.nn.rnn_cell.LSTMCell(hidden_size)
            # return tf.contrib.rnn.LayerNormBasicLSTMCell(hidden_size)
        elif cell_type == "gru":
            return tf.nn.rnn_cell.GRUCell(hidden_size)
        else:
            print("ERROR: '" + cell_type + "' is a wrong cell type !!!")
            return None

    # Extract the output of last cell of each sequence
    # Ex) The movie is good -> length = 4
    #     output = [ [1.314, -3.32, ..., 0.98]
    #                [0.287, -0.50, ..., 1.55]
    #                [2.194, -2.12, ..., 0.63]
    #                [1.938, -1.88, ..., 1.31]
    #                [  0.0,   0.0, ...,  0.0]
    #                ...
    #                [  0.0,   0.0, ...,  0.0] ]
    #     The output we need is 4th output of cell, so extract it.
    @staticmethod
    def last_relevant(seq, length):
        batch_size = tf.shape(seq)[0]
        max_length = int(seq.get_shape()[1])
        input_size = int(seq.get_shape()[2])
        index = tf.range(0, batch_size) * max_length + (length - 1)
        flat = tf.reshape(seq, [-1, input_size])
        return tf.gather(flat, index)

