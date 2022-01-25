import { Stack } from 'aws-cdk-lib';
// integrate lambda into api gateway
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

  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;

  public constructor(stack: Stack, props: TableProps) {
    this.stack = stack;
    this.props = props;
    this.initialize();
  }

  private initialize() {
    this.createTable();
    this.createLambdas();
    this.grantTabelRights();
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

  private createLambdas() {
    // lambdaPath is the file name in services/SpaceTable/ folder that will create this lambda
    if (this.props.createLambdaPath) {
      // create lambda
      this.createLambda = this.createSingleLambda(this.props.createLambdaPath);
      // integrate into api gateway
      this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
    }

    if (this.props.readLambdaPath) {
      this.readLambda = this.createSingleLambda(this.props.readLambdaPath);
      this.readLambdaIntegration = new LambdaIntegration(this.readLambda);
    }

    if (this.props.updateLambdaPath) {
      this.updateLambda = this.createSingleLambda(this.props.updateLambdaPath);
      this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);
    }

    if (this.props.deleteLambdaPath) {
      this.deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath);
      this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);
    }
  }

  private grantTabelRights() {
    if (this.createLambda) {
      this.table.grantWriteData(this.createLambda);
    }

    if (this.readLambda) {
      this.table.grantReadData(this.readLambda);
    }

    if (this.updateLambda) {
      this.table.grantWriteData(this.updateLambda);
    }

    if (this.deleteLambda) {
      this.table.grantWriteData(this.deleteLambda);
    }
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
      handler: 'handler',
      functionName: lambdaId, // give this lambda a name otherwise aws will give random name
      environment: {
        TABLE_NAME: this.props.tableName,
        PRIMARY_KEY: this.props.primaryKey
      }
    });
  }
}
