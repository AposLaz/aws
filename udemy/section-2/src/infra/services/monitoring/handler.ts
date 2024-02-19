import { SNSEvent } from "aws-lambda";

/**
 * Accepts an Event Array from SNS and send it to webhook in slack channel
 *
 * @used=https://webhook.site/#!/view/a18f4a3b-16bb-45b8-b081-b37535b4b962 for webhook
 *
 */

const webhookUrl = "https://webhook.site/a18f4a3b-16bb-45b8-b081-b37535b4b962";

export const handler = async (event: SNSEvent) => {
  for (const record of event.Records) {
    await fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify({ message: record.Sns.Message }),
    });
  }
};
