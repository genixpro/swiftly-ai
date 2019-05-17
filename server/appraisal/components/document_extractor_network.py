import subprocess
import copy
import tensorflow as tf
from appraisal.components.document_generator import DocumentGenerator
import numpy
import pickle
import random
import json
import io
from pprint import pprint
import concurrent.futures
import csv
import multiprocessing
from appraisal.components.document_extractor_dataset import DocumentExtractorDataset


# from appraisal.libs.transformer.model.attention_layer import SelfAttention
# from appraisal.libs.transformer.model import model_utils


class DocumentExtractorNetwork:
    def __init__(self, networkOutputs, dataset, allowColumnProcessing):
        self.dataset = dataset

        self.networkOutputs = networkOutputs
        self.allowColumnProcessing = allowColumnProcessing

        self.name = "-".join(networkOutputs)

        self.wordVectorSize = self.dataset.wordVectorSize
        self.batchSize = 8

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        self.session = tf.Session(config=session_conf)

        self.lstmSize = 100
        self.lstmDropout = 0.5
        self.denseSize = 100

        self.attentionDropout = 0.5
        self.attentionSize = 256
        self.attentionHeads = 4

        self.denseDropout = 0.5
        self.learningRate = 1e-3
        self.layers = 2
        self.epochs = 100
        self.stepsPerEpoch = 1000

        self.maxWorkers = 3
        self.batchPreload = 20

    def trainAlgorithm(self):
        with self.session.as_default():
            with tf.device('/gpu:0'):
                self.createNetwork()

            # Define Training procedure
            global_step = tf.Variable(0, name="global_step", trainable=False)
            train_op = tf.train.AdamOptimizer(self.learningRate, beta1=0.99).minimize(self.loss, global_step=global_step)

            with concurrent.futures.ProcessPoolExecutor(max_workers=self.maxWorkers) as executor:
                batchFutures = []
                for n in range(self.batchPreload):
                    batchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, self.allowColumnProcessing))

                for future in batchFutures:
                    future.result()

                self.createSaver()

                # Initialize all variables
                self.session.run(tf.global_variables_initializer())

                for epoch in range(self.epochs):
                    # Training loop. For each batch...
                    for batchIndex in range(self.stepsPerEpoch):
                        batchFuture = batchFutures.pop(0)
                        batchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize, self.allowColumnProcessing))

                        batch = batchFuture.result()

                        wordVectors = batch[0]
                        lineSortedWordIndexes = batch[1]
                        lineSortedReverseWordIndexes = batch[2]
                        columnSortedWordIndexes = batch[3]
                        columnReverseWordIndexes = batch[4]
                        classificationOutputs = batch[5]
                        modifierOutputs = batch[6]
                        groupOutputs = batch[7]
                        textTypeOutputs = batch[8]

                        # Train
                        feed_dict = {
                            self.inputWordVectors: wordVectors,
                            self.lineSortedWordIndexesInput: lineSortedWordIndexes,
                            self.lineSortedReverseIndexesInput: lineSortedReverseWordIndexes,
                            self.columnSortedWordIndexesInput: columnSortedWordIndexes,
                            self.columnSortedReverseIndexesInput: columnReverseWordIndexes,
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
                            accuracy = results[resultIndex]
                            nonNullAccuracy = results[resultIndex + 1]
                            confusionMatrix = results[resultIndex + 2]
                            resultIndex += 3

                            if batchIndex % 10 == 0:
                                with open("matrix.csv", "wt") as file:
                                    file.write(self.formatConfusionMatrix(confusionMatrix))


                            message += f" Classification: {accuracy:.3f} Non Null: {nonNullAccuracy:.3f}"

                        if 'modifiers' in self.networkOutputs:
                            accuracy = results[resultIndex]
                            nonNullAccuracy = results[resultIndex + 1]
                            resultIndex += 2

                            message += f" Modifiers: {accuracy:.3f} Non Null: {nonNullAccuracy:.3f}"

                        if 'groups' in self.networkOutputs:
                            for groupSet in self.dataset.groupSets:
                                accuracy = results[resultIndex]
                                nonNullAccuracy = results[resultIndex + 1]
                                resultIndex += 2

                                message += f" {groupSet}: {accuracy:.3f} Non Null: {nonNullAccuracy:.3f}"

                        if 'textType' in self.networkOutputs:
                            accuracy = results[resultIndex]
                            resultIndex += 1

                            message += f" Text-Type: {accuracy:.3f}"

                        print(message, flush=True)

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
            # with tf.device('/gpu:0'):
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
        lineSortedWordIndexes = [data[1]]
        lineSortedReverseWordIndexes = [data[2]]
        columnSortedWordIndexes = [data[3]]
        columnReverseWordIndexes = [data[4]]

        # Train
        feed_dict = {
            self.inputWordVectors: wordVectors,
            self.lineSortedWordIndexesInput: lineSortedWordIndexes,
            self.lineSortedReverseIndexesInput: lineSortedReverseWordIndexes,
            self.columnSortedWordIndexesInput: columnSortedWordIndexes,
            self.columnSortedReverseIndexesInput: columnReverseWordIndexes
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
                        
                    word['groups'][groupSet] = self.dataset.groups[groupSet][groupPrediction]
                    word['groupProbabilities'][groupSet] = {
                        label: float(probabilities[0][wordIndex][labelIndex])
                        for labelIndex, label in enumerate(self.dataset.groups[groupSet])
                    }
            
            if 'textType' in self.networkOutputs:
                predictions = outputs[outputIndex]
                probabilities = outputs[outputIndex + 1]
                outputIndex += 2
                
                textTypePrediction = predictions[0][wordIndex]
                    
                word['textType'] = self.dataset.textType[textTypePrediction]
                word['textTypeProbabilities'] = {
                    label: float(probabilities[0][wordIndex][labelIndex])
                    for labelIndex, label in enumerate(self.dataset.textType)
                }

    def createRecurrentAttentionLayer(self, inputs, wordIndexes, reverseWordIndexes):
        batchSize = tf.shape(inputs)[0]
        length = tf.shape(inputs)[1]
        vectorSize = inputs.shape[2]

        inputs = tf.batch_gather(inputs, wordIndexes)
        # inputs = tf.reshape(inputs, shape=[batchSize, length, vectorSize])
        #
        # positionEncodiing = model_utils.get_position_encoding(length, vectorSize)
        # attention_bias = model_utils.get_padding_bias(tf.reduce_sum(inputs, axis=2))
        # attention = SelfAttention(self.attentionSize, self.attentionHeads, self.attentionDropout, True)(inputs + positionEncodiing, attention_bias)
        #
        # denseInput = tf.reshape(attention, shape=[batchSize * length, self.attentionSize])
        # dense = tf.layers.dense(denseInput, self.attentionSize, activation=tf.nn.relu)
        # rnnInput = tf.reshape(dense, [batchSize, length, self.attentionSize])

        rnnInput = inputs
        rnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(self.lstmSize), output_keep_prob=self.lstmDropout),
                                                        cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(self.lstmSize), output_keep_prob=self.lstmDropout),
                                                        inputs=rnnInput,
                                                        # sequence_length=self.inputLength,
                                                        dtype=tf.float32)

        output = tf.batch_gather(rnnOutputs[0] + rnnOutputs[1], reverseWordIndexes)
        # output = tf.batch_gather(rnnInput, reverseWordIndexes)

        return output

    def createComboLineColumnLayer(self, inputs):
        with tf.name_scope("lineSorted"), tf.variable_scope("lineSorted"):
            lineSortedOutput = self.createRecurrentAttentionLayer(inputs, self.lineSortedWordIndexesInput, self.lineSortedReverseIndexesInput)

        with tf.name_scope("column"), tf.variable_scope("column"):
            columnOutput = self.createRecurrentAttentionLayer(inputs, self.columnSortedWordIndexesInput, self.columnSortedReverseIndexesInput)

        layerOutputs = tf.concat(values=[lineSortedOutput, columnOutput], axis=2)

        layerOutputs = tf.layers.batch_normalization(layerOutputs)

        return layerOutputs

    def createNetwork(self):
        numClasses = len(self.dataset.labels)
        numModifiers = len(self.dataset.modifiers)

        numGroups = self.dataset.totalGroupLabels * 3
        numTextType = len(self.dataset.textTypes)

        # Placeholders for input, output and dropout
        self.inputWordVectors = tf.placeholder(tf.float32, shape=[None, None, self.wordVectorSize], name='input_word_vectors')
        self.inputLength = tf.placeholder(tf.int32, shape=[None], name='input_length')

        self.inputClassification = tf.placeholder(tf.float32, shape=[None, None, numClasses], name='input_classification')
        self.inputModifiers = tf.placeholder(tf.float32, shape=[None, None, numModifiers], name='input_modifiers')
        self.inputGroups = tf.placeholder(tf.float32, shape=[None, None, numGroups], name='input_groups')
        self.inputTextType = tf.placeholder(tf.float32, shape=[None, None, numTextType], name='input_text_types')

        self.lineSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='line_sorted_indexes')
        self.lineSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='line_sorted_reverse_indexes')

        self.columnSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_sorted_indexes')
        self.columnSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_sorted_reverse_indexes')

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
                dense1 = tf.layers.dense(tf.layers.dropout(reshaped, rate=self.denseDropout), self.denseSize, activation=tf.nn.relu)
                batchNorm1 = tf.layers.batch_normalization(dense1)
                dense2 = tf.layers.dense(tf.layers.dropout(batchNorm1, rate=self.denseDropout), self.denseSize, activation=tf.nn.relu)
                batchNorm2 = tf.layers.batch_normalization(dense2)
                
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
    
                    groupAccuracyMask = tf.cast(tf.equal(groupSetPredictionsFlat, 0), tf.int32) * \
                                           tf.cast(tf.equal(groupSetActualFlat, 0), tf.int32)
    
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

