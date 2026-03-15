"""
Extract all pages from Grade 1 Math textbook PDFs as PNG images.
Run: python scripts/extract-textbook-pages.py
"""
import os
import sys
import io
import fitz  # PyMuPDF

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1')
PDF_DIR = os.path.join(BASE, 'pdf')
IMG_DIR = os.path.join(BASE, 'images')
DPI = 150  # Keep under 2000px for AI processing

# Process all 4 books with prefixed page numbering
BOOKS = [
    ('semester1-student.pdf', 's1'),
    ('semester1-exercises.pdf', 's1ex'),
    ('semester2-student.pdf', 's2'),
    ('semester2-exercises.pdf', 's2ex'),
]


def extract_pages():
    os.makedirs(IMG_DIR, exist_ok=True)
    total = 0

    for pdf_name, prefix in BOOKS:
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        if not os.path.exists(pdf_path):
            print(f'SKIP {pdf_name} (not found)')
            continue

        doc = fitz.open(pdf_path)
        print(f'\n--- {pdf_name}: {len(doc)} pages (prefix: {prefix}) ---')

        for i in range(len(doc)):
            page_num = i + 1
            out_path = os.path.join(IMG_DIR, f'{prefix}-page-{page_num:03d}.png')

            if os.path.exists(out_path):
                total += 1
                continue

            page = doc[i]
            mat = fitz.Matrix(DPI / 72, DPI / 72)
            pix = page.get_pixmap(matrix=mat)
            pix.save(out_path)
            total += 1

            if page_num % 20 == 0:
                print(f'  Extracted {page_num}/{len(doc)} pages...')

        print(f'  Done: {len(doc)} pages')
        doc.close()

    print(f'\nTotal: {total} page images extracted to {IMG_DIR}')


def check_dimensions():
    """Verify all images are under 2000px."""
    print('\n--- Checking dimensions ---')
    over_limit = 0
    for f in sorted(os.listdir(IMG_DIR)):
        if not f.endswith('.png'):
            continue
        path = os.path.join(IMG_DIR, f)
        pix = fitz.Pixmap(path)
        w, h = pix.width, pix.height
        if w > 2000 or h > 2000:
            print(f'  OVER LIMIT: {f} ({w}x{h})')
            over_limit += 1
    if over_limit == 0:
        print('  All images under 2000px limit')
    else:
        print(f'  {over_limit} images over limit!')


if __name__ == '__main__':
    print('=== Extracting page images ===')
    extract_pages()
    check_dimensions()
