#!/usr/bin/env bash

sed "s/REVISION_ID/$REVISION_ID/g;s/SWIFTLY_ENV/$SWIFTLY_ENV/g" deployment/api_server/migration_job.yaml > migration_job_$SWIFTLY_ENV.yaml
kubectl delete -f migration_job_$SWIFTLY_ENV.yaml && exit 0
kubectl create -f migration_job_$SWIFTLY_ENV.yaml

