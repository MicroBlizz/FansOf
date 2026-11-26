// Fans of Pop · PRIMEROS PASOS (dominio; tarea #140): los primeros minutos de una partida NUEVA. Cada cosa (Duelos, Memoria, el Pase,
// la hucha…) se abre al GANAR su nivel y Lola la estrena una sola vez; los niveles 1 a 3 van seguidos y sin perder corazones (la primera vez); la
// barra de ayudas sale desde el 4 y algunas explicaciones de Lola esperan a su nivel. Una partida VIEJA (de antes de esto) lo ve todo
// como siempre. Funciones puras y datos congelados: sin reloj, azar, SAVE, red ni dibujo. La tabla está en PP_CFG.primeros (js/ajustes.js).
// `p` es la situación de la partida: { nueva: si va con los primeros pasos, nivel: cuántos niveles del camino lleva ganados (PP_P.nivel) }.
// Los niveles de la tabla cuentan desde 1 («se abre al ganar el nivel 3»); `g` es el nivel global desde 0, como en js/niveles.js.
'use strict';
const PP_PRIMEROS = Object.freeze((() => {
  const natural = n => Number.isInteger(n) && n >= 0;
  const ganados = p => (natural(p && p.nivel) ? p.nivel : 0);
  const conPasos = p => !!(p && p.nueva);
  // el nivel al ganar el cual se abre `cosa` (0 si no está en la tabla: abierta siempre)
  const nivelDe = (cfg, cosa) => { const c = cfg.cosas[cosa]; return c ? c.nivel : 0; };
  // ¿se ve ya `cosa`? En una partida vieja, todo
  const abierto = (cfg, cosa, p) => !conPasos(p) || ganados(p) >= nivelDe(cfg, cosa);
  // la primera cosa ya abierta que aún no se ha estrenado (en orden de nivel), o null. `vistos`: { cosa: true } de las ya estrenadas;
  // `hay(cosa)`: si existe en esta copia del juego (el Perfil y los corazones entre amigos van con su propio flag)
  function estreno(cfg, p, vistos = {}, hay = () => true) {
    if (!conPasos(p)) return null;
    const lista = Object.keys(cfg.cosas).filter(k => abierto(cfg, k, p) && !(vistos && vistos[k]) && hay(k));
    lista.sort((a, b) => nivelDe(cfg, a) - nivelDe(cfg, b));
    return lista.length ? lista[0] : null;
  }
  // lo que Lola dice y regala al estrenar `cosa` (null si se estrena sola, con su ventana o con el primer rescate)
  function regalito(cfg, cosa) {
    const c = cfg.cosas[cosa];
    if (!c || !c.texto) return null;
    return Object.freeze({ texto: c.texto, premio: Object.freeze({ ...(c.regalo || {}) }) });
  }
  const camino = (p, g, dif) => conPasos(p) && !dif && natural(g);
  // JUGAR en una partida nueva sin estrenar entra directo en el nivel 1
  const directo = p => conPasos(p) && ganados(p) === 0;
  // tras ganar el nivel g, SIGUIENTE entra directo en el siguiente (solo dentro de los `seguidos` primeros)
  const seguido = (cfg, p, g, dif) => camino(p, g, dif) && g + 1 < cfg.seguidos;
  // quedarse sin toques (o salir a medias) en el nivel g no cuesta corazón. Solo la primera vez: repetir uno ya ganado es como un
  // nivel normal, para que no se pueda sacar nada gratis de ellos (Pepins, tarea 406)
  const sinCorazon = (cfg, p, g, dif) => camino(p, g, dif) && g < cfg.sinCorazon && g >= ganados(p);
  // la barra de ayudas en el nivel g (los duelos la tienen siempre)
  const verAyudas = (cfg, p, g, nim) => !camino(p, g, 0) || !!nim || g + 1 >= cfg.ayudasDesde;
  // ¿la explicación `k` de Lola espera a un nivel más adelante? (fuera de un nivel del camino, nunca)
  const tutoEspera = (cfg, p, k, g) => camino(p, g, 0) && natural(cfg.tutos[k]) && g + 1 < cfg.tutos[k];
  return { nivelDe, abierto, estreno, regalito, directo, seguido, sinCorazon, verAyudas, tutoEspera };
})());
if (typeof module !== 'undefined') module.exports = PP_PRIMEROS;
