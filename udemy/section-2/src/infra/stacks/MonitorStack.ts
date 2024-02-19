import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Alarm, Metric, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { join } from "path";

export class MonitorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //init lambda which sends message to webhook
    const webHookLambda = new NodejsFunction(this, "webHookLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "services", "monitoring", "handler.ts"),
    });

    //sns topic
    const alarmTopic = new Topic(this, "AlarmTopicSpaces", {
      displayName: "AlarmTopicSpaces",
      topicName: "AlarmTopicSpaces",
    });

    //attach sns topic with lambda --- Consumer
    alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));

    const spacesApi4xxAlarm = new Alarm(this, "spacesApi4xxAlarm", {
      metric: new Metric({
        metricName: "4XXError",
        namespace: "AWS/ApiGateway",
        period: Duration.minutes(1),
        statistic: "Sum",
        unit: Unit.COUNT,
        dimensionsMap: {
          "ApiName": "spaces-rest-api-0a359deac2d7",
        },
      }),
      evaluationPeriods: 1,
      threshold: 1,
      alarmDescription: "This is an alarm for 4xx http status in space api",
      alarmName: "SpacesApiAlarm",
    });

    //attach sns topic to alarm --- Producer
    const topicProducer = new SnsAction(alarmTopic);
    spacesApi4xxAlarm.addAlarmAction(topicProducer);
    spacesApi4xxAlarm.addOkAction(topicProducer);
  }
}
