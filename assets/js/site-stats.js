'use strict';

(function () {
  const DEBUG_CASES = 50;

  function getDataBase() {
    const current = document.currentScript;
    const scriptUrl = current && current.src
      ? new URL(current.src, window.location.href)
      : new URL('assets/js/site-stats.js', window.location.href);
    return new URL('../data/', scriptUrl);
  }

  async function loadJson(name) {
    const dataBase = getDataBase();
    const response = await fetch(new URL(name, dataBase));
    if (!response.ok) {
      throw new Error(`Failed to load ${name}: HTTP ${response.status}`);
    }
    return response.json();
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = String(value);
    });
  }

  function setTierCounts(tracks) {
    tracks.forEach((track) => {
      setText(`[data-stat="tier-${track.tier}"]`, (track.lessons || []).length);
    });
  }

  async function init() {
    try {
      const [library, projects] = await Promise.all([
        loadJson('MasterLibrary.json'),
        loadJson('projects.json')
      ]);

      const tracks = Array.isArray(library?.tracks) ? library.tracks : [];
      const totalLessons = tracks.reduce((sum, track) => sum + (track.lessons || []).length, 0);
      const totalProjects = Array.isArray(projects) ? projects.length : 0;

      setText('[data-stat="lessons-total"]', totalLessons);
      setText('[data-stat="projects-total"]', totalProjects);
      setText('[data-stat="debug-total"]', DEBUG_CASES);
      setTierCounts(tracks);
    } catch (error) {
      console.error('[site-stats]', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
