(function () {
  const cfg = Storage.load();

  // Apply colors as CSS variables
  const root = document.documentElement;
  const c = cfg.colors;
  Object.keys(c).forEach(k => {
    const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty('--' + cssKey, c[k]);
  });

  // SEO
  document.title = cfg.seo?.title || cfg.business.name;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = cfg.seo?.description || cfg.business.tagline;

  // Logo
  const logoEl = document.getElementById('logo');
  if (cfg.business.logoImage) {
    logoEl.innerHTML = `<img src="${cfg.business.logoImage}" alt="${cfg.business.name}" style="height:36px">`;
  } else {
    logoEl.textContent = cfg.business.logoText || cfg.business.name;
  }
  document.getElementById('footer-logo').textContent = cfg.business.logoText || cfg.business.name;
  document.getElementById('footer-tagline').textContent = cfg.business.tagline;
  document.getElementById('footer-copy').textContent = `© ${new Date().getFullYear()} ${cfg.business.name}. Tüm hakları saklıdır.`;

  // Hero
  document.getElementById('hero-title').textContent = cfg.hero.title;
  document.getElementById('hero-sub').textContent = cfg.hero.subtitle;
  const heroCta = document.getElementById('hero-cta');
  heroCta.textContent = cfg.hero.ctaText;
  heroCta.href = cfg.hero.ctaLink || '#iletisim';
  const heroBg = document.getElementById('hero-bg');
  if (cfg.hero.image) {
    heroBg.style.backgroundImage = `url(${cfg.hero.image})`;
    heroBg.style.opacity = 1 - (cfg.hero.overlay || 0.3);
  }

  // Services
  const servicesGrid = document.getElementById('services-grid');
  const formServices = document.getElementById('form-services');
  formServices.innerHTML = '<option value="">Hizmet seçin</option>';
  (cfg.services || []).filter(s => s.visible !== false).forEach(s => {
    servicesGrid.innerHTML += `
      <div class="service-card">
        <div class="service-icon">${s.icon || '✦'}</div>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.desc)}</p>
        <div class="service-meta">
          <span class="service-price">${escapeHtml(s.price)}</span>
          ${s.duration ? `<span class="service-dur">${escapeHtml(s.duration)}</span>` : ''}
        </div>
      </div>`;
    formServices.innerHTML += `<option>${escapeHtml(s.title)}</option>`;
  });

  // Gallery
  const galleryGrid = document.getElementById('gallery-grid');
  (cfg.gallery || []).forEach(g => {
    galleryGrid.innerHTML += `
      <div class="gallery-item">
        <img src="${g.url}" alt="${escapeHtml(g.alt || '')}" loading="lazy">
      </div>`;
  });

  // About
  document.getElementById('about-title').textContent = cfg.about.title;
  document.getElementById('about-text').textContent = cfg.about.text;
  const features = document.getElementById('about-features');
  (cfg.about.features || []).forEach(f => {
    features.innerHTML += `<li>${escapeHtml(f)}</li>`;
  });
  if (cfg.about.image) {
    document.getElementById('about-img').src = cfg.about.image;
  }

  // Testimonials
  const testiGrid = document.getElementById('testi-grid');
  (cfg.testimonials || []).forEach(t => {
    testiGrid.innerHTML += `
      <blockquote class="testi-card">
        <div class="stars">${'★'.repeat(t.rating || 5)}</div>
        <p>“${escapeHtml(t.text)}”</p>
        <cite>— ${escapeHtml(t.name)}</cite>
      </blockquote>`;
  });

  // Contact
  const contactInfo = document.getElementById('contact-info');
  const b = cfg.business;
  contactInfo.innerHTML = `
    <div class="info-item"><strong>Telefon</strong><a href="tel:${b.phone.replace(/\s/g,'')}">${escapeHtml(b.phone)}</a></div>
    <div class="info-item"><strong>WhatsApp</strong><a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener">Mesaj Gönder</a></div>
    <div class="info-item"><strong>E-posta</strong><a href="mailto:${b.email}">${escapeHtml(b.email)}</a></div>
    <div class="info-item"><strong>Adres</strong><p>${escapeHtml(b.address)}</p></div>
    <div class="info-item"><strong>Çalışma Saatleri</strong><p>${escapeHtml(b.hours)}</p></div>
  `;

  // Social
  const socialEl = document.getElementById('footer-social');
  if (b.social?.instagram) socialEl.innerHTML += `<a href="${b.social.instagram}" target="_blank" rel="noopener">Instagram</a>`;
  if (b.social?.facebook) socialEl.innerHTML += `<a href="${b.social.facebook}" target="_blank" rel="noopener">Facebook</a>`;
  if (b.social?.tiktok) socialEl.innerHTML += `<a href="${b.social.tiktok}" target="_blank" rel="noopener">TikTok</a>`;

  // Form
  document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Teşekkürler! En kısa sürede dönüş yapacağız.');
    e.target.reset();
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
