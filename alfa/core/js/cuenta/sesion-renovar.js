// Fans Of · CUENTA · un token de acceso VIVO de la sesión de la web sin cargar la cuenta entera (tarea #300, ADR 190). core/js/sistema/cuenta.js trae
// la partida, la entrada por la dirección (#access_token) y la cuenta de invitado, y depende de NUCLEO: una página sin juego (/gestion) no puede cargarlo.
// Esta pieza solo lee la sesión guardada («fansof-cuenta») y, si su token caducó y tiene refresh token, la renueva con las reglas de cuenta.js:
//   · una sola renovación a la vez en la pestaña y entre pestañas, con el MISMO candado del navegador ('fansof-cuenta-renovar');
//   · dentro del candado vuelve a leer la sesión (otra pestaña o cuenta.js pudo renovarla ya) y guarda la nueva en el mismo sitio (Supabase gasta el refresh token al usarlo).
// A diferencia de cuenta.js NUNCA crea un invitado ni borra la sesión: si no hay o no se puede renovar, da '' y la web lo arregla cuando se vuelva a ella.
// Puertos de crear(): almacen { leer() → texto|null, escribir(texto) } · servidor { async renovar(refresh) → respuesta de Supabase Auth (lanza si falla) }
//                     reloj { ahora() } · candado(nombre, fn) → promesa de fn()
// enNavegador() los monta con localStorage, fetch y navigator.locks. estado() y crear() son puros y se prueban en Node (tests/core/cuenta-sesion-renovar.test.mjs).
'use strict';
const CUENTA_RENOVAR = (() => {
  const SESION = 'fansof-cuenta', CANDADO = 'fansof-cuenta-renovar', MARGEN = 60000;   // ms que le tienen que quedar al token para usarlo (como cuenta.js)
  const NINGUNA = Object.freeze({ tipo: 'ninguna' });
  const texto = v => typeof v === 'string' && v !== '';

  // Lo guardado: { tipo: 'viva', access } · { tipo: 'caducada', sesion } (caducada o a punto, con refresh token) · NINGUNA (sin sesión, invitado, mal guardada o sin refresh)
  function estado(guardado, ahora) {
    let s = null;
    try { s = guardado ? JSON.parse(guardado) : null; } catch (e) { return NINGUNA; }
    if (!s || typeof s !== 'object' || s.invitado) return NINGUNA;
    if (texto(s.access) && Number(s.caduca) > ahora + MARGEN) return { tipo: 'viva', access: s.access };
    return texto(s.refresh) ? { tipo: 'caducada', sesion: s } : NINGUNA;
  }
  // La sesión renovada: la de antes (cuenta, correo, foto…) con el token, el refresh token y la caducidad nuevos. Lanza si la respuesta no los trae
  function renovada(antes, d, ahora) {
    if (!d || !texto(d.access_token) || !texto(d.refresh_token)) throw new Error('respuesta_sin_tokens');
    return Object.assign({}, antes, { access: d.access_token, refresh: d.refresh_token, caduca: ahora + (Number(d.expires_in) || 3600) * 1000 });
  }
  const accesoDe = e => (e.tipo === 'viva' ? e.access : '');

  function crear({ almacen, servidor, reloj, candado }) {
    let renovando = null;   // la renovación en marcha en esta pestaña: dos llamadas seguidas esperan la misma
    async function dentroDelCandado() {
      const e = estado(almacen.leer(), reloj.ahora());
      if (e.tipo !== 'caducada') return accesoDe(e);   // otra pestaña ya la renovó (o ya no hay)
      try {
        const nueva = renovada(e.sesion, await servidor.renovar(e.sesion.refresh), reloj.ahora());
        almacen.escribir(JSON.stringify(nueva));
        return nueva.access;
      } catch (x) {
        return accesoDe(estado(almacen.leer(), reloj.ahora()));   // sin candados, otra pestaña pudo renovarla a la vez: se usa la suya; si no, nada
      }
    }
    // El token vivo de la sesión de la web, renovándolo si hace falta; '' si no hay sesión con cuenta o no se pudo. Nunca lanza
    function acceso() {
      const e = estado(almacen.leer(), reloj.ahora());
      if (e.tipo !== 'caducada') return Promise.resolve(accesoDe(e));
      if (!renovando) renovando = Promise.resolve().then(() => candado(CANDADO, dentroDelCandado)).catch(() => '').finally(() => { renovando = null; });
      return renovando;
    }
    return Object.freeze({ acceso });
  }

  // Los puertos de verdad. local: localStorage (o null si el navegador lo bloquea) · red: fetch · locks: navigator.locks (puede faltar)
  function enNavegador({ servidor, clave, local, red, locks, reloj = Date }) {
    return crear({
      almacen: {
        leer() { try { return local.getItem(SESION); } catch (e) { return null; } },
        escribir(t) { try { local.setItem(SESION, t); } catch (e) { /* sin almacenamiento: el token renovado vale solo para esta vez */ } },
      },
      servidor: {
        async renovar(refresh) {
          const r = await red(servidor + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', cache: 'no-store', headers: { apikey: clave, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh }) });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        },
      },
      reloj: { ahora: () => reloj.now() },
      candado: (nombre, fn) => (locks && locks.request ? locks.request(nombre, fn) : fn()),
    });
  }
  return Object.freeze({ estado, crear, enNavegador });
})();
