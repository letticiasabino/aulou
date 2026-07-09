import { spawn, spawnSync } from "node:child_process";

const port = process.env.PLAYWRIGHT_PORT ?? "3107";
const baseURL = `http://127.0.0.1:${port}`;

let serverLog = "";

const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

server.stdout.on("data", (chunk) => {
  serverLog += chunk.toString();
});

server.stderr.on("data", (chunk) => {
  serverLog += chunk.toString();
});

function stopServer() {
  if (!server.pid || server.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  server.kill("SIGTERM");
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next server exited early.\n${serverLog}`);
    }

    try {
      const response = await fetch(baseURL, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Next server did not become ready at ${baseURL}.\n${serverLog}`);
}

function runPlaywright() {
  return new Promise((resolve) => {
    const testProcess = spawn(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test"],
      {
        env: {
          ...process.env,
          PLAYWRIGHT_PORT: port,
        },
        stdio: "inherit",
        windowsHide: true,
      },
    );

    testProcess.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });
}

try {
  await waitForServer();
  const code = await runPlaywright();
  stopServer();
  process.exit(code);
} catch (error) {
  stopServer();
  console.error(error);
  process.exit(1);
}
