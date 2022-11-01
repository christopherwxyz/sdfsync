"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const fs = require("fs/promises");
const env_1 = require("@/helpers/env");
/*
Assumes an ed25519 private key delimited by raw \n newlines
 */
const formatDeployKey = (key) => key.replaceAll(`"`, ``).replaceAll(`\\n`, `\n`);
const getHostConfig = () => `
Host github.com-alias
  Hostname github.com
  IdentityFile=/root/.ssh/ed25519
`;
const setupSsh = async () => {
    const privateKey = formatDeployKey(env_1.default.DEPLOYKEY);
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
async function prepareFolder() {
    await setupSsh();
    await cloneRepo();
}
exports.default = prepareFolder;
//# sourceMappingURL=git.js.map