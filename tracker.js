const PLATFORM_NAMES = { github: 'GitHub', leetcode: 'LeetCode', codeforces: 'Codeforces' };
const DAY_MS = 86400000;
function calendarDates(start, end) {
  const result = [];
  for (let time = Date.parse(start + 'T00:00:00Z'); time <= Date.parse(end + 'T00:00:00Z'); time += DAY_MS) result.push(new Date(time).toISOString().slice(0, 10));
  return result;
}
function streakStats(dates, active) {
  let best = 0, run = 0, total = 0;
  for (const date of dates) {
    if (active(date)) { total++; run++; best = Math.max(best, run); } else run = 0;
  }
  let current = 0;
  let index = dates.length - 1;
  if (index >= 0 && !active(dates[index])) index--;
  while (index >= 0 && active(dates[index])) { current++; index--; }
  return { current, best, total };
}
if (typeof module !== 'undefined') module.exports = { calendarDates, streakStats };

if (typeof document !== 'undefined' && document.getElementById('activity-tracker')) {
  const grid = document.getElementById('activity-grid');
  const status = document.getElementById('activity-status');
  const retry = document.getElementById('tracker-retry');
  const filters = [...document.querySelectorAll('[data-platform]')];
  const detail = document.getElementById('calendar-detail');
  let payload = null, selected = 'combined';
  const friendly = date => new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
  function render() {
    if (!payload) return;
    const requested = selected === 'combined' ? Object.keys(PLATFORM_NAMES) : [selected];
    const available = requested.filter(name => payload.sources[name]?.status === 'ok');
    const missing = requested.filter(name => !available.includes(name));
    const partial = missing.length > 0;
    const dates = calendarDates(payload.start, payload.end);
    const activeFor = date => available.filter(name => Number(payload.sources[name].days[date]) > 0);
    const stats = streakStats(dates, date => activeFor(date).length > 0);
    for (const [id, value] of [['current-streak', stats.current], ['best-streak', stats.best], ['active-days', stats.total]]) {
      document.getElementById(id).textContent = !available.length ? '—' : `${partial ? '≥ ' : ''}${value}`;
    }
    status.textContent = !available.length ? 'Activity is temporarily unavailable. Try refreshing, or visit the profiles above.'
      : partial ? `Partial view · ${missing.map(name => PLATFORM_NAMES[name]).join(' + ')} unavailable. Streaks and active days are minimums based on available sources.`
      : selected === 'combined' ? 'Three platforms. One shared habit. Each active day counts once.' : `${PLATFORM_NAMES[selected]} activity · ${payload.sources[selected].metric.toLowerCase()}.`;
    document.getElementById('tracker-range').textContent = `${friendly(payload.start)} — ${friendly(payload.end)} · UTC`;
    document.getElementById('legend-label').textContent = selected === 'combined' ? '0 → 3 platforms active' : 'Less → more activity';
    const sources = document.getElementById('source-status');
    sources.replaceChildren();
    for (const name of Object.keys(PLATFORM_NAMES)) {
      const chip = document.createElement('span');
      const ok = payload.sources[name]?.status === 'ok';
      chip.className = ok ? '' : 'unavailable';
      chip.textContent = `${ok ? '●' : '○'} ${PLATFORM_NAMES[name]} · ${ok ? 'synced' : 'unavailable'}`;
      sources.append(chip);
    }
    const updated = document.createElement('span');
    updated.textContent = `Updated ${new Date(payload.updatedAt).toLocaleString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} UTC`;
    sources.append(updated);
    grid.replaceChildren();
    const offset = new Date(payload.start + 'T00:00:00Z').getUTCDay();
    const weeks = Math.ceil((offset + dates.length) / 7);
    const months = document.getElementById('calendar-months');
    months.replaceChildren();
    let previousMonth = '';
    for (let i = 0; i < offset; i++) { const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); grid.append(blank); }
    dates.forEach((date, index) => {
      const names = activeFor(date);
      const value = selected === 'combined' ? names.length : Number(payload.sources[selected]?.days[date] || 0);
      let level = selected === 'combined' ? (value === 3 ? 4 : value) : selected === 'github' ? value : value >= 10 ? 4 : value >= 5 ? 3 : value >= 2 ? 2 : value ? 1 : 0;
      const parts = names.map(name => {
        const count = Number(payload.sources[name].days[date]);
        return name === 'github' ? 'GitHub contributions' : `${PLATFORM_NAMES[name]}: ${count} submission${count === 1 ? '' : 's'}`;
      });
      const description = `${friendly(date)} · ${parts.length ? parts.join(' · ') : partial ? 'No activity in available sources; remaining activity unknown' : 'No activity'}${partial && parts.length ? ' · Partial data' : ''}`;
      const cell = document.createElement('button');
      cell.type = 'button'; cell.className = 'activity-day' + (partial && !names.length ? ' unknown' : '');
      cell.dataset.level = String(Math.min(4, level));
      cell.title = description; cell.setAttribute('aria-label', description); cell.tabIndex = index === dates.length - 1 ? 0 : -1;
      const show = () => { detail.textContent = description; };
      cell.addEventListener('focus', show); cell.addEventListener('pointerenter', show);
      cell.addEventListener('click', () => { grid.querySelectorAll('button').forEach(item => item.tabIndex = -1); cell.tabIndex = 0; show(); });
      grid.append(cell);
      const month = date.slice(0, 7);
      if (month !== previousMonth && (index > 0 || Number(date.slice(8)) < 20)) {
        const label = document.createElement('span');
        label.textContent = new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
        const week = Math.floor((offset + index) / 7);
        if (week < weeks - 2) { label.style.left = `${week / weeks * 100}%`; months.append(label); }
        previousMonth = month;
      }
    });
    grid.setAttribute('aria-busy', 'false');
    detail.textContent = 'Select a day to explore activity. Arrow keys move between days.';
    const scroller = document.querySelector('.calendar-scroll');
    scroller.scrollLeft = scroller.scrollWidth;
  }
  grid.addEventListener('keydown', event => {
    const cells = [...grid.querySelectorAll('button')];
    const index = cells.indexOf(document.activeElement);
    const move = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7, Home: -index, End: cells.length - 1 - index }[event.key];
    if (index < 0 || move === undefined) return;
    event.preventDefault();
    const target = cells[Math.max(0, Math.min(cells.length - 1, index + move))];
    cells[index].tabIndex = -1; target.tabIndex = 0; target.focus();
  });
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.platform;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render();
  }));
  async function load() {
    retry.disabled = true; grid.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading public activity from GitHub, LeetCode, and Codeforces…';
    try {
      const response = await fetch('/api/activity', { cache: 'no-store', signal: AbortSignal.timeout(35000) });
      if (!response.ok) throw new Error('Activity unavailable');
      const data = await response.json();
      if (!data.sources || !/^\d{4}-\d{2}-\d{2}$/.test(data.start) || !/^\d{4}-\d{2}-\d{2}$/.test(data.end)) throw new Error('Invalid calendar');
      payload = data; render();
    } catch {
      if (payload) { render(); status.textContent = 'Refresh unavailable. Showing the last loaded data; see its timestamp below.'; }
      else { status.textContent = 'Activity is temporarily unavailable. Try refreshing, or visit the profiles above.'; }
      grid.setAttribute('aria-busy', 'false');
    } finally { retry.disabled = false; }
  }
  retry.addEventListener('click', load);
  load();
}
