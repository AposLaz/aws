import { SNSEvent } from "aws-lambda";
import { handler } from "../src/infra/services/monitoring/handler";

const event: SNSEvent = {
  Records: [
    {
      Sns: {
        Message: "This is a test event",
      },
    },
  ],
} as any;

handler(event);
