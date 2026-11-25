const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.LIFEPLANNER_PORT || 4310);
const HOST = '127.0.0.1';
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');

function getSeoulToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function getSeoulTimeHHMM() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.hour}:${map.minute}`;
}

function getIsoWeekId(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isValidWeekId(s) {
  return typeof s === 'string' && /^\d{4}-W\d{2}$/.test(s);
}

function dailyFilePath(dateStr) {
  const year = dateStr.slice(0, 4);
  return path.join(ROOT_DIR, 'plans', year, 'daily', `${dateStr}.md`);
}

function weeklyFilePath(weekId) {
  const year = weekId.slice(0, 4);
  return path.join(ROOT_DIR, 'plans', year, 'weekly', `${weekId}.md`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  if (!match) return { meta, bodyStart: 0 };
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val.includes('#')) val = val.split('#')[0].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
    meta[key] = val;
  }
  return { meta, bodyStart: match[0].length };
}

function updateFrontmatterFields(content, updates) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = match[1].split(/\r?\n/);
  const seen = new Set();
  const nextLines = lines.map(line => {
    const kv = line.match(/^([a-zA-Z0-9_]+):/);
    if (kv && Object.prototype.hasOwnProperty.call(updates, kv[1])) {
      seen.add(kv[1]);
      const v = updates[kv[1]];
      const formatted = typeof v === 'string' ? `"${v}"` : String(v);
      return `${kv[1]}: ${formatted}`;
    }
    return line;
  });
  for (const [k, v] of Object.entries(updates)) {
    if (!seen.has(k)) {
      const formatted = typeof v === 'string' ? `"${v}"` : String(v);
      nextLines.push(`${k}: ${formatted}`);
    }
  }
  return `---${eol}${nextLines.join(eol)}${eol}---${content.slice(match[0].length)}`;
}

function extractSection(content, headingPrefix) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1) {
      if (lines[i].startsWith(headingPrefix)) start = i + 1;
    } else if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (start === -1) return { found: false, start: -1, end: -1, lines: [] };
  return { found: true, start, end, lines: lines.slice(start, end) };
}

function cleanBullets(sectionLines) {
  const items = [];
  for (const raw of sectionLines) {
    const m = raw.match(/^\s*-\s+(.*)$/);
    if (!m) continue;
    const text = m[1].trim();
    if (!text || /^\*\(.*\)\*$/.test(text)) continue;
    items.push(text);
  }
  return items;
}

function parseDailyPlan(dateStr) {
  const filePath = dailyFilePath(dateStr);
  if (!fs.existsSync(filePath)) {
    return { exists: false, date: dateStr, filePath };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontmatter(content);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `${dateStr} Daily Plan`;

  const lines = content.split(/\r?\n/);
  const blocks = [];
  let inTimetable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+(Concrete Time-Blocked Timetable|Time Blocks)/i.test(line)) {
      inTimetable = true;
      continue;
    }
    if (inTimetable && /^##\s+/.test(line)) {
      inTimetable = false;
      continue;
    }
    if (!inTimetable) continue;
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 3) continue;
    if (/^:?-+:?$/.test(cells[0]) || /^time$/i.test(cells[0])) continue;

    if (cells.length >= 4) {
      const statusRaw = cells[3];
      const status = statusRaw.includes('[x]') || statusRaw.includes('[X]')
        ? 'done'
        : statusRaw.includes('[-]')
          ? 'skipped'
          : 'pending';
      blocks.push({
        index: blocks.length,
        lineIndex: i,
        time: cells[0],
        priority: cells[1].replace(/\*/g, ''),
        task: cells[2],
        status,
        core: cells[2].includes('[핵심]')
      });
    } else {
      // Legacy 3-column table fallback (read-only status = pending unless checkbox inside)
      blocks.push({
        index: blocks.length,
        lineIndex: i,
        time: cells[0],
        priority: cells[2] || 'P1',
        task: cells[1],
        status: cells[1].includes('[x]') ? 'done' : 'pending',
        core: cells[1].includes('[핵심]') || /MIT/i.test(cells[1]),
        legacy3Col: true
      });
    }
  }

  const autoLog = cleanBullets(extractSection(content, '## Auto-Adjustment Log').lines);
  const deferred = cleanBullets(extractSection(content, '## Deferred / Overflow').lines);
  const notesSec = extractSection(content, '## Quick Notes / Ad-Hoc Changes');
  const notes = [];
  if (notesSec.found) {
    notesSec.lines.forEach((raw, offset) => {
      const m = raw.match(/^\s*-\s+(.*)$/);
      if (!m) return;
      const text = m[1].trim();
      if (!text || /^\*\(.*\)\*$/.test(text)) return;
      notes.push({ index: notes.length, lineIndex: notesSec.start + offset, text });
    });
  }

  const totalCheckable = blocks.filter(b => b.status !== 'skipped').length;
  const completedCount = blocks.filter(b => b.status === 'done').length;
  const computedProgress = totalCheckable > 0 ? Math.round((completedCount / totalCheckable) * 100) : 0;

  return {
    exists: true,
    date: dateStr,
    title,
    meta: {
      ...meta,
      progress: typeof meta.progress === 'number' ? meta.progress : computedProgress,
      needs_approval: Boolean(meta.needs_approval),
      floors_ok: meta.floors_ok !== false
    },
    computedProgress,
    autoLog,
    blocks,
    deferred,
    notes
  };
}

function parseWeeklyPlan(weekId) {
  const filePath = weeklyFilePath(weekId);
  if (!fs.existsSync(filePath)) {
    return { exists: false, weekId, filePath };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontmatter(content);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `${weekId} Weekly Plan`;

  const autoLog = cleanBullets(extractSection(content, '## Auto-Adjustment Log').lines);

  // Parse Upcoming Tasks (Check Ahead), fallback to Weekly Core Targets
  let taskSec = extractSection(content, '## Upcoming Tasks');
  if (!taskSec.found) taskSec = extractSection(content, '## Weekly Core Targets');
  const tasks = [];
  if (taskSec.found) {
    taskSec.lines.forEach((raw, offset) => {
      const m = raw.match(/^\s*-\s+\[([ xX-])\]\s+(.*)$/);
      if (!m) return;
      const mark = m[1];
      const status = (mark === 'x' || mark === 'X') ? 'done' : mark === '-' ? 'skipped' : 'pending';
      let label = m[2].trim();
      let dayTag = '';
      let priority = '';
      const dayMatch = label.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (dayMatch) {
        dayTag = dayMatch[1];
        label = dayMatch[2];
      }
      const prioMatch = label.match(/^\[(P\d+|Mastery|Wealth|Vitality|Connection[^\]]*)\]\s*(.*)$/i);
      if (prioMatch) {
        priority = prioMatch[1];
        label = prioMatch[2];
      }
      tasks.push({
        index: tasks.length,
        lineIndex: taskSec.start + offset,
        status,
        dayTag,
        priority,
        text: label,
        rawText: m[2].trim()
      });
    });
  }

  // Parse Time-Block Allocation table
  const allocSec = extractSection(content, '## Time-Block Allocation');
  const daySchedule = [];
  if (allocSec.found) {
    for (const line of allocSec.lines) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 3 || /^:?-+:?$/.test(cells[0]) || /^day$/i.test(cells[0])) continue;
      daySchedule.push({
        day: cells[0],
        theme: cells[1] || '',
        blocks: cells[2] || '',
        buffer: cells[3] || ''
      });
    }
  }

  return {
    exists: true,
    weekId,
    title,
    meta: {
      ...meta,
      needs_approval: Boolean(meta.needs_approval),
      floors_ok: meta.floors_ok !== false
    },
    autoLog,
    tasks,
    daySchedule
  };
}

function parseScheduleReference() {
  const filePath = path.join(ROOT_DIR, 'profile', 'schedule-constraints.md');
  if (!fs.existsSync(filePath)) return { events: [], rules: [] };
  const content = fs.readFileSync(filePath, 'utf8');
  const rules = cleanBullets(extractSection(content, '## Calendar Integration Rules').lines);
  const eventsSec = extractSection(content, '## Upcoming Fixed Events');
  const events = [];
  if (eventsSec.found) {
    for (const line of eventsSec.lines) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 2 || /^:?-+:?$/.test(cells[0]) || /^date/i.test(cells[0])) continue;
      events.push({ date: cells[0], event: cells[1], notes: cells[2] || '' });
    }
  }
  return { events, rules };
}

function listAvailableDates() {
  const plansDir = path.join(ROOT_DIR, 'plans');
  const dates = [];
  if (!fs.existsSync(plansDir)) return dates;
  for (const yr of fs.readdirSync(plansDir)) {
    if (!/^\d{4}$/.test(yr)) continue;
    const dDir = path.join(plansDir, yr, 'daily');
    if (!fs.existsSync(dDir)) continue;
    for (const f of fs.readdirSync(dDir)) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
      if (m) dates.push(m[1]);
    }
  }
  return dates.sort();
}

function toggleDailyBlock(dateStr, blockIndex, targetStatus) {
  const filePath = dailyFilePath(dateStr);
  if (!fs.existsSync(filePath)) throw new Error('Daily plan file not found');
  const parsed = parseDailyPlan(dateStr);
  const block = parsed.blocks[blockIndex];
  if (!block) throw new Error('Block index out of range');
  if (block.legacy3Col) throw new Error('Legacy 3-column daily plan cannot be toggled; regenerate with new template.');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const mark = targetStatus === 'done' ? '[x]' : targetStatus === 'skipped' ? '[-]' : '[ ]';
  const cells = lines[block.lineIndex].split('|').slice(1, -1).map(c => c.trim());
  cells[3] = mark;
  lines[block.lineIndex] = `| ${cells.join(' | ')} |`;

  let nextContent = lines.join(eol);
  // Recalculate progress
  const statuses = parsed.blocks.map((b, idx) => (idx === blockIndex ? targetStatus : b.status));
  const checkable = statuses.filter(s => s !== 'skipped').length;
  const doneCount = statuses.filter(s => s === 'done').length;
  const progress = checkable > 0 ? Math.round((doneCount / checkable) * 100) : 0;

  nextContent = updateFrontmatterFields(nextContent, {
    progress,
    updated_at: getSeoulToday()
  });
  fs.writeFileSync(filePath, nextContent, 'utf8');
}

function toggleWeeklyTask(weekId, taskIndex, targetStatus) {
  const filePath = weeklyFilePath(weekId);
  if (!fs.existsSync(filePath)) throw new Error('Weekly plan file not found');
  const parsed = parseWeeklyPlan(weekId);
  const task = parsed.tasks[taskIndex];
  if (!task) throw new Error('Task index out of range');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const mark = targetStatus === 'done' ? 'x' : targetStatus === 'skipped' ? '-' : ' ';
  lines[task.lineIndex] = lines[task.lineIndex].replace(/^(\s*-\s+\[)[ xX-](\]\s+)/, `$1${mark}$2`);

  let nextContent = lines.join(eol);
  const statuses = parsed.tasks.map((t, idx) => (idx === taskIndex ? targetStatus : t.status));
  const checkable = statuses.filter(s => s !== 'skipped').length;
  const doneCount = statuses.filter(s => s === 'done').length;
  const progress = checkable > 0 ? Math.round((doneCount / checkable) * 100) : 0;

  nextContent = updateFrontmatterFields(nextContent, {
    progress,
    updated_at: getSeoulToday()
  });
  fs.writeFileSync(filePath, nextContent, 'utf8');
}

function addWeeklyTask(weekId, dayTag, priority, text) {
  const filePath = weeklyFilePath(weekId);
  if (!fs.existsSync(filePath)) throw new Error('Weekly plan file not found');
  const cleanText = String(text || '').trim().replace(/[\r\n]+/g, ' ');
  if (!cleanText) throw new Error('Task text is required');
  const cleanDay = String(dayTag || 'Week').trim().replace(/[\[\]\r\n]/g, '');
  const cleanPrio = String(priority || 'P2').trim().replace(/[\[\]\r\n]/g, '');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const sec = extractSection(content, '## Upcoming Tasks');
  const newLine = `- [ ] [${cleanDay}] [${cleanPrio}] ${cleanText}`;

  if (sec.found) {
    let insertAt = sec.end;
    while (insertAt > sec.start && lines[insertAt - 1].trim() === '') insertAt--;
    lines.splice(insertAt, 0, newLine);
  } else {
    lines.push('', '## Upcoming Tasks (Check Ahead)', '', newLine);
  }
  const nextContent = updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() });
  fs.writeFileSync(filePath, nextContent, 'utf8');
}

function addDailyNote(dateStr, text) {
  const filePath = dailyFilePath(dateStr);
  if (!fs.existsSync(filePath)) throw new Error('Daily plan file not found');
  const cleanText = String(text || '').trim().replace(/[\r\n]+/g, ' ');
  if (!cleanText) throw new Error('Note text is required');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const sec = extractSection(content, '## Quick Notes / Ad-Hoc Changes');
  const newLine = `- ${getSeoulTimeHHMM()}: ${cleanText}`;

  if (sec.found) {
    // Remove placeholder line if it's the only bullet
    let insertAt = sec.end;
    while (insertAt > sec.start && lines[insertAt - 1].trim() === '') insertAt--;
    lines.splice(insertAt, 0, newLine);
  } else {
    lines.push('', '## Quick Notes / Ad-Hoc Changes', '', newLine);
  }
  const nextContent = updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() });
  fs.writeFileSync(filePath, nextContent, 'utf8');
}

function deleteDailyNote(dateStr, noteIndex) {
  const filePath = dailyFilePath(dateStr);
  if (!fs.existsSync(filePath)) throw new Error('Daily plan file not found');
  const parsed = parseDailyPlan(dateStr);
  const note = parsed.notes[noteIndex];
  if (!note) throw new Error('Note index out of range');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  lines.splice(note.lineIndex, 1);
  const nextContent = updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() });
  fs.writeFileSync(filePath, nextContent, 'utf8');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 65536) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

function buildState(dateStr) {
  const today = getSeoulToday();
  const targetDate = isValidDate(dateStr) ? dateStr : today;
  const daily = parseDailyPlan(targetDate);
  const weekId = (daily.exists && daily.meta && isValidWeekId(daily.meta.parent_id))
    ? daily.meta.parent_id
    : getIsoWeekId(targetDate);
  const weekly = parseWeeklyPlan(weekId);
  const scheduleRef = parseScheduleReference();
  const availableDates = listAvailableDates();

  return {
    today,
    selectedDate: targetDate,
    weekId,
    daily,
    weekly,
    scheduleRef,
    availableDates
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/state') {
      const dateParam = url.searchParams.get('date');
      return sendJson(res, 200, buildState(dateParam));
    }

    if (req.method === 'POST' && url.pathname === '/api/daily/toggle') {
      const body = await readJsonBody(req);
      if (!isValidDate(body.date)) return sendJson(res, 400, { error: 'Invalid date' });
      if (!['pending', 'done', 'skipped'].includes(body.status)) return sendJson(res, 400, { error: 'Invalid status' });
      toggleDailyBlock(body.date, Number(body.index), body.status);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/weekly/toggle') {
      const body = await readJsonBody(req);
      if (!isValidWeekId(body.weekId)) return sendJson(res, 400, { error: 'Invalid weekId' });
      if (!['pending', 'done', 'skipped'].includes(body.status)) return sendJson(res, 400, { error: 'Invalid status' });
      toggleWeeklyTask(body.weekId, Number(body.index), body.status);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/weekly/task/add') {
      const body = await readJsonBody(req);
      if (!isValidWeekId(body.weekId)) return sendJson(res, 400, { error: 'Invalid weekId' });
      addWeeklyTask(body.weekId, body.dayTag, body.priority, body.text);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/daily/note') {
      const body = await readJsonBody(req);
      if (!isValidDate(body.date)) return sendJson(res, 400, { error: 'Invalid date' });
      addDailyNote(body.date, body.text);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/daily/note/delete') {
      const body = await readJsonBody(req);
      if (!isValidDate(body.date)) return sendJson(res, 400, { error: 'Invalid date' });
      deleteDailyNote(body.date, Number(body.index));
      return sendJson(res, 200, buildState(body.date));
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Life Planner Dashboard running at http://${HOST}:${PORT}`);
  console.log(`Workspace SSOT: ${ROOT_DIR}`);
});
