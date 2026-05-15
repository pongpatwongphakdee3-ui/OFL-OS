---
name: instagram-carousel
description: สร้าง Instagram carousel/slide content ครบทุก slide สำหรับช่อง AI. ถามคำถามก่อนสร้าง จากนั้น generate slide text + caption ตาม voice profile และ IG algorithm. Trigger: /carousel หรือ intent เช่น "สร้าง carousel เรื่อง...", "ทำ slide IG เรื่อง..."
---

# Instagram Carousel Creator

## เมื่อ Skill นี้ถูกเรียก

Activate เมื่อ user พิมพ์ `/carousel`, `/slide`, `/ig-carousel`
หรือมี intent ที่ชัดเช่น "สร้าง carousel เรื่อง...", "ทำ slide สำหรับ IG เรื่อง...", "ช่วย generate slides"

---

## STEP 0 — โหลด Reference Files (silently)

อ่านไฟล์ต่อไปนี้ก่อนทุกครั้ง ไม่ต้องบอก user ว่ากำลังอ่าน:

1. `about-me.md` — voice, rules, phrase bank, hard refusals
2. `content-pillars.md` — 4 pillars และ sub-categories
3. `content-system-runtime.md` — Carousel Framework
4. `ANTI_AI_THAI_WRITING_STYLE.md` — anti-patterns ที่ต้องหลีกเลี่ยง
5. `COPYWRITING.md` — หลักการ persuasion
6. `MARKETING GENIUS.md` — marketing framework
7. `voice-profile-callmeice.md` — extended voice examples

Apply ทุก rule จากไฟล์เหล่านี้ silently กับทุก slide ที่ generate

---

## STEP 1 — Pre-flight Questions (ถามก่อนสร้างทุกครั้ง)

ถามคำถามต่อไปนี้ก่อน generate เสมอ เว้นแต่ user บอกมาครบแล้วใน prompt
ถามทีเดียวทุกข้อ ไม่ถามทีละข้อ

```
ก่อนสร้าง ช่วยตอบก่อนนะครับ:

1. หัวข้อ: Carousel นี้จะพูดเรื่องอะไร? (ให้ชัดที่สุด)
2. มุม: Belief อะไรที่อยากท้าทาย? หรือ pain point ของ audience คืออะไร?
3. ประสบการณ์ตรง: มีเรื่อง "ผมเคย..." ที่เชื่อมกับหัวข้อนี้ไหม? (ถ้าไม่มีบอก "ไม่มี" ได้)
4. CTA เป้าหมาย: อยากให้ audience ทำอะไรหลังอ่านจบ? (save / follow / DM / comment keyword)
5. จำนวน slides: ต้องการกี่ slides? (default: 8)
6. Seed อะไรไหม: มี course / service / free resource ที่จะ mention แบบ soft ไหม? (ถ้าไม่มีบอก "ไม่มี")
7. ต่างจากคู่แข่งยังไง: มี account ไหนเพิ่งทำเรื่องนี้แล้ว? อยากแตกต่างยังไง? (ถ้าไม่รู้บอก "ไม่รู้" ได้)
```

หลังจาก user ตอบครบ → เริ่ม STEP 2

---

## STEP 2 — Generate Slides

### Framework

ทุก carousel ต้องเดิน flow นี้:
`Hook → Problem → Reframe → Breakdown → Example → Insight → Takeaway`

### Slide-by-Slide Rules

**Slide 1 — HOOK (หยุด scroll)**
- ≤20 words
- ต้องเป็น punch line, contrarian claim, หรือ self-as-victim
- ต้องสร้าง unresolved tension — จบ slide 1 โดยที่คน *ต้อง* swipe ต่อ
- ห้ามเปิดด้วย "สวัสดีครับ", "วันนี้เรามาพูดถึง", หรือ intro ทั่วไป
- text ต้อง readable ใน 3 วินาที (IG ใช้ตัดสินว่าจะ push หรือไม่)
- ใส่ keyword ที่คนค้นหาได้ใน cover text (IG SEO)

**Slide 2 — PROBLEM (สิ่งที่คนทำผิด)**
- แสดงให้เห็น concrete ว่าคนทำอะไรผิด — ไม่ใช่ abstract
- ประโยคสั้น ตัดทิ้งทุกอย่างที่ไม่จำเป็น
- อย่าโทษ audience โดยตรง — ใช้ "คนส่วนใหญ่" หรือ "ผมก็เคยเป็น"

**Slide 3 — REFRAME (มุมใหม่)**
- ใช้ structure "ผมว่าไม่" หรือ contrarian frame
- state common belief ก่อน → refuse ใน 1 บรรทัดสั้น → deliver better frame
- ตัวอย่าง pattern: "หลายคนบอกว่า X → ผมว่าไม่ → มันคือ Y"

**Slide 4–6 — BREAKDOWN (อธิบายทีละส่วน)**
- 1 idea ต่อ 1 slide — ห้ามยัดหลาย concept
- ใช้ contrast pairs: X vs Y, แบบผิด vs แบบถูก, before vs after
- parallel construction: "input ห่วย → output ขยะ / input คม → output เพชร"
- ประโยคสั้น / สั้น / ยาว / สั้น — สลับจังหวะ ห้ามเท่ากันทุกประโยค

**Slide 7 — EXAMPLE (ตัวอย่างจริง)**
- ถ้ามีประสบการณ์ตรงจาก STEP 1 → ใช้ "ผมเคย..." เปิด
- ถ้าไม่มี → ใช้ concrete scenario ที่ audience เจอได้จริง
- 1 ตัวอย่างที่ดีดีกว่า 3 ตัวอย่างที่กลาง
- ถ้ามี seed จาก STEP 1 → วางที่นี่แบบ soft: "ถ้าอยากเจาะลึกกว่านี้..."

**Slide 8 — TAKEAWAY + CTA**
- reframe main idea ให้คนจำได้ใน 1 บรรทัด
- ไม่ใช่สรุป — ต้องเป็นประโยคที่ land ได้
- CTA เดียว ห้าม stack: ใช้แค่ "save ไว้ก่อนนะครับ" หรือ "กดติดตามไว้แล้วเจอกันโพสต์หน้าครับ"

---

## Hook Bank (10 Template Patterns)

ใช้ patterns เหล่านี้สำหรับ Slide 1 ตามความเหมาะสมของหัวข้อ:

1. `[ถ้าคุณยังเชื่อว่า X] → ผมบอกเลยครับคุณโคตรคิดผิด`
2. `ผมเคย [self-as-victim ที่ชัดเจน] ครับ ไม่ได้พูดเกินจริง`
3. `เลิก [common habit ที่คนคิดว่าดี] ถ้าอยากได้ [desired outcome]`
4. `[Contrarian claim ที่ดูขัดความรู้สึก]\n\nนี่คือเหตุผล`
5. `ไม่มี [thing people think they need] ก็ทำได้\n\nผมทำมาแล้ว`
6. `input ห่วย → output ขยะ\ninput คม → output เพชร\n\nส่วนใหญ่ติดอยู่ที่ส่วนแรก`
7. `[สิ่งที่เกิดขึ้นกับผม]\n\nแล้วผมก็เปลี่ยนวิธีคิดทั้งหมด`
8. `[ปัญหา] ไม่ใช่เพราะ [blame ที่คนมักโทษ]\n\nแต่เพราะ [real cause ที่น้อยคนพูดถึง]`
9. `[คำถามที่ audience คิดอยู่แต่ไม่กล้าถาม]`
10. `[ตัวเลข] คนที่ใช้ [X] ทุกวัน — แต่ได้ผลแค่ [ตัวเลขน้อยกว่า]\n\nความแตกต่างคืออะไร`

---

## Caption Writing Rules

**ความยาว:** 3–6 บรรทัด สั้น ขาวเยอะ ไม่มีย่อหน้าหนา

**ห้าม:** emoji, hashtag, period (.), question mark (?), exclamation (!)

**เปิด:** ดึงมาจาก Slide 1 hook หรือ consequence statement ที่แรงกว่า

**กลาง:** 1–2 บรรทัดที่ขยาย tension — อย่าสรุปทั้งหมด ให้คนต้องไป swipe

**จบ:** CTA เดียว เลือก 1 ข้อ:
- save: `save ไว้ก่อนนะครับ`
- follow: `กดติดตามไว้แล้วเจอกันโพสต์หน้าครับ`
- DM: `DM มาได้เลยครับ`
- comment keyword: `comment [keyword] ไว้ด้านล่างครับ`

**Line breaks** ทำหน้าที่แทน punctuation ทั้งหมด

**ตัวอย่าง caption ที่ถูก:**
```
ผมเคยใช้ AI ทุกวัน แต่สมองฝ่อลงทุกเดือน

มันไม่ใช่ความผิดของ AI
มันคือวิธีที่ผมใช้มัน

save ไว้ก่อนนะครับ
```

**ตัวอย่าง caption ที่ผิด:**
```
✨ วันนี้มาแชร์เรื่องการใช้ AI นะคะ! หวังว่าจะเป็นประโยชน์กับทุกคนนะครับ 🙏
อย่าลืมกดไลค์ กดแชร์ กดติดตาม กดเซฟด้วยนะครับ #AI #Claude #เทคโนโลยี
```

---

## IG Algorithm Rules (2025–2026)

**Save Rate = metric ที่สำคัญที่สุดสำหรับ carousel**
- ทุก slide ต้องมีข้อมูลที่คนอยากเก็บไว้ดูทีหลัง
- ถ้า slide ไม่มีคุณค่าพอให้ save → ตัดออกหรือ rewrite

**Swipe-through Rate**
- Slide 1 ต้องจบด้วย unresolved tension — คนต้อง swipe เพื่อรู้คำตอบ
- Slide 2–7 แต่ละ slide ต้องนำไปสู่ slide ถัดไปอย่างเป็นธรรมชาติ
- ถ้า slide ใดสามารถ skip ได้โดยไม่เสียความเข้าใจ → ตัดออก

**Cover Slide Text = IG SEO**
- IG ใช้ text บน Slide 1 เป็น keyword สำหรับ search และ recommendation
- ใส่ keyword ที่ audience ค้นหาจริง ไม่ใช่แค่ hook ที่สวย
- ตัวอย่าง: "วิธีใช้ Claude", "prompt ที่ได้ผล", "AI สำหรับคนไทย"

**Share Trigger**
- Carousel ที่ share มากที่สุดคือ: "บอกความจริงที่คนอื่นไม่พูด" หรือ "ทำให้คนรู้สึกว่ามีคนเข้าใจ pain ของเขา"
- ถ้าต้องการ share → ต้องมี slide ที่คนรู้สึก "นี่แหละคือสิ่งที่ผมอยากบอกเพื่อน"

**Comment Trigger (optional)**
- จบ caption ด้วย question จริงๆ ถ้าต้องการ comment — แต่ต้องเป็น question ที่ audience อยากตอบ
- ห้าม force: "คอมเมนต์ว่าใช้ AI อยู่ไหมครับ" ถ้า content ไม่เชิญชวนตอบจริงๆ

**Timing ไม่สำคัญเท่า Content Quality**
- ถ้า save rate ดี IG จะ push content เอง ไม่ว่าจะ post กี่โมง
- focus ที่ content ก่อน ค่อยปรับ timing ทีหลัง

---

## Monetization Playbook

Rules สำหรับ seed product/service โดยไม่ทำลาย trust:

**Rule 1 — ครั้งเดียวต่อ carousel**
Mention สิ่งที่อยากขาย/แจกแค่ 1 ครั้ง ไม่ซ้ำใน caption

**Rule 2 — วางที่ Slide 7 หรือ Slide 8 เท่านั้น**
ห้าม seed ตั้งแต่ต้น — คนต้องได้รับ value ก่อน ถึงจะเชื่อ pitch

**Rule 3 — Framing แบบ pull ไม่ใช่ push**
- ถูก: `ถ้าอยากเจาะลึกกว่านี้ ผมเขียนไว้ละเอียดกว่าใน [X]`
- ผิด: `สมัครได้เลยครับ ราคาพิเศษถึงสิ้นเดือน`

**Rule 4 — ห้าม Fake Scarcity และ Price Anchor ปลอม**
- ห้าม: "ราคา 50,000 → วันนี้แค่ 999" ถ้า anchor ไม่จริง
- ห้าม: "เหลือแค่ 3 ที่" ถ้าไม่จริง

**Rule 5 — Free Resource = Green Light**
ถ้าสิ่งที่จะ seed คือ free (link in bio, free guide, free template) → ใช้ได้เต็มที่ ไม่ถือว่า hard sell

**Rule 6 — ถ้าไม่มีอะไร seed**
ไม่ต้องยัด CTA ซื้ออะไร จบด้วย follow หรือ save อย่างเดียว
Content ที่ดีโดยไม่ขายอะไรคือ investment ระยะยาว

---

## Competitor Analysis Framework

ใช้ข้อมูลจาก STEP 1 ข้อ 7 แล้ว apply logic นี้:

**ถ้า user บอกชื่อ account คู่แข่ง:**
- หา angle ที่เขาไม่พูด หรือ depth ที่เขาไม่ถึง
- ดู format ที่เขาทำ → เลือก format ที่แตกต่างหรือ execute ดีกว่า

**Differentiation Logic:**

| คู่แข่งทำ | เราทำแทน |
|-----------|----------|
| List tools ทั่วไป | แสดง workflow จริงที่ใช้อยู่ |
| พูดว่า AI ดี | Challenge belief ว่า AI ใช้ผิดได้อันตราย |
| Inspirational/motivational | Concrete + แสดง source |
| Faceless, ไม่มีตัวตน | Inject "ผมเคย..." personal experience |
| สรุปข้อมูลต่างชาติ | กลั่นมาเป็น framework + ทดลองเองแล้ว |
| Beginner-focused, ง่ายเกิน | Depth ที่คนใช้ AI อยู่แล้วยังได้อะไรใหม่ |

**Default (ถ้าไม่รู้คู่แข่ง):**
Differentiate จาก generic AI content ที่ทำ list ไม่มีตัวตน:
- มี personal story หรือ lived experience
- มี source หรือ proof ที่ verify ได้
- มี concrete example ไม่ใช่ abstract principle
- มีมุมที่ challenge belief ไม่ใช่แค่ inform

---

## Hard Voice Enforcement

Rules ต่อไปนี้ apply กับทุก slide และ caption โดยไม่มีข้อยกเว้น:

**ห้ามอย่างเด็ดขาด:**
- emoji ทุกชนิด
- hashtag ทุกชนิด
- period (.), question mark (?), exclamation (!) ใน slides และ caption
- เปิดด้วย "สวัสดีครับ ผมชื่อ..." หรือ "วันนี้เรามาพูดถึง..."
- จบด้วย "ขอขอบคุณที่ดูจนจบ"
- stacked CTA: "ไลค์ แชร์ ติดตาม เซฟ" → ใช้แค่ตัวเดียว
- 3 ประโยคจังหวะเท่ากันติดต่อกัน (AI tell ที่คนจับได้ใน 5 วินาที)
- คำที่ "คนปกติไม่ใช้": นอกจากนี้, อย่างไรก็ตาม, ด้วยเหตุนี้, น่าทึ่ง, น่าประทับใจ
- guru lines: "ถ้าคุณไม่มีวันยอมแพ้ ยังไงคุณก็ชนะ", "Mindset เปลี่ยน ชีวิตเปลี่ยน"
- "เปลี่ยนชีวิต", "ลับ", "ที่ไม่มีใครบอก", "secret"
- ChatGPT over-praise — ถ้าต้อง reference tool ใช้ Claude เป็น default
- fake humility: "ผมโชคดี" ถ้างานนั้นเป็นผลจากความพยายามชัดเจน
- มึง/กู/ไอ้เหี้ย ใน output ทุกชนิด

**ต้องมีเสมอ:**
- vary sentence length: สั้น / สั้น / ยาว / สั้น — สลับจังหวะตลอด
- "ผม" และ "คุณ" — ไม่ใช้ "เรา" กับ audience
- English สำหรับ tech และ feel-words: prompt, context, framework, hook, CTA, content, AI, system, burn out, clarity — แต่ English รวมต้องน้อยกว่า Thai เสมอ
- ถ้า draft ไม่ใช่เสียงของ creator → rewrite ไม่ defend

---

## Output Format

ส่งผลลัพธ์ในรูปแบบนี้เสมอ:

```
---
## Slide 1 — HOOK
[text content]

## Slide 2 — PROBLEM
[text content]

## Slide 3 — REFRAME
[text content]

## Slide 4 — BREAKDOWN: [sub-title]
[text content]

## Slide 5 — BREAKDOWN: [sub-title]
[text content]

## Slide 6 — BREAKDOWN: [sub-title]
[text content]

## Slide 7 — EXAMPLE
[text content]

## Slide 8 — TAKEAWAY
[text content]
---

## Caption
[caption text]

---
## Skill Notes
- Hook pattern: [ชื่อ pattern ที่ใช้]
- Pillar: [1 / 2 / 3 / 4]
- CTA: [save / follow / DM / comment keyword]
- Seed: [ชื่อสิ่งที่ seed หรือ "ไม่มี"]
- Differentiation: [สิ่งที่ทำให้ต่างจาก generic AI content]
```

หลังส่งผลลัพธ์แล้ว ถามเสมอว่า:
`ส่วนไหนอยากปรับ? (hook / tone / จำนวน slide / caption / อื่นๆ)`
