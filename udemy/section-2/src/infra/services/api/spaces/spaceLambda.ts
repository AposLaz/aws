import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  let message: string = "";

  switch (event.httpMethod) {
    case "GET":
      message = "Response from GET method";
      break;
    case "POST":
      message = "Response from POST method";
      break;
    default:
      break;
  }
  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(message),
  };

  return response;
};
