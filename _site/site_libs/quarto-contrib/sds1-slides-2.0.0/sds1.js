/* =====================================================================
   SDS1 · genbrugelige komponenter til slides (én fil for hele kurset)
   ---------------------------------------------------------------------
   1. Layout-hjælp        baggrundsklasser, QR-kode på titelslidet
   2. Celler              danske knapper, husket kode, Nulstil
   3. Øvelser             Hint / Vis løsning
   4. Gæt først           output skjules, til der er gættet og kørt
   5. Linjefokus          forklaringens punkter fremhæver kodelinjer
   6. Styring             sds1.skyder() og sds1.vaelger() til {ojs}-celler
   7. Status              "Python er klar"
   8. Værktøjer           mørk tilstand, kopiér link, læsevisning
   9. Ordliste, nedtælling, fælles Python/R-faner
   Alt er skrevet uden biblioteker og uden kald til andre servere.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lager = {
    hent(k) { try { return localStorage.getItem('sds1:' + k); } catch (e) { return null; } },
    gem(k, v) { try { localStorage.setItem('sds1:' + k, v); } catch (e) { /* privat tilstand el.lign. */ } },
    slet(k) { try { localStorage.removeItem('sds1:' + k); } catch (e) { /* ignorer */ } }
  };
  const el = (tag, attrs, ...born) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v);
    });
    born.forEach(b => n.append(b));
    return n;
  };
  const side = location.pathname.replace(/index\.html$/, '');
  const sds1 = (window.sds1 = window.sds1 || {});

  /* ---------------------------------------------------------------- 1 · layout */
  function layout() {
    if (!window.Reveal) return;
    const giv = () => Reveal.getSlides().forEach(s => {
      const bg = s.slideBackgroundElement;
      if (!bg) return;
      ['lay-titel', 'lay-sektion', 'lay-udsagn', 'lay-sidst'].forEach(k => bg.classList.toggle(k, s.classList.contains(k)));
    });
    const sektionsnumre = () => $$('section.lay-sektion[data-nr]').forEach(s => {
      if ($('.sektion-nr', s)) return;
      s.prepend(el('span', { class: 'sektion-nr', 'aria-hidden': 'true', text: s.dataset.nr }));
    });
    const klar = () => { giv(); sektionsnumre(); qr(); };
    if (Reveal.isReady && Reveal.isReady()) klar(); else Reveal.on('ready', klar);
  }

  function qr() {
    const boks = $('#sds1-qr'), link = $('#sds1-link');
    if (!boks || !link) return;
    const url = location.origin + location.pathname;
    link.href = url; link.textContent = url.replace(/^https?:\/\//, '');
    if (typeof qrcode !== 'function') return;
    try {
      const q = qrcode(0, 'M'); q.addData(url); q.make();
      boks.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      const svg = $('svg', boks); if (svg) svg.setAttribute('aria-hidden', 'true');
    } catch (e) { /* for lang adresse: linket står der stadig */ }
  }

  /* ---------------------------------------------------------------- 2 · celler */
  const ord = { 'Run Code': 'Kør', 'Start Over': 'Nulstil', 'Show Hint': 'Hint', 'Show Solution': 'Vis løsning' };
  const visning = k => { try { return k.cmView.view; } catch (e) { return null; } };

  function klargoerEditor(kort) {
    if (kort.dataset.sds1) return;
    const celle = kort.closest('.celle');
    kort.dataset.sds1 = '1';
    $$('a.btn', kort).forEach(b => {
      const dansk = ord[b.getAttribute('aria-label')];
      if (!dansk) return;
      if (!celle && dansk !== 'Kør' && dansk !== 'Nulstil') return;
      b.setAttribute('aria-label', dansk === 'Kør' ? 'Kør koden (Shift + Enter)' : dansk);
      b.title = dansk === 'Kør' ? 'Kør koden (Shift + Enter)' : dansk === 'Nulstil' ? 'Tilbage til den oprindelige kode' : dansk;
      const t = $('.btn-label-exercise-editor', b); if (t) t.textContent = dansk;
      b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); b.click(); } });
      // quarto-lives egne Hint/Løsning-knapper bruges ikke: vi har vores egne under editoren
      if (celle && (dansk === 'Hint' || dansk === 'Vis løsning')) b.style.display = 'none';
    });
    if (!celle) return;

    // Husket kode: gemmes pr. celle i browseren. "Nulstil" sletter den igen.
    const indhold = $('.cm-content', kort);
    const v = indhold && visning(indhold);
    if (!v) return;
    const sprog = kort.closest('.exercise-cell') && kort.closest('.exercise-cell').id.startsWith('webr') ? 'r' : 'py';
    const noegle = 'kode:' + side + ':' + celle.dataset.celle + ':' + sprog;
    const original = v.state.doc.toString();
    const gemt = lager.hent(noegle);
    if (gemt !== null && gemt !== original) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: gemt } });
      celle.classList.add('har-gemt');
    }
    let ur = null;
    new MutationObserver(() => {
      clearTimeout(ur);
      ur = setTimeout(() => {
        const nu = v.state.doc.toString();
        if (nu === original) lager.slet(noegle); else lager.gem(noegle, nu);
      }, 400);
    }).observe(indhold, { childList: true, subtree: true, characterData: true });
    const nulstil = $('a.btn[aria-label="Nulstil"]', kort);
    if (nulstil) nulstil.addEventListener('click', () => { lager.slet(noegle); celle.classList.remove('har-gemt'); });
    celle._sds1 = { v, original };
  }

  function celler() {
    const scan = () => {
      $$('.card.exercise-editor').forEach(klargoerEditor);
      // quarto-lives engelske standardbesked, når et hul ikke er udfyldt
      $$('.celle .exercise-grade').forEach(g => {
        if (/Please replace/.test(g.textContent)) g.textContent = 'Udfyld hullet ______ med kode, og tryk Kør igen.';
      });
    };
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------------------------------------------------------- 3 · øvelser: Hint / Vis løsning */
  function oevelser() {
    $$('.celle').forEach((celle, i) => {
      const paneler = $$(':scope > .hjaelp-panel', celle);
      if (!paneler.length) return;
      const raekke = el('div', { class: 'hjaelp-raekke' });
      paneler[0].before(raekke);
      paneler.forEach((p, j) => {
        const loesning = p.dataset.slags === 'loesning';
        p.id = p.id || 'hjaelp-' + i + '-' + j;
        p.hidden = true;
        const knap = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': p.id, text: loesning ? 'Vis løsning' : 'Hint' });
        knap.addEventListener('click', () => {
          p.hidden = !p.hidden;
          knap.setAttribute('aria-expanded', String(!p.hidden));
          if (loesning) knap.textContent = p.hidden ? 'Vis løsning' : 'Skjul løsning';
        });
        raekke.append(knap);
        if (loesning) {
          const kode = $('pre code', p);
          const ind = el('button', { type: 'button', class: 'indsaet', text: 'Sæt løsningen ind i editoren' });
          ind.addEventListener('click', () => {
            const s = celle._sds1; if (!s || !kode) return;
            s.v.dispatch({ changes: { from: 0, to: s.v.state.doc.length, insert: kode.textContent.replace(/\n$/, '') } });
            s.v.focus();
          });
          const r = el('div', { class: 'hjaelp-raekke', style: 'padding:6px 0 0;border:0;background:none' }, ind);
          p.append(r);
        }
      });
    });
  }

  /* ---------------------------------------------------------------- 4 · gæt først */
  function gaet() {
    $$('.celle.gaet').forEach((celle, i) => {
      const valg = (celle.dataset.valg || '').split('|').map(s => s.trim()).filter(Boolean);
      const navn = 'gaet-' + i;
      const status = el('p', { class: 'gaet-status', 'aria-live': 'polite', text: 'Vælg et svar, og tryk så Kør.' });
      const felt = el('fieldset', {}, el('legend', { text: celle.dataset.gaet }));
      const liste = el('div', { class: 'gaet-valg' });
      let valgt = null;
      if (valg.length) {
        valg.forEach(v => {
          const r = el('input', { type: 'radio', name: navn, value: v });
          r.addEventListener('change', () => { valgt = v; status.textContent = 'Dit gæt: ' + v + '. Tryk Kør for at se, hvad der sker.'; });
          liste.append(el('label', {}, r, el('span', { text: v })));
        });
      } else {
        const t = el('input', { type: 'text', 'aria-label': 'Dit gæt', style: 'font:500 15px var(--skrift-kode);padding:6px 10px;border-radius:7px;border:1px solid var(--kode-linje);background:var(--kode-bg);color:#fff;min-width:220px' });
        t.addEventListener('input', () => { valgt = t.value.trim() || null; });
        liste.append(t);
      }
      felt.append(liste);
      const boks = el('div', { class: 'gaet-boks' }, felt, status);
      const efter = $(':scope > .forslag, :scope > .hjaelp-panel, :scope > details', celle);
      if (efter) efter.before(boks); else celle.append(boks);

      celle.addEventListener('click', e => {
        if (!e.target.closest('.exercise-editor-btn-run-code')) return;
        if (!valgt) { status.textContent = 'Gæt først — så viser vi outputtet.'; return; }
        celle.classList.add('afsloeret');
        $$('input', boks).forEach(x => (x.disabled = true));
        // Sammenlign gættet med det output, koden faktisk giver
        setTimeout(function tjek(n) {
          const ud = $$('.cell-output-container pre', celle).map(p => p.textContent.trim()).join('\n').trim();
          if (!ud && (n || 0) < 20) return setTimeout(tjek, 300, (n || 0) + 1);
          const ens = ud && ud.replace(/['"]/g, '') === String(valgt).replace(/['"]/g, '');
          status.textContent = 'Dit gæt: ' + valgt + '. ' + (ens ? 'Det passer med outputtet.' : 'Sammenlign med outputtet: hvorfor blev det sådan?');
        }, 500);
      }, true);
    });
  }

  /* ---------------------------------------------------------------- 5 · linjefokus */
  function linjer(celle) {
    const cm = $('.cm-content', celle);
    if (cm) return $$('.cm-line', cm);
    const kode = $('.cell-output-container > .sourceCode pre code, :scope > .sourceCode pre code, :scope > div > .sourceCode pre code', celle);
    if (!kode) return [];
    if (!$('.kl', kode)) {
      kode.innerHTML = kode.innerHTML.replace(/\n$/, '').split('\n').map(l => '<span class="kl">' + (l || ' ') + '</span>').join('');
      kode.style.whiteSpace = 'pre';
    }
    return $$('.kl', kode);
  }
  function linjefokus() {
    const ryd = celle => { $$('.linje-fokus', celle).forEach(x => x.classList.remove('linje-fokus')); celle.classList.remove('har-fokus'); };
    const vis = punkt => {
      const boks = punkt.closest('details.forklaring');
      const celle = punkt.closest('.celle') || (boks.previousElementSibling && boks.previousElementSibling.closest('.celle, div.sourceCode'));
      if (!celle) return;
      $$('li.aktiv', boks).forEach(x => x.classList.remove('aktiv'));
      ryd(celle);
      const [a, b] = punkt.dataset.linjer.split('-').map(Number);
      const alle = linjer(celle);
      for (let n = a; n <= (b || a); n++) if (alle[n - 1]) alle[n - 1].classList.add('linje-fokus');
      celle.classList.add('har-fokus');
      punkt.classList.add('aktiv');
    };
    document.addEventListener('click', e => { const p = e.target.closest('li[data-linjer]'); if (p) vis(p); });
    document.addEventListener('mouseover', e => { const p = e.target.closest('li[data-linjer]'); if (p) vis(p); });
    document.addEventListener('focusin', e => { const p = e.target.closest && e.target.closest('li[data-linjer]'); if (p) vis(p); });
    document.addEventListener('keydown', e => {
      const p = e.target.closest && e.target.closest('li[data-linjer]');
      if (!p || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const alle = $$('li[data-linjer]', p.closest('details'));
      const naeste = alle[alle.indexOf(p) + (e.key === 'ArrowDown' ? 1 : -1)];
      if (naeste) { e.preventDefault(); e.stopPropagation(); naeste.focus(); }
    }, true);
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (!d.matches || !d.matches('details.forklaring') || d.open) return;
      const celle = d.closest('.celle'); if (celle) ryd(celle);
      $$('li.aktiv', d).forEach(x => x.classList.remove('aktiv'));
    }, true);
  }

  /* ---------------------------------------------------------------- 6 · styring til {ojs}
     viewof bins = sds1.skyder({ label: "Antal søjler", min: 2, max: 40, value: 10 })
     viewof how  = sds1.vaelger({ label: "Join-type", valg: ["inner", "left", "outer"] })
     Brug navnet i en celle med  #| input: [bins]  — så tegner cellen om, når der skrues. */
  let styringNr = 0;
  sds1.skyder = function (o) {
    const id = 'styring-' + (++styringNr);
    const input = el('input', { type: 'range', id, min: o.min, max: o.max, step: o.step || 1, value: o.value });
    const tal = el('output', { for: id, text: String(o.value) + (o.enhed ? ' ' + o.enhed : '') });
    const boks = el('div', { class: 'styring' }, el('label', { for: id, text: o.label }), input, tal);
    boks.value = Number(o.value);
    let ur = null;
    input.addEventListener('input', () => {
      tal.textContent = Number(input.value).toLocaleString('da-DK') + (o.enhed ? ' ' + o.enhed : '');
      clearTimeout(ur);               // vent et øjeblik, så Python ikke tegner for hvert eneste trin
      ur = setTimeout(() => { boks.value = Number(input.value); boks.dispatchEvent(new Event('input', { bubbles: true })); }, o.vent === undefined ? 120 : o.vent);
    });
    tal.textContent = Number(o.value).toLocaleString('da-DK') + (o.enhed ? ' ' + o.enhed : '');
    return boks;
  };
  sds1.vaelger = function (o) {
    const id = 'styring-' + (++styringNr);
    const select = el('select', { id });
    o.valg.forEach(v => select.append(el('option', { value: v, text: v })));
    if (o.value) select.value = o.value;
    const boks = el('div', { class: 'styring' }, el('label', { for: id, text: o.label }), select);
    boks.value = select.value;
    select.addEventListener('change', () => { boks.value = select.value; boks.dispatchEvent(new Event('input', { bubbles: true })); });
    return boks;
  };

  /* ---------------------------------------------------------------- 7 · status */
  function status() {
    const kilde = $('#exercise-loading-indicator');
    if (!kilde) return;
    const tekst = el('span', { class: 'tekst', text: 'Gør klar …' });
    const pille = el('div', { id: 'sds1-status', class: 'henter', role: 'status', 'aria-live': 'polite' }, el('span', { class: 'prik', 'aria-hidden': 'true' }), tekst);
    document.body.append(pille);
    // quarto-live skriver én statuslinje pr. sprog og fjerner den, når sproget er klar
    const sprog = {};
    if ($('.exercise-cell[id^="pyodide"]')) sprog.Python = { klar: false, linje: null, tekst: 'Henter Python' };
    if ($('.exercise-cell[id^="webr"]')) sprog.R = { klar: false, linje: null, tekst: 'Henter R' };
    const dansk = t => t
      .replace(/Downloading Pyodide/i, 'Henter Python')
      .replace(/Downloading webR/i, 'Henter R')
      .replace(/Downloading package: (\S+)/i, 'Henter pakken $1')
      .replace(/Downloading resource: (\S+)/i, 'Henter $1')
      .replace(/Pyodide environment setup|Installing webR shims|Initialis\w+.*/i, 'Gør klar');
    const start = Date.now();
    let faerdig = false;
    const opdater = () => {
      const dele = $$('.exercise-loading-details', kilde);
      dele.forEach(d => {
        if (/pyodide|micropip/i.test(d.textContent) && sprog.Python) sprog.Python.linje = d;
        if (/webr/i.test(d.textContent) && sprog.R) sprog.R.linje = d;
      });
      const navne = Object.keys(sprog);
      navne.forEach(n => {
        const s = sprog[n];
        if (s.linje && !document.body.contains(s.linje)) s.klar = true;
        else if (s.linje) { s.tekst = dansk(s.linje.textContent); s.fejl = !!s.linje.style.color; }
      });
      if (!document.body.contains(kilde) && Date.now() - start > 1500) navne.forEach(n => (sprog[n].klar = true));
      const klar = navne.filter(n => sprog[n].klar), venter = navne.filter(n => !sprog[n].klar);
      const fejl = venter.filter(n => sprog[n].fejl || Date.now() - start > 90000);
      let ny, klasse;
      if (!venter.length) { ny = klar.join(' og ') + ' er klar'; klasse = 'klar'; faerdig = true; }
      else if (fejl.length) {
        ny = (klar.length ? klar.join(' og ') + ' er klar. ' : '') + fejl.join(' og ') + ' kunne ikke hentes: tjek nettet, og genindlæs siden.';
        klasse = klar.length ? 'klar delvis' : 'fejl'; faerdig = fejl.length === venter.length;
      } else { ny = (klar.length ? klar.join(' og ') + ' er klar · ' : '') + venter.map(n => sprog[n].tekst).join(' · ') + ' …'; klasse = 'henter'; }
      if (tekst.textContent !== ny) tekst.textContent = ny;
      if (pille.className.replace(' lille', '') !== klasse) pille.className = klasse;
      if (faerdig && klasse === 'klar') {
        setTimeout(() => pille.classList.add('lille'), 5000);
        pille.addEventListener('mouseenter', () => pille.classList.remove('lille'));
      }
    };
    // Spørg et par gange i sekundet, til alt er hentet (billigere og mere robust end at overvåge hele siden)
    const ur = setInterval(() => { opdater(); if (faerdig) clearInterval(ur); }, 400);
    opdater();
  }

  /* ---------------------------------------------------------------- 8 · værktøjer */
  const ikon = {
    maane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.5-1.5"/></svg>',
    laes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16M4 10h16M4 15h10M4 20h7"/></svg>'
  };
  function besked(t) {
    let b = $('#sds1-besked');
    if (!b) { b = el('div', { id: 'sds1-besked', role: 'status', 'aria-live': 'polite' }); document.body.append(b); }
    b.textContent = t; b.classList.add('vis');
    clearTimeout(besked.ur); besked.ur = setTimeout(() => b.classList.remove('vis'), 2200);
  }
  function vaerktoejer() {
    const rod = document.documentElement;
    const bar = el('div', { id: 'sds1-vaerktoej', role: 'toolbar', 'aria-label': 'Værktøjer til slides' });
    const knap = (navn, html, klik) => {
      const b = el('button', { type: 'button', 'aria-label': navn, title: navn });
      b.innerHTML = html; b.addEventListener('click', e => { e.stopPropagation(); klik(b); b.blur(); });
      bar.append(b); return b;
    };
    const tema = knap('Skift mellem lys og mørk tilstand', ikon.maane, b => {
      const moerk = rod.dataset.tema !== 'moerk';
      if (moerk) rod.dataset.tema = 'moerk'; else delete rod.dataset.tema;
      lager.gem('tema', moerk ? 'moerk' : 'lys');
      b.innerHTML = moerk ? ikon.sol : ikon.maane;
      b.setAttribute('aria-pressed', String(moerk));
    });
    if (rod.dataset.tema === 'moerk') { tema.innerHTML = ikon.sol; tema.setAttribute('aria-pressed', 'true'); }
    knap('Kopiér link til dette slide', ikon.link, () => {
      const url = location.href;
      const ok = () => besked('Linket til dette slide er kopieret');
      const reserve = () => {
        const t = el('textarea', { style: 'position:fixed;opacity:0' }); t.value = url; document.body.append(t); t.select();
        try { document.execCommand('copy'); ok(); } catch (e) { besked(url); }
        t.remove();
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, reserve); else reserve();
    });
    const scroll = new URLSearchParams(location.search).get('view') === 'scroll';
    knap(scroll ? 'Tilbage til slides' : 'Læsevisning: alle slides under hinanden', ikon.laes, () => {
      location.href = location.pathname + (scroll ? '' : '?view=scroll') + location.hash;
    });
    document.body.append(bar);
  }

  /* ---------------------------------------------------------------- 9 · ordliste, nedtælling, faner */
  function ordliste() {
    const boks = el('div', { id: 'sds1-ordboks', role: 'tooltip', hidden: '' });
    document.body.append(boks);
    const vis = o => {
      boks.innerHTML = ''; boks.append(el('strong', { text: o.dataset.ord }), document.createTextNode(o.dataset.forklaring));
      boks.hidden = false;
      const r = o.getBoundingClientRect(), b = boks.getBoundingClientRect();
      let x = Math.min(Math.max(8, r.left), innerWidth - b.width - 8);
      let y = r.bottom + 8; if (y + b.height > innerHeight - 8) y = r.top - b.height - 8;
      boks.style.left = x + 'px'; boks.style.top = y + 'px';
      o.setAttribute('aria-describedby', 'sds1-ordboks');
    };
    const skjul = () => { boks.hidden = true; };
    document.addEventListener('mouseover', e => { const o = e.target.closest && e.target.closest('.ord[data-forklaring]'); if (o) vis(o); });
    document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.ord[data-forklaring]')) skjul(); });
    document.addEventListener('focusin', e => { const o = e.target.closest && e.target.closest('.ord[data-forklaring]'); if (o) vis(o); });
    document.addEventListener('focusout', skjul);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') skjul(); });
    if (window.Reveal) Reveal.on('slidechanged', skjul);
  }

  function nedtaelling() {
    $$('span.timer[data-time]').forEach(span => {
      const total = parseInt(span.dataset.time, 10) || 60;
      const btn = el('button', { type: 'button', class: 'timer' });
      const live = el('span', { class: 'visually-hidden', 'aria-live': 'polite' });
      let tilbage = total, id = null;
      const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      const vis = () => {
        btn.textContent = (id ? '⏸ ' : '▶ ') + fmt(tilbage);
        btn.setAttribute('aria-label', (id ? 'Pause nedtælling, ' : 'Start nedtælling, ') + fmt(tilbage) + ' tilbage');
      };
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (tilbage === 0) { tilbage = total; btn.classList.remove('faerdig'); }
        if (id) { clearInterval(id); id = null; }
        else id = setInterval(() => {
          tilbage -= 1;
          if (tilbage <= 0) { tilbage = 0; clearInterval(id); id = null; btn.classList.add('faerdig'); live.textContent = 'Tiden er gået'; }
          vis();
        }, 1000);
        vis();
      });
      vis(); span.replaceWith(btn); btn.after(live);
    });
  }

  // Vælger man R ét sted, skifter alle Python/R-faner med — og valget huskes.
  function faner() {
    const vaelg = (navn, undtagen) => $$('.panel-tabset [role="tab"]').forEach(t => {
      if (t !== undtagen && t.textContent.trim() === navn && t.getAttribute('aria-selected') !== 'true') { t.dataset.sds1 = '1'; t.click(); delete t.dataset.sds1; }
    });
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('.panel-tabset [role="tab"]');
      if (!t || t.dataset.sds1) return;
      const navn = t.textContent.trim();
      if (navn !== 'Python' && navn !== 'R') return;
      lager.gem('sprog', navn); setTimeout(() => vaelg(navn, t), 0);
    }, true);
    const gemt = lager.hent('sprog');
    if (gemt === 'R') setTimeout(() => vaelg('R'), 300);
  }

  /* ---------------------------------------------------------------- start */
  const start = () => {
    [layout, celler, oevelser, gaet, linjefokus, status, vaerktoejer, ordliste, nedtaelling, faner].forEach(f => {
      try { f(); } catch (e) { console.error('sds1:', f.name, e); }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
