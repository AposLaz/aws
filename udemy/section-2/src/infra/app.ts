import { Construct } from "constructs";
import { LambdaStack } from "./stacks/LambdaStack";
import { ApiStack } from "./stacks/ApiStack";
import { DynamoDbStack } from "./stacks/DynamoDbStack";

export class ApplicationStacks extends Construct {
  constructor(scope: Construct) {
    super(scope, "StagingEnv");

    const dynamoDB = new DynamoDbStack(this, "DynamoDbStack");

    const lambda = new LambdaStack(this, "LambdaStack", {
      dbSpacesTable: dynamoDB.spacesDynamoDbTable,
    });

    new ApiStack(this, "ApiStack", {
      lambdaIntegrationAPI: lambda.lambdaFunctionAPI,
    });
  }
}
