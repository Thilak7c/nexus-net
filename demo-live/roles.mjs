import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { renameSync } from "node:fs";
const b = await chromium.launch({ slowMo: 120 });
for (const role of ["Talent", "Investor"]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: "clips", size: { width: 1440, height: 900 } }, storageState: "clips/state.json" });
  const p = await c.newPage();
  await p.goto("https://nexus-net-ebon.vercel.app/quests?demo=1", { waitUntil: "networkidle" });
  const t0 = Date.now();
  await p.getByRole("button", { name: /Viewing as/ }).first().click();
  await p.waitForTimeout(500);
  await p.getByText(role, { exact: true }).first().click();
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForTimeout(3500);
  await p.mouse.wheel(0, 450); await p.waitForTimeout(3000);
  await p.mouse.wheel(0, 450); await p.waitForTimeout(3000);
  console.log(role, p.url());
  await c.close();
  renameSync(await p.video().path(), `clips/role-${role}.webm`);
}
await b.close();
