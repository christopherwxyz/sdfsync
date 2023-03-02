import "module-alias/register";
import "source-map-support/register";

import { Timer } from "timer-node";
import env from "@/helpers/env";
import { runFetch, runPush } from "@/helpers/sdf";
import * as shell from "shelljs";

void handler();

export default async function handler(): Promise<{}> {
  const timer = new Timer();
  timer.start();

  shell.exec(`ls -la`);
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
