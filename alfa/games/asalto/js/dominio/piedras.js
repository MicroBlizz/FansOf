// Fans of Asalto · DOMINIO · Las piedras de destino y sus misiones con plazo. Cada pocas oleadas sale una misión de piedra: pide algo
// (líneas, enemigos, oleadas limpias…) contado desde que sale y da unas oleadas de plazo. Cumplirla a tiempo da su piedra, que va a la
// bolsa; si el plazo pasa, caduca. Gastar una piedra es una tirada del Altar aparte (la paga la partida: no cuesta oro ni encarece las
// invocaciones) y sube la rareza de los héroes que traiga, sin pasar nunca de las rarezas abiertas. El estado es un valor congelado:
// { mision: null o { id, piedra, meta, desde, hasta }, bolsa: [tipo de piedra] }. Puro: el azar llega de fuera.
'use strict';
AS.piedras = (() => {
  const P = datos => datos.piedras;
  const congela = e => Object.freeze({ mision: e.mision ? Object.freeze({ ...e.mision }) : null, bolsa: Object.freeze(e.bolsa.slice()) });
  const vacio = () => congela({ mision: null, bolsa: [] });
  const cabe = (datos, e) => e.bolsa.length < P(datos).bolsa;
  // ¿sale una misión de piedra al empezar a preparar la oleada n? (la 2, la 5, la 8…, si no hay otra en marcha y cabe otra piedra)
  const toca = (datos, e, n) => !e.mision && cabe(datos, e) && n >= P(datos).primera && (n - P(datos).primera) % P(datos).cada === 0;
  // la misión nueva: una piedra por su peso y una misión cualquiera; cuenta desde lo que lleve la partida y vale hasta la oleada `hasta`
  function propone(datos, e, n, cuenta, azar) {
    const pesos = {};
    for (const t in P(datos).tipos) pesos[t] = P(datos).tipos[t].peso;
    const piedra = azar.pesos(pesos), id = azar.elige(Object.keys(P(datos).misiones)), m = P(datos).misiones[id];
    return congela({ ...e, mision: { id, piedra, meta: m.meta[piedra], desde: cuenta[m.stat] || 0, hasta: n + P(datos).tipos[piedra].plazo - 1 } });
  }
  // por dónde va la misión estando en la oleada n: { id, piedra, va, meta, quedan (oleadas, contando esta) }, o null si no hay
  function progreso(datos, e, n, cuenta) {
    const m = e.mision;
    if (!m) return null;
    const va = Math.max(0, (cuenta[P(datos).misiones[m.id].stat] || 0) - m.desde);
    return { id: m.id, piedra: m.piedra, va: Math.min(m.meta, va), meta: m.meta, quedan: Math.max(0, m.hasta - n + 1) };
  }
  // mira la misión: cumplida (su piedra a la bolsa), caducada (la oleada n ya pasa de su plazo) o sigue. Devuelve { estado, evento }
  function revisa(datos, e, n, cuenta) {
    const v = progreso(datos, e, n, cuenta);
    if (!v) return { estado: e, evento: null };
    if (v.va >= v.meta) return { estado: congela({ mision: null, bolsa: [...e.bolsa, v.piedra] }), evento: { tipo: 'piedra', id: v.id, piedra: v.piedra } };
    if (n > e.mision.hasta) return { estado: congela({ mision: null, bolsa: e.bolsa }), evento: { tipo: 'piedra-caducada', id: v.id, piedra: v.piedra } };
    return { estado: e, evento: null };
  }
  // gasta la piedra i de la bolsa
  function gasta(e, i) {
    const piedra = e.bolsa[i];
    if (!piedra) return AS.error('sin-piedra');
    return AS.ok({ estado: congela({ mision: e.mision, bolsa: e.bolsa.filter((_, k) => k !== i) }), piedra });
  }
  // la rareza con la piedra: sube sus niveles, con el tope de las rarezas abiertas (abiertas = cuántas hay por encima de Común)
  const rareza = (datos, abiertas, base, piedra) => Math.max(base, Math.min(abiertas || 0, base + P(datos).tipos[piedra].sube));
  const entero = (v, min) => (Number.isFinite(v) && v >= min ? Math.floor(v) : null);
  function misionGuardada(datos, m) {
    if (!m || !P(datos).misiones[m.id] || !P(datos).tipos[m.piedra]) return null;
    const desde = entero(m.desde, 0), hasta = entero(m.hasta, 1);
    return desde === null || hasta === null ? null : { id: m.id, piedra: m.piedra, meta: P(datos).misiones[m.id].meta[m.piedra], desde, hasta };
  }
  // de la partida guardada: lo que venga roto se queda fuera; sin nada guardado (una partida de antes), sin misión y con la bolsa vacía
  function deJSON(datos, j) {
    if (!j || !Array.isArray(j.bolsa)) return vacio();
    return congela({ mision: misionGuardada(datos, j.mision), bolsa: j.bolsa.filter(t => P(datos).tipos[t]).slice(0, P(datos).bolsa) });
  }
  return { vacio, toca, propone, progreso, revisa, gasta, rareza, deJSON };
})();
