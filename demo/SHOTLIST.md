# Nexus Net demo: shot list (record at 1440x900, 100% zoom)

Audio: `demo/nexus-net-narration.mp3` (2:50, Aria voice, each line starts 0.4s into its scene).
Subtitles: `demo/nexus-net-demo.srt` (22 sentence-level cues, max 42 chars/line). Per-scene clips: `demo/vo/sNN.mp3`.
No music track (none available offline).

## Setup (no live AI anywhere)
1. `npm run dev`. In the browser console on the app, run `localStorage.removeItem('nexus-net-game')` and reload: PayLah Lite is back to 250 XP (Engaged).
2. Use `?demo=1` on /needs and /quests (Gemma is skipped and the response is instant). Keep "Simulation (no AI)" ticked on proof uploads.
3. Files: company record `public/demo-evidence/01-matching-company-record.png`, POC proof `demo-assets/good_poc_loi.png`.
4. Quirk: registering through /register adds a second "PayLah Lite" (0 XP, shows as #11 on the leaderboard). Scroll past it, or record scene 3 last.

| # | Time | Footage (what to click) | Narration |
|---|------|-------------------------|-----------|
| 1 | 0:00–0:12 | Title card: grid #F7F4F2, "Nexus Net" in Rammetto One, blue #405CEE accent, "Startup ASEAN · Outcome Conversion" | Startup ASEAN creates thousands of connections. But how many become real deals? Today, nobody can say. |
| 2 | 0:12–0:25 | `/`: hover the podium and the 40 counter, show the countdown pill, slow scroll to "Pick your startup" | Nexus Net turns those connections into measurable outcomes — as a game. |
| 3 | 0:25–0:45 | "Register your company" → "Use sample company" → "Save and continue" → "Verify company" → pick "Instant simulation (no AI)" → choose the company record → "Verify company" → approved → "View company passport" | Startups register and upload their company documents. Gemma 4 checks the name, registration number and country, and issues a verified company passport. |
| 4 | 0:45–1:00 | `/` → PayLah Lite "Play" → /profile (1s) → Quests: header 250 XP, level track, tier cards | Every startup levels up — from Connected, all the way to Funded. |
| 5 | 1:00–1:16 | `/needs?demo=1`: Indonesia → Basic/outdated → Word of mouth → Works, rough edges → Rough draft → A few leads → "Find my gaps" → "Add as a quest" on one card → Quests, scroll to the card with the Talent badge | Six quick taps, and Gemma turns their gaps into quests — matched with the right talent. |
| 6 | 1:16–1:33 | `/quests?demo=1` → "Generate my quests" → 5 cards (Jakarta connect is first). **Zoom on the cards.** | Gemma 4 writes personalised, cross-border quests — like turning a Jakarta intro into a real pilot. |
| 7 | 1:33–1:56 | POC card (the canned list has Ho Chi Minh City, not Jakarta) → "Submit proof" → good_poc_loi.png → "Submit (simulation)" → Approved, "+150 XP · Level up: POC!" → "Collect +150 XP" → scroll up: 400 XP, Level 3 · POC. **Zoom on the XP jump.** | Upload the proof. Gemma verifies it, XP jumps, and the startup levels up. That's a real outcome. |
| 8 | 1:56–2:10 | `/events` → Calendar → Next (Nov) → "Startup School Malaysia" (17th) → "Subscribe · +50 XP" → close, show booster XP | Founders discover the right ecosystem events — and earn bonus XP for showing up. |
| 9 | 2:10–2:25 | `/leaderboard`: podium, then scroll to PayLah Lite "You" (450 XP) | Startups compete for the top of the season leaderboard. |
| 10 | 2:25–2:42 | `/cradle`: headline stats + funnel, scroll to Outcomes by country / by event. **Zoom on the funnel.** | And Cradle finally sees the funnel — from connection to investment — live, by country and by event. |
| 11 | 2:42–2:50 | Closing card: "Every quest is a measurable outcome." + "Built with Gemma 4 · Hacktoberfest Hack Day KL" | Nexus Net. Every quest is a measurable outcome. Built with Gemma 4. |

On-screen honesty labels you'll see in simulation: "Demo result · image was not checked by AI" (company) and "Simulation: this proof was not checked by AI" (quest proof).

Burn the subtitles in after recording (bottom centre, 6% margin), e.g.:
`ffmpeg -i rec.mp4 -i demo/nexus-net-narration.mp3 -vf "scale=1920:1080,subtitles=demo/nexus-net-demo.srt:force_style='FontName=Inter,Bold=1,FontSize=22,PrimaryColour=&HFFFFFF&,BorderStyle=4,BackColour=&H59000000&,MarginV=65'" -map 0:v -map 1:a -c:v libx264 -r 30 -c:a aac -shortest demo/nexus-net-demo.mp4`
