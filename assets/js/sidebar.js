/**
 * Sidebar Engine for AI Coding Academy
 * Group lessons by Tier and render nested accordion
 */
async function initSidebar() {
    const sidebarContainer = document.getElementById('ce-sidebar-nav');
    if (!sidebarContainer) return;

    try {
        const response = await fetch('../assets/data/master_library.json');
        const data = await response.json();
        const lessons = data.lessons;

        // 1. Group lessons by Tier
        const TIER_LABELS = {
            "foundations": "Level 1: Foundations",
            "machine_learning": "Level 2: Core ML",
            "deep_learning": "Level 3: Deep Engine",
            "modern_ai": "Level 4: Modern Expert"
        };

        const grouped = {};
        Object.keys(TIER_LABELS).forEach(tier => grouped[tier] = []);
        
        Object.entries(lessons).forEach(([id, info]) => {
            if (grouped[info.tier]) {
                grouped[info.tier].push({ id, ...info });
            }
        });

        // 2. Build HTML
        let html = '';
        Object.entries(TIER_LABELS).forEach(([tierKey, label]) => {
            const tierLessons = grouped[tierKey];
            html += `
                <div class="sidebar-tier">
                    <button class="tier-trigger" onclick="this.parentElement.classList.toggle('active')">
                        <span class="tier-icon">▹</span>
                        <span class="tier-title">${label}</span>
                        <span class="tier-count">${tierLessons.length}</span>
                    </button>
                    <div class="tier-content">
                        ${tierLessons.map(l => `
                            <a href="${l.url}" class="sidebar-item ${window.location.search.includes(l.id) ? 'active' : ''}">
                                <span class="item-id">${l.id.split('-')[0]}</span>
                                <span class="item-title">${l.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        sidebarContainer.innerHTML = html;

    } catch (err) {
        console.error("Sidebar Load Error:", err);
    }
}

document.addEventListener('DOMContentLoaded', initSidebar);