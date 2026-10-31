// v2: continuous narration (vo2/), idle frames removed, slow zoom, 0.2s fades, small boxed subtitles, music bed.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const meta = JSON.parse(readFileSync("clips/meta.json", "utf8"));
const src = (n) => ({ video: meta[n].video, start: meta[n].start, card: n === 1 || n === 12 });
const role = (r) => ({ video: `clips/role-${r}.webm`, start: 0.3, card: false });
const SCENES = [src(1), src(2), src(3), src(4), src(5), src(6), src(7), src(8), role("Talent"), role("Investor"), src(9), src(10), src(11), src(12)];
const GAP = 0.15, FPS = 30;
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();
const ts = (x) => { const ms = Math.round(x * 1000); return `${String(ms / 3600000 | 0).padStart(2, "0")}:${String(ms / 60000 % 60 | 0).padStart(2, "0")}:${String(ms / 1000 % 60 | 0).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
const ass = (x) => { const cs = Math.round(x * 100); return `${cs / 360000 | 0}:${String(cs / 6000 % 60 | 0).padStart(2, "0")}:${String(cs / 100 % 60 | 0).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`; };
const wrap = (s) => { if (s.length <= 52) return [s]; const mid = s.length / 2; let k = s.lastIndexOf(" ", mid); const k2 = s.indexOf(" ", mid); if (k < 0 || (k2 > 0 && k2 - mid < mid - k)) k = k2; return [s.slice(0, k), s.slice(k + 1)]; };
let t = 0; const parts = [], srt = [], events = [], delays = [];
SCENES.forEach((sc, i) => {
  const n = String(i + 1).padStart(2, "0"), vo = `vo2/s${n}.mp3`, D = +(dur(vo) + GAP).toFixed(3);
  delays.push(Math.round(t * 1000));
  for (const blk of readFileSync(`vo2/s${n}.vtt`, "utf8").trim().split(/\r?\n\r?\n/)) {
    const l = blk.trim().split(/\r?\n/), [a, b] = l[1].split("-->").map((x) => { const [h, m, r] = x.trim().split(":"); return +h * 3600 + +m * 60 + +r.replace(",", "."); });
    const text = l.slice(2).join(" ");
    srt.push(`${srt.length + 1}\n${ts(t + a)} --> ${ts(t + b)}\n${wrap(text).join("\n")}\n`);
    events.push(`Dialogue: 0,${ass(t + a)},${ass(t + b)},Sub,,0,0,0,,${wrap(text).join(String.fromCharCode(92) + "N")}`);
  }
  // Drop idle/duplicate frames (loading, waiting), then speed up or hold to fill D, with a slow push-in.
  const pre = `clips/v2pre${n}.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(sc.start), "-i", sc.video, "-an", "-vf",
    (sc.card ? "" : "mpdecimate=hi=200:lo=100:frac=0.5,") + "setpts=N/30/TB", "-r", "30", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "16", pre]);
  const L = dur(pre), speed = L > D ? `setpts=PTS*${(D / L).toFixed(4)},` : "";
  const out = `clips/v2fit${n}.mp4`, frames = Math.round(D * FPS);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", pre, "-vf",
    `${speed}fps=30,tpad=stop=-1:stop_mode=clone,trim=duration=${D},setpts=PTS-STARTPTS,` +
    `scale=1728:1080,pad=1920:1080:96:0:color=0xF7F4F2,` +
    `zoompan=z='1+0.07*on/${frames}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=30,` +
    `fade=t=in:st=0:d=0.2,fade=t=out:st=${(D - 0.2).toFixed(3)}:d=0.2,format=yuv420p`,
    "-frames:v", String(frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", out]);
  parts.push(`file 'v2fit${n}.mp4'`);
  t += D;
});
writeFileSync("clips/v2list.txt", parts.join("\n"));
writeFileSync("nexus-net-live-demo-v2.srt", srt.join("\n"));
writeFileSync("clips/v2.ass", `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n` +
  `Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
  `Style: Sub,Inter,28,&H00FFFFFF,&H00FFFFFF,&H73000000,&H73000000,1,0,0,0,100,100,0,0,3,6,0,2,40,40,54,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events.join("\n")}\n`);
// Voice track (continuous), plus a synthesized 120 bpm music bed ducked under it.
const T = t.toFixed(3);
const ins = SCENES.flatMap((_, i) => ["-i", `vo2/s${String(i + 1).padStart(2, "0")}.mp3`]);
const vmix = delays.map((d, i) => `[${i}:a]adelay=${d}:all=1[v${i}]`).join(";") + ";" + delays.map((_, i) => `[v${i}]`).join("") +
  `amix=inputs=${delays.length}:normalize=0,apad=whole_dur=${T}[voice]`;
const music = `aevalsrc='0.5*sin(2*PI*55*t)*exp(-12*mod(t,0.5))+0.12*sin(2*PI*(220+110*floor(mod(t*2,4)))*t)*exp(-6*mod(t,0.25))+0.05*sin(2*PI*330*t)*(0.5+0.5*sin(2*PI*0.5*t))':s=44100:d=${T},volume=0.25,afade=t=in:d=1,afade=t=out:st=${(t - 2).toFixed(2)}:d=2[mus]`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "clips/v2list.txt", ...ins.map(String), "-filter_complex",
  `${vmix.replace(/\[(\d+):a\]/g, (_, k) => `[${+k + 1}:a]`)};${music};[voice]asplit[vk][vsc];[mus][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=300[duck];[vk][duck]amix=inputs=2:normalize=0:duration=first[aout];[0:v]subtitles=clips/v2.ass[vout]`,
  "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-t", T, "-movflags", "+faststart", "nexus-net-live-demo-v2.mp4"], { stdio: "inherit" });
console.log("total", T);
