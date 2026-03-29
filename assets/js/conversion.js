(function(){
  'use strict';

  const PROFILE_KEY = 'ace_onboarding_profile_v1';
  const PROGRESS_KEY = 'ace_progress_v4';
  const LEGACY_PROGRESS_KEY = 'tutorialProgress';
  const MEMORY_KEY = 'ace_learning_memory_v1';

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
  const rel = (p) => `${ROOT}${p}`;
  const abs = (p) => new URL(rel(p), window.location.href).toString();

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  async function loadJson(path){
    const res = await fetch(abs(path));
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  async function loadLibrary(){
    if (window.__cvLibrary) return window.__cvLibrary;
    const data = await loadJson('assets/data/MasterLibrary.json');
    window.__cvLibrary = data;
    return data;
  }

  async function loadProjects(){
    if (window.__cvProjects) return window.__cvProjects;
    const data = await loadJson('assets/data/projects.json');
    window.__cvProjects = data;
    return data;
  }

  function relativePath(){
    const pathname = (window.location.pathname || '').replace(/^\/+/, '');
    return pathname || 'index.html';
  }

  function escapeHtml(value){
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readProgress(){
    const modern = readJson(PROGRESS_KEY, {});
    const legacy = readJson(LEGACY_PROGRESS_KEY, {});
    const merged = {};
    Object.entries(modern || {}).forEach(([id, value]) => {
      merged[id] = {
        complete: !!value?.complete,
        completedAt: value?.completedAt || 0,
        visitedAt: value?.visitedAt || 0
      };
    });
    Object.entries(legacy || {}).forEach(([id, value]) => {
      if (!merged[id]) {
        merged[id] = {
          complete: !!value?.completed,
          completedAt: value?.date ? Date.parse(value.date) : 0,
          visitedAt: 0
        };
      } else if (value?.completed) {
        merged[id].complete = true;
        merged[id].completedAt = Math.max(merged[id].completedAt || 0, value?.date ? Date.parse(value.date) : 0);
      }
    });
    return merged;
  }

  function trackMetrics(track){
    const progress = readProgress();
    const lessons = track.lessons || [];
    const done = lessons.filter((lesson) => progress[lesson.id]?.complete).length;
    const total = lessons.length;
    const nextLesson = lessons.find((lesson) => !progress[lesson.id]?.complete) || lessons[0];
    const recentTs = Math.max(0, ...lessons.map((lesson) => progress[lesson.id]?.completedAt || progress[lesson.id]?.visitedAt || 0));
    return {
      done,
      total,
      pct: total ? Math.round((done / total) * 100) : 0,
      nextLesson,
      recentTs
    };
  }

  function tag(text, tone){
    return `<span class="cv-tag ${tone ? `cv-tag-${tone}` : ''}">${escapeHtml(text)}</span>`;
  }

  function lessonHref(id){
    return `${rel('learn/lesson.html')}?id=${encodeURIComponent(id)}&type=lesson`;
  }

  function projectHref(id){
    return `${rel('learn/project.html')}?id=${encodeURIComponent(id)}&type=project`;
  }

  function inferGoal(){
    const profile = readJson(PROFILE_KEY, null);
    const path = relativePath();
    if (profile?.goal) return profile.goal;
    if (/local-llms|ollama|llama|huggingface/.test(path)) return 'local';
    if (/openai|claude|gemini|prompting/.test(path)) return 'api';
    if (/rag|vector|retrieval/.test(path)) return 'rag';
    if (/agents|workflow|research|dev-agent/.test(path)) return 'capstone';
    return 'foundations';
  }

  function recommendationForGoal(goal){
    const map = {
      foundations: {
        trackId: 'foundations',
        project: { title: 'Personal Assistant build', href: rel('projects/personal-assistant.html'), cta: 'Open Build →', desc: 'Turn the first practical lessons into a real assistant with memory and tool use.' },
        debug: { title: 'Configuration fixes', href: rel('debugging/configuration.html'), cta: 'Open Debug Route →', desc: 'Catch setup mistakes before they turn into slow, frustrating sessions.' }
      },
      api: {
        trackId: 'modern-ai',
        project: { title: 'Personal Assistant build', href: rel('projects/personal-assistant.html'), cta: 'Build with APIs →', desc: 'Apply prompts, tools, and provider workflows inside a real assistant.' },
        debug: { title: 'API key + network triage', href: rel('debugging/api-keys.html'), cta: 'Fix API Problems →', desc: 'Go straight to the auth, quota, and provider failures that stop shipping.' }
      },
      local: {
        trackId: 'modern-ai',
        project: { title: 'Workflow Automation build', href: rel('projects/workflow-automation.html'), cta: 'Build Local Workflow →', desc: 'Use local inference and automation patterns in a more production-shaped system.' },
        debug: { title: 'Memory + vector debugging', href: rel('debugging/vectordb.html'), cta: 'Debug Retrieval →', desc: 'Most local AI pain shows up in retrieval, memory, or runtime configuration.' }
      },
      rag: {
        trackId: 'modern-ai',
        project: { title: 'Research Crew build', href: rel('projects/research-crew.html'), cta: 'Build RAG System →', desc: 'Move from retrieval lessons into a citation-backed research workflow.' },
        debug: { title: 'Vector DB triage', href: rel('debugging/vectordb.html'), cta: 'Open Retrieval Debugging →', desc: 'When retrieval quality collapses, start with chunking, indexing, and query flow.' }
      },
      capstone: {
        trackId: 'modern-ai',
        project: { title: 'Developer Agent capstone', href: rel('projects/dev-agent.html'), cta: 'Open Capstone →', desc: 'Push tools, memory, and orchestration into a serious agentic build.' },
        debug: { title: 'Async + deployment triage', href: rel('debugging/deployment.html'), cta: 'Harden the System →', desc: 'Advanced builds usually fail on orchestration, retries, and deployment edges.' }
      }
    };
    return map[goal] || map.foundations;
  }

  function chooseTrack(library, preferredId){
    const tracks = library.tracks || [];
    const ranked = [...tracks].sort((a, b) => {
      const ma = trackMetrics(a);
      const mb = trackMetrics(b);
      if (preferredId) {
        if (a.id === preferredId && b.id !== preferredId) return -1;
        if (b.id === preferredId && a.id !== preferredId) return 1;
      }
      if (mb.recentTs !== ma.recentTs) return mb.recentTs - ma.recentTs;
      if (mb.done !== ma.done) return mb.done - ma.done;
      return a.tier - b.tier;
    });
    return ranked[0] || tracks[0];
  }

  function findProject(projects, keyword){
    const needle = String(keyword || '').toLowerCase();
    return projects.find((project) => `${project.title} ${project.category} ${project.desc} ${(project.stack || []).join(' ')}`.toLowerCase().includes(needle));
  }

  function ensureStyles(){
    if (document.getElementById('cv-conversion-css')) return;
    const style = document.createElement('style');
    style.id = 'cv-conversion-css';
    style.textContent = `
      .cv-section{padding:0 var(--space-xl) var(--space-4xl)}
      .cv-container{max-width:1440px;margin:0 auto}
      .cv-shell{background:linear-gradient(180deg,rgba(0,255,170,.05),rgba(255,255,255,.02));border:1px solid rgba(0,255,170,.14);border-radius:28px;padding:clamp(1.25rem,2vw,2rem);box-shadow:0 22px 48px rgba(0,0,0,.22)}
      .cv-heading{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;flex-wrap:wrap;margin-bottom:1.35rem}
      .cv-heading h2{margin:0;font-size:clamp(1.5rem,3vw,2.35rem)}
      .cv-heading p{margin:.55rem 0 0;color:var(--text-secondary);max-width:66ch;line-height:1.78}
      .cv-kicker{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem .9rem;border-radius:999px;background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.16);color:var(--accent-primary);font-size:.78rem;font-family:var(--font-mono);margin-bottom:.85rem}
      .cv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
      .cv-card{display:flex;flex-direction:column;gap:.85rem;padding:1.15rem;border-radius:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);min-height:240px}
      .cv-card strong{display:block;font-size:1.04rem;color:var(--text-primary)}
      .cv-card p{margin:0;color:var(--text-secondary);line-height:1.72;font-size:.95rem}
      .cv-tags,.cv-actions{display:flex;flex-wrap:wrap;gap:.55rem}
      .cv-tag{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .7rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);font-size:.72rem;font-family:var(--font-mono);color:var(--text-muted)}
      .cv-tag-hot{border-color:rgba(0,255,170,.2);background:rgba(0,255,170,.08);color:var(--accent-primary)}
      .cv-tag-warn{border-color:rgba(251,191,36,.18);background:rgba(251,191,36,.08);color:var(--accent-warning)}
      .cv-tag-deep{border-color:rgba(168,85,247,.18);background:rgba(168,85,247,.08);color:var(--accent-tertiary)}
      .cv-btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:.74rem 1rem;border-radius:12px;font-weight:700;font-size:.92rem;transition:transform .2s ease,border-color .2s ease}
      .cv-btn:hover{transform:translateY(-1px)}
      .cv-btn-primary{background:var(--accent-primary);color:#06100c}
      .cv-btn-secondary{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:var(--text-primary)}
      .cv-progress{height:6px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}
      .cv-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--accent-primary),rgba(0,255,170,.55));border-radius:inherit}
      .cv-inline{font-size:.78rem;font-family:var(--font-mono);color:var(--text-muted)}
      .cv-compact{padding:0 var(--space-xl) var(--space-3xl)}
      .cv-band{margin-top:1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.85rem}
      .cv-rail{display:flex;gap:.65rem;flex-wrap:wrap}
      @media (max-width:768px){.cv-section,.cv-compact{padding:0 var(--space-lg) var(--space-3xl)}}
    `;
    document.head.appendChild(style);
  }

  function buildSectionHTML(config){
    return `
      <section class="${escapeHtml(config.sectionClass || 'cv-section')}">
        <div class="${escapeHtml(config.containerClass || 'cv-container')}">
          <div class="cv-shell" id="${escapeHtml(config.id)}">
            <div class="cv-heading">
              <div>
                <div class="cv-kicker">${escapeHtml(config.kicker || '⚡ Conversion path')}</div>
                <h2>${escapeHtml(config.title)}</h2>
                <p>${escapeHtml(config.copy)}</p>
              </div>
              ${config.railHtml ? `<div class="cv-rail">${config.railHtml}</div>` : ''}
            </div>
            <div class="cv-grid">${config.cards.map((card) => `
              <article class="cv-card">
                <div class="cv-tags">${(card.tags || []).join('')}</div>
                <strong>${escapeHtml(card.title)}</strong>
                <p>${escapeHtml(card.desc)}</p>
                ${card.progress ? `<div class="cv-progress"><span style="width:${card.progress}%"></span></div><div class="cv-inline">${escapeHtml(card.progressLabel || '')}</div>` : card.inline ? `<div class="cv-inline">${escapeHtml(card.inline)}</div>` : ''}
                <div class="cv-actions" style="margin-top:auto">
                  <a class="cv-btn cv-btn-primary" href="${escapeHtml(card.href)}">${escapeHtml(card.cta)}</a>
                  ${card.secondaryHref ? `<a class="cv-btn cv-btn-secondary" href="${escapeHtml(card.secondaryHref)}">${escapeHtml(card.secondaryCta || 'Open →')}</a>` : ''}
                </div>
              </article>`).join('')}</div>
            ${config.bandHtml ? `<div class="cv-band">${config.bandHtml}</div>` : ''}
          </div>
        </div>
      </section>`;
  }

  function insertAfter(reference, html){
    if (!reference || !reference.parentNode) return false;
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    const node = temp.firstElementChild;
    if (!node) return false;
    reference.parentNode.insertBefore(node, reference.nextSibling);
    return true;
  }

  function insertBefore(reference, html){
    if (!reference || !reference.parentNode) return false;
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    const node = temp.firstElementChild;
    if (!node) return false;
    reference.parentNode.insertBefore(node, reference);
    return true;
  }

  async function renderHubConversion(){
    const path = relativePath();
    const supported = ['index.html', 'tutorials/index.html', 'courses/index.html', 'projects/index.html'];
    if (!supported.includes(path) || document.getElementById('cv-hub-conversion')) return;
    ensureStyles();

    const library = await loadLibrary();
    const projects = await loadProjects();
    const goal = inferGoal();
    const goalRoute = recommendationForGoal(goal);
    const track = chooseTrack(library, goalRoute.trackId);
    const metrics = trackMetrics(track);
    const nextLesson = metrics.nextLesson || track.lessons[0];
    const strongProject = findProject(projects, goal === 'rag' ? 'research' : goal === 'capstone' ? 'agent' : goal === 'local' ? 'workflow' : 'assistant') || projects[0];
    const recentMemory = readJson(MEMORY_KEY, { activePath: null });
    const resumeHref = recentMemory.activePath?.nextHref || lessonHref(nextLesson.id);
    const resumeTitle = recentMemory.activePath?.nextTitle || nextLesson.title;

    const cards = [
      {
        title: metrics.done ? 'Finish the track you already started' : 'Start the cleanest next lesson',
        desc: metrics.done ? `You already have momentum in ${track.title}. Pick up the next unlock instead of bouncing across categories.` : `Open a real first lesson inside ${track.title} so the catalog turns into a plan immediately.`,
        href: resumeHref,
        cta: metrics.done ? 'Resume Next Lesson →' : 'Start Lesson →',
        secondaryHref: rel(`courses/${track.id}.html`),
        secondaryCta: 'View Track',
        tags: [tag(track.title, 'hot'), tag(nextLesson.duration || '30 min')],
        progress: metrics.pct,
        progressLabel: `${metrics.done}/${metrics.total} lessons complete · next: ${resumeTitle}`
      },
      {
        title: 'Turn this session into a real build',
        desc: goalRoute.project.desc,
        href: goalRoute.project.href,
        cta: goalRoute.project.cta,
        secondaryHref: rel('projects/index.html'),
        secondaryCta: 'All Projects',
        tags: [tag(strongProject?.category || 'Capstone', 'deep'), tag(strongProject?.difficulty || 'Build')],
        inline: `${strongProject?.title || 'Recommended project'} · ${strongProject?.duration || '90 min'}`
      },
      {
        title: 'Remove the blocker before it kills momentum',
        desc: goalRoute.debug.desc,
        href: goalRoute.debug.href,
        cta: goalRoute.debug.cta,
        secondaryHref: rel('debugging/index.html'),
        secondaryCta: 'Open Debug Lab',
        tags: [tag('Hardening route', 'warn'), tag('Fast unblock')],
        inline: 'Use this when setup, retrieval, or runtime issues start burning time.'
      }
    ];

    const html = buildSectionHTML({
      id: 'cv-hub-conversion',
      kicker: '⚡ Next best moves',
      title: path === 'projects/index.html' ? 'Start the right build instead of browsing forever' : 'Don’t stop at the catalog boundary',
      copy: path === 'courses/index.html'
        ? 'These routes turn track pages into action: resume the next lesson, start the matching build, and keep a debugging route one click away.'
        : path === 'projects/index.html'
          ? 'Pick a build with momentum behind it, keep one prep route nearby, and know where to go when the system breaks.'
          : 'Use the upgraded curriculum like a guided product: resume the next lesson, convert it into a project, and keep a fast unblock route ready.',
      cards,
      railHtml: `<a class="cv-btn cv-btn-secondary" href="${escapeHtml(rel('discover.html'))}">Discover everything</a>`
    });

    if (path === 'index.html') {
      const ref = document.querySelector('#pd-learning-compass')?.closest('section') || document.querySelector('.hero');
      if (ref) insertAfter(ref, html);
    } else if (path === 'tutorials/index.html') {
      const ref = document.querySelector('#pd-track-progression')?.closest('section') || document.querySelector('.filter-section');
      if (ref) insertAfter(ref, html.replace('cv-section', 'cv-compact'));
    } else if (path === 'courses/index.html') {
      const ref = document.querySelector('#pd-track-progression')?.closest('section') || document.querySelector('.courses-section');
      if (ref) insertBefore(ref, html.replace('cv-section', 'cv-compact'));
    } else if (path === 'projects/index.html') {
      const ref = document.querySelector('.featured-projects') || document.querySelector('.projects-section');
      if (ref) insertBefore(ref, html.replace('cv-section', 'cv-compact'));
    }
  }

  function firstLessonLink(){
    const link = document.querySelector('.lesson-link');
    if (!link) return null;
    const title = link.querySelector('.lesson-name')?.textContent?.trim() || link.textContent.trim();
    return { href: link.href, title };
  }

  function contextForPage(path){
    const map = {
      'tutorials/beginner.html': {
        title: 'Turn beginner study into a first finished path',
        copy: 'The best conversion for beginner energy is simple: one real lesson, one roadmap, and one build that makes the learning feel useful immediately.',
        cards: [
          { title: 'Open the real first foundations lesson', desc: 'Start from Python for AI so the later API and agent material has a stable base.', href: rel('learn/lesson.html?id=python-for-ai&type=lesson'), cta: 'Start Foundations →', tags: [tag('Foundations', 'hot'), tag('Lesson 1')] },
          { title: 'Follow the full beginner roadmap', desc: 'Use the surfaced foundations track instead of hopping from card to card without progression.', href: rel('courses/foundations.html'), cta: 'Open Roadmap →', tags: [tag('31 lessons'), tag('Tier 1')] },
          { title: 'Build after the basics', desc: 'Move the early lessons into a practical assistant build once you have Python, prompts, and basic API flow.', href: rel('projects/personal-assistant.html'), cta: 'Open First Build →', tags: [tag('Intermediate bridge', 'deep'), tag('Free build')] }
        ]
      },
      'tutorials/intermediate.html': {
        title: 'Convert intermediate lessons into a real shipping loop',
        copy: 'Intermediate users stall when they keep reading but never ship. These routes force a better loop: deeper lesson, relevant roadmap, then a real build.',
        cards: [
          { title: 'Resume a higher-value intermediate lesson', desc: 'Jump into streaming, tool use, or retrieval instead of re-reading the surface-level intros.', href: rel('tutorials/openai/streaming.html'), cta: 'Open Streaming →', tags: [tag('Intermediate', 'hot'), tag('Production UX')] },
          { title: 'Use the ML Core / API bridge', desc: 'The intermediate stage gets much stronger when you connect workflows, evaluation, and deployment thinking.', href: rel('courses/ml-core.html'), cta: 'Open Bridge Track →', tags: [tag('ML Core'), tag('Tier 2')] },
          { title: 'Ship the assistant build', desc: 'Use the current skills on a memory-aware assistant instead of leaving the material as theory.', href: rel('projects/personal-assistant.html'), cta: 'Start Project →', tags: [tag('Best first build', 'deep'), tag('Practical')] }
        ]
      },
      'tutorials/advanced.html': {
        title: 'Push advanced lessons into serious execution',
        copy: 'At the advanced layer the win is no longer “read more.” It is to open the next playbook, harden the system, and convert the work into a capstone.',
        cards: [
          { title: 'Open an advanced playbook', desc: 'Use the advanced path as a real execution guide instead of treating it like a static list of polished cards.', href: rel('tutorials/playbooks/architecture.html'), cta: 'Open Playbook →', tags: [tag('Architecture', 'deep'), tag('Playbook')] },
          { title: 'Move into the modern AI track', desc: 'Modern AI & Agents ties the advanced RAG, orchestration, and observability work into a tighter roadmap.', href: rel('courses/modern-ai.html'), cta: 'Open Track →', tags: [tag('Modern AI', 'hot'), tag('Tier 4')] },
          { title: 'Ship the workflow automation build', desc: 'Use the advanced material inside a real multi-step automation system with retries, summaries, and reviewable outputs.', href: rel('projects/workflow-automation.html'), cta: 'Open Advanced Build →', tags: [tag('Capstone', 'warn'), tag('Automation')] }
        ]
      },
      'tutorials/expert.html': {
        title: 'Turn expert content into capstones and hardening work',
        copy: 'Expert pages feel premium when they lead straight into high-value builds and the support lessons that keep those systems dependable.',
        cards: [
          { title: 'Go straight to the agent capstone track', desc: 'Use the strongest advanced orchestration path instead of stopping on the expert surface page.', href: rel('courses/modern-ai.html'), cta: 'Open Capstone Track →', tags: [tag('Expert', 'deep'), tag('Capstone-ready')] },
          { title: 'Start the Dev Agent build', desc: 'This is the cleanest expert conversion path in the project: tools, patches, evaluation, and bounded execution.', href: rel('projects/dev-agent.html'), cta: 'Build the Dev Agent →', tags: [tag('Agent build', 'hot'), tag('High leverage')] },
          { title: 'Back it with hardening lessons', desc: 'Use recovery, testing, and evaluation routes so the highest-value builds do not remain fragile demos.', href: rel('tutorials/agents/error-recovery.html'), cta: 'Open Hardening Lessons →', tags: [tag('Hardening', 'warn'), tag('Reliability')] }
        ]
      }
    };

    if (/^courses\/.+\.html$/.test(path) && path !== 'courses/index.html') {
      const pathLower = path.toLowerCase();
      let projectLink = rel('projects/personal-assistant.html');
      let projectTitle = 'Personal Assistant build';
      let debugLink = rel('debugging/api-keys.html');
      let debugTitle = 'API key triage';
      let roadmapLink = rel('courses/modern-ai.html');
      let roadmapTitle = 'Modern AI & Agents track';
      if (/rag/.test(pathLower)) {
        projectLink = rel('projects/research-crew.html'); projectTitle = 'Research Crew build'; debugLink = rel('debugging/vectordb.html'); debugTitle = 'Vector DB triage';
      } else if (/agents/.test(pathLower)) {
        projectLink = rel('projects/dev-agent.html'); projectTitle = 'Developer Agent capstone'; debugLink = rel('debugging/async.html'); debugTitle = 'Async orchestration fixes';
      } else if (/local-llms/.test(pathLower)) {
        projectLink = rel('projects/workflow-automation.html'); projectTitle = 'Workflow Automation build'; debugLink = rel('debugging/memory.html'); debugTitle = 'Memory + retrieval fixes';
      } else if (/claude|gemini|langchain/.test(pathLower)) {
        projectLink = rel('projects/workflow-automation.html'); projectTitle = 'Workflow Automation build'; debugLink = rel('debugging/configuration.html'); debugTitle = 'Configuration triage';
      }
      return {
        title: 'Don’t let the course end at the module list',
        copy: 'Use the course like a funnel: open the first lesson, pick the build it unlocks, and keep one debugging route ready so you actually finish the path.',
        cards: [
          { title: firstLessonLink()?.title || 'Open the first real lesson', desc: 'Start with the first concrete lesson in this course instead of treating the roadmap page as the finish line.', href: firstLessonLink()?.href || rel('tutorials/index.html'), cta: 'Open First Lesson →', tags: [tag('Lesson entry', 'hot'), tag('Fast start')] },
          { title: `Build next with ${projectTitle}`, desc: 'Convert the course into a practical output right away while the concepts are still fresh.', href: projectLink, cta: 'Open Matching Build →', tags: [tag('Build path', 'deep'), tag('Free')] },
          { title: `Keep ${debugTitle.toLowerCase()} one click away`, desc: 'The strongest conversion pages reduce the drop-off that happens when the first real error appears.', href: debugLink, cta: 'Open Debug Route →', secondaryHref: roadmapLink, secondaryCta: roadmapTitle, tags: [tag('Hardening', 'warn'), tag('No dead end')] }
        ]
      };
    }

    if (/^projects\/.+\.html$/.test(path) && path !== 'projects/index.html') {
      const pathLower = path.toLowerCase();
      let prepHref = rel('tutorials/agents/introduction.html');
      let prepTitle = 'Agents Introduction';
      let courseHref = rel('courses/agents.html');
      let courseTitle = 'Agents course';
      let nextProjectHref = rel('projects/research-crew.html');
      let nextProjectTitle = 'Research Crew build';
      let debugHref = rel('debugging/deployment.html');
      let debugTitle = 'Deployment hardening';
      if (/personal-assistant/.test(pathLower)) {
        prepHref = rel('tutorials/openai/function-calling.html'); prepTitle = 'OpenAI Function Calling'; courseHref = rel('courses/openai.html'); courseTitle = 'OpenAI course'; nextProjectHref = rel('projects/workflow-automation.html'); nextProjectTitle = 'Workflow Automation build'; debugHref = rel('debugging/memory.html'); debugTitle = 'Memory debugging';
      } else if (/workflow-automation/.test(pathLower)) {
        prepHref = rel('tutorials/agents/multi-agent.html'); prepTitle = 'Multi-Agent Coordination'; courseHref = rel('courses/agents.html'); courseTitle = 'Agents course'; nextProjectHref = rel('projects/dev-agent.html'); nextProjectTitle = 'Developer Agent capstone'; debugHref = rel('debugging/async.html'); debugTitle = 'Async debugging';
      } else if (/research-crew/.test(pathLower)) {
        prepHref = rel('tutorials/rag/hybrid-search.html'); prepTitle = 'Hybrid Search'; courseHref = rel('courses/rag.html'); courseTitle = 'RAG course'; nextProjectHref = rel('projects/dev-agent.html'); nextProjectTitle = 'Developer Agent capstone'; debugHref = rel('debugging/vectordb.html'); debugTitle = 'Vector DB debugging';
      }
      return {
        title: 'Keep the build moving after the first project page hit',
        copy: 'Real conversion on project pages means prep, build, and hardening are all one click apart. That keeps this page from becoming a dead end or a bookmarked someday project.',
        cards: [
          { title: `Study ${prepTitle} before you grind`, desc: 'A short prep lesson prevents the most common false starts on this build.', href: prepHref, cta: 'Open Prep Lesson →', tags: [tag('Study first', 'hot'), tag('Faster build')] },
          { title: `Use ${courseTitle} as the support track`, desc: 'When the project stretches beyond a single sitting, keep the matching course open as the deep-support path.', href: courseHref, cta: 'Open Support Course →', tags: [tag('Support track'), tag('Structured')] },
          { title: `When it breaks, use ${debugTitle.toLowerCase()}`, desc: 'Advanced projects lose users at the first blocker. This route keeps the capstone feeling finishable.', href: debugHref, cta: 'Open Debug Route →', secondaryHref: nextProjectHref, secondaryCta: `Next build: ${nextProjectTitle}`, tags: [tag('Hardening', 'warn'), tag('Finishable')] }
        ]
      };
    }

    return null;
  }

  function renderDetailConversion(){
    const path = relativePath();
    if (document.getElementById('cv-detail-conversion')) return;
    const ctx = contextForPage(path);
    if (!ctx) return;
    ensureStyles();
    const html = buildSectionHTML({
      id: 'cv-detail-conversion',
      kicker: '🚀 Next best moves',
      title: ctx.title,
      copy: ctx.copy,
      cards: ctx.cards,
      sectionClass: 'cv-compact',
      containerClass: 'cv-container'
    });

    const ref = document.querySelector('.course-hero, .project-info-bar, .level-hero, .page-hero');
    if (ref) {
      insertAfter(ref, html);
      return;
    }
    const fallback = document.querySelector('footer');
    if (fallback) insertBefore(fallback, html);
  }

  async function init(){
    try {
      await renderHubConversion();
      renderDetailConversion();
    } catch (err) {
      console.warn('[ConversionPass] init failed', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
