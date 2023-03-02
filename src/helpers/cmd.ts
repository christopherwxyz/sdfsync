import * as shell from "shelljs";
import { CLICommand } from "./cli-command";

export const runCommand = async (
  command: CLICommand,
  args?: string
): Promise<shell.ShellString> => {
  return shell.exec(`sudo suitecloud ${command} ${args != null ? args : ""}`);
};
