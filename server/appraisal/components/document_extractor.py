import subprocess
import copy
import tensorflow as tf
from .document_generator import DocumentGenerator
import numpy
import random

class DocumentExtractor:
    def __init__(self):
        self.generator = DocumentGenerator()

        self.labels = [
            'null',
            'LANDLORD_NAME'
        ]

        self.maxLength = 250
        self.wordVectorSize = 300

    def prepareDocument(self, file):
        # load
        vectors = subprocess.Popen(["fasttext", "print-word-vectors", "crawl-300d-2M-subword.bin"],
                                   stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)

        wordVectors = []
        for word in file['words']:
            try:
                vectors.stdin.write(bytes(word['word'] + "\n", 'utf8'))
                vectors.stdin.flush()
            except BrokenPipeError:
                print(vectors.stderr.read())
            line = vectors.stdout.readline()

            vector = [float(v) for v in line.split()[1:]]
            wordVectors.append(numpy.array(vector))

        lineSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['page'], word['lineNumber'], word['left']))]
        columnLeftSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['columnLeft'], word['lineNumber'], word['left']))]
        columnRightSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['columnRight'], word['lineNumber'], word['left']))]

        vectors.terminate()

        lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(word['index']) for word in file['words']]
        columnLeftReverseWordIndexes = [columnLeftSortedWordIndexes.index(word['index']) for word in file['words']]
        columnRightReverseWordIndexes = [columnRightSortedWordIndexes.index(word['index']) for word in file['words']]
        
        outputs = []
        
        for word in file['words']:
            oneHotCode = [0] * len(self.labels)

            if 'classification' in word:
                oneHotCode[self.labels.index(word['classification'])] = 1
            else:
                oneHotCode[self.labels.index('null')] = 1
            outputs.append(oneHotCode)
        return (
            wordVectors,
            lineSortedWordIndexes,
            lineSortedReverseWordIndexes,
            columnLeftSortedWordIndexes,
            columnLeftReverseWordIndexes,
            columnRightSortedWordIndexes,
            columnRightReverseWordIndexes,
            outputs)


    def createBatch(self):
        batchWordVectors = []
        batchLineSortedWordIndexes = []
        batchLineSortedReverseWordIndexes = []
        batchColumnLeftSortedWordIndexes = []
        batchColumnLeftReverseWordIndexes = []
        batchColumnRightSortedWordIndexes = []
        batchColumnRightReverseWordIndexes = []
        batchOutputs = []

        for n in range(4):
            file = self.generator.generateDocument("lease1.docx", "lease")

            result = self.prepareDocument(file)

            wordVectors = result[0]
            lineSortedWordIndexes = result[1]
            lineSortedReverseWordIndexes = result[2]
            columnLeftSortedWordIndexes = result[3]
            columnLeftReverseWordIndexes = result[4]
            columnRightSortedWordIndexes = result[5]
            columnRightReverseWordIndexes = result[6]
            outputs = result[7]

            while len(wordVectors) < self.maxLength:
                index = len(wordVectors)
                lineSortedWordIndexes.append(index)
                lineSortedReverseWordIndexes.append(index)
                columnLeftSortedWordIndexes.append(index)
                columnLeftReverseWordIndexes.append(index)
                columnRightSortedWordIndexes.append(index)
                columnRightReverseWordIndexes.append(index)
                wordVectors.append([0] * self.wordVectorSize)
                outputs.append(self.labels.index("null"))

            if len(wordVectors) > self.maxLength:
                start = random.randint(0, len(wordVectors) - self.maxLength - 1)

                wordVectors = wordVectors[start:start + self.maxLength]
                lineSortedWordIndexes = lineSortedWordIndexes[start:start + self.maxLength]
                lineSortedReverseWordIndexes = lineSortedReverseWordIndexes[start:start + self.maxLength]
                columnLeftSortedWordIndexes = columnLeftSortedWordIndexes[start:start + self.maxLength]
                columnLeftReverseWordIndexes = columnLeftReverseWordIndexes[start:start + self.maxLength]
                columnRightSortedWordIndexes = columnRightSortedWordIndexes[start:start + self.maxLength]
                columnRightReverseWordIndexes = columnRightReverseWordIndexes[start:start + self.maxLength]
                outputs = outputs[start:start + self.maxLength]

            batchWordVectors.append(wordVectors)
            batchLineSortedWordIndexes.append(lineSortedWordIndexes)
            batchLineSortedReverseWordIndexes.append(lineSortedReverseWordIndexes)
            batchColumnLeftSortedWordIndexes.append(columnLeftSortedWordIndexes)
            batchColumnLeftReverseWordIndexes.append(columnLeftReverseWordIndexes)
            batchColumnRightSortedWordIndexes.append(columnRightSortedWordIndexes)
            batchColumnRightReverseWordIndexes.append(columnRightReverseWordIndexes)
            batchOutputs.append(outputs)

        return (
            numpy.array(batchWordVectors),
            numpy.array(batchLineSortedWordIndexes),
            numpy.array(batchLineSortedReverseWordIndexes),
            numpy.array(batchColumnLeftSortedWordIndexes),
            numpy.array(batchColumnLeftReverseWordIndexes),
            numpy.array(batchColumnRightSortedWordIndexes),
            numpy.array(batchColumnRightReverseWordIndexes),
            numpy.array(batchOutputs))



    def trainAlgorithm(self, db):
        self.createNetwork()

        learningRate = 0.0001

        # Define Training procedure
        global_step = tf.Variable(0, name="global_step", trainable=False)
        print(tf.GraphKeys.TRAINABLE_VARIABLES)
        train_op = tf.train.AdamOptimizer(learningRate).minimize(self.loss, global_step=global_step)

        session_conf = tf.ConfigProto(
            # allow_soft_placement=params['allow_soft_placement'],
            # log_device_placement=params['log_device_placement']
        )

        sess = tf.Session(config=session_conf)

        with sess.as_default():
            # Initialize all variables
            sess.run(tf.global_variables_initializer())

            # Training loop. For each batch...
            for batchIndex in range(100):
                batch = self.createBatch()

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

                _, step, loss, accuracy = sess.run([train_op, global_step, self.loss, self.accuracy], feed_dict)

                print("Loss:", loss)


    def createNetwork(self):
        lstmSize = 100
        lstmDropout = 0.5
        denseSize = 100
        denseDropout = 0.5
        numClasses = 2

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
                lineSortedRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(self.inputWordVectors, self.lineSortedWordIndexesInput),
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

            layer1Outputs = tf.concat(values=[lineSortedOutput1, columnLeftOutput1, columnRightOutput1], axis=1)

            with tf.name_scope("lineSorted2"), tf.variable_scope("lineSorted2"):
                lineSortedRnnOutputs, _ = tf.nn.bidirectional_dynamic_rnn(cell_fw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   cell_bw=tf.nn.rnn_cell.DropoutWrapper(tf.nn.rnn_cell.LSTMCell(lstmSize), output_keep_prob=lstmDropout),
                                                   inputs=tf.batch_gather(layer1Outputs, self.lineSortedWordIndexesInput),
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


            layer2Outputs = tf.concat(values=[lineSortedOutput2, columnLeftOutput2, columnRightOutput2], axis=1)

            batchSize = tf.shape(layer2Outputs)[0]
            reshaped = tf.reshape(layer2Outputs, shape=(batchSize * self.maxLength, lstmSize * 3))

            with tf.name_scope("denseLayers"):
                batchNormOutput = tf.layers.batch_normalization(reshaped)

                dense1 = tf.layers.dense(tf.layers.dropout(batchNormOutput, rate=denseDropout), denseSize)
                batchNorm1 = tf.layers.batch_normalization(dense1)
                dense2 = tf.layers.dense(tf.layers.dropout(batchNorm1, rate=denseDropout), denseSize)
                batchNorm2 = tf.layers.batch_normalization(dense2)
                self.logits = tf.layers.dense(batchNorm2, numClasses)

                self.probabilities = tf.reshape(tf.nn.softmax(self.logits), shape=[batchSize, self.maxLength, numClasses])
                self.predictions = tf.reshape(tf.argmax(self.logits, 1, name="predictions"), shape=[batchSize, self.maxLength])

        # Calculate mean cross-entropy loss
        with tf.name_scope("loss"):
            losses = tf.nn.softmax_cross_entropy_with_logits_v2(logits=self.logits, labels=tf.reshape(self.inputY, shape=[batchSize * self.maxLength, numClasses]))
            self.loss = tf.reduce_mean(losses)

        # Accuracy
        with tf.name_scope("accuracy"):
            correct_predictions = tf.equal(tf.reshape(self.predictions, shape=[batchSize * self.maxLength]), tf.argmax(tf.reshape(self.inputY, shape=[batchSize * self.maxLength, numClasses]), axis=1))
            self.accuracy = tf.reduce_mean(tf.cast(correct_predictions, tf.float32), name="accuracy")

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

