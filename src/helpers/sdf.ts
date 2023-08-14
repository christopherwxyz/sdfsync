import { CustomObject, CustomObjects } from "@/models/CustomObject";
import env from "@/helpers/env";
import * as fs from "fs";
import { CLICommand } from "@/helpers/cli-command";
import { runCommand } from "@/helpers/cmd";

let cleansedFileOutput: string[] = [];

function changeDir(): { success: boolean } {
  console.log(`Starting directory: ${process.cwd()}`);
  process.chdir(`${env.WORKSPACE}/${env.NSENV}`);
  console.log(`Package directory: ${process.cwd()}`);
  return { success: true };
}

const saveNetSuiteToken = async (): Promise<void> => {
  console.log(`Saving token ...`);
  const collectedOutput = await runCommand(
    CLICommand.SaveToken,
    `--account "${env.ACCOUNT}" ` +
      `--authid "${env.AUTHID}" ` +
      `--tokenid "${env.TOKENID}" ` +
      `--tokensecret "${env.TOKENSECRET}" ` +
      `--url "${env.URL}"`
  );

  if (
    collectedOutput.includes(`Invalid login attempt.`) ||
    collectedOutput.includes(`*** ERROR ***`) ||
    collectedOutput.includes(
      `Something went wrong when trying to save credentials. Contact support.`
    )
  ) {
    throw new Error(`Failed to save token.`);
  }
};

const listObjects = async (): Promise<{ success: boolean }> => {
  console.log(`Listing objects ...`);
  for (const custObject of CustomObjects) {
    const objectOutput = (
      await runCommand(CLICommand.ListObjects, `--type ${custObject.type}`)
    ).stdout
      .replace(`\x1B[2K\x1B[1G`, ``)
      .split("\n")
      .filter((entry) => entry.startsWith(custObject.type))
      .map((x) => x.split(":")[1]);

    custObject.objects = objectOutput;
    console.log(
      `${custObject.type}: ${
        custObject.objects.length > 0 ? custObject.objects.length : 0
      }`
    );
  }
  return { success: true };
};

const listFiles = async (): Promise<{ success: boolean }> => {
  console.log(`Listing files ...`);
  cleansedFileOutput = (
    await runCommand(CLICommand.ListFiles, `--folder /SuiteScripts`)
  ).stdout
    .replace(`\x1B[2K\x1B[1G`, ``)
    .split("\n");
  return { success: true };
};

const importFiles = async (): Promise<{ success: boolean }> => {
  const singleLine = "'" + cleansedFileOutput.join("' '") + "'";
  await runCommand(
    CLICommand.ImportFiles,
    `--paths ${singleLine} --excludeproperties`
  );
  return { success: true };
};

const removeFilesAndObjects = (): void => {
  console.log(`Emptying: /FileCabinet/SuiteScripts/ ...`);
  fs.rmSync(`${env.WORKSPACE}/${env.NSENV}/src/FileCabinet/SuiteScripts`, {
    recursive: true,
    force: true,
  });

  console.log(`Emptying: /Objects/ ...`);
  fs.rmSync(`${env.WORKSPACE}/${env.NSENV}/src/Objects/`, {
    recursive: true,
    force: true,
  });
};

const createObjectFolders = (): void => {
  CustomObjects.forEach((custObject: CustomObject) => {
    if (
      !fs.existsSync(
        `${env.WORKSPACE}/${env.NSENV}/src/${custObject.destination}`
      )
    ) {
      console.log(
        `Creating folder for: ${env.WORKSPACE}/${env.NSENV}/src${custObject.destination}`
      );
      fs.mkdirSync(
        `${env.WORKSPACE}/${env.NSENV}/src${custObject.destination}`,
        { recursive: true }
      );
    }
  });
};

const deploy = async (): Promise<void> => {
  const collectOutput = await runCommand(CLICommand.Deploy);

  if (
    collectOutput.includes(`*** ERROR ***`) ||
    collectOutput.includes(
      `The deployment process has encountered an error.`
    ) ||
    collectOutput.includes(
      `Check your authentication credentials and try again.`
    ) ||
    collectOutput.includes(`Invalid login attempt.`)
  ) {
    throw new Error(`Failed to deploy.`);
  }
};

const importObjects = async (): Promise<{ success: boolean }> => {
  // Ephermeral data customizations should not be supported at this time.
  if (env.EXCLUDED !== undefined) {
    const ephermeralCustomizations = env.EXCLUDED.split(",");

    for (const custObject of CustomObjects) {
      if (ephermeralCustomizations.includes(custObject.type)) continue;
      if (custObject.objects[0] === undefined) continue;
      console.log(`Attempting to import all ${custObject.type} ...`);

      const collectOutput = await runCommand(
        CLICommand.ImportObjects,
        `--scriptid ALL ` +
          `--type ${custObject.type} ` +
          `--destinationfolder ${custObject.destination} ` +
          `--excludefiles`
      );

      if (
        collectOutput.includes(
          `The following objects failed with reason "Import custom objects failed.":`
        )
      ) {
        custObject.error = true;
        console.error(`Failed to import: ${custObject.type}`);
      }
    }

    CustomObjects.forEach((custObject) => {
      if (custObject.error) {
        console.log(`Failed to import: ${custObject.type}`);
      }
    });
  }
  return { success: true };
};

const importObjectsSlowly = async (): Promise<{ success: true }> => {
  if (env.SLOW !== undefined) {
    const slowlyImportCustomizations = env.SLOW.split(",");
    console.log(
      `Customizations to slowly import: ${JSON.stringify(
        slowlyImportCustomizations
      )}`
    );

    for (const custObject of CustomObjects) {
      if (custObject.objects[0] === undefined) continue;
      console.log(`Attempting to import slowly: ${custObject.type} ...`);

      if (slowlyImportCustomizations.includes(custObject.type)) {
        // List all objects
        custObject.objects = (
          await runCommand(CLICommand.ListObjects, `--type ${custObject.type}`)
        ).stdout
          .replace(`\x1B[2K\x1B[1G`, ``)
          .split("\n")
          .filter((entry) => entry.startsWith(custObject.type))
          .map((x) => x.split(":")[1]);

        const collectOutput = custObject.objects.map(
          async (singleCustObject: string) => {
            console.log(`Single import of: ${singleCustObject} ...`);
            return await runCommand(
              CLICommand.ImportObjects,
              `--scriptid ${singleCustObject} ` +
                `--type ${custObject.type} ` +
                `--destinationfolder ${custObject.destination} ` +
                `--excludefiles`
            );
          }
        );

        // Import all collected objects
        // const collectOutput = await runCommand(CLICommand.ImportObjects,
        //     `--scriptid ${custObject.objects.join(" ")} ` +
        //     `--type ${custObject.type} ` +
        //     `--destinationfolder ${custObject.destination} ` +
        //     `--excludefiles`
        // );

        if (
          collectOutput
            .join(" ")
            .includes(
              `The following objects failed with reason "Import custom objects failed.":`
            )
        ) {
          custObject.error = true;
          console.error(`Failed to import: ${custObject.type}`);
        }
      }
    }

    CustomObjects.forEach((custObject) => {
      if (custObject.error) {
        console.log(`Failed to import: ${custObject.type}`);
      }
    });
  }
  return { success: true };
};

export async function runFetch(): Promise<{ success: boolean }> {
  changeDir();
  await saveNetSuiteToken();
  removeFilesAndObjects();
  createObjectFolders();
  await listFiles();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await importFiles();
  await listObjects();
  await importObjects();
  await importObjectsSlowly();
  return { success: true };
}

export async function runPush(): Promise<{ success: boolean }> {
  changeDir();
  await saveNetSuiteToken();
  await deploy();
  return { success: true };
}
