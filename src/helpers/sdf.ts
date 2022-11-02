import { CustomObject, CustomObjects } from "@/models/CustomObject";
import env from "@/helpers/env";
import * as fs from 'fs';
import * as _ from 'lodash';
import { CLICommand } from "@/helpers/cli-command";
import { runCommand } from "@/helpers/cmd";

let cleansedFileOutput = [];

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

const listObjects = async () => {
    CustomObjects.forEach(async (custObject: CustomObject) => {
        const objectOutput = (await runCommand(CLICommand.ListObjects, `--type ${custObject.type}`))
            .stdout
            .replace(`\x1B[2K\x1B[1G`, ``)
            .split('\n')
            .filter(entry => entry.startsWith(custObject.type))
            .map(x => x.split(":")[1]);

        custObject.objects = objectOutput;
        console.log(`${custObject.type}: ${custObject.objects.length > 0 ? custObject.objects.length : 0}`);
    });
};

const listFiles = async () => {
    cleansedFileOutput = (await runCommand(CLICommand.ListFiles, `--folder /SuiteScripts`))
        .stdout
        .replace(`\x1B[2K\x1B[1G`, ``)
        .split('\n');
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


const importObjects = async () => {
    // Ephermeral data customizations should not be supported at this time.
    const ephermeralCustomizations = env.EXCLUDED.split(',');

    CustomObjects.forEach(async (custObject: CustomObject) => {
        if (ephermeralCustomizations.includes(custObject.type)) return;
        if (custObject.objects[0] === undefined) return;

        const collectOutput = await runCommand(CLICommand.ImportObjects,
            `--scriptid ALL ` +
            `--type ${custObject.type} ` +
            `--destinationfolder ${custObject.destination} ` +
            `--excludefiles`
        );

        if (collectOutput.includes(`The following objects failed with reason "Import custom objects failed.":`)) {
            custObject.error = true;
            console.error(`Failed to import: ${custObject.type}`);
        };
    });

    CustomObjects.forEach(custObject => {
        if (custObject.error) {
            console.log(`Failed to import: ${custObject.type}`);
        }
    });
};

export default async function runSdf() {
    saveNetSuiteToken();
    removeFilesAndObjects();
    createObjectFolders();
    listFiles();
    await new Promise(r => setTimeout(r, 10000));
    importFiles();
    await listObjects();
    await importObjects();
}
