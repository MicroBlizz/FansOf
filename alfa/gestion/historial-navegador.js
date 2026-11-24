// Fans Of · /gestion · HISTORIAL · adaptador del NAVEGADOR (tarea #322, ADR 201): lo único que toca `history` y el evento `popstate`, con las reglas de
// historial.js (GESTION_HISTORIAL). Un cambio de pestaña añade una entrada; abrir algo en el Tablero añade una «capa»; cerrarlo con un toque, si su capa
// está arriba, hace un atrás por dentro (y lo que se anote mientras llega espera a que llegue). Al volver a una entrada, nav.js cierra lo abierto y enseña
// esa pestaña; si la entrada es una capa (se ha llegado con adelante, o era de algo ya cerrado) se salta con un atrás, porque nunca se reabre nada.
// Si ese atrás no llega en un segundo, se deja de esperar. Lo crea nav.js con GESTION_HISTORIAL_NAVEGADOR.crea({ historia: history, ventana: window }).
// temporizador: el reloj para ese plazo (los tests pasan uno de mentira). direccion() (tarea #338, ADR 211): la dirección de donde se está; cada entrada que
// se escribe la lleva, y `direccion()` la pone otra vez en la entrada de arriba cuando cambia lo seleccionado sin cambiar de sitio. Sin ella, la dirección no cambia.
'use strict';
const GESTION_HISTORIAL_NAVEGADOR = Object.freeze({
  crea({ historia, ventana, direccion = null, reglas = GESTION_HISTORIAL, temporizador = { poner: (f, ms) => setTimeout(f, ms), quitar: id => clearTimeout(id) } }) {
    const H = reglas, PLAZO = 1000;   // ms que se espera el popstate del atrás de dentro
    let plazo = null;
    let actual = null;      // lo que dice la entrada de arriba
    let quieto = false;     // mientras se enseña lo que dice una entrada, los cambios no se anotan
    let esperando = false;  // se ha pedido un atrás por dentro y aún no ha llegado su popstate
    let cola = [];          // lo que se ha querido anotar mientras se esperaba ese atrás, en orden
    let escrita = null;     // la última dirección escrita (para no reescribir la misma)
    function guarda(metodo, v) {
      actual = v;
      if (!direccion) { historia[metodo](H.entrada(v), ''); return; }   // sin dirección: la de la página no cambia
      escrita = direccion();
      historia[metodo](H.entrada(v), '', escrita);
    }
    function atras(estado) {
      actual = estado;
      esperando = true;
      plazo = temporizador.poner(() => { if (esperando) llegaAtras(null); }, PLAZO);
      historia.back();
    }
    // Lo hace ahora, o cuando llegue el atrás pedido; nada mientras se enseña una entrada
    function ejecuta(fn) {
      if (quieto) return;
      if (esperando) cola.push(fn);
      else fn();
    }
    // Al cargar la página: lo que guardaba esta entrada (al recargar o al volver de otra página), o null en una entrada nueva
    const inicial = () => H.leer(historia.state);
    // La entrada de arriba pasa a decir dónde se está, sin añadir otra
    function corrige(sitio) {
      const e = H.corrige(actual, sitio);
      if (e) guarda('replaceState', e);
    }
    const empieza = sitio => { actual = inicial(); corrige(sitio); };
    // Otro grupo, pestaña o juego por un toque
    const anota = sitio => ejecuta(() => {
      const d = H.decide(actual, sitio);
      if (d.accion !== 'nada') guarda(d.accion === 'empuja' ? 'pushState' : 'replaceState', d.estado);
    });
    // Se abre (con un toque) o se cierra algo en el Tablero
    const capa = abierta => ejecuta(() => {
      const e = abierta ? H.conCapa(actual) : null;
      if (e) guarda('pushState', e);
      else if (!abierta && actual && actual.capa) atras(H.sinCapa(actual));
    });
    // Lo seleccionado ha cambiado (una tarea, lo abierto en Recursos): la entrada de arriba pasa a llevar la dirección nueva, sin añadir otra
    const actualiza = () => ejecuta(() => {
      if (!direccion || !actual) return;
      const d = direccion();
      if (d !== escrita) guarda('replaceState', actual);
    });
    function sinAnotar(fn) {
      quieto = true;
      try { fn(); } finally { quieto = false; }
    }
    // Llega el atrás pedido por dentro: no se enseña nada (ya se ve lo de esa entrada) y se hace lo que esperaba
    function llegaAtras(destino) {
      esperando = false;
      escrita = null;   // el navegador ha puesto la dirección de la entrada a la que se ha vuelto
      temporizador.quitar(plazo);
      if (destino) actual = destino;
      const pendiente = cola;
      cola = [];
      pendiente.forEach(ejecuta);
    }
    // restaura(destino, desde): cierra lo abierto y enseña esa pestaña (desde: lo que decía la entrada de la que se viene); devuelve false si no ha hecho
    // nada (sin sesión). La entrada de arriba es `destino` igualmente
    function escucha(restaura) {
      ventana.addEventListener('popstate', ev => {
        const destino = H.leer(ev.state);
        if (esperando) { llegaAtras(destino); return; }
        if (!destino) return;
        const desde = actual;
        let hecho = false;
        sinAnotar(() => { hecho = restaura(destino, desde); });
        actual = destino;
        escrita = null;   // el navegador ha puesto la dirección de esa entrada
        if (!hecho) return;
        if (destino.capa) atras(H.sinCapa(destino));   // nada que reabrir: debajo está la misma pestaña
        else actualiza();   // lo cerrado al volver (la tarea del enlace) ya no va en la dirección
      });
    }
    return Object.freeze({ inicial, empieza, anota, capa, corrige, sinAnotar, escucha, direccion: actualiza });
  },
});
