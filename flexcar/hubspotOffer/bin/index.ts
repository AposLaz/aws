#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StagingHubspotOffer } from "../lib";

const app = new cdk.App();
new StagingHubspotOffer(app);
