<div align="center">

# 🎓 SPGP — AI Student Performance & Grade Prediction

### *An LLM-powered academic support system that predicts student grades and generates personalised study guidance.*

![Status](https://img.shields.io/badge/status-prototype-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Made with](https://img.shields.io/badge/made%20with-React%20%2B%20Claude%20AI-7c3aed)
![University](https://img.shields.io/badge/AlMaarefa%20University-CSIS-0f766e)

**Selected Topics — Computer Science and Information Systems Department · AlMaarefa University**

[Demo flow](#-demo-flow) · [Quick start](#-quick-start) · [Architecture](#%EF%B8%8F-architecture) · [Prompts](#-prompt-design) · [Team](#-team)

</div>

---

## 📖 About

**SPGP** is an AI-driven academic platform that analyses anonymised student performance data and uses **Claude Sonnet 4** to:

- 🎯 Predict each student's final grade category (**High / Moderate / Low / Fail**)
- 🚨 Detect academic risk factors (low attendance, weak quiz performance, etc.)
- 💡 Generate personalised study recommendations with priorities and citations
- 💬 Answer free-form questions from students and instructors via natural language chat

The system serves two roles — **students** see their personal dashboard, and **instructors** see a class-wide overview with intervention alerts.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Two role-based dashboards** | Distinct UIs for students and instructors |
| 🤖 **Structured AI output (JSON)** | Recommendations returned as strict JSON schema with priority levels |
| 💬 **Free-form AI chat** | Ask the AI anything about your data — markdown-formatted replies |
| 🔍 **Risk factor detection** | Automatically flags critical issues (attendance, scores, trends) |
| 📊 **Real-time analytics** | Animated donuts, progress bars, colour-coded predictions |
| 🛡️ **Privacy-first design** | Only anonymised metrics sent to the LLM — no PII leaves the device |
| 🔁 **Graceful fallback** | Local fallback responses if the API fails — UI never breaks |
| ⚡ **Latency tracking** | Every AI response shows response time + model used |

---

## 🚀 Quick Start

### Option 1 — Run the standalone HTML (easiest)

Just open `spgp.html` in any modern browser. You'll be prompted for your Anthropic API key on first launch.

```bash
# Clone the repo
git clone https://github.com/loui9111/spgp-prototype.git
cd spgp-prototype

# Open in browser (macOS)
open spgp.html

# Open in browser (Windows / Linux)
# Just double-click spgp.html
```

> 💡 No API key? The app still works using local fallback responses (with a clearly-marked "fallback" badge).

### Option 2 — Use the JSX component in a React project

```bash
# In your existing React project
cp spgp.jsx src/App.jsx

# Add your API key to .env
echo "VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Run
npm run dev
```

### Get an API key

Sign up at **[console.anthropic.com](https://console.anthropic.com/)** to get a free API key. ⚠️ **Never commit it to GitHub.**

---

## 🎬 Demo Flow

A complete walkthrough that hits every rubric criterion:

1. **Login screen** → click **"Student View"**
2. View the 4 course cards — note the colour-coded predictions (green = High, red = Fail)
3. Click **Database Systems** (predicted: Fail) → view detailed risk factors
4. Wait for AI recommendations → see the priority-coded action items
5. Click the **"JSON" toggle** → see the structured AI response
6. Scroll to **"Ask the AI"** → click a suggestion chip → get a conversational reply
7. Log out → click **"Instructor View"**
8. Browse the class table → use filters → spot the intervention alert
9. Ask the AI: *"Suggest interventions for at-risk students"* → see contextual analysis

---

## 🏗️ Architecture

```
┌──────────────────────────┐                    ┌──────────────────────┐
│      React Frontend      │  anonymised data   │   Anthropic API      │
│  (single-page app)       │ ─────────────────► │   Claude Sonnet 4    │
│                          │                    │                      │
│  ┌────────────────────┐  │                    └──────────┬───────────┘
│  │  Student Dashboard │  │                               │
│  │  Instructor View   │  │   structured JSON / markdown  │
│  │  Chat Panel        │  │ ◄─────────────────────────────┘
│  └────────────────────┘  │
│                          │
│  Render predictions,     │
│  recommendations, chat   │
└──────────────────────────┘
```

### Two LLM use cases demonstrated

1. **Structured Output** → AI returns valid JSON matching a strict schema
   ```json
   {
     "summary": "...",
     "confidence": 0.85,
     "recommendations": [
       { "area": "Attendance", "action": "...", "priority": "high" }
     ],
     "citations": ["..."]
   }
   ```

2. **Free-form Chat** → AI returns markdown (bold, bullets, code) using the user's data as context

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build tool | Vite *(for JSX version)* |
| Styling | Vanilla CSS + custom design system |
| Icons | [Tabler Icons](https://tabler.io/icons) (web font) |
| Fonts | Outfit + IBM Plex Mono (Google Fonts) |
| LLM | Claude Sonnet 4 via [Anthropic Messages API](https://docs.anthropic.com/) |

---

## 🧠 Prompt Design

### Recommendation prompt (structured JSON output)

```
You are an academic advisor AI for the SPGP system at AlMaarefa University.

Anonymized student data (no PII) for {course}:
- Attendance: {attendance}%
- Quiz Average: {quizAvg}%
- Predicted Grade Category: {predicted}
- Detected Risk Factors: {risks}

Return ONLY valid JSON (no markdown):
{
  "summary": "one motivating sentence (max 22 words)",
  "confidence": 0.00,
  "recommendations": [
    {"area":"...","action":"...","priority":"high|medium|low"}
  ],
  "citations": ["..."]
}
```

### Chat prompt (free-form output)

```
ROLE OF USER: {student | instructor}
CONTEXT (anonymised data): {dataset}
USER QUESTION: {question}

Respond in markdown (bold, bullets, code) under 150 words.
Be supportive and actionable. Do not invent data not in the context.
```

---

## 🛡️ Responsible AI Practices

| Practice | How we implemented it |
|---|---|
| 🔒 **No PII sent to LLM** | Only numeric metrics and course codes are included in prompts |
| 👁️ **Privacy notice** | Visible banner on login + below every chat input |
| 📚 **Citations required** | Recommendation prompts ask the AI to cite sources |
| 🛟 **Error handling** | Every API call has a deterministic local fallback — UI never breaks |
| ⏱️ **Latency display** | Each AI response shows response time and model used |
| 🚫 **No hardcoded keys** | API key prompted at runtime or loaded from `.env` |
| 💚 **Constructive tone** | Prompts explicitly request supportive, non-judgmental language |
| 🎯 **No data hallucination** | Prompts instruct the model to never invent data not in the context |

---

## 📁 Repository Structure

```
spgp-prototype/
├── spgp.html       # Standalone demo (open directly in browser)
├── spgp.jsx        # React component (for use in build-based projects)
├── README.md       # You're reading it
├── LICENSE         # MIT
└── .gitignore      # Excludes .env and node_modules
```

---

## 🎓 Rubric Mapping

This project addresses every criterion of the Selected Topics rubric:

| Criterion | Weight | Where to find it |
|---|---|---|
| Idea & Problem Definition | 10% | Login screen description, README intro |
| UI/UX Design | 20% | Custom design system, animated donuts, role-based dashboards |
| LLM Integration | 20% | Two distinct prompts (JSON + chat), API client with auth headers |
| Output Formatting | 20% | Structured JSON view + markdown rendering for chat |
| Teamwork & Presentation | 15% | All four members credited; demo flow documented |
| Documentation & Testing | 15% | This README + inline code comments + fallback paths |

---

## 👥 Team

| Member | Role |
|---|---|
| **Yazan Alhaj Hassan** | Frontend & UI/UX |
| **Loai Albalawi** | LLM integration & prompt engineering |
| **Abdulaziz Alhumaid** | Data modelling & state management |
| **Mohammed Almarzouk** | Output formatting & error handling |

**Supervisor:** Dr. Noha Alharbi

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Source code may be reused for educational and non-commercial purposes.

---

## 🙏 Credits & Acknowledgements

- [React](https://react.dev/) — MIT License
- [Vite](https://vitejs.dev/) — MIT License
- [Tabler Icons](https://tabler.io/icons) — MIT License
- [Google Fonts](https://fonts.google.com/) — Open Font License (Outfit, IBM Plex Mono)
- [Anthropic Claude API](https://www.anthropic.com/) — used per Anthropic's commercial terms
- AlMaarefa University · CSIS Department · Selected Topics course

---

<div align="center">

**Built with care at AlMaarefa University · 2025**

⭐ *If you find this project useful, please consider starring the repo!*

</div>
