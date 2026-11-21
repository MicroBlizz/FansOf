// Fans of Pop · COLECCIÓN EN EL JUEGO (aplicación; tarea #142, ADR 157): une las reglas de js/coleccion.js con la partida guardada
// (SAVE.cole) y con el flag `companeros`. Con el flag cerrado todo sigue como antes: un solo equipo, el del camino (PP_P.equipo), y
// solo en Niveles. Con el flag abierto, la colección vive en SAVE (no se pierde al empezar de nuevo el camino) y cada modo tiene su
// equipo. La primera vez que se abre, lo de antes (amigos vistos, equipo del camino y huecos comprados) pasa a la colección.
'use strict';
const ppCompanerosActivo = () => NUCLEO.flag('companeros', 'Pop: álbum de compañeros y un equipo por modo (tarea #142, ADR 157)', false);
// la colección de ahora (la crea desde lo de antes si aún no existe)
// Se valida una sola vez por cada SAVE.cole distinto (se llama en cada toque): las reglas nunca cambian el estado que reciben, y
// ppColeGuarda pone uno nuevo, así que mientras SAVE.cole sea el mismo objeto la lectura sirve
const PP_COLE_LEIDA = { de: null, e: null };
function ppCole() {
  if (!SAVE.cole) { SAVE.cole = PP_COLE.desdeViejo(SAVE.vistos, SAVE.run && SAVE.run.equipo, SAVE.huecos); ppGuarda(); }
  if (PP_COLE_LEIDA.de !== SAVE.cole) { PP_COLE_LEIDA.de = SAVE.cole; PP_COLE_LEIDA.e = PP_COLE.lee(SAVE.cole); }
  return PP_COLE_LEIDA.e;
}
function ppColeGuarda(e) { SAVE.cole = e; ppGuarda(); }
// el dibujo y los datos de un compañero (los 13 de siempre en PP_SLIMES; los nuevos en PP_COMP.NUEVOS)
const ppSlimeDe = id => PP_SLIMES[id] || PP_COMP.NUEVOS[id];
// el modo en el que se juega un nivel: Pesadilla (d.lo), Duelos (d.nim: difíciles y jefes con duelo) o Niveles
const ppModoDeNivel = d => (d && d.lo ? 'P' : d && d.nim ? 'D' : 'N');
// el equipo que ayuda en un modo. Sin flag: el de siempre, y solo en Niveles (en Pesadilla y duelos los amigos no ayudaban)
function ppEquipoDe(modo) {
  if (!ppCompanerosActivo()) return modo === 'N' && PP_P ? PP_P.equipo : [];
  return ppCole().eq[modo] || [];
}
// lo que hace un compañero ahora (con sus estrellas, si el flag está abierto)
function ppFxDe(id) {
  if (!ppCompanerosActivo()) return (ppSlimeDe(id) || { fx: {} }).fx;
  const r = PP_COLE.fxDe(ppCole(), id);
  return r.ok ? r.fx : {};
}
// conseguir un compañero (`rescate`: solo la primera vez). Devuelve el resultado de la regla; un repetido que sobra da sus monedas
function ppColeGana(id, rescate = false) {
  const r = (rescate ? PP_COLE.rescata : PP_COLE.gana)(ppCole(), id);
  if (!r.ok) return r;
  if (r.sobra) SAVE.monedas += r.sobra;
  ppColeGuarda(r.nuevo ? ppColeMete(r.estado, id) : r.estado);
  return r;
}
// uno nuevo: se apunta como visto (el perfil lo da de personaje) y entra solo en su equipo si hay sitio (como el rescate de antes)
function ppColeMete(e, id) {
  SAVE.vistos[id] = true;
  const puesto = PP_COLE.pon(e, PP_COLE.modoDe(id), id);
  return puesto.ok ? puesto.estado : e;
}
