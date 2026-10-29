const DAY = 86400000;
const iso = value => new Date(value).toISOString().slice(0, 10);

async function get(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'User-Agent': 'AadityaPortfolio/1.0', ...options.headers },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response;
}

async function github(start, end) {
  const response = await get('https://github.com/users/aaditya599fx/contributions');
  const html = await response.text();
  const days = {};
  const seen = new Set();
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)) {
    const level = match[0].match(/\bdata-level="([0-4])"/);
    if (!level) continue;
    seen.add(match[1]);
    if (match[1] >= start && match[1] <= end && Number(level[1]) > 0) days[match[1]] = Number(level[1]);
  }
  // A changed or blocked page must never be treated as an empty calendar.
  if (!seen.has(start) || !seen.has(end) || seen.size < 365) throw new Error('Calendar unavailable');
  return { days, metric: 'Public contribution activity', intensity: 'github-level' };
}

async function leetcode(start, end) {
  const years = [...new Set([Number(start.slice(0, 4)), Number(end.slice(0, 4))])];
  const days = {};
  for (const year of years) {
    const response = await get('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' },
      body: JSON.stringify({
        query: 'query Calendar($username: String!, $year: Int!) { matchedUser(username: $username) { userCalendar(year: $year) { submissionCalendar } } }',
        variables: { username: '8xmo3WBF7r', year }
      })
    });
    const json = await response.json();
    const calendar = json.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (json.errors || typeof calendar !== 'string') throw new Error('Calendar unavailable');
    for (const [timestamp, count] of Object.entries(JSON.parse(calendar))) {
      const date = iso(Number(timestamp) * 1000);
      if (date >= start && date <= end && Number(count) > 0) days[date] = Number(count);
    }
  }
  return { days, metric: 'Submissions', intensity: 'count' };
}

async function codeforces(start, end) {
  const response = await get('https://codeforces.com/api/user.status?handle=makisama&from=1&count=10000');
  const json = await response.json();
  if (json.status !== 'OK' || !Array.isArray(json.result)) throw new Error('Submissions unavailable');
  const days = {};
  for (const submission of json.result) {
    const date = iso(submission.creationTimeSeconds * 1000);
    if (date >= start && date <= end) days[date] = (days[date] || 0) + 1;
  }
  if (json.result.length >= 10000 && iso(json.result.at(-1).creationTimeSeconds * 1000) > start) throw new Error('History exceeds available window');
  return { days, metric: 'Submissions', intensity: 'count' };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const end = iso(Date.now());
  const start = iso(new Date(`${end}T00:00:00Z`).getTime() - 364 * DAY);
  const names = ['github', 'leetcode', 'codeforces'];
  const results = await Promise.allSettled([github(start, end), leetcode(start, end), codeforces(start, end)]);
  results.forEach((result, index) => { if (result.status === 'rejected') console.warn('Activity source unavailable:', names[index], result.reason?.message); });
  const sources = Object.fromEntries(results.map((result, index) => [names[index], result.status === 'fulfilled'
    ? { status: 'ok', ...result.value }
    : { status: 'unavailable', days: {}, message: 'Temporarily unavailable. Visit the profile for activity.' }]));
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.status(200).json({ start, end, timezone: 'UTC', updatedAt: new Date().toISOString(), sources });
};
