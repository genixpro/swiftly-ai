#!/bin/bash

dockerId=electricbrainio
imageName=swiftly
user=brad@electricbrain.io
pswd=qHB7L3LdaDIx2G16Byyn
version=0.1
tempDir=~/.eb-appraisal-temp

rm -rf $tempDir
mkdir $tempDir


mv server/venv $tempDir
mv server/crawl-300d-2M-subword.bin $tempDir

sudo docker build -t $dockerId/$imageName:$version .
sudo docker login -u $user -p $pswd hub.docker.com
sudo docker push $dockerId/$imageName:$version

mv $tempDir/venv server/
mv $tempDir/crawl-300d-2M-subword.bin server/
rm -rf $tempDir

