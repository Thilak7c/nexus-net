// Fits each recorded clip to its narration slot, concatenates, adds narration and burns in subtitles.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const meta = JSON.parse(readFileSync("clips/meta.json", "utf8"));
const parts = [];
for (const n of Object.keys(meta).sort((a, b) => a - b)) {
  const { video, start, length, slot } = meta[n];
  const speed = length > slot ? `setpts=(PTS-STARTPTS)*${(slot / length).toFixed(4)},` : "setpts=PTS-STARTPTS,";
  const out = `clips/fit${String(n).padStart(2, "0")}.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(start), "-i", video, "-an", "-vf",
    `${speed}fps=30,tpad=stop=-1:stop_mode=clone,trim=duration=${slot},setpts=PTS-STARTPTS,` +
    `scale=1728:1080:flags=lanczos,pad=1920:1080:96:0:color=0xF7F4F2,` +
    `fade=t=in:st=0:d=0.3,fade=t=out:st=${slot - 0.3}:d=0.3,format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", out]);
  parts.push(`file '${out.replace("clips/", "")}'`);
}
writeFileSync("clips/list.txt", parts.join("\n"));
const style = "FontName=Inter,Bold=1,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H59000000,BackColour=&H59000000,BorderStyle=3,Outline=10,Shadow=0,MarginV=17,Alignment=2";
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "clips/list.txt", "-i", "nexus-net-live-narration.mp3",
  "-vf", `subtitles=nexus-net-live-demo.srt:force_style='${style}'`,
  "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "nexus-net-live-demo.mp4"], { stdio: "inherit" });
console.log("done");
