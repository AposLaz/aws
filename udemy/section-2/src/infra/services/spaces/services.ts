import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetSpacesProps, GetSpacesByIdProps } from "./types";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { fieldsValidator } from "./errorHandler";
import { AuthorizerUser, generateRandomId } from "./utils";

export const getSpaces = async (
  event: APIGatewayProxyEvent,
  db: DynamoDBClient
): Promise<APIGatewayProxyResult> => {
  try {
    let params: GetSpacesProps | GetSpacesByIdProps = {
      TableName: process.env.TABLE_SPACE_NAME as string,
    };

    if (event.queryStringParameters && event.queryStringParameters.id) {
      params = {
        ...params,
        Key: {
          "id": { S: event.queryStringParameters.id },
        },
      };

      const command = new GetItemCommand(params as GetSpacesByIdProps);
      const result = await db.send(command);

      return {
        statusCode: result.Item ? 201 : 404,
        body: result.Item
          ? JSON.stringify(unmarshall(result.Item))
          : JSON.stringify({
              msg: `Space with Id ${event.queryStringParameters.id} not found`,
            }),
      };
    }

    const command = new ScanCommand(params as GetSpacesProps);

    const result = await db.send(command);
    console.log(result);
    const items = result?.Items?.map((item) => unmarshall(item));
    return {
      statusCode: result.Items ? 201 : 404,
      body: items
        ? JSON.stringify(items)
        : JSON.stringify({ msg: `No results found` }),
    };
  } catch (error: unknown) {
    const err = error as Error;

    return {
      statusCode: 500,
      body: JSON.stringify(err.message),
    };
  }
};

export const createSpace = async (
  event: APIGatewayProxyEvent,
  db: DynamoDBClient
): Promise<APIGatewayProxyResult> => {
  //creates schema and post item to dynamoDB
  const data = event.body ? JSON.parse(event.body) : {};
  data.id = generateRandomId();

  fieldsValidator(data);

  const command = new PutItemCommand({
    TableName: process.env.TABLE_SPACE_NAME as string,
    Item: marshall(data),
  });

  try {
    const result = await db.send(command);
    console.log(result);

    return {
      statusCode: 201,
      body: JSON.stringify({ id: data.id }),
    };
  } catch (error: unknown) {
    const err = error as Error;

    return {
      statusCode: 500,
      body: JSON.stringify(err.message),
    };
  }
};

export const updateSpaceById = async (
  event: APIGatewayProxyEvent,
  db: DynamoDBClient
): Promise<APIGatewayProxyResult> => {
  if (
    event.queryStringParameters &&
    event.queryStringParameters.id &&
    event.body
  ) {
    const updateBody = JSON.parse(event.body);
    const id = event.queryStringParameters.id;
    const key = Object.keys(updateBody);
    const command = new UpdateItemCommand({
      TableName: process.env.TABLE_SPACE_NAME as string,
      Key: {
        "id": { S: id },
      },
      UpdateExpression: "set #xxxNew = :new",
      ExpressionAttributeValues: {
        ":new": { S: updateBody.key },
      },
      ExpressionAttributeNames: {
        "#xxxNew": key[0],
      },
      ReturnValues: "UPDATED_NEW",
    });
    console.log(command);
    const result = await db.send(command);
    console.log(result);

    return {
      statusCode: 204,
      body: JSON.stringify(result),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      msg: "Could not update the item. Please provide right credentials",
    }),
  };
};

export const deleteSpaceById = async (
  event: APIGatewayProxyEvent,
  db: DynamoDBClient
): Promise<APIGatewayProxyResult> => {
  if (!AuthorizerUser(event, "admin")) {
    return {
      statusCode: 401,
      body: "Not Authorized",
    };
  }
  if (event.queryStringParameters && event.queryStringParameters.id) {
    const id = event.queryStringParameters.id;
    const command = new DeleteItemCommand({
      TableName: process.env.TABLE_SPACE_NAME as string,
      Key: {
        "id": { S: id },
      },
    });

    const result = await db.send(command);
    console.log(result);

    return {
      statusCode: 200,
      body: JSON.stringify(`Space with id ${id} deleted successfully!!!`),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      msg: "Could not update the item. Please provide right credentials",
    }),
  };
};
