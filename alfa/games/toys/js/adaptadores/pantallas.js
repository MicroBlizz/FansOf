// Fans of Toys · adaptador · PANTALLAS: el gestor. Cada pantalla se apunta sola con TY.pantallas.registra(nombre, monta) y `monta()`
// devuelve su elemento ya construido. `sigue()` enseña la pantalla que toca según la fase de la partida. TY.aviso enseña una frase
// corta abajo durante un momento (lo que hace una mejora, el caso real de una noticia).
'use strict';
TY.pantallas = (() => {
  const registro = {}, DE_FASE = { director: 'mejora', mejora: 'mejora', noticia: 'noticia', fabrica: 'fabrica', resultado: 'resultado', fin: 'fin' };
  let actual = null;
  return {
    registra(nombre, monta) { registro[nombre] = monta; },
    ve(nombre) {
      actual = nombre;
      const capa = TY.capa();
      capa.dataset.pantalla = nombre;
      capa.replaceChildren(registro[nombre]());
    },
    sigue() { const p = TY.sesion.partida; this.ve(p ? DE_FASE[p.fase] : 'inicio'); },
    get actual() { return actual; },
    enPartida: () => !!actual && actual !== 'inicio' && actual !== 'fin',
  };
})();
TY.aviso = (titulo, texto) => {
  document.querySelectorAll('.ty-aviso').forEach(a => a.remove());
  const aviso = TY.crea('div', { className: 'ty-aviso' }, TY.crea('b', { textContent: titulo }), TY.crea('span', { textContent: texto }));
  aviso.onclick = () => aviso.remove();
  document.getElementById('ty-escenario').append(aviso);
  setTimeout(() => aviso.remove(), 4500);
};
