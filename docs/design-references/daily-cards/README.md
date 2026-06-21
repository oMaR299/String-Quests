# Daily Story Cards — Design References

The parent home "ملاحظات اليوم" section is built to match four reference apps the
user provided (pet-schedule app, "my plan for today" wellness app, calorie
tracker, fitness dashboard). The instruction was explicit: **match the look and
the colors exactly, even where they break from the current app style.**

## Save the original screenshots here

Drop the 4 reference PNGs into this folder so they live with the code:

```
docs/design-references/daily-cards/
  ref-1-pet-schedule.png
  ref-2-wellness-plan.png
  ref-3-calorie-tracker.png
  ref-4-fitness-dashboard.png
```

(The raw image bytes can't be pulled out of the chat transcript, so the spec
below is the source of truth until the PNGs are added.)

## Locked visual spec

**Overall feel:** soft, airy, playful, premium. Lots of whitespace, everything
heavily rounded, pastel card fills, bold colorful focal numbers, friendly — the
opposite of a clinical dashboard.

**Cards**
- Radius ~28px (`rounded-[28px]`).
- Each theme card is its **own pastel fill** (not white-on-gray).
- Soft, diffuse, low-opacity shadow — never harsh.
- Generous padding (`p-5`).
- Colorful bold icon in a rounded chip, top-start.
- Score block sits in a soft **white inner panel** so rings always pop.

**Pastel palette (per card)**
| Card | Fill | Icon | Accent |
|---|---|---|---|
| في المدرسة | `#DCEFFA` sky | `#54B6E6` | `#2E8FCB` |
| التعلّم في البيت | `#FCEFC7` cream | `#FFB23E` | `#E08A00` |
| كيف كان شعوره | `#FBDDE2` pink | `#FF6F7A` | `#E14F5E` |
| التقدّم الأكاديمي | `#CFEBD6` mint | `#56CF92` | `#1F9D57` |
| المواظبة والحضور | `#E7E2FB` lavender | `#8E7DE0` | `#6C5BC4` |
| لحظة الفخر | `#E9F4D6` lime | `#FFC02E` | `#C28A00` |

**Scores = activity rings**
- Apple-Fitness ring colors: coral `#FF5A6E`, amber `#FFB23E`, teal `#3DD9C0`,
  blue `#54B6E6`, green `#56CF92`, purple `#8E7DE0`.
- Three render modes: `mini` (row of small rings + labels), `single` (one big
  ring, number in center), `multi` (concentric Apple-Fitness rings + legend).
- Numbers are the focal point: large, very heavy, colored to match the metric.

**Other reused elements**
- Completion checkmark badge ("اكتمل اليوم") — drives the "day completes this
  evening" mechanic; pending shows "يكتمل هذا المساء".
- Highlight + circular avatar + date pill for teacher praise.
- Small badges/pills, trophy glyphs for achievements.
- Week-day strip (`ح ن ث ر خ ج س`) = the "previous days" navigator.

**Kept constraints:** Cairo font, full RTL, Framer Motion springs honoring
`useReducedMotion`, Lucide icons (no emoji in rendered UI). Custom pastel hex
values are applied via inline styles (Tailwind v4 JIT can't see runtime color
classes).
