#!/usr/bin/env bash

sed "s/REVISION_ID/$REVISION_ID/g;s/SWIFTLY_ENV/$SWIFTLY_ENV/g" deployment/frontend_server/frontend_server_deployment.yaml > frontend_server_deployment_$SWIFTLY_ENV.yaml
kubectl apply -f frontend_server_deployment_$SWIFTLY_ENV.yaml



