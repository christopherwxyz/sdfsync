"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomObject_1 = require("@/models/CustomObject");
const process_1 = require("process");
const shell = require("shelljs");
const setupProject = () => {
    throw new Error("Function not implemented.");
};
const saveNetSuiteToken = () => {
    const commandList = [
        "suitecloud",
        "account:savetoken",
        "--account",
        process_1.env.ACCOUNT,
        "--authid",
        process_1.env.AUTHID,
        "--tokenid",
        process_1.env.TOKENID,
        "--tokensecret",
        process_1.env.TOKENSECRET,
        "--url",
        process_1.env.URL,
    ];
    const command = commandList.join(" ");
    shell.exec(command);
};
const listObjects = () => {
    CustomObject_1.CustomObjects.forEach((custObject) => {
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
function runSdf() {
    // setupProject();
    saveNetSuiteToken();
    // listFiles();
    // importFiles();
    listObjects();
    // importObjects();
}
exports.default = runSdf;
//# sourceMappingURL=sdf.js.map