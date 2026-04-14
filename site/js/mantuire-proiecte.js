var docsObserver = null;
var isSyncingHash = false;

function parseHash() {
  var raw = window.location.hash.replace('#', '');
  if (!raw) return { page: '', doc: '' };
  var parts = raw.split(':');
  return { page: parts[0] || '', doc: parts[1] || '' };
}

function setHash(page, doc) {
  var next = doc ? page + ':' + doc : page;
  isSyncingHash = true;
  window.location.hash = next;
  setTimeout(function() { isSyncingHash = false; }, 0);
}

function go(page, section) {
  nav(page, section || '', true);
  return false;
}

function setMobileMenu(open) {
  var navEl = document.querySelector('nav');
  var toggle = document.getElementById('nav-toggle');
  if (!navEl || !toggle) return;
  navEl.classList.toggle('mobile-open', !!open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Închide meniul principal' : 'Deschide meniul principal');
}

// ─── PAGE ROUTING ───
function nav(page, docId, updateHash) {
  if (typeof updateHash === 'undefined') updateHash = true;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  var el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(function(a) {
    a.classList.toggle('active', a.dataset.page === page);
  });
  setMobileMenu(false);
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (updateHash) setHash(page, docId);
  if (page === 'documentatie') {
    if (docId) {
      scrollDoc(docId, null, false);
    } else {
      setupDocsObserver();
    }
  } else if (docId) {
    var sectionTarget = document.getElementById('sec-' + page + '-' + docId);
    if (sectionTarget) {
      sectionTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// ─── HASH ROUTING ON LOAD ───
(function() {
  var parsed = parseHash();
  if (parsed.page && document.getElementById('page-' + parsed.page)) {
    nav(parsed.page, parsed.doc, false);
  } else {
    nav('acasa', '', false);
    setHash('acasa', '');
  }
})();

// ─── FAQ TOGGLE ───
function toggleFaq(el) {
  el.closest('.faq-item').classList.toggle('open');
}

// ─── DOCS SIDEBAR ACTIVE LINK ───
function setActiveDocLink(id) {
  document.querySelectorAll('.docs-link').forEach(function(l) { l.classList.remove('active'); });
  var active = document.querySelector('.docs-link[data-doc="' + id + '"]');
  if (active) active.classList.add('active');
}

function scrollDoc(id, linkEl, pushHash) {
  if (typeof pushHash === 'undefined') pushHash = true;
  setActiveDocLink(id);
  var target = document.getElementById('doc-' + id);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (pushHash) setHash('documentatie', id);
  setupDocsObserver();
  return false;
}

function setupDocsObserver() {
  if (docsObserver) return;
  var sections = document.querySelectorAll('.doc-section');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  docsObserver = new IntersectionObserver(function(entries) {
    var currentPage = document.querySelector('.page.active');
    if (!currentPage || currentPage.id !== 'page-documentatie') return;
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id.replace('doc-', '');
      setActiveDocLink(id);
      if (!isSyncingHash) {
        history.replaceState(null, '', '#documentatie:' + id);
      }
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: 0.2 });
  sections.forEach(function(section) {
    docsObserver.observe(section);
    var h2 = section.querySelector('h2');
    if (h2 && !h2.querySelector('.doc-permalink')) {
      h2.classList.add('doc-h2');
      var sid = section.id.replace('doc-', '');
      var a = document.createElement('a');
      a.className = 'doc-permalink';
      a.href = '#documentatie:' + sid;
      a.setAttribute('aria-label', 'Permalink către această secțiune');
      a.textContent = '#';
      a.onclick = function(e) {
        e.preventDefault();
        scrollDoc(sid, null, true);
      };
      h2.appendChild(a);
    }
  });
}

var navToggleEl = document.getElementById('nav-toggle');
if (navToggleEl) {
  navToggleEl.addEventListener('click', function() {
    var expanded = this.getAttribute('aria-expanded') === 'true';
    setMobileMenu(!expanded);
  });
}

document.addEventListener('click', function(e) {
  var navEl = document.querySelector('nav');
  if (!navEl || !navEl.classList.contains('mobile-open')) return;
  if (!navEl.contains(e.target)) setMobileMenu(false);
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') setMobileMenu(false);
});

window.addEventListener('resize', function() {
  if (window.innerWidth > 1080) setMobileMenu(false);
});

// ─── HIGHLIGHT ACTIVE NAV LINK ON HASH CHANGE ───
window.addEventListener('hashchange', function() {
  if (isSyncingHash) return;
  var parsed = parseHash();
  if (parsed.page && document.getElementById('page-' + parsed.page)) {
    nav(parsed.page, parsed.doc, false);
  }
});