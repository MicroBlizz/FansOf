// Fans of Toys · pantalla · MINIJUEGO: el marco de los tres minijuegos del mes (adaptadores/minijuego-*.js). Sale al pulsar «Producir»:
// primero se explica lo que hay que hacer (con un botón para saltarlo), luego se juega unos 10 segundos y al final se ve la nota y el
// bonus que da. «Producir» entonces pasa la jugada guardada en TY.jugada y la nota (TY.sesion.produce). Saltarlo produce sin bonus.
'use strict';
TY.minijuegos = {};   // cada minijuego se apunta aquí: monta(area, escenario, { juguete, marcador, termina }) y devuelve la función que lo para
TY.jugada = null;     // la jugada de la fábrica que espera al minijuego: { juguete, cantidad, precio, publicidad }
TY.minijuegoPara = null;

TY.pantallas.registra('minijuego', () => {
  const C = TY.crea, partida = TY.sesion.partida, jugada = TY.jugada, tipo = TY.juego.minijuego(partida), def = TY.MINIJUEGOS[tipo];
  const area = C('div', { className: 'ty-mj-area' }), marcador = C('b', { className: 'ty-mj-marcador' }), acciones = C('div', { className: 'ty-botones' });
  const boton = (texto, clase, id, alTocar) => C('button', { className: `ty-boton ${clase}`, id, textContent: tr(texto), onclick: () => { TY.sonido.suena('boton'); alTocar(); } });
  const sigue = bonus => {
    TY.minijuegoPara = null; TY.jugada = null;
    const r = TY.sesion.produce(jugada, bonus);
    if (r.ok) TY.sonido.suena('produce'); else TY.sonido.suena('pierde');
    TY.pantallas.sigue();
  };
  const premio = nota => {
    const e = TY.Minijuegos.efecto({ tipo, nota }, AJUSTES), n = Math.round((def.clave === 'unidades' ? e.unidades : e[def.clave] - 1) * 100);
    return tr(def.premio, { n });
  };
  const fin = nota => {
    TY.minijuegoPara = null; marcador.textContent = '';
    TY.sonido.suena(nota >= 0.8 ? 'meta' : 'suma');
    area.replaceChildren(C('div', { className: 'ty-mj-fin' }, C('b', { className: 'ty-mj-nota', textContent: `${Math.round(nota * 100)}%` }),
      C('p', { textContent: tr(nota >= 0.8 ? '¡Perfecto!' : nota >= 0.5 ? 'Bien hecho' : 'Se puede mejorar') }), C('p', { className: 'ty-mj-premio', textContent: premio(nota) })));
    acciones.replaceChildren(boton('Producir', 'ty-principal', 'ty-mj-producir', () => sigue({ tipo, nota })));
  };
  const juega = () => {
    acciones.replaceChildren(); area.replaceChildren();
    const semilla = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    const para = TY.minijuegos[tipo](area, TY.Minijuegos.escenario(tipo, semilla), { juguete: jugada.juguete, marcador,
      termina: datos => fin(TY.Minijuegos.nota(tipo, datos)) });
    TY.minijuegoPara = () => { para(); TY.minijuegoPara = null; };
  };
  area.append(C('div', { className: 'ty-mj-intro' }, TY.icono(jugada.juguete, 96), C('p', { textContent: tr(def.texto) }), C('p', { className: 'ty-mj-premio', textContent: premio(1) })));
  acciones.append(boton('Empezar', 'ty-principal', 'ty-mj-empezar', juega), boton('Saltar', 'ty-azul', 'ty-saltar', () => sigue(null)));
  return C('section', { className: 'ty-pantalla ty-minijuego' }, C('h2', { className: 'ty-titulo', textContent: tr(def.nombre) }),
    C('p', { className: 'ty-sub', textContent: tr('Minijuego del mes: si lo haces bien, ganas un bonus.') }), marcador, area, acciones);
});
