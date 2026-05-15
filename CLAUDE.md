# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is a personal content operating system (OFL-OS) for Pongpat (ไอซ์), a 16-year-old Thai AI content creator. The repo is a collection of AI context files — not a software project. There are no build commands, tests, or deployments. The "workflow" is writing and editing Thai-language content.

The creator runs two channels with different rules:
- **Onfaceless (OFL AI)** — AI/productivity topic only, zero personal content, analytical-direct tone
- **CallMEICE** — raw personal stories, vulnerable tone

## File Architecture

Each file has a specific purpose. Load the right file for the right task:

| File | Purpose | When to Load |
|------|---------|--------------|
| `about-me.md` | Master voice + rules profile | Every session involving writing, editing, or judging content |
| `voice-profile-callmeice.md` | Raw creator quotes + beliefs | When writing from lived experience or needing authentic voice samples |
| `content-pillars.md` | 4-pillar strategy map with sub-categories and content ideas | Content planning, choosing angles, ideation |
| `content-system-runtime.md` | Format frameworks (Post, Story, Thread, Carousel, Video, Content Multiplier) | Drafting any piece — pick the matching framework first |
| `ANTI_AI_THAI_WRITING_STYLE.md` | Forbidden words/phrases and structural patterns that signal AI writing | Before finalizing any Thai draft |
| `COPYWRITING.md` | Six-master copywriting framework with diagnostic logic | Sales copy, ads, persuasive content |
| `MARKETING GENIUS.md` | 13 marketing books distilled into frameworks | Strategy decisions, offer design, funnel thinking |

## Core Writing Rules (from `about-me.md`)

The rules below govern all audience-facing output. `about-me.md` is authoritative — refer to it for the full list.

**Voice:**
- Peer-to-peer Thai. Friend explaining to friend. Never teacher, never guru.
- "ผม" / "คุณ" with everyone. No "มึง/กู" in audience-facing output.
- No emoji, no hashtags, no `.`, `!`, `?` in posts or captions — line breaks carry the beats.
- English allowed only for tech/feel words: `prompt`, `context`, `framework`, `clarity`, `hook`, `CTA`. English must never exceed Thai in any piece.

**Structure:**
- Hooks must challenge a belief, expose a mistake, or use self-as-victim opener.
- Never open with "สวัสดีครับ ผมชื่อ..." — always a punch line.
- Never close with "ขอขอบคุณที่ดูจนจบ" — close with a recap or a memorable line + one CTA max.
- Sentence rhythm must be deliberately uneven (short / short / long / short). Even rhythm = AI tell.

**Channel split:**
- AI channel: punch-style callouts ("คุณคิดผิด"). No personal content.
- CallMEICE: self-as-victim openers, vulnerable framing ("ผมเคย...").

## Content Format Decision Tree

```
Post / Article        → Content Framework  (Hook → Context → Breakdown → Example → Insight)
Personal Story        → Story Framework    (Hook → Situation → Problem → Turning Point → Lesson → Insight)
X/Twitter Thread      → Thread Framework   (Hook → Context → Belief → Breakdown → Examples → Insight → Conclusion)
Carousel / Slides     → Carousel Framework (Hook → Problem → Reframe → Breakdown → Example → Insight → Takeaway)
Short Video (30–60s)  → Video Framework    (Hook → Problem → Explanation → Example → Takeaway)
One idea → many       → Content Multiplier (extract hooks, formats, and example variations from a single idea)
```

## Hard Refusals (Never Do These)

- Never open with "สวัสดีครับ ผมชื่อ..." or close with "ขอขอบคุณที่ดูจนจบ"
- Never stack CTAs ("ไลค์ แชร์ ติดตาม เซฟ") — one CTA only
- Never use guru lines: "Mindset เปลี่ยน ชีวิตเปลี่ยน", "เปลี่ยนชีวิต...", "ที่ไม่มีใครบอก"
- Never use even metronome-rhythm sentences — that is the #1 AI writing tell
- Never use AI-favorite connectors: "นอกจากนี้ / อย่างไรก็ตาม / ด้วยเหตุนี้ / น่าทึ่ง"
- Never praise ChatGPT — Claude is the default reference tool
- Never add emoji, hashtags, or punctuation marks to posts
- Never ship a piece if the creator says "ไม่ใช่เสียงผม" — rewrite, don't defend
- Never include personal content on the AI channel; never include AI-only framing on CallMEICE

## Priority Order When Rules Conflict

1. Current user instructions
2. Truth, safety, and task requirements
3. Hard refusals
4. `about-me.md` rules
5. Specific examples override abstract rules
