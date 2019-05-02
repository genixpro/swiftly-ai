# This builds an all-in-one easy to install dockerfile

FROM       node:8.16.0-alpine
MAINTAINER Electric Brain <info@electricbrain.io>

# Install some basic system dependencies
RUN apt-get update
RUN apt-get install \
    gcc \
    g++ \
    git \
    wget \
    sudo \
    vim \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-tk \
    python3-dev \
    libpng-dev \
    freetype* \
    libblas-dev \
    liblapack-dev \
    libatlas-base-dev \
    supervisor \
    nginx \
    unzip \
    gfortran -y

RUN ln -s /usr/bin/nodejs /usr/bin/node

# Install some dependencies which can take a long time to install. We do this ahead of running "ADD . /fathion" so the builds run faster when your
# making code changes regularly
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN pip3 install numpy
RUN pip3 install scikit-learn
RUN pip3 install matplotlib
RUN pip3 install spacy
RUN pip3 install gunicorn

# Forward request logs to Docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

RUN  \
  git clone https://github.com/facebookresearch/fastText.git /tmp/fastText && \
  rm -rf /tmp/fastText/.git* && \
  cd /tmp/fastText/ && \
  make -j 8 && \
  mv /tmp/fastText/fasttext /usr/bin && \
  rm -rf /tmp/fastText

RUN echo "deb http://packages.cloud.google.com/apt cloud-sdk-alpine main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN apt-get update && apt-get install google-cloud-sdk
RUN gcloud auth activate-service-account --key-file appraisalai-be8f24d217e0.json

# Set the working directory to /app
WORKDIR /swiftly

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly

# Copy the NGINX configuration
ADD nginx_config /etc/nginx/sites-enabled/default

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Download models from gs cloud
WORKDIR /swiftly/server
RUN mkdir models
WORKDIR /swiftly/server/models
RUN gsutil cp gs://swiftly-deployment/models.zip . && \
    unzip models.zip && \
    rm -rf models.zip

WORKDIR /swiftly/server
RUN gsutil cp gs://swiftly-deployment/crawl-300d-2M-subword.bin .

# Set the working directory to /swiftly
WORKDIR /swiftly/client
RUN npm install
ENV VALUATE_ENV=production
RUN npm run-script build

# Set the working directory to /swiftly
WORKDIR /swiftly/server/appraisal/word_documents
RUN npm install
ENV VALUATE_ENV=production

WORKDIR /swiftly/server
RUN python3 setup.py install

# Setup and configure systemd
ENTRYPOINT ["/usr/bin/supervisord"]
EXPOSE 80

