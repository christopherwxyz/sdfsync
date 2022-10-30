import 'module-alias/register'
import 'source-map-support/register'

import { prepareFolder, addAllCommitAndShipIt } from "@/helpers/git";
import runSdf from "@/helpers/sdf";
import * as shell from "shelljs";

handler();

export default async function handler() {
  console.log("Running ...");
  await prepareFolder();
  runSdf();
  shell.exec(`git diff`);
  await addAllCommitAndShipIt();
  return {};
}
