#!/usr/bin/env bash

sed "s/REVISION_ID/$REVISION_ID/g;s/SWIFTLY_ENV/$SWIFTLY_ENV/g" deployment/api_server/api_server_deployment.yaml > api_server_deployment_$SWIFTLY_ENV.yaml
kubectl apply -f api_server_deployment_$SWIFTLY_ENV.yaml



