(function () {
  'use strict';

  function getDefaults() {
    return window.SITE_DEFAULTS || {
      siteKey: 'beauty_fallback',
      admin: { user: 'admin', pass: 'admin123' },
      business: {}, colors: {}, hero: {}, about: {},
      services: [], gallery: [], testimonials: [], seo: {}
    };
  }

  let cfg;
  try { cfg = Storage.load(); } catch (e) { cfg = getDefaults(); }
  if (!cfg.admin) cfg.admin = { user: 'admin', pass: 'admin123' };

  const SESSION_KEY = (cfg.siteKey || 'beauty') + '_admin_session';
  const HARD_USER = 'admin';
  const HARD_PASS = 'admin123';

  function isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function doLogin(u, p) {
    const ok = (u === HARD_USER && p === HARD_PASS) ||
               (cfg.admin && u === cfg.admin.user && p === cfg.admin.pass);
    if (ok) { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch(e){} return true; }
    return false;
  }

  function doLogout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch(e){}
    location.reload();
  }

  function showDashboard() {
    const login = document.getElementById('login-screen');
    const dash = document.getElementById('dashboard');
    if (login) { login.hidden = true; login.style.display = 'none'; }
    if (dash) { dash.hidden = false; dash.style.display = 'flex'; dash.classList.add('is-open'); }
    try { initDashboard(); } catch (err) { console.error(err); }
  }

  function showLogin() {
    const login = document.getElementById('login-screen');
    const dash = document.getElementById('dashboard');
    if (dash) { dash.hidden = true; dash.style.display = 'none'; dash.classList.remove('is-open'); }
    if (login) { login.hidden = false; login.style.display = 'flex'; }
  }

  function boot() {
    isLoggedIn() ? showDashboard() : showLogin();
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        if (doLogin(u, p)) showDashboard();
        else {
          const err = document.getElementById('login-error');
          if (err) { err.textContent = 'Hatalı giriş.'; err.hidden = false; err.style.display = 'block'; }
        }
      });
    }
    document.getElementById('btn-logout')?.addEventListener('click', doLogout);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

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
    document.querySelectorAll('.sidebar-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.querySelector(`[data-panel="${tab}"]`)?.classList.add('active');
        document.getElementById('tab-title').textContent = btn.textContent;
      });
    });
  }

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => o ? o[k] : undefined, obj);
  }
  function setByPath(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function fillFields() {
    document.querySelectorAll('[data-path]').forEach(el => {
      const val = getByPath(cfg, el.getAttribute('data-path'));
      if (val === undefined || val === null) return;
      el.value = val;
    });
    const featEl = document.getElementById('about-features-text');
    if (featEl && cfg.about?.features) featEl.value = cfg.about.features.join('\n');
    if (cfg.business?.logoImage) {
      const lp = document.getElementById('logo-preview');
      if (lp) lp.innerHTML = `<img src="${cfg.business.logoImage}" alt="logo">`;
    }
  }

  function collectFields() {
    document.querySelectorAll('[data-path]').forEach(el => {
      setByPath(cfg, el.getAttribute('data-path'), el.value);
    });
    const featEl = document.getElementById('about-features-text');
    if (featEl) {
      if (!cfg.about) cfg.about = {};
      cfg.about.features = featEl.value.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }

  function escapeAttr(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function renderServices() {
    const list = document.getElementById('services-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.services || []).forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="row">
          <div class="field"><label>Ikon</label><input type="text" value="${escapeAttr(s.icon)}" data-si="${i}" data-field="icon"></div>
          <div class="field"><label>Başlık</label><input type="text" value="${escapeAttr(s.title)}" data-si="${i}" data-field="title"></div>
          <div class="field full"><label>Açıklama</label><input type="text" value="${escapeAttr(s.desc)}" data-si="${i}" data-field="desc"></div>
          <div class="field"><label>Fiyat</label><input type="text" value="${escapeAttr(s.price)}" data-si="${i}" data-field="price"></div>
          <div class="field"><label>Süre</label><input type="text" value="${escapeAttr(s.duration)}" data-si="${i}" data-field="duration"></div>
        </div>
        <div class="actions">
          <label><input type="checkbox" data-si="${i}" data-field="visible" ${s.visible !== false ? 'checked' : ''}> Görünür</label>
          <button type="button" class="danger" data-remove-service="${i}">Sil</button>
        </div>`;
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const i = +el.getAttribute('data-si');
        const f = el.getAttribute('data-field');
        if (f === 'visible') cfg.services[i].visible = el.checked;
        else cfg.services[i][f] = el.value;
        autoSave();
      });
    });
    list.querySelectorAll('[data-remove-service]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Silinsin mi?')) return;
        cfg.services.splice(+btn.getAttribute('data-remove-service'), 1);
        renderServices(); autoSave();
      });
    });
  }

  function renderGallery() {
    const list = document.getElementById('gallery-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.gallery || []).forEach((g, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item-admin';
      div.innerHTML = `
        <img class="gallery-thumb" src="${escapeAttr(g.url)}" alt="">
        <input type="text" value="${escapeAttr(g.alt)}" data-gi="${i}" placeholder="Alt text">
        <div class="actions"><button type="button" class="danger" data-remove-gallery="${i}">Sil</button></div>`;
      list.appendChild(div);
    });
    list.querySelectorAll('[data-gi]').forEach(el => {
      el.addEventListener('change', () => {
        cfg.gallery[+el.getAttribute('data-gi')].alt = el.value;
        autoSave();
      });
    });
    list.querySelectorAll('[data-remove-gallery]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Silinsin mi?')) return;
        cfg.gallery.splice(+btn.getAttribute('data-remove-gallery'), 1);
        renderGallery(); autoSave();
      });
    });
  }

  function renderTestimonials() {
    const list = document.getElementById('testi-list');
    if (!list) return;
    list.innerHTML = '';
    (cfg.testimonials || []).forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'testi-item';
      div.innerHTML = `
        <div class="row">
          <div class="field full"><label>Yorum</label><input type="text" value="${escapeAttr(t.text)}" data-ti="${i}" data-field="text"></div>
          <div class="field"><label>İsim</label><input type="text" value="${escapeAttr(t.name)}" data-ti="${i}" data-field="name"></div>
          <div class="field"><label>Puan (1-5)</label><input type="number" min="1" max="5" value="${t.rating || 5}" data-ti="${i}" data-field="rating"></div>
        </div>
        <div class="actions">
          <label><input type="checkbox" data-ti="${i}" data-field="approved" ${t.approved !== false ? 'checked' : ''}> Onaylı</label>
          <button type="button" class="danger" data-remove-testi="${i}">Sil</button>
        </div>`;
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const i = +el.getAttribute('data-ti');
        const f = el.getAttribute('data-field');
        if (f === 'rating') cfg.testimonials[i].rating = +el.value;
        else if (f === 'approved') cfg.testimonials[i].approved = el.checked;
        else cfg.testimonials[i][f] = el.value;
        autoSave();
      });
    });
    list.querySelectorAll('[data-remove-testi]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Silinsin mi?')) return;
        cfg.testimonials.splice(+btn.getAttribute('data-remove-testi'), 1);
        renderTestimonials(); autoSave();
      });
    });
  }

  function updateColorPreview() {
    const card = document.querySelector('.preview-card');
    if (!card) return;
    const p = document.querySelector('[data-path="colors.primary"]')?.value || '#C9A87C';
    const bg = document.querySelector('[data-path="colors.bg"]')?.value || '#FDFBF8';
    const text = document.querySelector('[data-path="colors.text"]')?.value || '#2c2c2c';
    const tl = document.querySelector('[data-path="colors.textLight"]')?.value || '#6b6b6b';
    card.style.setProperty('--preview-primary', p);
    card.style.setProperty('--preview-bg', bg);
    card.style.setProperty('--preview-text', text);
    card.style.setProperty('--preview-text-light', tl);
  }

  function showToast(msg = 'Kaydedildi') {
    const toast = document.getElementById('save-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.style.display = 'block';
    setTimeout(() => { toast.hidden = true; toast.style.display = 'none'; }, 1800);
  }

  function autoSave() {
    collectFields();
    if (Storage.save(cfg)) showToast('Değişiklikler kaydedildi');
  }

  function bindActions() {
    document.getElementById('btn-save')?.addEventListener('click', () => {
      autoSave();
    });

    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (!confirm('Tüm ayarlar sıfırlanacak. Emin misin?')) return;
      cfg = Storage.reset();
      fillFields(); renderServices(); renderGallery(); renderTestimonials(); updateColorPreview();
      showToast('Sıfırlandı');
    });

    document.getElementById('add-service')?.addEventListener('click', () => {
      if (!cfg.services) cfg.services = [];
      cfg.services.push({ id: 's' + Date.now(), icon: '', title: 'Yeni Hizmet', desc: '', price: '', duration: '', visible: true });
      renderServices(); autoSave();
    });

    document.getElementById('add-gallery')?.addEventListener('click', () => {
      const urlEl = document.getElementById('new-gallery-url');
      const url = urlEl?.value.trim();
      if (!url) return;
      if (!cfg.gallery) cfg.gallery = [];
      cfg.gallery.push({ id: 'g' + Date.now(), url, alt: '' });
      urlEl.value = '';
      renderGallery(); autoSave();
    });

    document.getElementById('add-testi')?.addEventListener('click', () => {
      if (!cfg.testimonials) cfg.testimonials = [];
      cfg.testimonials.push({ id: 't' + Date.now(), text: '', name: '', rating: 5, approved: true });
      renderTestimonials(); autoSave();
    });

    document.getElementById('btn-export')?.addEventListener('click', () => {
      collectFields();
      Storage.exportJSON(cfg);
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Storage.importJSON(file).then(data => {
        cfg = data;
        Storage.save(cfg);
        fillFields(); renderServices(); renderGallery(); renderTestimonials(); updateColorPreview();
        showToast('İçe aktarıldı');
      }).catch(err => alert('Hata: ' + err.message));
    });

    // Image uploads with size constraint
    document.getElementById('logo-upload')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Storage.fileToDataURL(file, 400).then(data => {
        if (!cfg.business) cfg.business = {};
        cfg.business.logoImage = data;
        const lp = document.getElementById('logo-preview');
        if (lp) lp.innerHTML = `<img src="${data}" alt="logo">`;
        autoSave();
      }).catch(err => alert(err.message));
    });

    document.getElementById('hero-upload')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Storage.fileToDataURL(file, 1600).then(data => {
        if (!cfg.hero) cfg.hero = {};
        cfg.hero.image = data;
        const el = document.querySelector('[data-path="hero.image"]');
        if (el) el.value = '(yüklenen görsel)';
        autoSave();
      }).catch(err => alert(err.message));
    });

    document.getElementById('gallery-upload')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Storage.fileToDataURL(file, 1000).then(data => {
        if (!cfg.gallery) cfg.gallery = [];
        cfg.gallery.push({ id: 'g' + Date.now(), url: data, alt: file.name });
        renderGallery(); autoSave();
      }).catch(err => alert(err.message));
    });

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presets = {
          elegant: { primary: '#C9A87C', primaryDark: '#A88B5E', secondary: '#F8F1E9', accent: '#E8D5C4', text: '#2C2C2C', textLight: '#6B6B6B', bg: '#FDFBF8', dark: '#1A1A1A' },
          rose: { primary: '#D4A5A5', primaryDark: '#B07A7A', secondary: '#F9F0F0', accent: '#E8D0D0', text: '#3D2C2C', textLight: '#7A6A6A', bg: '#FDF8F8', dark: '#2A1F1F' },
          ivory: { primary: '#B8A99A', primaryDark: '#8C7B6B', secondary: '#F5F2EB', accent: '#E5DFD4', text: '#333', textLight: '#666', bg: '#FFFEFB', dark: '#222' },
          modern: { primary: '#E84A7F', primaryDark: '#C23A68', secondary: '#4A1942', accent: '#2D1B2E', text: '#F5F0F2', textLight: '#C9B8C0', bg: '#1A0F1C', dark: '#0D080E', card: '#241528' },
          clinic: { primary: '#2A9D8F', primaryDark: '#1D7A6F', secondary: '#E9F5F3', accent: '#CBE5E0', text: '#1A2E2B', textLight: '#4A6560', bg: '#F7FBFA', dark: '#0F1F1C' }
        };
        const p = presets[btn.getAttribute('data-preset')];
        if (p) { cfg.colors = Object.assign({}, cfg.colors, p); fillFields(); updateColorPreview(); autoSave(); }
      });
    });

    document.querySelectorAll('[data-path^="colors."]').forEach(el => {
      el.addEventListener('input', updateColorPreview);
      el.addEventListener('change', autoSave);
    });
  }
})();