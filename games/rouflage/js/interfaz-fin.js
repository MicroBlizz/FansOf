// Fans of Rouflage · LA PANTALLA DEL FINAL: título y frase del resultado, estrellas, cifras, la clasificación y el mapa con dónde estaba
// cada uno (la arma termina() en partida.js con J.resultado). Antes estaba en interfaz.js.
'use strict';
// el final: título, estrellas, el mapa con dónde estaba cada uno y las cifras
function muestraFin() {
  const r = J.resultado; if (!r) return;
  E('fin-titulo').textContent = r.titulo; E('fin-titulo').classList.toggle('mal', !r.victoria && !r.bando); E('fin-sub').textContent = r.sub;
  E('fin-estrellas').innerHTML = [0, 1, 2].map(i => ESTRELLA.replace('<svg', i < r.estrellas ? '<svg class="si"' : '<svg')).join('');
  E('fin-filas').innerHTML = r.filas.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('') + `<div class="total"><span>${tr('PUNTOS')}</span><b>${r.puntos}</b></div>`;
  // la clasificación: todos (personas y bots) por puntos; tú resaltado
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  E('fin-ranking').innerHTML = pintaRankingFin(r.ranking);
  E('b-cambia').textContent = J.modo === 'camaleon' ? tr('Ahora de cazador') : tr('Ahora de camaleón');
  E('b-cambia').hidden = J.pvp; E('b-otra').textContent = J.pvp ? tr('OTRA PARTIDA') : tr('OTRA VEZ');      // por internet los papeles los reparte el servidor al azar
  E('b-foto').hidden = !fotoHay();      // compartir la foto de tu escondite (foto.js)
  pintaMapaFinal(); galeriaPinta();
  pantalla('p-fin');
  finPaseMuestra(r);      // el tubo del pase que se llena y las Gotas (fin-pase.js)
  talFinMuestra(r);      // y el del nivel de becario o de colado (talentos-fin.js)
  if (typeof chatFinEmpieza === 'function') chatFinEmpieza();      // el chat del final: pegatinas y frases (chat-fin.js)
}
const pintaRankingFin = ranking => ranking.map((f, i) => `<li class="${f.jugador ? 'yo' : ''}${f.fuera ? ' fuera' : ''}${marcoColor(f.marco) ? ' marco-ar' : ''}"${marcoColor(f.marco) ? ` style="border-color:${marcoColor(f.marco)}"` : ''}><span class="pos">${i + 1}</span><i class="${f.clase}"></i><span class="nom">${esc(f.nombre)}${tituloHtml(f.titulo)}<small>${esc(f.detalle)}</small></span><b>${f.puntos}</b></li>`).join('');      // con el marco y el título del armario (armario-partida.js)
function pintaMapaFinal() {
  const m = E('fin-mapa'), c = m.getContext('2d'), k = m.width / ANCHO;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, m.width, m.height);
  c.drawImage(MAPA.fondo, 0, 0, m.width, m.height);
  c.setTransform(k, 0, 0, k, 0, 0);
  for (const f of MAPA.porY) c.drawImage(f.dibujo.cv, f.dib.x0, f.dib.y0, f.dib.w, f.dib.h);
  c.fillStyle = 'rgba(16,8,30,0.42)'; c.fillRect(0, 0, ANCHO, ALTO);
  const marca = (e, color, texto) => {
    const x = e.x, y = e.y - 22;
    c.beginPath(); c.arc(x, y, 24, 0, TAU); c.fillStyle = OL; c.fill(); c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fillStyle = color; c.fill();
    if (e.fuera) { c.strokeStyle = OL; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.moveTo(x + 9, y - 9); c.lineTo(x - 9, y + 9); c.stroke(); }
    if (texto) { c.font = '800 34px ' + LETRA_UI; const w = c.measureText(texto).width / 2 + 8; rotulo(c, texto, limita(x, w, ANCHO - w), y < 90 ? y + 50 : y - 46, 34, '#fff6ea', OL, LETRA_UI); }
  };
  for (const h of J.cazadores) marca(h, '#2e8bff', h.jugador ? tr('TÚ') : '');
  for (const e of J.camaleones) marca(e, e.jugador ? '#ffcb3d' : e.fuera ? '#ff4b5c' : '#7ee04a', e.jugador ? tr('TÚ') : e.nombre);
  E('fin-leyenda').innerHTML = `<span><i class="libre"></i>${tr('No le han pillado')}</span><span><i class="fuera"></i>${tr('Despedido')}</span><span><i class="becario"></i>${tr('Becario')}</span>`;
}
