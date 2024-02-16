import { handler } from "../src/infra/services/spaces/router";

process.env.AWS_REGION = "eu-central-1";
process.env.TABLE_SPACE_NAME = "space-062d42097ae7";

handler(
  {
    httpMethod: "PUT",
    queryStringParameters: {
      id: "9da90c95-e30e-40ba-9638-5e84816ddd1b",
    },
    body: JSON.stringify({
      location: "London",
    }),
  } as any,
  {} as any
);
