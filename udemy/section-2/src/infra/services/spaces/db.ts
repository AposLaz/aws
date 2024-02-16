//init database

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Configs from "../configs";

export const client = new DynamoDBClient({ region: Configs.awsRegion });
