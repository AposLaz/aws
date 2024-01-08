import { Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../services/helper";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends StackProps {
  dbSpacesTable: ITable;
}

export class LambdaStack extends Stack {
  private suffixId: string;
  public readonly lambdaFunctionAPI: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);

    const newLambda = new NodejsFunction(this, "LambdaHello", {
      functionName: `new-lambda-${this.suffixId}`,
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "..", "services", "lambdaFunction.ts"),
      environment: {
        TABLE_SPACE_NAME: props.dbSpacesTable.tableName,
      },
    });

    //give policy to list buckets
    newLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:ListAllMyBuckets", "s3:ListBucket"],
        resources: ["*"], //bad practice
      })
    );

    this.lambdaFunctionAPI = new LambdaIntegration(newLambda);
  }
}