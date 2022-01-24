import { Stack } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';

export interface TableProps {
  tableName: string;
  primaryKey: string;
  createLambdaPath?: string;
  readLambdaPath?: string;
  updateLambdaPath?: string;
  deleteLambdaPath?: string;
}

export class GenericTable {
  private stack: Stack;
  private table: Table;
  private props: TableProps;

  private createLambda: NodejsFunction | undefined;
  private readLambda: NodejsFunction | undefined;
  private updateLambda: NodejsFunction | undefined;
  private deleteLambda: NodejsFunction | undefined;

  private createLambdaIntegration: LambdaIntegration;
  private readLambdaIntegration: LambdaIntegration;
  private updateLambdaIntegration: LambdaIntegration;
  private deleteLambdaIntegration: LambdaIntegration;

  public constructor(stack: Stack, props: TableProps) {
    this.stack = stack;
    this.props = props;
    this.initialize();
  }

  private initialize() {
    this.createTable();
  }

  private createTable() {
    this.table = new Table(this.stack, this.props.tableName, {
      partitionKey: {
        name: this.props.primaryKey,
        type: AttributeType.STRING
      },
      tableName: this.props.tableName
    });
  }

  private createSingleLambda(lambdaName: string): NodejsFunction {
    // use tableName to know which table the lambda belongs to
    const lambdaId = `${this.props.tableName}-${lambdaName}`;
    // NodejsFunction to compile ts to lambda
    return new NodejsFunction(this.stack, lambdaId, {
      // get path of lambda file
      entry: join(
        __dirname,
        '..',
        'services',
        this.props.tableName,
        `${lambdaName}.ts`
      ),
      handler: 'handler'
    });
  }
}
