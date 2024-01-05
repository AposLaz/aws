import * as cdk from "aws-cdk-lib";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

class L3Bucket extends Construct {
  constructor(scope: Construct, id: string, expiration: number) {
    super(scope, id);

    //status here is the default (Enabled)
    new Bucket(this, "MyL3Bucket", {
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(expiration),
        },
      ],
    });
  }
}

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create s3 Bucket with 3 ways
    new CfnBucket(this, "L1Bucket", {
      lifecycleConfiguration: {
        rules: [
          {
            expirationInDays: 1,
            status: "Enabled",
          },
        ],
      },
    });

    const duration = new cdk.CfnParameter(this, "duration", {
      default: 5,
      minValue: 2,
      maxValue: 10,
      type: "Number",
    });
    //status here is the default (Enabled)
    const L2Bucket = new Bucket(this, "L2Bucket", {
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(duration.default),
        },
      ],
    });

    new cdk.CfnOutput(this, "L2BucketName", {
      value: L2Bucket.bucketName,
    });

    new L3Bucket(this, "L3Bucket", 3);
  }
}
