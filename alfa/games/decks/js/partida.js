// Fans Of Decks · La partida: estado, organigrama (el mapa de nodos), guardado por nodo y las operaciones sobre el mazo.
// DCP.run es la partida en curso (null si no hay); DCP.meta, lo que persiste entre partidas. Se guarda en este navegador y, con cuenta, en la nube (CUENTA.cambio).
'use strict';
const DCP = { run: null, meta: { partidas: 0, victorias: 0 }, uid: 1 };
const DC_PISOS = [['facil'], ['facil', 'facil'], ['normal', 'correo', 'normal'], ['economato', 'pausa'], ['elite', 'normal'], ['pausa', 'correo'], ['jefe']];

function dcGuarda() {
  try { localStorage.setItem(AJUSTES.guardado, JSON.stringify({ run: DCP.run, meta: DCP.meta, uid: DCP.uid })); } catch (e) { /* sin almacenamiento: la partida dura lo que la pestaña */ }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) CUENTA.cambio();
}
function dcCarga() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(AJUSTES.guardado) || 'null'); } catch (e) { d = null; }
  if (d) { DCP.run = d.run || null; DCP.meta = Object.assign(DCP.meta, d.meta || {}); DCP.uid = d.uid || 1; }
}
// Una copia de carta para el mazo: { id, asc, uid }.
function dcCarta(id, asc) { return { id, asc: !!asc, uid: DCP.uid++ }; }
// Las cifras de una carta tal como está (ascendida o no).
function dcFx(carta) { const D = DC_CARTAS[carta.id]; return carta.asc ? Object.assign({}, D.fx, D.asc) : D.fx; }
function dcCoste(carta) { const D = DC_CARTAS[carta.id]; return carta.asc && D.asc && D.asc.coste !== undefined ? D.asc.coste : D.coste; }
function dcNombre(carta) { return tr(DC_CARTAS[carta.id].nombre) + (carta.asc ? '+' : ''); }
function dcTextoCarta(carta) { return tr(DC_CARTAS[carta.id].texto, dcFx(carta)); }
function dcObjeto(clave) { return DCP.run && DCP.run.objetos.includes(clave) ? DC_OBJETOS[clave] : null; }

// ---------- el organigrama ----------
function dcGeneraMapa() {
  const pisos = DC_PISOS.map(p => shuffle(p.slice()).map(tipo => ({ tipo, enc: null, links: [] })));
  for (let i = 0; i < pisos.length - 1; i++) {
    const a = pisos[i], b = pisos[i + 1];
    a.forEach((n, j) => {   // cada nodo enlaza con uno o dos vecinos del piso de arriba
      const centro = Math.round(j * (b.length - 1) / Math.max(1, a.length - 1)), c = [centro];
      if (b.length > 1 && Math.random() < 0.6) c.push(clamp(centro + (Math.random() < 0.5 ? -1 : 1), 0, b.length - 1));
      n.links = [...new Set(c.filter(k => k >= 0 && k < b.length))];
    });
    b.forEach((n, k) => { if (!a.some(m => m.links.includes(k))) { const m = a[Math.min(a.length - 1, Math.round(k * (a.length - 1) / Math.max(1, b.length - 1)))]; m.links.push(k); } });
  }
  // los encuentros se fijan al generar, así el jugador puede ver qué le espera si hace falta (y la partida es reproducible al recargar)
  const usados = {};
  for (const p of pisos) for (const n of p) if (DC_ENCUENTROS[n.tipo]) { const l = DC_ENCUENTROS[n.tipo]; let k = (Math.random() * l.length) | 0; if (l.length > 1 && usados[n.tipo] === k) k = (k + 1) % l.length; usados[n.tipo] = k; n.enc = l[k].slice(); }
  const correos = shuffle(DC_CORREOS.map(c => c.id));
  for (const p of pisos) for (const n of p) if (n.tipo === 'correo') n.correo = correos.pop();
  return { pisos, piso: -1, nodo: -1 };
}
function dcNodoActual() { const m = DCP.run.mapa; return m.piso >= 0 ? m.pisos[m.piso][m.nodo] : null; }
// A qué nodos se puede ir ahora: al empezar, a todos los del piso 0; después, a los enlazados desde el actual.
function dcNodosPosibles() { const m = DCP.run.mapa; if (m.piso < 0) return m.pisos[0].map((n, i) => [0, i]); const n = dcNodoActual(); return n.links.map(k => [m.piso + 1, k]); }

// ---------- partida nueva ----------
function dcNuevaPartida(lider) {
  const L = DC_LIDERES[lider];
  DCP.run = { lider, hp: L.hp, hpMax: L.hp, nominas: 30, mazo: DC_MAZOS[lider].map(id => dcCarta(id)), objetos: [], meriendas: [], mapa: dcGeneraMapa(), acto: 1,
    quitarUsado: false, quitarPrecio: 60, stats: { reuniones: 0, turnos: 0, nodos: 0 }, pendiente: null, empezada: Date.now() };
  DCP.meta.partidas++;
  dcGuarda();
}
// Ir a un nodo: lo apunta como pendiente de resolver y guarda (si se recarga, se vuelve a ese nodo).
function dcIrA(piso, nodo) { const m = DCP.run.mapa; m.piso = piso; m.nodo = nodo; DCP.run.pendiente = m.pisos[piso][nodo].tipo; DCP.run.stats.nodos++; dcGuarda(); }
function dcNodoResuelto() { if (DCP.run) { DCP.run.pendiente = null; dcGuarda(); } }
function dcFinPartida(victoria) { if (victoria) DCP.meta.victorias++; DCP.meta.ultima = { victoria, nodos: DCP.run.stats.nodos, reuniones: DCP.run.stats.reuniones, turnos: DCP.run.stats.turnos, min: Math.round((Date.now() - DCP.run.empezada) / 60000) }; DCP.run = null; dcGuarda(); }

// ---------- ofertas y azar ----------
function dcRarezaAlAzar(pesos) { let t = 0; for (const k in pesos) t += pesos[k]; let r = Math.random() * t; for (const k in pesos) { r -= pesos[k]; if (r < 0) return k; } return 'basic'; }
// Una oferta de empleo: n cartas distintas del pool, según la rareza.
function dcOferta(n) {
  const out = [], pool = DC_POOL.slice();
  while (out.length < n && pool.length) {
    const rar = dcRarezaAlAzar(DC_PESOS_RAREZA), cands = pool.filter(k => DC_CARTAS[k].rar === rar), k = cands.length ? pick(cands) : pick(pool);
    pool.splice(pool.indexOf(k), 1); out.push(k);
  }
  return out;
}
function dcCartaRara() { return pick(DC_POOL.filter(k => ['rare', 'epic'].includes(DC_CARTAS[k].rar))); }
function dcObjetoAlAzar() { const l = DC_OBJETOS_POOL.filter(k => !DCP.run.objetos.includes(k)); return l.length ? pick(l) : null; }
function dcVida(n) { const r = DCP.run; r.hp = clamp(r.hp + n, 0, r.hpMax); }
function dcPrecioCarta(id) { return { basic: 40, common: 55, rare: 80, epic: 110, legendary: 150 }[DC_CARTAS[id].rar] || 50; }
