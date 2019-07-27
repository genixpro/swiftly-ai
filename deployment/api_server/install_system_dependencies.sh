#!/bin/env bash

# Install node
echo "deb http://packages.cloud.google.com/apt cloud-sdk-stretch main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install system packages
apt-get update

apt-get install \
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
    gfortran -y > "/dev/null" 2>&1

rm -rf /var/lib/apt/lists/*

# Install fasttext
git clone https://github.com/facebookresearch/fastText.git /tmp/fastText
rm -rf /tmp/fastText/.git*
cd /tmp/fastText/
make -j 8
mv /tmp/fastText/fasttext /usr/bin
rm -rf /tmp/fastText

# Upgrade version of pip and setuptools
cd /swiftly/server
pip3 install --upgrade pip
pip3 install --upgrade setuptools

