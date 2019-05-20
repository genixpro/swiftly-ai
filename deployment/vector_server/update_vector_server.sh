#!/usr/bin/env bash

sed "s/__REVISION_ID__/$REVISION_ID/g" deployment/vector_server/vectorserver_deployment.yaml > vectorserver_deployment.yaml
kubectl apply -f vectorserver_deployment.yaml

sed "s/__REVISION_ID__/$REVISION_ID/g" deployment/vector_server/vectorserver_autoscaler.yaml > vectorserver_autoscaler.yaml
kubectl apply -f vectorserver_autoscaler.yaml

sed "s/__REVISION_ID__/$REVISION_ID/g" deployment/vector_server/vectorserver_service.yaml > vectorserver_service.yaml
kubectl apply -f vectorserver_service.yaml


