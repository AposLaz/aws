//init database

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Configs from "../configs";
import { captureAWSv3Client } from "aws-xray-sdk-core";

export const client = captureAWSv3Client(
  new DynamoDBClient({ region: Configs.awsRegion })
);
