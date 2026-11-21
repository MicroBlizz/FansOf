// Fans Of · LISTA DE AMIGOS común a todos los juegos (tarea #145, ADR 189): código de amigo de 8 letras, enlace ?amigo=CODIGO, lista, sugeridos y avisos.
// No se carga sola: cada juego que la usa la pide en su lista (NUCLEO.juego({ despues: ['../../core/js/sistema/amigos.js', ...] })), como salas.js.
// El servidor son las funciones amigos_* (servidor/178-amigos.sql). Un solo global, AMIGOS, en tres capas:
// · Reglas puras: ALFABETO, TOPE, limpiaCodigo(texto), enlace(base, codigo), codigoDe(search), motivoTexto(motivo), normalizaLista(r).
// · Casos de uso por puertos: AMIGOS.crea({ cuenta, juego, activo, enLinea }) → { miCodigo, quien, anadir, quitar, conocido(idSala), avisar, lista }.
//   Todos devuelven Promise de { ok:true, … } o { ok:false, motivo } y NUNCA lanzan. cuenta es CUENTA (o null), activo() el flag del juego y enLinea() la red.
//   Motivos propios: codigo (texto que no es un código, sin llamar al servidor), cerrado, sin_sesion, sin_red, servidor; los del servidor pasan tal cual
//   (no_existe, propio, ya, lleno, no_amigo, tope…).
// · Adaptador al final: quitaCodigoUrl() (lo único que toca location e history).
'use strict';
const AMIGOS = (() => {
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', TOPE = 100, LARGO = 8, NOMBRE = 14;
  const traduce = s => (typeof tr === 'function' ? tr(s) : s);
  const texto = v => (typeof v === 'string' ? v : '');
  // una frase por motivo; el inglés va en el diccionario de core (cada frase pasa por tr() al pedirla)
  const FRASES = {
    no_existe: 'Ese enlace de amigo no existe.', propio: 'Ese es tu propio enlace.', ya: 'Ya sois amigos.',
    lleno: 'Tu lista de amigos está llena (100).', no_amigo: 'Esa persona ya no está en tu lista de amigos.',
    tope: 'Has avisado a demasiados amigos. Prueba más tarde.', cerrado: 'Los amigos aún no están abiertos.',
    sin_sesion: 'Entra con tu cuenta para usar los amigos.', sin_red: 'Sin conexión. Prueba otra vez en un momento.',
    servidor: 'El servidor no ha contestado bien. Prueba otra vez.', codigo: 'Ese código de amigo no es válido.',
  };
  const motivoTexto = motivo => traduce(FRASES[motivo] || FRASES.servidor);

  // el código de amigo: 8 letras o cifras del alfabeto, sin importar mayúsculas ni espacios
  function limpiaCodigo(t) {
    const c = texto(t).replace(/\s+/g, '').toUpperCase();
    const bien = c.length === LARGO && [...c].every(x => ALFABETO.includes(x));
    return bien ? { ok: true, codigo: c } : { ok: false, error: 'codigo' };
  }
  // la base es la dirección de la página sin query ni hash; el enlace lleva solo ?amigo=
  const enlace = (base, codigo) => { const u = new URL(base); u.search = ''; u.hash = ''; u.searchParams.set('amigo', codigo); return u.toString(); };
  const codigoDe = search => { const m = /[?&]amigo=([^&#]*)/.exec(texto(search)); const c = m ? limpiaCodigo(m[1]) : null; return c && c.ok ? c.codigo : null; };

  // la lista que llega del servidor, siempre completa: nombres cortos y sin entradas sin código
  const nombre = v => texto(v).trim().slice(0, NOMBRE);
  const entradas = (v, extra) => (Array.isArray(v) ? v : []).flatMap(e => {
    const c = limpiaCodigo(e && e.codigo);
    return c.ok ? [Object.freeze({ ...extra(e), codigo: c.codigo, nombre: nombre(e.nombre) })] : [];
  });
  const objeto = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  function normalizaLista(r) {
    const o = objeto(r);
    const mio = limpiaCodigo(o.codigo);
    return Object.freeze({
      codigo: mio.ok ? mio.codigo : null,
      amigos: Object.freeze(entradas(o.amigos, () => ({}))),
      sugeridos: Object.freeze(entradas(o.sugeridos, e => ({ motivo: texto(e.motivo) }))),
      avisos: Object.freeze(entradas(o.avisos, e => ({ tipo: texto(e.tipo), datos: objeto(e.datos) }))),
    });
  }

  function crea({ cuenta, juego, activo, enLinea = () => true }) {
    const ok = v => Object.freeze({ ok: true, ...v });
    const no = motivo => Object.freeze({ ok: false, motivo });
    // un fallo que no se arregla reintentando es del servidor; lo demás, sin red
    const definitivo = e => { const n = e && e.estado; return n >= 400 && n < 500 && n !== 401 && n !== 408 && n !== 429; };
    const sesion = () => {
      if (!activo()) return no('cerrado');
      if (!cuenta || !cuenta.activa || !cuenta.usuario) return no('sin_sesion');
      return enLinea() ? null : no('sin_red');
    };
    async function llama(nombreFn, cuerpo) {
      const cerrada = sesion();
      if (cerrada) return cerrada;
      try {
        const r = await cuenta.rpc('amigos_' + nombreFn, { p_juego: juego, ...cuerpo });
        return r && typeof r === 'object' && typeof r.ok === 'boolean' ? r : no('servidor');
      } catch (e) { return no(definitivo(e) ? 'servidor' : 'sin_red'); }
    }
    // los que piden un código: uno inválido ni sale; un código de amigo siempre va en mayúsculas
    async function conCodigo(nombreFn, t, resto = {}) {
      const c = limpiaCodigo(t);
      return c.ok ? llama(nombreFn, { p_codigo: c.codigo, ...resto }) : no('codigo');
    }
    let mio = null;   // { usuario, codigo }: el código no cambia, se pide una vez por cuenta
    async function miCodigo() {
      if (!mio || (cuenta && mio.usuario !== cuenta.usuario)) {
        const r = await llama('mi_codigo', {});
        if (!r.ok) return r;
        const c = limpiaCodigo(r.codigo);
        if (!c.ok) return no('servidor');
        mio = { usuario: cuenta.usuario, codigo: c.codigo };
      }
      return ok({ codigo: mio.codigo });
    }
    const quien = t => conCodigo('quien', t);
    const anadir = t => conCodigo('anadir', t);
    const quitar = t => conCodigo('quitar', t);
    const avisar = (t, tipo, datos) => conCodigo('avisar', t, { p_tipo: tipo, p_datos: datos || {} });
    // la sala es su id numérico (salas.sala, no el código de 4 letras): un entero positivo
    async function conocido(sala) {
      return Number.isSafeInteger(sala) && sala > 0 ? llama('conocido', { p_sala: sala }) : no('codigo');
    }
    async function lista() {
      const r = await llama('lista', {});
      return r.ok ? ok(normalizaLista(r)) : r;
    }
    return Object.freeze({ miCodigo, quien, anadir, quitar, conocido, avisar, lista });
  }

  // Adaptador: quita ?amigo= de la dirección para que recargar no vuelva a añadir al mismo amigo
  const quitaCodigoUrl = () => {
    try { const u = new URL(location.href); u.searchParams.delete('amigo'); history.replaceState(null, '', u.toString()); }
    catch (e) { /* da igual: sin location o sin history (tests, webview) la dirección se queda como estaba */ }
  };

  return Object.freeze({ ALFABETO, TOPE, limpiaCodigo, enlace, codigoDe, motivoTexto, normalizaLista, crea, quitaCodigoUrl });
})();
if (typeof module !== 'undefined') module.exports = AMIGOS;
