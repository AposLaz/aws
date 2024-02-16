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
  public readonly spaceslambdaFunctionAPI: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);

    const spacesLambda = new NodejsFunction(this, "SpacesLambda", {
      functionName: `spaces-lambda-${this.suffixId}`,
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "..", "services", "spaces", "router.ts"),
      environment: {
        TABLE_SPACE_NAME: props.dbSpacesTable.tableName,
      },
    });

    //give policy for dynamodb
    spacesLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:DescribeTable",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ],
        resources: [props.dbSpacesTable.tableArn], //give access to write only to this dynamo DB
      })
    );

    this.spaceslambdaFunctionAPI = new LambdaIntegration(spacesLambda);

    //give policy to list buckets
    /*
    newLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:ListAllMyBuckets", "s3:ListBucket"],
        resources: ["*"], //bad practice
      })
    );
      */
  }
}
