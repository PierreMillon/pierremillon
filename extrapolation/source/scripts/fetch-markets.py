"""Télécharge les cours mensuels embarqués dans l'onglet Bourse.

Usage (depuis extrapolation/source/) : python3 scripts/fetch-markets.py
puis npm run build et recopier dist/ (voir README).
Sources : jeux de données ouverts hébergés sur GitHub.
"""
import csv, io, json, datetime, urllib.request


def get(path):
    return urllib.request.urlopen("https://raw.githubusercontent.com/" + path, timeout=30).read().decode()


series = []
rows = list(csv.DictReader(io.StringIO(get("datasets/s-and-p-500/main/data/data.csv"))))
series.append({"id": "sp500", "name": "S&P 500", "unit": "points", "source": "Robert Shiller / datasets/s-and-p-500 (GitHub)",
               "pts": [[r["Date"][:7], round(float(r["SP500"]), 2)] for r in rows if r["SP500"] and float(r["SP500"]) > 0]})
# Bitcoin : cours quotidien, Coin Metrics (fichier séparé, un nombre par jour)
rows = list(csv.DictReader(io.StringIO(get("coinmetrics/data/master/csv/btc.csv"))))
btc = [(r["time"], float(r["PriceUSD"])) for r in rows if r.get("PriceUSD")]
with open("src/data/btc.json", "w") as f:
    f.write(json.dumps({"start": btc[0][0], "source": "Coin Metrics community data (github.com/coinmetrics/data)",
                        "vals": [float(f"{v:.6g}") for _, v in btc]}, separators=(",", ":")))
print("btc", len(btc), btc[0], btc[-1])

for s in series:
    print(s["id"], len(s["pts"]), s["pts"][0], s["pts"][-1])
with open("src/data/markets.json", "w") as f:
    f.write(json.dumps(series, separators=(",", ":"), ensure_ascii=False))
