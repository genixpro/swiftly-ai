import subprocess
import copy
import tensorflow as tf
from .document_generator import DocumentGenerator
import numpy
import pickle
import random
import io
import concurrent.futures
import csv
import multiprocessing
from .document_extractor_dataset import DocumentExtractorDataset


class DocumentExtractor:
    def __init__(self):
        self.dataset = DocumentExtractorDataset()

        self.labels = self.dataset.labels

        self.maxLength = 250
        self.wordVectorSize = 300
        self.batchSize = 4

    def trainAlgorithm(self, db):
        self.createNetwork()

        learningRate = 0.001

        # Define Training procedure
        global_step = tf.Variable(0, name="global_step", trainable=False)
        print(tf.GraphKeys.TRAINABLE_VARIABLES)
        train_op = tf.train.AdamOptimizer(learningRate).minimize(self.loss, global_step=global_step)

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        sess = tf.Session(config=session_conf)

        with concurrent.futures.ProcessPoolExecutor(max_workers=3) as executor:
            batchFutures = []
            for n in range(10):
                batchFutures.append(executor.submit(self.dataset.createBatch, self.batchSize))

            with sess.as_default():
                self.saver = tf.train.Saver()

                # Initialize all variables
                sess.run(tf.global_variables_initializer())

                for epoch in range(10):
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
                        outputs = batch[7]

                        # Train
                        feed_dict = {
                            self.inputWordVectors: wordVectors,
                            self.lineSortedWordIndexesInput: lineSortedWordIndexes,
                            self.lineSortedReverseIndexesInput: lineSortedReverseWordIndexes,
                            self.columnLeftSortedWordIndexesInput: columnLeftSortedWordIndexes,
                            self.columnLeftSortedReverseIndexesInput: columnLeftReverseWordIndexes,
                            self.columnRightSortedWordIndexesInput: columnRightSortedWordIndexes,
                            self.columnRightSortedReverseIndexesInput: columnRightReverseWordIndexes,
                            self.inputY: outputs
                        }

                        _, step, loss, accuracy, nonNullAccuracy, confusionMatrix = sess.run([train_op, global_step, self.loss, self.accuracy, self.nonNullAccuracy, self.confusionMatrix], feed_dict)

                        print(f"Epoch: {epoch} Batch: {batchIndex} Loss: {loss} Accuracy: {accuracy} Non Null Accuracy: {nonNullAccuracy}")

                        if batchIndex % 10 == 0:
                            with open("matrix.csv", "wt") as file:
                                file.write(self.formatConfusionMatrix(confusionMatrix))
                    self.saver.save(sess, f"models/model-{epoch}.ckpt")
                self.saver.save(sess, "models/model.ckpt")

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
        self.createNetwork()

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        sess = tf.Session(config=session_conf)

        with sess.as_default():
            # Initialize all variables
            self.saver.restore(sess, "model.ckpt")


    def predictDocument(self, document):
        self.loadAlgorithm()

        data = self.dataset.prepareDocument(document)

        wordVectors = data[0]
        lineSortedWordIndexes = data[1]
        lineSortedReverseWordIndexes = data[2]
        columnLeftSortedWordIndexes = data[3]
        columnLeftReverseWordIndexes = data[4]
        columnRightSortedWordIndexes = data[5]
        columnRightReverseWordIndexes = data[6]

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

        predictions = sess.run([self.predictions], feed_dict)

        for wordIndex in range(len(wordVectors)):
            prediction = predictions[wordIndex]

            word = document['words']

            word['classification'] = self.labels[prediction]
        

    def createNetwork(self):
        lstmSize = 50
        lstmDropout = 0.5
        denseSize = 100
        denseDropout = 0.5
        numClasses = len(self.labels)

        # Placeholders for input, output and dropout
        self.inputWordVectors = tf.placeholder(tf.float32, shape=[None, self.maxLength, self.wordVectorSize], name='input_word_vectors')
        self.inputLength = tf.placeholder(tf.int32, shape=[None], name='input_length')
        self.inputY = tf.placeholder(tf.float32, shape=[None, self.maxLength, numClasses], name='input_y')

        self.lineSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='line_sorted_indexes')
        self.lineSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='line_sorted_reverse_indexes')

        self.columnLeftSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='column_left_sorted_indexes')
        self.columnLeftSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='column_left_sorted_reverse_indexes')

        self.columnRightSortedWordIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='column_right_sorted_indexes')
        self.columnRightSortedReverseIndexesInput = tf.placeholder(tf.int32, shape=[None, self.maxLength], name='column_right_sorted_reverse_indexes')

        # Recurrent Neural Network
        with tf.name_scope("rnn"):
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
            reshaped = tf.reshape(layer2Outputs, shape=(batchSize * self.maxLength, lstmSize * 3))

            with tf.name_scope("denseLayers"):
                batchNormOutput = tf.layers.batch_normalization(reshaped)

                dense1 = tf.layers.dense(tf.layers.dropout(batchNormOutput, rate=denseDropout), denseSize, activation=tf.nn.relu)
                batchNorm1 = tf.layers.batch_normalization(dense1)
                dense2 = tf.layers.dense(tf.layers.dropout(batchNorm1, rate=denseDropout), denseSize, activation=tf.nn.relu)
                batchNorm2 = tf.layers.batch_normalization(dense2)
                self.logits = tf.layers.dense(batchNorm2, numClasses)

                self.probabilities = tf.reshape(tf.nn.softmax(self.logits), shape=[batchSize, self.maxLength, numClasses])
                self.predictions = tf.reshape(tf.argmax(self.logits, 1, name="predictions"), shape=[batchSize, self.maxLength])

        # Calculate mean cross-entropy loss
        with tf.name_scope("loss"):
            losses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.logits, labels=tf.reshape(self.inputY, shape=[batchSize * self.maxLength, numClasses]))
            self.loss = tf.reduce_mean(losses)

        predictionsFlat = tf.cast(tf.reshape(self.predictions, shape=[batchSize * self.maxLength]), tf.int32)
        actualFlat = tf.cast(tf.argmax(tf.reshape(self.inputY, shape=[batchSize * self.maxLength, numClasses]), axis=1), tf.int32)

        # Accuracy
        with tf.name_scope("accuracy"):
            correct_predictions = tf.equal(predictionsFlat, actualFlat)
            self.accuracy = tf.reduce_mean(tf.cast(correct_predictions, tf.float32), name="accuracy")

            # Replace class_id_preds with class_id_true for recall here
            accuracy_mask = tf.cast(tf.equal(predictionsFlat, self.labels.index('null')), tf.int32) * \
                            tf.cast(tf.equal(actualFlat, self.labels.index('null')), tf.int32)

            accuracy_mask = 1 - accuracy_mask

            class_acc_tensor = tf.cast(tf.equal(actualFlat, predictionsFlat), tf.int32) * accuracy_mask
            class_acc = tf.reduce_sum(class_acc_tensor) / tf.maximum(tf.reduce_sum(accuracy_mask), 1)

            self.nonNullAccuracy = class_acc

        with tf.name_scope("confusion_matrix"):
            self.confusionMatrix = tf.confusion_matrix(actualFlat, predictionsFlat)

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

