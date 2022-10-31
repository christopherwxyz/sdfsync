import 'module-alias/register'
import 'source-map-support/register'

import { prepareRepo, addAllCommitAndShipIt } from "@/helpers/git";
import runSdf from "@/helpers/sdf";
import * as shell from "shelljs";

handler();

export default async function handler() {
  console.log("Running ...");
  await prepareRepo();
  await runSdf();
  // shell.exec(`git diff`);
  await addAllCommitAndShipIt();
  console.log("Completed.");
  return {};
}
