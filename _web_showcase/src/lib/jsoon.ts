import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
// make sure bin path is proper even in docker box
const DEFAULT_BIN_PATH = path.join(PROJECT_ROOT, "bin", "jsoon");
const BIN_PATH = process.env.JSOON_BIN || DEFAULT_BIN_PATH;

// opts struct
export interface JSoonOpts {
  upcomingDays?: number;
  limit?: number;
  template?: string;
  offsetMarkers?: Record<string, string>;
}

// output
export interface JSoonResult {
  data: any[];
  logs: string;
  verbose?: boolean;
}

export async function runJSoon(
  input: string | string[],
  options: JSoonOpts = {},
): Promise<JSoonResult> {
  // Basic server-side validation
  const upcomingDays = Math.max(0, options.upcomingDays || 7);
  const limit = Math.max(0, options.limit || 0);
  const template = (options.template || "").trim();
  const offsetMarkers = options.offsetMarkers || {};

  // even if default explicitly ask for output to stdout as per jsoon specs
  const args: string[] = ["-f", "stdout"];
  args.push("-u", upcomingDays.toString());
  args.push("-l", limit.toString());
  if (template) args.push("-t", template);

  // path to temp config file to pass all opts to binary via it rather than flags ( not everything exposed via flags )
  const configPath = path.join(
    os.tmpdir(),
    `jsoon-config-${Math.random().toString(36).slice(2)}.json`,
  );
  args.push("-c", configPath);

  try {
    if (Array.isArray(input)) {
      // if processing urls
      const config = {
        calendars: input,
        upcoming_days: upcomingDays,
        events_limit: limit,
        date_template: template,
      };

      // write opts to tmp file and exec with those
      fs.writeFileSync(configPath, JSON.stringify(config));
      return await executeBinary([...args, "-c", configPath]);
    } else {
      // else no calendars key - trigger pipe read
      const config = {
        upcoming_days: upcomingDays,
        events_limit: limit,
        date_template: template,
        offset_markers: offsetMarkers,
      };

      // write opts to tmp file and exec with those
      fs.writeFileSync(configPath, JSON.stringify(config));
      return await executeBinary(args, input);
    }
  } finally {
    try {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    } catch (_e) {
      // Ignore
    }
  }
}

async function executeBinary(
  args: string[],
  stdinInput?: string,
): Promise<JSoonResult> {
  return new Promise((resolve, reject) => {
    // check if binary exists
    if (!fs.existsSync(BIN_PATH)) {
      return reject(new Error(`Binary not found at ${BIN_PATH}`));
    }

    // if no stdin 'ignore' to redirect to /dev/null
    // ensures binary doesn't detect pipe and wait for not coming input if this is't expected in docker env
    const stdio: ("ignore" | "pipe")[] = [
      stdinInput ? "pipe" : "ignore",
      "pipe",
      "pipe",
    ];

    const child = spawn(BIN_PATH, args, {
      cwd: PROJECT_ROOT,
      stdio,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        const err = stderr.trim() || `Binary exited with code ${code}`;
        console.error(`[JSOON Wrapper] Fatal Error: ${err}`);
        return reject(new Error(err));
      }

      let data = [];
      const trimmedStdout = stdout.trim();
      if (trimmedStdout && trimmedStdout !== "null") {
        try {
          const start = trimmedStdout.indexOf("[");
          const end = trimmedStdout.lastIndexOf("]");
          if (start !== -1 && end !== -1 && end > start) {
            data = JSON.parse(trimmedStdout.substring(start, end + 1));
          } else {
            data = JSON.parse(trimmedStdout);
          }
        } catch (e: any) {
          console.error(
            `[JSOON Wrapper] Parse Error. Output: ${trimmedStdout}`,
          );
          if (!stderr)
            return reject(
              new Error(`Failed to parse binary output: ${e.message}`),
            );
        }
      }

      resolve({ data, logs: stderr.trim() });
    });

    if (stdinInput && child.stdin) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }
  });
}
