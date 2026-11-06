(function () {
  var cfg = window.SITE_CONFIG || {};
  var repo = cfg.repo || "jayusop/SilkReed-Sax";
  var base = "https://github.com/" + repo;
  var branch = cfg.branch || "main";
  var links = {
    source:   base,
    releases: base + "/releases",
    download: base + "/releases/latest",
    issues:   base + "/issues",
    license:  base + "/blob/" + branch + "/LICENSE",
    notices:  base + "/blob/" + branch + "/THIRD_PARTY_NOTICES.md"
  };
  var texts = { source: base, clone: base + ".git", "repo-name": repo.split("/")[1] };

  document.querySelectorAll("[data-link]").forEach(function (a) {
    var href = links[a.getAttribute("data-link")];
    if (href) a.href = href;
  });
  document.querySelectorAll("[data-text]").forEach(function (el) {
    var t = texts[el.getAttribute("data-text")];
    if (t) el.textContent = t;
  });

  // ---- language toggle (remembers choice; defaults to browser language) ----
  var root = document.documentElement;
  var release = null;
  function showVersion() {
    var el = document.getElementById("ver");
    if (!el) return;
    var ko = root.getAttribute("data-lang") === "ko";
    if (release) {
      var d = new Date(release.published_at);
      var date = d.toLocaleDateString(ko ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
      el.textContent = (ko ? "최신 버전 " : "Latest ") + release.tag_name + " · " + date;
    } else {
      el.textContent = (ko ? "버전 " : "Version ") + (cfg.fallbackVersion || "");
    }
  }
  function setLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-set-lang") === l);
    });
    try { localStorage.setItem("srsax-lang", l); } catch (e) {}
    showVersion();
  }
  var saved = null;
  try { saved = localStorage.getItem("srsax-lang"); } catch (e) {}
  var nav = (navigator.language || "en").toLowerCase();
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
  });
  setLang(saved || (nav.indexOf("ko") === 0 ? "ko" : "en"));

  // ---- latest release from the GitHub API ----
  if (repo.indexOf("YOUR-ACCOUNT") !== 0 && window.fetch) {
    fetch("https://api.github.com/repos/" + repo + "/releases/latest")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.tag_name) return;
        release = j;
        showVersion();
        // Point the download button straight at the macOS zip/dmg/pkg if one is attached.
        var plugin = (j.assets || []).filter(function (a) { return /\.(zip|dmg|pkg)$/i.test(a.name) && !/source|src/i.test(a.name); })[0];
        if (plugin) document.querySelectorAll('[data-link="download"]').forEach(function (a) { a.href = plugin.browser_download_url; });
      })
      .catch(function () {});
  }

  // ---- copy buttons on code blocks ----
  document.querySelectorAll("pre").forEach(function (pre) {
    var b = document.createElement("button");
    b.className = "copy"; b.type = "button"; b.textContent = "copy";
    b.addEventListener("click", function () {
      var txt = pre.querySelector("code").innerText.split("\n")
        .filter(function (l) { return !/^\s*#/.test(l); }).join("\n").trim();
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () {
        b.textContent = "copied"; setTimeout(function () { b.textContent = "copy"; }, 1400);
      }).catch(function () {});
    });
    pre.appendChild(b);
  });
})();
