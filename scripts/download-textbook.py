"""
Download Grade 1 Math textbook PDFs from Jordanian curriculum sources.
Run: python scripts/download-textbook.py
"""
import os
import sys
import io
import urllib.request
import ssl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DEST = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1', 'pdf')

URLS = {
    'semester1-student.pdf': 'https://schoolbooks.jo1jo.com/1/MA.01.ST.BOOK_Print_Bleed.pdf',
    'semester1-exercises.pdf': 'https://schoolbooks.jo1jo.com/1/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A7%D8%AA%20(%D8%A7%D9%84%D8%AA%D9%85%D8%A7%D8%B1%D9%8A%D9%86)%20%D8%AC1%20%D8%A7%D9%84%D8%B5%D9%81%20%D8%A7%D9%84%D8%A3%D9%88%D9%84.pdf',
    'semester2-student.pdf': 'https://schoolbooks.jo1jo.com/1/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A7%D8%AA%20(%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8)%20%D8%AC2%20%D8%A7%D9%84%D8%B5%D9%81%20%D8%A7%D9%84%D8%A3%D9%88%D9%84.pdf',
    'semester2-exercises.pdf': 'https://schoolbooks.jo1jo.com/1/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A7%D8%AA%20(%D8%A7%D9%84%D8%AA%D9%85%D8%A7%D8%B1%D9%8A%D9%86)%20%D8%AC2%20%D8%A7%D9%84%D8%B5%D9%81%20%D8%A7%D9%84%D8%A3%D9%88%D9%84.pdf',
}

def download(name, url):
    dest_path = os.path.join(DEST, name)
    if os.path.exists(dest_path):
        size = os.path.getsize(dest_path)
        print(f'  SKIP {name} (already exists, {size:,} bytes)')
        return True

    print(f'  Downloading {name}...')
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, context=ctx) as response:
            data = response.read()
            with open(dest_path, 'wb') as f:
                f.write(data)
        size = os.path.getsize(dest_path)
        print(f'  OK {name} ({size:,} bytes)')
        return True
    except Exception as e:
        print(f'  FAIL {name}: {e}')
        return False

def main():
    os.makedirs(DEST, exist_ok=True)
    print('Downloading Grade 1 Math textbooks...\n')
    results = {}
    for name, url in URLS.items():
        results[name] = download(name, url)

    print(f'\n--- Summary ---')
    for name, ok in results.items():
        status = 'OK' if ok else 'FAILED'
        print(f'  {status}: {name}')

    # Verify with PyMuPDF
    try:
        import fitz
        print(f'\n--- PDF Verification ---')
        for name in URLS:
            path = os.path.join(DEST, name)
            if os.path.exists(path):
                try:
                    doc = fitz.open(path)
                    print(f'  {name}: {len(doc)} pages')
                    doc.close()
                except Exception as e:
                    print(f'  {name}: INVALID PDF - {e}')
    except ImportError:
        print('\nWARN: PyMuPDF not installed, skipping PDF verification')

if __name__ == '__main__':
    main()
