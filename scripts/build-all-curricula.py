"""
Build TypeScript curriculum files from raw JSON for all subjects.
Generates {subject}Curriculum.ts files with CurriculumFramework structure.

Run: python scripts/build-all-curricula.py
"""
import json
import os
import io
import sys
import glob
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

CURRICULA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'curricula')

SUBJECTS = {
    'science': {'ar': 'العلوم', 'en': 'Science', 'id': 'jo-science-k12'},
    'computer': {'ar': 'الحاسوب والمهارات الرقمية', 'en': 'Computer & Digital Skills', 'id': 'jo-computer-k12'},
    'english': {'ar': 'اللغة الإنجليزية', 'en': 'English Language', 'id': 'jo-english-k12'},
    'arts': {'ar': 'التربية الفنية والموسيقية', 'en': 'Arts & Music', 'id': 'jo-arts-k12'},
    'pe': {'ar': 'التربية الرياضية', 'en': 'Physical Education', 'id': 'jo-pe-k12'},
    'kindergarten': {'ar': 'رياض الأطفال', 'en': 'Kindergarten', 'id': 'jo-kindergarten'},
}

# Bloom level inference from Arabic verbs
BLOOM_VERBS = {
    1: ['يتعرف', 'يعرف', 'يذكر', 'يسمي', 'يعدد', 'يحدد', 'يتذكر', 'يعرّف', 'يتعرّف'],
    2: ['يفهم', 'يشرح', 'يوضح', 'يفسر', 'يصف', 'يبين', 'يوصف', 'يميز', 'يقارن', 'يفرق'],
    3: ['يطبق', 'يستخدم', 'يحل', 'يوظف', 'ينفذ', 'يحسب', 'يرسم', 'يكتب', 'يقرأ', 'يمثل', 'يجري', 'يؤدي', 'يمارس'],
    4: ['يحلل', 'يصنف', 'يستنتج', 'يقسم', 'يربط', 'يستقصي', 'يستكشف', 'يميّز'],
    5: ['يقيم', 'يحكم', 'ينتقد', 'يبرر', 'يختار', 'يقدر', 'يثمن'],
    6: ['يبدع', 'يصمم', 'يبتكر', 'يؤلف', 'ينتج', 'يخطط', 'يقترح', 'يطور'],
}


def infer_bloom(text):
    """Infer Bloom's level from Arabic text."""
    for level in [6, 5, 4, 3, 2, 1]:
        for verb in BLOOM_VERBS[level]:
            if verb in text:
                return level
    return 3  # default to Apply


def infer_difficulty(bloom_level, grade_level):
    """Simple difficulty heuristic based on bloom level and grade."""
    base = min(bloom_level, 5)
    # Higher grades tend to have slightly harder content
    if isinstance(grade_level, int) and grade_level >= 10:
        base = min(base + 1, 5)
    return max(1, min(base, 5))


def slugify(text):
    """Create a simple slug from text."""
    text = text.strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text[:40].strip('-').lower() or 'item'


def escape_ts_string(s):
    """Escape a string for TypeScript."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')


def build_subject(subject_key, subject_info):
    """Build a TypeScript file for one subject."""
    subject_dir = os.path.join(CURRICULA_DIR, subject_key)
    if subject_key == 'math':
        return None  # Math already has its TS file

    json_files = sorted(glob.glob(os.path.join(subject_dir, '*-raw.json')))
    if not json_files:
        print(f'  SKIP: No JSON files for {subject_key}')
        return None

    grades_data = []
    total_indicators = 0

    for jf in json_files:
        with open(jf, 'r', encoding='utf-8') as f:
            raw = json.load(f)

        grade_level = raw.get('gradeLevel', 0)
        # Normalize grade level
        if isinstance(grade_level, str):
            if 'KG1' in str(grade_level) or grade_level == 'KG1':
                grade_level = -1
            elif 'KG2' in str(grade_level) or grade_level == 'KG2':
                grade_level = 0
            else:
                try:
                    grade_level = int(grade_level)
                except:
                    grade_level = 0

        grade_tag = f'g{grade_level}' if grade_level >= 0 else f'gKG{abs(grade_level)}'

        domains = []
        lo_counter = 0
        kc_counter = 0

        for di, raw_domain in enumerate(raw.get('domains', [])):
            domain_id = f'domain-{subject_key}-{grade_tag}-{di+1}'
            standards = []

            for si, raw_std in enumerate(raw_domain.get('standards', [])):
                std_id = f'std-{subject_key}-{grade_tag}-{di+1}-{si+1}'
                outcomes = []

                for oi, raw_outcome in enumerate(raw_std.get('learningOutcomes', [])):
                    lo_counter += 1
                    lo_id = f'lo-{subject_key}-{grade_tag}-{lo_counter}'
                    outcome_ar = raw_outcome.get('outcomeAr', '')
                    outcome_en = raw_outcome.get('outcomeEn', '')
                    bloom = infer_bloom(outcome_ar or outcome_en)

                    indicators = raw_outcome.get('indicators', [])
                    kcs = []

                    for ind_i, indicator in enumerate(indicators):
                        if not indicator or not indicator.strip():
                            continue
                        kc_counter += 1
                        total_indicators += 1
                        ind_bloom = infer_bloom(indicator)
                        ind_diff = infer_difficulty(ind_bloom, grade_level)
                        kcs.append({
                            'id': f'kc-{subject_key}-{grade_tag}-{kc_counter}',
                            'nameAr': indicator.strip(),
                            'nameEn': '',
                            'bloomLevel': ind_bloom,
                            'difficulty': ind_diff,
                            'prerequisiteKcIds': [],
                            'tags': [],
                            'standardCode': std_id,
                        })

                    outcomes.append({
                        'id': lo_id,
                        'outcomeAr': outcome_ar,
                        'outcomeEn': outcome_en,
                        'bloomLevel': bloom,
                        'indicators': indicators,
                        'knowledgeComponents': kcs,
                    })

                standards.append({
                    'id': std_id,
                    'nameAr': raw_std.get('nameAr', ''),
                    'nameEn': raw_std.get('nameEn', ''),
                    'learningOutcomes': outcomes,
                })

            domains.append({
                'id': domain_id,
                'nameAr': raw_domain.get('nameAr', ''),
                'nameEn': raw_domain.get('nameEn', ''),
                'standards': standards,
            })

        grades_data.append({
            'gradeLevel': grade_level,
            'domains': domains,
        })

    # Sort grades
    grades_data.sort(key=lambda g: g['gradeLevel'])

    # Generate TypeScript
    var_name = f'{subject_key.upper()}_CURRICULUM'
    ts_lines = []
    ts_lines.append(f"// Auto-generated by scripts/build-all-curricula.py — DO NOT EDIT MANUALLY")
    ts_lines.append(f"// Total Knowledge Components: {total_indicators}")
    ts_lines.append(f"")
    ts_lines.append(f"import type {{ BloomLevel }} from '../skillTaxonomy';")
    ts_lines.append(f"import type {{ CurriculumFramework }} from './types';")
    ts_lines.append(f"")
    ts_lines.append(f"type Difficulty = 1 | 2 | 3 | 4 | 5;")
    ts_lines.append(f"")
    ts_lines.append(f"export const {var_name}: CurriculumFramework = ")

    # Serialize to JSON then adjust for TS
    framework = {
        'id': subject_info['id'],
        'subject': subject_info['ar'],
        'subjectEn': subject_info['en'],
        'grades': grades_data,
    }

    json_str = json.dumps(framework, ensure_ascii=False, indent=2)
    # Cast bloom levels and difficulties
    json_str = json_str.replace('"bloomLevel": 1', '"bloomLevel": 1 as BloomLevel')
    json_str = json_str.replace('"bloomLevel": 2', '"bloomLevel": 2 as BloomLevel')
    json_str = json_str.replace('"bloomLevel": 3', '"bloomLevel": 3 as BloomLevel')
    json_str = json_str.replace('"bloomLevel": 4', '"bloomLevel": 4 as BloomLevel')
    json_str = json_str.replace('"bloomLevel": 5', '"bloomLevel": 5 as BloomLevel')
    json_str = json_str.replace('"bloomLevel": 6', '"bloomLevel": 6 as BloomLevel')
    json_str = json_str.replace('"difficulty": 1', '"difficulty": 1 as Difficulty')
    json_str = json_str.replace('"difficulty": 2', '"difficulty": 2 as Difficulty')
    json_str = json_str.replace('"difficulty": 3', '"difficulty": 3 as Difficulty')
    json_str = json_str.replace('"difficulty": 4', '"difficulty": 4 as Difficulty')
    json_str = json_str.replace('"difficulty": 5', '"difficulty": 5 as Difficulty')

    ts_lines.append(json_str + ';')

    ts_content = '\n'.join(ts_lines) + '\n'
    ts_path = os.path.join(CURRICULA_DIR, f'{subject_key}Curriculum.ts')
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f'  Generated {ts_path}')
    print(f'  Grades: {len(grades_data)}, KCs: {total_indicators}')

    return {'var_name': var_name, 'file': f'{subject_key}Curriculum', 'total': total_indicators}


def main():
    print("=" * 60)
    print("BUILD ALL CURRICULA")
    print("=" * 60)

    results = {}
    for subject_key, subject_info in SUBJECTS.items():
        print(f"\n--- {subject_key.upper()} ---")
        result = build_subject(subject_key, subject_info)
        if result:
            results[subject_key] = result

    # Update index.ts
    print(f"\n--- Updating index.ts ---")
    # Read existing index.ts to preserve the adapter functions
    index_path = os.path.join(CURRICULA_DIR, 'index.ts')
    with open(index_path, 'r', encoding='utf-8') as f:
        existing = f.read()

    # Build new imports and exports
    imports = ["import { MATH_CURRICULUM } from './mathCurriculum';"]
    exports = ["export { MATH_CURRICULUM }"]
    all_curricula_entries = ["  { key: 'math', data: MATH_CURRICULUM }"]

    for key, info in sorted(results.items()):
        imports.append(f"import {{ {info['var_name']} }} from './{info['file']}';")
        exports.append(f"export {{ {info['var_name']} }}")
        all_curricula_entries.append(f"  {{ key: '{key}', data: {info['var_name']} }}")

    imports.append("import type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC } from './types';")
    exports.append("export type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC }")

    # Build ALL_CURRICULA array
    entries_str = ',\n'.join(all_curricula_entries)
    all_curricula = f"""
export const ALL_CURRICULA: {{ key: string; data: CurriculumFramework }}[] = [
{entries_str}
];
"""

    # Keep everything after the export type line (adapter functions)
    adapter_start = existing.find('// ─── Adapter')
    adapter_code = existing[adapter_start:] if adapter_start >= 0 else ''

    new_index = '\n'.join(imports) + '\n\n' + ';\n'.join(exports) + ';\n' + all_curricula + '\n'

    # Add helper functions
    new_index += """export function getGradeCurriculum(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): GradeCurriculum | undefined {
  return framework.grades.find(g => g.gradeLevel === grade);
}

export function getDomainsForGrade(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): Domain[] {
  return getGradeCurriculum(grade, framework)?.domains ?? [];
}

export function getKCsForGrade(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): CurriculumKC[] {
  const kcs: CurriculumKC[] = [];
  for (const domain of getDomainsForGrade(grade, framework)) {
    for (const std of domain.standards) {
      for (const outcome of std.learningOutcomes) {
        kcs.push(...outcome.knowledgeComponents);
      }
    }
  }
  return kcs;
}

"""

    if adapter_code:
        new_index += adapter_code

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_index)

    print(f'  Updated {index_path}')

    # Summary
    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print(f"{'=' * 60}")
    total = sum(r['total'] for r in results.values()) + 2017  # +math
    print(f"Subjects built: {len(results) + 1} (including math)")
    print(f"Total KCs: {total}")
    print(f"Files generated: {len(results)} TypeScript files + index.ts")


if __name__ == '__main__':
    main()
