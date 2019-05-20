#!/usr/bin/env bash

sed "s/__REVISION_ID__/$REVISION_ID/g" deployment/training_server/training_job.yaml > training_job.yaml
kubectl apply -f training_job.yaml
