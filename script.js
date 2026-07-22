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
     1. IDIOMA (PT / EN / ES)  — seletor de 3 idiomas
     ------------------------------------------------------------
     setLang(lang) aplica data-<lang> a todo elemento com data-pt.
     Se o elemento não tiver data-<lang> (ex.: seções ainda sem tradução
     em espanhol), cai graciosamente para data-pt — o site nunca fica em
     branco. Usa innerHTML (preservado do original) porque alguns valores
     guardam HTML escapado (links de consentimento/LGPD). O <html lang>
     recebe pt-BR / en / es e a escolha é persistida em localStorage.
     ============================================================ */
  var LANGS = ['pt', 'en', 'es'];
  var HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };

  function normalizeLang(lang) {
    return LANGS.indexOf(lang) !== -1 ? lang : 'pt';
  }
  // Idioma corrente derivado do <html lang> (pt-BR→pt).
  function currentLang() {
    var l = root.getAttribute('lang');
    if (l === 'en') return 'en';
    if (l === 'es') return 'es';
    return 'pt';
  }

  function applyLang(lang) {
    lang = normalizeLang(lang);
    root.setAttribute('lang', HTML_LANG[lang]);
    var nodes = document.querySelectorAll('[data-pt]');
    Array.prototype.forEach.call(nodes, function (el) {
      var value = el.getAttribute('data-' + lang);
      // Fallback para português quando não houver tradução no idioma pedido.
      if (value === null) value = el.getAttribute('data-pt');
      if (value !== null) el.innerHTML = value;
    });
    // Atualiza o seletor segmentado (PT · EN · ES).
    var opts = document.querySelectorAll('.lang-opt');
    Array.prototype.forEach.call(opts, function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    applyLang(normalizeLang(saved));
  }
  function setLang(lang) {
    lang = normalizeLang(lang);
    applyLang(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
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

  /* ---------- Formulário de lead (isca gratuita) ----------
     Site estático (sem back-end). O formulário está conectado ao Formspree
     (action="https://formspree.io/f/mvzeqdwk"). Aprimoramento progressivo:
       - Com JS: intercepta o submit, valida o e-mail e envia via fetch (AJAX).
         No sucesso, oculta o formulário e revela o DOWNLOAD do guia gratuito.
         No erro, mostra mensagem bilíngue e mantém o formulário para nova tentativa.
       - Sem JS: o <form> envia por POST nativo ao Formspree normalmente.
     Tudo embrulhado em try/catch para nunca gerar erros de console. */
  function initLeadForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;
    var status = document.getElementById('lead-status');
    var success = document.getElementById('lead-success');
    var email = document.getElementById('lead-email');
    var lang = currentLang;
    // Seleciona a string do idioma corrente (com fallback para PT).
    var t = function (map) { return map[lang()] || map.pt; };

    function say(msg, isError) {
      if (!status) return;
      status.hidden = false;
      status.textContent = msg;
      status.classList.toggle('lead-status-error', !!isError);
    }

    function showSuccess() {
      // Oculta o formulário e revela a mensagem de sucesso + botão de download.
      form.hidden = true;
      form.style.display = 'none';
      if (status) { status.hidden = true; status.textContent = ''; }
      if (success) {
        success.hidden = false;
        try { success.focus && success.focus(); } catch (e) {}
      }
    }

    form.addEventListener('submit', function (e) {
      // Validação client-side graciosa (o atributo required cobre o e-mail).
      var valid = email && email.value && /.+@.+\..+/.test(email.value);
      if (!valid) {
        e.preventDefault();
        if (email) email.classList.add('lead-invalid');
        say(t({
          pt: 'Informe um e-mail válido para receber o guia.',
          en: 'Please enter a valid email to receive the guide.',
          es: 'Introduce un correo electrónico válido para recibir la guía.'
        }), true);
        if (email) email.focus();
        return;
      }
      if (email) email.classList.remove('lead-invalid');

      var action = form.getAttribute('action') || '';
      // Sem fetch (navegador muito antigo): deixa o POST nativo acontecer.
      if (!window.fetch || !action) return;

      // Aprimoramento progressivo: envia via AJAX e revela o guia no sucesso.
      e.preventDefault();
      say(t({ pt: 'Enviando…', en: 'Sending…', es: 'Enviando…' }), false);
      var errMsg = {
        pt: 'Ocorreu um erro ao enviar. Tente novamente ou escreva para rdgcdasilva@gmail.com.',
        en: 'An error occurred while sending. Please try again or write to rdgcdasilva@gmail.com.',
        es: 'Ocurrió un error al enviar. Inténtalo de nuevo o escribe a rdgcdasilva@gmail.com.'
      };
      try {
        fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (res && res.ok) {
            showSuccess();
          } else {
            say(t(errMsg), true);
          }
        }).catch(function () {
          say(t(errMsg), true);
        });
      } catch (err) {
        say(t(errMsg), true);
      }
    });
  }

  /* ============================================================
     1b. CONSENTIMENTO DE ANALYTICS (LGPD) + carregamento do GA4
     ------------------------------------------------------------
     O Google Analytics 4 só é carregado APÓS o consentimento explícito
     do usuário ("Aceitar"). A escolha é salva em localStorage e respeitada
     em visitas futuras (o banner não reaparece). Sem consentimento — ou com
     "Recusar" — o GA NÃO é carregado (nenhum cookie de análise é gravado).

     Dependency-free: não quebra se o ID-placeholder permanecer — o gtag com um
     ID falso simplesmente não reporta (sem erros que travem a página).

     >>> ALTERNATIVA SEM COOKIES (Plausible) <<<
     Se preferir métricas sem cookies e sem banner de consentimento, use o
     Plausible Analytics (https://plausible.io): basta uma única tag
     <script defer data-domain="SEU_DOMINIO" src="https://plausible.io/js/script.js"></script>
     no <head>. Ele não usa cookies nem coleta dados pessoais — dispensando o
     consentimento — e você pode remover este banner e o bloco GA abaixo.
     ============================================================ */
  var CONSENT_KEY = 'rs-analytics-consent';
  // ID real do Google Analytics 4 (GA4) do site.
  var GA_MEASUREMENT_ID = 'G-3XJ5YN4QRW';
  var gaLoaded = false;

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    // Injeta dinamicamente o snippet gtag oficial do GA4.
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    // Se a rede/ID falhar, apenas ignora — não quebra a página.
    s.onerror = function () {};
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function initConsent() {
    var banner = document.getElementById('consent-banner');
    if (!banner) return;

    var choice = null;
    try { choice = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (choice === 'accepted') { loadGA(); return; } // já consentiu: carrega, sem mostrar banner
    if (choice === 'declined') { return; }           // já recusou: não carrega nem mostra

    // Sem decisão ainda (primeira visita): mostra o banner.
    banner.hidden = false;
    // reflow → garante a transição de entrada (slide-up)
    void banner.offsetHeight;
    banner.classList.add('is-visible');

    function close() {
      banner.classList.remove('is-visible');
      banner.hidden = true;
    }

    var accept = document.getElementById('consent-accept');
    var decline = document.getElementById('consent-decline');

    if (accept) accept.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
      loadGA();
      close();
    });
    if (decline) decline.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch (e) {}
      close();
    });
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
  // Opção A: fundos limpos sem pessoas. Trocar para false quando os clipes de ambiente vazio (sem figuras) estiverem prontos.
  var USE_CLEAN_PLACEHOLDER = true;

  var CHAPTERS = [
    { id: 'hero',        title: 'O que move as pessoas',    framesDir: 'assets/frames/hero/',        frameCount: 0, accent: '#f5b301', poster: 'assets/frames/hero/poster.png' },
    { id: 'fluxo',       title: 'Workforce Design & Dados', framesDir: 'assets/frames/fluxo/',       frameCount: 0, accent: '#f5b301', poster: 'assets/frames/fluxo/poster.png' },
    { id: 'acolhimento', title: 'Hospitalidade Org.',       framesDir: 'assets/frames/acolhimento/', frameCount: 0, accent: '#f6c343', poster: 'assets/frames/acolhimento/poster.png' },
    { id: 'rigor',       title: 'Da Academia ao Mercado',   framesDir: 'assets/frames/rigor/',       frameCount: 0, accent: '#f5b301', poster: 'assets/frames/rigor/poster.png' },
    { id: 'final',       title: 'Impacto',                  framesDir: 'assets/frames/final/',       frameCount: 0, accent: '#f6c343', poster: 'assets/frames/final/poster.png' }
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
    // Opção A: fundos limpos sem pessoas — não carrega nenhum pôster (todos
    // contêm a figura). Mantém o placeholder-gradiente como fundo do capítulo.
    if (USE_CLEAN_PLACEHOLDER) return;
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

  /* ---------- Backdrop de vídeo do capítulo (clipe Higgsfield) ----------
     Só é chamado no modo cinematográfico (desktop). Injeta o src (o HTML usa
     data-src + preload=none para não baixar em mobile/reduced-motion) e faz
     SCRUB: dirige video.currentTime pelo progresso (0→duração) do ScrollTrigger
     do capítulo. Se os metadados não carregarem ou o vídeo falhar, cai no poster
     (canvas por baixo) — nunca um quadro em branco.

     O MESMO padrão do Hero é replicado para todos os capítulos com vídeo
     (fluxo, acolhimento, rigor, final): cada <video data-chapter-video> vive
     dentro da própria seção e é dirigido pelo progresso do seu ScrollTrigger. */
  function initChapterVideo(chapter) {
    // Opção A: fundos limpos sem pessoas — não ativa/toca nenhum vídeo (todos
    // contêm a figura). O <video> fica inerte (preload=none, sem src).
    if (USE_CLEAN_PLACEHOLDER) return;
    if (!chapter || !chapter.section) return;
    var vid = chapter.section.querySelector('video[data-chapter-video]');
    if (!vid) return;
    chapter.video = vid;
    chapter.videoReady = false;
    chapter.videoDuration = 0;

    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.loop = false;
    chapter.videoLoop = false;

    // Fallback: se o scrub não funcionar (host sem suporte a Range → vídeo não
    // "seekable", ou seek travado), toca em loop mudo. Garante movimento
    // cinematográfico em qualquer hospedagem, sem quadro preto.
    function startLoopFallback() {
      if (chapter.videoLoop || !chapter.video) return;
      chapter.videoLoop = true;
      try {
        vid.loop = true;
        vid.muted = true;
        vid.currentTime = 0;
        var pr = vid.play();
        if (pr && pr.catch) pr.catch(function () {});
      } catch (e) {}
    }

    vid.addEventListener('loadedmetadata', function () {
      chapter.videoDuration = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
      chapter.videoReady = true;
      try { vid.pause(); vid.currentTime = 0; } catch (e) {}
    });
    // Só revela o vídeo quando há um quadro decodificado (evita frame preto);
    // o poster/canvas por baixo cobre qualquer intervalo até aqui.
    var reveal = function () {
      if (!chapter.video) return;
      vid.classList.add('is-on');
      if (chapter.section) chapter.section.classList.add('chapter-video-on');
      if (typeof chapter.videoScrub === 'function') chapter.videoScrub(chapter.progress || 0);
    };
    vid.addEventListener('loadeddata', reveal);
    vid.addEventListener('seeked', reveal);
    // Erro só dispara quando NENHUM <source> é decodificável: mantém o poster.
    vid.addEventListener('error', function () {
      vid.classList.remove('is-on');
      if (chapter.section) chapter.section.classList.remove('chapter-video-on');
      chapter.videoReady = false;
      chapter.video = null;
    });

    // Scrub: currentTime dirigido pelo progresso do scroll. Se o primeiro seek
    // significativo não "pegar" (host sem Range), aciona o loop mudo.
    chapter.videoScrub = function (p) {
      if (chapter.videoLoop || !chapter.videoReady || !chapter.video) return;
      var d = chapter.videoDuration || vid.duration || 0;
      if (!d) return;
      var pp = Math.max(0, Math.min(1, p || 0));
      var target = Math.min(d - 0.04, pp * d);
      if (target < 0) target = 0;
      // Sonda de seekability: no 1º scrub relevante, confere 600ms depois se o
      // currentTime realmente avançou; se não, cai para o loop mudo.
      if (target > 0.2 && !chapter._seekProbed) {
        chapter._seekProbed = true;
        setTimeout(function () {
          if (!chapter.videoLoop && chapter.video && (vid.currentTime || 0) < 0.05) {
            startLoopFallback();
          }
        }, 600);
      }
      if (Math.abs((vid.currentTime || 0) - target) > 0.015) {
        try { vid.currentTime = target; } catch (e) {}
      }
    };

    // Inicia o download só agora (desktop cinematográfico): ativa os <source>
    // (mp4 preferido; webm como alternativa de codec) trocando data-src→src.
    var sources = vid.querySelectorAll('source[data-src]');
    var activated = false;
    Array.prototype.forEach.call(sources, function (s) {
      if (!s.getAttribute('src')) { s.setAttribute('src', s.getAttribute('data-src')); activated = true; }
    });
    if (activated) {
      vid.preload = 'auto';
      try { vid.load(); } catch (e) {}
    }
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

    // Backdrop de vídeo por capítulo (scrub por scroll). Só no desktop
    // cinematográfico. Cada capítulo que tiver um <video data-chapter-video>
    // dentro da sua seção passa a ter o clipe dirigido pelo scroll.
    CHAPTERS.forEach(function (ch) { initChapterVideo(ch); });

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
        onUpdate: function (self) {
          ch.progress = self.progress;
          // Hero: dirige o currentTime do vídeo pelo progresso do scroll.
          if (ch.videoScrub) ch.videoScrub(self.progress);
        }
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

  /* ---------- Backdrop de vídeo do capítulo no MOBILE ----------
     Diferente do desktop (scrub por scroll, que é "janky" no celular), aqui
     o clipe roda como pano de fundo AUTOPLAY, MUDO e em LOOP (playsinline),
     suave em telas pequenas. O pôster (atributo poster + canvas por baixo)
     garante 1º paint instantâneo e fallback se o vídeo não puder tocar.

     Performance: NADA é baixado até o capítulo se aproximar da viewport. Um
     IntersectionObserver (rootMargin ~200px) ativa os <source> (data-src→src),
     dá load()+play() ao entrar e pause() ao sair — poupando bateria/CPU e
     mantendo só 1–2 vídeos tocando por vez. */
  function initChapterVideoMobile(chapter) {
    if (!chapter || !chapter.section) return;
    var vid = chapter.section.querySelector('video[data-chapter-video]');
    if (!vid) return;
    chapter.video = vid;

    // Backdrop mudo, em loop, inline — requisitos de autoplay em mobile.
    vid.muted = true;
    vid.defaultMuted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.setAttribute('muted', '');
    vid.setAttribute('loop', '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('autoplay', '');
    vid.removeAttribute('controls');

    chapter._srcActivated = false;
    function activateSources() {
      if (chapter._srcActivated) return;
      var sources = vid.querySelectorAll('source[data-src]');
      var activated = false;
      Array.prototype.forEach.call(sources, function (s) {
        if (!s.getAttribute('src')) { s.setAttribute('src', s.getAttribute('data-src')); activated = true; }
      });
      if (activated || sources.length) {
        chapter._srcActivated = true;
        vid.preload = 'auto';
        try { vid.load(); } catch (e) {}
      }
    }

    // Só revela o vídeo quando há um quadro decodificado (evita frame preto);
    // o poster/canvas por baixo cobre qualquer intervalo até aqui.
    var reveal = function () {
      if (!chapter.video) return;
      vid.classList.add('is-on');
      chapter.section.classList.add('chapter-video-on');
    };
    vid.addEventListener('loadeddata', reveal);
    vid.addEventListener('playing', reveal);
    // Erro (nenhum <source> decodificável): mantém o poster estático.
    vid.addEventListener('error', function () {
      vid.classList.remove('is-on');
      chapter.section.classList.remove('chapter-video-on');
    });

    chapter._mobilePlay = function () {
      activateSources();
      try {
        var pr = vid.play();
        // Autoplay bloqueado → mantém o poster (canvas) por baixo, sem quadro preto.
        if (pr && pr.catch) pr.catch(function () {});
      } catch (e) {}
    };
    chapter._mobilePause = function () {
      try { vid.pause(); } catch (e) {}
    };
  }

  function initMobileVideoBackdrops() {
    // Opção A: fundos limpos sem pessoas — no mobile também não ativa/toca
    // nenhum vídeo. Mantém apenas os placeholders-gradiente já renderizados.
    if (USE_CLEAN_PLACEHOLDER) return;
    CHAPTERS.forEach(initChapterVideoMobile);

    if (!('IntersectionObserver' in window)) {
      // Sem IO: ativa todos (degradação graciosa; ainda mudo/loop/inline).
      CHAPTERS.forEach(function (ch) { if (ch._mobilePlay) ch._mobilePlay(); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var ch = e.target._chapterRef;
        if (!ch) return;
        if (e.isIntersecting) { if (ch._mobilePlay) ch._mobilePlay(); }
        else { if (ch._mobilePause) ch._mobilePause(); }
      });
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0.01 });
    CHAPTERS.forEach(function (ch) {
      if (ch.section && ch.video) { ch.section._chapterRef = ch; io.observe(ch.section); }
    });
  }

  /* ---------- Modo LEVE (mobile) ----------
     O celular agora exibe o MESMO fundo animado do desktop: o placeholder
     limpo grafite→âmbar (sem figuras/pessoas), que se MOVE conforme o scroll.
     Em vez do pin+scrub do ScrollTrigger (pesado no celular), calculamos o
     progresso de cada capítulo pela posição da seção na viewport e desenhamos
     num loop rAF leve — só os capítulos visíveis renderizam. reduced-motion
     nunca chega aqui (vai para initStatic), então respeitamos a preferência. */
  function initLight() {
    root.classList.add('light-stage');
    // Performance: no celular capamos o DPR (telas de dpr 3 gerariam canvases
    // enormes). 1.5 mantém nitidez suficiente sem travar o scroll.
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    collectChapters();
    buildNoise();
    CHAPTERS.forEach(function (ch) { if (ch.canvas) sizeCanvas(ch); });
    initContentFades();

    // Progresso 0→1 de cada capítulo a partir da posição da seção na viewport
    // (0 = seção entrando por baixo; 1 = seção saindo por cima). Dirige o
    // "scrub" do gradiente sem depender do ScrollTrigger.
    function updateProgress() {
      var vh = window.innerHeight || 1;
      for (var i = 0; i < CHAPTERS.length; i++) {
        var ch = CHAPTERS[i];
        if (!ch.section) continue;
        var rect = ch.section.getBoundingClientRect();
        var total = rect.height + vh;
        var p = total > 0 ? (vh - rect.top) / total : 0;
        ch.progress = p < 0 ? 0 : (p > 1 ? 1 : p);
      }
    }

    // Só renderiza capítulos próximos/visíveis (poupa CPU e bateria).
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var ch = e.target._lightRef;
          if (ch) ch.visible = e.isIntersecting;
        });
      }, { rootMargin: '150px 0px 150px 0px', threshold: 0.01 });
      CHAPTERS.forEach(function (ch) {
        ch.visible = false;
        if (ch.section && ch.canvas) { ch.section._lightRef = ch; io.observe(ch.section); }
      });
    } else {
      CHAPTERS.forEach(function (ch) { ch.visible = true; });
    }

    updateProgress();

    // Loop rAF leve: o tempo (t) dá vida contínua e sutil ao gradiente; o
    // scroll atualiza o progresso (recalculado só quando há scroll/resize,
    // evitando getBoundingClientRect a cada quadro → sem layout thrash).
    var scrollDirty = true;
    function frame() {
      if (scrollDirty) { updateProgress(); scrollDirty = false; }
      var t = performance.now() / 1000;
      for (var i = 0; i < CHAPTERS.length; i++) {
        var ch = CHAPTERS[i];
        if (ch.canvas && ch.visible) renderChapter(ch, t);
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', function () { scrollDirty = true; }, { passive: true });
    requestAnimationFrame(frame);

    window.addEventListener('resize', debounce(function () {
      CHAPTERS.forEach(function (ch) { if (ch.canvas) sizeCanvas(ch); });
      scrollDirty = true;
    }, 250));
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
    // Opção A: fundos limpos sem pessoas — sinaliza o CSS para ocultar a
    // silhueta-figura do Hero e os <video> inertes dos capítulos.
    if (USE_CLEAN_PLACEHOLDER) root.classList.add('clean-placeholder');
    initLang();
    setYear();
    initConsent();
    initScrollSpy();
    initMobileMenu();
    initLeadForm();
    var langOpts = document.querySelectorAll('.lang-opt');
    Array.prototype.forEach.call(langOpts, function (btn) {
      btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
    });

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
