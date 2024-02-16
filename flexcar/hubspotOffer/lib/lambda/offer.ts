import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { hubspotSignatureVerifier } from "./hubspot-verifier";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient();

type OfferProps = {
  dealId: string;
  dealName: string;
  templateId: string;
};

export const handler = async (event: APIGatewayRequestAuthorizerEventV2) => {
  //1. Cors to hubspot
  const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET as string;
  const OFFER_SQS_QUEUE = process.env.OFFER_SQS_QUEUE as string;
  let isAuthorized = false;

  if (event.headers && event.headers?.["x-hubspot-signature-v3"]) {
    isAuthorized = hubspotSignatureVerifier(event, HUBSPOT_CLIENT_SECRET);
  }

  if (!isAuthorized) {
    return {
      statusCode: 401,
      msg: "Unauthorized",
    };
  }

  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      msg: "Invalid request. Provide some data",
    };
  }

  const offerProps = event.queryStringParameters as OfferProps;

  if (!offerProps.dealId || !offerProps.templateId || !offerProps.dealName) {
    return {
      statusCode: 400,
      msg: "Invalid body request",
    };
  }

  try {
    const input = {
      DelaySeconds: 10,
      MessageAttributes: {
        dealId: {
          DataType: "Number",
          StringValue: offerProps.dealId,
        },
        templateId: {
          DataType: "Number",
          StringValue: offerProps.templateId,
        },
      },
      MessageBody: `Create Quote Offer for dealName: ${offerProps.dealName}`,
      QueueUrl: OFFER_SQS_QUEUE,
    };

    const command = new SendMessageCommand(input);
    await sqs.send(command);

    const response = {
      statusCode: 200,
      body: "Start quote process",
    };

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return {
      statusCode: 500,
      error: err.message,
    };
  }
};
