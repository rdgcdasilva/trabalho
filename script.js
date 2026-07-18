/* ============================================================
   Rodrigo Cunha da Silva — Landing Cinematográfica
   Motor de scroll: GSAP + ScrollTrigger + Lenis (vendorizados
   localmente em assets/vendor/). Canvas com scrub por progresso,
   quadros-placeholder e ganchos para trocar por vídeo gerado.

   Fallbacks:
     - Sem GSAP/Lenis  -> modo ESTÁTICO (tudo visível, scroll normal).
     - prefers-reduced-motion -> modo ESTÁTICO.
     - Telas pequenas  -> modo LEVE (poster estático + fade-in simples).
     - Desktop         -> modo CINEMATOGRÁFICO completo (pin + scrub).
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var LANG_KEY = 'rs-lang';

  /* ============================================================
     1. IDIOMA (PT / EN)  — preservado do site original
     ============================================================ */
  function applyLang(lang) {
    if (lang !== 'en') lang = 'pt';
    root.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
    var nodes = document.querySelectorAll('[data-pt][data-en]');
    Array.prototype.forEach.call(nodes, function (el) {
      var value = el.getAttribute('data-' + lang);
      if (value !== null) el.innerHTML = value;
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'PT' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Mudar para português' : 'Switch to English');
    }
  }
  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    applyLang(saved === 'en' ? 'en' : 'pt');
  }
  function toggleLang() {
    var current = root.getAttribute('lang') === 'en' ? 'en' : 'pt';
    var next = current === 'en' ? 'pt' : 'en';
    applyLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
  }

  /* ---------- Ano no rodapé ---------- */
  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Destaque do link ativo ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    var sections = links.map(function (link) {
      var id = link.getAttribute('href').slice(1);
      return id ? document.getElementById(id) : null;
    }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    if (!toggle) return;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () { toggle.checked = false; });
    });
    var burger = document.querySelector('.nav-hamburger');
    if (burger) {
      burger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.checked = !toggle.checked; }
      });
    }
  }

  /* ============================================================
     2. CONFIGURAÇÃO DOS CAPÍTULOS  (drop-in de vídeo aqui)
     ------------------------------------------------------------
     Cada capítulo tem um <canvas data-canvas="<id>">. Enquanto não
     houver quadros gerados, um renderizador-placeholder desenha um
     gradiente cinematográfico grafite→âmbar que faz "scrub" com o
     progresso do scroll (0→1), com grão e vinheta.

     >>> COMO INSERIR OS VÍDEOS GERADOS (Higgsfield etc.) <<<
     Opção A (sequência de quadros — recomendada p/ scrub):
       1. Extraia os quadros do clipe:
            ffmpeg -i cap-fluxo.mp4 -vf fps=24 assets/frames/fluxo/%04d.jpg
       2. Coloque em assets/frames/<id>/0001.jpg, 0002.jpg, ...
       3. Ajuste frameCount abaixo para o total de quadros.
       O loader tenta carregar assets/frames/<id>/0001.jpg; se existir,
       usa a sequência (índice = progresso). Se falhar, cai no placeholder.

     Opção B (vídeo simples, sem scrub por quadro):
       Troque o <canvas data-canvas="<id>"> por, no HTML:
         <video class="chapter-canvas" src="assets/clips/<id>.mp4"
                muted loop playsinline autoplay preload="auto"></video>
       e remova o id da lista abaixo (o motor ignora capítulos sem canvas).
     ============================================================ */
  var CHAPTERS = [
    { id: 'hero',        title: 'O que move as pessoas',    framesDir: 'assets/frames/hero/',        frameCount: 0, accent: '#f5b301', poster: 'assets/frames/hero/poster.png' },
    { id: 'fluxo',       title: 'Workforce Design & Dados', framesDir: 'assets/frames/fluxo/',       frameCount: 0, accent: '#f5b301' },
    { id: 'acolhimento', title: 'Hospitalidade Org.',       framesDir: 'assets/frames/acolhimento/', frameCount: 0, accent: '#f6c343' },
    { id: 'rigor',       title: 'Pesquisa & Conhecimento',  framesDir: 'assets/frames/rigor/',       frameCount: 0, accent: '#f5b301' },
    { id: 'final',       title: 'Impacto',                  framesDir: 'assets/frames/final/',       frameCount: 0, accent: '#f6c343' }
  ];

  /* ============================================================
     3. RENDERIZADOR DE QUADROS (placeholder + loader de imagens)
     ============================================================ */
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var noiseTile = null;

  function buildNoise() {
    var n = document.createElement('canvas');
    n.width = 96; n.height = 96;
    var nc = n.getContext('2d');
    var img = nc.createImageData(96, 96);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 128 + (Math.random() * 255 - 128);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nc.putImageData(img, 0, 0);
    noiseTile = n;
  }

  function hexA(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substr(0, 2), 16),
        g = parseInt(h.substr(2, 2), 16),
        b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  // Seed determinístico para posições dispersas estáveis
  function seeded(i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawMotif(ctx, w, h, p, accent, t) {
    // Metáfora: pontos dispersos que se ESTRUTURAM em grade com o progresso.
    var N = 44, cols = 8, cw = w / (cols + 1), rows = Math.ceil(N / cols);
    var rh = h / (rows + 1);
    ctx.save();
    var pts = [];
    for (var i = 0; i < N; i++) {
      var sx = seeded(i) * w;
      var sy = seeded(i + 99) * h;
      var col = (i % cols) + 1, rowi = Math.floor(i / cols) + 1;
      var tx = col * cw, ty = rowi * rh + Math.sin(t * 0.4 + i) * 4;
      var e = p * p * (3 - 2 * p); // smoothstep
      var x = sx + (tx - sx) * e;
      var y = sy + (ty - sy) * e;
      pts.push([x, y]);
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + p * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = hexA(accent, 0.15 + p * 0.5);
      ctx.fill();
    }
    // linhas de conexão surgem conforme a estrutura se forma
    ctx.strokeStyle = hexA(accent, 0.04 + p * 0.14);
    ctx.lineWidth = 1;
    for (var r = 0; r < pts.length; r++) {
      if ((r % cols) !== cols - 1 && r + 1 < pts.length) {
        ctx.beginPath(); ctx.moveTo(pts[r][0], pts[r][1]); ctx.lineTo(pts[r + 1][0], pts[r + 1][1]); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function renderPlaceholder(ctx, w, h, p, chapter, t) {
    var accent = chapter.accent || '#f5b301';
    // base grafite
    ctx.fillStyle = '#12131a';
    ctx.fillRect(0, 0, w, h);
    // gradiente que desliza com o progresso
    var g = ctx.createLinearGradient(0, 0, w * 0.35, h);
    g.addColorStop(0, '#171922');
    var mid = Math.max(0.05, Math.min(0.95, 0.2 + p * 0.55));
    g.addColorStop(mid, hexA(accent, 0.05 + p * 0.10));
    g.addColorStop(1, '#0e0f16');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // brilho âmbar em movimento (garante scrub visível p/ frente e p/ trás)
    var gx = w * (0.12 + p * 0.72);
    var gy = h * (0.72 - Math.sin(p * Math.PI) * 0.28) + Math.sin(t * 0.5) * 6;
    var rad = Math.max(w, h) * (0.34 + p * 0.26);
    var rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
    rg.addColorStop(0, hexA(accent, 0.26 + p * 0.16));
    rg.addColorStop(0.45, hexA(accent, 0.05));
    rg.addColorStop(1, hexA(accent, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
    // motivo estrutural
    drawMotif(ctx, w, h, p, accent, t);
    // grão
    if (noiseTile) {
      ctx.save();
      ctx.globalAlpha = 0.045;
      var pat = ctx.createPattern(noiseTile, 'repeat');
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    }
    // vinheta
    var vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  function drawFrameImage(ctx, w, h, img) {
    // cover
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return false;
    var scale = Math.max(w / iw, h / ih);
    var dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return true;
  }

  // Imagem-pôster real (ex.: referência gerada no Higgsfield) como base do
  // capítulo, com um scrim grafite/âmbar cinematográfico por cima para manter
  // o título branco legível — e com o brilho âmbar + motivo estrutural fazendo
  // "scrub" com o progresso, preservando a animação sobre a foto.
  function renderPosterBackdrop(ctx, w, h, p, chapter, t) {
    var accent = chapter.accent || '#f5b301';
    // 1. imagem real (cover)
    drawFrameImage(ctx, w, h, chapter.posterImg);
    // 2. scrim grafite p/ legibilidade (mais denso à esquerda, onde fica o texto)
    var g = ctx.createLinearGradient(0, 0, w * 0.55, h);
    g.addColorStop(0, 'rgba(10,11,16,0.62)');
    g.addColorStop(0.5, 'rgba(12,13,20,0.34)');
    g.addColorStop(1, 'rgba(10,11,16,0.20)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 3. brilho âmbar em movimento (scrub visível sobre a imagem)
    var gx = w * (0.12 + p * 0.72);
    var gy = h * (0.72 - Math.sin(p * Math.PI) * 0.28) + Math.sin(t * 0.5) * 6;
    var rad = Math.max(w, h) * (0.34 + p * 0.26);
    var rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
    rg.addColorStop(0, hexA(accent, 0.12 + p * 0.10));
    rg.addColorStop(0.5, hexA(accent, 0.03));
    rg.addColorStop(1, hexA(accent, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
    // 4. motivo estrutural (scrub), discreto sobre a foto
    ctx.save();
    ctx.globalAlpha = 0.4;
    drawMotif(ctx, w, h, p, accent, t);
    ctx.restore();
    // 5. grão
    if (noiseTile) {
      ctx.save();
      ctx.globalAlpha = 0.035;
      var pat = ctx.createPattern(noiseTile, 'repeat');
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    }
    // 6. vinheta
    var vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  function renderChapter(chapter, t) {
    var cv = chapter.canvas, ctx = chapter.ctx;
    if (!cv || !ctx) return;
    var w = cv.width, h = cv.height;
    var p = Math.max(0, Math.min(1, chapter.progress || 0));
    // Caminho de vídeo/quadros gerados (drop-in). Fallback: pôster real → placeholder.
    if (chapter.useFrames && chapter.frames && chapter.frameCount > 0) {
      var idx = Math.round(p * (chapter.frameCount - 1));
      var img = chapter.frames[idx];
      if (img && img.complete && drawFrameImage(ctx, w, h, img)) return;
    }
    // Pôster real (imagem de referência) como base + scrim cinematográfico.
    if (chapter.posterImg && chapter.posterImg.complete && chapter.posterImg.naturalWidth) {
      renderPosterBackdrop(ctx, w, h, p, chapter, t);
      return;
    }
    renderPlaceholder(ctx, w, h, p, chapter, t);
  }

  function initFrameLoader(chapter) {
    chapter.useFrames = false;
    if (!chapter.frameCount || chapter.frameCount < 1) return;
    chapter.frames = [];
    for (var i = 1; i <= chapter.frameCount; i++) {
      var img = new Image();
      var name = ('0000' + i).slice(-4) + '.jpg';
      if (i === 1) {
        img.onload = function () { chapter.useFrames = true; };
        img.onerror = function () { chapter.useFrames = false; };
      }
      img.src = chapter.framesDir + name;
      chapter.frames.push(img);
    }
  }

  // Carrega uma imagem-pôster real para o capítulo (base do canvas). Ao concluir,
  // re-renderiza o capítulo para que os modos de desenho único (leve/estático)
  // também exibam a imagem, e sinaliza o CSS para ocultar a silhueta-placeholder.
  function initPosterLoader(chapter) {
    if (!chapter.poster) return;
    var img = new Image();
    img.onload = function () {
      chapter.posterImg = img;
      root.classList.add('hero-has-poster');
      if (chapter.canvas && chapter.ctx) {
        try { sizeCanvas(chapter); renderChapter(chapter, performance.now() / 1000); } catch (e) {}
      }
    };
    img.onerror = function () { chapter.posterImg = null; };
    img.src = chapter.poster;
  }

  function sizeCanvas(chapter) {
    var cv = chapter.canvas;
    if (!cv) return;
    var rect = cv.getBoundingClientRect();
    var w = Math.max(1, Math.round((rect.width || window.innerWidth) * DPR));
    var h = Math.max(1, Math.round((rect.height || window.innerHeight) * DPR));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }

  /* ============================================================
     4. INICIALIZAÇÃO DOS CAPÍTULOS / MODOS
     ============================================================ */
  function collectChapters() {
    CHAPTERS.forEach(function (ch) {
      ch.canvas = document.querySelector('canvas[data-canvas="' + ch.id + '"]');
      ch.ctx = ch.canvas ? ch.canvas.getContext('2d') : null;
      ch.section = ch.canvas ? ch.canvas.closest('.chapter') : null;
      ch.progress = ch.id === 'hero' ? 0.12 : 0.5; // poster inicial agradável
      ch.visible = false;
      initFrameLoader(ch);
      initPosterLoader(ch);
    });
  }

  function renderPosterAll() {
    buildNoise();
    var t = performance.now() / 1000;
    CHAPTERS.forEach(function (ch) {
      if (!ch.canvas) return;
      sizeCanvas(ch);
      renderChapter(ch, t);
    });
  }

  // rAF loop (modo cinematográfico): renderiza apenas capítulos visíveis
  var rafId = null;
  function startRenderLoop() {
    function frame() {
      var t = performance.now() / 1000;
      for (var i = 0; i < CHAPTERS.length; i++) {
        var ch = CHAPTERS[i];
        if (ch.canvas && ch.visible) renderChapter(ch, t);
      }
      rafId = requestAnimationFrame(frame);
    }
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  // Fade-in simples para conteúdo (modo leve/estático) via IntersectionObserver
  function initContentFades() {
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('.section .container');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) { el.classList.add('in-view-fade'); io.observe(el); });
  }

  /* ---------- Modo CINEMATOGRÁFICO completo ---------- */
  function initCinematic() {
    root.classList.add('cinematic-on');
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;
    gsap.registerPlugin(ScrollTrigger);

    // Lenis smooth-scroll sincronizado com ScrollTrigger
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true, gestureOrientation: 'vertical' });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    collectChapters();
    buildNoise();
    CHAPTERS.forEach(function (ch) { if (ch.canvas) sizeCanvas(ch); });
    startRenderLoop();

    CHAPTERS.forEach(function (ch, index) {
      if (!ch.section) return;
      var pin = ch.section.querySelector('.chapter-pin');
      var reveals = ch.section.querySelectorAll('.reveal');

      // Pin + scrub do canvas (progresso 0→1 dirige o renderer do canvas).
      ScrollTrigger.create({
        trigger: ch.section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        pin: pin,
        anticipatePin: 1,
        onToggle: function (self) { ch.visible = self.isActive; },
        onUpdate: function (self) { ch.progress = self.progress; }
      });

      // Entrada do texto: por TEMPO (gsap.from), legível assim que o capítulo
      // entra em cena — inclusive o Hero, visível já no carregamento.
      if (reveals.length) {
        var playIn = function () {
          gsap.from(reveals, { opacity: 0, y: 34, duration: 0.7, stagger: 0.06, ease: 'power2.out', overwrite: 'auto' });
        };
        ch._playIn = playIn;
        if (index === 0) {
          playIn(); // Hero: revela imediatamente (já em cena no carregamento)
        } else {
          ScrollTrigger.create({ trigger: ch.section, start: 'top 78%', once: true, onEnter: playIn });
        }
        // Fade-OUT do texto no trecho final do pin. immediateRender:false evita
        // que o tween capture a opacidade durante a entrada (que o deixava em 0).
        gsap.to(reveals, {
          opacity: 0, y: -28, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: ch.section, start: '75% bottom', end: 'bottom bottom', scrub: true }
        });
      }
      ch.visible = true; // renderiza pelo menos uma vez
    });

    // Barra de progresso da jornada
    var bar = document.getElementById('scroll-progress-bar');
    if (bar) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) { bar.style.width = (self.progress * 100).toFixed(1) + '%'; }
      });
    }

    window.addEventListener('resize', debounce(function () {
      CHAPTERS.forEach(function (ch) { if (ch.canvas) sizeCanvas(ch); });
      ScrollTrigger.refresh();
    }, 200));

    // primeiro desenho
    var t0 = performance.now() / 1000;
    CHAPTERS.forEach(function (ch) { if (ch.canvas) renderChapter(ch, t0); });
    ScrollTrigger.refresh();
  }

  /* ---------- Modo LEVE (mobile) ---------- */
  function initLight() {
    root.classList.add('light-stage');
    collectChapters();
    renderPosterAll();
    initContentFades();
    window.addEventListener('resize', debounce(renderPosterAll, 250));
  }

  /* ---------- Modo ESTÁTICO (reduced-motion / sem libs) ---------- */
  function initStatic() {
    root.classList.add('static-stage');
    collectChapters();
    renderPosterAll();
    window.addEventListener('resize', debounce(renderPosterAll, 250));
  }

  function debounce(fn, ms) {
    var id;
    return function () { clearTimeout(id); id = setTimeout(fn, ms); };
  }

  /* ============================================================
     5. BOOT
     ============================================================ */
  function boot() {
    initLang();
    setYear();
    initScrollSpy();
    initMobileMenu();
    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var small = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    var hasLibs = window.gsap && window.ScrollTrigger && window.Lenis;

    try {
      if (!hasLibs || reduced) {
        initStatic();
      } else if (small) {
        initLight();
      } else {
        initCinematic();
      }
    } catch (err) {
      // Degradação graciosa: garante conteúdo visível se algo falhar.
      if (window.console) console.warn('Cinematic init falhou, usando modo estático:', err);
      root.classList.remove('cinematic-on');
      try { initStatic(); } catch (e2) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
