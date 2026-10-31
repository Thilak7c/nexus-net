import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
await p.goto(pathToFileURL("kopikarya-record.html").href);
await p.screenshot({ path: "kopikarya-record.png", fullPage: true });
await b.close();
console.log("png ok");
