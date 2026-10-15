# Verificação externa do mapa:
# 1) coordenadas dos sítios (Pleiades, sitios.json) × Wikidata (P625): erro < 0,1°;
# 2) os rios/costa usados vêm dos arquivos do Natural Earth (nomes e contagem).
# Uso: python3 -I scripts/verificar-mapa.py
import json, math, time, urllib.error, urllib.request, urllib.parse

BUSCA = {"Uruk": "Uruk", "Ur": "Ur", "Nippur": "Nippur", "Eridu": "Eridu", "Lagash": "Lagash", "Girsu": "Girsu", "Nínive": "Nineveh ancient city", "Babilônia": "Babylon"}
FIXOS = {"Ur": "Q5699", "Nínive": "Q5680"}  # buscas ambíguas; IDs conferidos pelo rótulo (Q5680 = Nineveh, citado na página da Wikipédia)
UA = {"User-Agent": "tiktok-sumerio-verificacao/1.0 (projeto educativo)"}
def get(u):
    # respeita o limite do Wikidata: pausa entre pedidos e nova tentativa em 429
    for tentativa in range(6):
        time.sleep(1.5)
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(10 * (tentativa + 1))
    raise RuntimeError("Wikidata recusou (429) repetidamente")
def busca(nome):
    # primeiro resultado da busca do Wikidata que tenha coordenada (P625) na Mesopotâmia
    u = "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbsearchentities", "search": nome, "language": "en", "format": "json", "limit": 10})
    for e in get(u)["search"][:6]:
        if any(w in e.get("description", "").lower() for w in ("governorate", "province", "district", "region", "portion")):
            continue  # entidade administrativa moderna, não o sítio
        try:
            rot, lon, lat = wd(e["id"])
        except Exception:
            continue
        if 38 < lon < 52 and 27 < lat < 38.5:
            return e["id"], rot, e.get("description", ""), lon, lat
    raise RuntimeError(f"sem resultado com coordenada para {nome}")
def wd(q):
    d = get(f"https://www.wikidata.org/wiki/Special:EntityData/{q}.json")["entities"][q]
    c = d["claims"]["P625"][0]["mainsnak"]["datavalue"]["value"]
    return d["labels"].get("en", {}).get("value"), c["longitude"], c["latitude"]
sitios = json.load(open("src/data/geo/sitios.json"))
res = []
for s in sitios:
    nome = s["nome_pt"].split(" (")[0]
    if nome in FIXOS:
        q = FIXOS[nome]; rot, lon, lat = wd(q); desc = "(ID fixo, rótulo conferido)"
    else:
        q, rot, desc, lon, lat = busca(BUSCA[nome])
    d = math.hypot((s["lon"] - lon) * math.cos(math.radians(lat)), s["lat"] - lat)
    res.append({"sitio": nome, "pleiades": [s["lon"], s["lat"]], "wikidata": q, "rotulo_wd": rot, "descricao_wd": desc, "wd": [lon, lat], "dif_graus": round(d, 4), "ok": d < 0.1})
    print(f"{nome:10s} Pleiades ({s['lon']:.4f},{s['lat']:.4f}) × Wikidata {q} '{rot}' — {desc[:40]} ({lon:.4f},{lat:.4f}) → {d:.4f}° {'OK' if d < 0.1 else 'FALHA'}")
rios = json.load(open("src/data/geo/rios.json"))
nomes = sorted({f["properties"].get("name") or "?" for f in rios["features"] if f["properties"].get("principal")})
print("rios principais (Natural Earth):", nomes)
json.dump({"sitios": res, "rios_principais": nomes}, open("src/data/geo/verificacao-mapa.json", "w"), ensure_ascii=False, indent=1)
