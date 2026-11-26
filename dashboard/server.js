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

function isValidSlug(s) {
  return typeof s === 'string' && /^[a-z0-9-]+$/.test(s);
}

function dailyFilePath(dateStr) {
  return path.join(ROOT_DIR, 'plans', dateStr.slice(0, 4), 'daily', `${dateStr}.md`);
}

function weeklyFilePath(weekId) {
  return path.join(ROOT_DIR, 'plans', weekId.slice(0, 4), 'weekly', `${weekId}.md`);
}

function wealthFilePath() {
  return path.join(ROOT_DIR, 'profile', 'wealth.md');
}

function projectFilePath(slug) {
  return path.join(ROOT_DIR, 'projects', slug, 'index.md');
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

function parseCheckboxes(section) {
  const items = [];
  if (!section.found) return items;
  section.lines.forEach((raw, offset) => {
    const m = raw.match(/^\s*-\s+\[([ xX-])\]\s+(.*)$/);
    if (!m) return;
    const mark = m[1];
    const status = (mark === 'x' || mark === 'X') ? 'done' : mark === '-' ? 'skipped' : 'pending';
    items.push({
      index: items.length,
      lineIndex: section.start + offset,
      status,
      text: m[2].trim()
    });
  });
  return items;
}

function parseDailyPlan(dateStr) {
  const filePath = dailyFilePath(dateStr);
  if (!fs.existsSync(filePath)) return { exists: false, date: dateStr };
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
    if (!inTimetable || !line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 3 || /^:?-+:?$/.test(cells[0]) || /^time$/i.test(cells[0])) continue;

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
  if (!fs.existsSync(filePath)) return { exists: false, weekId };
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontmatter(content);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `${weekId} Weekly Plan`;

  const autoLog = cleanBullets(extractSection(content, '## Auto-Adjustment Log').lines);
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

  const allocSec = extractSection(content, '## Time-Block Allocation');
  const daySchedule = [];
  if (allocSec.found) {
    for (const line of allocSec.lines) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 3 || /^:?-+:?$/.test(cells[0]) || /^day$/i.test(cells[0])) continue;
      daySchedule.push({ day: cells[0], theme: cells[1] || '', blocks: cells[2] || '', buffer: cells[3] || '' });
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

function parseWealth() {
  const filePath = wealthFilePath();
  if (!fs.existsSync(filePath)) return { exists: false };
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontmatter(content);
  const liquid = Number(meta.liquid_cash_krw || 0);
  const income = Number(meta.monthly_income_krw || 0);
  const expense = Number(meta.monthly_expense_krw || 0);
  const debt = Number(meta.total_debt_krw || 0);
  const investable = Number(meta.investable_pool_krw || 0);

  // Check latest monthly draft in council/
  const councilDir = path.join(ROOT_DIR, 'council');
  let latestDraft = null;
  if (fs.existsSync(councilDir)) {
    const drafts = fs.readdirSync(councilDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}-monthly-draft\.md$/.test(f))
      .sort()
      .reverse();
    if (drafts.length) latestDraft = drafts[0];
  }

  const histSec = extractSection(content, '## Monthly Snapshot History');
  const history = [];
  if (histSec.found) {
    for (const line of histSec.lines) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 7 || /^:?-+:?$/.test(cells[0]) || /^month$/i.test(cells[0])) continue;
      history.push({
        month: cells[0],
        liquid: Number(cells[1]) || 0,
        income: Number(cells[2]) || 0,
        expense: Number(cells[3]) || 0,
        investable: Number(cells[4]) || 0,
        debt: Number(cells[5]) || 0,
        net: Number(cells[6]) || 0
      });
    }
  }

  return {
    exists: true,
    updatedAt: meta.updated_at || '',
    liquid_cash_krw: liquid,
    monthly_income_krw: income,
    monthly_expense_krw: expense,
    monthly_net_krw: income - expense,
    total_debt_krw: debt,
    investable_pool_krw: investable,
    floors: cleanBullets(extractSection(content, '## Non-Negotiable Floor').lines),
    goals: cleanBullets(extractSection(content, '## Goals & Priorities').lines),
    history,
    latestMonthlyDraft: latestDraft
  };
}

function parseProjects() {
  const dir = path.join(ROOT_DIR, 'projects');
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory());
  const list = [];
  for (const ent of entries) {
    const slug = ent.name;
    const idxPath = projectFilePath(slug);
    if (!fs.existsSync(idxPath)) continue;
    const content = fs.readFileSync(idxPath, 'utf8');
    const { meta } = parseFrontmatter(content);
    const titleMatch = content.match(/^#\s+(?:Project:\s*)?(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;
    const vision = cleanBullets(extractSection(content, '## Goal & Vision').lines).slice(0, 2);
    const nextActions = parseCheckboxes(extractSection(content, '## Next Actions'));
    const milestones = parseCheckboxes(extractSection(content, '## Milestones'));

    list.push({
      slug,
      title,
      domain: meta.domain || 'mastery',
      status: meta.status || 'queued',
      owner_agent: meta.owner_agent || 'project-lead',
      parent_plan: meta.parent_plan || '',
      weekly_quota_hours: Number(meta.weekly_quota_hours || 0),
      monthly_budget_krw: Number(meta.monthly_budget_krw || 0),
      capital_pool_krw: Number(meta.capital_pool_krw || 0),
      target_monthly_income_krw: Number(meta.target_monthly_income_krw || 0),
      updated_at: meta.updated_at || '',
      vision,
      nextActions,
      milestones
    });
  }
  const order = { active: 0, queued: 1, paused: 2, completed: 3 };
  return list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.slug.localeCompare(b.slug));
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
  if (block.legacy3Col) throw new Error('Legacy 3-column daily plan cannot be toggled');

  const content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const mark = targetStatus === 'done' ? '[x]' : targetStatus === 'skipped' ? '[-]' : '[ ]';
  const cells = lines[block.lineIndex].split('|').slice(1, -1).map(c => c.trim());
  cells[3] = mark;
  lines[block.lineIndex] = `| ${cells.join(' | ')} |`;

  const statuses = parsed.blocks.map((b, idx) => (idx === blockIndex ? targetStatus : b.status));
  const checkable = statuses.filter(s => s !== 'skipped').length;
  const doneCount = statuses.filter(s => s === 'done').length;
  const progress = checkable > 0 ? Math.round((doneCount / checkable) * 100) : 0;

  const nextContent = updateFrontmatterFields(lines.join(eol), { progress, updated_at: getSeoulToday() });
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

  const statuses = parsed.tasks.map((t, idx) => (idx === taskIndex ? targetStatus : t.status));
  const checkable = statuses.filter(s => s !== 'skipped').length;
  const doneCount = statuses.filter(s => s === 'done').length;
  const progress = checkable > 0 ? Math.round((doneCount / checkable) * 100) : 0;

  const nextContent = updateFrontmatterFields(lines.join(eol), { progress, updated_at: getSeoulToday() });
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
  fs.writeFileSync(filePath, updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() }), 'utf8');
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
    let insertAt = sec.end;
    while (insertAt > sec.start && lines[insertAt - 1].trim() === '') insertAt--;
    lines.splice(insertAt, 0, newLine);
  } else {
    lines.push('', '## Quick Notes / Ad-Hoc Changes', '', newLine);
  }
  fs.writeFileSync(filePath, updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() }), 'utf8');
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
  fs.writeFileSync(filePath, updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() }), 'utf8');
}

function updateWealthSnapshot(body) {
  const filePath = wealthFilePath();
  if (!fs.existsSync(filePath)) throw new Error('profile/wealth.md not found');
  const updates = { updated_at: getSeoulToday() };
  const numericFields = ['liquid_cash_krw', 'monthly_income_krw', 'monthly_expense_krw', 'total_debt_krw', 'investable_pool_krw'];
  for (const field of numericFields) {
    if (body[field] !== undefined && body[field] !== '') {
      const n = Number(body[field]);
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid number for ${field}`);
      updates[field] = Math.round(n);
    }
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  content = updateFrontmatterFields(content, updates);

  const note = String(body.note || '').trim().replace(/[\r\n]+/g, ' ');
  if (note) {
    const lines = content.split(/\r?\n/);
    const sec = extractSection(content, '## Notes & History');
    const entry = `- ${getSeoulToday()}: ${note}`;
    if (sec.found) {
      let insertAt = sec.end;
      while (insertAt > sec.start && lines[insertAt - 1].trim() === '') insertAt--;
      lines.splice(insertAt, 0, entry);
      content = lines.join(eol);
    } else {
      content += `${eol}${eol}## Notes & History${eol}${eol}${entry}`;
    }
  }

  // Auto-upsert current YYYY-MM row in Monthly Snapshot History
  const { meta: merged } = parseFrontmatter(content);
  const ym = getSeoulToday().slice(0, 7);
  const liq = Number(merged.liquid_cash_krw || 0);
  const inc = Number(merged.monthly_income_krw || 0);
  const exp = Number(merged.monthly_expense_krw || 0);
  const inv = Number(merged.investable_pool_krw || 0);
  const dbt = Number(merged.total_debt_krw || 0);
  const rowStr = `| ${ym} | ${liq} | ${inc} | ${exp} | ${inv} | ${dbt} | ${inc - exp} |`;
  const hLines = content.split(/\r?\n/);
  const hSec = extractSection(content, '## Monthly Snapshot History');
  if (hSec.found) {
    let replaced = false;
    for (let i = hSec.start; i < hSec.end; i++) {
      if (hLines[i].trim().startsWith(`| ${ym} |`)) {
        hLines[i] = rowStr;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      let insertAt = hSec.end;
      while (insertAt > hSec.start && hLines[insertAt - 1].trim() === '') insertAt--;
      hLines.splice(insertAt, 0, rowStr);
    }
    content = hLines.join(eol);
  } else {
    content += `${eol}${eol}## Monthly Snapshot History${eol}${eol}| Month | Liquid Cash | Monthly Income | Monthly Expense | Investable Pool | Total Debt | Net Cashflow |${eol}| :--- | :---: | :---: | :---: | :---: | :---: | :---: |${eol}${rowStr}`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function toggleProjectAction(slug, actionIndex, targetStatus) {
  if (!isValidSlug(slug)) throw new Error('Invalid project slug');
  const filePath = projectFilePath(slug);
  if (!fs.existsSync(filePath)) throw new Error('Project index not found');
  const content = fs.readFileSync(filePath, 'utf8');
  const actions = parseCheckboxes(extractSection(content, '## Next Actions'));
  const target = actions[actionIndex];
  if (!target) throw new Error('Action index out of range');

  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const mark = targetStatus === 'done' ? 'x' : ' ';
  lines[target.lineIndex] = lines[target.lineIndex].replace(/^(\s*-\s+\[)[ xX-](\]\s+)/, `$1${mark}$2`);
  fs.writeFileSync(filePath, updateFrontmatterFields(lines.join(eol), { updated_at: getSeoulToday() }), 'utf8');
}

function updateProjectQuotas(body) {
  const slug = body.slug;
  if (!isValidSlug(slug)) throw new Error('Invalid project slug');
  const filePath = projectFilePath(slug);
  if (!fs.existsSync(filePath)) throw new Error('Project index not found');

  const updates = { updated_at: getSeoulToday() };
  if (['active', 'queued', 'paused', 'completed'].includes(body.status)) {
    updates.status = body.status;
  }
  for (const f of ['weekly_quota_hours', 'monthly_budget_krw', 'capital_pool_krw', 'target_monthly_income_krw']) {
    if (body[f] !== undefined && body[f] !== '') {
      const n = Number(body[f]);
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid number for ${f}`);
      updates[f] = f === 'weekly_quota_hours' ? Math.round(n * 10) / 10 : Math.round(n);
    }
  }
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, updateFrontmatterFields(content, updates), 'utf8');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 65536) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function buildState(dateStr) {
  const today = getSeoulToday();
  const targetDate = isValidDate(dateStr) ? dateStr : today;
  const daily = parseDailyPlan(targetDate);
  const weekId = (daily.exists && daily.meta && isValidWeekId(daily.meta.parent_id))
    ? daily.meta.parent_id
    : getIsoWeekId(targetDate);
  const weekly = parseWeeklyPlan(weekId);
  const wealth = parseWealth();
  const projects = parseProjects();
  const portfolioTotals = projects.reduce((acc, p) => {
    if (p.status === 'active') acc.activeCount += 1;
    acc.totalWeeklyHours += p.weekly_quota_hours;
    acc.totalMonthlyBudgetKrw += p.monthly_budget_krw;
    acc.totalCapitalPoolKrw += p.capital_pool_krw;
    acc.totalTargetIncomeKrw += p.target_monthly_income_krw;
    return acc;
  }, { activeCount: 0, totalWeeklyHours: 0, totalMonthlyBudgetKrw: 0, totalCapitalPoolKrw: 0, totalTargetIncomeKrw: 0 });

  return {
    today,
    selectedDate: targetDate,
    weekId,
    daily,
    weekly,
    wealth,
    projects,
    portfolioTotals,
    scheduleRef: parseScheduleReference(),
    availableDates: listAvailableDates()
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
      return sendJson(res, 200, buildState(url.searchParams.get('date')));
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

    if (req.method === 'POST' && url.pathname === '/api/wealth/update') {
      const body = await readJsonBody(req);
      updateWealthSnapshot(body);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/project/toggle-action') {
      const body = await readJsonBody(req);
      if (!['pending', 'done'].includes(body.status)) return sendJson(res, 400, { error: 'Invalid status' });
      toggleProjectAction(body.slug, Number(body.index), body.status);
      return sendJson(res, 200, buildState(body.date));
    }

    if (req.method === 'POST' && url.pathname === '/api/project/update-quotas') {
      const body = await readJsonBody(req);
      updateProjectQuotas(body);
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
