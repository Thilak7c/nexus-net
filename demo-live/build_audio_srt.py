# Builds the narration track and sentence-level SRT from vo/sNN.mp3 + .vtt, aligned to the scene slots.
import re, subprocess, textwrap
SLOTS = [10, 13, 20, 14, 16, 13, 22, 14, 13, 16, 14, 8]; LEAD = 0.4
starts = [sum(SLOTS[:i]) for i in range(len(SLOTS))]
def t(s): h, m, r = s.split(':'); sec, ms = r.split(','); return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000
def f(x): ms = round(x*1000); return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}"
cues = []
for i, st in enumerate(starts, 1):
    for blk in open(f'vo/s{i:02}.vtt', encoding='utf-8').read().strip().split('\n\n'):
        l = blk.strip().split('\n'); a, b = [t(x.strip()) for x in l[1].split('-->')]; txt = ' '.join(l[2:])
        parts = [txt]
        if len(txt) > 84:  # split a long sentence at the comma nearest its middle
            cs = [m.end() for m in re.finditer(r', ', txt)]; k = min(cs, key=lambda c: abs(c - len(txt)/2)) if cs else len(txt)//2
            parts = [txt[:k].strip(), txt[k:].strip()]
        tot = sum(len(p) for p in parts); cur = a
        for p in parts:
            d = (b - a)*len(p)/tot; cues.append((st + LEAD + cur, st + LEAD + cur + d, p)); cur += d
out = []
for n, (a, b, p) in enumerate(cues, 1):
    b = min(b, cues[n][0] - 0.05) if n < len(cues) else b
    out.append(f"{n}\n{f(a)} --> {f(b)}\n" + '\n'.join(textwrap.wrap(p, 42)) + "\n")
open('nexus-net-live-demo.srt', 'w', encoding='utf-8').write('\n'.join(out))
ins = sum([['-i', f'vo/s{i:02}.mp3'] for i in range(1, 13)], [])
fc = ';'.join(f'[{i}]adelay={round((st+LEAD)*1000)}:all=1[a{i}]' for i, st in enumerate(starts)) + ';' + \
     ''.join(f'[a{i}]' for i in range(12)) + f'amix=inputs=12:normalize=0,apad=whole_dur={sum(SLOTS)}'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-c:a', 'libmp3lame', '-q:a', '2', 'nexus-net-live-narration.mp3'], check=True)
print(len(cues), 'cues,', sum(SLOTS), 's')
