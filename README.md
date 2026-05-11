<div align="center">

# 🎓 SPGP — AI Student Performance & Grade Prediction

### *An LLM-powered academic support system that predicts student grades and generates personalised study guidance.*

![Status](https://img.shields.io/badge/status-prototype-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Made with](https://img.shields.io/badge/made%20with-React%20%2B%20Claude%20AI-7c3aed)
![University](https://img.shields.io/badge/AlMaarefa%20University-CSIS-0f766e)

**Selected Topics — Computer Science and Information Systems Department · AlMaarefa University**

🌐 **Live demo:** [`loui9111.github.io/spgp-prototype/spgp.html`](https://loui9111.github.io/spgp-prototype/spgp.html)

[How to test it](#-how-to-test-the-prototype) · [Get an API key](#-getting-an-anthropic-api-key) · [Demo flow](#-demo-flow) · [Team](#-team)

</div>

---

## 📖 About

**SPGP** is an AI-driven academic platform that analyses anonymised student performance data and uses **Claude Haiku 4.5** (Anthropic's LLM) to:

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

## 🚀 How to Test the Prototype

### Easy way — use the live demo (no install needed)

👉 **Open:** [`https://loui9111.github.io/spgp-prototype/spgp.html`](https://loui9111.github.io/spgp-prototype/spgp.html)

You'll see a popup asking for an Anthropic API key. You have two options:

#### 🟢 Option A — Use live AI (requires API credits)
1. Get a key from [console.anthropic.com](https://console.anthropic.com/) (see [section below](#-getting-an-anthropic-api-key))
2. Paste it into the popup → Click **Continue**
3. Real Claude AI responses will be generated for each course and chat message

#### 🟡 Option B — Use offline mode (no key, no cost)
1. Click **Skip** in the popup
2. The app works fully — recommendations and chat are pre-written fallback responses
3. Every AI response shows a `fallback` badge so you know it's not live AI
4. **The full UI flow still works** — perfect for quick UI demos

### Run locally instead

```bash
git clone https://github.com/loui9111/spgp-prototype.git
cd spgp-prototype
# Then double-click spgp.html — works in any modern browser
```

> ⚠️ **Note:** Opening `spgp.html` from your local file system (using `file://`) **won't work** for live AI calls — browsers block API requests from local files. Use the **GitHub Pages link** above, or host the file yourself on any HTTPS server.

---

## 🔑 Getting an Anthropic API Key

The prototype calls Claude Haiku 4.5 via the Anthropic API.

### ⚠️ Important: API ≠ Claude.ai subscription

Anthropic has **two completely separate billing systems**:

| Service | What it is | Used for |
|---|---|---|
| **Claude.ai** (Free/Pro/Max) | Chat website + mobile app | Talking to Claude in the chat UI |
| **Anthropic API** (pay-per-use) | Developer platform | Building apps that call Claude programmatically |

**A Claude Pro or Max subscription does NOT give you API access.** You need API credits separately.

### Steps to get an API key

1. **Go to** [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in (you can use the same account as Claude.ai, but billing is separate)
3. Verify your phone number if asked (one-time)
4. Add credits at [Settings → Billing](https://console.anthropic.com/settings/billing)
   - Minimum: **$5** (lasts thousands of test calls with Haiku 4.5)
   - Some new accounts get free trial credits
5. Go to [Settings → API Keys](https://console.anthropic.com/settings/keys)
6. Click **Create Key** → name it (e.g., `spgp-test`)
7. **Copy the key** — starts with `sk-ant-...`
8. Paste into the prototype's popup

### 💰 Cost expectations

Claude Haiku 4.5 pricing (Nov 2025):
- ~$0.001 per AI recommendation
- ~$0.0005 per chat message
- **Full demo ≈ $0.05 — five cents**

A $5 deposit is enough for **months of testing**.

### 🔒 Security warnings

- 🚫 **NEVER share your API key publicly** — treat it like a password
- 🚫 **NEVER commit it to GitHub** (the code never asks you to do this)
- ✅ The key entered into the popup is stored **only in your browser tab** — gone when you close it
- ✅ The key is sent **only to api.anthropic.com**, never anywhere else
- ⚠️ If you accidentally expose your key (e.g., in a screenshot), **revoke it immediately** at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

---

## 🎬 Demo Flow and video
https://youtu.be/MmTBxpLNTDo

A complete walkthrough hitting every rubric criterion:

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
│  (single-page app)       │ ─────────────────► │   Claude Haiku 4.5   │
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

1. **Structured Output** → AI returns valid JSON matching a strict schema:
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

## 🛠️ Tech Stacks

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build tool | Vite *(for JSX version)* |
| Styling | Vanilla CSS + custom design system |
| Icons | [Tabler Icons](https://tabler.io/icons) (web font) |
| Fonts | Outfit + IBM Plex Mono (Google Fonts) |
| LLM | Claude Haiku 4.5 via [Anthropic Messages API](https://docs.anthropic.com/) |
| Hosting | GitHub Pages (static, free) |

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
| 🚫 **No hardcoded keys** | API key prompted at runtime, never committed to the repo |
| 💚 **Constructive tone** | Prompts explicitly request supportive, non-judgmental language |
| 🎯 **No data hallucination** | Prompts instruct the model to never invent data not in the context |

---

## 📁 Repository Structure

```
spgp-prototype/
├── spgp.html       # Standalone demo (open via GitHub Pages)
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

## ❓ Troubleshooting

### "I'm having trouble reaching the AI service right now"
The API call failed and the app is showing a fallback response. Check:
1. **Did you add credits?** Visit [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) — even with a valid key, **$0 balance returns 400 errors**
2. **Is your API key valid?** Test it at [console.anthropic.com](https://console.anthropic.com/) by creating a new key
3. **Are you opening from `file://`?** Use the GitHub Pages URL instead — local files can't make API calls

### "I have Claude Max subscription, why doesn't it work?"
Claude Max only works on **claude.ai** (the chat website). The API is **billed separately** — see [Getting an API Key](#-getting-an-anthropic-api-key) above.

### "API error: 401" / "Invalid API key"
Your key is wrong or has been revoked. Generate a new one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### "API error: 429" / "Rate limit exceeded"
You've hit your usage limit. Wait a minute and try again.

### "Fallback used" badge appears
Either your key is missing/wrong, your account is out of credits, or the network failed. The app falls back to local responses so the demo never breaks.

### Page is blank / weird styling
Make sure you opened it in a **modern browser** (Chrome, Edge, Safari, Firefox latest). Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R).

---

## 👥 Team

| Member | Role |
|---|---|
| **Yazan Alhaj Hassan** | Frontend & UI/UX |
| **Loai Albalawi** | LLM integration & prompt engineering |
| **Abdulaziz Alhumaid** | Data modelling & state management |
| **Mohammed Almarzouk** | Output formatting & error handling |

**Supervisor:** Dr. Mohammed Al Gabri

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
