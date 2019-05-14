# This builds an all-in-one easy to install dockerfile

FROM       python:3.6.8
MAINTAINER Electric Brain <info@electricbrain.io>

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install some basic system dependencies
RUN apt-get update
RUN apt-get install \
    nginx \
    nodejs -y

# Set the working directory to /app
WORKDIR /swiftly

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly

ARG SWIFTLY_ENV

# Copy the NGINX configuration
ADD deployment/nginx_config /etc/nginx/sites-enabled/default
ADD deployment/ssl/swiftly.key /etc/nginx/ssl/nginx.key
ADD deployment/ssl/certbundle.pem /etc/nginx/ssl/nginx.pem

# Set the working directory to /swiftly/client, and build the frontend package
WORKDIR /swiftly/client
RUN npm install
ENV VALUATE_ENV=${SWIFTLY_ENV}
RUN npm run-script build

# Delete nodejs to trim down the image size
RUN apt-get uninstall nodejs -y

# Setup and configure systemd
ENTRYPOINT ["/usr/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
EXPOSE 443
