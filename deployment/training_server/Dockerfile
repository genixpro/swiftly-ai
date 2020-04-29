# This builds an all-in-one easy to install dockerfile

FROM ubuntu:18.04
MAINTAINER Electric Brain <info@electricbrain.io>


RUN apt-get update && apt-get install -y --no-install-recommends gnupg2 curl ca-certificates && \
    curl -fsSL https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub | apt-key add - && \
    echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64 /" > /etc/apt/sources.list.d/cuda.list && \
    echo "deb https://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1804/x86_64 /" > /etc/apt/sources.list.d/nvidia-ml.list

ENV CUDA_VERSION 10.0.130
ENV NCCL_VERSION 2.4.2
ENV CUDNN_VERSION 7.5.1.10
ENV NCCL_VERSION 2.4.2


ENV CUDA_PKG_VERSION 10-0=$CUDA_VERSION-1

# For libraries in the cuda-compat-* package: https://docs.nvidia.com/cuda/eula/index.html#attachment-a
RUN apt-get update && apt-get install -y --no-install-recommends \
        cuda-cudart-$CUDA_PKG_VERSION \
        cuda-compat-10-0 > "/dev/null" 2>&1 && \
    ln -s cuda-10.0 /usr/local/cuda

RUN apt-get update && apt-get install -y --no-install-recommends \
            libcudnn7=$CUDNN_VERSION-1+cuda10.0 \
            libcudnn7-dev=$CUDNN_VERSION-1+cuda10.0 > "/dev/null" 2>&1 && \
    apt-mark hold libcudnn7

RUN apt-get update && apt-get install -y --no-install-recommends \
        cuda-libraries-$CUDA_PKG_VERSION \
        cuda-nvtx-$CUDA_PKG_VERSION \
        libnccl2=$NCCL_VERSION-1+cuda10.0 > "/dev/null" 2>&1 && \
        apt-mark hold libnccl2

RUN apt-get update && apt-get install -y --no-install-recommends \
        cuda-libraries-dev-$CUDA_PKG_VERSION \
        cuda-nvml-dev-$CUDA_PKG_VERSION \
        cuda-minimal-build-$CUDA_PKG_VERSION \
        cuda-command-line-tools-$CUDA_PKG_VERSION \
        libnccl-dev=$NCCL_VERSION-1+cuda10.0  > "/dev/null" 2>&1 



ENV LIBRARY_PATH /usr/local/cuda/lib64/stubs

# Required for nvidia-docker v1
RUN echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf && \
    echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf

ENV PATH /usr/local/nvidia/bin:/usr/local/cuda/bin:${PATH}
ENV LD_LIBRARY_PATH /usr/local/nvidia/lib:/usr/local/nvidia/lib64

# nvidia-container-runtime
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
ENV NVIDIA_REQUIRE_CUDA "cuda>=10.0 brand=tesla,driver>=384,driver<385 brand=tesla,driver>=410,driver<411"


ENV DEBIAN_FRONTEND noninteractive

RUN apt-get install -y tzdata
RUN ln -fs /usr/share/zoneinfo/America/Toronto /etc/localtime
RUN dpkg-reconfigure --frontend noninteractive tzdata


RUN echo "deb http://packages.cloud.google.com/apt cloud-sdk-stretch main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install some basic system dependencies
RUN apt-get update && apt-get install \
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
    unzip \
    google-cloud-sdk \
    nodejs \
    libreoffice \
    poppler-utils \
    gfortran -y > "/dev/null" 2>&1 && \
    rm -rf /var/lib/apt/lists/*

# Install some dependencies which can take a long time to install. We do this ahead of running "ADD . /swiftly" so the builds run faster when your
# making code changes regularly
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN pip3 install numpy
RUN pip3 install scikit-learn
RUN pip3 install matplotlib
RUN pip3 install gunicorn

# Set the working directory to /app
WORKDIR /swiftly

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly

WORKDIR /swiftly
RUN gcloud auth activate-service-account --key-file swiftly-2020-da055f21a18f.json

# Delete everything in the client directory
RUN rm -rf /swiftly/client

# Install dependencies for server
WORKDIR /swiftly/server
RUN sed -i "s/tensorflow===[0-9]\+\.[0-9]\+\.[0-9]\+/tensorflow-gpu===1.13.1/g" setup.py
RUN python3 setup.py install > "/dev/null" 2>&1

# Setup and configure systemd
ENTRYPOINT ["/usr/local/bin/appraisal_train_extractor", "production_readonly.ini"]

EXPOSE 80
