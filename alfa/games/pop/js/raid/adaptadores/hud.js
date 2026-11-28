// Fans of Pop · RAID, los rótulos de la pantalla (adaptador de pantalla, tarea 448, nodo n4): todo lo que es texto y botón, en HTML encima del
// lienzo (css/raid.css): la cabecera (título, lo que queda de semana, cerrar y la BARRA DE VIDA del tablero o del jefe), el bocadillo del CEO, el
// chat falso, los botones de acercar y alejar, el aviso grande (sin cuenta, sin red, raid acabada) y el pie (la BARRA DE OBJETOS, el DEPÓSITO DE
// TOQUES y el premio).
// · crea({ raiz, tr, icono, alCerrar, alZoom, alPedir, objetos, alObjeto }) → { muestra(si), estado(s, o), objetos(lista), di(frase), chat(m), aviso(texto),
//   sacudeDeposito(), zoom(cerca) }. `objetos` = [{ k, icono, nombre }] (los botones de la barra; al tocar uno, alObjeto(k)) y objetos(lista) los
//   pone al día con [{ k, n (cuántos quedan), elegido }].
//   `icono(k, px)` da el HTML de un dibujito de Pop (ppIcono). `tr` traduce; los números los escribe con puntos de millar. No sabe nada de la red ni del tablero: solo pinta lo que le dan.
'use strict';
const PP_RAID_HUD = (() => {
  const ALTO = Object.freeze({ cabecera: 132, pie: 262 });
  const CHAT_LINEAS = 4, CHAT_MS = 6500, BOCADILLO_MS = 3800;
  const miles = n => String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dos = n => String(n).padStart(2, '0');
  const HTML = `
    <div class="pp-raid-cab">
      <b class="pp-raid-titulo"></b><span class="pp-raid-queda"></span><button type="button" class="pp-raid-x" aria-label="X"></button>
      <div class="pp-raid-barra pp-raid-vida"><i></i><span class="pp-raid-ico" data-k="i-burbujas" data-px="34"></span><b></b></div>
    </div>
    <p class="pp-raid-bocadillo" hidden></p>
    <div class="pp-raid-pedir" hidden><button type="button" class="pp-btn2 pp-verde"></button></div>
    <div class="pp-raid-chat"></div>
    <div class="pp-raid-zoom"><button type="button" class="pp-raid-mas">+</button><button type="button" class="pp-raid-menos">&minus;</button></div>
    <p class="pp-raid-aviso" hidden></p>
    <div class="pp-raid-pie">
      <div class="pp-raid-objetos"></div>
      <div class="pp-raid-fila"><span class="pp-raid-junto"><span class="pp-raid-ico" data-k="i-mano" data-px="40"></span><b class="pp-raid-toques"></b></span><span class="pp-raid-recarga"></span></div>
      <div class="pp-raid-barra pp-raid-deposito"><i></i></div>
      <div class="pp-raid-fila"><span class="pp-raid-junto"><span class="pp-raid-ico" data-k="i-moneda" data-px="28"></span><span class="pp-raid-llevas"></span></span></div>
      <div class="pp-raid-barra pp-raid-premio"><i></i></div>
    </div>`;

  function crea({ raiz, tr, icono, alCerrar, alZoom, alPedir, objetos: botones = [], alObjeto = () => {} }) {
    const caja = document.createElement('div');
    caja.id = 'pp-raid'; caja.hidden = true; caja.innerHTML = HTML;
    raiz.appendChild(caja);
    const $ = s => caja.querySelector(s);
    const relojes = { bocadillo: null };
    for (const hueco of caja.querySelectorAll('.pp-raid-ico')) hueco.innerHTML = icono(hueco.dataset.k, Number(hueco.dataset.px));   // los dibujitos de Pop
    for (const o of botones) $('.pp-raid-objetos').appendChild(botonObjeto(o));
    $('.pp-raid-x').onclick = alCerrar;
    $('.pp-raid-pedir button').textContent = tr('PEDIR AYUDA');
    $('.pp-raid-pedir button').onclick = e => alPedir(e.currentTarget);
    $('.pp-raid-mas').onclick = () => alZoom(1);
    $('.pp-raid-menos').onclick = () => alZoom(-1);
    $('.pp-raid-mas').setAttribute('aria-label', tr('Acercar'));
    $('.pp-raid-menos').setAttribute('aria-label', tr('Alejar'));
    $('.pp-raid-x').setAttribute('aria-label', tr('Cerrar'));

    // un botón de la barra de objetos: su dibujo de Pop y cuántos quedan
    function botonObjeto(o) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pp-raid-obj'; b.dataset.k = o.k;
      b.setAttribute('aria-label', tr(o.nombre));
      b.innerHTML = icono(o.icono, 58) + '<b></b>';
      b.onclick = () => alObjeto(o.k);
      return b;
    }
    // lista = [{ k, n, elegido }]: cuántos quedan de cada objeto y cuál está elegido para el siguiente toque
    function objetos(lista) {
      for (const o of lista) {
        const b = $('.pp-raid-obj[data-k="' + o.k + '"]');
        if (!b) continue;
        b.querySelector('b').textContent = 'x' + o.n;
        b.classList.toggle('pp-raid-elegido', !!o.elegido);
        b.classList.toggle('pp-raid-sin', o.n < 1);
        b.setAttribute('aria-pressed', o.elegido ? 'true' : 'false');
      }
    }
    const ancho = (sel, parte) => { $(sel + ' i').style.width = Math.max(0, Math.min(100, parte * 100)).toFixed(1) + '%'; };
    // «Quedan 3 d 4 h», «Quedan 4 h 12 min» o «Quedan 3:05»
    function queda(p) {
      if (p.dias) return tr('Quedan {d} d {h} h', { d: p.dias, h: p.horas });
      if (p.horas) return tr('Quedan {h} h {m} min', { h: p.horas, m: p.minutos });
      return tr('Quedan {t}', { t: p.minutos + ':' + dos(p.segundos) });
    }
    function vida(s) {
      const jefe = s.jefe.activo;
      $('.pp-raid-vida').classList.toggle('pp-raid-jefe', jefe);
      if (jefe) { ancho('.pp-raid-vida', 1 - s.jefe.golpes / s.jefe.vida); $('.pp-raid-vida b').textContent = tr('Jefe CEO: {a} de {b}', { a: miles(s.jefe.vida - s.jefe.golpes), b: miles(s.jefe.vida) }); return; }
      ancho('.pp-raid-vida', s.total ? s.vivas / s.total : 0);
      $('.pp-raid-vida b').textContent = tr('Burbujas: {a} de {b}', { a: miles(s.vivas), b: miles(s.total) });
    }
    function deposito(d) {
      $('.pp-raid-toques').textContent = tr('Toques: {a} de {b}', { a: d.toques, b: d.capacidad });
      const s = Math.ceil(d.faltaMs / 1000);
      $('.pp-raid-recarga').textContent = d.toques >= d.capacidad ? tr('Depósito lleno') : tr('+1 en {t}', { t: Math.floor(s / 60) + ':' + dos(s % 60) });
      ancho('.pp-raid-deposito', d.toques / d.capacidad);
      $('.pp-raid-pie').classList.toggle('pp-raid-vacio', d.toques === 0);
      $('.pp-raid-pedir').hidden = d.toques > 0 || !alPedir;   // sin toques: pasar el enlace de la raid a los amigos
    }
    // o = { partes (lo que queda, PP_RAID_SEMANA.partes), siguiente (PP_RAID_PREMIOS.siguiente o null), cuenta (burbujas + golpes) }
    function premio(o) {
      const sig = o.siguiente;
      const llevas = o.cuenta === 1 ? tr('Llevas 1 burbuja.') : tr('Llevas {n} burbujas.', { n: miles(o.cuenta) });
      $('.pp-raid-llevas').textContent = llevas + ' ' + (sig ? tr('A {n} del premio de {m} monedas', { n: miles(sig.faltan), m: miles(sig.monedas) }) : tr('¡Ya tienes el premio más alto!'));
      ancho('.pp-raid-premio', sig ? sig.parte : 1);
    }
    function estado(s, o) {
      $('.pp-raid-titulo').textContent = tr('Raid entre todos');
      $('.pp-raid-queda').textContent = s.acabada || s.vaciada ? tr('Terminada') : queda(o.partes);
      vida(s); deposito(s.deposito); premio(o);
    }
    // el CEO dice algo: el bocadillo sale y se va solo
    function di(frase) {
      const b = $('.pp-raid-bocadillo');
      b.textContent = frase; b.hidden = false;
      b.classList.remove('pp-raid-entra'); void b.offsetWidth; b.classList.add('pp-raid-entra');
      clearTimeout(relojes.bocadillo);
      relojes.bocadillo = setTimeout(() => { b.hidden = true; }, BOCADILLO_MS);
    }
    // una línea del chat falso: { nombre, color, texto } (el texto, ya traducido)
    function chat(m) {
      const caj = $('.pp-raid-chat'), d = document.createElement('div');
      const quien = document.createElement('b'); quien.textContent = m.nombre; quien.style.color = m.color;
      d.append(quien, ': ' + m.texto + ' ');
      const cola = document.createElement('span'); cola.className = 'pp-raid-adornos'; cola.innerHTML = (m.iconos || []).map(k => icono(k, 24)).join('');
      d.append(cola);
      caj.appendChild(d);
      while (caj.children.length > CHAT_LINEAS) caj.removeChild(caj.firstChild);
      setTimeout(() => { d.classList.add('pp-raid-fuera'); setTimeout(() => d.remove(), 650); }, CHAT_MS);
    }
    function aviso(texto) { const a = $('.pp-raid-aviso'); a.hidden = !texto; a.textContent = texto || ''; }
    function sacudeDeposito() { const p = $('.pp-raid-pie'); p.classList.remove('pp-raid-sacude'); void p.offsetWidth; p.classList.add('pp-raid-sacude'); }
    // de cerca sobra «+» si ya no se puede acercar más, y al revés
    function zoom(alMaximo, alMinimo) { $('.pp-raid-mas').disabled = alMaximo; $('.pp-raid-menos').disabled = alMinimo; }
    function muestra(si) {
      caja.hidden = !si;
      if (!si) { $('.pp-raid-chat').innerHTML = ''; $('.pp-raid-bocadillo').hidden = true; aviso(''); clearTimeout(relojes.bocadillo); }
    }
    return Object.freeze({ muestra, estado, objetos, di, chat, aviso, sacudeDeposito, zoom });
  }
  return Object.freeze({ ALTO, crea, miles });
})();
