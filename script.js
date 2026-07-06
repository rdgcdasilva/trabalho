/* ============================================================
   Rodrigo da Silva — Portfólio
   JavaScript sem dependências: tema, ano, links ativos, menu.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'rs-theme';
  var LANG_KEY = 'rs-lang';

  /* ---------- Idioma (PT/EN) ---------- */
  function applyLang(lang) {
    if (lang !== 'en') lang = 'pt';
    root.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');

    var nodes = document.querySelectorAll('[data-pt][data-en]');
    Array.prototype.forEach.call(nodes, function (el) {
      var value = el.getAttribute('data-' + lang);
      if (value !== null) el.textContent = value;
    });

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      // O botão mostra o idioma para o qual se pode alternar.
      btn.textContent = lang === 'en' ? 'PT' : 'EN';
      btn.setAttribute('aria-label',
        lang === 'en' ? 'Mudar para português' : 'Switch to English');
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
  }

  /* ---------- Tema (claro/escuro) ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      var prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  }

  /* ---------- Ano no rodapé ---------- */
  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Destaque do link ativo ao rolar ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    var sections = links
      .map(function (link) {
        var id = link.getAttribute('href').slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

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

  /* ---------- Fechar menu mobile ao clicar em um link ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    if (!toggle) return;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () { toggle.checked = false; });
    });
    // Permite acionar o hambúrguer com teclado (Enter/Espaço no <label>)
    var burger = document.querySelector('.nav-hamburger');
    if (burger) {
      burger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.checked = !toggle.checked;
        }
      });
    }
  }

  /* ---------- Inicialização ---------- */
  initTheme();

  document.addEventListener('DOMContentLoaded', function () {
    initLang();
    setYear();
    initScrollSpy();
    initMobileMenu();
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);
  });
})();
