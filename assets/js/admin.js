(function () {
  'use strict';

  function getDefaults() {
    return window.SITE_DEFAULTS || {
      siteKey: 'beauty_fallback',
      admin: { user: 'admin', pass: 'admin123' },
      business: {}, colors: {}, hero: {}, about: {}, services: [], gallery: [], testimonials: [], seo: {}, social: {}
    };
  }

  let cfg;
  try {
    cfg = (typeof Storage !== 'undefined' && Storage.load) ? Storage.load() : structuredClone(getDefaults());
  } catch (e) {
    cfg = structuredClone(getDefaults());
  }

  // Always ensure admin credentials exist
  if (!cfg.admin || !cfg.admin.user || !cfg.admin.pass) {
    cfg.admin = { user: 'admin', pass: 'admin123' };
  }

  const SESSION_KEY = (cfg.siteKey || 'beauty') + '_admin_session';
  const HARD_USER = 'admin';
  const HARD_PASS = 'admin123';

  function isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function doLogin(user, pass) {
    const u = (user || '').trim();
    const p = pass || '';
    const ok =
      (u === HARD_USER && p === HARD_PASS) ||
      (cfg.admin && u === cfg.admin.user && p === cfg.admin.pass);
    if (ok) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      return true;
    }
    return false;
  }

  function doLogout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.reload();
  }

  function showDashboard() {
    const login = document.getElementById('login-screen');
    const dash = document.getElementById('dashboard');
    if (login) {
      login.style.display = 'none';
      login.hidden = true;
    }
    if (dash) {
      dash.hidden = false;
      dash.style.display = 'flex'; dash.classList.add('is-open');
    }
    try { initDashboard(); } catch (err) { console.error('Dashboard init error', err); }
  }

  function showLogin() {
    const login = document.getElementById('login-screen');
    const dash = document.getElementById('dashboard');
    if (dash) {
      dash.hidden = true;
      dash.style.display = 'none'; dash.classList.remove('is-open');
    }
    if (login) {
      login.hidden = false;
      login.style.display = 'flex';
    }
  }

  // Boot
  function boot() {
    if (isLoggedIn()) {
      showDashboard();
    } else {
      showLogin();
    }

    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const uEl = document.getElementById('login-user');
        const pEl = document.getElementById('login-pass');
        const u = uEl ? uEl.value : '';
        const p = pEl ? pEl.value : '';
        if (doLogin(u, p)) {
          showDashboard();
        } else {
          const err = document.getElementById('login-error');
          if (err) {
            err.textContent = 'Kullanici adi veya sifre hatali.';
            err.hidden = false;
            err.style.display = 'block';
          } else {
            alert('Kullanici adi veya sifre hatali.');
          }
        }
      });
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ---- Dashboard helpers ----
  function initDashboard() {
    bindTabs();
    fillFields();
    renderServices();
    renderGallery();
    renderTestimonials();
    bindActions();
    updateColorPreview();
  }

  function bindTabs() {
    document.querySelectorAll('.sidebar-nav button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-nav button').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var tab = btn.getAttribute('data-tab');
        var panel = document.querySelector('[data-panel="' + tab + '"]');
        if (panel) panel.classList.add('active');
        var title = document.getElementById('tab-title');
        if (title) title.textContent = btn.textContent;
      });
    });
  }

  function getByPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, obj);
  }
  function setByPath(obj, path, value) {
    var keys = path.split('.');
    var cur = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function fillFields() {
    document.querySelectorAll('[data-path]').forEach(function (el) {
      var val = getByPath(cfg, el.getAttribute('data-path'));
      if (val === undefined || val === null) return;
      if (el.type === 'color') el.value = val;
      else el.value = val;
    });
    var featEl = document.getElementById('about-features-text');
    if (featEl && cfg.about && cfg.about.features) featEl.value = cfg.about.features.join('\n');
    if (cfg.business && cfg.business.logoImage) {
      var lp = document.getElementById('logo-preview');
      if (lp) lp.innerHTML = '<img src="' + cfg.business.logoImage + '" alt="logo">';
    }
  }

  function collectFields() {
    document.querySelectorAll('[data-path]').forEach(function (el) {
      setByPath(cfg, el.getAttribute('data-path'), el.value);
    });
    var featEl = document.getElementById('about-features-text');
    if (featEl) {
      if (!cfg.about) cfg.about = {};
      cfg.about.features = featEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    }
  }

  function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function renderServices() {
    var list = document.getElementById('services-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.services || []).forEach(function (s, i) {
      var div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML =
        '<div class="row">' +
        '<div class="field"><label>Ikon (CSS class veya metin)</label><input type="text" value="' + escapeAttr(s.icon) + '" data-si="' + i + '" data-field="icon"></div>' +
        '<div class="field"><label>Baslik</label><input type="text" value="' + escapeAttr(s.title) + '" data-si="' + i + '" data-field="title"></div>' +
        '<div class="field full"><label>Aciklama</label><input type="text" value="' + escapeAttr(s.desc) + '" data-si="' + i + '" data-field="desc"></div>' +
        '<div class="field"><label>Fiyat</label><input type="text" value="' + escapeAttr(s.price) + '" data-si="' + i + '" data-field="price"></div>' +
        '<div class="field"><label>Sure</label><input type="text" value="' + escapeAttr(s.duration) + '" data-si="' + i + '" data-field="duration"></div>' +
        '</div>' +
        '<div class="actions">' +
        '<label><input type="checkbox" data-si="' + i + '" data-field="visible" ' + (s.visible !== false ? 'checked' : '') + '> Gorunur</label>' +
        '<button type="button" class="danger" data-remove-service="' + i + '">Sil</button>' +
        '</div>';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(function (el) {
      el.addEventListener('change', function () {
        var i = +el.getAttribute('data-si');
        var f = el.getAttribute('data-field');
        if (f === 'visible') cfg.services[i].visible = el.checked;
        else cfg.services[i][f] = el.value;
      });
    });
    list.querySelectorAll('[data-remove-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cfg.services.splice(+btn.getAttribute('data-remove-service'), 1);
        renderServices();
      });
    });
  }

  function renderGallery() {
    var list = document.getElementById('gallery-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.gallery || []).forEach(function (g, i) {
      var div = document.createElement('div');
      div.className = 'gallery-item-admin';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.innerHTML =
        '<img class="gallery-thumb" src="' + escapeAttr(g.url) + '" alt="">' +
        '<input type="text" value="' + escapeAttr(g.alt) + '" data-gi="' + i + '" placeholder="Alt text" style="margin:0 .5rem;flex:1">' +
        '<div class="actions"><button type="button" class="danger" data-remove-gallery="' + i + '">Sil</button></div>';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-gi]').forEach(function (el) {
      el.addEventListener('change', function () { cfg.gallery[+el.getAttribute('data-gi')].alt = el.value; });
    });
    list.querySelectorAll('[data-remove-gallery]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cfg.gallery.splice(+btn.getAttribute('data-remove-gallery'), 1);
        renderGallery();
      });
    });
  }

  function renderTestimonials() {
    var list = document.getElementById('testi-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.testimonials || []).forEach(function (t, i) {
      var div = document.createElement('div');
      div.className = 'testi-item';
      div.innerHTML =
        '<div class="row">' +
        '<div class="field full"><label>Yorum</label><input type="text" value="' + escapeAttr(t.text) + '" data-ti="' + i + '" data-field="text"></div>' +
        '<div class="field"><label>Isim</label><input type="text" value="' + escapeAttr(t.name) + '" data-ti="' + i + '" data-field="name"></div>' +
        '<div class="field"><label>Puan (1-5)</label><input type="number" min="1" max="5" value="' + (t.rating || 5) + '" data-ti="' + i + '" data-field="rating"></div>' +
        '</div>' +
        '<div class="actions"><button type="button" class="danger" data-remove-testi="' + i + '">Sil</button></div>';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(function (el) {
      el.addEventListener('change', function () {
        var i = +el.getAttribute('data-ti');
        var f = el.getAttribute('data-field');
        cfg.testimonials[i][f] = f === 'rating' ? +el.value : el.value;
      });
    });
    list.querySelectorAll('[data-remove-testi]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cfg.testimonials.splice(+btn.getAttribute('data-remove-testi'), 1);
        renderTestimonials();
      });
    });
  }

  function updateColorPreview() {
    var card = document.querySelector('.preview-card');
    if (!card) return;
    var p = (document.querySelector('[data-path="colors.primary"]') || {}).value || (cfg.colors && cfg.colors.primary) || '#C9A87C';
    var bg = (document.querySelector('[data-path="colors.bg"]') || {}).value || (cfg.colors && cfg.colors.bg) || '#FDFBF8';
    var text = (document.querySelector('[data-path="colors.text"]') || {}).value || (cfg.colors && cfg.colors.text) || '#2c2c2c';
    var textL = (document.querySelector('[data-path="colors.textLight"]') || {}).value || (cfg.colors && cfg.colors.textLight) || '#6b6b6b';
    card.style.setProperty('--preview-primary', p);
    card.style.setProperty('--preview-bg', bg);
    card.style.setProperty('--preview-text', text);
    card.style.setProperty('--preview-text-light', textL);
  }

  function bindActions() {
    var saveBtn = document.getElementById('btn-save');
    if (saveBtn) saveBtn.addEventListener('click', function () {
      collectFields();
      if (!cfg.admin) cfg.admin = { user: HARD_USER, pass: HARD_PASS };
      if (typeof Storage !== 'undefined' && Storage.save && Storage.save(cfg)) {
        var toast = document.getElementById('save-toast');
        if (toast) { toast.hidden = false; toast.style.display = 'block'; setTimeout(function () { toast.hidden = true; toast.style.display = 'none'; }, 2000); }
        else alert('Kaydedildi');
      }
    });

    var resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (!confirm('Tum ayarlar varsayilana donecek. Emin misiniz?')) return;
      cfg = (typeof Storage !== 'undefined' && Storage.reset) ? Storage.reset() : structuredClone(getDefaults());
      if (!cfg.admin) cfg.admin = { user: HARD_USER, pass: HARD_PASS };
      fillFields(); renderServices(); renderGallery(); renderTestimonials(); updateColorPreview();
      alert('Varsayilana sifirlandi.');
    });

    var addSvc = document.getElementById('add-service');
    if (addSvc) addSvc.addEventListener('click', function () {
      if (!cfg.services) cfg.services = [];
      cfg.services.push({ id: 's' + Date.now(), icon: '', title: 'Yeni Hizmet', desc: '', price: '', duration: '', visible: true });
      renderServices();
    });

    var addGal = document.getElementById('add-gallery');
    if (addGal) addGal.addEventListener('click', function () {
      var urlEl = document.getElementById('new-gallery-url');
      var url = urlEl ? urlEl.value.trim() : '';
      if (!url) return;
      if (!cfg.gallery) cfg.gallery = [];
      cfg.gallery.push({ id: 'g' + Date.now(), url: url, alt: '' });
      if (urlEl) urlEl.value = '';
      renderGallery();
    });

    var addTesti = document.getElementById('add-testi');
    if (addTesti) addTesti.addEventListener('click', function () {
      if (!cfg.testimonials) cfg.testimonials = [];
      cfg.testimonials.push({ id: 't' + Date.now(), text: '', name: '', rating: 5 });
      renderTestimonials();
    });

    var exp = document.getElementById('btn-export');
    if (exp) exp.addEventListener('click', function () {
      collectFields();
      if (typeof Storage !== 'undefined' && Storage.exportJSON) Storage.exportJSON(cfg);
    });

    var imp = document.getElementById('import-file');
    if (imp) imp.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file || !Storage.importJSON) return;
      Storage.importJSON(file).then(function (data) {
        cfg = data;
        if (!cfg.admin) cfg.admin = { user: HARD_USER, pass: HARD_PASS };
        Storage.save(cfg);
        fillFields(); renderServices(); renderGallery(); renderTestimonials(); updateColorPreview();
        alert('Ice aktarma basarili.');
      }).catch(function (err) { alert('Ice aktarma hatasi: ' + err.message); });
    });

    var logoUp = document.getElementById('logo-upload');
    if (logoUp) logoUp.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file || !Storage.fileToDataURL) return;
      Storage.fileToDataURL(file).then(function (data) {
        if (!cfg.business) cfg.business = {};
        cfg.business.logoImage = data;
        var lp = document.getElementById('logo-preview');
        if (lp) lp.innerHTML = '<img src="' + data + '" alt="logo">';
      }).catch(function (err) { alert(err.message); });
    });

    var heroUp = document.getElementById('hero-upload');
    if (heroUp) heroUp.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file || !Storage.fileToDataURL) return;
      Storage.fileToDataURL(file).then(function (data) {
        if (!cfg.hero) cfg.hero = {};
        cfg.hero.image = data;
        var el = document.querySelector('[data-path="hero.image"]');
        if (el) el.value = data.slice(0, 80) + '...';
      }).catch(function (err) { alert(err.message); });
    });

    var galUp = document.getElementById('gallery-upload');
    if (galUp) galUp.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file || !Storage.fileToDataURL) return;
      Storage.fileToDataURL(file).then(function (data) {
        if (!cfg.gallery) cfg.gallery = [];
        cfg.gallery.push({ id: 'g' + Date.now(), url: data, alt: file.name });
        renderGallery();
      }).catch(function (err) { alert(err.message); });
    });

    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var presets = {
          elegant: { primary: '#C9A87C', primaryDark: '#A88B5E', secondary: '#F8F1E9', accent: '#E8D5C4', text: '#2C2C2C', textLight: '#6B6B6B', bg: '#FDFBF8', dark: '#1A1A1A' },
          rose: { primary: '#D4A5A5', primaryDark: '#B07A7A', secondary: '#F9F0F0', accent: '#E8D0D0', text: '#3D2C2C', textLight: '#7A6A6A', bg: '#FDF8F8', dark: '#2A1F1F' },
          ivory: { primary: '#B8A99A', primaryDark: '#8C7B6B', secondary: '#F5F2EB', accent: '#E5DFD4', text: '#333', textLight: '#666', bg: '#FFFEFB', dark: '#222' },
          modern: { primary: '#E84A7F', primaryDark: '#C23A68', secondary: '#4A1942', accent: '#2D1B2E', text: '#F5F0F2', textLight: '#C9B8C0', bg: '#1A0F1C', dark: '#0D080E', card: '#241528' },
          clinic: { primary: '#2A9D8F', primaryDark: '#1D7A6F', secondary: '#E9F5F3', accent: '#CBE5E0', text: '#1A2E2B', textLight: '#4A6560', bg: '#F7FBFA', dark: '#0F1F1C' }
        };
        var key = btn.getAttribute('data-preset');
        if (presets[key]) {
          cfg.colors = Object.assign({}, cfg.colors, presets[key]);
          fillFields();
          updateColorPreview();
        }
      });
    });

    document.querySelectorAll('[data-path^="colors."]').forEach(function (el) {
      el.addEventListener('input', updateColorPreview);
    });
  }
})();
