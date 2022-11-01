"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
require("source-map-support/register");
const git_1 = require("@/helpers/git");
const sdf_1 = require("@/helpers/sdf");
const shell = require("shelljs");
handler();
async function handler() {
    console.log("Running ...");
    await (0, git_1.default)();
    (0, sdf_1.default)();
    shell.exec("suitecloud file:list --folder /SuiteScripts");
    return {};
}
exports.default = handler;
//# sourceMappingURL=app.js.map