/* AVENZOTECH — interactions
   Modules: nav, reveal, counters, personalization, conversational form,
            consent controls, mail fallback, WhatsApp chat.
   No dependencies. Deferred, so it never blocks first paint. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- mobile nav ---------------- */
  var nav = $(".nav"), burger = $(".burger");
  if (nav && burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__links a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------------- scroll reveal ---------------- */
  var revealables = $$("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
        setTimeout(function () { entry.target.classList.add("in"); }, delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- counters ---------------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, target = parseFloat(el.getAttribute("data-count"));
        cObs.unobserve(el);
        if (reduced) { el.textContent = target; return; }
        var start = performance.now();
        (function step(now) {
          var p = Math.min(1, (now - start) / 1400);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------------- personalization ----------------
     Segments the visitor from URL intent params, referrer and local time,
     then swaps the hero lede and the featured discipline. Runs client-side
     and is announced in the UI — nothing is stored, nothing is shared. */

  var SEGMENTS = {
    ecommerce: {
      label: "E-commerce",
      lede: "Storefronts that survive a sale day. Headless commerce on Next.js with edge caching, sub-second product pages, and a checkout that stays fast when traffic multiplies.",
      cta: "Audit my storefront"
    },
    saas: {
      label: "SaaS",
      lede: "Multi-tenant products, built properly. Typed codebases, role-scoped data access, API-first architecture and CI pipelines your team can inherit on day one.",
      cta: "Scope my platform"
    },
    healthcare: {
      label: "Healthcare",
      lede: "Clinical-grade software discipline. Privacy-first architecture, granular consent, audit trails and access control designed to pass a compliance review, not just a demo.",
      cta: "Discuss compliance"
    },
    manufacturing: {
      label: "Manufacturing",
      lede: "Plant-floor reality, not showroom software. Offline-tolerant apps, edge AI on real hardware, and dashboards that make operational data usable by supervisors.",
      cta: "Talk to an engineer"
    },
    search: {
      label: "Search",
      lede: "You arrived from a search, so here is the short version: we build headless web platforms, cross-platform apps, applied AI and secure systems — and we hand over everything at the end.",
      cta: "See what we build"
    },
    social: {
      label: "Social",
      lede: "The work behind the posts: headless web platforms, cross-platform apps, edge AI and security engineering, shipped in two-week sprints from Vapi.",
      cta: "See the work"
    }
  };

  function detectSegment() {
    var qs = new URLSearchParams(location.search);
    var explicit = (qs.get("industry") || qs.get("utm_campaign") || "").toLowerCase();
    for (var key in SEGMENTS) { if (explicit.indexOf(key) > -1) return key; }
    var ref = document.referrer.toLowerCase();
    if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) return "search";
    if (/linkedin|instagram|facebook|twitter|x\.com|t\.co|youtube/.test(ref)) return "social";
    return null;
  }

  var persHost = $("[data-pers]");
  if (persHost) {
    var seg = detectSegment();
    var ribbon = $(".pers");
    if (seg && SEGMENTS[seg]) {
      var conf = SEGMENTS[seg];
      var lede = $("[data-pers-lede]");
      if (lede) lede.textContent = conf.lede;
      var cta = $("[data-pers-cta]");
      if (cta) cta.childNodes[0].nodeValue = conf.cta + " ";
      if (ribbon) {
        $("[data-pers-label]", ribbon).textContent = conf.label;
        ribbon.hidden = false;
        requestAnimationFrame(function () { ribbon.classList.add("in"); });
        $(".pers button", ribbon).addEventListener("click", function () {
          location.href = location.pathname;
        });
      }
    }
  }

  /* ---------------- conversational form ---------------- */
  var convo = $("[data-convo]");
  if (convo) {
    var STEPS = [
      { key: "service", q: "What do you need built?", hint: "Pick the closest fit — we'll refine it together.",
        type: "choice", options: ["UI/UX design", "Branding & graphics", "Website", "Mobile app", "ERP / CRM", "AI system", "Security work", "Not sure yet"] },
      { key: "stage", q: "Where is the project today?", hint: "This tells us how much discovery you need.",
        type: "choice", options: ["Just an idea", "Have a spec", "Rebuilding something", "Live and struggling"] },
      { key: "timeline", q: "When does it need to be live?", hint: "Honest answers get honest estimates.",
        type: "choice", options: ["ASAP", "1–3 months", "3–6 months", "Exploring only"] },
      { key: "budget", q: "What budget are you working with?", hint: "A range is fine. It changes what we recommend, not whether we reply.",
        type: "choice", options: ["Under ₹1L", "₹1L – ₹5L", "₹5L – ₹15L", "₹15L+", "Need guidance"] },
      { key: "message", q: "What's actually breaking?", hint: "A few lines. Constraints and deadlines are the useful part.",
        type: "textarea", placeholder: "e.g. Our booking site times out on weekends and we can't see why." },
      { key: "name", q: "Who are we replying to?", hint: "First name is enough.", type: "text", placeholder: "Your name" },
      { key: "email", q: "Where should the reply go?", hint: "We answer within two working days.", type: "email", placeholder: "you@company.com" }
    ];

    var answers = {}, idx = 0;
    var body = $(".convo__body", convo);
    var prog = $(".convo__prog i", convo);
    var counter = $("[data-convo-count]", convo);

    function render() {
      var step = STEPS[idx];
      prog.style.width = ((idx / STEPS.length) * 100) + "%";
      counter.textContent = "Question " + (idx + 1) + " of " + STEPS.length;

      var wrap = document.createElement("div");
      wrap.className = "convo__step";
      var h = document.createElement("p");
      h.className = "convo__q";
      h.textContent = step.q;
      wrap.appendChild(h);
      var hint = document.createElement("p");
      hint.className = "convo__hint";
      hint.textContent = step.hint;
      wrap.appendChild(hint);

      if (step.type === "choice") {
        var chips = document.createElement("div");
        chips.className = "chips";
        step.options.forEach(function (opt) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "chip";
          b.textContent = opt;
          b.addEventListener("click", function () { answers[step.key] = opt; next(); });
          chips.appendChild(b);
        });
        wrap.appendChild(chips);
      } else {
        var input = document.createElement(step.type === "textarea" ? "textarea" : "input");
        if (step.type !== "textarea") input.type = step.type;
        input.className = "";
        input.placeholder = step.placeholder || "";
        input.setAttribute("aria-label", step.q);
        input.value = answers[step.key] || "";
        var field = document.createElement("div");
        field.className = "field";
        field.appendChild(input);
        wrap.appendChild(field);

        var go = document.createElement("button");
        go.type = "button";
        go.className = "btn btn--solid";
        go.textContent = idx === STEPS.length - 1 ? "Send enquiry" : "Continue";
        go.addEventListener("click", function () {
          if (step.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) {
            hint.textContent = "That email doesn't look right — check it and try again.";
            input.focus();
            return;
          }
          if (!input.value.trim()) {
            hint.textContent = "Add an answer to continue.";
            input.focus();
            return;
          }
          answers[step.key] = input.value.trim();
          next();
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && step.type !== "textarea") { e.preventDefault(); go.click(); }
        });
        wrap.appendChild(go);
        setTimeout(function () { input.focus(); }, 60);
      }

      if (idx > 0) {
        var foot = document.createElement("div");
        foot.className = "convo__foot";
        var back = document.createElement("button");
        back.type = "button";
        back.className = "convo__back";
        back.textContent = "← Back";
        back.addEventListener("click", function () { idx--; render(); });
        foot.appendChild(back);
        wrap.appendChild(foot);
      }

      body.innerHTML = "";
      body.appendChild(wrap);
      body.setAttribute("aria-live", "polite");
    }

    function next() {
      if (idx < STEPS.length - 1) { idx++; render(); }
      else finish();
    }

    function finish() {
      prog.style.width = "100%";
      counter.textContent = "Complete";
      var subject = "New enquiry — " + (answers.service || "General") + " — " + (answers.name || "");
      var lines = STEPS.map(function (s) {
        return s.q + "\n" + (answers[s.key] || "—");
      }).join("\n\n");
      var mailto = "mailto:sales@avenzotech.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines);

      body.innerHTML =
        '<div class="convo__step">' +
        '<p class="convo__q">That\'s everything we need.</p>' +
        '<p class="convo__hint">Review it, then send. Your mail app opens with all of this filled in.</p>' +
        '<div class="convo__recap"></div>' +
        '</div>';
      var recap = $(".convo__recap", body);
      STEPS.forEach(function (s) {
        if (!answers[s.key]) return;
        var row = document.createElement("div");
        row.innerHTML = "<span>" + s.key + "</span><b></b>";
        $("b", row).textContent = answers[s.key];
        recap.appendChild(row);
      });
      var send = document.createElement("a");
      send.className = "btn btn--solid";
      send.href = mailto;
      send.textContent = "Send enquiry";
      send.style.marginTop = "18px";
      var again = document.createElement("button");
      again.type = "button";
      again.className = "convo__back";
      again.textContent = "Start over";
      again.addEventListener("click", function () { answers = {}; idx = 0; render(); });
      var foot = document.createElement("div");
      foot.className = "convo__foot";
      foot.appendChild(send);
      foot.appendChild(again);
      $(".convo__step", body).appendChild(foot);
    }

    render();

    var toggle = $("[data-toggle-form]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var classic = $("[data-classic-form]");
        var showClassic = convo.hidden === false;
        convo.hidden = showClassic;
        classic.hidden = !showClassic;
        toggle.textContent = showClassic ? "Switch to guided questions" : "Switch to a standard form";
      });
    }
  }

  /* ---------------- privacy controls ----------------
     Granular, opt-in by default off, decision stored locally only. */
  var consent = $(".consent");
  if (consent) {
    var KEY = "avenzo.consent.v1";
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}

    if (!saved) {
      setTimeout(function () { consent.classList.add("in"); }, 900);
    }

    function save(prefs) {
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
      consent.classList.remove("in");
    }

    $("[data-consent-accept]", consent).addEventListener("click", function () {
      $$("input[type=checkbox]", consent).forEach(function (c) { if (!c.disabled) c.checked = true; });
      save({ analytics: true, marketing: true, at: Date.now() });
    });
    $("[data-consent-save]", consent).addEventListener("click", function () {
      save({
        analytics: $("#c-analytics").checked,
        marketing: $("#c-marketing").checked,
        at: Date.now()
      });
    });
    $("[data-consent-reject]", consent).addEventListener("click", function () {
      save({ analytics: false, marketing: false, at: Date.now() });
    });

    $$("[data-consent-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        consent.classList.add("in");
      });
    });
  }

  /* ---------------- classic mail form ---------------- */
  var form = $("[data-mailform]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = "New enquiry — " + (d.get("service") || "General") + " — " + (d.get("name") || "");
      var body = "Name: " + (d.get("name") || "") + "\nEmail: " + (d.get("email") || "") +
        "\nPhone: " + (d.get("phone") || "") + "\nService: " + (d.get("service") || "") +
        "\nBudget: " + (d.get("budget") || "") + "\n\n" + (d.get("message") || "");
      location.href = "mailto:sales@avenzotech.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = $(".form__note", form);
      if (note) note.textContent = "Opening your mail app — send the draft to finish.";
    });
  }


  /* ---------------- WhatsApp chat ---------------- */
  var wa = $("[data-wa]");
  if (wa) {
    var waBtn = $("[data-wa-toggle]", wa);
    var waClose = $("[data-wa-close]", wa);
    var dot = $(".wa__dot", wa);
    var opened = false;

    function openWa(state) {
      opened = state;
      wa.classList.toggle("is-open", state);
      waBtn.setAttribute("aria-expanded", String(state));
      waBtn.setAttribute("aria-label", state ? "Close WhatsApp chat" : "Open WhatsApp chat");
      if (state && dot) dot.style.display = "none";
    }

    waBtn.addEventListener("click", function () { openWa(!opened); });
    if (waClose) waClose.addEventListener("click", function () { openWa(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && opened) openWa(false); });
    document.addEventListener("click", function (e) {
      if (opened && !wa.contains(e.target)) openWa(false);
    });

    /* nudge the card open once, after the visitor has actually engaged */
    var nudged = false;
    function nudge() {
      if (nudged || opened) return;
      nudged = true;
      if (sessionStorage.getItem("avenzo.wa.nudged")) return;
      try { sessionStorage.setItem("avenzo.wa.nudged", "1"); } catch (e) {}
      setTimeout(function () { if (!opened) openWa(true); }, 400);
      setTimeout(function () { if (!nudgeHeld) openWa(false); }, 7000);
    }
    var nudgeHeld = false;
    wa.addEventListener("mouseenter", function () { nudgeHeld = true; });
    setTimeout(nudge, 12000);
    window.addEventListener("scroll", function once() {
      if (window.scrollY > window.innerHeight * 1.5) { nudge(); window.removeEventListener("scroll", once); }
    }, { passive: true });
  }

  /* ---------------- email links ----------------
     A bare mailto: does nothing when no mail app is set up. If the page
     keeps focus after the click, copy the address and offer webmail. */
  $$("a[data-mail]").forEach(function (link) {
    var addr = link.getAttribute("href").replace(/^mailto:/, "").split("?")[0];
    link.addEventListener("click", function () {
      var left = false;
      function gone() { left = true; }
      window.addEventListener("blur", gone);
      document.addEventListener("visibilitychange", gone);
      setTimeout(function () {
        window.removeEventListener("blur", gone);
        document.removeEventListener("visibilitychange", gone);
        if (!left) mailToast(addr);
      }, 1200);
    });
  });

  function mailToast(addr) {
    var old = $(".mailtoast");
    if (old) old.remove();
    var copied = false;
    try {
      if (navigator.clipboard) { navigator.clipboard.writeText(addr); copied = true; }
    } catch (e) {}
    var t = document.createElement("div");
    t.className = "mailtoast";
    t.setAttribute("role", "status");
    t.innerHTML =
      '<p><b></b><span></span></p>' +
      '<div class="mailtoast__acts">' +
      '<a target="_blank" rel="noopener" data-gmail>Gmail</a>' +
      '<a target="_blank" rel="noopener" data-outlook>Outlook</a>' +
      '<button type="button" aria-label="Close">&times;</button>' +
      '</div>';
    $("b", t).textContent = addr;
    $("span", t).textContent = copied ? "Address copied — paste it into your email." : "No mail app found — write to us here:";
    $("[data-gmail]", t).href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(addr);
    $("[data-outlook]", t).href = "https://outlook.live.com/mail/0/deeplink/compose?to=" + encodeURIComponent(addr);
    $("button", t).addEventListener("click", function () { t.remove(); });
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 10000);
  }

  /* ---------------- year ---------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
