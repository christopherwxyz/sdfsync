import 'module-alias/register'
import 'source-map-support/register'

import prepareFolder from "@/helpers/git";
import runSdf from "@/helpers/sdf";
import * as shell from "shelljs";

export const handler = async () => {
  await prepareFolder();
  runSdf();
  shell.exec("suitecloud file:list --folder /SuiteScripts");
  return {};
};
