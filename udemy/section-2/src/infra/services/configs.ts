const requiredEnvVariables: string[] = ["AWS_REGION"];

requiredEnvVariables.forEach((name: string) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable "${name}" is missing`);
  }
});

export default {
  awsRegion: process.env.AWS_REGION as string,
};
