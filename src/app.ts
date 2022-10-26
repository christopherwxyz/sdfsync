import { env } from "process";
import * as shell from "shelljs";

console.log("Hello world");

const saveToken = () => {
  const commandList = [
    "suitecloud",
    "account:savetoken",
    "--account",
    env.ACCOUNT,
    "--authid",
    env.AUTHID,
    "--tokenid",
    env.TOKENID,
    "--tokensecret",
    env.TOKENSECRET,
    "--url",
    env.URL,
  ];
  const command = commandList.join(" ");
  shell.exec(command);
};

export const handler = () => {
  console.log("Inside lambda handler");
  saveToken();
  // shell.exec("suitecloud --help");
  return {};
};
