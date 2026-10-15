# Recorta os objetos das fotos do Met (fundo cinza liso) gerando PNG com
# transparência: distância de cor ao fundo (amostrado nas bordas) + preenchimento
# a partir das bordas (só o fundo conectado à borda some) + borda suavizada.
# Uso: python3 -I scripts/recortar-fotos.py public/img/<foto>.jpg ... (saída: public/img/recorte-<foto>.png)
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

for p in sys.argv[1:]:
    im = Image.open(p).convert("RGB")
    im.thumbnail((1800, 1800))
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    borda = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3), a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    fundo = np.median(borda, axis=0)
    # o fundo do Met tem leve gradiente: tolerância relativa ao desvio da borda
    dist = np.sqrt(((a - fundo) ** 2).sum(-1))
    tol = min(40.0, max(18.0, np.percentile(np.sqrt(((borda - fundo) ** 2).sum(-1)), 99) * 1.6))
    candidato = dist < tol
    rotulos, _ = ndimage.label(candidato)
    na_borda = np.unique(np.concatenate([rotulos[0], rotulos[-1], rotulos[:, 0], rotulos[:, -1]]))
    fundo_mask = np.isin(rotulos, na_borda[na_borda > 0])
    obj = ~fundo_mask
    obj = ndimage.binary_opening(obj, iterations=2)
    obj = ndimage.binary_fill_holes(obj)
    # mantém só componentes grandes (descarta poeira)
    lab, n = ndimage.label(obj)
    tam = ndimage.sum(obj, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, t in enumerate(tam) if t > 0.01 * h * w])
    alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    out = im.copy(); out.putalpha(alpha)
    bb = alpha.getbbox(); out = out.crop(bb)
    nome = p.rsplit("/", 1)[0] + "/recorte-" + p.rsplit("/", 1)[1].rsplit(".", 1)[0] + ".png"
    out.save(nome, optimize=True)
    print(nome, out.size, f"fundo={fundo.round()} tol={tol:.0f} objetos={int((tam > 0.01*h*w).sum())}")
