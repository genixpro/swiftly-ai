# This builds an all-in-one easy to install dockerfile

FROM       python:3.6.8
MAINTAINER Electric Brain <info@electricbrain.io>

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install some basic system dependencies
RUN apt-get update && apt-get install \
    nginx \
    nodejs -qq -y && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /swiftly

# Copy the current directory contents into the container at /swiftly
ADD . /swiftly

ARG SWIFTLY_ENV

# Copy the NGINX configuration
ADD deployment/nginx_${SWIFTLY_ENV} /etc/nginx/sites-enabled/default
ADD deployment/ssl/swiftly.key /etc/nginx/ssl/nginx.key
ADD deployment/ssl/certbundle.pem /etc/nginx/ssl/nginx.pem

# Set the working directory to /swiftly/client, and build the frontend package
WORKDIR /swiftly/client
RUN npm install > "/dev/null" 2>&1
ENV VALUATE_ENV=${SWIFTLY_ENV}
RUN npm run-script build
RUN mkdir /build
RUN mv build/* /build

# Delete all the swiftly code to trim down the image size
RUN rm -rf /swiftly

# Delete nodejs to trim down the image size
RUN apt-get purge nodejs python3 -y

# Setup and configure systemd
ENTRYPOINT ["/usr/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
EXPOSE 443
