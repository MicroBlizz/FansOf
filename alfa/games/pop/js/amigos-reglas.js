// Fans of Pop · PESTAÑA AMIGOS, reglas (dominio; tarea #145, ADR 189): limpia la respuesta de pop_amigos, ordena y reparte a los amigos,
// resume un envío, el regalo diario de Lola, las caras del mapa y el aviso de reto. Funciones puras: sin reloj, azar, SAVE, red ni dibujo.
// Los fallos de reglas son resultados con nombre ({ ok:false, error }). Mundo y nivel llegan en base 0 (tal como los guarda el juego y el
// servidor); solo rotuloNivel suma 1 para pintar «Mundo M · nivel N». Todo lo que sale va congelado y las entradas no se tocan.
'use strict';
const PP_AMIGOS_REGLAS = Object.freeze((() => {
  const TOPE_DIA = 5;   // corazones que se pueden enviar al día (lo manda el servidor; aquí solo se muestra)
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const CODIGO = new RegExp(`^[${ALFABETO}]{8}$`);
  const SALA = /^[A-Z]{4}$/;
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const NOMBRE_MAX = 14;
  const AYUDAS_LOLA = Object.freeze(['martillo', 'bomba', 'toques3']);
  const FRASES = Object.freeze([
    Object.freeze({ id: 'gracias', texto: '¡Gracias!' }),
    Object.freeze({ id: 'lomas', texto: '¡Eres lo más!' }),
    Object.freeze({ id: 'devuelvo', texto: '¡Te devuelvo uno!' }),
    Object.freeze({ id: 'alcanzo', texto: '¡Te alcanzo!' }),
  ]);
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const entero = n => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0);
  const objeto = x => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  const lista = x => (Array.isArray(x) ? x : []);
  const fraseValida = id => FRASES.some(f => f.id === id);
  const codigoDe = c => {
    const t = typeof c === 'string' ? c.trim().toUpperCase() : '';
    return CODIGO.test(t) ? t : null;
  };
  const nombreDe = n => (typeof n === 'string' ? Array.from(n.trim()).slice(0, NOMBRE_MAX).join('') : '');
  const perfilDe = p => (p && typeof p === 'object' && !Array.isArray(p) ? Object.freeze({ ...p }) : null);
  const creadoDe = c => (typeof c === 'string' || (typeof c === 'number' && Number.isFinite(c)) ? c : null);
  const amigo = a => {
    const x = objeto(a);
    const codigo = codigoDe(x.codigo);
    if (!codigo) return null;
    return Object.freeze({ codigo, nombre: nombreDe(x.nombre), perfil: perfilDe(x.perfil), nivel: entero(x.nivel), mundo: entero(x.mundo),
      enviado: x.enviado === true, lleno: x.lleno === true });
  };
  const sugerido = a => {
    const x = objeto(a);
    const codigo = codigoDe(x.codigo);
    if (!codigo) return null;
    const motivo = typeof x.motivo === 'string' ? x.motivo : null;
    return Object.freeze({ codigo, nombre: nombreDe(x.nombre), perfil: perfilDe(x.perfil), motivo });
  };
  const regalo = g => {
    const x = objeto(g);
    return Object.freeze({ id: x.id, codigo: codigoDe(x.codigo), nombre: nombreDe(x.nombre), perfil: perfilDe(x.perfil), creado: creadoDe(x.creado) });
  };
  const gracia = g => {
    const x = objeto(g);
    const codigo = codigoDe(x.codigo);
    if (!codigo || !fraseValida(x.frase)) return null;
    return Object.freeze({ codigo, nombre: nombreDe(x.nombre), frase: x.frase });
  };
  const congela = (xs, f) => Object.freeze(lista(xs).map(f).filter(Boolean));
  // la respuesta de pop_amigos, limpia y congelada; ante basura, todo vacío (codigo null, hoy y tope por defecto)
  function normaliza(respuesta) {
    const r = objeto(respuesta);
    const buena = r.ok !== false;
    const dato = k => (buena ? r[k] : []);
    return Object.freeze({
      codigo: buena ? codigoDe(r.codigo) : null,
      hoy: buena && typeof r.hoy === 'string' ? r.hoy : '',
      tope: buena && Number.isFinite(r.tope) && r.tope > 0 ? Math.trunc(r.tope) : TOPE_DIA,
      amigos: congela(dato('amigos'), amigo),
      sugeridos: congela(dato('sugeridos'), sugerido),
      regalos: congela(dato('regalos'), g => (Number.isInteger(objeto(g).id) ? regalo(g) : null)),
      gracias: congela(dato('gracias'), gracia),
      avisos: congela(dato('avisos'), a => (a && typeof a === 'object' ? Object.freeze({ ...a }) : null)),
    });
  }
  // por mundo y nivel de mayor a menor, luego por nombre (copia: no muta)
  function ordena(amigos) {
    return Object.freeze(lista(amigos).slice().sort((a, b) =>
      (b.mundo - a.mundo) || (b.nivel - a.nivel) || String(a.nombre).localeCompare(String(b.nombre), 'es')));
  }
  // los códigos a los que se puede mandar corazón a la vez: sin enviado ni lleno
  const aTodos = amigos => Object.freeze(lista(amigos).filter(a => a && codigoDe(a.codigo) && !a.enviado && !a.lleno).map(a => a.codigo));
  // 'enviar' | 'enviado' | 'lleno' (lleno manda sobre enviado: no puede recibir más)
  function estadoAmigo(a) {
    const x = objeto(a);
    if (x.lleno) return 'lleno';
    return x.enviado ? 'enviado' : 'enviar';
  }
  const largo = x => lista(x).length;
  // el resultado de «corazón a todos» ({ enviados, ya, llenos, no_amigo } listas) en cifras y un caso de pantalla
  function resumenEnvio(respuesta) {
    const r = objeto(respuesta);
    const enviados = largo(r.enviados), llenos = largo(r.llenos), ya = largo(r.ya);
    let caso = 'algunos';
    if (enviados + llenos + ya === 0) caso = largo(r.no_amigo) > 0 ? 'ninguno' : 'sin_amigos';
    else if (enviados === 0) caso = 'ninguno';
    else if (llenos + ya === 0) caso = 'todos';
    return Object.freeze({ enviados, llenos, ya, caso });
  }
  // hash sencillo y estable del texto del día (suma ponderada, sin azar)
  const hash = t => Array.from(t).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1000003, 7);
  const diaValido = d => typeof d === 'string' && DIA.test(d);
  // el regalo diario de Lola: el mismo para todos ese día
  function lola(dia, abiertoDia) {
    if (!diaValido(dia)) return error('dia');
    return ok({ disponible: dia !== abiertoDia, corazones: 1, ayuda: AYUDAS_LOLA[hash(dia) % AYUDAS_LOLA.length] });
  }
  // abrir el regalo de Lola: solo si no se abrió hoy y cabe el corazón; si no, el regalo espera entero
  function lolaAbrir(dia, abiertoDia, vidas, max, infinitas) {
    const l = lola(dia, abiertoDia);
    if (!l.ok) return l;
    if (!l.disponible) return error('ya_abierto');
    const cabe = infinitas !== true && typeof vidas === 'number' && Number.isFinite(vidas) && vidas < entero(max);
    return cabe ? ok({ corazones: 1, ayuda: l.ayuda, dia }) : error('lleno');
  }
  // las caras de los amigos de un mundo agrupadas por nivel (como mucho porNivel por nivel), de menor a mayor nivel
  function carasMapa(amigos, mundo, porNivel = 3) {
    const tope = Math.max(0, entero(porNivel));
    const grupos = new Map();
    for (const a of lista(amigos)) {
      if (!a || a.mundo !== mundo) continue;
      grupos.set(a.nivel, [...(grupos.get(a.nivel) || []), a.codigo]);
    }
    return Object.freeze([...grupos.keys()].sort((x, y) => x - y)
      .map(nivel => Object.freeze({ nivel, codigos: Object.freeze(grupos.get(nivel).slice(0, tope)) })));
  }
  // «Mundo M · nivel N» para pintar: mundo y nivel guardados en base 0 se muestran desde 1
  const rotuloNivel = a => Object.freeze({ mundo: entero(objeto(a).mundo) + 1, nivel: entero(objeto(a).nivel) + 1 });
  // un aviso de reto { codigo, nombre, tipo: 'reto', datos: { sala } } -> { ok, codigo, nombre, sala } o { ok:false, error:'aviso' }
  function reto(aviso) {
    const x = objeto(aviso);
    const codigo = codigoDe(x.codigo);
    const sala = typeof objeto(x.datos).sala === 'string' ? objeto(x.datos).sala.trim().toUpperCase() : '';
    if (x.tipo !== 'reto' || !codigo || !SALA.test(sala)) return error('aviso');
    return ok({ codigo, nombre: nombreDe(x.nombre), sala });
  }
  return { TOPE_DIA, ALFABETO, FRASES, fraseValida, normaliza, ordena, aTodos, estadoAmigo, resumenEnvio, lola, lolaAbrir, carasMapa, rotuloNivel, reto };
})());
if (typeof module !== 'undefined') module.exports = PP_AMIGOS_REGLAS;
