import { CustomObject, CustomObjects } from "@/models/CustomObject";
import env from "@/helpers/env";
import * as fs from 'fs';
import * as rimraf from 'rimraf';
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

const removeFilesAndObjects = () => {

    console.log(`Emptying: /FileCabinet/SuiteScripts/`);
    fs.rmSync(`/tmp/ns/packages/${env.NSENV}/src/FileCabinet/SuiteScripts`, { recursive: true, force: true });

    console.log('Emptying: /Objects/');
    fs.rmSync(`/tmp/ns/packages/${env.NSENV}/src/Objects/`, { recursive: true, force: true });
}

const createObjectFolders = () => {
    CustomObjects.forEach((custObject: CustomObject) => {
        if (!fs.existsSync(`/tmp/ns/packages/${env.NSENV}/src/${custObject.destination}`)) {
            console.log(`Creating folder for: /tmp/ns/packages/${env.NSENV}/src${custObject.destination}`);
            fs.mkdirSync(`/tmp/ns/packages/${env.NSENV}/src${custObject.destination}`, { recursive: true });
        }
    });
}


const importObjects = () => {
    // Ephermeral data customizations should not be supported at this time.
    const ephermeralCustomizations = [
        'savedsearch',
        'csvimport',
        'dataset',
        'financiallayout',
        'reportdefinition',
        'translationcollection',
        'workbook'
    ];

    CustomObjects.forEach((custObject: CustomObject) => {
        if (ephermeralCustomizations.includes(custObject.type)) return;

        runCommand(CLICommand.ImportObjects,
            `--scriptid "ALL" ` +
            `--type ${custObject.type} ` +
            `--destinationfolder ${custObject.destination} ` +
            `--excludefiles`
        );
    });
};

export default function runSdf() {
    // setupProject();
    saveNetSuiteToken();
    removeFilesAndObjects();
    // createObjectFolders();
    listFiles();
    importFiles();
    // listObjects();
    // importObjects();
}
