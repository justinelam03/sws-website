/* ==========================================================
   SETTINGS: edit these
   ========================================================== */
const SITE = {
  email: "uchicago.sws@gmail.com",
  instagram: "https://www.instagram.com/uchicagosws/",
  facebook: "https://www.facebook.com/uchicagosws/"
};

(function(){
  const $  = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Links
  $$("[data-email]").forEach(a => { a.href = "mailto:" + SITE.email; if(!a.children.length && !a.dataset.keep) a.textContent = SITE.email; });
  $$("[data-instagram]").forEach(a => { a.href = SITE.instagram; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-facebook]").forEach(a => { a.href = SITE.facebook; a.target = "_blank"; a.rel = "noopener"; });
  const yr = $("#yr"); if(yr) yr.textContent = new Date().getFullYear();

  // Nav + progress + parallax
  const nav = $("#nav"), prog = $("#progress"), px = $$("[data-parallax]");
  function onScroll(){
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y/max : 0})`;
    nav.classList.toggle("scrolled", y > 30);
    if(!reduce) px.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if(r.bottom < -100 || r.top > innerHeight + 100) return;
      el.style.transform = `translateY(${(-r.top * 0.14).toFixed(1)}px)`;
    });
    visitsUpdate();
  }
  addEventListener("scroll", onScroll, {passive:true});
  addEventListener("resize", onScroll);

  // Mobile menu
  const mb = $("#menuBtn");
  mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  $$("#menu a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  // Logo tiles. Each item is a name, or {name, t:"style", sub:"second line", img:"path"}.
  // If you drop an official logo into /logos named like  goldman-sachs.svg (or .png),
  // it automatically replaces the typeset version.
  const slug = n => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  const LOGO_H = {"j-p-morgan": 43, "goldman-sachs": 54, "bain-and-company": 30, "ubs": 54, "lazard": 41, "bofa-securities": 54, "blackrock": 34, "barclays": 39, "deutsche-bank": 45, "societe-generale": 38, "bnp-paribas": 45, "jefferies": 40, "citi": 54, "rothschild-and-co": 40, "vista-equity-partners": 44, "blackstone": 37, "moelis": 47, "centerview-partners": 38, "charles-schwab": 75, "mizuho": 57, "chicago-financial-women": 70, "uchicago-student-government": 84};
  window.buildLogos = function(el, items, cls){
    items = items.map(i => typeof i === "string" ? {name:i} : i);
    el.innerHTML = items.map(i => i.img
      ? `<div class="${cls}" title="${i.name}"><img src="${i.img}" alt="${i.name}"></div>`
      : `<div class="${cls}" title="${i.name}"><span class="wm ${i.t ? "t-"+i.t : ""}">${i.label || i.name}${i.sub ? `<small>${i.sub}</small>` : ""}</span></div>`).join("");
    $$("."+cls, el).forEach((tile, k) => {
      if(items[k].img) return;
      const s = slug(items[k].name);
      const tryExt = exts => { if(!exts.length) return;
        const im = new Image(); im.alt = items[k].name; im.className = "mono";
        im.onload = () => { if(LOGO_H[s]) im.style.height = LOGO_H[s] + "px"; tile.innerHTML = ""; tile.appendChild(im);
          if(cls === "sp"){ const c = new Image(); c.alt = ""; c.className = "col"; c.onload = () => { if(LOGO_H[s]) c.style.height = LOGO_H[s] + "px"; tile.appendChild(c); }; c.src = `logos/${s}-color.png`; } };
        im.onerror = () => tryExt(exts.slice(1));
        im.src = `logos/${s}.${exts[0]}`;
      };
      tryExt(["svg","png"]);
    });
  };

  // Horizontal journey track
  const track = $("#track");
  if(track){
    const bar = $("#trackBar"), prev = $("#prev"), next = $("#next");
    const step = () => $(".step").offsetWidth + 26;
    prev.onclick = () => track.scrollBy({left:-step(), behavior:"smooth"});
    next.onclick = () => track.scrollBy({left: step(), behavior:"smooth"});
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth;
      const w = Math.min(100, track.clientWidth / track.scrollWidth * 100);
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = w + "%"; bar.style.left = (ratio * (100 - w)) + "%";
      prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft > max - 4;
    };
    track.addEventListener("scroll", upd, {passive:true}); addEventListener("resize", upd); upd();
    let down=false, sx=0, sl=0;
    track.addEventListener("pointerdown", e => { if(e.pointerType!=="mouse") return; down=true; sx=e.clientX; sl=track.scrollLeft; track.classList.add("dragging"); });
    addEventListener("pointermove", e => { if(down) track.scrollLeft = sl - (e.clientX - sx); });
    addEventListener("pointerup", () => { down=false; track.classList.remove("dragging"); });
  }

  // Site-visit timeline fills as it scrolls into view
  const visits = $("#visits");
  function visitsUpdate(){
    if(!visits) return;
    const r = visits.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight*0.75 - r.top) / r.height));
    $(".fill", visits).style.height = (p * (r.height - 12)) + "px";
    $$("li", visits).forEach(li => {
      const lr = li.getBoundingClientRect();
      li.classList.toggle("on", lr.top < innerHeight*0.75);
    });
  }

  // Board cards: tap to open on touch
  $$(".member").forEach(c => {
    c.addEventListener("click", e => { if(e.target.closest("a")) return; $$(".member.open").forEach(o => o!==c && o.classList.remove("open")); c.classList.toggle("open"); });
    c.addEventListener("keydown", e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); c.classList.toggle("open"); } });
  });

  onScroll();
})();
