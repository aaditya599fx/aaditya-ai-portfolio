# Aaditya Yadav — AI / ML Portfolio

Personal portfolio with multilingual pink greeting with a five-panel staggered exit, midnight-blue and violet theme, interactive neural visualization, project case studies, and résumé download.

## Run locally

Run `python3 -m http.server 4173`, then open http://localhost:4173.

## Activity tracker

The Vercel function at `api/activity.js` combines the public GitHub contribution calendar, LeetCode submission calendars, and Codeforces submissions. It returns the last 365 UTC days with per-source availability and an hourly cache. No API keys are required. Combined activity counts each date once. Source failures produce explicitly partial data rather than invented inactive days. GitHub calendar HTML and LeetCode’s public GraphQL schema may change; the tracker flags these failures. Run `npx vercel dev` for a local preview including the API.

## Deploy

Import this repository in Vercel. Use framework preset Other, no build command, and output directory `.`. No environment variables are required.

Built with semantic HTML, responsive CSS, and vanilla JavaScript. Original portrait and résumé supplied by Aaditya Yadav. The multilingual greeting concept is inspired by [ECHO](https://echooo.web.app/); implementation is original.
