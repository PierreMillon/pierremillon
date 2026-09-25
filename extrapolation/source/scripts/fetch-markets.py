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
rows = list(csv.DictReader(io.StringIO(get("datasets/gold-prices/main/data/monthly.csv"))))
series.append({"id": "gold", "name": "Or", "nameEn": "Gold", "unit": "$/oz", "source": "datasets/gold-prices (GitHub)",
               "pts": [[r["Date"][:7], round(float(r["Price"]), 2)] for r in rows if r["Price"]]})
rows = list(csv.DictReader(io.StringIO(get("datasets/oil-prices/main/data/brent-monthly.csv"))))
series.append({"id": "brent", "name": "Pétrole Brent", "nameEn": "Brent crude", "unit": "$/baril", "unitEn": "$/barrel",
               "source": "EIA / datasets/oil-prices (GitHub)",
               "pts": [[r["Date"][:7], round(float(r["Price"]), 2)] for r in rows if r["Price"]]})
rows = list(csv.DictReader(io.StringIO(get("vega/vega-datasets/main/data/stocks.csv"))))
names = {"AAPL": "Apple", "MSFT": "Microsoft", "AMZN": "Amazon", "GOOG": "Google", "IBM": "IBM"}
for sym in ["AAPL", "MSFT", "AMZN", "GOOG", "IBM"]:
    pts = [[datetime.datetime.strptime(r["date"], "%b %d %Y").strftime("%Y-%m"), round(float(r["price"]), 2)]
           for r in rows if r["symbol"] == sym]
    series.append({"id": sym.lower(), "name": names[sym] + " (" + sym + ")", "unit": "$",
                   "source": "vega-datasets stocks.csv (GitHub)", "pts": pts})

for s in series:
    print(s["id"], len(s["pts"]), s["pts"][0], s["pts"][-1])
with open("src/data/markets.json", "w") as f:
    f.write(json.dumps(series, separators=(",", ":"), ensure_ascii=False))
