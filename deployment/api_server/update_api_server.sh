#!/usr/bin/env bash

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/api_server_deployment.yaml > api_server_deployment_$SWIFTLY_ENV.yaml
kubectl apply -f api_server_deployment_$SWIFTLY_ENV.yaml



