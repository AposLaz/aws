import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../services/helper";
import { IUserPool } from "aws-cdk-lib/aws-cognito";

interface ApiStackProps extends StackProps {
  spaceslambdaIntegrationAPI: LambdaIntegration;
  userPool: IUserPool;
}

export class ApiStack extends Stack {
  private suffixId: string;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.suffixId = lastStringOfStackId(this.stackId);

    const api = new RestApi(this, "SpacesAPI", {
      restApiName: `spaces-rest-api-${this.suffixId}`,
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "SpaceApiAuthorizer",
      {
        cognitoUserPools: [props.userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    authorizer._attachToApi(api);

    const optionsApi: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: { authorizerId: authorizer.authorizerId },
    };

    const resources = api.root.addResource("spaces");
    resources.addMethod("GET", props.spaceslambdaIntegrationAPI, optionsApi);
    resources.addMethod("POST", props.spaceslambdaIntegrationAPI), optionsApi;
    resources.addMethod("PUT", props.spaceslambdaIntegrationAPI, optionsApi);
    resources.addMethod("DELETE", props.spaceslambdaIntegrationAPI, optionsApi);
  }
}
