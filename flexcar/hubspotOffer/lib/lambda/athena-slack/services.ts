import { AthenaClient } from "@aws-sdk/client-athena";
import { WebClient } from "@slack/web-api";

const slackClient = new WebClient(process.env.SLACK_TOKEN);
export const athenaClient = new AthenaClient({
  region: process.env.AWS_DEFAULT_REGION,
});

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const getChannelId = async (
  channelName: string
): Promise<string | undefined> => {
  try {
    const response = await slackClient.conversations.list({
      types: "public_channel",
    });
    let channel = response?.channels?.find(({ name }) => name === channelName);

    if (process.env.NODE_ENV !== "production") {
      channel = response?.channels?.find(({ name }) => name === channelName);
    }
    const channelId = channel?.id;

    return channelId;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`(getChannelId) => ${error.message}`);
  }
};

export const sendAlertNotifications = async (
  message: string,
  channelId: string
) => {
  try {
    const timestamp = formatDateToString(new Date());

    const extraMessage =
      process.env.NODE_ENV === "development"
        ? "[FROM DEV ENV]\n"
        : process.env.NODE_ENV === "staging"
        ? "[FROM STAGIN ENV]\n"
        : "";

    const response = await slackClient.chat.postMessage({
      channel: channelId,
      text: `${timestamp}-test-alert`,
    });

    return response;
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`(sendAlertNotifications) => ${error.message}`);
    return undefined;
  }
};
