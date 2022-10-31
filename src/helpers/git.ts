import * as shell from "shelljs";
import * as fs from "fs/promises";
import env from "@/helpers/env";

/*
Assumes an ed25519 private key delimited by raw \n newlines
 */
const formatDeployKey = (key: string) =>
  key.replaceAll(`"`, ``).replaceAll(`\\n`, `\n`);

const getHostConfig = () => `
Host github.com-alias
  Hostname github.com
  IdentityFile=/root/.ssh/ed25519
`;

const setupSsh = async () => {
  const privateKey = formatDeployKey(env.DEPLOYKEY);
  const hostConfig = getHostConfig();
  shell.cd("/root");
  shell.mkdir("/root/.ssh");
  await fs.writeFile("/root/.ssh/ed25519", privateKey);
  await fs.writeFile("/root/.ssh/config", hostConfig);
  shell.chmod(600, "/root/.ssh/ed25519");
  shell.exec("ssh -o StrictHostKeyChecking=no git@github.com-alias");
  shell.exec(`git config --global user.email "ssync@ssync.com" && git config --global user.name "ssync"`)
};

const cloneRepo = async () => {
  shell.cd("/tmp");
  shell.exec(`git clone ${env.GITURL}`);
  shell.cd("/tmp/ns");
};

export async function prepareRepo() {
  await setupSsh();
  await cloneRepo();
  await selectBranch();
  await changeDir();
}

export async function addAllCommitAndShipIt() {
  await addNewChanges();
  await commitChanges();
  await shipIt();
}
function changeDir() {
  console.log(`Starting directory: ${process.cwd()}`);
  try {
    process.chdir(`/tmp/ns/packages/${env.NSENV}`);
    console.log(`Package directory: ${process.cwd()}`);
  }
  catch (err) {
    console.log('chdir: ' + err);
  }
}
function addNewChanges() {
  shell.exec("git add -A");
}

function commitChanges() {
  shell.exec(`git commit -m "${env.NSENV} - ${(new Date()).toISOString()}"`);
}

function shipIt() {
  shell.exec(`git push --force`);
}

function selectBranch() {
  shell.exec(`git checkout -b "${env.NSENV}/${(new Date()).toISOString().split("T")[0]}"`);
  shell.exec(`git push --set-upstream origin ${env.NSENV}/${(new Date()).toISOString().split("T")[0]}`)
}

