"""Import the public Yahoo daily chart response; never interpolate or invent bars."""
from pathlib import Path
from datetime import datetime, timezone, time
from zoneinfo import ZoneInfo
import argparse, json, hashlib, math

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
args = parser.parse_args()
raw = args.input.read_bytes()
response = json.loads(raw)['chart']
assert not response.get('error'), response.get('error')
result = response['result'][0]
assert result['meta']['symbol'] == 'SOXL'
ny = ZoneInfo('America/New_York')
now = datetime.now(timezone.utc)
local_now = now.astimezone(ny)
quotes = result['indicators']['quote'][0]
rows, skipped = [], []
for i, timestamp in enumerate(result['timestamp']):
    date = datetime.fromtimestamp(timestamp, ny).date()
    if date > local_now.date() or (date == local_now.date() and local_now.time() < time(16, 15)):
        skipped.append(str(date))
        continue
    values = [quotes[key][i] for key in ('open', 'high', 'low', 'close', 'volume')]
    assert all(v is not None and math.isfinite(v) for v in values), ('Incomplete candle', date)
    o, h, l, c, volume = values
    assert 0 < l <= min(o, c) <= max(o, c) <= h and volume >= 0, ('Invalid OHLC', date)
    rows.append([str(date), round(o, 6), round(h, 6), round(l, 6), round(c, 6), int(volume)])
assert rows[0][0] == '2010-03-11' and len(rows) > 4000
assert len({r[0] for r in rows}) == len(rows)
assert rows == sorted(rows, key=lambda r: r[0])
splits = [{'date': str(datetime.fromtimestamp(v['date'], ny).date()), 'ratio': v['splitRatio']} for v in result.get('events', {}).get('splits', {}).values()]
output = {
    'meta': {'symbol': 'SOXL', 'interval': '1d', 'currency': 'USD', 'timezone': 'America/New_York',
        'start': rows[0][0], 'end': rows[-1][0], 'count': len(rows), 'retrievedAt': now.isoformat(),
        'source': 'Yahoo Finance', 'sourceUrl': 'https://finance.yahoo.com/quote/SOXL/history/',
        'sourceEndpoint': 'https://query2.finance.yahoo.com/v8/finance/chart/SOXL',
        'rawSha256': hashlib.sha256(raw).hexdigest(), 'adjustment': 'split-adjusted; not dividend-adjusted',
        'splits': splits, 'excludedIncompleteDates': skipped,
        'columns': ['date', 'open', 'high', 'low', 'close', 'volume']},
    'bars': rows,
}
folder = Path(__file__).resolve().parent / 'data'
folder.mkdir(exist_ok=True)
(folder / 'soxl-daily.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')))
print(json.dumps(output['meta'], ensure_ascii=False, indent=2))
