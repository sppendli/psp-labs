// ── SCROLL TO TOP ON LOAD ──
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname);
window.scrollTo(0, 0);

// ── NAV: active link on scroll ──
const sections = [
  { id: 'problem',    link: document.querySelector('.top-nav-link[href="#problem"]') },
  { id: 'engagement', link: document.querySelector('.top-nav-link[href="#engagement"]') },
  { id: 'outcome',    link: document.querySelector('.top-nav-link[href="#outcome"]') },
  { id: 'contact',    link: document.querySelector('.top-nav-link[href="#contact"]') },
];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const match = sections.find(s => s.id === entry.target.id);
    if (!match) return;
    if (entry.isIntersecting) {
      document.querySelectorAll('.top-nav-link').forEach(a => a.classList.remove('active'));
      match.link && match.link.classList.add('active');
    }
  });
}, {
  rootMargin: '-20% 0px -70% 0px',
  threshold: 0,
});

sections.forEach(({ id }) => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

// ── ARTICLE MODAL ──
const modal         = document.getElementById('article-modal');
const modalMeta     = document.getElementById('modal-meta');
const modalBody     = document.getElementById('modal-body');
const modalClose    = modal.querySelector('.modal-close');
const modalProgress = document.getElementById('modal-progress');
const mdCache       = {};

function parseMd(text) {
  const lines = text.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (/^# /.test(line)) {
      html += `<h1>${esc(line.slice(2))}</h1>`;
      i++; continue;
    }
    // H2
    if (/^## /.test(line)) {
      html += `<h2>${esc(line.slice(3))}</h2>`;
      i++; continue;
    }
    // HR
    if (/^---+$/.test(line.trim())) {
      html += '<hr>';
      i++; continue;
    }
    // Blank line
    if (line.trim() === '') {
      i++; continue;
    }
    // Blockquote
    if (/^> /.test(line)) {
      html += `<blockquote>${inline(line.slice(2))}</blockquote>`;
      i++; continue;
    }
    // Bullet list — collect consecutive items
    if (/^[-*] /.test(line)) {
      html += '<ul>';
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        html += `<li>${inline(lines[i].slice(2))}</li>`;
        i++;
      }
      html += '</ul>';
      continue;
    }
    // Paragraph — collect until blank or block element
    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,2} |---|[-*] |> )/.test(lines[i])) {
      para += (para ? '<br>' : '') + inline(lines[i]);
      i++;
    }
    if (para) html += `<p>${para}</p>`;
  }
  return html;
}

function inline(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateProgress() {
  const scrollHeight = modal.scrollHeight - modal.clientHeight;
  const pct = scrollHeight > 0 ? (modal.scrollTop / scrollHeight) * 100 : 0;
  modalProgress.style.width = pct + '%';
}

function appendArticleFooter() {
  modalBody.insertAdjacentHTML('beforeend',
    '<div class="modal-endmark">&#9632;</div>' +
    '<div class="modal-author-footer">Sai Pratik Pendli&nbsp;&nbsp;&middot;&nbsp;&nbsp;PSP Labs</div>'
  );
}

function openModal(src, meta, date) {
  modalBody.innerHTML = '<p style="color:var(--muted);font-family:\'DM Mono\',monospace;font-size:12px;">Loading…</p>';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalProgress.style.width = '0%';
  modal.addEventListener('scroll', updateProgress);

  if (mdCache[src]) {
    const { html, metaStr } = mdCache[src];
    modalMeta.textContent = metaStr;
    modalBody.innerHTML = html;
    appendArticleFooter();
    return;
  }

  fetch(src)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(text => {
      const wordCount = text.trim().split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);
      const parts = [meta, date, `~${readTime} min read`].filter(Boolean);
      const metaStr = parts.join('  ·  ');
      modalMeta.textContent = metaStr;

      const html = parseMd(text);
      mdCache[src] = { html, metaStr };
      modalBody.innerHTML = html;
      appendArticleFooter();
    })
    .catch(() => {
      modalMeta.textContent = meta || '';
      modalBody.innerHTML = '<p>Could not load article.</p>';
    });
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modal.removeEventListener('scroll', updateProgress);
  modalProgress.style.width = '0%';
}

// Trigger links
document.querySelectorAll('[data-modal]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openModal(link.dataset.src, link.dataset.meta, link.dataset.date);
  });
});

// Close button
modalClose.addEventListener('click', closeModal);

// Click outside modal box
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
