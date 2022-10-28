import { CustomObject, CustomObjects } from "@/models/CustomObject";
import { env } from "process";
import * as shell from "shelljs";

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
        console.log(custObject);
    });
};

const listFiles = () => {
    throw new Error("Function not implemented.");
};

const importFiles = () => {
    throw new Error("Function not implemented.");
};

const importObjects = () => {
    throw new Error("Function not implemented.");
};

export default function runSdf() {
    // setupProject();
    saveNetSuiteToken();
    // listFiles();
    // importFiles();
    listObjects();
    // importObjects();
}