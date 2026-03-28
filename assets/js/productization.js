(function(){
  'use strict';

  const STORAGE_KEY = 'ace_progress_v4';

  function rootPrefix(){
    const path = window.location.pathname || '/';
    if (path === '/' || path === '') return '';
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return '';
    const last = parts[parts.length - 1];
    const depth = last.includes('.') ? parts.length - 1 : parts.length;
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  const ROOT = rootPrefix();
  const assetUrl = (rel) => `${ROOT}${rel}`;

  async function loadJson(rel){
    const res = await fetch(assetUrl(rel));
    if (!res.ok) throw new Error(`Failed to load ${rel}: ${res.status}`);
    return res.json();
  }

  async function loadLibrary(){
    if (window.__pdLibrary) return window.__pdLibrary;
    if (window.CE?.Library?.load) {
      const ml = await window.CE.Library.load();
      window.__pdLibrary = ml;
      return ml;
    }
    const ml = await loadJson('assets/data/MasterLibrary.json');
    window.__pdLibrary = ml;
    return ml;
  }

  async function loadProjects(){
    if (window.__pdProjects) return window.__pdProjects;
    if (window.CE?.Library?.loadProjects) {
      const p = await window.CE.Library.loadProjects();
      window.__pdProjects = p;
      return p;
    }
    const p = await loadJson('assets/data/projects.json');
    window.__pdProjects = p;
    return p;
  }

  function readProgress(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function completedIds(){
    const progress = readProgress();
    return Object.keys(progress).filter((id) => progress[id]?.complete);
  }

  function isComplete(id){
    const progress = readProgress();
    return !!progress[id]?.complete;
  }

  function trackMetrics(track){
    const progress = readProgress();
    const lessons = track.lessons || [];
    const done = lessons.filter((lesson) => progress[lesson.id]?.complete).length;
    const total = lessons.length;
    const nextLesson = lessons.find((lesson) => !progress[lesson.id]?.complete) || lessons[0];
    const recentTs = Math.max(0, ...lessons.map((lesson) => progress[lesson.id]?.completedAt || progress[lesson.id]?.visitedAt || 0));
    return { done, total, pct: total ? Math.round(done / total * 100) : 0, nextLesson, recentTs };
  }

  function lessonHref(id){ return `${assetUrl('learn/lesson.html')}?id=${encodeURIComponent(id)}&type=lesson`; }
  function projectHref(id){ return `${assetUrl('learn/project.html')}?id=${encodeURIComponent(id)}&type=project`; }

  function levelTone(badge){
    const b = (badge || '').toLowerCase();
    if (b.includes('expert')) return 'expert';
    if (b.includes('advanced')) return 'advanced';
    if (b.includes('intermediate')) return 'intermediate';
    return 'beginner';
  }

  function escapeHtml(value){
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lessonSectionCount(lesson){
    return Array.isArray(lesson.sections) ? lesson.sections.length : 0;
  }

  function tag(label, tone='neutral'){
    return `<span class="pd-tag ${tone !== 'neutral' ? `pd-tag-${tone}` : ''}">${escapeHtml(label)}</span>`;
  }

  function ensureStyles(){
    if (document.getElementById('pd-productization-css')) return;
    const style = document.createElement('style');
    style.id = 'pd-productization-css';
    style.textContent = `
      .pd-shell{background:var(--bg-card);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:clamp(1.25rem,2vw,2rem);box-shadow:0 18px 42px rgba(0,0,0,.22)}
      .pd-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem}
      .pd-kicker{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem .9rem;border-radius:999px;background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.14);color:var(--accent-primary);font-size:.78rem;font-family:var(--font-mono);margin-bottom:.9rem}
      .pd-heading h2{margin:0;font-size:clamp(1.55rem,3vw,2.2rem)}
      .pd-heading p{margin:.55rem 0 0;color:var(--text-secondary);max-width:62ch;line-height:1.75}
      .pd-link{color:var(--accent-primary);text-decoration:none;font-weight:600}
      .pd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
      .pd-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:1.15rem;display:flex;flex-direction:column;gap:.85rem;min-height:220px}
      .pd-card strong{font-size:1.02rem;color:var(--text-primary)}
      .pd-card p{margin:0;color:var(--text-secondary);line-height:1.7;font-size:.95rem}
      .pd-card-meta,.pd-result-meta,.pd-stat-strip{display:flex;flex-wrap:wrap;gap:.5rem}
      .pd-tag{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.28rem .7rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);font-size:.72rem;font-family:var(--font-mono);color:var(--text-muted)}
      .pd-tag-beginner{border-color:rgba(0,255,170,.18);background:rgba(0,255,170,.08);color:var(--accent-primary)}
      .pd-tag-intermediate{border-color:rgba(251,191,36,.18);background:rgba(251,191,36,.08);color:var(--accent-warning)}
      .pd-tag-advanced{border-color:rgba(168,85,247,.18);background:rgba(168,85,247,.08);color:var(--accent-tertiary)}
      .pd-tag-expert{border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.08);color:var(--accent-error)}
      .pd-progress{height:6px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}
      .pd-progress > span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent-primary),rgba(0,255,170,.55))}
      .pd-actions{margin-top:auto;display:flex;gap:.65rem;flex-wrap:wrap}
      .pd-btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:.72rem 1rem;border-radius:12px;font-weight:700;font-size:.92rem;transition:transform .2s ease, border-color .2s ease}
      .pd-btn:hover{transform:translateY(-1px)}
      .pd-btn-primary{background:var(--accent-primary);color:#07110d}
      .pd-btn-secondary{border:1px solid rgba(255,255,255,.12);color:var(--text-primary);background:rgba(255,255,255,.03)}
      .pd-mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.85rem;margin-top:1rem}
      .pd-mini{padding:1rem;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}
      .pd-mini .value{font-size:1.5rem;font-weight:800;color:var(--text-primary);margin-bottom:.2rem}
      .pd-mini .label{font-size:.82rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;font-family:var(--font-mono)}
      .pd-rail{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.9rem}
      .pd-rail a{display:block;text-decoration:none;padding:1rem 1.05rem;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);transition:border-color .2s ease, transform .2s ease}
      .pd-rail a:hover{border-color:rgba(0,255,170,.28);transform:translateY(-2px)}
      .pd-rail strong{display:block;color:var(--text-primary);margin-bottom:.45rem}
      .pd-rail span{display:block;color:var(--text-secondary);line-height:1.65;font-size:.92rem}
      .pd-discovery{display:flex;flex-direction:column;gap:1.15rem}
      .pd-discovery-toolbar{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,.65fr));gap:.8rem}
      .pd-input,.pd-select{width:100%;padding:.95rem 1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;color:var(--text-primary);font:inherit}
      .pd-select option{background:#0d1117;color:#f3f4f6}
      .pd-stat-strip{margin-top:.35rem}
      .pd-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
      .pd-result{display:flex;flex-direction:column;gap:.8rem;padding:1.15rem;border-radius:18px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}
      .pd-result h3{margin:0;font-size:1.05rem;color:var(--text-primary)}
      .pd-result p{margin:0;color:var(--text-secondary);line-height:1.7;font-size:.94rem}
      .pd-empty{padding:2rem 1rem;text-align:center;color:var(--text-muted);border:1px dashed rgba(255,255,255,.08);border-radius:18px;grid-column:1/-1}
      .pd-inline-note{font-size:.82rem;color:var(--text-muted);font-family:var(--font-mono)}
      @media (max-width: 900px){.pd-discovery-toolbar{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function buildTrackCards(tracks){
    return tracks.map((track) => {
      const metrics = trackMetrics(track);
      const next = metrics.nextLesson;
      return `
        <div class="pd-card">
          <div class="pd-card-meta">
            ${tag(`Tier ${track.tier}`)}
            ${tag(`${metrics.done}/${metrics.total} complete`, metrics.done ? 'beginner' : 'neutral')}
          </div>
          <strong>${escapeHtml(track.icon || '📘')} ${escapeHtml(track.title)}</strong>
          <p>${escapeHtml(track.description || track.subtitle || 'Structured curriculum track')}</p>
          <div class="pd-progress"><span style="width:${metrics.pct}%"></span></div>
          <div class="pd-inline-note">Next unlock: ${escapeHtml(next?.title || 'Start this track')} · ${escapeHtml(next?.duration || '30 min')}</div>
          <div class="pd-actions">
            <a class="pd-btn pd-btn-primary" href="${lessonHref(next.id)}">${metrics.done ? 'Resume Track →' : 'Start Track →'}</a>
            <a class="pd-btn pd-btn-secondary" href="${assetUrl(`courses/${track.id}.html`)}">View Roadmap</a>
          </div>
        </div>`;
    }).join('');
  }

  async function renderContinueLearning(){
    const container = document.getElementById('pd-continue-learning');
    if (!container) return;
    ensureStyles();
    const ml = await loadLibrary();
    const projects = await loadProjects();
    const tracks = ml.tracks || [];
    const totalLessons = tracks.reduce((sum, track) => sum + track.lessons.length, 0);
    const completed = completedIds();
    const startedTracks = tracks.filter((track) => trackMetrics(track).done > 0).length;
    const ranked = [...tracks].sort((a, b) => {
      const ma = trackMetrics(a), mb = trackMetrics(b);
      if (mb.recentTs !== ma.recentTs) return mb.recentTs - ma.recentTs;
      return mb.done - ma.done;
    });
    const activeTrack = ranked.find((track) => trackMetrics(track).done > 0) || tracks[0];
    const activeMetrics = trackMetrics(activeTrack);
    const quickWin = tracks.flatMap((track) => track.lessons.map((lesson) => ({...lesson, track})))
      .filter((lesson) => !isComplete(lesson.id))
      .sort((a, b) => {
        const parse = (v) => parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 999;
        return parse(a.duration) - parse(b.duration) || a.track.tier - b.track.tier;
      })[0];
    const buildProject = projects.find((project) => project.tier >= Math.max(2, activeTrack?.tier || 1)) || projects[0];

    container.innerHTML = `
      <div class="pd-shell">
        <div class="pd-heading">
          <div>
            <div class="pd-kicker">🧭 Continue Learning</div>
            <h2>Your best next move is already mapped</h2>
            <p>Jump back into the strongest active track, grab a short win, or move into a build path without hunting through the catalog.</p>
          </div>
          <a class="pd-link" href="${assetUrl('discover.html')}">Open full discovery →</a>
        </div>
        <div class="pd-mini-grid">
          <div class="pd-mini"><div class="value">${completed.length}</div><div class="label">Lessons completed</div></div>
          <div class="pd-mini"><div class="value">${startedTracks}</div><div class="label">Tracks started</div></div>
          <div class="pd-mini"><div class="value">${totalLessons}</div><div class="label">Available lessons</div></div>
          <div class="pd-mini"><div class="value">${projects.length}</div><div class="label">Hands-on projects</div></div>
        </div>
        <div class="pd-grid" style="margin-top:1.1rem">
          <div class="pd-card">
            <div class="pd-card-meta">
              ${tag(activeTrack.title)}
              ${tag(`${activeMetrics.done}/${activeMetrics.total} complete`, activeMetrics.done ? 'beginner' : 'neutral')}
            </div>
            <strong>Resume your strongest active path</strong>
            <p>${escapeHtml(activeTrack.description || activeTrack.subtitle || 'Progressive learning track')}</p>
            <div class="pd-progress"><span style="width:${activeMetrics.pct}%"></span></div>
            <div class="pd-inline-note">Up next: ${escapeHtml(activeMetrics.nextLesson?.title || 'Start this track')} · ${escapeHtml(activeMetrics.nextLesson?.duration || '30 min')}</div>
            <div class="pd-actions">
              <a class="pd-btn pd-btn-primary" href="${lessonHref(activeMetrics.nextLesson.id)}">${activeMetrics.done ? 'Continue Lesson →' : 'Start Here →'}</a>
              <a class="pd-btn pd-btn-secondary" href="${assetUrl(`courses/${activeTrack.id}.html`)}">View Track</a>
            </div>
          </div>
          <div class="pd-card">
            <div class="pd-card-meta">
              ${tag(quickWin?.track?.title || 'Quick win')}
              ${tag(quickWin?.badge || 'Beginner', levelTone(quickWin?.badge))}
            </div>
            <strong>Take a short win right now</strong>
            <p>${escapeHtml(quickWin?.desc || 'Pick off one compact lesson to keep momentum and unlock the next cluster of skills.')}</p>
            <div class="pd-inline-note">Recommended: ${escapeHtml(quickWin?.title || 'Foundations starter')} · ${escapeHtml(quickWin?.duration || '15 min')}</div>
            <div class="pd-actions">
              <a class="pd-btn pd-btn-primary" href="${lessonHref(quickWin?.id || tracks[0].lessons[0].id)}">Open Lesson →</a>
              <a class="pd-btn pd-btn-secondary" href="${assetUrl('tutorials/index.html')}">Browse Tutorials</a>
            </div>
          </div>
          <div class="pd-card">
            <div class="pd-card-meta">
              ${tag(buildProject?.category || 'Capstone build')}
              ${tag(buildProject?.difficulty || 'Build', levelTone(buildProject?.difficulty))}
            </div>
            <strong>Ship something from the skills you already have</strong>
            <p>${escapeHtml(buildProject?.desc || 'Apply your current track to a concrete build with execution milestones and debugging routes.')}</p>
            <div class="pd-inline-note">Suggested build: ${escapeHtml(buildProject?.title || 'Project path')} · ${escapeHtml(buildProject?.duration || '90 min')}</div>
            <div class="pd-actions">
              <a class="pd-btn pd-btn-primary" href="${projectHref(buildProject?.id || projects[0].id)}">Open Project →</a>
              <a class="pd-btn pd-btn-secondary" href="${assetUrl('projects/index.html')}">All Projects</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  async function renderLearningCompass(){
    const container = document.getElementById('pd-learning-compass');
    if (!container) return;
    ensureStyles();
    container.innerHTML = `
      <div class="pd-shell">
        <div class="pd-heading">
          <div>
            <div class="pd-kicker">🗺️ Progression UX</div>
            <h2>Choose the kind of progress you want next</h2>
            <p>Not every session should feel the same. Pick a learning mode—foundations, API building, systems design, or capstone shipping—and jump straight into the right path.</p>
          </div>
        </div>
        <div class="pd-rail">
          <a href="${assetUrl('courses/foundations.html')}"><strong>Build the base layer</strong><span>Python for AI, APIs, data prep, debugging habits, and the fundamentals that make every later track easier.</span></a>
          <a href="${assetUrl('courses/openai.html')}"><strong>Ship a real API workflow</strong><span>Move from foundations into prompts, tools, streaming, and structured outputs with concrete provider workflows.</span></a>
          <a href="${assetUrl('courses/modern-ai.html')}"><strong>Design production AI systems</strong><span>RAG, agents, observability, guardrails, hardening, and the system-level practices behind premium builds.</span></a>
          <a href="${assetUrl('projects/dev-agent.html')}"><strong>Turn lessons into capstones</strong><span>Apply the upgraded curriculum to coding agents, research crews, assistants, and scheduled automation systems.</span></a>
        </div>
      </div>`;
  }

  async function renderTrackProgression(){
    const container = document.getElementById('pd-track-progression');
    if (!container) return;
    ensureStyles();
    const ml = await loadLibrary();
    container.innerHTML = `
      <div class="pd-shell">
        <div class="pd-heading">
          <div>
            <div class="pd-kicker">📚 Track Discovery</div>
            <h2>Every roadmap now exposes a next lesson—not just a badge</h2>
            <p>Use the full curriculum tracks as a progression layer. Each card shows progress, the next unlock, and a direct route back into the exact lesson you should take next.</p>
          </div>
          <a class="pd-link" href="${assetUrl('discover.html')}">Search the full catalog →</a>
        </div>
        <div class="pd-grid">${buildTrackCards(ml.tracks || [])}</div>
      </div>`;
  }

  async function renderDiscoveryApp(){
    const root = document.getElementById('pd-discovery-app');
    if (!root) return;
    ensureStyles();
    const ml = await loadLibrary();
    const projects = await loadProjects();
    const tracks = ml.tracks || [];
    const lessons = tracks.flatMap((track) => (track.lessons || []).map((lesson, index) => ({
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      desc: lesson.desc,
      duration: lesson.duration || '30 min',
      badge: lesson.badge || 'Beginner',
      trackId: track.id,
      trackTitle: track.title,
      tier: track.tier,
      sections: lessonSectionCount(lesson),
      href: lessonHref(lesson.id),
      order: index + 1,
      searchable: `${lesson.title} ${lesson.desc} ${track.title} ${track.id} ${(lesson.sections || []).map((s) => s.h2).join(' ')}`.toLowerCase()
    })));
    const normalizedProjects = (projects || []).map((project) => ({
      type: 'project',
      id: project.id,
      title: project.title,
      desc: project.desc,
      duration: project.duration || '90 min',
      badge: project.difficulty || 'Project',
      trackId: project.category || 'Projects',
      trackTitle: project.category || 'Projects',
      tier: project.tier || 1,
      sections: Array.isArray(project.sections) ? project.sections.length : 0,
      href: projectHref(project.id),
      searchable: `${project.title} ${project.desc} ${project.category} ${(project.stack || []).join(' ')}`.toLowerCase()
    }));
    const dataset = [...lessons, ...normalizedProjects];
    const completed = new Set(completedIds());

    root.innerHTML = `
      <div class="pd-shell pd-discovery">
        <div class="pd-heading">
          <div>
            <div class="pd-kicker">🔎 Discovery</div>
            <h2>Search lessons, projects, and tracks from one place</h2>
            <p>Filter by level, track, or content type. Search works across lesson titles, descriptions, section headings, and project stacks so you can find the exact next step faster.</p>
          </div>
        </div>
        <div class="pd-mini-grid">
          <div class="pd-mini"><div class="value">${lessons.length}</div><div class="label">Lessons</div></div>
          <div class="pd-mini"><div class="value">${normalizedProjects.length}</div><div class="label">Projects</div></div>
          <div class="pd-mini"><div class="value">${tracks.length}</div><div class="label">Tracks</div></div>
          <div class="pd-mini"><div class="value">${completed.size}</div><div class="label">Completed</div></div>
        </div>
        <div class="pd-discovery-toolbar">
          <input id="pd-query" class="pd-input" type="text" placeholder="Search by topic, provider, skill, or architecture…">
          <select id="pd-type" class="pd-select">
            <option value="all">All content</option>
            <option value="lesson">Lessons only</option>
            <option value="project">Projects only</option>
          </select>
          <select id="pd-level" class="pd-select">
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <select id="pd-track" class="pd-select">
            <option value="all">All tracks</option>
            ${tracks.map((track) => `<option value="${escapeHtml(track.id)}">${escapeHtml(track.title)}</option>`).join('')}
          </select>
        </div>
        <div class="pd-stat-strip" id="pd-active-filters"></div>
        <div class="pd-results" id="pd-results"></div>
      </div>`;

    const queryEl = root.querySelector('#pd-query');
    const typeEl = root.querySelector('#pd-type');
    const levelEl = root.querySelector('#pd-level');
    const trackEl = root.querySelector('#pd-track');
    const resultsEl = root.querySelector('#pd-results');
    const filtersEl = root.querySelector('#pd-active-filters');

    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) queryEl.value = params.get('q');
    if (params.get('type')) typeEl.value = params.get('type');
    if (params.get('level')) levelEl.value = params.get('level');
    if (params.get('track')) trackEl.value = params.get('track');

    function setQueryParams(){
      const next = new URLSearchParams(window.location.search);
      [['q', queryEl.value.trim()], ['type', typeEl.value], ['level', levelEl.value], ['track', trackEl.value]].forEach(([key, value]) => {
        if (!value || value === 'all') next.delete(key); else next.set(key, value);
      });
      const suffix = next.toString();
      history.replaceState({}, '', `${window.location.pathname}${suffix ? `?${suffix}` : ''}`);
    }

    function render(){
      setQueryParams();
      const query = queryEl.value.trim().toLowerCase();
      const type = typeEl.value;
      const level = levelEl.value;
      const track = trackEl.value;
      const filtered = dataset.filter((item) => {
        const matchesQuery = !query || item.searchable.includes(query);
        const matchesType = type === 'all' || item.type === type;
        const matchesLevel = level === 'all' || levelTone(item.badge) === level;
        const matchesTrack = track === 'all' || item.trackId === track;
        return matchesQuery && matchesType && matchesLevel && matchesTrack;
      }).sort((a, b) => {
        const aDone = completed.has(a.id) ? 1 : 0;
        const bDone = completed.has(b.id) ? 1 : 0;
        if (aDone != bDone) return aDone - bDone;
        if (a.tier != b.tier) return a.tier - b.tier;
        return a.title.localeCompare(b.title);
      });

      const activeTags = [];
      if (query) activeTags.push(tag(`Query: ${query}`));
      if (type !== 'all') activeTags.push(tag(type === 'lesson' ? 'Lessons' : 'Projects'));
      if (level !== 'all') activeTags.push(tag(level, level));
      if (track !== 'all') {
        const matchedTrack = tracks.find((t) => t.id === track);
        activeTags.push(tag(matchedTrack?.title || track));
      }
      activeTags.push(tag(`${filtered.length} results`));
      filtersEl.innerHTML = activeTags.join('');

      if (!filtered.length) {
        resultsEl.innerHTML = `<div class="pd-empty">No results matched this combination. Try a broader query, or clear one of the filters.</div>`;
        return;
      }

      resultsEl.innerHTML = filtered.slice(0, 48).map((item) => `
        <article class="pd-result" data-kind="${item.type}">
          <div class="pd-result-meta">
            ${tag(item.type === 'project' ? 'Project' : 'Lesson')}
            ${tag(item.badge, levelTone(item.badge))}
            ${tag(item.trackTitle)}
            ${item.sections ? tag(`${item.sections} sections`) : ''}
            ${tag(item.duration)}
            ${completed.has(item.id) ? tag('Completed', 'beginner') : ''}
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.desc)}</p>
          <div class="pd-actions">
            <a class="pd-btn pd-btn-primary" href="${item.href}">${item.type === 'project' ? 'Open Project →' : 'Open Lesson →'}</a>
            ${item.type === 'lesson' ? `<a class="pd-btn pd-btn-secondary" href="${assetUrl(`courses/${item.trackId}.html`)}">View Track</a>` : `<a class="pd-btn pd-btn-secondary" href="${assetUrl('projects/index.html')}">Project Hub</a>`}
          </div>
        </article>`).join('');
    }

    [queryEl, typeEl, levelEl, trackEl].forEach((el) => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', render));
    window.addEventListener('pd:search', (event) => {
      if (event.detail?.query) {
        queryEl.value = event.detail.query;
        render();
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderContinueLearning().catch(console.error);
    renderLearningCompass().catch(console.error);
    renderTrackProgression().catch(console.error);
    renderDiscoveryApp().catch(console.error);
  });
})();
