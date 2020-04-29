# This builds an all-in-one easy to install dockerfile

FROM       python:3.6.8
MAINTAINER Electric Brain <info@electricbrain.io>

RUN echo "deb http://packages.cloud.google.com/apt cloud-sdk-stretch main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

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
    google-cloud-sdk \
    gfortran -y

# Install some dependencies which can take a long time to install. We do this ahead of running "ADD . /swiftly" so the builds run faster when your
# making code changes regularly
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN pip3 install numpy
RUN pip3 install scikit-learn
RUN pip3 install matplotlib
RUN pip3 install gunicorn

RUN  \
  git clone https://github.com/facebookresearch/fastText.git /tmp/fastText && \
  rm -rf /tmp/fastText/.git* && \
  cd /tmp/fastText/ && \
  make -j 8 && \
  mv /tmp/fastText/fasttext /usr/bin && \
  rm -rf /tmp/fastText


# Set the working directory to /app
WORKDIR /swiftly

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly

WORKDIR /swiftly
RUN gcloud auth activate-service-account --key-file swiftly-2020-da055f21a18f.json

# Download the vector model from google cloud
WORKDIR /swiftly/server
RUN gsutil cp gs://swiftly-deployment/crawl-300d-2M-subword.bin .

WORKDIR /swiftly/server
RUN python3 setup.py install

# Setup and configure systemd
ENTRYPOINT ["gunicorn", "-t", "600", "-w", "1", "-b", "0.0.0.0:5000", "--paste", "vectorserver.ini"]
EXPOSE 5000
HEALTHCHECK CMD curl --fail http://localhost:5000/vectors --data '["test","words"]' -h "Content-Type: application/json" || exit 1

