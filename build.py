"""Prepare this existing static website for a private preview."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import shutil
import argparse
import struct

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--origin', default='https://luen-tr.com', help='Trusted deployment origin for canonical and social URLs')
args = parser.parse_args()
site_origin = args.origin.rstrip('/')
origin_url = urlsplit(site_origin)
assert origin_url.scheme in ('http', 'https') and origin_url.netloc and not origin_url.path and not origin_url.query and not origin_url.fragment, 'Expected a site origin without a path'

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(exist_ok=True)
html = (ROOT / 'index.html').read_text().replace('https://luen-tr.com/', site_origin + '/')
if site_origin != 'https://luen-tr.com':
    html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow">\n</head>')
(OUT / 'index.html').write_text(html)
shutil.copytree(ROOT / 'public', OUT, dirs_exist_ok=True)
for name in ('assets', 'soxl-game'):
    ignore = shutil.ignore_patterns('tests', '__pycache__', '*.py', '*.md', 'fonts.css', 'style.legacy.css') if name == 'soxl-game' else None
    shutil.copytree(ROOT / name, OUT / name, dirs_exist_ok=True, ignore=ignore)
(OUT / 'character').mkdir(exist_ok=True)
shutil.copy2(ROOT / 'character/Luen.png', OUT / 'character/Luen.png')
shutil.copytree(ROOT / 'character/SOXLCOMIC', OUT / 'character/SOXLCOMIC', dirs_exist_ok=True)

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
        self.stack = []
        self.meta = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.meta[attrs.get('property') or attrs.get('name')] = attrs.get('content')
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate ID: {attrs["id"]}'
            self.ids.add(attrs['id'])
        self.refs.extend(attrs[key] for key in ('src', 'href') if attrs.get(key))
        if tag not in ('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'):
            self.stack.append(tag)
    def handle_endtag(self, tag):
        assert self.stack and self.stack.pop() == tag, f'Unbalanced HTML near </{tag}>'

for file in OUT.rglob('*.html'):
    page = Page()
    page.feed(file.read_text())
    assert not page.stack, f'Unclosed HTML in {file.name}'
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = file.parent / unquote(url.path) if url.path else file
        assert target.exists(), f'Missing local asset/link: {file.name}: {ref}'
        if not url.path and url.fragment:
            assert url.fragment in page.ids, f'Missing anchor: {ref}'
    if file == OUT / 'index.html':
        assert page.meta['og:url'] == site_origin + '/'
        assert page.meta['og:image'] == page.meta['twitter:image'] == site_origin + '/og.png'
        og_file = OUT / 'og.png'
        png = og_file.read_bytes()
        assert png[:8] == b'\x89PNG\r\n\x1a\n', 'OGP must be a PNG'
        width, height = struct.unpack('>II', png[16:24])
        assert (str(width), str(height)) == (page.meta['og:image:width'], page.meta['og:image:height']), 'OGP dimensions do not match metadata'
        assert len(png) < 5_000_000, 'OGP image is too large for the social card'
print('Static build passed: HTML structure and local asset/link checks.')
