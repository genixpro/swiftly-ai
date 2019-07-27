# This builds an all-in-one easy to install dockerfile

FROM       python:3.6.8
MAINTAINER Electric Brain <info@electricbrain.io>

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install some basic system dependencies
RUN apt-get update && apt-get install \
    nginx \
    nodejs -y > "/dev/null" 2>&1 && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /swiftly

# We add package.json first so that the  docker image build
# can use the cache as long as contents of package.json
# hasn't changed.
RUN mkdir /swiftly/client
COPY client/package.json /swiftly/client
WORKDIR /swiftly/client
RUN npm install

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly
ARG SWIFTLY_ENV

# Copy the NGINX configuration
ADD deployment/nginx_${SWIFTLY_ENV} /etc/nginx/sites-enabled/default
ADD deployment/ssl/swiftly.key /etc/nginx/ssl/nginx.key
ADD deployment/ssl/certbundle.pem /etc/nginx/ssl/nginx.pem

# Set the working directory to /swiftly/client, and build the frontend package
WORKDIR /swiftly/client
ENV VALUATE_ENV=${SWIFTLY_ENV}
# Build the frontend static files and delete all the swiftly code, nodejs and python to trim down the image size
RUN npm run-script build && \
        mkdir /build && \
        mv build/* /build && \
        rm -rf /swiftly && \
        apt-get purge nodejs python3 -y

# Setup and configure systemd
ENTRYPOINT ["/usr/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
EXPOSE 443
