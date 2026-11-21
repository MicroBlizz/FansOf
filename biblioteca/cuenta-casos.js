// Fans Of · MI CUENTA de la web · los casos de uso (aplicación, tarea #299): leer el perfil, elegir cara y juego favorito, cambiar el nombre y el email,
// descargar mis datos, cerrar sesión (aquí o en todos los aparatos) y borrar la cuenta. Cada uno devuelve un resultado con nombre:
// { ok: true, … } o { ok: false, motivo } (los motivos y sus avisos, en CUENTA_PERFIL). Sin pantalla: lo de fuera llega por puertos.
// Guarda el último perfil en memoria y lo cambia al momento cuando el servidor dice que sí, así la cara y el juego nuevos se ven sin volver a pedirlo.
// Puertos (los pone cuenta-web.js con CUENTA de core; los tests, de mentira):
//   servidor: { leer(), ponerCara(id), ponerJuego(id), ponerNombre(nombre), misDatos(), cambiarEmail(email), cerrar(alcance 'local'|'global'), borrar() }
//   caras: CARAS_CUENTA · reglas: CUENTA_PERFIL
'use strict';
const CUENTA_WEB_CASOS = (() => {
  function crear({ servidor, caras, reglas }) {
    let actual = reglas.VACIO;
    const mensaje = e => String((e && e.message) || '?');
    const red = e => ({ ok: false, motivo: 'red', mensaje: mensaje(e) });
    // lo que contesta perfil_poner_cara / perfil_poner_juego: {ok:true,…} o {ok:false, motivo}; otra cosa es un fallo
    const respuesta = r => (r && r.ok === true ? null : { ok: false, motivo: (r && r.motivo) || 'red', mensaje: '' });

    async function cargar() {
      try { actual = reglas.perfil(await servidor.leer()); return { ok: true, perfil: actual }; } catch (e) { return red(e); }
    }
    async function elegirCara(id) {
      if (!caras.vale(id)) return { ok: false, motivo: 'cara_no_vale' };
      let r; try { r = await servidor.ponerCara(id); } catch (e) { return red(e); }
      const mal = respuesta(r); if (mal) return mal;
      actual = reglas.conCambio(actual, { cara: id }); return { ok: true, perfil: actual };
    }
    async function elegirJuego(id, juegos) {
      if (!juegos.some(j => j.id === id)) return { ok: false, motivo: 'juego_no_vale' };
      let r; try { r = await servidor.ponerJuego(id); } catch (e) { return red(e); }
      const mal = respuesta(r); if (mal) return mal;
      actual = reglas.conCambio(actual, { juego: id }); return { ok: true, perfil: actual };
    }
    async function cambiarNombre(escrito) {
      const n = reglas.limpiarNombre(escrito); if (!n.ok) return n;
      try {
        const r = await servidor.ponerNombre(n.valor);
        actual = reglas.conCambio(actual, { nombre: (r && r.nombre) || n.valor }); return { ok: true, perfil: actual };
      } catch (e) { const motivo = reglas.motivoDelNombre(mensaje(e)); return { ok: false, motivo, mensaje: mensaje(e) }; }
    }
    // el email nuevo no cambia hasta que se abre el enlace que llega a ese correo
    async function cambiarEmail(escrito, emailActual) {
      const e = reglas.limpiarEmail(escrito, emailActual); if (!e.ok) return e;
      try { await servidor.cambiarEmail(e.valor); return { ok: true, email: e.valor }; } catch (err) { return red(err); }
    }
    async function descargarDatos(fecha) {
      let r; try { r = await servidor.misDatos(); } catch (e) { return red(e); }
      if (!r || r.ok === false) return { ok: false, motivo: (r && r.motivo) || 'red', mensaje: '' };
      return { ok: true, archivo: reglas.archivoDatos(fecha), texto: JSON.stringify(r, null, 2) };
    }
    async function cerrarSesion(enTodos) {
      try { await servidor.cerrar(enTodos ? 'global' : 'local'); } catch (e) { return red(e); }
      actual = reglas.VACIO; return { ok: true };
    }
    async function borrarCuenta(escrito, palabra) {
      if (!reglas.confirmaBorrar(escrito, palabra)) return { ok: false, motivo: 'sin_confirmar' };
      try { await servidor.borrar(); } catch (e) { return red(e); }
      actual = reglas.VACIO; return { ok: true };
    }
    const olvidar = () => { actual = reglas.VACIO; };
    return Object.freeze({ perfil: () => actual, cargar, elegirCara, elegirJuego, cambiarNombre, cambiarEmail, descargarDatos, cerrarSesion, borrarCuenta, olvidar });
  }
  const casos = Object.freeze({ crear });
  if (typeof module !== 'undefined') module.exports = casos;
  return casos;
})();
