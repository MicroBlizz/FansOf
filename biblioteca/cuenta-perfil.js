// Fans Of · MI CUENTA de la web · las reglas (dominio, tarea #299): qué cara se enseña, limpiar el nombre y el email, qué juegos se pueden elegir
// como favorito, tus guardados y tus votos, el nombre del archivo de DESCARGAR MIS DATOS, la palabra de BORRAR MI CUENTA y el aviso de cada motivo.
// Puro: sin pantalla, red, reloj ni almacenamiento. Lo usan biblioteca/cuenta-casos.js (los casos de uso) y la pantalla (cuenta-web.js y sus pestañas).
// Las caras son las de biblioteca/caras-cuenta.js (CARAS_CUENTA), que se le pasan: así se prueba con node:test sin navegador.
'use strict';
const CUENTA_PERFIL = (() => {
  const PESTANAS = Object.freeze(['perfil', 'juegos', 'ajustes']);
  const CARA_POR_DEFECTO = 'bunny';
  const PALABRA_BORRAR = 'BORRAR';
  const texto = v => (typeof v === 'string' ? v : '');

  // el perfil que da el servidor (perfil_leer: {nombre, cara, juego} o null), siempre con las tres claves y congelado
  const perfil = datos => {
    const d = datos && typeof datos === 'object' ? datos : {};
    return Object.freeze({ nombre: texto(d.nombre), cara: texto(d.cara), juego: texto(d.juego) });
  };
  const VACIO = perfil(null);
  const conCambio = (p, cambio) => perfil({ ...p, ...cambio });
  const pestana = p => (PESTANAS.includes(p) ? p : 'perfil');

  // qué cara se enseña: la elegida si tiene imagen; si no, la foto de Google (solo https); si no, la de por defecto. raiz: '' en la portada, '../' en las demás
  function caraVisible({ cara, foto } = {}, caras, raiz = '') {
    if (caras.vale(cara)) return Object.freeze({ tipo: 'cara', id: cara, src: caras.ruta(cara, raiz) });
    if (/^https:\/\//.test(texto(foto))) return Object.freeze({ tipo: 'foto', id: '', src: foto });
    return Object.freeze({ tipo: 'defecto', id: '', src: caras.ruta(CARA_POR_DEFECTO, raiz) });
  }
  // la pestaña de grupo que se abre primero: la de la cara elegida, o la primera
  function grupoInicial(cara, caras) {
    const g = caras.vale(cara) ? caras.partes(cara)[0] : '';
    return caras.grupos.some(x => x.grupo === g) ? g : caras.grupos[0].grupo;
  }
  // el nombre del personaje para el aria-label: 'pop:lola' → 'Lola'
  const nombrePersonaje = (id, caras) => { const p = caras.partes(texto(id))[1] || ''; return p.charAt(0).toUpperCase() + p.slice(1); };

  // el nombre: letras, números, espacio, '_', '.' y '-', sin espacios de más, hasta 14; al menos 3
  function limpiarNombre(v) {
    const limpio = texto(v).replace(/[^\p{L}\p{N} _.-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14);
    return limpio.length < 3 ? { ok: false, motivo: 'nombre_corto' } : { ok: true, valor: limpio };
  }
  // lo que contesta el servidor al cambiar el nombre (perfil_nombre lanza con el motivo en el mensaje) → un motivo con nombre
  function motivoDelNombre(mensaje) {
    const m = texto(mensaje);
    if (/nombre_no_vale/.test(m)) return 'nombre_no_vale';
    if (/nombre_corto/.test(m)) return 'nombre_corto';
    if (/perfil_nombre|404|PGRST/.test(m)) return 'no_disponible';
    return 'red';
  }
  function limpiarEmail(v, actual = '') {
    const e = texto(v).trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, motivo: 'email_mal' };
    if (e.toLowerCase() === texto(actual).toLowerCase()) return { ok: false, motivo: 'email_igual' };
    return { ok: true, valor: e };
  }
  const confirmaBorrar = (escrito, palabra = PALABRA_BORRAR) => texto(escrito).trim().toUpperCase() === texto(palabra).toUpperCase() && !!palabra;

  // DESCARGAR MIS DATOS: «fansof-mis-datos-AAAA-MM-DD.json» con la fecha que da quien llama ({ año, mes, dia })
  const dos = n => String(n).padStart(2, '0');
  const archivoDatos = ({ año, mes, dia }) => `fansof-mis-datos-${año}-${dos(mes)}-${dos(dia)}.json`;

  // los juegos que se pueden elegir: las tarjetas de la biblioteca que llevan a games/<id>/ ({ tarjeta, nombre, jugar }), sin repetir
  function juegosDeBiblioteca(tarjetas) {
    const vistos = new Set(), out = [];
    for (const t of tarjetas || []) {
      const m = /^games\/([a-z0-9-]{1,40})\/$/.exec(texto(t.jugar));
      if (!m || vistos.has(m[1])) continue;
      vistos.add(m[1]); out.push(Object.freeze({ id: m[1], tarjeta: texto(t.tarjeta), nombre: texto(t.nombre), jugar: t.jugar }));
    }
    return Object.freeze(out);
  }
  // el juego favorito del perfil, si sigue en la biblioteca (si se quitó la carpeta, nada)
  const juegoElegido = (p, juegos) => (juegos || []).find(j => j.id === texto(p && p.juego)) || null;

  // MIS JUEGOS: tus guardados (ids de tarjeta 'g-pop') y tus votos ([{ tarjeta, voto }]) como juegos de la biblioteca; lo que ya no está, fuera
  function misJuegos({ guardados = [], votos = [] } = {}, juegos = []) {
    const deTarjeta = id => juegos.find(j => j.tarjeta === id);
    return Object.freeze({
      guardados: guardados.map(deTarjeta).filter(Boolean),
      votos: votos.map(v => { const j = deTarjeta(v.tarjeta); return j && Object.freeze({ ...j, voto: v.voto > 0 ? 1 : -1 }); }).filter(Boolean),
    });
  }

  // el aviso de cada motivo (la pantalla lo traduce con t()); 'red' lleva {m} con el mensaje
  const AVISOS = Object.freeze({
    sin_perfil: 'Antes pon tu nombre en TU NOMBRE: luego ya puedes elegir esto.',
    sin_cuenta: 'Entra con tu cuenta para guardarlo.',
    sin_sesion: 'Entra con tu cuenta para guardarlo.',
    cara_no_vale: 'Esa cara no vale. Elige otra.',
    juego_no_vale: 'Ese juego no vale. Elige otro.',
    nombre_corto: 'Tiene que tener al menos 3 letras o números.',
    nombre_no_vale: 'Ese nombre no está permitido. Prueba con otro.',
    no_disponible: 'Esto todavía no está disponible. Vuelve a probar en un rato.',
    email_mal: 'Ese email no parece bien escrito',
    email_igual: 'Ese ya es tu email.',
    sin_confirmar: 'Escribe {p} para confirmar.',   // {p}: la palabra, ya traducida (la pone la pantalla)
    red: 'No ha salido bien: {m}',
  });
  const aviso = motivo => AVISOS[motivo] || AVISOS.red;

  const reglas = Object.freeze({ PESTANAS, CARA_POR_DEFECTO, PALABRA_BORRAR, AVISOS, VACIO, perfil, conCambio, pestana, caraVisible, grupoInicial, nombrePersonaje,
    limpiarNombre, motivoDelNombre, limpiarEmail, confirmaBorrar, archivoDatos, juegosDeBiblioteca, juegoElegido, misJuegos, aviso });
  if (typeof module !== 'undefined') module.exports = reglas;
  return reglas;
})();
