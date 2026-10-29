(function () {
  const cfg = Storage.load();
  Object.keys(cfg.colors || {}).forEach(k => document.documentElement.style.setProperty('--' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), cfg.colors[k]));

  document.title = cfg.seo?.title || cfg.business.name;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = cfg.seo?.description || cfg.business.tagline;

  const logoEl = document.getElementById('logo');
  if (cfg.business.logoImage) logoEl.innerHTML = `<img src="${cfg.business.logoImage}" alt="${cfg.business.name}" style="height:38px">`;
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
  if (cfg.hero.image) { heroBg.style.backgroundImage = `url(${cfg.hero.image})`; heroBg.style.opacity = 1 - (cfg.hero.overlay || 0.35); }

  // Services — timeline
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

  // ---- GALLERY SLIDER ----
  const sliderStage = document.getElementById('slider-stage');
  const sliderDots = document.getElementById('slider-dots');
  const galleryItems = (cfg.gallery || []).filter(g => g.url);

  if (sliderStage && galleryItems.length) {
    galleryItems.forEach((g, i) => {
      const div = document.createElement('div');
      div.className = 'slide';
      div.dataset.idx = i;
      div.innerHTML = `<img src="${g.url}" alt="${esc(g.alt)}" loading="lazy">`;
      sliderStage.appendChild(div);
    });
    const slides = Array.from(sliderStage.querySelectorAll('.slide'));
    let current = 0;
    let autoTimer = null;

    if (sliderDots) {
      sliderDots.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', `Slayt ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); });
        sliderDots.appendChild(dot);
      });
    }

    function updateSlides() {
      const n = slides.length;
      slides.forEach((s, i) => {
        s.className = 'slide';
        const diff = ((i - current) % n + n) % n;
        if (diff === 0) s.classList.add('active');
        else if (diff === n - 1) s.classList.add('left');
        else if (diff === 1) s.classList.add('right');
        else s.classList.add('hidden');
      });
      if (sliderDots) {
        sliderDots.querySelectorAll('.slider-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function goTo(idx) {
      current = ((idx % slides.length) + slides.length) % slides.length;
      updateSlides();
      restartAuto();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      autoTimer = setInterval(next, 5000);
    }

    document.getElementById('gallery-next')?.addEventListener('click', next);
    document.getElementById('gallery-prev')?.addEventListener('click', prev);

    const sliderEl = document.getElementById('gallery-slider');
    sliderEl?.addEventListener('mouseenter', () => autoTimer && clearInterval(autoTimer));
    sliderEl?.addEventListener('mouseleave', restartAuto);

    let touchStartX = 0;
    sliderEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderEl?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    }, { passive: true });

    updateSlides();
    restartAuto();
  }

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

  document.querySelectorAll('.star-picker').forEach(widget => {
    const btns = widget.querySelectorAll('.star-btn');
    const hidden = widget.closest('form').querySelector('input[name="rating"]');
    let current = parseInt(widget.dataset.rating) || 5;
    function paint(v) { btns.forEach((b, i) => b.classList.toggle('filled', i < v)); }
    paint(current);
    btns.forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => paint(i + 1));
      btn.addEventListener('mouseleave', () => paint(current));
      btn.addEventListener('click', () => { current = i + 1; widget.dataset.rating = current; if (hidden) hidden.value = current; paint(current); });
    });
  });

  document.getElementById('review-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const review = { id: 't' + Date.now(), name: f.name.value.trim(), text: f.text.value.trim(), rating: Math.min(5, Math.max(1, parseInt(f.rating.value) || 5)), approved: false };
    if (!review.name || !review.text) return;
    const fresh = Storage.load();
    if (!fresh.testimonials) fresh.testimonials = [];
    fresh.testimonials.push(review);
    if (Storage.save(fresh)) {
      alert('Yorumunuz alındı! Yönetici onayından sonra yayınlanacak.');
      f.reset();
      f.querySelectorAll('.star-btn').forEach((b, i) => b.classList.toggle('filled', i < 5));
      f.querySelector('input[name="rating"]').value = 5;
      f.querySelector('.star-picker').dataset.rating = 5;
    }
  });

  // Animations
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
    }, { threshold: 0.08, rootMargin: '0px 0px 5% 0px' });
    document.querySelectorAll('.timeline-item').forEach((el, i) => { el.style.transitionDelay = (i*90)+'ms'; io.observe(el); });
    document.querySelectorAll('.testi-row').forEach((el, i) => { el.style.transitionDelay = (i*100)+'ms'; io.observe(el); });
    const aboutImg = document.getElementById('about-img'); if (aboutImg) io.observe(aboutImg);
    const aboutFeats = document.getElementById('about-features'); if (aboutFeats) io.observe(aboutFeats);
    const contactInfo = document.getElementById('contact-info'); if (contactInfo) io.observe(contactInfo);

    setTimeout(() => {
      document.querySelectorAll('.timeline-item, .testi-row, .about-img, .about-features, .contact-info').forEach(el => el.classList.add('is-visible'));
    }, 2500);

    if (!isMobile) {
      const bg = document.getElementById('hero-bg');
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight && bg) bg.style.transform = `translateY(${y*0.18}px) scale(1.06)`;
          ticking = false;
        });
        ticking = true;
      }, { passive: true });
    }
  } else {
    document.querySelectorAll('.timeline-item, .testi-row, .about-img, .about-features, .contact-info').forEach(el => el.classList.add('is-visible'));
  }

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();