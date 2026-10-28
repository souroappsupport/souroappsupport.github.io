/* Souro Vault - privacy site. Small enhancements only; every page works without this file. */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "sv-theme";

  function readTheme() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: ignore */ } }
  function systemDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return systemDark() ? "dark" : "light";
  }

  var saved = readTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  /* Theme toggle */
  var toggle = document.querySelector(".theme-toggle");
  function labelToggle() {
    if (!toggle) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.setAttribute("title", "Switch to " + next + " theme");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      saveTheme(next);
      labelToggle();
    });
    labelToggle();
  }

  /* Contents: open on wide screens, folded on phones */
  var tocDetails = document.querySelector(".toc details");
  var wide = window.matchMedia ? window.matchMedia("(min-width: 1000px)") : null;
  function syncToc() { if (tocDetails && wide) tocDetails.open = wide.matches; }
  if (tocDetails && wide) {
    syncToc();
    if (wide.addEventListener) wide.addEventListener("change", syncToc);
    else if (wide.addListener) wide.addListener(syncToc);
    tocDetails.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a") && !wide.matches) tocDetails.open = false;
    });
  }

  /* Highlight the section being read */
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  var pairs = [];
  links.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));
    if (s) pairs.push({ section: s, link: a });
  });
  if (pairs.length && "IntersectionObserver" in window) {
    var visible = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = visible.indexOf(e.target);
        if (e.isIntersecting && i < 0) visible.push(e.target);
        if (!e.isIntersecting && i >= 0) visible.splice(i, 1);
      });
      var current = null;
      for (var k = 0; k < pairs.length; k++) {
        if (visible.indexOf(pairs[k].section) >= 0) { current = pairs[k]; break; }
      }
      if (!current) return;
      links.forEach(function (l) { l.removeAttribute("aria-current"); });
      current.link.setAttribute("aria-current", "location");
    }, { rootMargin: "-80px 0px -55% 0px" });
    pairs.forEach(function (p) { io.observe(p.section); });
  }

  /* Back to top */
  var top = document.querySelector(".to-top");
  if (top) {
    var onScroll = function () { top.classList.toggle("show", window.scrollY > 900); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
      var skip = document.querySelector(".brand");
      if (skip) skip.focus({ preventScroll: true });
    });
  }
})();
