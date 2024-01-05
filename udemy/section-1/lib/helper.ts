/*
    [GIVE PROPERLY NAME IN RESOURCES THAT RELATE WITH STACK_ID]
    [RESOURCES NAME MUST HAVE UNIQUE NAME]

    StackID has the form of 
    arn:aws:cloudformation:eu-central-1:514334691151:stack/PhotoStack/4e7c42e0-ab94-11ee-9e47-0612eaaa51f3 

    So we want get last string and use it in Resources Name
*/

import { Fn } from "aws-cdk-lib";

export function lastStringOfStackId(stackId: string): string {
  const shortStackID = Fn.select(2, Fn.split("/", stackId)); //result 4e7c42e0-ab94-11ee-9e47-0612eaaa51f3
  const suffixId = Fn.select(4, Fn.split("-", shortStackID)); //result 0612eaaa51f3
  return suffixId;
}
