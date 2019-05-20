#!/usr/bin/env bash

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/frontend_server/frontend_server_deployment.yaml > frontend_server_deployment_$SWIFTLY_ENV.yaml
kubectl apply -f frontend_server_deployment_$SWIFTLY_ENV.yaml



