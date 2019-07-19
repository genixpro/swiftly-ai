#!/usr/bin/env bash

kubectl apply -f deployment/priority/$SWIFTLY_ENV.yaml

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/api_server_deployment.yaml > api_server_deployment_$SWIFTLY_ENV.yaml
kubectl apply -f api_server_deployment_$SWIFTLY_ENV.yaml

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/api_autoscaler.yaml > api_autoscaler_$SWIFTLY_ENV.yaml
kubectl apply -f api_autoscaler_$SWIFTLY_ENV.yaml

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/api_service.yaml > api_service_$SWIFTLY_ENV.yaml
kubectl apply -f api_service_$SWIFTLY_ENV.yaml



