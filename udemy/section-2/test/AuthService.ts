import { type CognitoUser } from "@aws-amplify/auth";
import { Amplify, Auth } from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "eu-central-1",
    userPoolId: "eu-central-1_xwiuuClBy",
    userPoolWebClientId: "456kj0co6n3nd6ck669ck6v14c",
    authenticationFlowType: "USER_PASSWORD_AUTH",
  },
});

export class AuthService {
  public async login(userName: string, password: string) {
    const result = await Auth.signIn(userName, password);
    return result;
  }
}
