/* Light/dark theme. Loaded in <head> so the right theme is applied before the page paints.
   The choice is kept under its own localStorage key, separate from the tracker data, so
   switching themes never touches saved progress or backups. Without a saved choice the
   theme follows the system setting. */
(function () {
  var KEY = "awsBuilderBadgeTracker.theme";
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function saved() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (e) {
      return null;
    }
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(theme === "dark"));
      buttons[i].setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }
  function current() {
    return saved() || (media && media.matches ? "dark" : "light");
  }

  apply(current());
  document.addEventListener("DOMContentLoaded", function () {
    apply(root.getAttribute("data-theme") || current());
  });
  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-theme-toggle]");
    if (!button) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {
      /* the choice just will not persist */
    }
    apply(next);
  });
  if (media && media.addEventListener) {
    media.addEventListener("change", function () {
      if (!saved()) apply(current());
    });
  }
})();
