"""Create dated companion stock returns, never using future sessions or proxy SOXL moves."""
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import json, math, hashlib, argparse
parser=argparse.ArgumentParser()
parser.add_argument('input_directory',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent
soxl=json.loads((root/'data/soxl-daily.json').read_text())
symbols=['NVDA','AMD','INTC','AVGO']
series={}
raw_hashes={}
ny=ZoneInfo('America/New_York')
for symbol in symbols:
    raw=(args.input_directory/f'soxl-friend-{symbol}.json').read_bytes()
    result=json.loads(raw)['chart']['result'][0]
    assert result['meta']['symbol']==symbol
    close=result['indicators']['quote'][0]['close']
    entries={}
    previous=None
    for timestamp,value in zip(result['timestamp'],close):
        date=str(datetime.fromtimestamp(timestamp,ny).date())
        if date>soxl['meta']['end']: continue
        assert value is not None and math.isfinite(value) and value>0
        if previous is not None: entries[date]=round(value/previous-1,8)
        previous=value
    series[symbol]=entries
    raw_hashes[symbol]=hashlib.sha256(raw).hexdigest()
rows=[]
for bar in soxl['bars']:
    date=bar[0]
    assert all(date in series[s] for s in symbols),date
    rows.append([date]+[series[s][date] for s in symbols])
output={'meta':{'source':'Yahoo Finance','retrievedAt':datetime.now(timezone.utc).isoformat(),'start':rows[0][0],'end':rows[-1][0],'count':len(rows),'columns':['date']+symbols,'adjustment':'daily close return; split-adjusted; not dividend-adjusted','rawSha256':raw_hashes},'bars':rows}
(root/'data/friends-daily.json').write_text(json.dumps(output,separators=(',',':')))
print('Friend history:',len(rows),'dates',rows[0][0],rows[-1][0],symbols)
