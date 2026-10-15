# Verificação externa das linhas cuneiformes reais (src/data/linhas-cuneiformes.json):
# para cada valor transliterado, procura na lista de sinais do ORACC (OSL, osl.asl)
# o sinal que tem esse valor (@v) e confere que os caracteres (@ucun) e o nome
# Unicode (@uname) são exatamente os que o vídeo desenha. Também confere que a
# sequência de valores reproduz o ATF da fonte (CDLI).
# Uso: python3 -I scripts/verificar-cuneiforme.py <caminho/osl.asl>
import json, re, sys, unicodedata

osl = open(sys.argv[1], encoding="utf-8").read().split("\n")
por_valor = {}
sinal = uname = ucun = None
for ln in osl:
    if ln.startswith("@sign") or ln.startswith("@form"):
        sinal = ln.split(None, 1)[1].strip() if len(ln.split(None, 1)) > 1 else None; uname = ucun = None
    elif ln.startswith("@uname"):
        uname = (ln.split(None, 1) + [""])[1].strip()
    elif ln.startswith("@ucun"):
        ucun = (ln.split(None, 1) + [""])[1].strip()
    elif ln.startswith("@v") and sinal:
        v = (ln.split(None, 1) + [""])[1].strip().rstrip("?")
        por_valor.setdefault(v, []).append((sinal, uname, ucun))
    elif ln.startswith("@end sign"):
        sinal = None

SUB = str.maketrans("₀₁₂₃₄₅₆₇₈₉", "0123456789")
dados = json.load(open("src/data/linhas-cuneiformes.json"))
falhas, total = [], 0
for l in dados["linhas"]:
    print(f"\n[{l['id']}] {l['museu']} | CDLI {l['cdli']} | {l['linha']}\n  ATF: {l['atf']}")
    valores = []
    for sg in l["sinais"]:
        v = sg["valor"]; cps = (sg.get("codepoint") or "").split()
        if not cps:
            print(f"  · {v:8s} sem código Unicode ({sg['sinal']}) — desenhado à mão, ver fontes.md"); valores.append(v); continue
        chars = "".join(chr(int(c[2:], 16)) for c in cps)
        nomes = [unicodedata.name(c) for c in chars]
        chave = "d" if v == "ᵈ" else v
        cands = por_valor.get(chave, [])
        # sinal simples: @ucun e @uname batem; sinal composto (|A.B.C|): @ucun = sequência dos componentes
        ok = any(uc == chars and (u or (sn.startswith("|") and len(chars) > 1)) for sn, u, uc in cands)
        total += 1
        alvo = [c for c in cands if c[2] == chars]
        print(f"  {'✓' if ok else '✗'} {v:8s} {' + '.join(cps):24s} {'; '.join(nomes)}  ← OSL: {alvo[0][0] if alvo else [c[0] for c in cands][:4]}")
        if not ok: falhas.append((l["id"], v, cps, cands[:3]))
        valores.append(v)
    # reconstrói a transliteração e compara com o ATF (normalizado)
    norm = lambda t: re.sub(r"[\s\-.,=]+", " ", t.replace("%a", " ").replace("{d}", "d ").replace("ᵈ", "d ").replace("sz", "š")).translate(SUB).lower().strip()
    atf_txt = re.sub(r"^\d+\.\s*", "", l["atf"], flags=re.M).replace("\n", " ")
    a, b = norm(" ".join(valores)), norm(atf_txt)
    print(f"  sequência: {'✓' if a.split() == b.split() else '✗'}  [{a}] × ATF [{b}]")
    if a.split() != b.split(): falhas.append((l["id"], "sequência", a, b))
print(f"\n{total} sinais conferidos; falhas: {len(falhas)}")
for f in falhas: print("  ✗", f)
sys.exit(1 if falhas else 0)
