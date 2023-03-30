# Deployment - HowTo

This how-to document only explains how to deploy *this* part of the system.

For more information on the overall system architecture, deployment targets & configuration, the database, routing and more, see the
[API Application Repository](https://github.com/kujakuja/3.0_api).

## Prerequisites

You need to have set up the [gcloud](https://cloud.google.com/sdk/gcloud/) command line utility.

gcloud is a part of the [Google Cloud SDK](https://cloud.google.com/sdk/docs/). You can find instructions on how to install and initialize the SDK
[here](https://cloud.google.com/sdk/docs/). There are also more detailed instructions available under the "How-to-Guides" section of the official documentation.

* When you are asked to set a default project you should set this to `kujakuja-dev`. This will prevent accidental deployments or configuration changes in the production
environment. (You can also explicitly unset the project in the core configuration so that you have to specify it every time using the `--project=<project_id>` argument. To do so,
use the following command: `gcloud config unset project`)
* When you are asked to set a default Google Compute Engine region and zone, you should set these to `europe-west1` and `europe-west1-b` respectively, as this is the region that we
 are deploying to (the zone is not relevant for App Engine deployments).

## Steps to Deploy

1. Open a terminal and ensure that you are in the root of the application (where the `app.yaml` file is)
2. Run the following command: `gcloud app deploy [--project=<project_id>]` - for example: `gcloud app deploy --project=kujakuja-dev`

A version string will be generated automatically based on the current date & time, or you can specify it using the `--version=<version>` argument.

By default the new version will be promoted to receive all traffic. You can avoid this by adding the `--no-promote` argument.

For more information on the `gcloud app deploy` command, see `gcloud app deploy --help`.
