(function () {
  let cfg = Storage.load();
  const SESSION_KEY = cfg.siteKey + '_session';

  // Auth
  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }
  function login(user, pass) {
    if (user === cfg.admin.user && pass === cfg.admin.pass) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  }

  // UI init
  if (isLoggedIn()) {
    document.getElementById('login-screen').hidden = true;
    document.getElementById('dashboard').hidden = false;
    initDashboard();
  }

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    if (login(u, p)) {
      document.getElementById('login-screen').hidden = true;
      document.getElementById('dashboard').hidden = false;
      initDashboard();
    } else {
      const err = document.getElementById('login-error');
      err.textContent = 'Kullanıcı adı veya şifre hatalı.';
      err.hidden = false;
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', logout);

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
        const tab = btn.dataset.tab;
        document.querySelector(`[data-panel="${tab}"]`).classList.add('active');
        document.getElementById('tab-title').textContent = btn.textContent;
      });
    });
  }

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
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
      const val = getByPath(cfg, el.dataset.path);
      if (el.type === 'color' && val) el.value = val;
      else if (val !== undefined && val !== null) el.value = val;
    });
    // About features as textarea
    const featEl = document.getElementById('about-features-text');
    if (featEl && cfg.about?.features) featEl.value = cfg.about.features.join('\n');
    // Logo preview
    if (cfg.business.logoImage) {
      document.getElementById('logo-preview').innerHTML = `<img src="${cfg.business.logoImage}" alt="logo">`;
    }
  }

  function collectFields() {
    document.querySelectorAll('[data-path]').forEach(el => {
      let val = el.value;
      if (el.type === 'color') val = el.value;
      setByPath(cfg, el.dataset.path, val);
    });
    const featEl = document.getElementById('about-features-text');
    if (featEl) {
      cfg.about.features = featEl.value.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }

  function renderServices() {
    const list = document.getElementById('services-list');
    list.innerHTML = '';
    (cfg.services || []).forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="row">
          <div class="field"><label>İkon</label><input type="text" value="${s.icon || ''}" data-si="${i}" data-field="icon"></div>
          <div class="field"><label>Başlık</label><input type="text" value="${escape(s.title)}" data-si="${i}" data-field="title"></div>
          <div class="field full"><label>Açıklama</label><input type="text" value="${escape(s.desc)}" data-si="${i}" data-field="desc"></div>
          <div class="field"><label>Fiyat</label><input type="text" value="${escape(s.price)}" data-si="${i}" data-field="price"></div>
          <div class="field"><label>Süre</label><input type="text" value="${escape(s.duration || '')}" data-si="${i}" data-field="duration"></div>
        </div>
        <div class="actions">
          <label><input type="checkbox" data-si="${i}" data-field="visible" ${s.visible !== false ? 'checked' : ''}> Görünür</label>
          <button type="button" class="danger" data-remove-service="${i}">Sil</button>
        </div>`;
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const i = +el.dataset.si;
        const f = el.dataset.field;
        if (f === 'visible') cfg.services[i].visible = el.checked;
        else cfg.services[i][f] = el.value;
      });
    });
    list.querySelectorAll('[data-remove-service]').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.services.splice(+btn.dataset.removeService, 1);
        renderServices();
      });
    });
  }

  function renderGallery() {
    const list = document.getElementById('gallery-list');
    list.innerHTML = '';
    (cfg.gallery || []).forEach((g, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item-admin';
      div.innerHTML = `
        <img class="gallery-thumb" src="${g.url}" alt="">
        <input type="text" value="${escape(g.alt || '')}" data-gi="${i}" placeholder="Alt text" style="margin:0 .5rem;flex:1">
        <div class="actions"><button type="button" class="danger" data-remove-gallery="${i}">Sil</button></div>`;
      div.style.display = 'flex'; div.style.alignItems = 'center';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-gi]').forEach(el => {
      el.addEventListener('change', () => { cfg.gallery[+el.dataset.gi].alt = el.value; });
    });
    list.querySelectorAll('[data-remove-gallery]').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.gallery.splice(+btn.dataset.removeGallery, 1);
        renderGallery();
      });
    });
  }

  function renderTestimonials() {
    const list = document.getElementById('testi-list');
    list.innerHTML = '';
    (cfg.testimonials || []).forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'testi-item';
      div.innerHTML = `
        <div class="row">
          <div class="field full"><label>Yorum</label><input type="text" value="${escape(t.text)}" data-ti="${i}" data-field="text"></div>
          <div class="field"><label>İsim</label><input type="text" value="${escape(t.name)}" data-ti="${i}" data-field="name"></div>
          <div class="field"><label>Puan (1-5)</label><input type="number" min="1" max="5" value="${t.rating || 5}" data-ti="${i}" data-field="rating"></div>
        </div>
        <div class="actions"><button type="button" class="danger" data-remove-testi="${i}">Sil</button></div>`;
      list.appendChild(div);
    });
    list.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const i = +el.dataset.ti;
        const f = el.dataset.field;
        cfg.testimonials[i][f] = f === 'rating' ? +el.value : el.value;
      });
    });
    list.querySelectorAll('[data-remove-testi]').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.testimonials.splice(+btn.dataset.removeTesti, 1);
        renderTestimonials();
      });
    });
  }

  function bindActions() {
    document.getElementById('btn-save').addEventListener('click', () => {
      collectFields();
      if (Storage.save(cfg)) {
        const toast = document.getElementById('save-toast');
        toast.hidden = false;
        setTimeout(() => toast.hidden = true, 2000);
      }
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('Tüm ayarlar varsayılana dönecek. Emin misiniz?')) {
        cfg = Storage.reset();
        fillFields();
        renderServices();
        renderGallery();
        renderTestimonials();
        updateColorPreview();
        alert('Varsayılana sıfırlandı.');
      }
    });

    document.getElementById('add-service').addEventListener('click', () => {
      cfg.services.push({ id: 's' + Date.now(), icon: '✦', title: 'Yeni Hizmet', desc: '', price: '', duration: '', visible: true });
      renderServices();
    });

    document.getElementById('add-gallery').addEventListener('click', () => {
      const url = document.getElementById('new-gallery-url').value.trim();
      if (!url) return;
      cfg.gallery.push({ id: 'g' + Date.now(), url, alt: '' });
      document.getElementById('new-gallery-url').value = '';
      renderGallery();
    });

    document.getElementById('add-testi').addEventListener('click', () => {
      cfg.testimonials.push({ id: 't' + Date.now(), text: '', name: '', rating: 5 });
      renderTestimonials();
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      collectFields();
      Storage.exportJSON(cfg);
    });

    document.getElementById('import-file').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        cfg = await Storage.importJSON(file);
        Storage.save(cfg);
        fillFields();
        renderServices();
        renderGallery();
        renderTestimonials();
        updateColorPreview();
        alert('İçe aktarma başarılı.');
      } catch (err) {
        alert('İçe aktarma hatası: ' + err.message);
      }
    });

    // Uploads
    document.getElementById('logo-upload').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await Storage.fileToDataURL(file);
        cfg.business.logoImage = data;
        document.getElementById('logo-preview').innerHTML = `<img src="${data}" alt="logo">`;
      } catch (err) { alert(err.message); }
    });

    document.getElementById('hero-upload').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await Storage.fileToDataURL(file);
        cfg.hero.image = data;
        document.querySelector('[data-path="hero.image"]').value = data.slice(0, 60) + '…';
      } catch (err) { alert(err.message); }
    });

    document.getElementById('gallery-upload').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await Storage.fileToDataURL(file);
        cfg.gallery.push({ id: 'g' + Date.now(), url: data, alt: file.name });
        renderGallery();
      } catch (err) { alert(err.message); }
    });

    // Color presets & live preview
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presets = {
          elegant: { primary: '#C9A87C', primaryDark: '#A88B5E', secondary: '#F8F1E9', accent: '#E8D5C4', text: '#2C2C2C', textLight: '#6B6B6B', bg: '#FDFBF8', dark: '#1A1A1A' },
          rose: { primary: '#D4A5A5', primaryDark: '#B07A7A', secondary: '#F9F0F0', accent: '#E8D0D0', text: '#3D2C2C', textLight: '#7A6A6A', bg: '#FDF8F8', dark: '#2A1F1F' },
          ivory: { primary: '#B8A99A', primaryDark: '#8C7B6B', secondary: '#F5F2EB', accent: '#E5DFD4', text: '#333', textLight: '#666', bg: '#FFFEFB', dark: '#222' }
        };
        Object.assign(cfg.colors, presets[btn.dataset.preset]);
        fillFields();
        updateColorPreview();
      });
    });

    document.querySelectorAll('[data-path^="colors."]').forEach(el => {
      el.addEventListener('input', updateColorPreview);
    });
  }

  function updateColorPreview() {
    const card = document.querySelector('.preview-card');
    if (!card) return;
    const p = document.querySelector('[data-path="colors.primary"]')?.value || cfg.colors.primary;
    const bg = document.querySelector('[data-path="colors.bg"]')?.value || cfg.colors.bg;
    const text = document.querySelector('[data-path="colors.text"]')?.value || cfg.colors.text;
    const textL = document.querySelector('[data-path="colors.textLight"]')?.value || cfg.colors.textLight;
    card.style.setProperty('--preview-primary', p);
    card.style.setProperty('--preview-bg', bg);
    card.style.setProperty('--preview-text', text);
    card.style.setProperty('--preview-text-light', textL);
  }

  function escape(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
})();
