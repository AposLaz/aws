import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";

export const generateRandomId = () => {
  return randomUUID();
};

/**
 *
 * @param event
 * @param expectedGroup a string that indicate the group that need a user to be
 * @returns
 */
export const AuthorizerUser = (
  event: APIGatewayProxyEvent,
  expectedGroup: string
) => {
  const groups =
    event.requestContext.authorizer?.claims["cognito:groups"] || "";

  if ((groups as string).includes(expectedGroup)) return groups;
  return false;
};
