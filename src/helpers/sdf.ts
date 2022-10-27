import { env } from "process";
import * as shell from "shelljs";

const saveNetSuiteToken = () => {
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

export default function runSdf() {
    saveNetSuiteToken();
}