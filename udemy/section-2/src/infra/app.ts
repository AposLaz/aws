import { Construct } from "constructs";
import { LambdaStack } from "./stacks/LambdaStack";
import { ApiStack } from "./stacks/ApiStack";
import { DynamoDbStack } from "./stacks/DynamoDbStack";
import { MonitorStack } from "./stacks/MonitorStack";
import { AuthStack } from "./stacks/AuthStack";

export class ApplicationStacks extends Construct {
  constructor(scope: Construct) {
    super(scope, "StagingEnv");

    const dynamoDB = new DynamoDbStack(this, "DynamoDbStack");

    const lambda = new LambdaStack(this, "LambdaStack", {
      dbSpacesTable: dynamoDB.spacesDynamoDbTable,
    });

    const authStack = new AuthStack(this, "AuthStack");

    new ApiStack(this, "ApiStack", {
      spaceslambdaIntegrationAPI: lambda.spaceslambdaFunctionAPI,
      userPool: authStack.userPool,
    });

    new MonitorStack(this, "MonitorStack");
  }
}
