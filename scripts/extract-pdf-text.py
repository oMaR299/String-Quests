"""
Extract text from all curriculum PDFs into text files.
This avoids image-based extraction which hits context limits.

Run: python scripts/extract-pdf-text.py
"""
import fitz
import os
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

CURRICULA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'curricula')

SUBJECTS = {
    'science': 'science-framework.pdf',
    'computer': 'computer-framework.pdf',
    'english': 'english-framework.pdf',
    'arts': 'arts-framework.pdf',
    'pe': 'pe-framework.pdf',
    'kindergarten': 'kindergarten-framework.pdf',
}

def extract_subject(subject, pdf_filename):
    subject_dir = os.path.join(CURRICULA_DIR, subject)
    pdf_path = os.path.join(subject_dir, pdf_filename)

    if not os.path.exists(pdf_path):
        print(f"  SKIP: {pdf_path} not found")
        return

    doc = fitz.open(pdf_path)
    print(f"  Pages: {len(doc)}")

    # Write all page text to a single file
    output_path = os.path.join(subject_dir, f'{subject}-text-dump.txt')
    with open(output_path, 'w', encoding='utf-8') as out:
        for i, page in enumerate(doc):
            text = page.get_text()
            out.write(f"\n{'='*60}\n")
            out.write(f"PAGE {i+1}\n")
            out.write(f"{'='*60}\n")
            out.write(text)

    print(f"  Text dump: {output_path}")

    # Also find curriculum table pages (with key Arabic terms)
    curriculum_keywords = ['المعيار', 'المجال', 'النتاج', 'المؤشر', 'نتاجات التعلم', 'مؤشرات الأداء']
    grade_keywords = ['رياض الأطفال', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
                      'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر']

    table_pages = []
    for i, page in enumerate(doc):
        text = page.get_text()
        has_curriculum = any(kw in text for kw in curriculum_keywords)
        has_grade = any(kw in text for kw in grade_keywords)
        if has_curriculum and has_grade and len(text.strip()) > 200:
            table_pages.append(i + 1)

    print(f"  Curriculum table pages: {table_pages}")
    print(f"  Total table pages: {len(table_pages)}")

    doc.close()

def main():
    print("=" * 60)
    print("PDF TEXT EXTRACTION")
    print("=" * 60)

    for subject, pdf_file in SUBJECTS.items():
        print(f"\n--- {subject.upper()} ---")
        extract_subject(subject, pdf_file)

    print("\nDone! Text dumps ready for parsing.")

if __name__ == '__main__':
    main()
