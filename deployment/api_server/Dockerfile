# This builds an all-in-one easy to install dockerfile

FROM       python:3.6.8
MAINTAINER Electric Brain <info@electricbrain.io>

RUN mkdir /swiftly && \
    mkdir /swiftly/deployment && \
    mkdir /swiftly/client && \
    mkdir /swiftly/server && \
    mkdir /swiftly/server/models

# Install some basic system dependencies
COPY deployment/api_server/install_system_dependencies.sh /swiftly/deployment
RUN /build/install_system_dependencies.sh

# Enable the google cloud service account
COPY appraisalai-be8f24d217e0.json /swiftly
WORKDIR /swiftly
RUN gcloud auth activate-service-account --key-file /swiftly/appraisalai-be8f24d217e0.json

# Install the python dependencies. We do this ahead of running "ADD . /swiftly" so the builds run faster when your
# making code changes regularly.
COPY server/requirements.txt /swiftly/server/requirements.txt
RUN pip3 install -r /swiftly/server/requirements.txt && \

# We add package.json first so that the  docker image build
# can use the cache as long as contents of package.json
# hasn't changed.
COPY client/package.json /swiftly/client
WORKDIR /swiftly/client
RUN npm install > "/dev/null" 2>&1

# Download latest machine learning models from gs cloud
WORKDIR /swiftly/server/models
RUN gsutil cp gs://swiftly-deployment/models.zip . && \
    unzip models.zip && \
    rm -rf models.zip

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly
ARG SWIFTLY_ENV

# Install dependencies for client, which includes downloads
WORKDIR /swiftly/server
RUN python3 setup.py install > "/dev/null" 2>&1

# Setup and configure systemd
ENTRYPOINT ["bash", "-c", "gunicorn -t 600 -w 4 -b 0.0.0.0:80 --paste $SWIFTLY_ENV.ini"]

EXPOSE 80
