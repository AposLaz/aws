import { Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { lastStringOfStackId } from "../services/helper";

export class DynamoDbStack extends Stack {
  private suffix: string;
  public readonly spacesDynamoDbTable: ITable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.suffix = lastStringOfStackId(this.stackId);

    const initDynamoDbTable = new Table(this, "SpaceTable", {
      tableName: `space-${this.suffix}`,
      partitionKey: {
        name: "ID",
        type: AttributeType.STRING,
      },
    });

    this.spacesDynamoDbTable = initDynamoDbTable;
  }
}
