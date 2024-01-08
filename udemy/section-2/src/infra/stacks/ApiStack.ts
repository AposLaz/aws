import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../services/helper";

interface ApiStackProps extends StackProps {
  lambdaIntegrationAPI: LambdaIntegration;
}

export class ApiStack extends Stack {
  private suffixId: string;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);
    const api = new RestApi(this, "SpacesAPI", {
      restApiName: `lambda-rest-api-${this.suffixId}`,
    });

    const resources = api.root.addResource("spaces");
    resources.addMethod("GET", props.lambdaIntegrationAPI);
  }
}