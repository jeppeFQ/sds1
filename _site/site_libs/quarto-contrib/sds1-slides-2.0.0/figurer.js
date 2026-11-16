/* =====================================================================
   SDS1 · begrebsfigurer (SVG, uden biblioteker)
   ---------------------------------------------------------------------
   Brug i en slide:

     ::: {.figur figur="gennemsnit" vaerdier="15400,18500,66500,29400,22700" enhed="kr."}
     :::
     ::: {.figur figur="maske" vaerdier="15400,18500,66500,29400,22700,37300" graense="25000" navn="indkomst"}
     :::

   Figurerne regner selv på de tal, de får (sum, gennemsnit, sammenligning),
   så der står aldrig et tal, som ikke er regnet ud. Alle har en tekstbeskrivelse
   til skærmlæsere, og animationerne slås fra ved "reducer bevægelse".
   Ny figur: tilføj en funktion i `figurer` herunder.
   ===================================================================== */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs, tekst) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (tekst !== undefined) n.textContent = tekst;
    return n;
  };
  const h = (tag, attrs, tekst) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (tekst !== undefined) n.textContent = tekst;
    return n;
  };
  const tal = x => Number(x).toLocaleString('da-DK', { maximumFractionDigits: 1 });
  const rolig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const laes = boks => (boks.dataset.vaerdier || boks.getAttribute('vaerdier') || '').split(',').map(Number).filter(x => !isNaN(x));
  const attr = (boks, n, std) => boks.dataset[n] || boks.getAttribute(n) || std;

  // Trinvis figur: knapperne "Næste trin" og "Forfra" + en linje tekst, der også læses op
  function trin(boks, antal, vis, tekster) {
    let nu = 0;
    const tekst = h('span', { 'aria-live': 'polite' });
    const naeste = h('button', { type: 'button' }, 'Næste trin');
    const forfra = h('button', { type: 'button', class: 'sek' }, 'Forfra');
    const saet = n => { nu = n; vis(nu); tekst.textContent = tekster[nu] || ''; naeste.disabled = nu >= antal - 1; naeste.style.opacity = naeste.disabled ? 0.45 : 1; };
    naeste.addEventListener('click', e => { e.stopPropagation(); if (nu < antal - 1) saet(nu + 1); });
    forfra.addEventListener('click', e => { e.stopPropagation(); saet(0); });
    const rk = h('div', { class: 'figur-knapper' }); rk.append(naeste, forfra, tekst); boks.append(rk);
    saet(0);
  }

  const figurer = {
    /* Gennemsnit: søjler → læg sammen → del med antallet */
    gennemsnit(boks) {
      const v = laes(boks), enhed = attr(boks, 'enhed', '');
      const sum = v.reduce((a, b) => a + b, 0), gns = sum / v.length, max = Math.max(...v);
      const B = 560, H = 60 + v.length * 34 + 70, x0 = 110, bredde = B - x0 - 110;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': `Søjler for ${v.length} værdier: ${v.map(tal).join(', ')}. Summen er ${tal(sum)}, gennemsnittet er ${tal(gns)} ${enhed}.` });
      v.forEach((x, i) => {
        const y = 20 + i * 34;
        svg.append(s('text', { x: x0 - 10, y: y + 18, 'text-anchor': 'end', class: 'mono svag', 'font-size': 14 }, 'x' + (i + 1)));
        svg.append(s('rect', { x: x0, y, width: (x / max) * bredde, height: 24, rx: 4, class: 'accent-fyld soejle' }));
        svg.append(s('text', { x: x0 + (x / max) * bredde + 8, y: y + 18, class: 'mono', 'font-size': 15 }, tal(x)));
      });
      const yb = 20 + v.length * 34;
      const linje = s('line', { x1: x0 + (gns / max) * bredde, x2: x0 + (gns / max) * bredde, y1: 10, y2: yb, 'stroke-width': 3, 'stroke-dasharray': '6 5', class: 'streg gns' });
      const t1 = s('text', { x: x0, y: yb + 30, 'font-size': 17, class: 't1' }, `Læg sammen:  ${v.map(tal).join(' + ')}  =  ${tal(sum)}`);
      const t2 = s('text', { x: x0, y: yb + 60, 'font-size': 17, 'font-weight': 600, class: 't2 accent-tekst' }, `Del med antallet:  ${tal(sum)} / ${v.length}  =  ${tal(gns)} ${enhed}`);
      svg.append(linje, t1, t2); boks.append(svg);
      trin(boks, 3, n => {
        t1.style.opacity = n >= 1 ? 1 : 0; t2.style.opacity = n >= 2 ? 1 : 0; linje.style.opacity = n >= 2 ? 1 : 0;
      }, ['Fem tal. Hvad er et typisk tal?', 'Trin 1: læg alle tallene sammen.', 'Trin 2: del summen med antallet. Den stiplede linje er gennemsnittet.']);
    },

    /* Variabel: et navn, der peger på en værdi i hukommelsen.  navne="indkomst,by" vaerdier="28600,'Aalborg'" */
    variabel(boks) {
      const navne = attr(boks, 'navne', '').split(','), vaerdier = attr(boks, 'vaerdier', '').split(',');
      const B = 520, rh = 78, H = 30 + navne.length * rh;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': 'Variable: ' + navne.map((n, i) => `navnet ${n} peger på værdien ${vaerdier[i]}`).join('; ') + '.' });
      svg.append(s('text', { x: 20, y: 18, class: 'svag', 'font-size': 14 }, 'navn (det, I skriver)'));
      svg.append(s('text', { x: 300, y: 18, class: 'svag', 'font-size': 14 }, 'værdi (i maskinens hukommelse)'));
      navne.forEach((n, i) => {
        const y = 34 + i * rh;
        svg.append(s('rect', { x: 20, y, width: 170, height: 50, rx: 25, class: 'kasse-accent' }));
        svg.append(s('text', { x: 105, y: y + 31, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 18, 'font-weight': 700 }, n.trim()));
        svg.append(s('path', { d: `M 198 ${y + 25} H 288 m -10 -7 l 10 7 l -10 7`, 'stroke-width': 2.5, class: 'streg' }));
        svg.append(s('rect', { x: 300, y, width: 200, height: 50, rx: 6, class: 'kasse' }));
        svg.append(s('text', { x: 400, y: y + 31, 'text-anchor': 'middle', class: 'mono', 'font-size': 18 }, vaerdier[i].trim()));
      });
      boks.append(svg);
    },

    /* Funktion: noget ind → opskrift → noget ud.  navn="round" ind="tal, antal decimaler" ud="afrundet tal" */
    funktion(boks) {
      const navn = attr(boks, 'navn', 'funktion'), ind = attr(boks, 'ind', 'argumenter'), ud = attr(boks, 'ud', 'resultat');
      const svg = s('svg', { viewBox: '0 0 560 170', role: 'img', 'aria-label': `En funktion som en maskine: ${ind} går ind i ${navn}, og ${ud} kommer ud.` });
      svg.append(s('text', { x: 85, y: 30, 'text-anchor': 'middle', class: 'svag', 'font-size': 14 }, 'ind: argumenter'));
      svg.append(s('rect', { x: 10, y: 50, width: 150, height: 60, rx: 6, class: 'kasse' }));
      svg.append(s('text', { x: 85, y: 86, 'text-anchor': 'middle', class: 'mono', 'font-size': 15 }, ind));
      svg.append(s('path', { d: 'M 166 80 H 200 m -9 -6 l 9 6 l -9 6', 'stroke-width': 2.5, class: 'streg' }));
      svg.append(s('rect', { x: 206, y: 35, width: 150, height: 90, rx: 14, class: 'kasse-accent', 'stroke-width': 2 }));
      svg.append(s('text', { x: 281, y: 76, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 18, 'font-weight': 700 }, navn + '()'));
      svg.append(s('text', { x: 281, y: 100, 'text-anchor': 'middle', class: 'svag', 'font-size': 13 }, 'opskriften'));
      svg.append(s('path', { d: 'M 362 80 H 396 m -9 -6 l 9 6 l -9 6', 'stroke-width': 2.5, class: 'streg' }));
      svg.append(s('text', { x: 477, y: 30, 'text-anchor': 'middle', class: 'svag', 'font-size': 14 }, 'ud: resultat'));
      svg.append(s('rect', { x: 402, y: 50, width: 150, height: 60, rx: 6, class: 'kasse' }));
      svg.append(s('text', { x: 477, y: 86, 'text-anchor': 'middle', class: 'mono', 'font-size': 15 }, ud));
      boks.append(svg);
    },

    /* ------------------------------------------------------------ lektion 3: datastrukturer og wrangling */

    /* Indeks og slice: elementer="a,b,c,d,e,f". To skydere vælger start og slut. */
    indeks(boks) {
      const e = attr(boks, 'elementer', 'a,b,c,d,e,f').split(',').map(x => x.trim()), n = e.length;
      const navn = attr(boks, 'navn', 't');
      const bw = 70, x0 = 110, B = x0 + n * bw + 20;
      const svg = s('svg', { viewBox: `0 0 ${B} 190`, role: 'img' });
      const lab = (y, txt) => svg.append(s('text', { x: x0 - 12, y, 'text-anchor': 'end', class: 'svag', 'font-size': 13 }, txt));
      lab(28, 'Python'); lab(150, 'bagfra'); lab(178, 'R');
      const kasser = e.map((v, i) => {
        const x = x0 + i * bw;
        svg.append(s('text', { x: x + bw / 2 - 3, y: 28, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 17, 'font-weight': 700 }, i));
        const r = s('rect', { x, y: 42, width: bw - 6, height: 66, rx: 8, class: 'kasse' });
        svg.append(r, s('text', { x: x + bw / 2 - 3, y: 84, 'text-anchor': 'middle', class: 'mono', 'font-size': 22 }, `"${v}"`));
        svg.append(s('text', { x: x + bw / 2 - 3, y: 150, 'text-anchor': 'middle', class: 'mono svag', 'font-size': 15 }, i - n));
        svg.append(s('text', { x: x + bw / 2 - 3, y: 178, 'text-anchor': 'middle', class: 'mono svag', 'font-size': 15 }, i + 1));
        return r;
      });
      const kant = [s('line', { y1: 34, y2: 116, 'stroke-width': 3, class: 'accent-streg' }), s('line', { y1: 34, y2: 116, 'stroke-width': 3, class: 'accent-streg' })];
      svg.append(...kant); boks.append(svg);
      const ud = h('p', { class: 'figur-resultat', 'aria-live': 'polite' });
      const mk = (label, v) => { const i = h('input', { type: 'range', min: 0, max: n, value: v, 'aria-label': label }); const l = h('label', {}, label + ' '); l.append(i); return [l, i]; };
      const [l1, a] = mk('start', 1), [l2, b] = mk('slut', 3);
      const rk = h('div', { class: 'figur-knapper styring' }); rk.append(l1, l2); boks.append(rk, ud);
      const vis = () => {
        const st = +a.value, sl = +b.value, del = e.slice(st, sl);
        kasser.forEach((r, i) => r.setAttribute('class', i >= st && i < sl ? 'kasse-accent' : 'kasse'));
        kant[0].setAttribute('x1', x0 + st * bw - 3); kant[0].setAttribute('x2', x0 + st * bw - 3);
        kant[1].setAttribute('x1', x0 + sl * bw - 3); kant[1].setAttribute('x2', x0 + sl * bw - 3);
        ud.innerHTML = `<code>${navn}[${st}:${sl}]</code> giver <code>[${del.map(x => `'${x}'`).join(', ')}]</code> &nbsp;·&nbsp; ${del.length} element${del.length === 1 ? '' : 'er'}` + (sl >= st ? ` = slut − start = ${sl} − ${st}` : ' (slut ligger før start)');
        svg.setAttribute('aria-label', `Listen ${e.join(', ')} med Python-indeks 0 til ${n - 1}. Udsnittet ${st}:${sl} giver ${del.join(', ') || 'ingenting'}.`);
      };
      a.addEventListener('input', vis); b.addEventListener('input', vis); vis();
    },

    /* Alias og kopi: to navne på samme liste, og derefter en rigtig kopi */
    alias(boks) {
      const svg = s('svg', { viewBox: '0 0 560 250', role: 'img', 'aria-label': 'Navnene a og b peger på den samme liste, så en ændring via b ses også via a. Navnet d peger på en kopi, som kan ændres uden at c ændres.' });
      const navn = (x, y, t) => { const g = s('g'); g.append(s('rect', { x, y, width: 64, height: 40, rx: 20, class: 'kasse-accent' }), s('text', { x: x + 32, y: y + 26, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 18, 'font-weight': 700 }, t)); svg.append(g); return g; };
      const liste = (x, y) => { const g = s('g'); const celler = [0, 1, 2].map(i => { g.append(s('rect', { x: x + i * 56, y, width: 52, height: 46, rx: 6, class: 'kasse' })); const tx = s('text', { x: x + i * 56 + 26, y: y + 30, 'text-anchor': 'middle', class: 'mono', 'font-size': 19 }, ''); g.append(tx); return tx; }); svg.append(g); return { g, celler }; };
      const pil = (x1, y1, x2, y2) => { const p = s('path', { d: `M ${x1} ${y1} L ${x2} ${y2}`, 'stroke-width': 2.5, class: 'streg' }); svg.append(p); return p; };
      const A = navn(20, 20, 'a'), Bn = navn(20, 80, 'b'), L1 = liste(300, 45), pa = pil(88, 40, 294, 62), pb = pil(88, 100, 294, 76);
      const C = navn(20, 150, 'c'), D = navn(20, 205, 'd'), L2 = liste(300, 142), L3 = liste(300, 200), pc = pil(88, 170, 294, 166), pd = pil(88, 225, 294, 224);
      boks.append(svg);
      const kode = h('code', { class: 'figur-kode' });
      const p = h('p', { class: 'figur-resultat' }); p.append(kode); boks.append(p);
      const tilstand = [
        { k: 'a = [1, 2, 3]', a: [1, 2, 3], vis: [A, L1.g, pa] },
        { k: 'b = a', a: [1, 2, 3], vis: [A, L1.g, pa, Bn, pb] },
        { k: 'b[0] = 17', a: [17, 2, 3], vis: [A, L1.g, pa, Bn, pb] },
        { k: 'c = [1, 2, 3]', a: [17, 2, 3], c: [1, 2, 3], vis: [A, L1.g, pa, Bn, pb, C, L2.g, pc] },
        { k: 'd = c[:]', a: [17, 2, 3], c: [1, 2, 3], d: [1, 2, 3], vis: [A, L1.g, pa, Bn, pb, C, L2.g, pc, D, L3.g, pd] },
        { k: 'd[0] = 99', a: [17, 2, 3], c: [1, 2, 3], d: [99, 2, 3], vis: [A, L1.g, pa, Bn, pb, C, L2.g, pc, D, L3.g, pd] }
      ];
      const alle = [A, Bn, C, D, L1.g, L2.g, L3.g, pa, pb, pc, pd];
      trin(boks, tilstand.length, n => {
        const t = tilstand[n];
        alle.forEach(x => { x.style.opacity = t.vis.includes(x) ? 1 : 0; });
        L1.celler.forEach((c, i) => (c.textContent = t.a[i]));
        L2.celler.forEach((c, i) => (c.textContent = (t.c || [])[i] ?? ''));
        L3.celler.forEach((c, i) => (c.textContent = (t.d || [])[i] ?? ''));
        kode.textContent = t.k;
      }, ['Én liste, ét navn.', 'b = a laver IKKE en kopi: to navne, samme liste.', 'Ændringen via b ses også via a.', 'En ny liste med navnet c.', 'c[:] laver en rigtig kopi: to lister.', 'Nu ændres kun kopien. c er urørt.']);
    },

    /* Spor en løkke: tal="3,41,12,9,74,15" maal="sum" eller "max". Viser variablen efter hver omgang. */
    spor(boks) {
      const v = laes({ dataset: { vaerdier: attr(boks, 'tal', '') }, getAttribute: () => null }), maal = attr(boks, 'maal', 'sum');
      const bw = 66, x0 = 20, B = x0 + v.length * bw + 200;
      const svg = s('svg', { viewBox: `0 0 ${B} 150`, role: 'img' });
      const kasser = v.map((x, i) => { const r = s('rect', { x: x0 + i * bw, y: 40, width: bw - 6, height: 50, rx: 8, class: 'kasse' }); svg.append(r, s('text', { x: x0 + i * bw + bw / 2 - 3, y: 72, 'text-anchor': 'middle', class: 'mono', 'font-size': 20 }, x)); return r; });
      const peg = s('path', { d: 'M 0 0 l -9 -14 h 18 z', class: 'accent-fyld' }); svg.append(peg);
      const pt = s('text', { y: 16, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 15, 'font-weight': 700 }, 't'); svg.append(pt);
      const vx = x0 + v.length * bw + 30, navn = maal === 'max' ? 'stoerste' : 'total';
      svg.append(s('text', { x: vx, y: 30, class: 'mono svag', 'font-size': 15 }, navn));
      svg.append(s('rect', { x: vx, y: 40, width: 130, height: 50, rx: 8, class: 'kasse-accent' }));
      const vt = s('text', { x: vx + 65, y: 73, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 22, 'font-weight': 700 }, ''); svg.append(vt);
      const regn = s('text', { x: x0, y: 130, class: 'mono', 'font-size': 16 }, ''); svg.append(regn);
      boks.append(svg);
      const tilst = [{ i: -1, val: maal === 'max' ? 'None' : 0, r: 'Før løkken: ' + navn + ' = ' + (maal === 'max' ? 'None' : 0) }];
      let akk = maal === 'max' ? null : 0;
      v.forEach((x, i) => {
        if (maal === 'max') { const skift = akk === null || x > akk; const gl = akk; if (skift) akk = x; tilst.push({ i, val: akk, r: `t = ${x}: ` + (gl === null ? 'første tal, gem det' : `${x} > ${gl}? ${skift ? 'Ja, gem ' + x : 'Nej, behold ' + gl}`) }); }
        else { const gl = akk; akk += x; tilst.push({ i, val: akk, r: `t = ${x}: total = ${gl} + ${x} = ${akk}` }); }
      });
      tilst.push({ i: v.length, val: akk, r: 'Efter løkken: ' + navn + ' = ' + akk });
      svg.setAttribute('aria-label', `En løkke gennemløber tallene ${v.join(', ')} og opdaterer variablen ${navn} ved hvert tal. Til sidst er ${navn} lig ${akk}.`);
      trin(boks, tilst.length, n => {
        const t = tilst[n];
        kasser.forEach((r, i) => r.setAttribute('class', i === t.i ? 'kasse-accent' : 'kasse'));
        const px = x0 + Math.min(Math.max(t.i, 0), v.length - 1) * bw + bw / 2 - 3;
        peg.setAttribute('transform', `translate(${px} 36)`); pt.setAttribute('x', px);
        peg.style.opacity = pt.style.opacity = t.i >= 0 && t.i < v.length ? 1 : 0;
        vt.textContent = t.val; regn.textContent = t.r;
      }, tilst.map((t, n) => n === 0 ? '1. Før: sæt variablen.' : n === tilst.length - 1 ? '3. Efter: aflæs resultatet.' : `2. Undervejs: omgang ${n} af ${v.length}.`));
    },

    /* Dictionary som tæller: tekst="regeringen har ..." Ét ord ad gangen. */
    taeller(boks) {
      const ordene = attr(boks, 'tekst', '').split(/\s+/).filter(Boolean);
      const top = h('p', { class: 'figur-ord' }); const spans = ordene.map(o => { const sp = h('span', {}, o); top.append(sp, ' '); return sp; });
      const tabel = h('table', { class: 'mini' }); tabel.innerHTML = '<thead><tr><th>nøgle (ord)</th><th>værdi (antal)</th></tr></thead>'; const tb = h('tbody'); tabel.append(tb);
      const wrap = h('div', { role: 'img', 'aria-label': `Ordene i sætningen "${ordene.join(' ')}" tælles ét ad gangen i en dictionary.` }); wrap.append(top, tabel); boks.append(wrap);
      const tilst = [{}]; const antal = {};
      ordene.forEach(o => { antal[o] = (antal[o] || 0) + 1; tilst.push(Object.assign({}, antal)); });
      trin(boks, tilst.length, n => {
        spans.forEach((sp, i) => (sp.className = i === n - 1 ? 'nu' : i < n - 1 ? 'set' : ''));
        tb.innerHTML = '';
        Object.entries(tilst[n]).forEach(([k, val]) => { const tr = h('tr', n > 0 && k === ordene[n - 1] ? { class: 'nu' } : {}); tr.append(h('td', {}, `"${k}"`), h('td', {}, String(val))); tb.append(tr); });
      }, tilst.map((_, n) => n === 0 ? 'antal = dict() er tom til at begynde med.' : (tilst[n][ordene[n - 1]] === 1 ? `"${ordene[n - 1]}" er ny: opret nøglen med værdien 1.` : `"${ordene[n - 1]}" findes allerede: læg 1 til.`)));
    },

    /* Join: to tabeller kobles på en nøgle. Rullemenuen vælger how=.
       venstre="id,kommune,alder;1,København,34;..."  hoejre="kommune,region;København,Hovedstaden;..."  noegle="kommune" */
    join(boks) {
      const laesTabel = n => { const r = attr(boks, n, '').split(';').map(x => x.split(',').map(y => y.trim())); return { kol: r[0], rk: r.slice(1) }; };
      const V = laesTabel('venstre'), H = laesTabel('hoejre'), key = attr(boks, 'noegle', V.kol[0]);
      const vi = V.kol.indexOf(key), hi = H.kol.indexOf(key), vn = attr(boks, 'venstrenavn', 'venstre'), hn = attr(boks, 'hoejrenavn', 'højre');
      const noegler = Array.from(new Set(V.rk.map(r => r[vi]).concat(H.rk.map(r => r[hi]))));
      const farve = k => 'nk' + (noegler.indexOf(k) % 6);
      const tegn = (T, ki, titel) => { const t = h('table', { class: 'mini' }); t.innerHTML = `<caption>${titel}</caption><thead><tr>${T.kol.map((k, i) => `<th${i === ki ? ' class="noegle"' : ''}>${k}</th>`).join('')}</tr></thead>`; const tb = h('tbody'); T.rk.forEach(r => { const tr = h('tr', { 'data-k': r[ki] }); r.forEach((c, i) => tr.append(h('td', i === ki ? { class: farve(r[ki]) } : {}, c))); tb.append(tr); }); t.append(tb); return t; };
      const tv = tegn(V, vi, vn), th = tegn(H, hi, hn), res = h('table', { class: 'mini resultat' });
      const id = 'join-' + Math.random().toString(36).slice(2, 7);
      const sel = h('select', { id }); ['inner', 'left', 'right', 'outer'].forEach(x => sel.append(h('option', { value: x }, x)));
      const lab = h('label', { for: id }, 'how = '); const st = h('div', { class: 'styring' }); st.append(lab, sel);
      const tekst = h('p', { class: 'figur-resultat', 'aria-live': 'polite' });
      const rk = h('div', { class: 'figur-tabeller' }); const pil = h('span', { class: 'figur-pil', 'aria-hidden': 'true' }, '→');
      rk.append(tv, th, pil, res); boks.append(st, rk, tekst);
      const andre = H.kol.filter((_, i) => i !== hi);
      const vis = () => {
        const how = sel.value, ud = [];
        V.rk.forEach(r => { const m = H.rk.filter(q => q[hi] === r[vi]); if (m.length) m.forEach(q => ud.push({ k: r[vi], c: r.concat(q.filter((_, i) => i !== hi)) })); else if (how === 'left' || how === 'outer') ud.push({ k: r[vi], c: r.concat(andre.map(() => null)) }); });
        if (how === 'right' || how === 'outer') H.rk.forEach(q => { if (!V.rk.some(r => r[vi] === q[hi])) ud.push({ k: q[hi], c: V.kol.map((_, i) => i === vi ? q[hi] : null).concat(q.filter((_, i) => i !== hi)) }); });
        const med = new Set(ud.map(u => u.k));
        [tv, th].forEach(t => t.querySelectorAll('tbody tr').forEach(tr => tr.classList.toggle('ude', !med.has(tr.dataset.k))));
        res.innerHTML = `<caption>resultat: ${ud.length} rækker</caption><thead><tr>${V.kol.concat(andre).map((k, i) => `<th${i === vi ? ' class="noegle"' : ''}>${k}</th>`).join('')}</tr></thead><tbody>` +
          ud.map(u => '<tr>' + u.c.map((c, i) => c === null ? '<td class="nan">NaN</td>' : `<td${i === vi ? ` class="${farve(u.k)}"` : ''}>${c}</td>`).join('') + '</tr>').join('') + '</tbody>';
        const tabt = noegler.filter(k => !med.has(k));
        tekst.textContent = { inner: 'inner: kun nøgler, der findes i begge tabeller.', left: `left: alle rækker fra ${vn}.`, right: `right: alle rækker fra ${hn}.`, outer: 'outer: alle nøgler fra begge tabeller.' }[how] +
          (tabt.length ? ' Ryger ud: ' + tabt.join(', ') + '.' : ' Ingen ryger ud.') + (ud.some(u => u.c.includes(null)) ? ' Huller bliver til NaN.' : '');
      };
      sel.addEventListener('change', vis); vis();
    },

    /* Langt ↔ bredt: raekker="København,2022,4.2;København,2023,3.8;..." kol="kommune,aar,ledighed" */
    omform(boks) {
      const kol = attr(boks, 'kol', 'enhed,variabel,vaerdi').split(',').map(x => x.trim());
      const rk = attr(boks, 'raekker', '').split(';').map(x => x.split(',').map(y => y.trim()));
      const enh = Array.from(new Set(rk.map(r => r[0]))), vars = Array.from(new Set(rk.map(r => r[1])));
      const lang = h('table', { class: 'mini' }), bred = h('table', { class: 'mini' });
      lang.innerHTML = `<caption>langt: ${rk.length} rækker</caption><thead><tr><th>${kol[0]}</th><th class="om-var">${kol[1]}</th><th class="om-val">${kol[2]}</th></tr></thead><tbody>` +
        rk.map(r => `<tr><td>${r[0]}</td><td class="om-var v${vars.indexOf(r[1])}">${r[1]}</td><td class="om-val v${vars.indexOf(r[1])}">${r[2]}</td></tr>`).join('') + '</tbody>';
      bred.innerHTML = `<caption>bredt: ${enh.length} rækker</caption><thead><tr><th>${kol[0]}</th>${vars.map((v, i) => `<th class="om-var v${i}">${v}</th>`).join('')}</tr></thead><tbody>` +
        enh.map(e => `<tr><td>${e}</td>${vars.map((v, i) => { const r = rk.find(q => q[0] === e && q[1] === v); return `<td class="om-val v${i}">${r ? r[2] : 'NaN'}</td>`; }).join('')}</tr>`).join('') + '</tbody>';
      const wrap = h('div', { class: 'figur-tabeller om', role: 'img', 'aria-label': `De samme ${rk.length} værdier vist i langt format med ${rk.length} rækker og i bredt format med ${enh.length} rækker, hvor værdierne i kolonnen ${kol[1]} er blevet til kolonnenavne.` });
      const pil = h('span', { class: 'figur-pil', 'aria-hidden': 'true' }, '⇄'); wrap.append(lang, pil, bred); boks.append(wrap);
      trin(boks, 4, n => { wrap.dataset.trin = n; }, [
        'Langt format: én række pr. observation.',
        `pivot, trin 1: værdierne i "${kol[1]}" bliver til kolonnenavne.`,
        `pivot, trin 2: tallene i "${kol[2]}" flytter ind under deres kolonne.`,
        `Bredt format: én række pr. ${kol[0]}. melt går den modsatte vej.`]);
    },

    /* ------------------------------------------------------------ lektion 4: grammatikken bag figurer */

    /* Anatomi: en kodelinje delt i navngivne dele.  dele='ggplot(;tweets;, ;aes(x="retweets");) + ;geom_histogram()'  navne=';data;;mapping;;geom' */
    anatomi(boks) {
      const dele = attr(boks, 'dele', '').split(';'), navne = attr(boks, 'navne', '').split(';');
      const linje = h('div', { class: 'anatomi', role: 'img', 'aria-label': 'Kodelinjen ' + dele.join('') + ' består af: ' + dele.map((d, i) => navne[i] ? `${navne[i].trim()} (${d.trim()})` : null).filter(Boolean).join(', ') + '.' });
      let nr = 0;
      dele.forEach((d, i) => {
        const navn = (navne[i] || '').trim();
        const sp = h('span', { class: navn ? 'del d' + (nr++ % 4) : 'fyld' });
        sp.append(h('code', {}, d));
        if (navn) sp.append(h('small', {}, navn));
        linje.append(sp);
      });
      boks.append(linje);
    },

    /* Kobling: kolonner i data → visuelle egenskaber.  par="maaned>x;antal_ord>y;har_hashtag>farve" */
    kobling(boks) {
      const par = attr(boks, 'par', '').split(';').map(x => x.split('>').map(y => y.trim()));
      const rh = 62, H = 40 + par.length * rh;
      const svg = s('svg', { viewBox: `0 0 520 ${H}`, role: 'img', 'aria-label': 'aes() kobler kolonner til visuelle egenskaber: ' + par.map(p => `${p[0]} styrer ${p[1]}`).join(', ') + '.' });
      svg.append(s('text', { x: 20, y: 18, class: 'svag', 'font-size': 14 }, attr(boks, 'venstre', 'kolonne i data')));
      svg.append(s('text', { x: 330, y: 18, class: 'svag', 'font-size': 14 }, attr(boks, 'hoejre', 'visuel egenskab (aesthetic)')));
      par.forEach((p, i) => {
        const y = 32 + i * rh;
        svg.append(s('rect', { x: 20, y, width: 190, height: 44, rx: 6, class: 'kasse' }), s('text', { x: 115, y: y + 28, 'text-anchor': 'middle', class: 'mono', 'font-size': 17 }, p[0]));
        svg.append(s('path', { d: `M 218 ${y + 22} H 318 m -10 -7 l 10 7 l -10 7`, 'stroke-width': 2.5, class: 'accent-streg' }));
        svg.append(s('rect', { x: 330, y, width: 170, height: 44, rx: 22, class: 'kasse-accent' }), s('text', { x: 415, y: y + 28, 'text-anchor': 'middle', class: 'mono accent-tekst', 'font-size': 17, 'font-weight': 700 }, p[1]));
      });
      boks.append(svg);
    },

    /* Stak: lag, der lægges oven på hinanden ét ad gangen.  lag="data|tweets;mapping|aes(x, y);geom|geom_point()"  faste="3" */
    stak(boks) {
      const lag = attr(boks, 'lag', '').split(';').map(x => x.split('|').map(y => y.trim())), faste = +attr(boks, 'faste', lag.length);
      const lh = 50, H = 30 + lag.length * lh;
      const svg = s('svg', { viewBox: `0 0 540 ${H}`, role: 'img', 'aria-label': 'En figur bygges i lag: ' + lag.map((l, i) => `${l[0]} (${l[1]})` + (i < faste ? ', obligatorisk' : ', valgfrit')).join('; ') + '.' });
      const gr = lag.map((l, i) => {
        const y = H - 20 - (i + 1) * lh, g = s('g');
        g.append(s('path', { d: `M 40 ${y + 40} L 70 ${y + 6} H 520 L 490 ${y + 40} Z`, class: i < faste ? 'kasse-accent' : 'kasse', 'stroke-width': 1.5 }));
        g.append(s('text', { x: 90, y: y + 30, 'font-size': 16, 'font-weight': 700, class: i < faste ? 'accent-tekst' : '' }, l[0]));
        g.append(s('text', { x: 210, y: y + 30, class: 'mono', 'font-size': 15 }, (i ? '+ ' : '') + l[1]));
        svg.append(g); return g;
      });
      boks.append(svg);
      trin(boks, lag.length, n => gr.forEach((g, i) => { g.style.opacity = i <= n ? 1 : 0; g.style.transform = i <= n ? 'none' : 'translateY(-18px)'; }),
        lag.map((l, i) => `${i + 1}. ${l[0]}` + (i < faste ? ' (skal med)' : ' (valgfrit)') + (l[2] ? ': ' + l[2] : '')));
    },

    /* ------------------------------------------------------------ lektion 6-7: tekst som data */

    /* Rens: preprocessing af én sætning, ét trin ad gangen. Tæller tokens og typer undervejs.
       tekst="Vi søger 2 erfarne ..."  stopord="vi,en,til,i,og" */
    rens(boks) {
      const raa = attr(boks, 'tekst', '').split(/\s+/).filter(Boolean);
      const stop = new Set(attr(boks, 'stopord', 'og,i,en,til,vi,at,er,på,med,for,der,den,det,de').split(',').map(x => x.trim()));
      const tegn = /^[\s.,;:!?()"'«»…–—-]+|[\s.,;:!?()"'«»…–—-]+$/g;
      const trinListe = [{ navn: 'Råt: .split()', f: w => w }, { navn: 'L: små bogstaver', f: w => w.toLowerCase() }, { navn: 'P: fjern tegnsætning', f: w => w.replace(tegn, '') },
        { navn: 'N: fjern tal', f: w => (/^\d+([.,]\d+)?$/.test(w) ? '' : w) }, { navn: 'W: fjern stopord', f: w => (stop.has(w) ? '' : w) }];
      const tilst = []; let nu = raa.map(w => ({ w, ny: false, vaek: false }));
      trinListe.forEach((tr, k) => {
        nu = nu.map(o => { if (o.vaek) return { w: o.w, vaek: true, gammel: true }; const n = tr.f(o.w); return n === '' ? { w: o.w, vaek: true } : { w: n, ny: k > 0 && n !== o.w }; });
        tilst.push(nu);
      });
      const linje = h('p', { class: 'figur-ord rens' }), tael = h('p', { class: 'figur-resultat', 'aria-live': 'polite' });
      const wrap = h('div', { role: 'img', 'aria-label': 'En sætning renses i fem trin: opdeling i ord, små bogstaver, fjern tegnsætning, fjern tal og fjern stopord. Antallet af tokens og typer vises efter hvert trin.' });
      wrap.append(linje); boks.append(wrap, tael);
      trin(boks, tilst.length, n => {
        linje.innerHTML = '';
        tilst[n].filter(o => !o.gammel).forEach(o => { linje.append(h('span', { class: o.vaek ? 'vaek' : o.ny ? 'nu' : '' }, o.w), ' '); });
        const lev = tilst[n].filter(o => !o.vaek).map(o => o.w);
        tael.innerHTML = `<strong>${lev.length}</strong> tokens · <strong>${new Set(lev).size}</strong> typer (unikke ord)`;
      }, trinListe.map(x => x.navn));
    },

    /* Søjler: to serier, der følger hinanden gennem en række trin.
       serier="Tokens,Typer"  raekker="Råt|4546976|174336;+ små bogstaver|4546976|157174" */
    soejler(boks) {
      const serier = attr(boks, 'serier', 'A,B').split(','), rk = attr(boks, 'raekker', '').split(';').map(x => x.split('|').map(y => y.trim()));
      const rh = 44, B = 760, x1 = 215, bw = 215, x2 = x1 + bw + 60, H = 36 + rk.length * rh;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': rk.map(r => `${r[0]}: ${tal(r[1])} ${serier[0]}, ${tal(r[2])} ${serier[1]}`).join('. ') + '.' });
      svg.append(s('text', { x: x1, y: 18, 'font-size': 15, 'font-weight': 700 }, serier[0]), s('text', { x: x2, y: 18, 'font-size': 15, 'font-weight': 700, class: 'accent-tekst' }, serier[1]));
      const m1 = +rk[0][1], m2 = +rk[0][2];
      const gr = rk.map((r, i) => {
        const y = 30 + i * rh, g = s('g');
        g.append(s('text', { x: x1 - 12, y: y + 22, 'text-anchor': 'end', 'font-size': 15 }, r[0]));
        g.append(s('rect', { x: x1, y: y + 4, width: Math.max(2, (+r[1] / m1) * bw), height: 26, rx: 4, class: 'kasse', style: 'fill: var(--tekst-svag)' }));
        g.append(s('text', { x: x1 + (+r[1] / m1) * bw + 8, y: y + 23, class: 'mono', 'font-size': 14 }, Math.round((+r[1] / m1) * 100) + ' %'));
        g.append(s('rect', { x: x2, y: y + 4, width: Math.max(2, (+r[2] / m2) * bw), height: 26, rx: 4, class: 'accent-fyld' }));
        g.append(s('text', { x: x2 + (+r[2] / m2) * bw + 8, y: y + 23, class: 'mono', 'font-size': 14 }, Math.round((+r[2] / m2) * 100) + ' %'));
        svg.append(g); return g;
      });
      boks.append(svg);
      trin(boks, rk.length, n => gr.forEach((g, i) => (g.style.opacity = i <= n ? 1 : 0)),
        rk.map((r, i) => `${r[0]}: ${tal(r[1])} ${serier[0].toLowerCase()} og ${tal(r[2])} ${serier[1].toLowerCase()}.`));
    },

    /* DTM: fra ét ord pr. række til én række pr. dokument.  dok="erfaring erfaring udvikling|team team|erfaring" */
    dtm(boks) {
      const dok = attr(boks, 'dok', '').split('|').map(d => d.trim().split(/\s+/)), navn = attr(boks, 'navn', 'Tekst');
      const ordene = Array.from(new Set(dok.flat())).sort((a, b) => a.localeCompare(b, 'da'));
      const par = []; dok.forEach((d, i) => d.forEach(w => par.push([i, w])));
      const lang = h('table', { class: 'mini' }); lang.innerHTML = `<caption>tidy: ét ord pr. række</caption><thead><tr><th>dokument</th><th>ord</th></tr></thead><tbody>${par.map(p => `<tr><td>${navn} ${p[0] + 1}</td><td>${p[1]}</td></tr>`).join('')}</tbody>`;
      const bred = h('table', { class: 'mini' }); bred.innerHTML = `<caption>document-term matrix</caption><thead><tr><th></th>${ordene.map(o => `<th>${o}</th>`).join('')}</tr></thead><tbody>${dok.map((d, i) => `<tr><th>${navn} ${i + 1}</th>${ordene.map(() => '<td>0</td>').join('')}</tr>`).join('')}</tbody>`;
      const wrap = h('div', { class: 'figur-tabeller', role: 'img', 'aria-label': `Ordene tælles op til en document-term matrix med ${dok.length} rækker (dokumenter) og ${ordene.length} kolonner (ord).` });
      wrap.append(lang, h('span', { class: 'figur-pil', 'aria-hidden': 'true' }, '→'), bred); boks.append(wrap);
      const lr = Array.from(lang.querySelectorAll('tbody tr')), celle = (i, w) => bred.querySelectorAll('tbody tr')[i].querySelectorAll('td')[ordene.indexOf(w)];
      trin(boks, par.length + 1, n => {
        bred.querySelectorAll('td').forEach(td => { td.textContent = '0'; td.className = ''; });
        par.slice(0, n).forEach(p => { const c = celle(p[0], p[1]); c.textContent = +c.textContent + 1; });
        bred.querySelectorAll('td').forEach(td => { if (td.textContent === '0') td.className = 'nul'; });
        lr.forEach((tr, i) => (tr.className = i === n - 1 ? 'nu' : i < n - 1 ? 'set' : ''));
        if (n > 0) celle(par[n - 1][0], par[n - 1][1]).className = 'nk1';
      }, [`Tom matrix: ${dok.length} dokumenter × ${ordene.length} ord.`].concat(par.map(p => `"${p[1]}" i ${navn} ${p[0] + 1}: læg 1 til cellen.`)));
    },

    /* Tegn: hvad computeren ser. Skriv en tekst, og se tegn, tal og bits. */
    tegn(boks) {
      const id = 'tegn-' + Math.random().toString(36).slice(2, 7);
      const ind = h('input', { type: 'text', id, value: attr(boks, 'tekst', 'Hej med dig!'), maxlength: 14, style: 'font:500 22px var(--skrift-kode);padding:6px 12px;border-radius:8px;border:2px solid var(--accent);background:var(--papir);color:var(--tekst);width:14em' });
      const st = h('div', { class: 'styring' }); st.append(h('label', { for: id }, 'Skriv en tekst: '), ind);
      const tabel = h('table', { class: 'mini tegn', 'aria-live': 'polite' }); boks.append(st, tabel);
      const vis = () => {
        const tegnene = Array.from(ind.value), enc = new TextEncoder();
        const rk = [['Det, vi ser', c => (c === ' ' ? '␣' : c)], ['Tal (kodepunkt)', c => c.codePointAt(0)], ['Bits (UTF-8)', c => Array.from(enc.encode(c)).map(b => b.toString(2).padStart(8, '0')).join(' ')]];
        tabel.innerHTML = '<tbody>' + rk.map((r, i) => `<tr><th>${r[0]}</th>${tegnene.map(c => `<td class="${i === 0 ? 'stor' : ''}">${r[1](c)}</td>`).join('')}</tr>`).join('') + '</tbody>';
      };
      ind.addEventListener('input', vis); ind.addEventListener('keydown', e => e.stopPropagation()); vis();
    },

    /* Ordbog: slå hvert ord op, og læg sammen.  tekst="Det er ikke en god beslutning"  ordbog="god:2,frihed:3,krise:-2" */
    ordbog(boks) {
      const ordene = attr(boks, 'tekst', '').split(/\s+/).filter(Boolean), bog = {};
      attr(boks, 'ordbog', '').split(',').forEach(x => { const [k, v] = x.split(':'); if (k) bog[k.trim()] = +v; });
      const linje = h('p', { class: 'figur-ord' }); const sp = ordene.map(o => { const e = h('span', {}, o); linje.append(e, ' '); return e; });
      const sum = h('p', { class: 'figur-resultat', 'aria-live': 'polite' });
      const wrap = h('div', { role: 'img', 'aria-label': `Sætningen "${ordene.join(' ')}" scores ved at slå hvert ord op i en ordbog og lægge værdierne sammen.` }); wrap.append(linje); boks.append(wrap, sum);
      const v = ordene.map(o => bog[o.toLowerCase().replace(/[.,!?]/g, '')]);
      trin(boks, ordene.length + 1, n => {
        let total = 0;
        sp.forEach((e, i) => { e.className = i === n - 1 ? 'nu' : i < n - 1 ? 'set' : ''; e.dataset.v = ''; if (i < n && v[i] !== undefined) { total += v[i]; e.className += ' fundet'; e.dataset.v = (v[i] > 0 ? '+' : '') + v[i]; } });
        sum.innerHTML = `score = <strong>${total > 0 ? '+' : ''}${total}</strong>`;
      }, ['Start: score = 0.'].concat(ordene.map((o, i) => v[i] === undefined ? `"${o}" står ikke i ordbogen: tæller 0.` : `"${o}" står i ordbogen: ${v[i] > 0 ? '+' : ''}${v[i]}.`)));
    },

    /* TF-IDF på tre små dokumenter. Samme formel som i koden: tf = andel af dokumentets ord, idf = ln(N / antal dokumenter med ordet).
       dok="skat skat afgift lov|skole elever lov|skat skole lov" */
    tfidf(boks) {
      const dok = attr(boks, 'dok', '').split('|').map(d => d.trim().split(/\s+/)), N = dok.length;
      const ordene = Array.from(new Set(dok.flat())), df = o => dok.filter(d => d.includes(o)).length;
      const f = x => x.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const tabel = h('table', { class: 'mini' });
      const wrap = h('div', { role: 'img', 'aria-label': 'TF-IDF for tre små dokumenter: ord, der står i alle dokumenter, får vægten 0. Ord, der er hyppige i ét dokument og sjældne i de andre, får høj vægt.' }); wrap.append(tabel); boks.append(wrap);
      const tegn = n => {
        const celle = (d, o) => { const tf = d.filter(x => x === o).length / d.length, idf = Math.log(N / df(o)); return n === 0 ? d.filter(x => x === o).length : n === 1 ? f(tf) : n === 2 ? f(tf) + ' × ' + f(idf) : f(tf * idf); };
        tabel.innerHTML = `<caption>${['Antal', 'TF: andel af dokumentets ord', 'TF × IDF', 'TF-IDF'][n]}</caption><thead><tr><th></th>${ordene.map(o => `<th>${o}</th>`).join('')}</tr></thead><tbody>` +
          dok.map((d, i) => `<tr><th>Dok. ${i + 1}</th>${ordene.map(o => { const c = d.filter(x => x === o).length; const w = (c / d.length) * Math.log(N / df(o)); return `<td class="${n === 3 && w > 0 ? 'nk1' : c === 0 || (n === 3 && w === 0) ? 'nul' : ''}">${celle(d, o)}</td>`; }).join('')}</tr>`).join('') +
          (n >= 2 ? `<tr><th>IDF = ln(${N} / dok. med ordet)</th>${ordene.map(o => `<td>${f(Math.log(N / df(o)))}</td>`).join('')}</tr>` : '') + '</tbody>';
      };
      trin(boks, 4, tegn, ['Rå optælling: hvor mange gange står ordet i dokumentet?', 'TF: divider med dokumentets længde, så lange og korte dokumenter kan sammenlignes.', 'IDF: ord, der står i alle dokumenter, får ln(1) = 0. Sjældne ord får en høj værdi.', 'TF-IDF: høj, når ordet er hyppigt HER og sjældent ANDRE steder.']);
    },

    /* PCA: find retningen med størst spredning, og projicér punkterne ned på den (opdigtede punkter) */
    pca(boks) {
      let frø = 7; const rnd = () => (frø = (frø * 16807) % 2147483647) / 2147483647, norm = () => Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd());
      const P = Array.from({ length: 28 }, () => { const a = norm() * 1.6, b = norm() * 0.45; return [a * 0.82 - b * 0.57, a * 0.57 + b * 0.82]; });
      const mx = P.reduce((q, p) => q + p[0], 0) / P.length, my = P.reduce((q, p) => q + p[1], 0) / P.length;
      const C = P.map(p => [p[0] - mx, p[1] - my]);
      const sxx = C.reduce((q, p) => q + p[0] * p[0], 0), syy = C.reduce((q, p) => q + p[1] * p[1], 0), sxy = C.reduce((q, p) => q + p[0] * p[1], 0);
      const l1 = (sxx + syy) / 2 + Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy), vinkel = Math.atan2(l1 - sxx, sxy), ux = Math.cos(vinkel), uy = Math.sin(vinkel), andel = l1 / (sxx + syy);
      const B = 520, H = 330, sk = 62, X = x => B / 2 + x * sk, Y = y => H / 2 - y * sk;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': `En punktsky i to dimensioner. PCA finder den retning, hvor punkterne er mest spredt, og projicerer dem ned på den. Den første akse beholder ${Math.round(andel * 100)} procent af spredningen.` });
      svg.append(s('line', { x1: 30, x2: B - 20, y1: H - 26, y2: H - 26, class: 'streg' }), s('line', { x1: 30, x2: 30, y1: 14, y2: H - 26, class: 'streg' }));
      svg.append(s('text', { x: B - 22, y: H - 8, 'text-anchor': 'end', class: 'svag', 'font-size': 13 }, 'ord A (fx "skat")'), s('text', { x: 38, y: 24, class: 'svag', 'font-size': 13 }, 'ord B (fx "afgift")'));
      const akse = s('line', { x1: X(-ux * 3.6), y1: Y(-uy * 3.6), x2: X(ux * 3.6), y2: Y(uy * 3.6), 'stroke-width': 3, class: 'accent-streg' });
      const mrk = s('text', { x: X(ux * 3.1) - 6, y: Y(uy * 3.1) - 12, 'text-anchor': 'end', class: 'accent-tekst', 'font-size': 15, 'font-weight': 700 }, 'PC1');
      svg.append(akse, mrk);
      const streger = C.map(p => { const t = p[0] * ux + p[1] * uy; const l = s('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(t * ux), y2: Y(t * uy), 'stroke-dasharray': '3 3', class: 'streg' }); svg.append(l); return l; });
      const prikker = C.map(p => { const c = s('circle', { r: 6, class: 'accent-fyld', style: 'transition: cx 0.8s, cy 0.8s, opacity 0.3s' }); svg.append(c); return c; });
      boks.append(svg);
      trin(boks, 4, n => {
        akse.style.opacity = mrk.style.opacity = n >= 1 ? 1 : 0;
        streger.forEach(l => (l.style.opacity = n === 2 ? 0.7 : 0));
        C.forEach((p, i) => { const t = p[0] * ux + p[1] * uy; const [x, y] = n >= 3 ? [t * ux, t * uy] : p; prikker[i].setAttribute('cx', X(x)); prikker[i].setAttribute('cy', Y(y)); prikker[i].style.cx = X(x) + 'px'; prikker[i].style.cy = Y(y) + 'px'; });
      }, ['Hvert punkt er et dokument. Her kun to ord, altså to dimensioner.', 'PC1 er den retning, hvor punkterne er mest spredt.', 'Hvert punkt har en plads langs PC1 (de stiplede linjer).', `Nu beskrives hvert punkt med ét tal i stedet for to. PC1 beholder ${Math.round(andel * 100)} % af spredningen.`]);
    },

    /* k-means trin for trin (opdigtede punkter). Skyderen vælger k. */
    kmeans(boks) {
      const farver = ['#2F6FB0', '#B4501F', '#13756F', '#7A5CC0', '#8A6100', '#B3261E'];
      let frø = 11; const rnd = () => (frø = (frø * 16807) % 2147483647) / 2147483647, norm = () => Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd());
      const centre = [[1.6, 1.3], [5.2, 1.6], [3.3, 4.2], [6.3, 4.6]], P = [];
      centre.forEach(c => { for (let i = 0; i < 14; i++) P.push([c[0] + norm() * 0.62, c[1] + norm() * 0.55]); });
      const B = 520, H = 340, X = x => 30 + x * 60, Y = y => H - 20 - y * 54;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': 'k-means: punkter tildeles det nærmeste centrum, centrene flyttes til gennemsnittet af deres punkter, og de to trin gentages, til intet ændrer sig.' });
      const prikker = P.map(p => { const c = s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 6, style: 'transition: fill 0.4s; fill: var(--tekst-svag)' }); svg.append(c); return c; });
      const g = s('g'); svg.append(g); boks.append(svg);
      const id = 'km-' + Math.random().toString(36).slice(2, 7);
      const sk = h('input', { type: 'range', min: 2, max: 6, value: 4, id }), ud = h('output', { for: id }, '4');
      const naeste = h('button', { type: 'button' }, 'Næste trin'), forfra = h('button', { type: 'button', class: 'sek' }, 'Forfra'), tekst = h('span', { 'aria-live': 'polite' });
      const st = h('div', { class: 'styring' }); st.append(h('label', { for: id }, 'Antal klynger (k)'), sk, ud);
      const rk = h('div', { class: 'figur-knapper' }); rk.append(naeste, forfra, tekst); boks.append(st, rk);
      let k, M, til, fase, runde, faerdig;
      const tegnCentre = () => { g.innerHTML = ''; M.forEach((m, j) => { const x = X(m[0]), y = Y(m[1]); g.append(s('path', { d: `M ${x - 11} ${y} H ${x + 11} M ${x} ${y - 11} V ${y + 11}`, stroke: farver[j], 'stroke-width': 6, 'stroke-linecap': 'round', style: 'transition: all 0.5s' })); }); };
      const start = () => {
        k = +sk.value; ud.textContent = k; fase = 0; runde = 0; faerdig = false; til = P.map(() => -1);
        const valgt = []; let f2 = 3 + k; while (valgt.length < k) { f2 = (f2 * 16807) % 2147483647; const i = f2 % P.length; if (!valgt.includes(i)) valgt.push(i); }
        M = valgt.map(i => P[i].slice()); prikker.forEach(c => (c.style.fill = 'var(--tekst-svag)')); tegnCentre();
        tekst.textContent = `Start: ${k} centre lægges tilfældigt (krydserne).`; naeste.disabled = false; naeste.style.opacity = 1;
      };
      naeste.addEventListener('click', e => {
        e.stopPropagation(); if (faerdig) return;
        if (fase === 0) {
          const ny = P.map(p => { let b = 0, bd = Infinity; M.forEach((m, j) => { const d2 = (p[0] - m[0]) ** 2 + (p[1] - m[1]) ** 2; if (d2 < bd) { bd = d2; b = j; } }); return b; });
          const skift = ny.filter((x, i) => x !== til[i]).length; til = ny; runde++;
          prikker.forEach((c, i) => (c.style.fill = farver[til[i]]));
          if (skift === 0) { faerdig = true; tekst.textContent = `Ingen punkter skifter klynge: færdig efter ${runde - 1} runder.`; naeste.disabled = true; naeste.style.opacity = 0.45; return; }
          tekst.textContent = `Runde ${runde}, trin 1: hvert punkt får farve efter det nærmeste centrum (${skift} skifter).`; fase = 1;
        } else {
          M = M.map((m, j) => { const mine = P.filter((_, i) => til[i] === j); return mine.length ? [mine.reduce((q, p) => q + p[0], 0) / mine.length, mine.reduce((q, p) => q + p[1], 0) / mine.length] : m; });
          tegnCentre(); tekst.textContent = `Runde ${runde}, trin 2: hvert centrum flytter til gennemsnittet af sine punkter.`; fase = 0;
        }
      });
      forfra.addEventListener('click', e => { e.stopPropagation(); start(); });
      sk.addEventListener('input', start); start();
    },

    /* Gruppe: del op → regn → saml (groupby).  raekker="Hovedstaden,15400;Syddanmark,18500;..."  kol="region,indkomst" */
    gruppe(boks) {
      const kol = attr(boks, 'kol', 'gruppe,vaerdi').split(','), rk = attr(boks, 'raekker', '').split(';').map(x => x.split(',').map(y => y.trim()));
      const grupper = Array.from(new Set(rk.map(r => r[0])));
      const data = h('table', { class: 'mini' }), midt = h('div', { class: 'figur-grupper' }), res = h('table', { class: 'mini' });
      data.innerHTML = `<caption>1 · data</caption><thead><tr><th>${kol[0]}</th><th>${kol[1]}</th></tr></thead><tbody>${rk.map(r => `<tr><td class="nk${grupper.indexOf(r[0]) % 6}">${r[0]}</td><td>${tal(r[1])}</td></tr>`).join('')}</tbody>`;
      midt.innerHTML = grupper.map((g, i) => { const v = rk.filter(r => r[0] === g).map(r => +r[1]); return `<table class="mini"><caption>${g}</caption><tbody>${v.map(x => `<tr><td class="nk${i % 6}">${tal(x)}</td></tr>`).join('')}</tbody></table>`; }).join('');
      res.innerHTML = `<caption>3 · resultat</caption><thead><tr><th>${kol[0]}</th><th>gennemsnit</th></tr></thead><tbody>${grupper.map((g, i) => { const v = rk.filter(r => r[0] === g).map(r => +r[1]); return `<tr><td class="nk${i % 6}">${g}</td><td>${tal(v.reduce((a, b) => a + b, 0) / v.length)}</td></tr>`; }).join('')}</tbody>`;
      const p1 = h('span', { class: 'figur-pil', 'aria-hidden': 'true' }, '→'), p2 = h('span', { class: 'figur-pil', 'aria-hidden': 'true' }, '→');
      const wrap = h('div', { class: 'figur-tabeller', role: 'img', 'aria-label': `Rækkerne deles op efter ${kol[0]}, gennemsnittet af ${kol[1]} regnes ud i hver gruppe, og resultaterne samles i én tabel.` });
      wrap.append(data, p1, midt, p2, res); boks.append(wrap);
      trin(boks, 3, n => { midt.style.opacity = p1.style.opacity = n >= 1 ? 1 : 0; res.style.opacity = p2.style.opacity = n >= 2 ? 1 : 0; },
        ['Én tabel. Farven viser, hvilken gruppe rækken hører til.', `groupby("${kol[0]}"): del rækkerne op i grupper.`, '.mean(): regn gennemsnittet i hver gruppe, og saml svarene i én tabel.']);
    },

    /* Maske: sammenlign én ad gangen (løkke) eller hele kolonnen på én gang */
    maske(boks) {
      const v = laes(boks), g = Number(attr(boks, 'graense', 0)), navn = attr(boks, 'navn', 'kolonne');
      const svar = v.map(x => x > g), antal = svar.filter(Boolean).length;
      const rh = 38, B = 560, H = 54 + v.length * rh + 44;
      const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, role: 'img', 'aria-label': `Kolonnen ${navn} med værdierne ${v.map(tal).join(', ')} sammenlignes med ${tal(g)}. Resultatet er ${svar.map(b => b ? 'True' : 'False').join(', ')}: ${antal} er True.` });
      svg.append(s('text', { x: 40, y: 22, class: 'mono', 'font-size': 15, 'font-weight': 700 }, navn));
      svg.append(s('text', { x: 235, y: 22, class: 'mono svag', 'font-size': 15 }, `> ${g} ?`));
      svg.append(s('text', { x: 400, y: 22, class: 'mono', 'font-size': 15, 'font-weight': 700 }, 'svar'));
      const raekker = v.map((x, i) => {
        const y = 34 + i * rh, grp = s('g');
        grp.append(s('rect', { x: 30, y, width: 150, height: rh - 8, rx: 6, class: 'kasse' }));
        grp.append(s('text', { x: 165, y: y + 21, 'text-anchor': 'end', class: 'mono', 'font-size': 16 }, tal(x)));
        const pil = s('path', { d: `M 195 ${y + 15} H 375 m -9 -6 l 9 6 l -9 6`, 'stroke-width': 2, class: 'streg pil' });
        const chip = s('g', { class: 'chip-svar' });
        chip.append(s('rect', { x: 390, y, width: 110, height: rh - 8, rx: 15, class: svar[i] ? 'kasse-accent' : 'kasse' }));
        chip.append(s('text', { x: 445, y: y + 21, 'text-anchor': 'middle', class: 'mono' + (svar[i] ? ' accent-tekst' : ' svag'), 'font-size': 16, 'font-weight': 700 }, svar[i] ? 'True' : 'False'));
        grp.append(pil, chip); svg.append(grp);
        return { grp, pil, chip };
      });
      const sumtekst = s('text', { x: 30, y: H - 12, 'font-size': 17, 'font-weight': 600, class: 'accent-tekst' }, `${antal} af ${v.length} er True`);
      svg.append(sumtekst); boks.append(svg);

      const besked = h('span', { 'aria-live': 'polite' });
      const en = h('button', { type: 'button' }, 'Én ad gangen (løkke)');
      const alle = h('button', { type: 'button' }, 'Hele kolonnen på én gang');
      const rk = h('div', { class: 'figur-knapper' }); rk.append(en, alle, besked); boks.append(rk);
      let ure = [];
      const nulstil = () => { ure.forEach(clearTimeout); ure = []; raekker.forEach(r => { r.pil.style.opacity = 0; r.chip.style.opacity = 0; r.grp.style.opacity = 1; }); sumtekst.style.opacity = 0; };
      const visAlle = () => { raekker.forEach(r => { r.pil.style.opacity = 1; r.chip.style.opacity = 1; r.grp.style.opacity = 1; }); sumtekst.style.opacity = 1; };
      en.addEventListener('click', e => {
        e.stopPropagation(); nulstil();
        besked.textContent = `Løkken spørger ${v.length} gange: én række ad gangen.`;
        if (rolig()) return visAlle();
        raekker.forEach((r, i) => ure.push(setTimeout(() => {
          raekker.forEach((q, j) => { q.grp.style.opacity = j === i ? 1 : 0.35; });
          r.pil.style.opacity = 1; r.chip.style.opacity = 1;
          if (i === raekker.length - 1) ure.push(setTimeout(visAlle, 650));
        }, 150 + i * 650)));
      });
      alle.addEventListener('click', e => {
        e.stopPropagation(); nulstil();
        besked.textContent = 'Vektoriseret: ét spørgsmål til hele kolonnen. Svaret er en ny kolonne af True/False.';
        ure.push(setTimeout(visAlle, rolig() ? 0 : 150));
      });
      nulstil();
      besked.textContent = 'Vælg, hvordan spørgsmålet skal stilles.';
    }
  };

  const start = () => document.querySelectorAll('.figur[data-figur], .figur[figur]').forEach(boks => {
    const f = figurer[attr(boks, 'figur', '')];
    if (f && !boks.dataset.klar) { boks.dataset.klar = '1'; try { f(boks); } catch (e) { console.error('sds1-figur:', e); } }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.sds1 = window.sds1 || {}; window.sds1.figurer = figurer;
})();
