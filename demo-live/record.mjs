// Records the Nexus Net demo, one clip per scene, with Playwright.
// Records against the live deploy:  node demo-live/record.mjs [sceneNumbers...]
import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = "https://nexus-net-ebon.vercel.app";
const SIZE = { width: 1440, height: 900 };
// Scene slot lengths (s): must match nexus-net-demo.srt / nexus-net-narration.mp3.
const SLOTS = [10, 13, 20, 14, 16, 13, 22, 14, 13, 16, 14, 8];
const CLIPS = resolve(DIR, "clips");
mkdirSync(CLIPS, { recursive: true });

const CURSOR = `
  addEventListener("DOMContentLoaded", () => {
    const d = document.createElement("div");
    d.id = "__cur";
    d.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;" +
      "background:rgba(64,92,238,.55);border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35);pointer-events:none;" +
      "z-index:2147483647;transition:transform .12s;transform:translate(var(--x,720px),var(--y,450px))";
    document.body.appendChild(d);
    addEventListener("mousemove", (e) => { d.style.setProperty("--x", e.clientX + "px"); d.style.setProperty("--y", e.clientY + "px"); }, true);
    addEventListener("mousedown", () => { d.style.scale = "0.7"; }, true);
    addEventListener("mouseup", () => { d.style.scale = "1"; }, true);
  });`;

const card = (title, sub) => `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Rammetto+One&family=Inter:wght@500;600&display=swap" rel="stylesheet">
<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;
background:#F7F4F2;background-image:linear-gradient(#e9e4e0 1px,transparent 1px),linear-gradient(90deg,#e9e4e0 1px,transparent 1px);
background-size:24px 24px;font-family:Inter,sans-serif;color:#222}
h1{font-family:'Rammetto One';font-size:${title.length > 20 ? 56 : 110}px;margin:0;text-align:center;max-width:1200px;opacity:0;transform:translateY(16px);animation:in .8s .3s forwards}
h1 span{color:#405CEE}.bar{width:120px;height:10px;border-radius:10px;background:linear-gradient(90deg,#FFD44E,#FF8D22 39%,#FB88FF 73%,#55FFDA);opacity:0;animation:in .8s .7s forwards}
p{font-size:30px;font-weight:600;color:#405CEE;margin:0;opacity:0;animation:in .8s 1s forwards}
@keyframes in{to{opacity:1;transform:none}}</style></head>
<body><h1>${title}</h1><div class="bar"></div><p>${sub}</p></body></html>`;

const pause = (page, ms) => page.waitForTimeout(ms);

async function moveTo(page, locator) {
  const l = locator.first();
  await l.scrollIntoViewIfNeeded();
  const b = await l.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 18 });
  await pause(page, 200);
  return b;
}
async function click(page, locator) {
  const b = await moveTo(page, locator);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
async function scroll(page, dy, ms = 1200) {
  const steps = 20;
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await pause(page, ms / steps); }
}
const btn = (page, name, opts = {}) => page.getByRole("button", { name, ...opts });
// The clickable control named `label` inside the card that also contains `text`.
const inCard = (page, text, label) =>
  page.locator(`xpath=//*[contains(normalize-space(.),"${text}")][.//*[self::button or self::a][contains(.,"${label}")]][not(.//*[contains(normalize-space(.),"${text}")][.//*[self::button or self::a][contains(.,"${label}")]])]//*[self::button or self::a][contains(.,"${label}")]`);

const scenes = {
  1: async (page) => { await page.setContent(card('Nexus <span>Net</span>', "Startup ASEAN · Outcome Conversion")); },
  2: async (page) => {
    await page.goto(`${BASE}/?demo=1`);
    return async () => {
      await page.mouse.move(720, 470, { steps: 25 });
      await pause(page, 2500);
      await moveTo(page, page.getByText(/season ends in/));
      await pause(page, 2000);
      await scroll(page, 620, 2000);
    };
  },
  3: async (page) => {
    await page.goto(`${BASE}/register?demo=1`);
    return async () => {
      await click(page, btn(page, "Use sample company"));
      await pause(page, 400);
      const fill = async (ph, v) => { const f = page.getByPlaceholder(ph); await click(page, f); await f.fill(""); await f.pressSequentially(v, { delay: 25 }); };
      await fill("Company name as registered", "KopiKarya Labs");
      await fill("Business registration number", "MY-DEMO-2026-007");
      await fill("https://yourcompany.com", "https://kopikarya.example/");
      await fill("e.g. Fintech", "F&B tech");
      const desc = page.locator("textarea").first();
      await desc.fill("Smart ordering and roasting tools for Malaysian kopitiams.");
      await click(page, btn(page, /Save and continue/));
      await page.waitForURL(/profile/);
      await pause(page, 600);
      await click(page, btn(page, /Verify company/));
      await click(page, page.getByLabel("Instant simulation (no AI)"));
      await page.locator('input[type="file"]').setInputFiles(resolve(DIR, "kopikarya-record.png"));
      await pause(page, 700);
      await click(page, btn(page, /^Verify company$/));
      await click(page, btn(page, /View company passport/));
      await pause(page, 1500);
    };
  },
  4: async (page) => {
    await page.goto(`${BASE}/?demo=1`);
    return async () => {
      await scroll(page, 620, 900);
      await click(page, inCard(page, "PayLah Lite", "Play"));
      await page.waitForURL(/profile/);
      await pause(page, 1200);
      await click(page, page.getByRole("link", { name: "Quests", exact: true }));
      await page.waitForURL(/quests/);
      await pause(page, 2500);
      await scroll(page, 380, 1200);
    };
  },
  5: async (page) => {
    await page.goto(`${BASE}/needs?demo=1`);
    return async () => {
      for (const a of ["Indonesia", "Basic / outdated", "Word of mouth only", "Works, but rough edges", "A rough draft", "A few leads"]) {
        await click(page, btn(page, a));
        await pause(page, 250);
      }
      await click(page, btn(page, /Find my gaps/));
      await btn(page, /Add as a quest/).first().waitFor();
      await pause(page, 1200);
      await click(page, btn(page, /Add as a quest/).first());
      await pause(page, 600);
      await click(page, page.getByRole("link", { name: "Quests", exact: true }));
      await page.waitForURL(/quests/);
      await pause(page, 500);
      await moveTo(page, page.getByText(/Talent/).first());
      await pause(page, 1500);
    };
  },
  6: async (page) => {
    await page.goto(`${BASE}/quests?demo=1`);
    return async () => {
      await pause(page, 800);
      await click(page, btn(page, /Generate my quests|Regenerate/));
      await page.getByText("Ho Chi Minh").first().waitFor();
      await pause(page, 800);
      await scroll(page, 450, 2500);
      await pause(page, 1500);
      await scroll(page, 350, 2000);
    };
  },
  7: async (page) => {
    await page.goto(`${BASE}/quests?demo=1`);
    return async () => {
      await pause(page, 600);
      await click(page, inCard(page, "Ho Chi Minh", "Submit proof"));
      await pause(page, 600);
      const sim = page.getByRole("checkbox");
      if (!(await sim.isChecked())) await click(page, sim);
      await page.locator('input[type="file"]').setInputFiles(resolve(DIR, "good_poc_loi.png"));
      await pause(page, 1200);
      await click(page, btn(page, /Submit \(simulation\)/));
      await btn(page, /Collect/).waitFor();
      await pause(page, 3500);
      await click(page, btn(page, /Collect/));
      await pause(page, 800);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "smooth" }));
      await pause(page, 1500);
      await page.mouse.move(400, 200, { steps: 20 });
      await pause(page, 2500);
    };
  },
  8: async (page) => {
    await page.goto(`${BASE}/events?demo=1`);
    await page.getByText(/Loading events/).waitFor({ state: "detached", timeout: 30000 }).catch(() => {});
    return async () => {
      // The live build opens on the month calendar; older builds need the Calendar toggle.
      if (await btn(page, /Calendar/).count()) await click(page, btn(page, /Calendar/));
      await pause(page, 500);
      await click(page, btn(page, /Next/));
      await pause(page, 700);
      await click(page, page.getByText(/Startup School Malay/).first());
      await pause(page, 1200);
      await page.keyboard.press("Escape");
      await pause(page, 400);
      await click(page, inCard(page, "A Spooky Social", "Subscribe"));
      await pause(page, 1500);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "smooth" }));
      await pause(page, 800);
      await moveTo(page, page.getByText(/subscribed/i).first());
      await pause(page, 2000);
    };
  },
  9: async (page) => {
    await page.goto(`${BASE}/leaderboard?demo=1`);
    return async () => {
      await page.mouse.move(720, 400, { steps: 20 });
      await pause(page, 3000);
      await scroll(page, 450, 2000);
      await moveTo(page, page.getByText("You", { exact: true }).first());
      await pause(page, 2500);
    };
  },
  10: async (page) => {
    await page.goto(`${BASE}/map?demo=1`);
    return async () => {
      await page.mouse.move(600, 450, { steps: 20 });
      await pause(page, 2500);
      await click(page, btn(page, "POC", { exact: true }));
      await pause(page, 2000);
      await click(page, btn(page, "All", { exact: true }));
      await pause(page, 800);
      await click(page, btn(page, "PayLah Lite"));
      await pause(page, 3000);
      await click(page, btn(page, "Reset view"));
      await pause(page, 1500);
    };
  },
  11: async (page) => {
    await page.goto(`${BASE}/cradle?demo=1`);
    return async () => {
      await page.mouse.move(720, 500, { steps: 20 });
      await pause(page, 4000);
      await scroll(page, 500, 2500);
      await pause(page, 2500);
      await scroll(page, 450, 2500);
      await pause(page, 2000);
    };
  },
  12: async (page) => { await page.setContent(card('Every quest is a measurable outcome.', "Built with Gemma 4 · Hacktoberfest Hack Day KL")); },
};

const only = process.argv.slice(2).map(Number);
const metaPath = resolve(CLIPS, "meta.json");
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
const statePath = resolve(CLIPS, "state.json");
const browser = await chromium.launch({ slowMo: 150 });

for (let n = 1; n <= 12; n++) {
  if (only.length && !only.includes(n)) continue;
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: CLIPS, size: SIZE },
    storageState: n > 1 && existsSync(statePath) ? statePath : undefined,
  });
  await context.addInitScript(CURSOR);
  const page = await context.newPage();
  const t0 = Date.now();
  const act = await scenes[n](page);
  await page.waitForLoadState("networkidle").catch(() => {});
  await pause(page, 400);
  const ready = Date.now();
  if (act) await act();
  const left = SLOTS[n - 1] * 1000 - (Date.now() - ready);
  if (left > 0) await pause(page, left);
  const end = Date.now();
  await context.storageState({ path: statePath });
  await context.close();
  const video = await page.video().path();
  meta[n] = { video, start: (ready - t0) / 1000, length: (end - ready) / 1000, slot: SLOTS[n - 1] };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`scene ${n}: ${meta[n].length.toFixed(1)}s (slot ${SLOTS[n - 1]}s)`);
}
await browser.close();
