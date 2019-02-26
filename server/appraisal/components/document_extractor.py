import subprocess
import copy
import tensorflow as tf
from .document_generator import DocumentGenerator
import numpy
import pickle
import random
import io
from pprint import pprint
import concurrent.futures
import csv
import multiprocessing
from .document_extractor_dataset import DocumentExtractorDataset


class DocumentExtractor:
    def __init__(self, db):
        self.dataset = DocumentExtractorDataset()

        self.db = db

        self.labels = self.dataset.labels
        self.modifiers = self.dataset.modifiers

        self.wordVectorSize = 300
        self.batchSize = 16

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        self.session = tf.Session(config=session_conf)

    def trainAlgorithm(self):
        self.dataset.loadDataset(self.db)

        with self.session.as_default():
            with tf.device('/gpu:0'):
                self.createNetwork()

            learningRate = 0.001

            # Define Training procedure
            global_step = tf.Variable(0, name="global_step", trainable=False)
            print(tf.GraphKeys.TRAINABLE_VARIABLES)
            train_op = tf.train.AdamOptimizer(learningRate).minimize(self.loss, global_step=global_step)

            with concurrent.futures.ProcessPoolExecutor(max_workers=4) as executor:
                batchFutures = []
                for n in range(20):
                    batchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize))

                for future in batchFutures:
                    future.result()

                self.createSaver()

                # Initialize all variables
                self.session.run(tf.global_variables_initializer())

                for epoch in range(100):
                    # Training loop. For each batch...
                    for batchIndex in range(1000):
                        batchFuture = batchFutures.pop(0)
                        batchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize))

                        batch = batchFuture.result()

                        wordVectors = batch[0]
                        lineSortedWordIndexes = batch[1]
                        lineSortedReverseWordIndexes = batch[2]
                        columnLeftSortedWordIndexes = batch[3]
                        columnLeftReverseWordIndexes = batch[4]
                        columnRightSortedWordIndexes = batch[5]
                        columnRightReverseWordIndexes = batch[6]
                        classificationOutputs = batch[7]
                        modifierOutputs = batch[8]

                        # Train
                        feed_dict = {
                            self.inputWordVectors: wordVectors,
                            self.lineSortedWordIndexesInput: lineSortedWordIndexes,
                            self.lineSortedReverseIndexesInput: lineSortedReverseWordIndexes,
                            self.columnLeftSortedWordIndexesInput: columnLeftSortedWordIndexes,
                            self.columnLeftSortedReverseIndexesInput: columnLeftReverseWordIndexes,
                            self.columnRightSortedWordIndexesInput: columnRightSortedWordIndexes,
                            self.columnRightSortedReverseIndexesInput: columnRightReverseWordIndexes,
                            self.inputClassification: classificationOutputs,
                            self.inputModifiers: modifierOutputs
                        }

                        _, step, loss, classificationAccuracy, classificationNonNullAccuracy, modifierAccuracy, modifierNonNullAccuracy, confusionMatrix = self.session.run([train_op, global_step, self.loss, self.classificationAccuracy, self.classificationNonNullAccuracy, self.modifierAccuracy, self.modifierNonNullAccuracy, self.confusionMatrix], feed_dict)

                        print(f"Epoch: {epoch} Batch: {batchIndex} Loss: {loss} Classification: {classificationAccuracy} Non Null: {classificationNonNullAccuracy} Modifier: {modifierAccuracy} Non Null: {modifierNonNullAccuracy}")

                        if batchIndex % 10 == 0:
                            with open("matrix.csv", "wt") as file:
                                file.write(self.formatConfusionMatrix(confusionMatrix))
                    self.saver.save(self.session, f"models/model-{epoch}.ckpt")
                    self.saver.save(self.session, "models/model.ckpt")
                self.saver.save(self.session, "models/model.ckpt")

    def formatConfusionMatrix(self, matrix):
        results = []

        for labelIndex, label in enumerate(self.labels):
            rowTotal = numpy.sum(matrix[labelIndex])

            result = {
                "actual": label
            }
            for labelIndex2, label2 in enumerate(self.labels):
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


    def loadAlgorithm(self):
        with self.session.as_default():
            with tf.device('/gpu:0'):
                self.createNetwork()

            self.createSaver()

            # Initialize all variables
            self.saver.restore(self.session, "models/model.ckpt")


    def createSaver(self):
        all_variables = tf.get_collection_ref(tf.GraphKeys.GLOBAL_VARIABLES)
        self.saver = tf.train.Saver(var_list=[v for v in all_variables])

    def predictDocument(self, document):
        self.loadAlgorithm()

        data = self.dataset.prepareDocument(document)

        wordVectors = [data[0]]
        lineSortedWordIndexes = [data[1]]
        lineSortedReverseWordIndexes = [data[2]]
        columnLeftSortedWordIndexes = [data[3]]
        columnLeftReverseWordIndexes = [data[4]]
        columnRightSortedWordIndexes = [data[5]]
        columnRightReverseWordIndexes = [data[6]]

        # Train
        feed_dict = {
            self.inputWordVectors: wordVectors,
            self.lineSortedWordIndexesInput: lineSortedWordIndexes,
            self.lineSortedReverseIndexesInput: lineSortedReverseWordIndexes,
            self.columnLeftSortedWordIndexesInput: columnLeftSortedWordIndexes,
            self.columnLeftSortedReverseIndexesInput: columnLeftReverseWordIndexes,
            self.columnRightSortedWordIndexesInput: columnRightSortedWordIndexes,
            self.columnRightSortedReverseIndexesInput: columnRightReverseWordIndexes
        }

        classifications, modifiers = self.session.run([self.classificationPredictions, self.modifierPredictions], feed_dict)

        for wordIndex in range(len(wordVectors[0])):
            prediction = classifications[0][wordIndex]

            word = document['words'][wordIndex]

            word['classification'] = self.labels[prediction]
            word['modifiers'] = [modifier for index, modifier in enumerate(self.modifiers) if modifiers[0][wordIndex][index]]


    def createNetwork(self):
        lstmSize = 100
        lstmDropout = 0.5
        denseSize = 100
        denseDropout = 0.5
        numClasses = len(self.labels)
        numModifiers = len(self.modifiers)

        # Placeholders for input, output and dropout
        self.inputWordVectors = tf.placeholder(tf.float32, shape=[None, None, self.wordVectorSize], name='input_word_vectors')
        self.inputLength = tf.placeholder(tf.int32, shape=[None], name='input_length')
        self.inputClassification = tf.placeholder(tf.float32, shape=[None, None, numClasses], name='input_classification')
        self.inputModifiers = tf.placeholder(tf.float32, shape=[None, None, numModifiers], name='input_modifiers')

        self.lineSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='line_sorted_indexes')
        self.lineSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='line_sorted_reverse_indexes')

        self.columnLeftSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_left_sorted_indexes')
        self.columnLeftSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_left_sorted_reverse_indexes')

        self.columnRightSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_right_sorted_indexes')
        self.columnRightSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, None], name='column_right_sorted_reverse_indexes')

        # Recurrent Neural Network
        with tf.name_scope("rnn"), tf.variable_scope("rnn", reuse=tf.AUTO_REUSE):
            with tf.name_scope("lineSorted1"), tf.variable_scope("lineSorted1"):
                inputs = tf.batch_gather(self.inputWordVectors, self.lineSortedWordIndexesInput)
                lineSortedRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=inputs,
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)


                lineSortedOutput1 = tf.batch_gather(lineSortedRnnOutputs[0] + lineSortedRnnOutputs[1], self.lineSortedReverseIndexesInput)

            with tf.name_scope("columnLeft1"), tf.variable_scope("columnLeft1"):
                columnLeftRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(self.inputWordVectors, self.columnLeftSortedWordIndexesInput),
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)

                columnLeftOutput1 = tf.batch_gather(columnLeftRnnOutputs[0] + columnLeftRnnOutputs[1], self.columnLeftSortedReverseIndexesInput)

            with tf.name_scope("columnRight1"), tf.variable_scope("columnRight1"):
                columnRightRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(self.inputWordVectors, self.columnRightSortedWordIndexesInput),
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)

                columnRightOutput1 = tf.batch_gather(columnRightRnnOutputs[0] + columnRightRnnOutputs[1], self.columnRightSortedReverseIndexesInput)

            layer1Outputs = tf.concat(values=[lineSortedOutput1, columnLeftOutput1, columnRightOutput1], axis=2)
            layer1Outputs = tf.layers.batch_normalization(layer1Outputs)

            with tf.name_scope("lineSorted2"), tf.variable_scope("lineSorted2"):
                inputs = tf.batch_gather(layer1Outputs, self.lineSortedWordIndexesInput)
                lineSortedRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=inputs,
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)

                lineSortedOutput2 = tf.batch_gather(lineSortedRnnOutputs[0] + lineSortedRnnOutputs[1], self.lineSortedReverseIndexesInput)

            with tf.name_scope("columnLeft2"), tf.variable_scope("columnLeft2"):
                columnLeftRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(layer1Outputs, self.columnLeftSortedWordIndexesInput),
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)

                columnLeftOutput2 = tf.batch_gather(columnLeftRnnOutputs[0] + columnLeftRnnOutputs[1], self.columnLeftSortedReverseIndexesInput)

            with tf.name_scope("columnRight2"), tf.variable_scope("columnRight2"):
                columnRightRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(layer1Outputs, self.columnRightSortedWordIndexesInput),
                                                   # sequence_length=self.inputLength,
                                                   dtype=tf.float32)

                columnRightOutput2 = tf.batch_gather(columnRightRnnOutputs[0] + columnRightRnnOutputs[1], self.columnRightSortedReverseIndexesInput)


            layer2Outputs = tf.concat(values=[lineSortedOutput2, columnLeftOutput2, columnRightOutput2], axis=2)

            batchSize = tf.shape(layer2Outputs)[0]
            length = tf.shape(layer2Outputs)[1]

            reshaped = tf.reshape(layer2Outputs, shape=(batchSize * length, lstmSize * 3))

            with tf.name_scope("denseLayers"), tf.variable_scope("denseLayers"):
                batchNormOutput = tf.layers.batch_normalization(reshaped)

                dense1 = tf.layers.dense(tf.layers.dropout(batchNormOutput, rate=denseDropout), denseSize, activation=tf.nn.relu)
                batchNorm1 = tf.layers.batch_normalization(dense1)
                dense2 = tf.layers.dense(tf.layers.dropout(batchNorm1, rate=denseDropout), denseSize, activation=tf.nn.relu)
                batchNorm2 = tf.layers.batch_normalization(dense2)
                self.classificationLogits = tf.layers.dense(batchNorm2, numClasses)
                self.modifierLogits = tf.layers.dense(batchNorm2, numModifiers)

                self.classificationProbabilities = tf.reshape(tf.nn.softmax(self.classificationLogits), shape=[batchSize, length, numClasses])
                self.classificationPredictions = tf.reshape(tf.argmax(self.classificationLogits, 1, name="classificationPredictions"), shape=[batchSize, length])

                self.modifierProbabilities = tf.reshape(tf.nn.sigmoid(self.modifierLogits), shape=[batchSize, length, numModifiers])
                self.modifierPredictions = tf.reshape(tf.round(tf.nn.sigmoid(self.modifierLogits)), shape=[batchSize, length, numModifiers])

        # Calculate mean cross-entropy loss
        with tf.name_scope("loss"):
            classificationLosses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.classificationLogits, labels=tf.reshape(self.inputClassification, shape=[batchSize * length, numClasses]))
            modifierLosses = tf.nn.sigmoid_cross_entropy_with_logits(logits=self.modifierLogits, labels=tf.reshape(self.inputModifiers, shape=[batchSize * length, numModifiers]))
            self.loss = tf.reduce_mean(classificationLosses) + tf.reduce_mean(modifierLosses)

        classificationPredictionsFlat = tf.cast(tf.reshape(self.classificationPredictions, shape=[batchSize * length]), tf.int32)
        classificationActualFlat = tf.cast(tf.argmax(tf.reshape(self.inputClassification, shape=[batchSize * length, numClasses]), axis=1), tf.int32)

        modifierPredictionsFlat = tf.cast(tf.reshape(self.modifierPredictions, shape=[batchSize * length, numModifiers]), tf.int32)
        modifierActualFlat = tf.cast(tf.reshape(self.inputModifiers, shape=[batchSize * length, numModifiers]), tf.int32)

        # Accuracy
        with tf.name_scope("accuracy"):
            correct_classifications = tf.equal(classificationPredictionsFlat, classificationActualFlat)
            correct_modifiers = tf.equal(modifierPredictionsFlat, modifierActualFlat)

            self.classificationAccuracy = tf.reduce_mean(tf.cast(correct_classifications, tf.float32), name="classificationAccuracy")
            self.modifierAccuracy = tf.reduce_mean(tf.cast(correct_modifiers, tf.float32), name="modifierAccuracy")

            # Replace class_id_preds with class_id_true for recall here
            classificationAccuracyMask = tf.cast(tf.equal(classificationPredictionsFlat, self.labels.index('null')), tf.int32) * \
                            tf.cast(tf.equal(classificationActualFlat, self.labels.index('null')), tf.int32)

            classificationAccuracyMask = 1 - classificationAccuracyMask


            modifierAccuracyMask = tf.cast(tf.equal(modifierPredictionsFlat, 0), tf.int32) * \
                            tf.cast(tf.equal(modifierActualFlat, 0), tf.int32)

            modifierAccuracyMask = 1 - modifierAccuracyMask

            class_acc_tensor = tf.cast(tf.equal(classificationActualFlat, classificationPredictionsFlat), tf.int32) * classificationAccuracyMask
            class_acc = tf.reduce_sum(class_acc_tensor) / tf.maximum(tf.reduce_sum(classificationAccuracyMask), 1)

            self.classificationNonNullAccuracy = class_acc

            modifier_class_acc_tensor = tf.cast(tf.equal(modifierActualFlat, modifierPredictionsFlat), tf.int32) * modifierAccuracyMask
            modifier_class_acc = tf.reduce_sum(modifier_class_acc_tensor) / tf.maximum(tf.reduce_sum(modifierAccuracyMask), 1)

            self.modifierNonNullAccuracy = modifier_class_acc

        with tf.device('/cpu:0'):
            with tf.name_scope("confusion_matrix"):
                self.confusionMatrix = tf.confusion_matrix(classificationActualFlat, classificationPredictionsFlat)

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

