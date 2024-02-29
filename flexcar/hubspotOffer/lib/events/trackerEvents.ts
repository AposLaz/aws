import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  Alarm,
  ComparisonOperator,
  Metric,
  Unit,
} from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";

export class TrackerEventsStack extends Stack {
  constructor(scope: Construct, stackId: string, props?: StackProps) {
    super(scope, stackId, props);

    const trackerEventsAlarmScaleOut = new Alarm(
      this,
      "trackerEventsAlarmScaleOut",
      {
        metric: new Metric({
          metricName: "Latency",
          namespace: "AWS/ELB",
          period: Duration.minutes(1),
          statistic: "p99",
          unit: Unit.MILLISECONDS,
          dimensionsMap: {
            "LoadBalancerName": "awseb-e-8-AWSEBLoa-1I349T497DIB8",
          },
        }),
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        threshold: 10,
        alarmDescription:
          "This is an alarm for scale out tracker server instances",
        alarmName: "trackers-server-events-scale-out",
      }
    );
  }
}
