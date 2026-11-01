// Fans of Chef · JORNADA: el estado del día y sus fases. 'portada' → 'manana' (la lista de pedidos) → 'caza' (el sótano, con reloj) →
// 'subiendo' (el montacargas) → 'servicio' (la cantina, en cantina.js) → 'cierre' (el oro del día) → la jornada siguiente.
// Guarda la despensa de la jornada (lo cazado), los objetivos (lo que piden las recetas del día) y las bajas.
'use strict';

const JORNADA = {
  fase: 'portada', t: 0, dia: 1, pedidos: [], objetivos: {}, despensa: {}, bajas: 0, enMontacargas: false, subeT: 0, caida: false, oroDia: 0,
  reloj() { return Math.max(0, CIFRAS.cazaSeg - this.t); },
  objetivosHechos() { for (const k in this.objetivos) if ((this.despensa[k] || 0) < this.objetivos[k]) return false; return true; },
  coge(que) { this.despensa[que] = (this.despensa[que] || 0) + 1; },
  totalDespensa() { let n = 0; for (const k in this.despensa) n += this.despensa[k]; return n; },
};

function empiezaJornada() {
  JORNADA.dia = SAVE.dia; JORNADA.pedidos = pedidosDeJornada(JORNADA.dia); JORNADA.objetivos = objetivosDe(JORNADA.pedidos);
  JORNADA.despensa = {}; JORNADA.bajas = 0; JORNADA.caida = false; JORNADA.oroDia = 0; JORNADA.fase = 'manana'; JORNADA.t = 0;
  abreVentana('manana');
}
// bajar al sótano: se construye el mapa del día y se reparten los bichos por las salas
function bajaAlSotano() {
  ENEMIGOS.length = 0; BOTIN.length = 0; FX.part.length = 0; FX.nums.length = 0;
  const n = CIFRAS.salasPorJornada[Math.min(JORNADA.dia, CIFRAS.salasPorJornada.length) - 1];
  const rng = mulberry32((JORNADA.dia * 1000003 + (Date.now() & 0xfffff)) | 0);
  const inicio = construyeMapa(n, rng);
  jugadorNuevo(inicio.x, inicio.y);
  const tipos = Object.keys(BICHOS), extra = Math.min(3, Math.floor((JORNADA.dia - 1) / 2));
  MAPA.salas.forEach((s, i) => {
    if (i === 0) return;
    const cuantos = 2 + Math.floor(i / 2) + extra, entrada = { x: 20, y: (s.def.salidas.izq[0] + s.def.salidas.izq[1]) / 2 };
    for (let k = 0; k < cuantos; k++) {
      // el primer día, solo tomates y gelatinas en la primera sala con bichos; el cebollón llega después
      const tipo = i < 2 && JORNADA.dia === 1 ? (k % 2 ? 'tomate' : 'gelatina') : tipos[Math.floor(rng() * tipos.length)];
      const p = puntoSuelo(s.def, rng, entrada);
      const def = BICHOS[tipo];
      s.enemigos.push({ tipo, def, x: p.x, y: p.y, vida: def.vida, muerto: false, despierto: false, t: rng() * 6, aturdido: 0, herido: 0, mecha: -1, embiste: null, salto: null, espera: 0.4 + rng(), vx: 0, vy: 0 });
    }
  });
  JORNADA.fase = 'caza'; JORNADA.t = 0; JORNADA.salioDelMontacargas = false; cierraVentanas();
  CAM.x = J.x - PAN.W / 2; CAM.y = J.y - PAN.H / 2;
  aviso(tr('Caza antes de que abra la cantina'), 2.2);
}
function avanzaJornada(dt) {
  if (JORNADA.fase === 'caza') {
    JORNADA.t += dt;
    const r = JORNADA.reloj();
    if (r <= 0) { aviso(tr('¡Abre la cantina! El montacargas te sube'), 2); subeMontacargas(); return; }
    if (r <= 10.5 && r + dt > 10.5) { aviso(tr('¡10 segundos!'), 1.5, PALETA.R); SONIDO.aviso(); }
    if (!JORNADA.enMontacargas) JORNADA.salioDelMontacargas = true;   // hay que apartarse una vez: si no, el toque de «Bajar» te subiría de vuelta
    if (JORNADA.enMontacargas && JORNADA.salioDelMontacargas && ENTRADA.ataquePulsa) subeMontacargas();
  } else if (JORNADA.fase === 'subiendo') {
    JORNADA.subeT += dt;
    if (JORNADA.subeT >= 1.2) empiezaServicio();
  }
}
function subeMontacargas() { if (JORNADA.fase !== 'caza') return; JORNADA.fase = 'subiendo'; JORNADA.subeT = 0; SONIDO.montacargas(); sueltaTodo(); }
// caer en el sótano: el montacargas te sube igual, pero se pierde la mitad de lo cazado
JORNADA.derrota = function () {
  if (JORNADA.fase !== 'caza') return;
  JORNADA.caida = true; SONIDO.pierde(); tiembla(1.5);
  for (const k in JORNADA.despensa) JORNADA.despensa[k] = Math.floor(JORNADA.despensa[k] * (1 - CIFRAS.perdidaDerrota));
  aviso(tr('Te han cocinado... pierdes la mitad de la cesta'), 2.5, PALETA.R);
  JORNADA.fase = 'subiendo'; JORNADA.subeT = -1.2; sueltaTodo();
};
function cierraJornada() {
  JORNADA.fase = 'cierre'; SAVE.oro += JORNADA.oroDia; SAVE.dia++; SAVE.recordDia = Math.max(SAVE.recordDia, JORNADA.dia); guarda();
  abreVentana('cierre');
}
