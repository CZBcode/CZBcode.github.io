/* ============================
   Anthony's Home - Scripts
   ============================ */

// Mobile menu toggle
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
  // Close on link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Active nav link based on current page
function initActiveNav() {
  const path = location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/index.html';
    if (href === path || (href === '/index.html' && (path === '/' || path === ''))) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// Intersection Observer for fade-in animations
function initAnimations() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

// Typing cursor effect for hero
function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
}

// GitHub API - fetch user repos for projects section
async function loadGitHubProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  // Show loading state
  container.innerHTML = Array(3).fill(`
    <div class="project-card" style="opacity:0.5">
      <div class="project-top">
        <div class="project-icon" style="background:var(--bg-card)"></div>
        <div class="project-stars"><span>--</span></div>
      </div>
      <div class="project-name" style="background:var(--bg-card);height:16px;border-radius:4px;margin-bottom:8px"></div>
      <div class="project-desc" style="background:var(--bg-card);height:40px;border-radius:4px"></div>
      <div class="project-footer">
        <span class="project-lang" style="background:var(--bg-card);padding:0.2rem 0.5rem;border-radius:3px">---</span>
        <span class="project-link">View →</span>
      </div>
    </div>
  `).join('');

  try {
    const resp = await fetch('https://api.github.com/users/CZBcode/repos?sort=updated&per_page=6&type=public');
    if (!resp.ok) throw new Error('API error: ' + resp.status);
    const repos = await resp.json();
    renderProjects(repos);
  } catch (e) {
    // Fallback: show placeholder cards
    container.innerHTML = renderPlaceholderProjects();
  }
}

function renderProjects(repos) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const html = repos.map(repo => {
    const langColors = {
      Java: '#b07219', Python: '#3572A5', JavaScript: '#f1e05a',
      TypeScript: '#3178c6', Go: '#00ADD8', Rust: '#dea584',
      CSS: '#563d7c', HTML: '#e34c26', Shell: '#89e051',
      Kotlin: '#A97BFF', Scala: '#c22d40', C: '#555555',
      'C++': '#f34b7d', 'C#': '#178600', Ruby: '#701516',
      Swift: '#F05138', PHP: '#4F5D95', Vue: '#41b883',
      Dart: '#00B4AB', Rust: '#dea584'
    };

    const lang = repo.language || 'Code';
    const langColor = langColors[lang] || '#888';

    return `
      <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener">
        <div class="project-top">
          <div class="project-icon">📦</div>
          <div class="project-stars">
            <span class="star">★</span>
            <span>${repo.stargazers_count || 0}</span>
          </div>
        </div>
        <div class="project-name">${escapeHtml(repo.name)}</div>
        <div class="project-desc">${escapeHtml(repo.description || 'No description available')}</div>
        <div class="project-footer">
          <span class="project-lang">
            <span style="display:inline-block;width:10px;height:10px;background:${langColor};border-radius:50%;margin-right:5px;vertical-align:middle"></span>
            ${escapeHtml(lang)}
          </span>
          <span class="project-link">View →</span>
        </div>
      </a>
    `;
  }).join('');

  container.innerHTML = html;
}

function renderPlaceholderProjects() {
  return `
    <div class="project-card">
      <div class="project-top">
        <div class="project-icon">🔧</div>
        <div class="project-stars"><span class="star">★</span><span>0</span></div>
      </div>
      <div class="project-name">CZBcode.github.io</div>
      <div class="project-desc">Personal homepage built with pure HTML/CSS — fast, minimal, no dependencies.</div>
      <div class="project-footer">
        <span class="project-lang"><span style="display:inline-block;width:10px;height:10px;background:#563d7c;border-radius:50%;margin-right:5px"></span>CSS</span>
        <span class="project-link" href="#">View →</span>
      </div>
    </div>
    <div class="project-card">
      <div class="project-top">
        <div class="project-icon">🤖</div>
        <div class="project-stars"><span class="star">★</span><span>0</span></div>
      </div>
      <div class="project-name">ai-agent</div>
      <div class="project-desc">AI agent project powered by LangChain & Spring Boot.</div>
      <div class="project-footer">
        <span class="project-lang"><span style="display:inline-block;width:10px;height:10px;background:#b07219;border-radius:50%;margin-right:5px"></span>Java</span>
        <span class="project-link" href="#">View →</span>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initActiveNav();
  initAnimations();
  loadGitHubProjects();
});
