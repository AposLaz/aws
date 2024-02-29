import {
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { SNSEvent } from "aws-lambda";
import {
  athenaClient,
  getChannelId,
  sendAlertNotifications,
} from "./athena-slack/services";

export const handler = async (event: SNSEvent) => {
  for (const record of event.Records) {
    let channelId = undefined;
    let retriesChannel = 0;

    while (!channelId || retriesChannel < 5) {
      channelId = await getChannelId("vtms-infra-alerts");
      retriesChannel++;
    }

    //TODO => Change queryString
    const queryString = `SELECT * FROM "default".alb_logs`;
    try {
      const startQueryExecutionCommand = new StartQueryExecutionCommand({
        QueryString: queryString,
        QueryExecutionContext: {
          Database: "default",
        },
        ResultConfiguration: {
          OutputLocation: "s3://vtms-elb-logs/query-results/",
        },
      });

      const response = await athenaClient.send(startQueryExecutionCommand);
      const queryExecutionId = response.QueryExecutionId;

      // Wait for the query to complete. Query may need some time to complete
      let state = "";

      while (state !== "SUCCEEDED" && state !== "FAILED") {
        const getQueryExecutionCommand = new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        });
        const executionResponse = await athenaClient.send(
          getQueryExecutionCommand
        );
        state = executionResponse.QueryExecution?.Status?.State || "";
      }

      if (state === "SUCCEEDED") {
        // Retrieve the results
        const getQueryResultsCommand = new GetQueryResultsCommand({
          QueryExecutionId: queryExecutionId,
        });
        const resultsResponse = await athenaClient.send(getQueryResultsCommand);

        // Process and display/query the results
        if (
          resultsResponse.ResultSet?.Rows &&
          resultsResponse.ResultSet?.Rows?.length > 0
        ) {
          const result = resultsResponse.ResultSet.Rows;
          // Get columns
          const columns =
            result[0]?.Data && result[0].Data.map((col) => col.VarCharValue);

          if (columns) {
            // Get data rows
            const rows = result.slice(1).map((row) => row.Data);

            // Associate column names with data rows
            const formattedData = rows.map(
              (row) =>
                row &&
                Object.fromEntries(
                  row.map((value, index) => [
                    columns[index],
                    value.VarCharValue,
                  ])
                )
            );

            //TODO send message to slack
            sendAlertNotifications(record.Sns.Message, channelId);
          }
        }
      } else {
        console.error(`Query failed: ${state}`);
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }
};
