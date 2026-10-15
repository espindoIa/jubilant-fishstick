# Verifica que a voz fica sempre acima da trilha: compara o nível da voz e da
# trilha (já com ganho e ducking do mix) em janelas de 100 ms, só onde a voz soa.
# (Pausas entre frases, em que só a trilha soa, ficam de fora.)
# Os dois sinais passam pela ponderação K (filtros de pré-processamento do
# BS.1770: shelf de agudos +4 dB e passa-altas ~38 Hz), como no LUFS.
# Uso: python3 -I scripts/voz-acima.py out/mix/voz.wav out/mix/trilha-no-mix.wav
import json, subprocess, sys
import numpy as np

KW = "highshelf=f=1500:g=4,highpass=f=38:poles=2"
def nivel(path, win=0.1, sr=48000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", KW, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32); n = int(win * sr)
    return np.array([10 * np.log10(np.mean(x[i:i + n] ** 2) + 1e-12) - 0.691 for i in range(0, len(x) - n, n)])

v, m = nivel(sys.argv[1]), nivel(sys.argv[2])
k = min(len(v), len(m)); v, m = v[:k], m[:k]
fala = v > (np.max(v) - 25)  # janelas de 100 ms em que a voz soa de fato (até 25 dB abaixo do pico)
dif = v[fala] - m[fala]
idx = np.where(fala)[0]
piores = sorted(zip(dif, idx), key=lambda t: t[0])[:5]
out = {"janelas_com_fala": int(fala.sum()), "diferenca_min_db": round(float(dif.min()), 1), "diferenca_p5_db": round(float(np.percentile(dif, 5)), 1), "diferenca_mediana_db": round(float(np.median(dif)), 1), "voz_sempre_acima": bool((dif > 0).all()), "piores_janelas_s": [[round(i * 0.1, 1), round(float(d), 1)] for d, i in piores]}
print(json.dumps(out, ensure_ascii=False))
