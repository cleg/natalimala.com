#!/usr/bin/env python3
"""Build the static site. Python 3 + macOS qlmanage/sips; no Python packages."""
from pathlib import Path
import hashlib
import re
import shutil
import subprocess
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
CACHE = ROOT / '.cache' / 'fonts'
FONT_URL = ('https://fonts.googleapis.com/css2?'
            'family=DM+Sans:wght@400;500;600;700&family=Prata&display=swap')
USER_AGENT = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
              'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36')


def download(url, path):
    if not path.exists():
        request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_bytes(data)
        temporary.replace(path)
    return path.read_bytes()


def build():
    for tool in ('qlmanage', 'sips'):
        if not shutil.which(tool):
            raise RuntimeError(f'{tool} is required for icon generation (macOS).')

    # Build in a temporary directory; preserve the previous output on failure.
    with tempfile.TemporaryDirectory(prefix='.build-', dir=ROOT) as temporary:
        output = Path(temporary)
        for name in ('index.html', 'styles.css', 'script.js', 'photo.jpg',
                     'photo-mobile.jpg', 'favicon.svg', 'og-image.png'):
            shutil.copyfile(ROOT / name, output / name)

        css_key = hashlib.sha256(FONT_URL.encode()).hexdigest()[:16]
        font_css = download(FONT_URL, CACHE / f'{css_key}.css').decode('utf-8')
        fonts = output / 'fonts'
        fonts.mkdir()

        def local_font(match):
            url = match.group(1)
            if not url.startswith('https://fonts.gstatic.com/'):
                raise RuntimeError(f'Unexpected font source: {url}')
            extension = Path(url.split('?')[0]).suffix
            name = hashlib.sha256(url.encode()).hexdigest()[:20] + extension
            data = download(url, CACHE / name)
            (fonts / name).write_bytes(data)
            return f'url("fonts/{name}")'

        font_css = re.sub(r'url\((https://[^)]+)\)', local_font, font_css)
        (output / 'fonts.css').write_text(font_css, encoding='utf-8')
        html = (output / 'index.html').read_text(encoding='utf-8')
        html = re.sub(r'    <link[^>]+href="https://fonts\.(?:googleapis|gstatic)\.com[^>]+/>\n', '', html)
        html = html.replace('    <link rel="stylesheet" href="styles.css" />',
                            '    <link rel="stylesheet" href="fonts.css" />\n'
                            '    <link rel="stylesheet" href="styles.css" />')
        html = html.replace('Хостинг і сервіс шрифтів можуть обробляти технічні дані, необхідні для показу сторінки.',
                            'Хостинг може обробляти технічні дані, необхідні для показу сторінки.')
        (output / 'index.html').write_text(html, encoding='utf-8')

        with tempfile.TemporaryDirectory() as icon_temporary:
            subprocess.run(['qlmanage', '-t', '-s', '512', '-o', icon_temporary,
                            str(ROOT / 'favicon.svg')], check=True, capture_output=True)
            source = Path(icon_temporary) / 'favicon.svg.png'
            for size, name in ((32, 'favicon-32.png'), (180, 'apple-touch-icon.png')):
                subprocess.run(['sips', '-z', str(size), str(size), str(source),
                                '--out', str(output / name)], check=True, capture_output=True)

        if DIST.exists():
            shutil.rmtree(DIST)
        output.rename(DIST)
    print(f'Built {DIST} ({len(list(DIST.rglob("*")))} entries).')


if __name__ == '__main__':
    build()
