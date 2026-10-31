// Redo of demo 2: same footage and script, male voice (vo3/), idle frames cut, tight scene timing, small boxed subtitles.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const meta = JSON.parse(readFileSync("clips/meta.json", "utf8"));
const LEAD = 0.25, TAIL = 0.35, MAX_SPEED = 1.3;
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();
const ts = (x) => { const ms = Math.round(x * 1000); return `${String(ms / 3600000 | 0).padStart(2, "0")}:${String(ms / 60000 % 60 | 0).padStart(2, "0")}:${String(ms / 1000 % 60 | 0).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
const ass = (x) => { const cs = Math.round(x * 100); return `${cs / 360000 | 0}:${String(cs / 6000 % 60 | 0).padStart(2, "0")}:${String(cs / 100 % 60 | 0).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`; };
const wrap = (s) => { if (s.length <= 56) return [s]; const mid = s.length / 2; let k = s.lastIndexOf(" ", mid); const k2 = s.indexOf(" ", mid); if (k < 0 || (k2 > 0 && k2 - mid < mid - k)) k = k2; return [s.slice(0, k), s.slice(k + 1)]; };
const NL = String.fromCharCode(92) + "N";
let t = 0; const parts = [], srt = [], events = [], delays = [];
for (let i = 1; i <= 12; i++) {
  const n = String(i).padStart(2, "0"), { video, start, length } = meta[i], card = i === 1 || i === 12;
  const vo = dur(`vo3/s${n}.mp3`);
  // Cut idle frames (page loads, waits) at normal speed.
  const pre = `clips/r3pre${n}.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(start), "-t", String(length), "-i", video, "-an", "-vf",
    (card ? "" : "mpdecimate=max=1,") + "setpts=N/30/TB", "-r", "30", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "14", pre]);
  const L = dur(pre);
  const D = +Math.max(LEAD + vo + TAIL, card ? 0 : L / MAX_SPEED).toFixed(3);
  const speed = L > D ? `setpts=PTS*${(D / L).toFixed(4)},` : "";
  const out = `clips/r3fit${n}.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", pre, "-vf",
    `${speed}fps=30,tpad=stop=-1:stop_mode=clone,trim=duration=${D},setpts=PTS-STARTPTS,` +
    `scale=1728:1080:flags=lanczos,pad=1920:1080:96:0:color=0xF7F4F2,` +
    `fade=t=in:st=0:d=0.25,fade=t=out:st=${(D - 0.25).toFixed(3)}:d=0.25,format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", out]);
  parts.push(`file 'r3fit${n}.mp4'`);
  delays.push(Math.round((t + LEAD) * 1000));
  for (const blk of readFileSync(`vo3/s${n}.vtt`, "utf8").trim().split(/\r?\n\r?\n/)) {
    const l = blk.trim().split(/\r?\n/), [a, b] = l[1].split("-->").map((x) => { const [h, m, r] = x.trim().split(":"); return +h * 3600 + +m * 60 + +r.replace(",", "."); });
    const text = l.slice(2).join(" ");
    srt.push(`${srt.length + 1}\n${ts(t + LEAD + a)} --> ${ts(t + LEAD + b)}\n${wrap(text).join("\n")}\n`);
    events.push(`Dialogue: 0,${ass(t + LEAD + a)},${ass(t + LEAD + b)},Sub,,0,0,0,,${wrap(text).join(NL)}`);
  }
  console.log(`scene ${n}: footage ${L.toFixed(1)}s -> ${D}s (voice ${vo.toFixed(1)}s)`);
  t += D;
}
writeFileSync("clips/r3list.txt", parts.join("\n"));
writeFileSync("nexus-net-live-demo-redo.srt", srt.join("\n"));
writeFileSync("clips/r3.ass", `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n` +
  `Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
  `Style: Sub,Inter,30,&H00FFFFFF,&H00FFFFFF,&H66000000,&H66000000,1,0,0,0,100,100,0,0,3,4,0,2,40,40,54,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events.join("\n")}\n`);
const T = t.toFixed(3);
const ins = delays.flatMap((_, i) => ["-i", `vo3/s${String(i + 1).padStart(2, "0")}.mp3`]);
const mix = delays.map((d, i) => `[${i + 1}:a]adelay=${d}:all=1[v${i}]`).join(";") + ";" + delays.map((_, i) => `[v${i}]`).join("") +
  `amix=inputs=${delays.length}:normalize=0,apad=whole_dur=${T}[aout]`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "clips/r3list.txt", ...ins, "-filter_complex",
  `${mix};[0:v]subtitles=clips/r3.ass[vout]`, "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-t", T, "-movflags", "+faststart", "nexus-net-live-demo-redo.mp4"], { stdio: "inherit" });
console.log("total", T);
