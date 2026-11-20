// Tiny Fans · aplicación · METAS Y MEDIDAS: la meta del nido que toca (la primera de la escalera que no está cumplida) y las medidas
// locales de «otra más» (salidas seguidas, segundos hasta salir, caídas), que se guardan en los extras de la partida: 'metas' y 'medidas'.
// Escucha los eventos y anuncia 'meta-cumplida' la primera vez que se cumple cada una. Puertos: { reglas, sesion, reloj, eventos }.
'use strict';
TN.creaMetas = ({ reglas, sesion, reloj, eventos }) => {
  const nido = () => { const r = TN.Nido.desdeJson(reglas, sesion.partida.nido); return r.ok ? r.valor : TN.Nido.nuevo(reglas); };
  const tiene = m => (m.cuenta.pieza ? nido().piezas.filter(p => p.pieza === m.cuenta.pieza).length : sesion.partida.contadores[m.cuenta.contador] || 0);
  const hechas = () => sesion.partida.extra('metas') || [];
  // apunta las metas recién cumplidas (en orden) y las anuncia
  function repasa() {
    const ya = hechas(), nuevas = [];
    for (const m of reglas.metas.lista) { if (ya.includes(m.id)) continue; if (tiene(m) < m.pide) break; nuevas.push(m.id); }
    if (!nuevas.length) return;
    sesion.partida.ponExtra('metas', ya.concat(nuevas)); sesion.guarda();
    eventos.emite(nuevas.map(meta => ({ tipo: 'meta-cumplida', meta })));
  }
  function mide(cambio) { const m = sesion.partida.extra('medidas') || {}; sesion.partida.ponExtra('medidas', cambio(m)); sesion.guarda(); }
  let entroAlNido = reloj.ahora();
  eventos.oye(['pieza-puesta', 'pieza-quitada', 'asalto-sale'], repasa);
  eventos.oye('pantalla', e => { if (e.a === 'nido') entroAlNido = reloj.ahora(); });
  eventos.oye('sale', () => mide(m => ({ ...m, salidas: (m.salidas || 0) + 1, segundosHastaSalir: Math.round((reloj.ahora() - entroAlNido) / 1000) })));
  eventos.oye('cae', () => mide(m => ({ ...m, caidas: (m.caidas || 0) + 1 })));
  return {
    // la meta que toca: { id, texto, tiene, pide } o null si están todas
    actual() {
      const ya = hechas(), m = reglas.metas.lista.find(x => !ya.includes(x.id));
      return m ? { id: m.id, texto: tr(m.texto), tiene: Math.min(m.pide, tiene(m)), pide: m.pide } : null;
    },
    hechas, repasa,
    medidas: () => sesion.partida.extra('medidas') || {},
  };
};
