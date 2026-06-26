<div align="center">

# 🔦 SULO

**Understandable for every Filipino.**

*Sulo* — Filipino for **torch**. An AI legal-literacy platform that brings ordinary Filipinos out of the dark on the documents that decide their rights — without ever pretending to be a lawyer.

![Status](https://img.shields.io/badge/status-ONGOING-E07B00?style=flat-square)
![Hackathon](https://img.shields.io/badge/ACM%20TechSprint-Asteria-17150F?style=flat-square)
![Positioning](https://img.shields.io/badge/literacy-not%20advice-B25E00?style=flat-square)

</div>

> *A right you cannot read, in a language you weren't taught, explained by a lawyer you can't afford — is not really a right at all.*

SULO turns dense legal documents into instant, conversational clarity. Point your phone at a contract, a notice, or a loan agreement — by upload, photo, or voice — and SULO explains, in plain language and in your own tongue, what the document is, what it obligates you to do, what deadlines it carries, and which clauses deserve a second look. **It gives legal understanding, not legal advice** — and it routes you to real help when you need it, so that safety lives in comprehension, not in dense legal jargon.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [The Problem](#-the-problem)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Technologies Used](#-technologies-used)
- [Setup Instructions](#-setup-instructions)
- [Project Status & Roadmap](#-project-status--roadmap)
- [Privacy & Data Handling](#-privacy--data-handling)
- [Team Members & Roles](#-team-members--roles)
- [Concept Glossary](#-concept-glossary)
- [Submission Checklist](#-submission-checklist)

---

## 🧭 Project Overview

| | |
| :--- | :--- |
| **Project** | SULO — AI Legal-Literacy & Document-Understanding Platform |
| **Team** | Siryus |
| **Selected Project Case** | Project Case 2: AI-Powered Study Companion for Filipino Learners |
| **Scope / Focus** | Employment & Labor *(Minimum Viable Product)* |
| **Tagline** | Understandable for every Filipino |
| **Positioning** | Literacy, not advice |
| **Theme** | *Asteria: Illuminate the Future* — SULO is the torch |

SULO is an AI-powered platform that helps Filipinos understand complex legal documents in plain language and in their preferred language (English, Filipino/Taglish, Cebuano). It does **not** provide legal advice — it builds comprehension so people can ask better questions and make informed decisions, and it connects them to legitimate help (the **Public Attorney's Office** and **DOLE**) when an issue needs a professional.

For the MVP, SULO focuses on **employment and labor documents** — a high-impact, relatable domain grounded in a focused, verifiable knowledge base (the Philippine Labor Code and DOLE rules).

---

## 🛑 The Problem

**1. The language barrier in law.** Everyday documents that govern Filipinos' lives — employment contracts, rental agreements, loan forms, government notices, court summons — are written in technical English, dense legal jargon, or overly complex Filipino. Ordinary citizens are systematically locked out of understanding their own rights and obligations.

**2. Real-world consequences.** Signing documents blindly leads directly to exploitation and financial harm:

- **Labor exploitation** — unpaid overtime, illegal deductions, missing 13th-month pay, and unremitted SSS/PhilHealth contributions. DOLE records cite a lack of awareness as a primary reason these abuses persist.
- **Predatory lending** — over **47.5 million** Filipinos used loan apps in 2023, and countless borrowers locked themselves into impossible repayment terms and hidden fees they did not comprehend.
- **Navigational fear** — many victims never file complaints because the formal legal system feels too complicated and intimidating to navigate.

The law exists. The rights exist. **The gap is in comprehension.**

---

## ✨ Features

- **📸 Multimodal input** — capture a document by camera photo (OCR), file upload, or voice (ASR), including natural Taglish code-switching.
- **🗣️ Plain-language & native translation** — strips away jargon and explains the document in the user's chosen language, with side-by-side *original ↔ plain-language* views and Text-to-Speech playback.
- **🔍 Entity & risk recognition** — automatically extracts party names, monetary values, hidden fees, interest rates, and critical deadlines.
- **🚩 Red-flag detection** — isolates unusual or potentially illegal clauses (predatory terms, non-compete overreach) so users know exactly what to review.
- **🧠 Hallucination-resistant answers** — every explanation is grounded in a curated, date-stamped knowledge base of real legal provisions via retrieval (RAG), not the model's memory.
- **🤝 Guardrails & escalation** — strictly literacy, not advice. When an escalatable issue is detected, SULO routes the user to the Public Attorney's Office (free legal aid) or the DOLE hotline.
- **♿ Built for everyone** — voice in/out and plain-language design make SULO usable across languages and literacy levels.

---

## 🔄 How It Works

1. **Capture & extract (OCR / ASR)** — read a photographed or uploaded document, or transcribe spoken Filipino/Taglish.
2. **Classify & route** — detect the language profile and document type to load the right legal compliance framework.
3. **Ground semantically (RAG + vector store)** — query a curated index of true legal provisions (Labor Code, current amendments) to prevent AI hallucinations.
4. **Comprehend locally** — a compressed, quantized LLM highlights deadlines, monetary balances, and suspicious clauses.
5. **Deliver clarity (TTS)** — the user reads or listens to an interactive, side-by-side translation, understanding their rights without crossing into legal-advice territory.

---

## 🛠️ Technologies Used

| Layer | Stack |
| :--- | :--- |
| **Frontend** | React + Vite *(PWA, mobile-responsive)* |
| **AI / Inference** | Quantized LLM *(compressed, on-device-friendly inference)* |
| **Document capture** | OCR *(image → text)* · ASR *(speech → text)* |
| **Output** | TTS *(text → speech)* |
| **Knowledge & grounding** | RAG pipeline + Vector Store semantic index over a date-stamped legal corpus |
| **Language / document routing** | Automatic language + document-type detection |
| **Deploy / CI** | Vercel · GitHub Actions (`npm ci` → `npm run build`) |

> 📚 **Legal anchors** in the knowledge base include the **Philippine Labor Code** (Presidential Decree No. 442) and the **Filipino Sign Language Act** (RA 11106).

---

## 👥 Team Members & Roles

**Team Siryus**

| Member | Role |
| :--- | :--- |
| Zarrah Exekiel Valles | Team Representative & Main Developer |
| Vincent Adolf Sablay Adversary | Design |
| Vehniah P. Samson | AI Integration |
| Marc Justin Lee G. Granada | Research & Documentation |



### 📜 Team Rules & Ways of Working

- **Branching:** work on feature branches; open a PR into `main`.
- **CI gate:** every push and PR runs `npm ci` → `npm run build`; keep `main` green.
- **Commits:** clear, present-tense messages (e.g., `add risk-flag card`).
- **Reviews:** at least one teammate reviews each PR before merge.
- **Communication:** raise blockers early; keep key decisions documented in the repo.

---

## 📖 Concept Glossary

| Term | Meaning |
| :--- | :--- |
| **SULO** | Filipino for *torch* — bringing clarity to hidden, dark legal clauses. |
| **Scan / Upload (OCR)** | Turning an image of a document into machine-readable text. |
| **Voice Query (ASR)** | Asking about obligations by speaking, including Taglish code-switching. |
| **Plain Language (TTS)** | The spoken/written overview — *"Ano ang ibig sabihin nito sa madaling salita?"* |
| **Red Flag** | A clause heavily skewed against the user or potentially illegal under DOLE / Philippine regulations. |
| **RAG** | Retrieval-Augmented Generation — grounding answers in real legal sources to prevent hallucination. |

---

## ✅ Submission Checklist

- [x] Repository visibility set to **Public**
- [x] This `README.md` committed to the repository root
- [ ] Live demo link added
- [ ] Walkthrough video link added
- [ ] `frontend/.env.example` present and documented
- [ ] CI workflow passing on `main`

---

<div align="center">

**Built for the ACM TechSprint hackathon · Theme: *Asteria — Illuminate the Future***

Made with care by **Team Siryus** 🔦

</div>

