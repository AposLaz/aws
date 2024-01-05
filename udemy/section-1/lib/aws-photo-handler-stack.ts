import { Fn, Stack, StackProps } from "aws-cdk-lib";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { PhotoStack } from "./aws-photo-stack";
import { lastStringOfStackId } from "./helper";

/*
    create a lambda function
*/

interface targetBucketName extends StackProps {
  targetBucket: string;
}

export class PhotosHandlerStack extends Stack {
  private stackSuffix: string;
  constructor(scope: Construct, id: string, props: targetBucketName) {
    super(scope, id, props);

    this.stackSuffix = lastStringOfStackId(this.stackId);

    /*
    [FIRST WAY IMPORT VALUES AND ADD DEPENDENCIES]
    //Declare dependancy between 2 stacks
    this.addDependency(new PhotoStack(scope, "PhotoStack"));

    //Import value 1 way
    const targetBucket = Fn.importValue("photos-bucket");

    [SECOND WAY IMPORT VALUES AND ADD DEPENDENCIES IS THAT RUN NOW]
    */

    new LambdaFunction(this, "LambdaPhotoHandler", {
      functionName: `photo-handler-${this.stackSuffix}`,
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: Code.fromInline(`
        exports.handler = async (event)=>{
            console.log("hello: "+ process.env.TARGET_BUCKET)
        }
      `),
      environment: {
        TARGET_BUCKET: props.targetBucket,
      },
    });
  }
}
