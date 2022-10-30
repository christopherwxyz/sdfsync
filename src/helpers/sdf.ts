import { CustomObject, CustomObjects } from "@/models/CustomObject";
import { env } from "process";
import * as shell from "shelljs";
import { CLICommand } from "@/helpers/cli-command";
import { runCommand } from "@/helpers/cmd";

// shell.config.silent = true; // Used for suppressing shell output.
let cleansedFileOutput = [];

const setupProject = () => {
    throw new Error("Function not implemented.");
};

const saveNetSuiteToken = () => {
    runCommand(
        CLICommand.SaveToken, 
        `--account "${env.ACCOUNT}" ` +
        `--authid "${env.AUTHID}" ` +
        `--tokenid "${env.TOKENID}" ` +
        `--tokensecret "${env.TOKENSECRET}" ` + 
        `--url "${env.URL}"`
    );
};

const listObjects = () => {
    CustomObjects.forEach((custObject: CustomObject) => {
        runCommand(CLICommand.ListObjects, `--type ${custObject.type}`);
    });
};

const listFiles = async () => {
    cleansedFileOutput = (await runCommand(CLICommand.ListFiles, `--folder /SuiteScripts`)).stdout.replace(`\x1B[2K\x1B[1G`, ``).split('\n');

};

const importFiles = () => {
    let singleLine = "'" + cleansedFileOutput.join("' '") + "'";
    runCommand(CLICommand.ImportFiles, `--paths ${singleLine}`);
};

const importObjects = () => {
    throw new Error("Function not implemented.");
};

export default function runSdf() {
    // setupProject();
    saveNetSuiteToken();
    listFiles();
    // importFiles();
    // listObjects();
    // importObjects();
}