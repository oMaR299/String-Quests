
import { Question, Paragraph } from './types';

const COFFEE_PASSAGE: Paragraph[] = [
    {
        id: 'p1',
        text: 'يعود تاريخ القهوة إلى القرن العاشر، وربما قبل ذلك، مع وجود عدة تقارير وأساطير حول أول استخدام لها. يُعتقد أن الموطن الأصلي للقهوة هو إثيوبيا.'
    },
    {
        id: 'p2',
        text: 'أقدم دليل مؤكد على شرب القهوة يظهر في منتصف القرن الخامس عشر في الأديرة الصوفية في اليمن. في العالم العربي، انتشرت القهوة بسرعة من اليمن إلى مكة والمدينة، ثم إلى دمشق والقاهرة وإسطنبول.'
    },
    {
        id: 'p3',
        text: 'في القرن السادس عشر، أصبحت القهوة جزءاً أساسياً من الحياة الاجتماعية في الدولة العثمانية، حيث افتتحت المقاهي التي كانت مكاناً للنقاشات وتبادل الأخبار.'
    }
];

const LANGUAGES_PASSAGE: Paragraph[] = [
    {
        id: 'lp1',
        text: 'يُعد تعلم اللغات بوابة للانفتاح على العالم. فهو لا يقتصر على حفظ الكلمات، بل يمتد لفهم ثقافات الشعوب وتاريخها العريق. التواصل بلغة الآخرين يبني جسوراً من التفاهم والاحترام.'
    },
    {
        id: 'lp2',
        text: 'أثبتت الدراسات الحديثة أن الأشخاص الذين يتحدثون أكثر من لغة يتمتعون بذاكرة أقوى ومهارات تفكير إبداعي أفضل. بالإضافة إلى ذلك، تزيد اللغات من فرص الحصول على وظائف مرموقة في مجالات الترجمة والعلاقات الدولية.'
    }
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "رياضيات",
    lesson: "الجمع",
    type: "input",
    questionText: "كم يساوي: 5 + 5؟",
    correctAnswer: "10",
    points: 10,
    hint: "عدد أصابع اليدين."
  },
  {
    id: 2,
    subject: "لغات",
    lesson: "مفردات عامة",
    type: "matching",
    questionText: "صل الكلمة الإنجليزية بمعناها العربي",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "قطة", right: "Cat" },
      { left: "كلب", right: "Dog" },
      { left: "سيارة", right: "Car" },
      { left: "شمس", right: "Sun" }
    ],
    points: 20,
    hint: "كلمات بسيطة نستخدمها يومياً."
  },
  
  // --- Reading: Language Skills Passage ---
  {
      id: 31,
      subject: "لغات",
      lesson: "فهم المقروء: اللغات",
      type: "reading-word",
      passage: LANGUAGES_PASSAGE,
      targetParagraphId: 'lp1',
      questionText: "اضغط على الكلمة التي تعني 'مدخل' أو 'باب' في الفقرة الأولى.",
      correctAnswer: "بوابة",
      points: 15,
      hint: "بداية الجملة الأولى."
  },
  {
      id: 32,
      subject: "لغات",
      lesson: "فهم المقروء: اللغات",
      type: "reading-highlight",
      passage: LANGUAGES_PASSAGE,
      targetParagraphId: 'lp2',
      questionText: "حدد الجملة التي تذكر الفوائد المهنية (الوظيفية) لتعلم اللغات.",
      correctAnswer: "تزيد اللغات من فرص الحصول على وظائف مرموقة في مجالات الترجمة والعلاقات الدولية",
      points: 20,
      hint: "ابحث في نهاية الفقرة الثانية عن الوظائف."
  },
  {
      id: 33,
      subject: "لغات",
      lesson: "فهم المقروء: اللغات",
      type: "reading-list-extraction",
      passage: LANGUAGES_PASSAGE,
      questionText: "استخرج من النص صفتين عقليتين يتميز بهما الأشخاص متعددو اللغات.",
      correctAnswer: "ذاكرة أقوى، مهارات تفكير إبداعي",
      rubric: ["ذاكرة", "تفكير", "إبداعي", "أقوى", "الذاكرة"],
      requiredCount: 2,
      points: 25,
      hint: "ابحث عن 'ذاكرة' و 'تفكير' في الفقرة الثانية."
  },
  {
      id: 34,
      subject: "لغات",
      lesson: "فهم المقروء: اللغات",
      type: "reading-ai-opinion",
      passage: LANGUAGES_PASSAGE,
      questionText: "كيف يمكن لتعلم لغة جديدة أن يغير شخصيتك وثقتك بنفسك؟ (اكتب 10 كلمات على الأقل)",
      correctAnswer: "OPEN_ENDED",
      minWords: 10,
      points: 30,
      hint: "فكر في التحدث مع الغرباء والسفر."
  },

  // --- Reading: Coffee History Passage (Moved to Languages Subject) ---
  {
      id: 26,
      subject: "لغات", // Changed from "تاريخ" to "لغات" to group reading tasks
      lesson: "فهم المقروء: القهوة",
      type: "reading-word",
      passage: COFFEE_PASSAGE,
      targetParagraphId: 'p1',
      questionText: "من النص، اضغط على اسم الدولة التي يُعتقد أنها الموطن الأصلي للقهوة.",
      correctAnswer: "إثيوبيا",
      points: 15,
      hint: "دولة تقع في القرن الأفريقي."
  },
  {
      id: 27,
      subject: "لغات", // Changed from "تاريخ" to "لغات"
      lesson: "فهم المقروء: القهوة",
      type: "reading-highlight",
      passage: COFFEE_PASSAGE,
      targetParagraphId: 'p2',
      questionText: "حدد الجملة التي تذكر أين ظهر أول دليل مؤكد لشرب القهوة.",
      correctAnswer: "أقدم دليل مؤكد على شرب القهوة يظهر في منتصف القرن الخامس عشر في الأديرة الصوفية في اليمن",
      points: 20,
      hint: "ابحث في الفقرة الثانية عن الأديرة."
  },
  {
      id: 28,
      subject: "لغات", // Changed from "تاريخ" to "لغات"
      lesson: "فهم المقروء: القهوة",
      type: "reading-word",
      passage: COFFEE_PASSAGE,
      targetParagraphId: 'p3',
      questionText: "اضغط على الكلمة التي تصف المكان الذي أصبح مركزاً للنقاشات وتبادل الأخبار.",
      correctAnswer: "المقاهي",
      points: 15,
      hint: "جمع كلمة مقهى."
  },
  {
      id: 29,
      subject: "لغات", // Changed from "تاريخ" to "لغات"
      lesson: "فهم المقروء: القهوة",
      type: "reading-list-extraction",
      passage: COFFEE_PASSAGE,
      questionText: "استخرج من النص ثلاث مدن انتشرت إليها القهوة بعد مكة والمدينة.",
      correctAnswer: "دمشق، القاهرة، إسطنبول",
      rubric: ["دمشق", "القاهرة", "إسطنبول"],
      requiredCount: 3,
      points: 25,
      hint: "ابحث في الفقرة الثانية."
  },
  {
      id: 30,
      subject: "لغات", // Changed from "تاريخ" to "لغات"
      lesson: "فهم المقروء: القهوة",
      type: "reading-ai-opinion",
      passage: COFFEE_PASSAGE,
      questionText: "برأيك، كيف أثرت المقاهي على الحياة الاجتماعية في القرن السادس عشر؟ (اكتب 10 كلمات على الأقل)",
      correctAnswer: "OPEN_ENDED",
      minWords: 10,
      points: 30,
      hint: "فكر في النقاشات وتبادل الأخبار."
  },
  // --- End Reading Questions ---

  {
    id: 3,
    subject: "ثقافة عامة",
    lesson: "الطبيعة",
    type: "multiple-choice",
    questionText: "ما هو لون السماء الصافية؟",
    options: ["أحمر", "أخضر", "أزرق", "أصفر"],
    correctAnswer: "أزرق",
    points: 10,
    hint: "مثل لون البحر."
  },
  {
    id: 4,
    subject: "ترتيب",
    lesson: "الجمل المفيدة",
    type: "reorder",
    questionText: "رتب الكلمات لتكوين جملة",
    options: ["الشرق", "تشرق", "من", "الشمس"],
    correctAnswer: "تشرق الشمس من الشرق",
    points: 15,
    hint: "ابدأ بالفعل (تشرق)."
  },
  {
    id: 5,
    subject: "رياضيات",
    lesson: "الطرح",
    type: "input",
    questionText: "كم يساوي: 10 - 3؟",
    correctAnswer: "7",
    points: 15,
    hint: "الرقم السحري."
  },
  {
    id: 6,
    subject: "معلومات",
    lesson: "الوقت",
    type: "multiple-choice",
    questionText: "كم يوماً في الأسبوع؟",
    options: ["5 أيام", "7 أيام", "9 أيام", "10 أيام"],
    correctAnswer: "7 أيام",
    points: 10,
    hint: "الجمعة هو آخر يوم."
  },
  {
    id: 7,
    subject: "لغات",
    lesson: "الألوان",
    type: "matching",
    questionText: "صل اللون باسمه",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "أحمر", right: "Red" },
      { left: "أخضر", right: "Green" },
      { left: "أزرق", right: "Blue" },
      { left: "أصفر", right: "Yellow" }
    ],
    points: 20,
    hint: "ألوان أساسية."
  },
  {
    id: 8,
    subject: "حيوانات",
    lesson: "حيوانات الغابة",
    type: "multiple-choice",
    questionText: "ما هو الحيوان الذي يلقب بملك الغابة؟",
    options: ["النمر", "الأسد", "الفيل", "الزرافة"],
    correctAnswer: "الأسد",
    points: 10,
    hint: "صوته يسمى زئير."
  },
  {
    id: 9,
    subject: "ترتيب",
    lesson: "الأرقام",
    type: "reorder",
    questionText: "رتب الأرقام تصاعدياً",
    options: ["3", "1", "2", "4"],
    correctAnswer: "1 2 3 4",
    points: 15,
    hint: "ابدأ بالرقم واحد."
  },
  {
    id: 10,
    subject: "جغرافيا",
    lesson: "العالم العربي",
    type: "multiple-choice",
    questionText: "في أي دولة يوجد الهرم؟",
    options: ["مصر", "فرنسا", "اليابان", "إيطاليا"],
    correctAnswer: "مصر",
    points: 10,
    hint: "بلد عربي."
  },
  {
    id: 11,
    subject: "علوم",
    lesson: "البيئة",
    type: "matching",
    questionText: "صل كل شيء بمكانه الصحيح",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "السماء", right: "النجوم" },
      { left: "البحر", right: "السمك" },
      { left: "الغابة", right: "الأسد" },
      { left: "المدرسة", right: "الطالب" }
    ],
    points: 20,
    hint: "كل كائن ومكانه الطبيعي."
  },
  {
    id: 12,
    subject: "رياضيات",
    lesson: "الأعداد",
    type: "input",
    questionText: "اكتب الرقم خمسين",
    correctAnswer: "50",
    points: 10,
    hint: "5 وبجانبها 0."
  },
  {
    id: 13,
    subject: "تاريخ",
    lesson: "العلماء المسلمون",
    type: "multiple-choice",
    questionText: "من هو مؤسس علم الجبر؟",
    options: ["الخوارزمي", "ابن سينا", "الرازي", "الفارابي"],
    correctAnswer: "الخوارزمي",
    points: 15,
    hint: "عالم رياضيات مسلم شهير."
  },
  {
    id: 14,
    subject: "فيزياء",
    lesson: "القوى",
    type: "input",
    questionText: "ما هي وحدة قياس القوة؟",
    correctAnswer: "نيوتن",
    points: 20,
    hint: "سميت على اسم مكتشف الجاذبية."
  },
  {
    id: 15,
    subject: "كيمياء",
    lesson: "العناصر",
    type: "input",
    questionText: "ما هو الرمز الكيميائي للماء؟",
    correctAnswer: "H2O",
    points: 15,
    hint: "ذرتين هيدروجين وذرة أكسجين."
  },
  {
    id: 16,
    subject: "تربية إسلامية",
    lesson: "أركان الإسلام",
    type: "reorder",
    questionText: "رتب أركان الإسلام الأولى",
    options: ["الصلاة", "الشهادتين", "الزكاة", "الصوم"],
    correctAnswer: "الشهادتين الصلاة الزكاة الصوم",
    points: 25,
    hint: "ابدأ بالأساس."
  },
  {
    id: 17,
    subject: "لغة عربية",
    lesson: "الأضداد",
    type: "matching",
    questionText: "صل الكلمة بضدها",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "طويل", right: "قصير" },
      { left: "سريع", right: "بطيء" },
      { left: "قوي", right: "ضعيف" },
      { left: "ليل", right: "نهار" }
    ],
    points: 20,
    hint: "عكس المعنى."
  },
  {
    id: 18,
    subject: "حاسوب",
    lesson: "الأساسيات",
    type: "multiple-choice",
    questionText: "أي مما يلي يعتبر نظام تشغيل؟",
    options: ["Windows", "Mouse", "Keyboard", "Screen"],
    correctAnswer: "Windows",
    points: 10,
    hint: "البرنامج الأساسي للكمبيوتر."
  },
  {
    id: 19,
    subject: "فنون",
    lesson: "الألوان",
    type: "matching",
    questionText: "خلط الألوان",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "أحمر + أصفر", right: "برتقالي" },
      { left: "أزرق + أصفر", right: "أخضر" },
      { left: "أحمر + أزرق", right: "بنفسجي" },
      { left: "أبيض + أسود", right: "رمادي" }
    ],
    points: 20,
    hint: "الألوان الثانوية."
  },
  {
    id: 20,
    subject: "أحياء",
    lesson: "جسم الإنسان",
    type: "multiple-choice",
    questionText: "ما هو العضو المسؤول عن ضخ الدم في جسم الإنسان؟",
    options: ["الكبد", "الرئة", "القلب", "المعدة"],
    correctAnswer: "القلب",
    points: 15,
    hint: "يقع في الجهة اليسرى من الصدر."
  },
  {
    id: 21,
    subject: "علوم الأرض",
    lesson: "القارات",
    type: "multiple-choice",
    questionText: "ما هي أكبر قارات العالم؟",
    options: ["أفريقيا", "آسيا", "أوروبا", "أمريكا"],
    correctAnswer: "آسيا",
    points: 15,
    hint: "توجد فيها الصين والهند."
  },
  {
    id: 22,
    subject: "لغة إنجليزية",
    lesson: "القواعد",
    type: "multiple-choice",
    questionText: "What is the plural of 'Child'?",
    options: ["Childs", "Children", "Childrens", "Childies"],
    correctAnswer: "Children",
    points: 15,
    hint: "Irregular plural."
  },
  {
    id: 23,
    subject: "لغة فرنسية",
    lesson: "التحيات",
    type: "multiple-choice",
    questionText: "ما معنى كلمة 'Bonjour'؟",
    options: ["مساء الخير", "صباح الخير", "تصبح على خير", "إلى اللقاء"],
    correctAnswer: "صباح الخير",
    points: 15,
    hint: "تحية الصباح."
  },
  {
    id: 24,
    subject: "تربية مالية",
    lesson: "مفاهيم أساسية",
    type: "matching",
    questionText: "المصطلحات المالية",
    correctAnswer: "MATCH_ALL",
    pairs: [
      { left: "ادخار", right: "توفير المال" },
      { left: "استثمار", right: "تنمية المال" },
      { left: "راتب", right: "دخل شهري" },
      { left: "بنك", right: "حفظ المال" }
    ],
    points: 20,
    hint: "مفاهيم اقتصادية أساسية."
  },
  {
    id: 25,
    subject: "تربية رياضية",
    lesson: "كرة القدم",
    type: "multiple-choice",
    questionText: "كم عدد لاعبي فريق كرة القدم داخل الملعب؟",
    options: ["9", "10", "11", "12"],
    correctAnswer: "11",
    points: 10,
    hint: "بما فيهم حارس المرمى."
  }
];

export const COLORS = {
  pastelBlue: "#A7C7E7",
  pastelPurple: "#C7B8EA",
  softPink: "#F8C8DC",
  gradientBg: "bg-gradient-to-br from-[#A7C7E7] via-[#F8C8DC] to-[#C7B8EA]",
};

export const TOPIC_META: Record<string, { icon: string; color: string; bg: string }> = {
  "رياضيات": { icon: "calculator", color: "text-blue-500", bg: "bg-blue-100" },
  "لغات": { icon: "languages", color: "text-purple-500", bg: "bg-purple-100" },
  "ثقافة عامة": { icon: "globe", color: "text-emerald-500", bg: "bg-emerald-100" },
  "ترتيب": { icon: "layers", color: "text-orange-500", bg: "bg-orange-100" },
  "معلومات": { icon: "brain", color: "text-indigo-500", bg: "bg-indigo-100" },
  "حيوانات": { icon: "cat", color: "text-yellow-600", bg: "bg-yellow-100" },
  "جغرافيا": { icon: "map", color: "text-teal-500", bg: "bg-teal-100" },
  "علوم": { icon: "dna", color: "text-pink-500", bg: "bg-pink-100" },
  "تاريخ": { icon: "landmark", color: "text-amber-600", bg: "bg-amber-100" },
  "فيزياء": { icon: "atom", color: "text-violet-500", bg: "bg-violet-100" },
  "كيمياء": { icon: "flask", color: "text-cyan-500", bg: "bg-cyan-100" },
  "تربية إسلامية": { icon: "moon", color: "text-green-600", bg: "bg-green-100" },
  "لغة عربية": { icon: "book", color: "text-rose-500", bg: "bg-rose-100" },
  "حاسوب": { icon: "monitor", color: "text-sky-600", bg: "bg-sky-100" },
  "فنون": { icon: "palette", color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
  
  // New Topics
  "أحياء": { icon: "activity", color: "text-emerald-600", bg: "bg-emerald-50" },
  "علوم الأرض": { icon: "mountain", color: "text-stone-600", bg: "bg-stone-100" },
  "لغة إنجليزية": { icon: "message-circle", color: "text-blue-600", bg: "bg-blue-50" },
  "لغة فرنسية": { icon: "message-square", color: "text-indigo-500", bg: "bg-indigo-50" },
  "تربية مالية": { icon: "coins", color: "text-lime-600", bg: "bg-lime-100" },
  "تربية رياضية": { icon: "dumbbell", color: "text-red-500", bg: "bg-red-100" },
  
  "mix": { icon: "sparkles", color: "text-slate-600", bg: "bg-slate-100" }
};
