#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsCdkStack } from "../lib/aws-cdk-stack";
import { PhotoStack } from "../lib/aws-photo-stack";
import { PhotosHandlerStack } from "../lib/aws-photo-handler-stack";
import { BucketTagger } from "./tagger";

const app = new cdk.App();
const declareBucket = new PhotoStack(app, "PhotoStack");
new PhotosHandlerStack(app, "PhotoHandlerStack", {
  targetBucket: declareBucket.bucketArn,
});

const envTags = new BucketTagger("env", "dev");
cdk.Aspects.of(app).add(envTags);

const appTags = new BucketTagger("app", "photos");
cdk.Aspects.of(app).add(appTags);
