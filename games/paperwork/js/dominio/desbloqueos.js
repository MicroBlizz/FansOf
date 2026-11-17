// Fans Of Paperwork · dominio · DESBLOQUEOS: el juego se abre poco a poco. Cada cosa de PW.DESBLOQUEOS (datos.js) tiene el nivel de la
// Trituradora que hay que haber atascado para tenerla; como la Trituradora es de la carrera, lo abierto no se pierde con el Despido.
// Quien pregunta es cada regla (sellos, cofres, sindicato, pedidos, auditoría, Despido, plan) y la pantalla, para no enseñar lo cerrado.
'use strict';
PW.desbloqueos = (() => {
  const nivelDe = e => e.c.trituradora.nivel;
  const de = id => PW.DESBLOQUEOS.find(d => d.id === id);
  // ¿está ya abierto? (lo que no está en la lista está abierto desde el principio)
  const tiene = (e, id) => { const d = de(id); return !d || nivelDe(e) >= d.nivel; };
  // todo lo abierto ahora, como { id: true }: viaja en los bonos (B.abierto) para las reglas que ya los reciben
  const abiertos = e => Object.fromEntries(PW.DESBLOQUEOS.map(d => [d.id, nivelDe(e) >= d.nivel]));
  // lo que abre atascar justo el nivel n, y lo siguiente que queda por abrir (o null)
  const alAtascar = n => PW.DESBLOQUEOS.filter(d => d.nivel === n);
  const siguiente = e => PW.DESBLOQUEOS.filter(d => d.nivel > nivelDe(e)).sort((a, b) => a.nivel - b.nivel)[0] || null;
  return { tiene, abiertos, alAtascar, siguiente };
})();
