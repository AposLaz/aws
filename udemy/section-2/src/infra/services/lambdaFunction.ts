import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";

const s3Client = new S3Client({});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const command = new ListBucketsCommand({});
  const ListBucketResult = (await s3Client.send(command)).Buckets;

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(
      "Heloo again from lambda this is id: " +
        v4() +
        " ---- buckets : " +
        JSON.stringify(ListBucketResult)
    ),
  };

  console.log(event);

  return response;
};
