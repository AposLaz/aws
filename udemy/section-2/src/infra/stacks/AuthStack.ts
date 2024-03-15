import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStack extends Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;

  constructor(scope: Construct, stackId: string, props?: StackProps) {
    super(scope, stackId, props);

    this.createUserPool();
    this.createUserPoolClient();
    this.createUserGroups();
  }

  private createUserPool() {
    this.userPool = new UserPool(this, "SpaceAppUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    });

    new CfnOutput(this, "SpaceAppUserPoolOutputId", {
      value: this.userPool.userPoolId,
    });
  }
  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient("SpaceUserPoolClient", {
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true,
      },
    });

    new CfnOutput(this, "SpaceUserPoolClientOutputId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createUserGroups() {
    new CfnUserPoolGroup(this, "SpaceAuthzGroups", {
      userPoolId: this.userPool.userPoolId,
      groupName: "admin",
      description: "Only admins will have access to this role",
    });
  }
}
