// Fans of Asalto · DOMINIO · El progreso de fuera de la partida, lo que se guarda para siempre: las plumas, las mejoras permanentes, el
// equipo puesto y la mochila, las zonas terminadas, los récords del modo sin fin, los contadores de los logros y cuáles se han cobrado,
// las rarezas de héroe abiertas, las máquinas de invocar abiertas y la elegida, los Despertares abiertos (el Poder Dormido), las dificultades superadas de cada zona, el sonido y los consejos vistos. Es un objeto de datos plano (el que se guarda tal cual); cada función devuelve otro nuevo y válido,
// o un error con nombre. deJSON arregla lo que venga del almacén: una partida antigua (v2, de cuando el juego era otro) conserva sus
// plumas, su equipo, sus zonas y sus logros; y la mejora «Llamada rara» de la 0.3.1 (que ya no existe) se convierte en rarezas abiertas.
'use strict';
AS.progreso = (() => {
  const STATS = () => ({ oroTotal: 0, enemigos: 0, jefes: 0, lineas: 0, nivelMax: 0, ascensos: 0, dorados: 0, sinFinMax: 0 });
  const nuevo = () => ({ v: 3, plumas: 0, mejor: 0, partidas: 0, equipo: {}, mochila: [], zonas: [], logros: {}, mejoras: {}, rarezas: 0, dormido: 0, maquinas: [], maquina: 'altar', dif: {}, sinFin: {}, stats: STATS(), consejos: {}, regalo: AS.anuncios.regaloVacio(), vol: 1, mus: 0.5 });
  const entero = (v, min = 0) => (Number.isFinite(v) && v >= min ? Math.floor(v) : min);
  const copia = (p, cambios) => ({ ...p, ...cambios });

  function objetoValido(datos, o) {
    const E = datos.equipo;
    if (!o || typeof o.id !== 'string' || !E.huecos.includes(o.hueco) || !E.stats[o.stat] || !E.rarezas[o.rareza]) return null;
    return { id: o.id, hueco: o.hueco, stat: o.stat, valor: entero(o.valor, 1), rareza: o.rareza, nivel: entero(o.nivel) };
  }
  // del almacén: siempre sale un progreso válido (lo que no vale se queda en su valor de nuevo)
  function deJSON(datos, j) {
    const p = nuevo();
    if (!j || typeof j !== 'object') return p;
    p.plumas = entero(j.plumas || j.gemas); p.mejor = entero(j.mejor); p.partidas = entero(j.partidas);
    leeEquipo(datos, j, p); leeZonas(datos, j, p); leeCompras(datos, j, p);
    for (const k in (j.logros || {})) if (j.logros[k]) p.logros[k] = true;
    for (const k in p.stats) p.stats[k] = entero(j.stats && j.stats[k]);
    if (j.v === 3) for (const k in (j.consejos || {})) p.consejos[k] = true;   // los consejos de la versión anterior eran de otro juego
    p.regalo = AS.anuncios.regaloDeJSON(j.regalo);
    p.vol = volumen(j.vol, 1); p.mus = volumen(j.mus, 0.5);
    return p;
  }
  const volumen = (v, sinDato) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : sinDato);
  const lista = v => (Array.isArray(v) ? v : []);
  function leeEquipo(datos, j, p) {
    for (const h of datos.equipo.huecos) { const o = objetoValido(datos, j.equipo && j.equipo[h]); if (o && o.hueco === h) p.equipo[h] = o; }
    p.mochila = lista(j.mochila).map(o => objetoValido(datos, o)).filter(Boolean).slice(0, datos.equipo.mochila);
  }
  // las zonas superadas, hasta qué dificultad (dif: { zona: cuántas dificultades superadas }) y los récords del modo sin fin
  function leeZonas(datos, j, p) {
    p.zonas = lista(j.zonas).filter(z => datos.zonas[z]);
    for (const z in (j.dif || {})) if (p.zonas.includes(Number(z))) p.dif[z] = Math.min(datos.dificultades.length, entero(j.dif[z], 1));
    for (const z in (j.sinFin || {})) if (datos.zonas[z]) p.sinFin[z] = entero(j.sinFin[z]);
  }
  // lo comprado con plumas: las mejoras, las rarezas y las máquinas (con la elegida, si sigue abierta)
  function leeCompras(datos, j, p) {
    for (const k in datos.mejoras) { const n = entero(j.mejoras && j.mejoras[k]); if (n) p.mejoras[k] = Math.min(n, datos.mejoras[k].coste.length); }
    p.rarezas = rarezasGuardadas(datos, j);
    p.dormido = Math.min(datos.legendarios.dormido.length, entero(j.dormido));
    p.maquinas = lista(j.maquinas).filter((id, i, l) => datos.maquinas[id] && datos.maquinas[id].plumas && l.indexOf(id) === i);
    if (maquinaAbierta(datos, p, j.maquina)) p.maquina = j.maquina;
  }

  // cuántas rarezas hay abiertas (0 = solo Común). Un progreso de la 0.3.1 no las trae: cada nivel comprado de su «Llamada rara»
  // (80, 160 y 320 plumas, lo mismo que cuestan ahora Raro, Épico y Legendario) vale por una rareza abierta, sin pedirle la zona
  function rarezasGuardadas(datos, j) {
    const tope = datos.rarezas.length - 1, vieja = entero(j.mejoras && j.mejoras.llamada);
    return Math.min(tope, Math.max(entero(j.rarezas), vieja));
  }

  /* ---------- las rarezas de los héroes ---------- */
  // la siguiente rareza por abrir: { i, plumas, zona, falta: null | 'zona' | 'plumas' }, o null si están todas
  function rarezaSiguiente(datos, p) {
    const i = p.rarezas + 1, r = datos.rarezas[i];
    if (!r) return null;
    return { i, plumas: r.plumas, zona: r.zona, falta: !p.zonas.includes(r.zona) ? 'zona' : p.plumas < r.plumas ? 'plumas' : null };
  }
  // abrir la siguiente: van en orden, cada una pide su zona superada y sus plumas
  function abreRareza(datos, p) {
    const s = rarezaSiguiente(datos, p);
    if (!s) return AS.error('al-maximo');
    if (s.falta === 'zona') return AS.error('zona-sin-superar', { zona: s.zona });
    if (s.falta === 'plumas') return AS.error('sin-plumas', { coste: s.plumas });
    return AS.ok(copia(p, { plumas: p.plumas - s.plumas, rarezas: s.i }));
  }

  /* ---------- el Poder Dormido: abre con plumas los Despertares I, II y III de los legendarios (tarea #109) ---------- */
  // el siguiente por abrir: { i (1 a 3), plumas, falta: null | 'plumas' }, o null si están los 3
  function dormidoSiguiente(datos, p) {
    const plumas = datos.legendarios.dormido[p.dormido];
    if (!plumas) return null;
    return { i: p.dormido + 1, plumas, falta: p.plumas < plumas ? 'plumas' : null };
  }
  // abrir el siguiente: van en orden y cada uno cuesta sus plumas
  function abreDormido(datos, p) {
    const s = dormidoSiguiente(datos, p);
    if (!s) return AS.error('al-maximo');
    if (s.falta) return AS.error('sin-plumas', { coste: s.plumas });
    return AS.ok(copia(p, { plumas: p.plumas - s.plumas, dormido: s.i }));
  }

  /* ---------- las máquinas de invocar ---------- */
  // la de siempre (sin precio) está abierta desde el principio; las demás, cuando se compran
  const maquinaAbierta = (datos, p, id) => !!datos.maquinas[id] && (!datos.maquinas[id].plumas || p.maquinas.includes(id));
  // abrir una máquina: pide su zona superada y sus plumas, y queda elegida
  function abreMaquina(datos, p, id) {
    const m = datos.maquinas[id];
    if (!m) return AS.error('maquina-desconocida');
    if (maquinaAbierta(datos, p, id)) return AS.error('ya-abierta');
    if (!p.zonas.includes(m.zona)) return AS.error('zona-sin-superar', { zona: m.zona });
    if (p.plumas < m.plumas) return AS.error('sin-plumas', { coste: m.plumas });
    return AS.ok(copia(p, { plumas: p.plumas - m.plumas, maquinas: [...p.maquinas, id], maquina: id }));
  }
  // la máquina con la que se juegan las partidas nuevas
  function eligeMaquina(datos, p, id) {
    if (!datos.maquinas[id]) return AS.error('maquina-desconocida');
    if (!maquinaAbierta(datos, p, id)) return AS.error('maquina-cerrada');
    return AS.ok(copia(p, { maquina: id }));
  }

  /* ---------- las dificultades de cada zona ---------- */
  // cuántas dificultades de la zona se han superado (una zona superada antes de que hubiera dificultades cuenta 1)
  const superadas = (p, zona) => Math.max(p.dif[zona] || 0, p.zonas.includes(zona) ? 1 : 0);
  // la dificultad d (0, 1 o 2) de una zona está abierta si se ha superado la anterior en esa zona (la primera, siempre)
  const dificultadAbierta = (datos, p, zona, d) => Number.isInteger(d) && d >= 0 && d < datos.dificultades.length && d <= superadas(p, zona);

  /* ---------- las mejoras permanentes ---------- */
  function costeMejora(datos, p, id) {
    const m = datos.mejoras[id];
    return m ? m.coste[p.mejoras[id] || 0] || null : null;
  }
  function compraMejora(datos, p, id) {
    if (!datos.mejoras[id]) return AS.error('mejora-desconocida');
    const coste = costeMejora(datos, p, id);
    if (!coste) return AS.error('al-maximo');
    if (p.plumas < coste) return AS.error('sin-plumas', { coste });
    return AS.ok(copia(p, { plumas: p.plumas - coste, mejoras: { ...p.mejoras, [id]: (p.mejoras[id] || 0) + 1 } }));
  }

  /* ---------- el equipo ---------- */
  // un objeto nuevo al azar para un hueco (o cualquiera), de una rareza (0 normal, 1 raro, 2 épico). id: lo pone quien llama
  function objetoNuevo(datos, azar, id, rareza, hueco) {
    const E = datos.equipo, h = hueco || azar.elige(E.huecos), v = E.rarezas[rareza].valor;
    return { id, hueco: h, stat: azar.elige(E.porHueco[h]), valor: v[0] + azar.entero(v[1] - v[0] + 1), rareza, nivel: 0 };
  }
  // la suma de lo puesto: { vida: 5, ataque: 2… } en %
  function statsEquipo(datos, p) {
    const s = {};
    for (const k in datos.equipo.stats) s[k] = 0;
    for (const h of datos.equipo.huecos) { const o = p.equipo[h]; if (o) s[o.stat] += o.valor + o.nivel; }
    return s;
  }
  function ponObjeto(datos, p, id) {
    const o = p.mochila.find(x => x.id === id);
    if (!o) return AS.error('no-esta-en-la-mochila');
    const antes = p.equipo[o.hueco], mochila = p.mochila.filter(x => x.id !== id);
    if (antes) mochila.push(antes);
    return AS.ok(copia(p, { mochila, equipo: { ...p.equipo, [o.hueco]: o } }));
  }
  function quitaObjeto(datos, p, hueco) {
    const o = p.equipo[hueco];
    if (!o) return AS.error('hueco-vacio');
    if (p.mochila.length >= datos.equipo.mochila) return AS.error('mochila-llena');
    const equipo = { ...p.equipo };
    delete equipo[hueco];
    return AS.ok(copia(p, { equipo, mochila: [...p.mochila, o] }));
  }
  // deshacer un objeto (de la mochila o puesto) en plumas
  function deshaceObjeto(datos, p, id) {
    const puesto = datos.equipo.huecos.find(h => p.equipo[h] && p.equipo[h].id === id), o = puesto ? p.equipo[puesto] : p.mochila.find(x => x.id === id);
    if (!o) return AS.error('objeto-desconocido');
    const equipo = { ...p.equipo };
    if (puesto) delete equipo[puesto];
    return AS.ok(copia(p, { equipo, mochila: p.mochila.filter(x => x.id !== id), plumas: p.plumas + datos.equipo.desencantar[o.rareza] }));
  }
  const costeHerreria = (datos, o) => datos.equipo.herreria * (o.nivel + 1);
  function mejoraObjeto(datos, p, hueco) {
    const o = p.equipo[hueco];
    if (!o) return AS.error('hueco-vacio');
    const coste = costeHerreria(datos, o);
    if (p.plumas < coste) return AS.error('sin-plumas', { coste });
    return AS.ok(copia(p, { plumas: p.plumas - coste, equipo: { ...p.equipo, [hueco]: { ...o, nivel: o.nivel + 1 } } }));
  }
  // mete objetos en la mochila; los que no caben se deshacen en plumas. Devuelve { p, fuera }
  function guardaObjetos(datos, p, lista) {
    const mochila = p.mochila.slice();
    let plumas = p.plumas, fuera = 0;
    for (const o of lista) { if (mochila.length < datos.equipo.mochila) mochila.push(o); else { plumas += datos.equipo.desencantar[o.rareza]; fuera++; } }
    return { p: copia(p, { mochila, plumas }), fuera };
  }
  // el cofre de la Tienda: cuesta plumas y da un objeto (60 % normal, 30 % raro, 10 % épico)
  function compraCofre(datos, p, azar, id) {
    const coste = datos.equipo.cofreTienda;
    if (p.plumas < coste) return AS.error('sin-plumas', { coste });
    const r = azar(), o = objetoNuevo(datos, azar, id, r < 0.6 ? 0 : r < 0.9 ? 1 : 2);
    const g = guardaObjetos(datos, copia(p, { plumas: p.plumas - coste }), [o]);
    return AS.ok({ p: g.p, objeto: o, fuera: g.fuera });
  }

  /* ---------- los logros y los contadores ---------- */
  const cumple = (p, l) => (l.zona !== undefined ? p.zonas.includes(l.zona) : (p.stats[l.stat] || 0) >= l.meta);
  const logrosPendientes = (datos, p) => datos.logros.filter(l => !p.logros[l.id] && cumple(p, l));
  function cobraLogro(datos, p, id) {
    const l = logrosPendientes(datos, p).find(x => x.id === id);
    if (!l) return AS.error('logro-no-cobrable');
    return AS.ok(copia(p, { plumas: p.plumas + l.premio, logros: { ...p.logros, [id]: true } }));
  }
  // lo que deja una partida, según va pasando. suma: { plumas, oroTotal, enemigos, jefes, lineas, ascensos, dorados }; maximos: { nivelMax, sinFinMax }
  function apunta(p, suma, maximos) {
    const stats = { ...p.stats };
    let plumas = p.plumas;
    for (const k in (suma || {})) { if (k === 'plumas') plumas += entero(suma[k]); else if (k in stats) stats[k] += entero(suma[k]); }
    for (const k in (maximos || {})) if (k in stats) stats[k] = Math.max(stats[k], entero(maximos[k]));
    return copia(p, { plumas, stats });
  }
  // las plumas de regalo del anuncio de la Tienda (tope por día): AS.ok({ p, plumas }) o el error de AS.anuncios.regaloUsa
  function regalaPlumas(datos, p, dia) {
    const r = AS.anuncios.regaloUsa(datos, p.regalo, dia);
    return r.ok ? AS.ok({ p: copia(p, { regalo: r.valor.regalo, plumas: p.plumas + r.valor.plumas }), plumas: r.valor.plumas }) : r;
  }
  const empiezaPartida = p => copia(p, { partidas: p.partidas + 1 });
  // una zona superada en la dificultad dif (0 si no se dice): cuenta la zona y hasta qué dificultad se ha llegado en ella
  function terminaZona(p, zona, dif) {
    const hechas = Math.max(superadas(p, zona), (dif || 0) + 1);
    if (p.zonas.includes(zona) && hechas === superadas(p, zona) && p.dif[zona] === hechas) return p;
    return copia(p, { zonas: p.zonas.includes(zona) ? p.zonas : [...p.zonas, zona], dif: { ...p.dif, [zona]: hechas } });
  }
  // la mejor oleada: de las zonas normales (mejor) o del modo sin fin de una zona
  function apuntaOleada(p, zona, oleada, sinFin) {
    if (!sinFin) return oleada > p.mejor ? copia(p, { mejor: oleada }) : p;
    const q = apunta(p, null, { sinFinMax: oleada });
    return oleada > (p.sinFin[zona] || 0) ? copia(q, { sinFin: { ...p.sinFin, [zona]: oleada } }) : q;
  }
  // las metas de fuera que quedan más cerca, para tenerlas a la vista: la mejora más barata que aún se puede comprar (con las plumas
  // que hay y lo que cuesta) y el logro sin cumplir al que menos le falta, en proporción. Cada una puede ser null si no queda ninguna.
  function metas(datos, p) {
    const mejoras = Object.keys(datos.mejoras).map(id => ({ id, coste: costeMejora(datos, p, id) })).filter(m => m.coste).sort((a, b) => a.coste - b.coste);
    const logros = datos.logros.filter(l => l.stat && !p.logros[l.id] && !cumple(p, l)).map(l => ({ id: l.id, txt: l.txt, premio: l.premio, va: p.stats[l.stat] || 0, meta: l.meta }))
      .sort((a, b) => b.va / b.meta - a.va / a.meta);
    return { mejora: mejoras.length ? { ...mejoras[0], nombre: datos.mejoras[mejoras[0].id].nombre, plumas: p.plumas } : null, logro: logros[0] || null };
  }
  const olvidaConsejo = (p, id) => { const consejos = { ...p.consejos }; delete consejos[id]; return copia(p, { consejos }); };
  const consejoVisto = (p, id) => (p.consejos[id] ? p : copia(p, { consejos: { ...p.consejos, [id]: true } }));
  return { nuevo, deJSON, rarezaSiguiente, abreRareza, dormidoSiguiente, abreDormido, maquinaAbierta, abreMaquina, eligeMaquina, superadas, dificultadAbierta, costeMejora, compraMejora, objetoNuevo, statsEquipo, ponObjeto, quitaObjeto, deshaceObjeto, costeHerreria, mejoraObjeto, guardaObjetos, compraCofre,
    logrosPendientes, cobraLogro, apunta, regalaPlumas, empiezaPartida, terminaZona, apuntaOleada, metas, consejoVisto, olvidaConsejo };
})();
