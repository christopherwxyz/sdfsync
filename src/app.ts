import * as shell from "shelljs";

console.log("Hello world");

export const handler = () => {
  console.log("Inside lambda handler");
  shell.exec("suitecloud --help");
  return {};
};
