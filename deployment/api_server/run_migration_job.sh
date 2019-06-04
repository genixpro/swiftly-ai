#!/usr/bin/env bash

sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/migration_job.yaml > migration_job_$SWIFTLY_ENV.yaml
kubectl delete -f migration_job_$SWIFTLY_ENV.yaml && exit 0
kubectl create -f migration_job_$SWIFTLY_ENV.yaml

