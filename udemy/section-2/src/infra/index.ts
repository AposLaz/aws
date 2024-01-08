#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApplicationStacks } from "./app";

const app = new cdk.App();

new ApplicationStacks(app);
