(function () {
  const cfg = Storage.load();
  Object.keys(cfg.colors || {}).forEach(k => document.documentElement.style.setProperty('--' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), cfg.colors[k]));

  document.title = cfg.seo?.title || cfg.business.name;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = cfg.seo?.description || cfg.business.tagline;

  const logoEl = document.getElementById('logo');
  if (cfg.business.logoImage) logoEl.innerHTML = `<img src="${cfg.business.logoImage}" alt="${cfg.business.name}" style="height:36px">`;
  else logoEl.textContent = cfg.business.logoText || cfg.business.name;
  document.getElementById('footer-logo').textContent = cfg.business.logoText || cfg.business.name;
  document.getElementById('footer-tagline').textContent = cfg.business.tagline;
  document.getElementById('footer-copy').textContent = `© ${new Date().getFullYear()} ${cfg.business.name}. Tüm hakları saklıdır.`;

  document.getElementById('hero-title').textContent = cfg.hero.title;
  document.getElementById('hero-sub').textContent = cfg.hero.subtitle;
  const heroCta = document.getElementById('hero-cta');
  heroCta.textContent = cfg.hero.ctaText;
  heroCta.href = cfg.hero.ctaLink || '#iletisim';
  const heroBg = document.getElementById('hero-bg');
  if (cfg.hero.image) { heroBg.style.backgroundImage = `url(${cfg.hero.image})`; heroBg.style.opacity = 1 - (cfg.hero.overlay || 0.3); }

  // Services — alternating timeline
  const servicesGrid = document.getElementById('services-grid');
  const formServices = document.getElementById('form-services');
  formServices.innerHTML = '<option value="">Hizmet seçin</option>';
  (cfg.services || []).filter(s => s.visible !== false).forEach((s, i) => {
    const side = i % 2 === 0 ? 'left' : 'right';
    servicesGrid.innerHTML += `
      <div class="timeline-item ${side}">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <span class="timeline-num">${String(i+1).padStart(2,'0')}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
          <div class="timeline-meta">
            <span class="timeline-price">${esc(s.price)}</span>
            ${s.duration ? `<span class="timeline-dur">${esc(s.duration)}</span>` : ''}
          </div>
        </div>
      </div>`;
    formServices.innerHTML += `<option>${esc(s.title)}</option>`;
  });

  // Gallery — masonry
  const galleryGrid = document.getElementById('gallery-grid');
  (cfg.gallery || []).forEach(g => {
    galleryGrid.innerHTML += `<figure class="masonry-item"><img src="${g.url}" alt="${esc(g.alt)}" loading="lazy"></figure>`;
  });

  // About
  document.getElementById('about-title').textContent = cfg.about.title;
  document.getElementById('about-text').textContent = cfg.about.text;
  const feats = document.getElementById('about-features');
  (cfg.about.features || []).forEach(f => feats.innerHTML += `<li>${esc(f)}</li>`);
  if (cfg.about.image) document.getElementById('about-img').src = cfg.about.image;

  // Testimonials
  const testiGrid = document.getElementById('testi-grid');
  (cfg.testimonials || []).filter(t => t.approved !== false).forEach(t => {
    testiGrid.innerHTML += `
      <article class="testi-row">
        <div class="testi-left">
          <span class="testi-quote-mark">“</span>
          <div class="stars">${'<span class="star"></span>'.repeat(t.rating || 5)}</div>
        </div>
        <p class="testi-text">${esc(t.text)}</p>
        <cite class="testi-name">${esc(t.name)}</cite>
      </article>`;
  });

  // Contact
  const b = cfg.business;
  document.getElementById('contact-info').innerHTML = `
    <div class="info-item"><strong>Telefon</strong><a href="tel:${b.phone.replace(/\s/g,'')}">${esc(b.phone)}</a></div>
    <div class="info-item"><strong>WhatsApp</strong><a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener">Mesaj Gönder</a></div>
    <div class="info-item"><strong>E-posta</strong><a href="mailto:${b.email}">${esc(b.email)}</a></div>
    <div class="info-item"><strong>Adres</strong><p>${esc(b.address)}</p></div>
    <div class="info-item"><strong>Saatler</strong><p>${esc(b.hours)}</p></div>`;

  const socialEl = document.getElementById('footer-social');
  if (b.social?.instagram) socialEl.innerHTML += `<a href="${b.social.instagram}" target="_blank" rel="noopener">Instagram</a>`;
  if (b.social?.facebook) socialEl.innerHTML += `<a href="${b.social.facebook}" target="_blank" rel="noopener">Facebook</a>`;
  if (b.social?.tiktok) socialEl.innerHTML += `<a href="${b.social.tiktok}" target="_blank" rel="noopener">TikTok</a>`;

  document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Teşekkürler! En kısa sürede dönüş yapacağız.');
    e.target.reset();
  });

  // Review form
  document.getElementById('review-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const review = {
      id: 't' + Date.now(),
      name: f.name.value.trim(),
      text: f.text.value.trim(),
      rating: Math.min(5, Math.max(1, parseInt(f.rating.value) || 5)),
      approved: false
    };
    if (!review.name || !review.text) return;
    const fresh = Storage.load();
    if (!fresh.testimonials) fresh.testimonials = [];
    fresh.testimonials.push(review);
    if (Storage.save(fresh)) {
      alert('Yorumunuz alındı! Yönetici onayından sonra yayınlanacak.');
      f.reset();
    }
  });

  // ---- Animations (slow & calm) ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  requestAnimationFrame(() => {
    document.getElementById('topNav')?.classList.add('is-loaded');
    document.querySelector('.hero-content')?.classList.add('is-visible');
  });
  setTimeout(() => document.querySelector('.hero-eyebrow')?.classList.add('is-visible'), 200);
  setTimeout(() => document.getElementById('hero-title')?.classList.add('is-visible'), 380);
  setTimeout(() => document.getElementById('hero-sub')?.classList.add('is-visible'), 580);
  setTimeout(() => document.getElementById('hero-cta')?.classList.add('is-visible'), 780);

  if (!reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll('.timeline-item').forEach((el, i) => { el.style.transitionDelay = (i*95)+'ms'; io.observe(el); });
    document.querySelectorAll('.masonry-item').forEach((el, i) => { el.style.transitionDelay = (i*110)+'ms'; io.observe(el); });
    document.querySelectorAll('.testi-row').forEach((el, i) => { el.style.transitionDelay = (i*110)+'ms'; io.observe(el); });
    document.getElementById('about-img') && io.observe(document.getElementById('about-img'));
    document.getElementById('about-features') && io.observe(document.getElementById('about-features'));
    document.getElementById('contact-info') && io.observe(document.getElementById('contact-info'));

    if (!isMobile) {
      const bg = document.getElementById('hero-bg');
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight && bg) bg.style.transform = `translateY(${y*0.18}px) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }, { passive: true });
    }
  } else {
    document.querySelectorAll('.timeline-item, .masonry-item, .testi-row, .about-img, .about-features, .contact-info').forEach(el => el.classList.add('is-visible'));
  }

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();