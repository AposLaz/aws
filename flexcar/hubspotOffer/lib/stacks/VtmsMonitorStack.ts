import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  Alarm,
  ComparisonOperator,
  Metric,
  Unit,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { join } from "path";

export type VtmsMonitorProps = {
  slackToken: string;
} & StackProps;

export class VtmsMonitorStack extends Stack {
  constructor(scope: Construct, id: string, props: VtmsMonitorProps) {
    super(scope, id, props);

    //init lambda which sends message to AthenaSlack
    const athenaSlackLambda = new NodejsFunction(this, "AthenaSlackLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "lambda", "athena-slack-alerts.ts"),
      environment: {
        SLACK_TOKEN: props.slackToken,
      },
    });

    //sns topic
    const alarmTopic = new Topic(this, "AlarmVtmsTopic", {
      displayName: "AlarmVtmsTopic",
      topicName: "AlarmVtmsTopic",
    });

    //attach sns topic with lambda Consumer
    alarmTopic.addSubscription(new LambdaSubscription(athenaSlackLambda));

    const vtmsLoadBalancerAlarm = new Alarm(
      this,
      "VtmsLoadBalancer5xxStatusCode",
      {
        metric: new Metric({
          metricName: "HTTPCode_ELB_5XX_Count",
          namespace: "AWS/ApplicationELB",
          period: Duration.minutes(1),
          statistic: "Sum",
          unit: Unit.COUNT,
          dimensionsMap: {
            "LoadBalancer": "app/vtms-lb/cb58d3dbf2093ff8",
          },
        }),
        evaluationPeriods: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        alarmDescription:
          "This is an alarm for 5xx http status on load balancer",
        alarmName: "vtms-http-5xx-status",
      }
    );

    //attach sns topic to alarm --- Producer
    const topicProducer = new SnsAction(alarmTopic);
    vtmsLoadBalancerAlarm.addAlarmAction(topicProducer);
    vtmsLoadBalancerAlarm.addOkAction(topicProducer);
  }
}
