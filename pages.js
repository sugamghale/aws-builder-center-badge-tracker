/* Small helpers for the guide, badges and FAQ pages: the mobile menu and collapsible
   sidebar groups. The tracker itself (app.js) has its own versions of these. */
(function () {
  var sidebar = document.querySelector(".sidebar");
  var menu = document.getElementById("mobile-menu");
  var shell = document.querySelector(".app-shell");

  function closeMenu() {
    if (!sidebar || !menu) return;
    sidebar.classList.remove("mobile-open");
    menu.setAttribute("aria-expanded", "false");
  }
  document.addEventListener("click", function (event) {
    var toggle = event.target.closest && event.target.closest("[data-nav-toggle]");
    if (toggle) {
      var group = toggle.closest(".nav-group");
      var open = group.classList.contains("is-collapsed");
      group.classList.toggle("is-collapsed", !open);
      toggle.setAttribute("aria-expanded", String(open));
      return;
    }
    if (menu && menu.contains(event.target)) {
      var willOpen = !sidebar.classList.contains("mobile-open");
      sidebar.classList.toggle("mobile-open", willOpen);
      menu.setAttribute("aria-expanded", String(willOpen));
      return;
    }
    if (shell && event.target === shell) closeMenu();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
})();
