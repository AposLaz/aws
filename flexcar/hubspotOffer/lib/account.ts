import { Construct } from "constructs";
import { LambdaStack } from "./stacks/LambdaStack";
import CONFIGS from "./configs";
import { ApiStack } from "./stacks/ApiStack";

export class StagingHubspotOffer extends Construct {
  constructor(scope: Construct) {
    super(scope, "StagingHubspotOffer");

    const lambda = new LambdaStack(this, "LambdaHubspotOffer", {
      hubspotClientSecret: CONFIGS.hubspotClient,
      offerSqsQueues: CONFIGS.sqsOfferQuote,
    });

    new ApiStack(this, "ApiHubspotOffer", {
      offerLambdaFunctionAPI: lambda.offerLambdaFunctionAPI,
    });
  }
}
