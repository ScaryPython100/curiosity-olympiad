import { spawn } from "child_process";
import fs from "fs";

export async function captureMobile(url, outputPath, width = 360, height = 780, waitMs = 2500) {
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=0",
    "--user-data-dir=/tmp/chrome_cdp_" + Date.now(),
    "--no-first-run",
    "--disable-gpu"
  ]);

  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout waiting for DevTools")), 6000);
    proc.stderr.on("data", (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[a-f0-9-]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });

  const browserWs = new WebSocket(wsUrl);
  await new Promise((resolve) => {
    browserWs.onopen = resolve;
  });

  let msgId = 1;
  function send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          browserWs.removeEventListener("message", handler);
          resolve(data.result);
        }
      };
      browserWs.addEventListener("message", handler);
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      browserWs.send(JSON.stringify(payload));
    });
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    fitWindow: false
  }, sessionId);

  await send("Page.enable", {}, sessionId);
  await send("Page.navigate", { url }, sessionId);

  await new Promise((r) => setTimeout(r, waitMs));

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height, scale: 1 }
  }, sessionId);

  fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
  console.log(`Saved screenshot to ${outputPath} (${width}x${height})`);

  browserWs.close();
  proc.kill();
}

if (process.argv[2] && process.argv[3]) {
  captureMobile(process.argv[2], process.argv[3])
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
