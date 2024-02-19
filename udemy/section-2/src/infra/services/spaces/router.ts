import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { client as dbClient } from "./db";
import {
  createSpace,
  deleteSpaceById,
  getSpaces,
  updateSpaceById,
} from "./services";
import { MissingFieldsError } from "./errorHandler";
import { getSegment } from "aws-xray-sdk-core";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  let message: string = "";

  const segment = getSegment()?.addNewSubsegment("MyCustom Segment");

  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  segment?.close();
  const segment2 = getSegment()?.addNewSubsegment("MyCustom Segment");
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  segment2?.close();

  try {
    let response;
    switch (event.httpMethod) {
      case "GET":
        response = await getSpaces(event, dbClient);
        break;
      case "POST":
        response = await createSpace(event, dbClient);
        break;
      case "PUT":
        response = await updateSpaceById(event, dbClient);
        break;
      case "DELETE":
        response = await deleteSpaceById(event, dbClient);
        break;
      default:
        response = {
          statusCode: 200,
          body: JSON.stringify(message),
        };
        break;
    }
    console.log(response);
    return response;
  } catch (error: unknown) {
    if (error instanceof MissingFieldsError) {
      return {
        statusCode: 400,
        body: JSON.stringify(error.message),
      };
    }

    const err = error as Error;

    return {
      statusCode: 500,
      body: JSON.stringify(err.message),
    };
  }
};
