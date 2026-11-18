// Fans of Pop · EL PERFIL EN LOS DUELOS CONTRA GENTE (aplicación, por puertos; tarea #41, ADR 130, nodo n7): lo que lleva puesto tu rival
// para su panel del VS. Se pide al servidor (pop_perfil_sala, servidor/150), que lo comprueba: así nadie luce lo que no pagó y la sala no
// tiene que dar su cuenta. Nunca la foto (ADR 098). Las reglas están en js/perfil.js (PP_PERFIL.deSala); el pegamento con la sala, en js/pvp.js.
'use strict';
const PP_PVP_PERFIL = Object.freeze({
  // `rpc(nombre, cuerpo)`: la llamada al servidor (CUENTA.rpc); `cat`: el catálogo con los personajes (PP_MI.cat)
  crea({ rpc, cat }) {
    // el perfil del jugador de esa `orden` en la sala; sin red, sin cuenta o si el servidor no contesta, lo de serie (lo gratis)
    async function rival(sala, orden) {
      let lista = null;
      try { lista = await rpc('pop_perfil_sala', { p_sala: sala }); } catch (e) { lista = null; }   // sin respuesta: lo de serie, como quien nunca se puso nada
      return PP_PERFIL.deSala(lista, orden, cat);
    }
    return Object.freeze({ rival });
  },
});
