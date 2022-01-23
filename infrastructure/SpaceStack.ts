import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
// import {
//   Code,
//   Function as LambdaFunction,
//   Runtime
// } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  // name, primaryKey, stack
  private spaceTable = new GenericTable('SpaceTable', 'spaceId', this);

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // JS version:
    // const helloLambda = new LambdaFunction(this, 'helloLambda', {
    //   runtime: Runtime.NODEJS_14_X,
    //   code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
    //   handler: 'hello.main'
    // });

    // TS version:
    const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
      entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
      handler: 'handler'
    });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('s3:ListAllMyBuckets');
    s3ListPolicy.addResources('*'); // TODO: update as it is bad practice to use *

    // Add policy to lambda to access s3 buckets
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

    // Hello Api lambda integration:
    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);
  }
}
