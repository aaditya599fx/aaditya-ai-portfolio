# Aaditya Yadav · AI / ML Portfolio

My personal portfolio showcasing applied AI, machine learning, agentic systems, and competitive programming.

**Live portfolio: [aaditya-ai-portfolio.vercel.app](https://aaditya-ai-portfolio.vercel.app/)**

## Featured work

- **EduPulse:** Academic performance analysis using K-Means and Gradient Boosting, with a stateful RAG tutor built with LangGraph, Hugging Face embeddings, ChromaDB, and Groq.
- **Nexus Research:** A research assistant combining classical NLP, multi-source retrieval, and an autonomous LangGraph workflow.

## Features

- Midnight-blue and violet design with a subtle monochrome portrait.
- Multilingual pink intro with five staggered panels.
- Responsive project case studies and résumé download.
- Competitive coding and DSA section with Codeforces, LeetCode, and GitHub profiles.
- A combined 365-day activity calendar with current streak, best streak, and active-day counts.
- Keyboard-accessible calendar, reduced-motion support, and animation controls.

## Stack

HTML, CSS, vanilla JavaScript, Canvas, and a Node.js serverless function hosted on Vercel. No framework or build step is required.

## Run locally

For the full site, including the activity endpoint:

```sh
npx vercel dev
```

For a static preview only:

```sh
python3 -m http.server 4173
```

Open the local URL printed by the command. The activity tracker requires the Vercel function and will be unavailable in a static-only preview.

## Deploy

Import this repository into Vercel with:

- **Framework preset:** Other
- **Root directory:** Project root
- **Build command:** None
- **Output directory:** Project root (`.`)

No environment variables or API keys are required. Pushes to `main` automatically update the connected production deployment.

## Activity data

`api/activity.js` retrieves the public GitHub contribution calendar, LeetCode submission calendars, and Codeforces submissions. The endpoint caches results for an hour.

The calendar covers the last 365 UTC days. A combined active day is a date with activity on at least one platform and counts only once. The current streak can continue from yesterday while today is in progress. GitHub dates follow its published contribution calendar.

If a platform is unavailable, the interface marks the data as partial and reports minimum streak counts. Source availability depends on upstream endpoints; no activity is fabricated.

## Project files

- `index.html` — Portfolio content and links
- `style.css` — Responsive layout and animation
- `script.js` — Intro and neural-network animation
- `tracker.js` — Combined activity calendar and streak calculations
- `api/activity.js` — Server-side public activity retrieval
- `vercel.json` — Deployment configuration
- `Aaditya-Yadav-Resume.pdf` — Downloadable résumé
- `portrait.jpg` — Portfolio portrait

## Connect

[GitHub](https://github.com/aaditya599fx) · [LinkedIn](https://www.linkedin.com/in/aaditya-yadav-774013325/) · [Codeforces](https://codeforces.com/profile/makisama) · [LeetCode](https://leetcode.com/u/8xmo3WBF7r/)
