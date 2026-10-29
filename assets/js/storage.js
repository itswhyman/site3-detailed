/**
 * localStorage + simple IndexedDB image helper
 * Isolated by siteKey
 */
const Storage = {
  getKey() {
    return (window.SITE_DEFAULTS && window.SITE_DEFAULTS.siteKey) || 'beauty_default';
  },

  load() {
    try {
      const raw = localStorage.getItem(this.getKey());
      if (!raw) return structuredClone(window.SITE_DEFAULTS);
      const saved = JSON.parse(raw);
      // Deep merge with defaults so new fields appear
      return this.merge(structuredClone(window.SITE_DEFAULTS), saved);
    } catch (e) {
      console.warn('Config load failed, using defaults', e);
      return structuredClone(window.SITE_DEFAULTS);
    }
  },

  save(config) {
    try {
      // Never store the admin password in clear if we can help it, but for demo we keep it
      localStorage.setItem(this.getKey(), JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Save failed', e);
      alert('Kayıt başarısız. Tarayıcı depolama limiti dolmuş olabilir (büyük resimler).');
      return false;
    }
  },

  reset() {
    localStorage.removeItem(this.getKey());
    return structuredClone(window.SITE_DEFAULTS);
  },

  exportJSON(config) {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (config.business?.name || 'config').replace(/\s+/g, '-').toLowerCase() + '-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.business || !data.colors) throw new Error('Geçersiz config dosyası');
          resolve(this.merge(structuredClone(window.SITE_DEFAULTS), data));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  merge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = this.merge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  },

  // Convert file to base64 data URL (for small images)
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Sadece resim dosyaları yüklenebilir'));
        return;
      }
      if (file.size > 1.5 * 1024 * 1024) {
        reject(new Error('Resim 1.5 MB’dan küçük olmalı (localStorage limiti)'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
