// Fans Of Decks · La partida: estado, agenda del día (el mapa: cada hora, varias citas), guardado por cita y las operaciones sobre el mazo.
// DCP.run es la partida en curso (null si no hay); DCP.meta, lo que persiste entre partidas. Se guarda en este navegador y, con cuenta, en la nube (CUENTA.cambio).
'use strict';
const DCP = { run: null, meta: { partidas: 0, victorias: 0 }, uid: 1 };
const DC_PISOS = [['facil', 'facil'], ['facil', 'normal', 'correo'], ['normal', 'correo', 'normal'], ['economato', 'pausa'], ['elite', 'normal'], ['pausa', 'correo', 'normal'], ['jefe']];
// La agenda del día: una hora por piso (la de las 14:00 es la comida, decorativa) y los títulos con que Microblizz disfraza cada cita.
const DC_HORAS = ['9:00', '10:00', '11:00', '12:00', '13:00', '15:00', '17:00'];
const DC_TITULOS = {
  facil: ['Daily de los becarios', 'Sincronización de equipo', 'Onboarding express', 'Revisión de tickets'],
  normal: ['Revisión de objetivos', 'Comité de producto', 'Retrospectiva obligatoria', 'Alineamiento trimestral', 'Taller de sinergias'],
  elite: ['Comité de dirección', 'Auditoría de RR. HH.'],
  jefe: ['Evaluación de desempeño'],
  correo: ['Bandeja de entrada', 'Correo sin leer', 'Aviso de la empresa'],
  pausa: ['Pausa para el café', 'Hueco en la agenda'],
  economato: ['Economato de Lola'],
};
const DC_SALAS = ['Sala Becario', 'Sala Sinergia', 'Sala Hoja de Cálculo', 'Sala Ping-Pong', 'Despacho 3B', 'Pecera', 'Sala Alineamiento', 'Cafetería', 'Almacén', 'Última planta'];

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
// Las palabras clave de una carta según sus cifras (se añaden al final del texto).
const DC_PALABRAS = [['despedida', 'Despedida.'], ['indefinido', 'Contrato indefinido.'], ['madrugador', 'Madrugador.']];
function dcPalabras(fx) { return DC_PALABRAS.filter(([k]) => fx[k]).map(([, t]) => tr(t)); }
function dcTextoCarta(carta) { const fx = dcFx(carta), p = dcPalabras(fx); return tr(DC_CARTAS[carta.id].texto, fx) + (p.length ? ' ' + p.join(' ') : ''); }
// El mismo texto en HTML, con las cifras y palabras de `resalta` marcadas (para enseñar un ascenso).
function dcTextoCartaHTML(carta, resalta) {
  const fx = dcFx(carta), esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  let t = esc(tr(DC_CARTAS[carta.id].texto)).replace(/\{(\w+)\}/g, (m, k) => k in fx ? (resalta.has(k) ? '<b class="dc-cambio">' + esc(String(fx[k])) + '</b>' : esc(String(fx[k]))) : m);
  for (const [k, p] of DC_PALABRAS) if (fx[k]) t += ' ' + (resalta.has(k) ? '<b class="dc-cambio">' + esc(tr(p)) + '</b>' : esc(tr(p))); else if (resalta.has(k)) t += ' <s class="dc-cambio-fuera">' + esc(tr(p)) + '</s>';
  return t;
}
// Lo que cambia al ascender una carta: [{ k, antes, despues }] (coste incluido; una palabra clave que aparece o desaparece lleva antes/despues booleanos).
function dcCambiosAscenso(carta) {
  const D = DC_CARTAS[carta.id]; if (!D.asc) return [];
  const a = dcCarta(carta.id, false), b = dcCarta(carta.id, true), fa = dcFx(a), fb = dcFx(b), out = [];
  if (dcCoste(a) !== dcCoste(b)) out.push({ k: 'coste', antes: dcCoste(a), despues: dcCoste(b) });
  for (const k of new Set([...Object.keys(fa), ...Object.keys(fb)])) if (fa[k] !== fb[k]) out.push({ k, antes: fa[k], despues: fb[k] });
  return out;
}
function dcObjeto(clave) { return DCP.run && DCP.run.objetos.includes(clave) ? DC_OBJETOS[clave] : null; }
// La ventaja fiscal de la partida (o null) y si una está desbloqueada por lo jugado hasta ahora.
function dcVentaja() { return DCP.run && DCP.run.ventaja ? DC_VENTAJAS[DCP.run.ventaja] || null : null; }
function dcVentajaAbierta(k) { const h = DC_VENTAJAS[k].hito; if (!h) return true; for (const q in h) if ((DCP.meta[q] || 0) < h[q]) return false; return true; }
function dcTextoHito(k) { const h = DC_VENTAJAS[k].hito; if (!h) return ''; if (h.reuniones) return tr('Gana {n} reuniones', { n: h.reuniones }); if (h.victorias) return tr(h.victorias === 1 ? 'Gana una partida' : 'Gana {n} partidas', { n: h.victorias }); return tr(h.partidas === 1 ? 'Juega una partida' : 'Juega {n} partidas', { n: h.partidas }); }

// ---------- la agenda ----------
function dcGeneraMapa() {
  const pisos = DC_PISOS.map(p => shuffle(p.slice()).map(tipo => ({ tipo, enc: null })));
  // los encuentros se fijan al generar, así el jugador puede ver qué le espera si hace falta (y la partida es reproducible al recargar)
  const usados = {};
  for (const p of pisos) for (const n of p) if (DC_ENCUENTROS[n.tipo]) { const l = DC_ENCUENTROS[n.tipo]; let k = (Math.random() * l.length) | 0; if (l.length > 1 && usados[n.tipo] === k) k = (k + 1) % l.length; usados[n.tipo] = k; n.enc = l[k].slice(); }
  const correos = shuffle(DC_CORREOS.map(c => c.id)), salas = shuffle(DC_SALAS.slice());
  const vistos = {};
  for (const p of pisos) for (const n of p) {
    if (n.tipo === 'correo') n.correo = correos.pop();
    const T = DC_TITULOS[n.tipo]; vistos[n.tipo] = (vistos[n.tipo] || 0) + 1; n.titulo = (vistos[n.tipo] - 1) % T.length;
    n.sala = n.tipo === 'pausa' ? 'Cafetería' : n.tipo === 'economato' ? 'Almacén' : n.tipo === 'jefe' ? 'Última planta' : salas.pop() || pick(DC_SALAS);
  }
  return { pisos, piso: -1, nodo: -1, elegidos: [] };   // elegidos[hora] = índice de la cita a la que se fue
}
// La cita elegida en una hora ya pasada (o la actual); -1 si todavía no se ha ido a ninguna.
function dcElegidoEn(p) { const m = DCP.run.mapa; if (p > m.piso) return -1; if (p === m.piso) return m.nodo; return m.elegidos && m.elegidos[p] !== undefined ? m.elegidos[p] : -1; }
function dcNodoActual() { const m = DCP.run.mapa; return m.piso >= 0 ? m.pisos[m.piso][m.nodo] : null; }
// A qué citas se puede ir ahora: a cualquiera de la hora siguiente (cada hora se elige una reunión de la agenda).
function dcNodosPosibles() { const m = DCP.run.mapa, p = m.piso + 1; return p < m.pisos.length ? m.pisos[p].map((n, i) => [p, i]) : []; }
function dcTituloNodo(n) { const T = DC_TITULOS[n.tipo]; return tr(T[(n.titulo || 0) % T.length]); }

// ---------- partida nueva ----------
function dcNuevaPartida(lider, ventaja) {
  const L = DC_LIDERES[lider], V = ventaja && DC_VENTAJAS[ventaja] ? DC_VENTAJAS[ventaja] : null, hp = L.hp + (V && V.vidaMax ? V.vidaMax : 0);
  DCP.run = { lider, ventaja: V ? ventaja : null, hp, hpMax: hp, nominas: 30, mazo: DC_MAZOS[lider].map(id => dcCarta(id)), objetos: [], meriendas: [], mapa: dcGeneraMapa(), acto: 1,
    quitarUsado: false, quitarPrecio: 60, stats: { reuniones: 0, turnos: 0, nodos: 0 }, pendiente: null, empezada: Date.now() };
  DCP.meta.partidas++;
  dcGuarda();
}
// Ir a un nodo: lo apunta como pendiente de resolver y guarda (si se recarga, se vuelve a ese nodo).
function dcIrA(piso, nodo) { const m = DCP.run.mapa; m.piso = piso; m.nodo = nodo; m.elegidos = m.elegidos || []; m.elegidos[piso] = nodo; DCP.run.pendiente = m.pisos[piso][nodo].tipo; DCP.run.stats.nodos++; dcGuarda(); }
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
