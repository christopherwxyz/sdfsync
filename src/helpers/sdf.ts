import { CustomObject, CustomObjects } from "@/models/CustomObject";
import env from "@/helpers/env";
import * as fs from 'fs';
import * as _ from 'lodash';
import { CLICommand } from "@/helpers/cli-command";
import { runCommand } from "@/helpers/cmd";

let cleansedFileOutput = [];

function changeDir() {
    console.log(`Starting directory: ${process.cwd()}`);
    try {
        process.chdir(`${env.WORKSPACE}/${env.NSENV}`);
        console.log(`Package directory: ${process.cwd()}`);
    }
    catch (err) {
        console.error('chdir: ' + err);
    }
}

const saveNetSuiteToken = () => {
    console.log(`Saving token ...`);
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
    console.log(`Listing objects ...`);
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
    console.log(`Listing files ...`);
    cleansedFileOutput = (await runCommand(CLICommand.ListFiles, `--folder /SuiteScripts`))
        .stdout
        .replace(`\x1B[2K\x1B[1G`, ``)
        .split('\n');
};

const importFiles = () => {
    let singleLine = "'" + cleansedFileOutput.join("' '") + "'";
    runCommand(CLICommand.ImportFiles, `--paths ${singleLine} --excludeproperties`);
};

const removeFilesAndObjects = () => {

    console.log(`Emptying: /FileCabinet/SuiteScripts/ ...`);
    fs.rmSync(`${env.WORKSPACE}/${env.NSENV}/src/FileCabinet/SuiteScripts`, { recursive: true, force: true });

    console.log(`Emptying: /Objects/ ...`);
    fs.rmSync(`${env.WORKSPACE}/${env.NSENV}/src/Objects/`, { recursive: true, force: true });
}

const createObjectFolders = () => {
    CustomObjects.forEach((custObject: CustomObject) => {
        if (!fs.existsSync(`${env.WORKSPACE}/${env.NSENV}/src/${custObject.destination}`)) {
            console.log(`Creating folder for: ${env.WORKSPACE}/${env.NSENV}/src${custObject.destination}`);
            fs.mkdirSync(`${env.WORKSPACE}/${env.NSENV}/src${custObject.destination}`, { recursive: true });
        }
    });
}


const importObjects = async () => {
    // Ephermeral data customizations should not be supported at this time.
    if (env.EXCLUDED !== undefined) {
        const ephermeralCustomizations = env.EXCLUDED.split(',');


        CustomObjects.forEach(async (custObject: CustomObject) => {
            if (ephermeralCustomizations.includes(custObject.type)) return;
            if (custObject.objects[0] === undefined) return;
            console.log(`Attempting to import all ${custObject.type} ...`)

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
    }
};

const importObjectsSlowly = async () => {
    if (env.SLOW !== undefined) {
        const slowlyImportCustomizations = env.SLOW.split(',');
        console.log(`Customizations to slowly import: ${slowlyImportCustomizations}`);

        CustomObjects.forEach(async (custObject: CustomObject) => {
            if (custObject.objects[0] === undefined) return;
            console.log(`Attempting to import slowly: ${custObject.type} ...`)

            if (slowlyImportCustomizations.includes(custObject.type)) {

                // List all objects
                custObject.objects = (await runCommand(CLICommand.ListObjects, `--type ${custObject.type}`))
                    .stdout
                    .replace(`\x1B[2K\x1B[1G`, ``)
                    .split('\n')
                    .filter(entry => entry.startsWith(custObject.type))
                    .map(x => x.split(":")[1]);

                const collectOutput = custObject.objects.map(async (singleCustObject: string) => {
                    console.log(`Single import of: ${singleCustObject} ...`);
                    return (await runCommand(CLICommand.ImportObjects,
                        `--scriptid ${singleCustObject} ` +
                        `--type ${custObject.type} ` +
                        `--destinationfolder ${custObject.destination} ` +
                        `--excludefiles`));
                });

                // Import all collected objects
                // const collectOutput = await runCommand(CLICommand.ImportObjects,
                //     `--scriptid ${custObject.objects.join(" ")} ` +
                //     `--type ${custObject.type} ` +
                //     `--destinationfolder ${custObject.destination} ` +
                //     `--excludefiles`
                // );

                if (collectOutput.join(" ").includes(`The following objects failed with reason "Import custom objects failed.":`)) {
                    custObject.error = true;
                    console.error(`Failed to import: ${custObject.type}`);
                };
            }
        });

        CustomObjects.forEach(custObject => {
            if (custObject.error) {
                console.log(`Failed to import: ${custObject.type}`);
            }
        });
    }
};

export default async function runSdf() {
    changeDir();
    saveNetSuiteToken();
    removeFilesAndObjects();
    createObjectFolders();
    listFiles();
    await new Promise(r => setTimeout(r, 10000));
    importFiles();
    await listObjects();
    await importObjects();
    await importObjectsSlowly();
}
