/* ============================================
   AI CODING ACADEMY - MAIN JAVASCRIPT
============================================ */

// Scroll reveal animation
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);

// Nav scroll effect
const nav = document.querySelector('.nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Search functionality (keyboard shortcut + Enter to search)
function getRootPrefix() {
    const path = window.location.pathname || '/';
    if (path === '/' || path === '') return '';
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return '';
    const last = parts[parts.length - 1];
    const depth = last.includes('.') ? parts.length - 1 : parts.length;
    return depth > 0 ? '../'.repeat(depth) : '';
}

function buildSiteUrl(relativePath) {
    return new URL(getRootPrefix() + relativePath, window.location.href).toString();
}

function ensureDiscoverNavLink() {
    document.querySelectorAll('.nav-menu, .nav-links').forEach(menu => {
        const hasDiscover = Array.from(menu.querySelectorAll('a')).some(a => /discover\.html/.test(a.getAttribute('href') || ''));
        if (hasDiscover) return;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = getRootPrefix() + 'discover.html';
        link.textContent = 'Discover';
        if ((window.location.pathname || '').includes('discover.html')) {
            link.classList.add('active');
        }
        item.appendChild(link);
        menu.appendChild(item);
    });

    document.querySelectorAll('.nav-search input').forEach(input => {
        if ((input.getAttribute('placeholder') || '').toLowerCase().includes('tutorial')) {
            input.setAttribute('placeholder', 'Search lessons or projects...');
        }
    });
}

function loadOptionalEnhancementScript(relativePath, marker) {
    if (document.querySelector(`script[data-ai-enhancement="${marker}"]`)) return;
    const script = document.createElement('script');
    script.src = getRootPrefix() + relativePath;
    script.defer = true;
    script.dataset.aiEnhancement = marker;
    document.head.appendChild(script);
}

loadOptionalEnhancementScript('assets/js/conversion.js', 'conversion-pass-v1');

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.nav-search input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

const navSearchInputEl = document.querySelector('.nav-search input');
if (navSearchInputEl) {
    navSearchInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (window.location.pathname.includes('/tutorials/index')) return;
            const query = navSearchInputEl.value.trim();
            const discoveryUrl = new URL(buildSiteUrl('discover.html'));
            if (query) {
                discoveryUrl.searchParams.set('q', query);
            }
            window.location.href = discoveryUrl.toString();
        }
    });
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu, .nav-links');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
}

// Copy code functionality
function copyCode(button) {
    const codeBlock = button.closest('.code-window').querySelector('.code-content');
    const text = codeBlock.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.color = 'var(--accent-success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.color = '';
        }, 2000);
    });
}

// Tab switching
document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab');
    const contents = tabContainer.closest('.tab-container')?.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (contents) {
                contents.forEach(c => c.classList.remove('active'));
                contents[index]?.classList.add('active');
            }
        });
    });
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filterGroup = btn.closest('.filter-group') || btn.parentElement;
        filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Trigger filter event
        const filterValue = btn.dataset.filter;
        const event = new CustomEvent('filter', { detail: { filter: filterValue } });
        document.dispatchEvent(event);
    });
});

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isOpen = item.classList.contains('open');
        
        // Close all items in this accordion
        const accordion = item.closest('.accordion');
        accordion.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
        
        // Open clicked item if it wasn't open
        if (!isOpen) {
            item.classList.add('open');
        }
    });
});

// Progress animation on scroll
const progressBars = document.querySelectorAll('.progress-bar');
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const progress = bar.dataset.progress || 0;
            bar.style.width = progress + '%';
        }
    });
}, { threshold: 0.5 });

progressBars.forEach(bar => progressObserver.observe(bar));

// Tooltip functionality
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
        document.querySelectorAll('.tooltip').forEach(t => t.remove());
    });
});

// Search functionality
const searchInputs = document.querySelectorAll('.search-input');
searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const searchableItems = document.querySelectorAll('[data-searchable]');
        
        searchableItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query);
            item.style.display = matches ? '' : 'none';
        });
    });
});

// Lazy loading images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Tutorial completion tracking (localStorage)
const TutorialProgress = {
    getProgress: () => {
        return JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
    },
    
    markComplete: (tutorialId) => {
        const progress = TutorialProgress.getProgress();
        progress[tutorialId] = { completed: true, date: new Date().toISOString() };
        localStorage.setItem('tutorialProgress', JSON.stringify(progress));
    },
    
    isComplete: (tutorialId) => {
        const progress = TutorialProgress.getProgress();
        return progress[tutorialId]?.completed || false;
    },
    
    getCompletedCount: () => {
        const progress = TutorialProgress.getProgress();
        return Object.values(progress).filter(p => p.completed).length;
    }
};

// Expose to global scope
window.TutorialProgress = TutorialProgress;
window.copyCode = copyCode;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    reveal();
    ensureDiscoverNavLink();
    
    // Update any progress displays
    const progressCounters = document.querySelectorAll('[data-progress-count]');
    progressCounters.forEach(counter => {
        counter.textContent = TutorialProgress.getCompletedCount();
    });
});

console.log('🚀 AI Coding Academy loaded successfully!');


/* ============================================
   AI CODING ACADEMY - ONBOARDING & RETENTION
============================================ */
const LearningRetention = (() => {
    const ONBOARDING_KEY = 'ace_onboarding_profile_v1';
    const SAVED_KEY = 'ace_saved_pathways_v1';
    const MEMORY_KEY = 'ace_learning_memory_v1';
    const MODERN_PROGRESS_KEY = 'ace_progress_v4';

    const GOAL_MAP = {
        foundations: {
            label: 'Strong foundations',
            summary: 'Start with Python, APIs, JSON, async workflows, and the habits that make every later model track easier.',
            trackTitle: 'Foundations Track',
            trackHref: 'courses/foundations.html',
            resumeHref: 'learn/lesson.html?id=python-for-ai&type=lesson',
            resumeTitle: 'Python for AI Development',
            quickWins: [
                { title: 'Open the Foundations roadmap', href: 'courses/foundations.html' },
                { title: 'Start lesson 1', href: 'learn/lesson.html?id=python-for-ai&type=lesson' },
                { title: 'Use the discovery hub', href: 'discover.html?track=foundations' }
            ]
        },
        api: {
            label: 'Build with model APIs',
            summary: 'Move into prompts, structured outputs, streaming, and tool-calling with a provider workflow you can ship fast.',
            trackTitle: 'OpenAI API Course',
            trackHref: 'courses/openai.html',
            resumeHref: 'tutorials/openai/getting-started.html',
            resumeTitle: 'OpenAI Getting Started',
            quickWins: [
                { title: 'Start the OpenAI course', href: 'courses/openai.html' },
                { title: 'Ship your first call', href: 'tutorials/openai/getting-started.html' },
                { title: 'Debug auth problems', href: 'debugging/api-keys.html' }
            ]
        },
        local: {
            label: 'Run local AI',
            summary: 'Learn Ollama, local inference, quantization choices, and practical ways to work without vendor lock-in.',
            trackTitle: 'Local LLMs Course',
            trackHref: 'courses/local-llms.html',
            resumeHref: 'tutorials/local-llms/ollama.html',
            resumeTitle: 'Ollama Quickstart',
            quickWins: [
                { title: 'Open the Local LLMs course', href: 'courses/local-llms.html' },
                { title: 'Start with Ollama', href: 'tutorials/local-llms/ollama.html' },
                { title: 'Explore local tooling', href: 'tutorials/local-llms/langchain-ollama.html' }
            ]
        },
        systems: {
            label: 'RAG + agents + systems',
            summary: 'Focus on retrieval, tool loops, observability, and the system design patterns behind production AI products.',
            trackTitle: 'Modern AI Track',
            trackHref: 'courses/modern-ai.html',
            resumeHref: 'tutorials/rag/introduction.html',
            resumeTitle: 'RAG Introduction',
            quickWins: [
                { title: 'Open the Modern AI roadmap', href: 'courses/modern-ai.html' },
                { title: 'Start with RAG', href: 'tutorials/rag/introduction.html' },
                { title: 'Move into agent design', href: 'tutorials/agents/introduction.html' }
            ]
        },
        capstone: {
            label: 'Ship capstone builds',
            summary: 'Use the strongest lessons as a build system for coding agents, research crews, assistants, and recurring workflows.',
            trackTitle: 'Capstone Projects',
            trackHref: 'projects/index.html',
            resumeHref: 'projects/dev-agent.html',
            resumeTitle: 'Dev Agent Capstone',
            quickWins: [
                { title: 'Open the project hub', href: 'projects/index.html' },
                { title: 'Start the Dev Agent capstone', href: 'projects/dev-agent.html' },
                { title: 'Review agent hardening lessons', href: 'tutorials/agents/error-recovery.html' }
            ]
        }
    };

    const LEVEL_LABELS = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
    };

    const CADENCE_LABELS = {
        quick: '15 min sessions',
        focused: '30 min sessions',
        deep: '60+ min deep work'
    };

    const HUB_PAGES = ['index.html', 'tutorials/index.html', 'courses/index.html', 'projects/index.html', 'discover.html'];

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('[Retention] localStorage write failed', err);
        }
    }

    function readProfile() {
        return readJson(ONBOARDING_KEY, null);
    }

    function saveProfile(profile) {
        writeJson(ONBOARDING_KEY, profile);
    }

    function readSaved() {
        return readJson(SAVED_KEY, { items: [] });
    }

    function saveSaved(data) {
        writeJson(SAVED_KEY, data);
    }

    function readMemory() {
        return readJson(MEMORY_KEY, { recent: [], projects: {}, activePath: null, lastCompletedLesson: null });
    }

    function saveMemory(memory) {
        writeJson(MEMORY_KEY, memory);
    }

    function normalizeHref(rel) {
        return buildSiteUrl(rel);
    }

    function relativeSitePath() {
        const pathname = (window.location.pathname || '').toLowerCase();
        const match = pathname.match(/(index\.html|discover\.html|learn\/(?:lesson|project)\.html|courses\/.+?\.html|tutorials\/.+?\.html|projects\/.+?\.html|debugging\/.+?\.html|about\.html|api-reference\.html|blog\.html|careers\.html|community\.html|contact\.html|docs\.html|faq\.html|press\.html|privacy\.html|terms\.html|404\.html)$/);
        if (match) return match[1];
        const trimmed = pathname.replace(/^\/+/, '');
        return trimmed || 'index.html';
    }

    function pageKeyFromCurrent() {
        const url = new URL(window.location.href);
        const qid = url.searchParams.get('id');
        if (qid) return qid;
        return `${relativeSitePath()}${url.search ? `?${url.searchParams.toString()}` : ''}`;
    }

    function currentPageMeta() {
        const url = new URL(window.location.href);
        const path = relativeSitePath();
        const titleEl = document.querySelector('h1, .course-title, .hero-title, .lesson-title');
        const subtitleEl = document.querySelector('.lesson-description, .course-subtitle, .hero-copy, .course-subtitle, .section-head p');
        const title = (titleEl?.textContent || document.title || 'AI Coding Academy').trim().replace(/\s+/g, ' ');
        const subtitle = (subtitleEl?.textContent || '').trim().replace(/\s+/g, ' ');
        let type = 'page';
        if (/^tutorials\/.+\.html$/i.test(path) && !['tutorials/index.html','tutorials/beginner.html','tutorials/intermediate.html','tutorials/advanced.html','tutorials/expert.html'].includes(path)) type = 'lesson';
        if (/^learn\/lesson\.html$/i.test(path)) type = 'lesson';
        if (/^projects\/.+\.html$/i.test(path) && path !== 'projects/index.html') type = 'project';
        if (/^learn\/project\.html$/i.test(path)) type = 'project';
        if (/^courses\/.+\.html$/i.test(path) && path !== 'courses/index.html') type = 'course';
        if (/^debugging\/.+\.html$/i.test(path) && path !== 'debugging/index.html') type = 'debug';
        const track = document.querySelector('.breadcrumb span:last-child')?.textContent?.trim() || document.querySelector('.hero-kicker')?.textContent?.trim() || '';
        return {
            id: pageKeyFromCurrent(),
            href: `${window.location.pathname}${window.location.search}`,
            type,
            title,
            subtitle,
            track,
            path
        };
    }

    function readUnifiedLessonProgress() {
        const modern = readJson(MODERN_PROGRESS_KEY, {});
        const legacy = readJson('tutorialProgress', {});
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
                merged[id] = { complete: !!value?.completed, completedAt: value?.date ? Date.parse(value.date) : 0, visitedAt: 0 };
            } else if (value?.completed) {
                merged[id].complete = true;
                merged[id].completedAt = Math.max(merged[id].completedAt || 0, value?.date ? Date.parse(value.date) : 0);
            }
        });

        return merged;
    }

    function completionStats() {
        const progress = readUnifiedLessonProgress();
        const done = Object.values(progress).filter((entry) => entry.complete).length;
        const completionTimes = Object.values(progress).filter((entry) => entry.complete && entry.completedAt).map((entry) => entry.completedAt);
        const distinctDays = [...new Set(completionTimes.map((ts) => new Date(ts).toISOString().slice(0, 10)))];
        return { done, completionTimes, streakDays: distinctDays.length };
    }

    function computeCompletionStreak() {
        const times = completionStats().completionTimes.sort((a, b) => b - a);
        if (!times.length) return 0;
        const days = [...new Set(times.map((ts) => new Date(ts).toISOString().slice(0, 10)))].sort().reverse();
        let streak = 0;
        const cursor = new Date();
        while (true) {
            const dayKey = cursor.toISOString().slice(0, 10);
            if (days.includes(dayKey)) {
                streak += 1;
                cursor.setDate(cursor.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    function recommendationFor(profile) {
        const fallback = GOAL_MAP.foundations;
        const mapped = GOAL_MAP[profile?.goal] || fallback;
        const level = profile?.level || 'beginner';
        let resumeHref = mapped.resumeHref;
        let resumeTitle = mapped.resumeTitle;
        if (profile?.goal === 'systems' && level === 'advanced') {
            resumeHref = 'tutorials/agents/introduction.html';
            resumeTitle = 'Agents Introduction';
        }
        if (profile?.goal === 'api' && level === 'advanced') {
            resumeHref = 'tutorials/openai/function-calling.html';
            resumeTitle = 'OpenAI Function Calling';
        }
        if (profile?.goal === 'capstone' && level === 'beginner') {
            resumeHref = 'projects/personal-assistant.html';
            resumeTitle = 'Personal Assistant Project';
        }
        return {
            goal: profile?.goal || 'foundations',
            level,
            cadence: profile?.cadence || 'focused',
            label: mapped.label,
            summary: mapped.summary,
            trackTitle: mapped.trackTitle,
            trackHref: normalizeHref(mapped.trackHref),
            resumeHref: normalizeHref(resumeHref),
            resumeTitle,
            quickWins: mapped.quickWins.map((item) => ({ ...item, href: normalizeHref(item.href) }))
        };
    }

    function recordVisit() {
        const memory = readMemory();
        const page = currentPageMeta();
        const recent = memory.recent.filter((item) => item.id !== page.id);
        recent.unshift({ ...page, visitedAt: Date.now() });
        memory.recent = recent.slice(0, 10);
        saveMemory(memory);
    }

    function isSaved(itemId) {
        return readSaved().items.some((item) => item.id === itemId);
    }

    function saveCurrentPage() {
        const saved = readSaved();
        const page = currentPageMeta();
        if (!saved.items.some((item) => item.id === page.id)) {
            saved.items.unshift({ ...page, savedAt: Date.now() });
            saved.items = saved.items.slice(0, 24);
            saveSaved(saved);
        }
    }

    function unsaveCurrentPage() {
        const saved = readSaved();
        const page = currentPageMeta();
        saved.items = saved.items.filter((item) => item.id !== page.id);
        saveSaved(saved);
    }

    function setActiveFromCurrent() {
        const memory = readMemory();
        const page = currentPageMeta();
        const nextLink = getNextLinkFromPage();
        memory.activePath = {
            id: page.id,
            href: page.href,
            title: page.title,
            type: page.type,
            track: page.track,
            nextHref: nextLink?.href || '',
            nextTitle: nextLink?.title || '',
            updatedAt: Date.now()
        };
        saveMemory(memory);
    }

    function getNextLinkFromPage() {
        const next = document.querySelector('.lesson-nav a.next, #ce-lesson-nav a.next');
        if (!next) return null;
        const title = next.querySelector('.lesson-nav-title')?.textContent?.trim() || next.textContent.trim();
        return { href: next.href, title };
    }

    function markProjectComplete() {
        const memory = readMemory();
        const page = currentPageMeta();
        memory.projects = memory.projects || {};
        const current = memory.projects[page.id] || {};
        memory.projects[page.id] = {
            ...current,
            title: page.title,
            href: page.href,
            complete: !current.complete,
            updatedAt: Date.now()
        };
        saveMemory(memory);
        return memory.projects[page.id].complete;
    }

    function projectCompleteState() {
        const memory = readMemory();
        const page = currentPageMeta();
        return !!memory.projects?.[page.id]?.complete;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function ensureStyles() {
        if (document.getElementById('lr-retention-styles')) return;
        const style = document.createElement('style');
        style.id = 'lr-retention-styles';
        style.textContent = `
            .lr-shell{max-width:1200px;margin:0 auto;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:clamp(1.25rem,2vw,2rem);box-shadow:0 24px 48px rgba(0,0,0,.18)}
            .lr-heading{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1.25rem}
            .lr-heading h2{margin:0;font-size:clamp(1.5rem,3vw,2.25rem)}
            .lr-heading p{margin:.55rem 0 0;color:var(--text-secondary);max-width:66ch;line-height:1.75}
            .lr-kicker{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem .85rem;border-radius:999px;background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.16);color:var(--accent-primary);font-size:.78rem;font-family:var(--font-mono);margin-bottom:.85rem}
            .lr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
            .lr-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:1.1rem;display:flex;flex-direction:column;gap:.8rem}
            .lr-card h3,.lr-card strong{margin:0;color:var(--text-primary);font-family:var(--font-heading)}
            .lr-card p{margin:0;color:var(--text-secondary);line-height:1.7;font-size:.95rem}
            .lr-tags,.lr-actions,.lr-stats{display:flex;flex-wrap:wrap;gap:.55rem}
            .lr-tag{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .7rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);font-size:.72rem;font-family:var(--font-mono);color:var(--text-muted)}
            .lr-btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:.72rem 1rem;border-radius:12px;font-weight:700;font-size:.92rem;cursor:pointer;border:none}
            .lr-btn-primary{background:var(--accent-primary);color:#08120f}
            .lr-btn-secondary{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:var(--text-primary)}
            .lr-btn-ghost{background:transparent;border:1px dashed rgba(255,255,255,.14);color:var(--text-secondary)}
            .lr-stat{padding:1rem;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}
            .lr-stat .value{font-size:1.55rem;font-weight:800;color:var(--text-primary);font-family:var(--font-heading)}
            .lr-stat .label{font-size:.78rem;color:var(--text-muted);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;margin-top:.35rem}
            .lr-section{padding:0 var(--space-xl) var(--space-4xl)}
            .lr-empty{padding:1.3rem;border:1px dashed rgba(255,255,255,.08);border-radius:16px;color:var(--text-muted);text-align:center}
            .lr-inline-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.1rem}
            .lr-chip{display:inline-flex;align-items:center;gap:.45rem;padding:.55rem .8rem;border-radius:999px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:var(--text-primary);font-size:.88rem;font-weight:600;text-decoration:none}
            .lr-chip button{all:unset;cursor:pointer}
            .lr-dock{position:fixed;right:1rem;bottom:1rem;display:flex;gap:.65rem;flex-wrap:wrap;z-index:9998;max-width:min(92vw,560px)}
            .lr-dock-btn{display:inline-flex;align-items:center;gap:.45rem;padding:.78rem 1rem;border-radius:999px;background:#0c1218;border:1px solid rgba(255,255,255,.12);color:var(--text-primary);text-decoration:none;font-weight:700;box-shadow:0 14px 30px rgba(0,0,0,.28)}
            .lr-dock-btn-primary{background:linear-gradient(135deg,var(--accent-primary),rgba(0,255,170,.72));color:#06100c}
            .lr-modal-backdrop,.lr-drawer-backdrop{position:fixed;inset:0;background:rgba(2,6,10,.72);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem}
            .lr-modal,.lr-drawer{width:min(960px,96vw);max-height:min(92vh,860px);overflow:auto;background:#0b1117;border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:1.25rem 1.25rem 1.4rem;box-shadow:0 30px 80px rgba(0,0,0,.38)}
            .lr-modal-header,.lr-drawer-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1rem}
            .lr-close{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:var(--text-primary);padding:.6rem .8rem;cursor:pointer}
            .lr-choice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.85rem}
            .lr-choice{padding:1rem;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);cursor:pointer;transition:transform .2s ease,border-color .2s ease}
            .lr-choice:hover{transform:translateY(-2px);border-color:rgba(0,255,170,.24)}
            .lr-choice.active{border-color:rgba(0,255,170,.28);background:rgba(0,255,170,.08)}
            .lr-choice strong{display:block;color:var(--text-primary);margin-bottom:.4rem}
            .lr-choice span{display:block;color:var(--text-secondary);line-height:1.65;font-size:.92rem}
            .lr-stack{display:grid;gap:1rem}
            .lr-list{display:grid;gap:.75rem}
            .lr-list-item{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding:1rem;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06)}
            .lr-list-copy strong{display:block;color:var(--text-primary);margin-bottom:.25rem}
            .lr-list-copy span{display:block;color:var(--text-secondary);line-height:1.65;font-size:.92rem}
            .lr-list-meta{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.45rem}
            .lr-drawer-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem}
            .lr-plan-band{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem}
            .lr-plan-main,.lr-plan-side{padding:1rem;border-radius:20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06)}
            .lr-note{font-size:.83rem;color:var(--text-muted);font-family:var(--font-mono)}
            @media (max-width:900px){.lr-drawer-grid,.lr-plan-band{grid-template-columns:1fr}.lr-dock{left:1rem;right:1rem;max-width:none}.lr-dock .lr-dock-btn{flex:1;justify-content:center}}
        `;
        document.head.appendChild(style);
    }

    function createHubMount(id) {
        let mount = document.getElementById(id);
        if (mount) return mount;
        const main = document.querySelector('main') || document.body;
        const footer = document.querySelector('footer');
        const section = document.createElement('section');
        section.className = 'lr-section';
        section.innerHTML = `<div class="container"><div id="${id}"></div></div>`;
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(section, footer);
        } else {
            main.appendChild(section);
        }
        return section.querySelector(`#${id}`);
    }

    function renderHubPanels() {
        const path = relativeSitePath();
        if (!HUB_PAGES.includes(path)) return;
        ensureStyles();
        const planMount = createHubMount('lr-path-studio');
        const savedMount = createHubMount('lr-saved-shelf');
        const profile = readProfile();
        const recommendation = recommendationFor(profile || {});
        const memory = readMemory();
        const saved = readSaved().items || [];
        const streak = computeCompletionStreak();
        const stats = completionStats();
        const recent = memory.recent.slice(0, 4);

        planMount.innerHTML = profile ? `
            <div class="lr-shell">
              <div class="lr-heading">
                <div>
                  <div class="lr-kicker">🧭 Guided onboarding</div>
                  <h2>Your saved pathway now behaves like a real study system</h2>
                  <p>${escapeHtml(recommendation.summary)} This plan stays visible across lessons, tracks, and projects so users can always answer: what should I open next?</p>
                </div>
                <div class="lr-actions">
                  <button class="lr-btn lr-btn-secondary" data-lr-open-plan>Adjust my path</button>
                  <a class="lr-btn lr-btn-primary" href="${escapeHtml(memory.activePath?.nextHref || memory.activePath?.href || recommendation.resumeHref)}">Resume next step →</a>
                </div>
              </div>
              <div class="lr-plan-band">
                <div class="lr-plan-main">
                  <div class="lr-tags">
                    <span class="lr-tag">${escapeHtml(LEVEL_LABELS[profile.level] || 'Beginner')}</span>
                    <span class="lr-tag">${escapeHtml(CADENCE_LABELS[profile.cadence] || '30 min sessions')}</span>
                    <span class="lr-tag">${escapeHtml(recommendation.trackTitle)}</span>
                  </div>
                  <h3 style="margin:.95rem 0 .5rem">${escapeHtml(memory.activePath?.title || recommendation.resumeTitle)}</h3>
                  <p>${escapeHtml(memory.activePath?.nextTitle ? `Next unlock: ${memory.activePath.nextTitle}` : recommendation.summary)}</p>
                  <div class="lr-actions" style="margin-top:1rem">
                    <a class="lr-btn lr-btn-primary" href="${escapeHtml(memory.activePath?.href || recommendation.resumeHref)}">Open active path →</a>
                    <a class="lr-btn lr-btn-secondary" href="${escapeHtml(recommendation.trackHref)}">Open roadmap</a>
                  </div>
                </div>
                <div class="lr-plan-side">
                  <strong>Suggested quick wins</strong>
                  <div class="lr-list" style="margin-top:.85rem">
                    ${recommendation.quickWins.map((item) => `
                      <a class="lr-chip" href="${escapeHtml(item.href)}">${escapeHtml(item.title)} →</a>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>` : `
            <div class="lr-shell">
              <div class="lr-heading">
                <div>
                  <div class="lr-kicker">✨ First-visit onboarding</div>
                  <h2>Give new users a confident starting path instead of a giant catalog</h2>
                  <p>Answer three fast questions—goal, current level, and session size—and the site will save a working route across lessons, tracks, and projects.</p>
                </div>
                <div class="lr-actions">
                  <button class="lr-btn lr-btn-primary" data-lr-open-plan>Build my path →</button>
                </div>
              </div>
              <div class="lr-grid">
                <div class="lr-card"><strong>Foundations first</strong><p>Great for users who want to understand Python, APIs, async workflows, and debugging before they touch higher-level model work.</p></div>
                <div class="lr-card"><strong>Provider workflows</strong><p>Perfect for users who want immediate wins with OpenAI, Gemini, or Claude integrations and structured outputs.</p></div>
                <div class="lr-card"><strong>Systems & capstones</strong><p>For users who already know the basics and want RAG, agents, observability, and production-style builds.</p></div>
              </div>
            </div>`;

        savedMount.innerHTML = `
            <div class="lr-shell">
              <div class="lr-heading">
                <div>
                  <div class="lr-kicker">💾 Retention UX</div>
                  <h2>Saved pathways, recent work, and momentum stay visible</h2>
                  <p>This shelf keeps progress from disappearing after a single session. Saved lessons, pinned tracks, recent builds, and streak metrics are all one click away.</p>
                </div>
                <div class="lr-stats">
                  <div class="lr-stat"><div class="value">${stats.done}</div><div class="label">Lessons complete</div></div>
                  <div class="lr-stat"><div class="value">${saved.length}</div><div class="label">Saved items</div></div>
                  <div class="lr-stat"><div class="value">${streak}</div><div class="label">Active streak</div></div>
                </div>
              </div>
              <div class="lr-drawer-grid">
                <div class="lr-stack">
                  <div class="lr-card">
                    <strong>Saved shelf</strong>
                    ${saved.length ? `<div class="lr-list">${saved.slice(0, 5).map((item) => `
                      <div class="lr-list-item">
                        <div class="lr-list-copy">
                          <strong>${escapeHtml(item.title)}</strong>
                          <span>${escapeHtml(item.subtitle || item.track || item.type)}</span>
                          <div class="lr-list-meta"><span class="lr-tag">${escapeHtml(item.type)}</span>${item.track ? `<span class="lr-tag">${escapeHtml(item.track)}</span>` : ''}</div>
                        </div>
                        <a class="lr-btn lr-btn-secondary" href="${escapeHtml(item.href)}">Open</a>
                      </div>`).join('')}</div>` : `<div class="lr-empty">Nothing is pinned yet. Save a lesson, course, or project and it will stay on this shelf.</div>`}
                  </div>
                </div>
                <div class="lr-stack">
                  <div class="lr-card">
                    <strong>Recent sessions</strong>
                    ${recent.length ? `<div class="lr-list">${recent.map((item) => `
                      <div class="lr-list-item">
                        <div class="lr-list-copy">
                          <strong>${escapeHtml(item.title)}</strong>
                          <span>${escapeHtml(item.track || item.type)}</span>
                        </div>
                        <a class="lr-btn lr-btn-secondary" href="${escapeHtml(item.href)}">Resume</a>
                      </div>`).join('')}</div>` : `<div class="lr-empty">Recent lessons and projects will appear here after the first real session.</div>`}
                  </div>
                </div>
              </div>
            </div>`;

        document.querySelectorAll('[data-lr-open-plan]').forEach((btn) => {
            btn.addEventListener('click', () => openOnboardingModal(true));
        });
    }

    function renderDock() {
        ensureStyles();
        let dock = document.getElementById('lr-floating-dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'lr-floating-dock';
            dock.className = 'lr-dock';
            document.body.appendChild(dock);
        }
        const memory = readMemory();
        const profile = readProfile();
        const recommendation = recommendationFor(profile || {});
        const savedCount = readSaved().items.length;
        const resumeHref = memory.activePath?.nextHref || memory.activePath?.href || recommendation.resumeHref;
        const resumeLabel = memory.activePath?.nextTitle || memory.activePath?.title || recommendation.resumeTitle;
        dock.innerHTML = `
            <a class="lr-dock-btn lr-dock-btn-primary" href="${escapeHtml(resumeHref)}">▶ Resume ${escapeHtml(resumeLabel)}</a>
            <button class="lr-dock-btn" id="lr-open-saved">💾 Saved ${savedCount ? `(${savedCount})` : ''}</button>
            <button class="lr-dock-btn" id="lr-open-onboarding">🧭 ${profile ? 'Adjust plan' : 'Build my path'}</button>`;
        dock.querySelector('#lr-open-saved')?.addEventListener('click', openSavedDrawer);
        dock.querySelector('#lr-open-onboarding')?.addEventListener('click', () => openOnboardingModal(true));
    }

    function buildChoiceGrid(title, description, key, options, selectedValue) {
        return `
            <section class="lr-stack">
              <div>
                <div class="lr-kicker">${escapeHtml(title)}</div>
                <p style="margin:0;color:var(--text-secondary);line-height:1.75">${escapeHtml(description)}</p>
              </div>
              <div class="lr-choice-grid" data-lr-choice-grid="${escapeHtml(key)}">
                ${options.map((option) => `
                  <button class="lr-choice ${selectedValue === option.value ? 'active' : ''}" data-value="${escapeHtml(option.value)}">
                    <strong>${escapeHtml(option.label)}</strong>
                    <span>${escapeHtml(option.copy)}</span>
                  </button>`).join('')}
              </div>
            </section>`;
    }

    function openOnboardingModal(force = false) {
        const existing = document.getElementById('lr-onboarding-backdrop');
        if (existing) existing.remove();
        ensureStyles();
        const current = readProfile() || { goal: 'foundations', level: 'beginner', cadence: 'focused' };
        const backdrop = document.createElement('div');
        backdrop.className = 'lr-modal-backdrop';
        backdrop.id = 'lr-onboarding-backdrop';
        backdrop.innerHTML = `
            <div class="lr-modal" role="dialog" aria-modal="true" aria-label="Create your learning path">
              <div class="lr-modal-header">
                <div>
                  <div class="lr-kicker">🧭 Onboarding & retention</div>
                  <h2 style="margin:0">Create a path that the site will remember</h2>
                  <p style="margin:.55rem 0 0;color:var(--text-secondary);line-height:1.75">This first-visit flow now saves your goal, level, pace, and active route so the platform can keep showing the next useful step across lessons, tracks, and projects.</p>
                </div>
                <button class="lr-close" data-lr-close>Close</button>
              </div>
              <div class="lr-stack">
                ${buildChoiceGrid('1. What do you want most?', 'Pick the lane you want the platform to optimize for first.', 'goal', [
                    { value: 'foundations', label: 'Strong foundations', copy: 'Python, APIs, JSON, async, cost, and engineering habits.' },
                    { value: 'api', label: 'Provider workflows', copy: 'OpenAI, prompts, tools, streaming, and structured outputs.' },
                    { value: 'local', label: 'Local AI', copy: 'Ollama, local inference, and practical model hosting.' },
                    { value: 'systems', label: 'RAG + agents', copy: 'Retrieval, orchestration, observability, and system design.' },
                    { value: 'capstone', label: 'Capstone builds', copy: 'Projects, execution quality, and premium build paths.' }
                ], current.goal)}
                ${buildChoiceGrid('2. Where are you starting from?', 'This helps the site choose a gentler or deeper first route.', 'level', [
                    { value: 'beginner', label: 'Beginner', copy: 'I want the safest starting route and fewer assumptions.' },
                    { value: 'intermediate', label: 'Intermediate', copy: 'I know the basics and want stronger build momentum.' },
                    { value: 'advanced', label: 'Advanced', copy: 'I want the fastest route into systems and hardening.' }
                ], current.level)}
                ${buildChoiceGrid('3. How do you usually study?', 'Cadence lets the site suggest the right size of next step.', 'cadence', [
                    { value: 'quick', label: 'Quick sessions', copy: 'Give me 15 minute wins and low-friction starts.' },
                    { value: 'focused', label: 'Focused sessions', copy: '30 minute lessons and clear next actions work best.' },
                    { value: 'deep', label: 'Deep work', copy: 'I want longer projects, capstones, and dense pages.' }
                ], current.cadence)}
              </div>
              <div class="lr-actions" style="margin-top:1.25rem;justify-content:flex-end">
                <button class="lr-btn lr-btn-ghost" data-lr-reset ${readProfile() ? '' : 'style="display:none"'}>Reset saved plan</button>
                <button class="lr-btn lr-btn-primary" data-lr-save-plan>Save my path →</button>
              </div>
            </div>`;
        document.body.appendChild(backdrop);

        const state = { ...current };
        backdrop.querySelectorAll('[data-lr-choice-grid]').forEach((grid) => {
            const key = grid.getAttribute('data-lr-choice-grid');
            grid.querySelectorAll('.lr-choice').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state[key] = btn.dataset.value;
                    grid.querySelectorAll('.lr-choice').forEach((node) => node.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });

        function close() {
            backdrop.remove();
        }

        backdrop.querySelectorAll('[data-lr-close]').forEach((btn) => btn.addEventListener('click', close));
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) close();
        });

        backdrop.querySelector('[data-lr-reset]')?.addEventListener('click', () => {
            localStorage.removeItem(ONBOARDING_KEY);
            const memory = readMemory();
            memory.activePath = null;
            saveMemory(memory);
            close();
            window.dispatchEvent(new CustomEvent('lr:update'));
        });

        backdrop.querySelector('[data-lr-save-plan]')?.addEventListener('click', () => {
            const profile = { ...state, updatedAt: Date.now() };
            saveProfile(profile);
            const plan = recommendationFor(profile);
            const memory = readMemory();
            memory.activePath = {
                id: `plan:${profile.goal}`,
                title: plan.resumeTitle,
                href: new URL(plan.resumeHref).pathname + new URL(plan.resumeHref).search,
                type: 'path',
                track: plan.trackTitle,
                nextHref: '',
                nextTitle: '',
                updatedAt: Date.now()
            };
            saveMemory(memory);
            close();
            window.dispatchEvent(new CustomEvent('lr:update'));
        });
    }

    function openSavedDrawer() {
        const existing = document.getElementById('lr-saved-drawer-backdrop');
        if (existing) existing.remove();
        ensureStyles();
        const backdrop = document.createElement('div');
        backdrop.className = 'lr-drawer-backdrop';
        backdrop.id = 'lr-saved-drawer-backdrop';
        const memory = readMemory();
        const saved = readSaved().items || [];
        const stats = completionStats();
        const projectStates = Object.values(memory.projects || {});
        backdrop.innerHTML = `
            <div class="lr-drawer" role="dialog" aria-modal="true" aria-label="Saved learning path drawer">
              <div class="lr-drawer-header">
                <div>
                  <div class="lr-kicker">💾 Saved pathways</div>
                  <h2 style="margin:0">Everything the learner wanted to come back to</h2>
                  <p style="margin:.55rem 0 0;color:var(--text-secondary);line-height:1.75">Pinned lessons, active tracks, recent sessions, and shipped builds all live here so the platform feels persistent after the first visit.</p>
                </div>
                <button class="lr-close" data-lr-close>Close</button>
              </div>
              <div class="lr-drawer-grid">
                <div class="lr-stack">
                  <div class="lr-card">
                    <strong>Saved shelf</strong>
                    ${saved.length ? `<div class="lr-list">${saved.map((item) => `
                      <div class="lr-list-item">
                        <div class="lr-list-copy">
                          <strong>${escapeHtml(item.title)}</strong>
                          <span>${escapeHtml(item.subtitle || item.track || item.type)}</span>
                          <div class="lr-list-meta"><span class="lr-tag">${escapeHtml(item.type)}</span>${item.track ? `<span class="lr-tag">${escapeHtml(item.track)}</span>` : ''}</div>
                        </div>
                        <div class="lr-actions"><a class="lr-btn lr-btn-secondary" href="${escapeHtml(item.href)}">Open</a></div>
                      </div>`).join('')}</div>` : `<div class="lr-empty">Nothing is saved yet. Use the new page-level actions to pin a lesson, course, or project.</div>`}
                  </div>
                  <div class="lr-card">
                    <strong>Recent sessions</strong>
                    ${memory.recent.length ? `<div class="lr-list">${memory.recent.slice(0, 6).map((item) => `
                      <div class="lr-list-item">
                        <div class="lr-list-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.track || item.type)}</span></div>
                        <a class="lr-btn lr-btn-secondary" href="${escapeHtml(item.href)}">Resume</a>
                      </div>`).join('')}</div>` : `<div class="lr-empty">Recent sessions appear after the learner moves through real content.</div>`}
                  </div>
                </div>
                <div class="lr-stack">
                  <div class="lr-card">
                    <strong>Momentum snapshot</strong>
                    <div class="lr-stats" style="margin-top:.85rem">
                      <div class="lr-stat"><div class="value">${stats.done}</div><div class="label">Lessons complete</div></div>
                      <div class="lr-stat"><div class="value">${computeCompletionStreak()}</div><div class="label">Current streak</div></div>
                      <div class="lr-stat"><div class="value">${projectStates.filter((item) => item.complete).length}</div><div class="label">Projects marked shipped</div></div>
                    </div>
                    <p style="margin-top:.9rem">Progress memory now spans lessons, tracks, and projects instead of resetting every time the user changes pages.</p>
                  </div>
                  <div class="lr-card">
                    <strong>Active path</strong>
                    ${memory.activePath ? `<p>${escapeHtml(memory.activePath.title)}</p><div class="lr-actions"><a class="lr-btn lr-btn-primary" href="${escapeHtml(memory.activePath.nextHref || memory.activePath.href)}">Resume →</a></div>` : `<div class="lr-empty">No active path yet. Use “Build my path” or “Set active path” on any course or lesson page.</div>`}
                  </div>
                </div>
              </div>
            </div>`;
        document.body.appendChild(backdrop);
        function close() { backdrop.remove(); }
        backdrop.querySelectorAll('[data-lr-close]').forEach((btn) => btn.addEventListener('click', close));
        backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
    }

    function updateInlineActionState(wrapper) {
        const page = currentPageMeta();
        const saveBtn = wrapper.querySelector('[data-lr-save-toggle]');
        const activeBtn = wrapper.querySelector('[data-lr-set-active]');
        if (saveBtn) {
            const saved = isSaved(page.id);
            saveBtn.textContent = saved ? '✓ Saved' : 'Save this page';
        }
        if (activeBtn) {
            const memory = readMemory();
            const active = memory.activePath?.id === page.id;
            activeBtn.textContent = active ? '✓ Active path' : 'Set active path';
        }
        const projectBtn = wrapper.querySelector('[data-lr-project-complete]');
        if (projectBtn) {
            projectBtn.textContent = projectCompleteState() ? '✅ Build marked shipped' : 'Mark build shipped';
        }
    }

    function injectPageActions() {
        const page = currentPageMeta();
        if (!['lesson', 'project', 'course'].includes(page.type)) return;
        const targets = ['#ce-header', '.course-hero', '.hero-panel', '.lesson-header', '.lesson-container', '.modules-container'];
        const target = targets.map((selector) => document.querySelector(selector)).find(Boolean);
        if (!target) return;
        if (target.querySelector('.lr-inline-actions')) return;
        ensureStyles();
        const wrapper = document.createElement('div');
        wrapper.className = 'lr-inline-actions';
        wrapper.innerHTML = `
            <button class="lr-btn lr-btn-secondary" type="button" data-lr-save-toggle>Save this page</button>
            <button class="lr-btn lr-btn-secondary" type="button" data-lr-set-active>Set active path</button>
            ${page.type === 'project' ? '<button class="lr-btn lr-btn-ghost" type="button" data-lr-project-complete>Mark build shipped</button>' : ''}`;
        target.appendChild(wrapper);
        wrapper.querySelector('[data-lr-save-toggle]')?.addEventListener('click', () => {
            if (isSaved(page.id)) unsaveCurrentPage(); else saveCurrentPage();
            updateInlineActionState(wrapper);
            window.dispatchEvent(new CustomEvent('lr:update'));
        });
        wrapper.querySelector('[data-lr-set-active]')?.addEventListener('click', () => {
            setActiveFromCurrent();
            updateInlineActionState(wrapper);
            window.dispatchEvent(new CustomEvent('lr:update'));
        });
        wrapper.querySelector('[data-lr-project-complete]')?.addEventListener('click', () => {
            markProjectComplete();
            updateInlineActionState(wrapper);
            window.dispatchEvent(new CustomEvent('lr:update'));
        });
        updateInlineActionState(wrapper);
    }

    function attachCompletionHooks() {
        const markDone = document.getElementById('ce-mark-done');
        if (markDone && !markDone.dataset.lrBound) {
            markDone.dataset.lrBound = 'true';
            markDone.addEventListener('click', () => {
                const memory = readMemory();
                const page = currentPageMeta();
                const nextLink = getNextLinkFromPage();
                memory.lastCompletedLesson = { id: page.id, title: page.title, completedAt: Date.now() };
                if (nextLink) {
                    memory.activePath = {
                        id: page.id,
                        title: page.title,
                        href: page.href,
                        type: page.type,
                        nextHref: nextLink.href,
                        nextTitle: nextLink.title,
                        updatedAt: Date.now()
                    };
                }
                saveMemory(memory);
                window.dispatchEvent(new CustomEvent('lr:update'));
            });
        }
    }

    function shouldAutoShowOnboarding() {
        if (readProfile()) return false;
        if (sessionStorage.getItem('lr_onboarding_seen')) return false;
        return HUB_PAGES.includes(relativeSitePath());
    }

    function init() {
        ensureStyles();
        recordVisit();
        renderDock();
        renderHubPanels();
        injectPageActions();
        attachCompletionHooks();
        if (shouldAutoShowOnboarding()) {
            sessionStorage.setItem('lr_onboarding_seen', '1');
            setTimeout(() => openOnboardingModal(false), 700);
        }
    }

    return {
        init,
        renderHubPanels,
        renderDock,
        injectPageActions,
        attachCompletionHooks,
        openOnboardingModal,
        openSavedDrawer
    };
})();

window.LearningRetention = LearningRetention;
window.addEventListener('lr:update', () => {
    try {
        LearningRetention.renderHubPanels();
        LearningRetention.renderDock();
        LearningRetention.injectPageActions();
    } catch (err) {
        console.warn('[Retention] refresh failed', err);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    LearningRetention.init();
    setTimeout(() => {
        LearningRetention.injectPageActions();
        LearningRetention.attachCompletionHooks();
    }, 850);
});



/* === CURRICULUM DEPTH EXPANSION PASS === */
const CurriculumDepthExpansion = (() => {
    const TRACK_EXTRA = {
        foundations: ['pydantic-validation-ai', 'config-management-yaml', 'jsonl-parquet-datasets', 'cli-tools-for-ai', 'docker-basics-for-ai'],
        'ml-core': ['data-leakage-prevention', 'probability-calibration', 'uncertainty-estimation', 'learning-to-rank', 'feature-stores-ml-systems'],
        'deep-learning': ['backpropagation-from-scratch', 'activation-functions-initialization', 'residual-connections-layernorm', 'flash-attention-kv-cache', 'seq2seq-transformers'],
        'modern-ai': ['human-in-the-loop-agents', 'prompt-versioning-release-management', 'tool-routing-policy-engines', 'session-memory-compaction', 'eval-flywheel-release-gates']
    };

    const TRACK_PAGE_MAP = {
        'courses/foundations.html': 'foundations',
        'courses/ml-core.html': 'ml-core',
        'courses/deep-learning.html': 'deep-learning',
        'courses/modern-ai.html': 'modern-ai'
    };

    const HUB_CONTEXT = {
        'index.html': {
            title: 'Curriculum depth upgrade',
            copy: 'The roadmap now goes deeper across every major AI track. Use these new packs to move from surface familiarity into stronger engineering judgment.',
            items: ['pydantic-validation-ai', 'data-leakage-prevention', 'backpropagation-from-scratch', 'human-in-the-loop-agents']
        },
        'tutorials/index.html': {
            title: 'New depth lessons across the roadmap',
            copy: 'These new lessons strengthen the exact places learners usually outgrow the basics: validation, evaluation honesty, deep learning intuition, and safe agent systems.',
            items: ['config-management-yaml', 'probability-calibration', 'activation-functions-initialization', 'prompt-versioning-release-management']
        },
        'courses/index.html': {
            title: 'Fresh expansion packs for every core track',
            copy: 'Each core track now has new depth modules. Open the track pages or jump directly into one of the strongest new lessons below.',
            items: ['jsonl-parquet-datasets', 'uncertainty-estimation', 'residual-connections-layernorm', 'tool-routing-policy-engines']
        },
        'discover.html': {
            title: 'High-signal additions worth searching first',
            copy: 'Discovery is stronger when the catalog has better depth. These new additions are high-leverage starting points across foundations, ML systems, deep learning, and modern agent design.',
            items: ['docker-basics-for-ai', 'feature-stores-ml-systems', 'flash-attention-kv-cache', 'eval-flywheel-release-gates']
        },
        'debugging/index.html': {
            title: 'Study packs that make debugging easier',
            copy: 'A lot of bugs are really knowledge gaps. These new lessons strengthen validation, leakage detection, gradient intuition, and release gates so the debugging lab connects to deeper learning.',
            items: ['pydantic-validation-ai', 'data-leakage-prevention', 'backpropagation-from-scratch', 'eval-flywheel-release-gates']
        },
        'projects/index.html': {
            title: 'Build-support lessons for real projects',
            copy: 'The project layer is more useful when the supporting study path is obvious. These additions help with environments, ML system design, inference efficiency, and safe agent operations.',
            items: ['docker-basics-for-ai', 'feature-stores-ml-systems', 'flash-attention-kv-cache', 'human-in-the-loop-agents']
        },
        'tutorials/beginner.html': {
            title: 'Beginner depth picks',
            copy: 'Start adding operational discipline early: validation, config, dataset formats, and simple tooling make later AI work much easier.',
            items: ['pydantic-validation-ai', 'config-management-yaml', 'jsonl-parquet-datasets', 'cli-tools-for-ai']
        },
        'tutorials/intermediate.html': {
            title: 'Intermediate depth picks',
            copy: 'These additions tighten the bridge from working code to trustworthy systems.',
            items: ['docker-basics-for-ai', 'data-leakage-prevention', 'probability-calibration', 'backpropagation-from-scratch']
        },
        'tutorials/advanced.html': {
            title: 'Advanced depth picks',
            copy: 'These lessons go deeper on architecture, serving efficiency, and agent control surfaces.',
            items: ['uncertainty-estimation', 'residual-connections-layernorm', 'flash-attention-kv-cache', 'tool-routing-policy-engines']
        },
        'tutorials/expert.html': {
            title: 'Expert depth picks',
            copy: 'Use these lessons to strengthen production evaluation, release control, and human oversight at the system level.',
            items: ['learning-to-rank', 'seq2seq-transformers', 'session-memory-compaction', 'eval-flywheel-release-gates']
        }
    };

    let libraryPromise = null;

    function currentPath() {
        const raw = (window.location.pathname || '/').replace(/^\/+/, '');
        if (!raw) return 'index.html';
        if (raw.endsWith('/')) return `${raw.replace(/\/$/, '')}/index.html`;
        const parts = raw.split('/');
        const last = parts[parts.length - 1];
        if (!last.includes('.')) return `${raw}/index.html`;
        return raw;
    }

    function rel(path) {
        return `${getRootPrefix()}${path}`;
    }

    function lessonHref(id) {
        return `${rel('learn/lesson.html')}?id=${encodeURIComponent(id)}&type=lesson`;
    }

    function courseHref(trackId) {
        return rel(`courses/${trackId}.html`);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function ensureStyles() {
        if (document.getElementById('curriculum-depth-style')) return;
        const style = document.createElement('style');
        style.id = 'curriculum-depth-style';
        style.textContent = `
        .depth-pass-wrap{padding:0 var(--space-xl) var(--space-4xl)}
        .depth-pass-container{max-width:1200px;margin:0 auto}
        .depth-pass-section{margin-top:var(--space-3xl);background:linear-gradient(135deg,rgba(0,255,170,.045),rgba(123,92,255,.05));border:1px solid rgba(255,255,255,.08);border-radius:var(--radius-xl);padding:var(--space-2xl);box-shadow:0 18px 50px rgba(0,0,0,.18)}
        .depth-pass-kicker{display:inline-flex;align-items:center;gap:.55rem;padding:.45rem .95rem;border-radius:999px;background:rgba(0,255,170,.09);border:1px solid rgba(0,255,170,.18);font-family:var(--font-mono);font-size:.76rem;color:var(--accent-primary);margin-bottom:var(--space-md)}
        .depth-pass-head{display:flex;justify-content:space-between;gap:var(--space-lg);align-items:flex-end;flex-wrap:wrap;margin-bottom:var(--space-xl)}
        .depth-pass-head h2{font-family:var(--font-heading);font-size:1.75rem;margin:0 0 .45rem}
        .depth-pass-head p{margin:0;max-width:780px;color:var(--text-secondary);line-height:1.75}
        .depth-pass-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-lg)}
        .depth-pass-grid.depth-track-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .depth-pass-card{display:flex;flex-direction:column;gap:.9rem;background:rgba(8,13,22,.76);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius-lg);padding:var(--space-xl);text-decoration:none;color:inherit;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
        .depth-pass-card:hover{transform:translateY(-3px);border-color:rgba(0,255,170,.26);box-shadow:0 18px 40px rgba(0,0,0,.22)}
        .depth-pass-meta{display:flex;justify-content:space-between;gap:.65rem;align-items:center;flex-wrap:wrap;color:var(--text-muted);font-size:.75rem;font-family:var(--font-mono)}
        .depth-pass-track{display:inline-flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.05);padding:.25rem .55rem;border-radius:999px}
        .depth-pass-card h3{margin:0;font-family:var(--font-heading);font-size:1.08rem;line-height:1.35;color:var(--text-primary)}
        .depth-pass-card p{margin:0;color:var(--text-secondary);font-size:.92rem;line-height:1.75}
        .depth-pass-tags{display:flex;flex-wrap:wrap;gap:.45rem}
        .depth-pass-tag{display:inline-flex;align-items:center;padding:.24rem .55rem;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);font-size:.72rem;color:var(--text-muted);font-family:var(--font-mono)}
        .depth-pass-cta{margin-top:auto;color:var(--accent-primary);font-weight:700;font-size:.85rem}
        .depth-pass-actions{display:flex;gap:.8rem;flex-wrap:wrap}
        .depth-pass-stats{display:flex;gap:var(--space-lg);flex-wrap:wrap}
        .depth-pass-stat{min-width:120px;padding:.85rem 1rem;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
        .depth-pass-stat-value{font-family:var(--font-heading);font-size:1.5rem;color:var(--accent-primary)}
        .depth-pass-stat-label{font-size:.76rem;color:var(--text-muted);font-family:var(--font-mono)}
        @media (max-width: 1100px){.depth-pass-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width: 780px){.depth-pass-wrap{padding:0 var(--space-md) var(--space-3xl)}.depth-pass-grid,.depth-pass-grid.depth-track-grid{grid-template-columns:1fr}.depth-pass-section{padding:var(--space-xl)}}
        `;
        document.head.appendChild(style);
    }

    async function loadLibrary() {
        if (!libraryPromise) {
            libraryPromise = fetch(rel('assets/data/MasterLibrary.json')).then((response) => {
                if (!response.ok) throw new Error(`Failed to load MasterLibrary.json: ${response.status}`);
                return response.json();
            });
        }
        return libraryPromise;
    }

    function findLesson(library, id) {
        for (const track of library.tracks || []) {
            const lesson = (track.lessons || []).find((item) => item.id === id);
            if (lesson) {
                return { ...lesson, trackId: track.id, trackTitle: track.title, trackTier: track.tier, trackIcon: track.icon };
            }
        }
        return null;
    }

    function buildCard(item) {
        return `
        <a class="depth-pass-card reveal" href="${lessonHref(item.id)}">
            <div class="depth-pass-meta">
                <span class="depth-pass-track">${escapeHtml(item.trackIcon || '📘')} ${escapeHtml(item.trackTitle || 'Track')}</span>
                <span>${escapeHtml(item.duration || '30 min')}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.desc)}</p>
            <div class="depth-pass-tags">
                <span class="depth-pass-tag">${escapeHtml(item.badge || 'Lesson')}</span>
                <span class="depth-pass-tag">Track ${escapeHtml(item.trackTier || '')}</span>
            </div>
            <div class="depth-pass-cta">Open lesson →</div>
        </a>`;
    }

    function appendSection(target, html) {
        if (!target || document.querySelector('[data-depth-pass-mounted="true"]')) return;
        const wrap = document.createElement('section');
        wrap.className = 'depth-pass-wrap';
        wrap.dataset.depthPassMounted = 'true';
        wrap.innerHTML = `<div class="depth-pass-container">${html}</div>`;
        target.parentNode.insertBefore(wrap, target);
    }

    function buildHubSection(context, lessons) {
        return `
        <div class="depth-pass-section">
            <div class="depth-pass-kicker">🚀 Depth expansion</div>
            <div class="depth-pass-head">
                <div>
                    <h2>${escapeHtml(context.title)}</h2>
                    <p>${escapeHtml(context.copy)}</p>
                </div>
                <div class="depth-pass-actions">
                    <a class="btn btn-outline" href="${courseHref('foundations')}">Open core roadmap →</a>
                </div>
            </div>
            <div class="depth-pass-grid">${lessons.map(buildCard).join('')}</div>
        </div>`;
    }

    function buildTrackSection(track, lessons) {
        return `
        <div class="depth-pass-section">
            <div class="depth-pass-kicker">📈 New depth modules</div>
            <div class="depth-pass-head">
                <div>
                    <h2>${escapeHtml(track.title)} just got deeper</h2>
                    <p>These new lessons were appended to strengthen the track without rewriting the locked lessons you already had. Use them to go further on the topics that usually decide whether code stays toy-level or becomes production-ready.</p>
                </div>
                <div class="depth-pass-stats">
                    <div class="depth-pass-stat"><div class="depth-pass-stat-value">${track.lessons.length}</div><div class="depth-pass-stat-label">Track lessons</div></div>
                    <div class="depth-pass-stat"><div class="depth-pass-stat-value">${lessons.length}</div><div class="depth-pass-stat-label">New modules</div></div>
                </div>
            </div>
            <div class="depth-pass-grid depth-track-grid">${lessons.map(buildCard).join('')}</div>
        </div>`;
    }

    function updateTrackCounts(library) {
        const tierCounts = new Map((library.tracks || []).map((track) => [track.tier, (track.lessons || []).length]));
        document.querySelectorAll('[data-stat="tier-1"]').forEach((el) => el.textContent = tierCounts.get(1) || el.textContent);
        document.querySelectorAll('[data-stat="tier-2"]').forEach((el) => el.textContent = tierCounts.get(2) || el.textContent);
        document.querySelectorAll('[data-stat="tier-3"]').forEach((el) => el.textContent = tierCounts.get(3) || el.textContent);
        document.querySelectorAll('[data-stat="tier-4"]').forEach((el) => el.textContent = tierCounts.get(4) || el.textContent);

        const current = currentPath();
        if (current === 'courses/index.html') {
            const lookup = {
                foundations: 1,
                'ml-core': 2,
                'deep-learning': 3,
                'modern-ai': 4
            };
            Object.entries(lookup).forEach(([trackId, tier]) => {
                const card = document.querySelector(`a[href="${trackId}.html"] .course-stat-value`);
                if (card) card.textContent = String(tierCounts.get(tier) || card.textContent);
            });
        }

        const trackId = TRACK_PAGE_MAP[current];
        if (trackId) {
            const track = (library.tracks || []).find((item) => item.id === trackId);
            if (track) {
                const countEl = document.querySelector('.stats-grid .stat-card:first-child .stat-value');
                if (countEl) countEl.textContent = String(track.lessons.length);
            }
        }
    }

    async function render() {
        ensureStyles();
        const library = await loadLibrary();
        updateTrackCounts(library);
        const footer = document.querySelector('footer');
        const current = currentPath();

        const hubConfig = HUB_CONTEXT[current];
        if (hubConfig && footer) {
            const lessons = hubConfig.items.map((id) => findLesson(library, id)).filter(Boolean);
            if (lessons.length) appendSection(footer, buildHubSection(hubConfig, lessons));
        }

        const trackId = TRACK_PAGE_MAP[current];
        if (trackId) {
            const track = (library.tracks || []).find((item) => item.id === trackId);
            if (track) {
                const lessons = (TRACK_EXTRA[trackId] || []).map((id) => findLesson(library, id)).filter(Boolean);
                const footerEl = document.querySelector('footer');
                if (footerEl && lessons.length) appendSection(footerEl, buildTrackSection(track, lessons));
            }
        }
    }

    return { init: () => render().catch((error) => console.warn('[CurriculumDepthExpansion]', error)) };
})();

document.addEventListener('DOMContentLoaded', () => {
    CurriculumDepthExpansion.init();
});
