// Fans Of · las caras de cuenta: las caras que se pueden elegir para la cuenta en la web (menú y Mi cuenta), agrupadas por juego.
// Solo datos y funciones puras: los grupos con sus ids y la ruta de cada imagen (biblioteca/caras/<grupo>/<personaje>.png, pintadas por
// herramientas/caras/pintar-caras.js con el marco de avatar de core). La web usa esas imágenes y NO carga los dibujos de los personajes.
// Las 24 de la serie llevan la id sin prefijo ('bunny'); las de un juego, 'juego:personaje' ('pop:lola'): es el formato que valida el servidor.
'use strict';
const CARAS_CUENTA = (() => {
  const GRUPOS = [
    { grupo: 'serie', nombre: 'Fans Of', ids: ['bunny', 'fox', 'squirrel', 'huron', 'necrolord', 'ghostmage', 'banshee', 'twitchking', 'hater', 'epicchampion', 'thundergod', 'medusa',
      'cybermarine', 'hackerkid', 'memelord', 'synthcat', 'progamer', 'vikingo', 'heroe', 'detective', 'ceo', 'becario', 'soportebot', 'plusbot', 'beaver', 'meercat', 'junkcoon', 'mechavaca'] },
    { grupo: 'pop', nombre: 'Fans of Pop', ids: ['pop:lola', 'pop:bunny', 'pop:becario', 'pop:cofre', 'pop:ceo', 'pop:copito', 'pop:medusa', 'pop:algodon',
      'pop:nubecita', 'pop:hada', 'pop:sirena', 'pop:maneki', 'pop:astro'] },
    { grupo: 'rouflage', nombre: 'Fans of Rouflage', ids: ['rouflage:colado'] },
  ];
  const grupos = Object.freeze(GRUPOS.map(g => Object.freeze({ ...g, ids: Object.freeze([...g.ids]) })));
  const ids = Object.freeze(grupos.flatMap(g => g.ids));
  const dentro = new Set(ids);
  // el grupo de una id y su personaje: 'pop:lola' es del grupo pop y personaje lola; sin prefijo, de la serie
  const partes = id => { const i = id.indexOf(':'); return i < 0 ? ['serie', id] : [id.slice(0, i), id.slice(i + 1)]; };
  // la imagen de una cara; raiz es lo que lleva delante la página para llegar a la raíz de la web ('' o '../'); null si la id no está en la lista
  const ruta = (id, raiz = '') => {
    if (typeof id !== 'string' || !dentro.has(id)) return null;
    const [grupo, personaje] = partes(id);
    return raiz + 'biblioteca/caras/' + grupo + '/' + personaje + '.png';
  };
  const vale = id => typeof id === 'string' && dentro.has(id);
  const caras = Object.freeze({ grupos, ids, ruta, vale, partes });
  if (typeof module !== 'undefined') module.exports = caras;
  return caras;
})();
