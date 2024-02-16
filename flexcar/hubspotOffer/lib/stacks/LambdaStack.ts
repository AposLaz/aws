import { Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../helper";
import path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends StackProps {
  hubspotClientSecret: string;
  offerSqsQueues: string;
}

export class LambdaStack extends Stack {
  private suffixId: string;
  public readonly offerLambdaFunctionAPI: HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);

    const offerLambda = new NodejsFunction(this, "SpacesLambda", {
      functionName: `quote-offer-${this.suffixId}`,
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "..", "lambda", "offer.ts"),
      environment: {
        HUBSPOT_CLIENT_SECRET: props.hubspotClientSecret,
        OFFER_SQS_QUEUE: props.offerSqsQueues,
      },
    });

    offerLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sqs:SendMessage", "sqs:GetQueueUrl"],
        resources: ["*"], //ADD QUEUE ARN THAT NEED SEND DATA
      })
    );

    this.offerLambdaFunctionAPI = new HttpLambdaIntegration(
      "Hubspot-Offer",
      offerLambda
    );
  }
}
