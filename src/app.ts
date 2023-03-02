import "module-alias/register";
import "source-map-support/register";

import { Timer } from "timer-node";
import env from "@/helpers/env";
import { runFetch, runPush } from "@/helpers/sdf";
import * as shell from "shelljs";

void handler();

/**
 * Handles the main logic for running different actions based on the env.ACTION value.
 * @async
 * @function handler
 * @returns {Promise} - An empty object.
 */
export default async function handler(): Promise<{}> {
  const timer = new Timer();
  timer.start();

  shell.exec(`ls -la`);

  // Execute different actions based on the env.ACTION value
  switch (env.ACTION) {
    case "FETCH":
      await runFetch();
      break;
    case "DEPLOY":
      await runPush();
      break;
    default:
      console.log("No action specified.");
      break;
  }
  console.log(`Completed. This run took:  ${timer.format()}`);
  return {};
}
