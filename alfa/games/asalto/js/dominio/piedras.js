// Fans of Asalto · DOMINIO · Las piedras de destino y sus misiones con plazo. Cada pocas oleadas sale una misión de piedra: pide algo
// (líneas, enemigos, oleadas limpias…) contado desde que sale y da unas oleadas de plazo. Cumplirla a tiempo da su piedra, que va a la
// bolsa; si el plazo pasa, caduca. La Brújula del destino da más plazo y una probabilidad de que la piedra sea de un rango mejor.
// Gastar una piedra es una tirada del Altar aparte (la paga la partida; lo que hace cada piedra está en piedras-efectos.js). Aquí
// también quedan los encargos que algunas piedras dejan para después: invocaciones con línea segura, el épico de la próxima oferta y
// la vida de menos del próximo jefe. El estado es un valor congelado:
// { mision: null o { id, piedra, meta, desde, hasta }, bolsa: [tipo de piedra], suerte, mercader, verdugo }. Puro: el azar llega de fuera.
'use strict';
AS.piedras = (() => {
  const P = datos => datos.piedras;
  const congela = e => Object.freeze({ mision: e.mision ? Object.freeze({ ...e.mision }) : null, bolsa: Object.freeze(e.bolsa.slice()),
    suerte: e.suerte || 0, mercader: !!e.mercader, verdugo: e.verdugo || 0 });
  const vacio = () => congela({ mision: null, bolsa: [] });
  const cabe = (datos, e) => e.bolsa.length < P(datos).bolsa;
  const rango = (datos, piedra) => P(datos).tipos[piedra].rango;
  const extra = (datos, piedra) => P(datos).tipos[piedra].extra || {};
  // ¿sale una misión de piedra al empezar a preparar la oleada n? (la 2, la 5, la 8…, si no hay otra en marcha y cabe otra piedra)
  const toca = (datos, e, n) => !e.mision && cabe(datos, e) && n >= P(datos).primera && (n - P(datos).primera) % P(datos).cada === 0;
  // una piedra por su peso, entre las que cumplan `vale` (todas, si no se dice)
  function sortea(datos, azar, vale) {
    const pesos = {};
    for (const t in P(datos).tipos) if (!vale || vale(t)) pesos[t] = P(datos).tipos[t].peso;
    return azar.pesos(pesos);
  }
  // la piedra mejor (Brújula): una del rango siguiente, por su peso. Las de rango 3 ya son las mejores
  const mejor = (datos, piedra, azar) => (rango(datos, piedra) >= 3 ? piedra : sortea(datos, azar, t => rango(datos, t) === rango(datos, piedra) + 1));
  // la misión nueva: una piedra por su peso y una misión de las que pueden darla; pide según el rango de la piedra, cuenta desde lo que
  // lleve la partida y vale hasta la oleada `hasta`. brujula = AS.objetos.brujula: plazo de más y probabilidad (0 a 1) de piedra mejor
  function propone(datos, e, n, cuenta, azar, brujula) {
    const B = brujula || { plazo: 0, mejor: 0 }, sale = sortea(datos, azar);
    const id = azar.elige(Object.keys(P(datos).misiones).filter(k => P(datos).misiones[k].piedras.includes(sale))), m = P(datos).misiones[id];
    const piedra = B.mejor > 0 && azar() < B.mejor ? mejor(datos, sale, azar) : sale;
    const hasta = n + P(datos).tipos[sale].plazo - 1 + B.plazo;
    return congela({ ...e, mision: { id, piedra, meta: m.meta[rango(datos, sale)], desde: cuenta[m.stat] || 0, hasta } });
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
    if (v.va >= v.meta) return { estado: congela({ ...e, mision: null, bolsa: [...e.bolsa, v.piedra] }), evento: { tipo: 'piedra', id: v.id, piedra: v.piedra } };
    if (n > e.mision.hasta) return { estado: congela({ ...e, mision: null }), evento: { tipo: 'piedra-caducada', id: v.id, piedra: v.piedra } };
    return { estado: e, evento: null };
  }
  // gasta la piedra i de la bolsa y apunta los encargos que deja para después (suerte, mercader, verdugo)
  function gasta(datos, e, i) {
    const piedra = e.bolsa[i];
    if (!piedra) return AS.error('sin-piedra');
    const x = extra(datos, piedra);
    const estado = congela({ ...e, bolsa: e.bolsa.filter((_, k) => k !== i), suerte: e.suerte + (x.suerte || 0), mercader: e.mercader || !!x.mercader,
      verdugo: Math.max(e.verdugo, x.verdugo || 0) });
    return AS.ok({ estado, piedra });
  }
  // los encargos se gastan al usarse: cada uno devuelve { estado, ... } con lo que toca ahora
  const usaSuerte = e => (e.suerte > 0 ? { estado: congela({ ...e, suerte: e.suerte - 1 }), segura: true } : { estado: e, segura: false });
  const usaMercader = e => (e.mercader ? { estado: congela({ ...e, mercader: false }), epico: true } : { estado: e, epico: false });
  const usaVerdugo = e => (e.verdugo > 0 ? { estado: congela({ ...e, verdugo: 0 }), merma: e.verdugo / 100 } : { estado: e, merma: 0 });
  // la rareza con la piedra: sube sus niveles, con el tope de las rarezas abiertas (abiertas = cuántas hay por encima de Común); la que
  // trae rareza mínima (la del comodín) la da aunque no esté abierta
  const rareza = (datos, abiertas, base, piedra) => Math.max(extra(datos, piedra).rareza || 0, base, Math.min(abiertas || 0, base + P(datos).tipos[piedra].sube));
  const entero = (v, min) => (Number.isFinite(v) && v >= min ? Math.floor(v) : null);
  function misionGuardada(datos, m) {
    if (!m || !P(datos).misiones[m.id] || !P(datos).tipos[m.piedra]) return null;
    const desde = entero(m.desde, 0), hasta = entero(m.hasta, 1), meta = entero(m.meta, 1) || P(datos).misiones[m.id].meta[rango(datos, m.piedra)];
    return desde === null || hasta === null ? null : { id: m.id, piedra: m.piedra, meta, desde, hasta };
  }
  // de la partida guardada: lo que venga roto se queda fuera; sin nada guardado (una partida de antes), sin misión y con la bolsa vacía.
  // Las de la 0.4.0 no traen encargos: empiezan sin ninguno
  function deJSON(datos, j) {
    if (!j || !Array.isArray(j.bolsa)) return vacio();
    return congela({ mision: misionGuardada(datos, j.mision), bolsa: j.bolsa.filter(t => P(datos).tipos[t]).slice(0, P(datos).bolsa),
      suerte: entero(j.suerte, 0) || 0, mercader: j.mercader === true, verdugo: Math.min(100, entero(j.verdugo, 0) || 0) });
  }
  return { vacio, toca, propone, mejor, progreso, revisa, gasta, usaSuerte, usaMercader, usaVerdugo, rareza, extra, deJSON };
})();
