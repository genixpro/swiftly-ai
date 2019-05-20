#!/usr/bin/env bash

if [ $SWIFTLY_ENV=testing ] ;
    then
    sed "s/__REVISION_ID__/$REVISION_ID/g;s/__SWIFTLY_ENV__/$SWIFTLY_ENV/g" deployment/api_server/demo_reset_job.yaml > demo_reset_job_$SWIFTLY_ENV.yaml
    kubectl apply -f demo_reset_job_$SWIFTLY_ENV.yaml
fi

