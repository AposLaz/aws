import "dotenv/config";

const requiredEnvVariables: string[] = [
  "HUBSPOT_CLIENT_SECRET",
  "OFFER_SQS_QUEUE",
];

requiredEnvVariables.forEach((name: string) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable "${name}" is missing`);
  }
});

export default {
  hubspotClient: process.env.HUBSPOT_CLIENT_SECRET as string,
  sqsOfferQuote: process.env.OFFER_SQS_QUEUE as string,
  SLACK_TOKEN: process.env.SLACK_TOKEN as string,
};
