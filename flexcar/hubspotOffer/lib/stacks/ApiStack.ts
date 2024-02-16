import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../helper";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface ApiStackProps extends StackProps {
  offerLambdaFunctionAPI: HttpLambdaIntegration;
}

export class ApiStack extends Stack {
  private suffixId: string;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);
    const api = new HttpApi(this, "SpacesAPI", {
      description: "HTTP api for hubspot offer",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: [CorsHttpMethod.POST],
        allowOrigins: ["https://app.hubspot.com"],
      },
      apiName: `hubspot-offer-${this.suffixId}`,
    });

    api.addRoutes({
      path: "/hubspot/queue/offer",
      methods: [HttpMethod.POST],
      integration: props.offerLambdaFunctionAPI,
    });

    //add an Output with the API Url
    new CfnOutput(this, "apiUrl", {
      value: api.url!,
    });
  }
}
