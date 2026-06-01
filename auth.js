// auth.js — include this on every page
// Handles: show user name in nav, logout, redirect if already logged in

(function () {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // If on sign.html and already logged in → go to home
  if (window.location.pathname.includes("sign.html") && user && token) {
    window.location.replace("home.html");
    return;
  }

  // Update nav auth element on all pages
  function updateAuthNav() {
    const nav = document.getElementById("authNav");
    if (!nav) return;

    if (user && token) {
      const firstName = user.name ? user.name.split(" ")[0] : "User";
      nav.innerHTML = `
        <span id="userMenuToggle" style="color:#e50914;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
          👤 ${firstName} ▾
        </span>
        <div id="userDropdown" style="
          display:none;position:absolute;right:10px;top:50px;
          background:#fff;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.15);
          min-width:160px;z-index:999;overflow:hidden;
        ">
          <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:0.85rem;color:#888;">${user.email || ""}</div>
          <a href="home.html" style="display:block;padding:10px 16px;color:#333;text-decoration:none;font-size:0.9rem;">🏠 Home</a>
          <a href="#" onclick="showtixLogout()" style="display:block;padding:10px 16px;color:#e50914;text-decoration:none;font-size:0.9rem;">🚪 Logout</a>
        </div>
      `;
      nav.style.position = "relative";

      document.getElementById("userMenuToggle").addEventListener("click", function (e) {
        e.stopPropagation();
        const dd = document.getElementById("userDropdown");
        dd.style.display = dd.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", function () {
        const dd = document.getElementById("userDropdown");
        if (dd) dd.style.display = "none";
      });
    } else {
      nav.innerHTML = `<a href="sign.html" style="color:#fff;text-decoration:none;font-weight:500;">Sign In</a>`;
    }
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateAuthNav);
  } else {
    updateAuthNav();
  }

  // Global logout function
  window.showtixLogout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "sign.html";
  };
})();
