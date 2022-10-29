import { CustomObject, CustomObjects } from "@/models/CustomObject";
import { env } from "process";
import * as shell from "shelljs";

let cleansedFileOutput = []

const setupProject = () => {
    throw new Error("Function not implemented.");
};

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

const listObjects = () => {
    CustomObjects.forEach((custObject: CustomObject) => {
        shell.exec(`suitecloud object:list --type ${custObject.type}`);
    });
};

const listFiles = () => {
    cleansedFileOutput = shell.exec("suitecloud file:list --folder /SuiteScripts").stdout.replace(`\x1B[2K\x1B[1G`, ``).split('\n');
};

const importFiles = () => {
    let singleLine = "'" + cleansedFileOutput.join("' '") + "'";
    shell.exec(`suitecloud file:import --paths ${singleLine}`);
};

const importObjects = () => {
    throw new Error("Function not implemented.");
};

export default function runSdf() {
    // setupProject();
    saveNetSuiteToken();
    listFiles();
    // importFiles();
    listObjects();
    // importObjects();
}