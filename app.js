/* UI: tap two angles -> classify via AnglesLogic + data.json. Vanilla JS, offline. */
(function () {
  "use strict";

  var DATA = null;
  var chosen = [];
  var THEME_KEY = "angles-theme";

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function loadData() {
    return fetch("data.json")
      .then(function (r) {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .catch(function () {
        // Offline file:// fallback: embedded copy in index.html (canonical: www/data.json)
        var el = document.getElementById("angles-data-fallback");
        return JSON.parse(el.textContent);
      });
  }

  function getTheme() {
    try { return localStorage.getItem(THEME_KEY) || "light"; }
    catch (e) { return "light"; }
  }

  function setTheme(t) {
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
    var b = $("#themeToggle");
    if (b) b.textContent = (t === "dark") ? "الوضع الفاتح" : "الوضع الداكن";
  }

  function renderSelection() {
    var box = $("#selection");
    if (chosen.length === 0) box.textContent = "لم تُختر أي زاوية بعد.";
    else if (chosen.length === 1) box.textContent = "الزاوية المختارة: " + chosen[0] + " — اختر زاوية ثانية.";
    else box.textContent = "الزاويتان: " + chosen[0] + " و " + chosen[1];
  }

  function paintAngles() {
    $all(".angle").forEach(function (g) {
      var n = g.getAttribute("data-angle");
      g.classList.toggle("selected", chosen.length === 1 && chosen[0] === n);
      g.classList.toggle("paired", chosen.length === 2 && chosen.indexOf(n) !== -1);
    });
  }

  function showResult() {
    var box = $("#result");
    if (chosen.length < 2) {
      box.className = "";
      box.textContent = "";
      return;
    }
    var out = window.AnglesLogic.classifyPair(chosen[0], chosen[1], DATA);
    if (out.kind === "relation") {
      box.className = "ok";
      box.textContent = "الزاوية " + chosen[0] + " والزاوية " + chosen[1] + ": " + out.relation;
    } else if (out.kind === "error") {
      box.className = "err";
      box.textContent = "خطأ: " + out.error;
    } else {
      box.className = "info";
      box.textContent = out.message;
    }
  }

  function tap(n) {
    n = String(n);
    if (chosen.length === 2) chosen = [];
    if (chosen.length === 1 && chosen[0] === n) {
      chosen = []; // tapping the same angle again deselects
    } else {
      chosen.push(n);
    }
    renderSelection();
    paintAngles();
    showResult();
  }

  function reset() {
    chosen = [];
    renderSelection();
    paintAngles();
    showResult();
  }

  function init(data) {
    DATA = data;
    $all(".angle").forEach(function (g) {
      var n = g.getAttribute("data-angle");
      g.addEventListener("click", function () { tap(n); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(n); }
      });
    });
    $("#reset").addEventListener("click", reset);
    setTheme(getTheme());
    $("#themeToggle").addEventListener("click", function () {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });
    renderSelection();
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadData().then(init);
  });
})();
