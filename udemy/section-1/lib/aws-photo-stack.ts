import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { lastStringOfStackId } from "./helper";

export class PhotoStack extends Stack {
  private stackSuffix: string;
  public readonly bucketArn: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.stackSuffix = lastStringOfStackId(this.stackId);

    const photoBucket = new Bucket(this, "PhotoBucket", {
      bucketName: `photo-bucket-${this.stackSuffix}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    /*
    [UPDATE] => LogicalID

    const photoNode = photoBucket.node.defaultChild as CfnBucket;
    photoNode.overrideLogicalId("PhotoBucketV2");
    */

    //export a value 1st Way
    /*
        new CfnOutput(this, "photos-bucket", {
        value: photoBucket.bucketArn,
        exportName: "photos-bucket",
        });
    */

    //export value 2nd Way
    this.bucketArn = photoBucket.bucketArn;
  }
}
