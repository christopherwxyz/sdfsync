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
  const privateKey = formatDeployKey(env.DEPLOYKEY as string);
  const hostConfig = getHostConfig();
  shell.cd("/root");
  shell.mkdir("/root/.ssh");
  await fs.writeFile("/root/.ssh/ed25519", privateKey);
  await fs.writeFile("/root/.ssh/config", hostConfig);
  shell.chmod(600, "/root/.ssh/ed25519");
  shell.exec("ssh -o StrictHostKeyChecking=no git@github.com-alias");
};

const cloneRepo = async () => {
  shell.cd("/tmp");
  shell.exec("git clone git@github.com-alias:constituentvoice/ns.git");
  shell.cd("/tmp/ns");
  shell.exec("ls -al");
};

export default async function prepareFolder() {
    await setupSsh();
    await cloneRepo();
}