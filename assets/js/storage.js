const Storage = {
  getKey() {
    return (window.SITE_DEFAULTS && window.SITE_DEFAULTS.siteKey) || 'beauty_default';
  },
  clone(obj) {
    try { return structuredClone(obj); }
    catch (e) { return JSON.parse(JSON.stringify(obj)); }
  },
  load() {
    try {
      const raw = localStorage.getItem(this.getKey());
      if (!raw) return this.clone(window.SITE_DEFAULTS);
      const saved = JSON.parse(raw);
      return this.merge(this.clone(window.SITE_DEFAULTS), saved);
    } catch (e) {
      console.warn('Load failed', e);
      return this.clone(window.SITE_DEFAULTS);
    }
  },
  save(config) {
    try {
      localStorage.setItem(this.getKey(), JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Save failed', e);
      alert('Kayıt başarısız (depolama limiti). Daha küçük görseller kullan.');
      return false;
    }
  },
  reset() {
    localStorage.removeItem(this.getKey());
    return this.clone(window.SITE_DEFAULTS);
  },
  exportJSON(config) {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (config.business?.name || 'config').toLowerCase().replace(/\s+/g, '-') + '-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  },
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.business || !data.colors) throw new Error('Geçersiz config');
          resolve(this.merge(this.clone(window.SITE_DEFAULTS), data));
        } catch (e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },
  merge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const key in source) {
      if (source[key] === null) { target[key] = null; continue; }
      if (Array.isArray(source[key])) target[key] = source[key];
      else if (typeof source[key] === 'object') target[key] = this.merge(target[key] || {}, source[key]);
      else target[key] = source[key];
    }
    return target;
  },
  fileToDataURL(file, maxW = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('Sadece resim'));
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL('image/jpeg', quality)); }
          catch (e) { resolve(reader.result); }
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};