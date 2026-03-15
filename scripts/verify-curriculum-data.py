"""
Curriculum Data Verification Script
Triple-checks all extracted curriculum JSON files for completeness and correctness.

Run: python scripts/verify-curriculum-data.py
"""
import json
import os
import sys
import io

# Fix Unicode output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

CURRICULA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'curricula')
ERRORS = []
WARNINGS = []

def error(msg):
    ERRORS.append(msg)
    print(f"  ERROR: {msg}")

def warn(msg):
    WARNINGS.append(msg)
    print(f"  WARN:  {msg}")

def ok(msg):
    print(f"  OK:    {msg}")

def verify_json_file(filepath):
    """Verify a single grade JSON file."""
    filename = os.path.basename(filepath)
    print(f"\n--- {filename} ---")

    # Check 1: Valid JSON
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        error(f"Invalid JSON: {e}")
        return None
    ok("Valid JSON")

    # Check 2: Required top-level fields
    required = ['gradeLevel', 'subject', 'subjectEn', 'domains']
    for field in required:
        if field not in data:
            error(f"Missing required field: {field}")

    grade = data.get('gradeLevel', '?')
    subject = data.get('subjectEn', '?')

    # Check 3: Domains exist and are non-empty
    domains = data.get('domains', [])
    if not domains:
        error(f"No domains found for grade {grade}")
        return data
    ok(f"{len(domains)} domains found")

    total_standards = 0
    total_outcomes = 0
    total_indicators = 0
    empty_indicators = 0

    for di, domain in enumerate(domains):
        # Check domain fields
        if not domain.get('nameAr'):
            error(f"Domain {di+1}: missing nameAr")
        if not domain.get('nameEn'):
            warn(f"Domain {di+1} ({domain.get('nameAr', '?')}): missing nameEn")

        standards = domain.get('standards', [])
        if not standards:
            error(f"Domain '{domain.get('nameAr', '?')}': no standards")
            continue

        for si, std in enumerate(standards):
            total_standards += 1
            if not std.get('nameAr'):
                error(f"Standard {si+1} in domain '{domain.get('nameAr', '?')}': missing nameAr")

            outcomes = std.get('learningOutcomes', [])
            if not outcomes:
                error(f"Standard '{std.get('nameAr', '?')}': no learning outcomes")
                continue

            std_indicator_count = 0
            for oi, outcome in enumerate(outcomes):
                total_outcomes += 1
                if not outcome.get('outcomeAr'):
                    error(f"Outcome {oi+1} in standard '{std.get('nameAr', '?')}': missing outcomeAr")

                indicators = outcome.get('indicators', [])
                for ind in indicators:
                    total_indicators += 1
                    std_indicator_count += 1
                    if not ind or not ind.strip():
                        empty_indicators += 1
                        error(f"Empty indicator in outcome '{outcome.get('outcomeAr', '?')[:40]}...'")

            if std_indicator_count == 0:
                error(f"Standard '{std.get('nameAr', '?')}': no indicators across any outcome")

    ok(f"Standards: {total_standards}, Outcomes: {total_outcomes}, Indicators: {total_indicators}")

    # Check 4: Reasonable indicator count
    if total_indicators < 20:
        warn(f"Very few indicators ({total_indicators}) — possible incomplete extraction")
    elif total_indicators > 300:
        warn(f"Very many indicators ({total_indicators}) — verify no duplicates")

    if empty_indicators > 0:
        error(f"{empty_indicators} empty indicator strings found")

    # Check 5: No duplicate indicators within a grade
    all_indicators = []
    for d in domains:
        for s in d.get('standards', []):
            for o in s.get('learningOutcomes', []):
                all_indicators.extend(o.get('indicators', []))

    seen = set()
    dupes = 0
    for ind in all_indicators:
        if ind in seen:
            dupes += 1
        seen.add(ind)

    if dupes > 0:
        warn(f"{dupes} duplicate indicators found within grade {grade}")
    else:
        ok("No duplicate indicators")

    return {
        'grade': grade,
        'subject': subject,
        'domains': len(domains),
        'standards': total_standards,
        'outcomes': total_outcomes,
        'indicators': total_indicators,
        'duplicates': dupes,
    }

def main():
    print("=" * 60)
    print("CURRICULUM DATA VERIFICATION")
    print("=" * 60)

    # Find all subject directories and JSON files
    subjects_found = {}

    # Check root-level JSON files (math)
    math_files = sorted([f for f in os.listdir(CURRICULA_DIR)
                        if f.endswith('-raw.json') and f.startswith('grade')])
    if math_files:
        subjects_found['math'] = [os.path.join(CURRICULA_DIR, f) for f in math_files]

    # Check subdirectories
    for entry in sorted(os.listdir(CURRICULA_DIR)):
        subdir = os.path.join(CURRICULA_DIR, entry)
        if os.path.isdir(subdir) and entry not in ('__pycache__',):
            json_files = sorted([f for f in os.listdir(subdir) if f.endswith('-raw.json')])
            if json_files:
                subjects_found[entry] = [os.path.join(subdir, f) for f in json_files]

    if not subjects_found:
        print("No curriculum JSON files found!")
        sys.exit(1)

    print(f"\nFound {len(subjects_found)} subject(s): {', '.join(subjects_found.keys())}")

    all_stats = []

    for subject, files in subjects_found.items():
        print(f"\n{'=' * 60}")
        print(f"SUBJECT: {subject.upper()} ({len(files)} files)")
        print(f"{'=' * 60}")

        subject_indicators = 0
        for filepath in files:
            stats = verify_json_file(filepath)
            if stats:
                all_stats.append(stats)
                subject_indicators += stats['indicators']

        print(f"\n  TOTAL for {subject}: {subject_indicators} indicators across {len(files)} grades")

    # Final summary
    print(f"\n{'=' * 60}")
    print("FINAL SUMMARY")
    print(f"{'=' * 60}")

    total_kcs = sum(s['indicators'] for s in all_stats)
    total_grades = len(all_stats)

    print(f"Subjects verified: {len(subjects_found)}")
    print(f"Grade files verified: {total_grades}")
    print(f"Total indicators (KCs): {total_kcs}")
    print(f"Errors: {len(ERRORS)}")
    print(f"Warnings: {len(WARNINGS)}")

    if ERRORS:
        print(f"\n{'!' * 60}")
        print(f"FAILED — {len(ERRORS)} errors found:")
        for e in ERRORS:
            print(f"  - {e}")
        sys.exit(1)
    elif WARNINGS:
        print(f"\nPASSED with {len(WARNINGS)} warnings")
        sys.exit(0)
    else:
        print(f"\nPASSED — all checks clean!")
        sys.exit(0)

if __name__ == '__main__':
    main()
