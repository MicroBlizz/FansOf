// Fans of Pinball · adaptador · EFECTOS («jugo», PROTOTIPO.md): convierte los eventos del dominio en lo que se siente: parón de golpe (★1,
// con bucle.paron), cifras que saltan (★2), sonido que sube con el combo (★3), fichas que vuelan al contador (★4), temblor (★5),
// vibración (★6), destello blanco del golpeado y piezas que saltan (7), bola aplastada (8), CAOS con letrero gordo (9), letreros de combo
// (10) y cámara lenta en «¡por los pelos!» y en el último golpe al jefe (12). Y lo de la mesa con decorado grande: máquinas de café
// encendidas, patada de los rebotadores, papeles de la fotocopiadora, el aviso de la tienda sin fichas y las posturas cómicas del héroe
// (golpes y rebotes que las disparan). Una tabla tipo de evento → qué hace (sin switch).
'use strict';
PB.creaEfectos = ({ jugo, bucle, camara, pintor, particulas, cifras, sonido, sp, hud, posCss, posturas, golpeFuerte }) => {
  const J = jugo, img = sp.img;
  let combo = 0;
  const cifra = (e, texto, clase) => { const p = posCss(e.x, e.y); cifras.salta(texto, p.x, p.y, combo, clase); };
  function fichas(e, n) {
    const p = posCss(e.x, e.y);
    for (let i = 0; i < Math.min(3, n); i++) setTimeout(() => cifras.vuela(p.x + i * 6, p.y, hud.fichas, () => sonido.toca('ficha')), i * 60);
  }
  const piezas = { vasija: () => img.macetaRota, cofre: () => img.cofreAbierto, caja: () => img.cajabotin, cubito: () => img.cubito, cafe: () => img.cafe };
  const TABLA = {
    golpe(e) {
      pintor.destella(e.x, e.y); pintor.aplasta(e.x, e.y); posturas.rebote(e.x, e.y, e.fuerte);
      cifra(e, String(e.dano), e.critico ? 'pb-critico' : '');
      if (!e.fuerte) return sonido.toca('golpe', combo);
      bucle.paron(J.paron.fuerte); camara.tiembla(J.temblor.fuerte); sonido.toca('fuerte'); sonido.vibra(J.vibra.fuerte);
    },
    rompe(e) {
      bucle.paron(J.paron.rompe); camara.tiembla(J.temblor.rompe); sonido.toca('rompe', combo);
      particulas.estalla((piezas[e.clase] || piezas.vasija)(), e.x, e.y, J.particulas.piezas);
      if (e.puntos) cifra({ x: e.x, y: e.y - 8 }, '+' + PB.miles(e.puntos), 'pb-puntos');
      if (e.fichas) fichas(e, e.fichas);
    },
    cofre(e) { sonido.toca('cofre'); cifra({ x: e.x + 10, y: e.y }, '+' + e.segundos + ' s', 'pb-tiempo'); fichas(e, 3); },
    enemigo_vencido(e) {
      bucle.paron(J.paron.vence); sonido.toca('vence', combo); sonido.vibra(J.vibra.vence); camara.tiembla(J.temblor.rompe);
      particulas.estalla(img.becario, e.x, e.y, J.particulas.piezas, 110, 6);
      cifra({ x: e.x, y: e.y - 10 }, '+' + PB.miles(e.puntos), 'pb-puntos');
      cifra({ x: e.x + 12, y: e.y + 4 }, '+' + e.segundos + ' s', 'pb-tiempo');
      fichas(e, e.fichas);
    },
    pala(e) { sonido.toca('pala'); sonido.vibra(J.vibra.pala); pintor.aplasta(e.x, e.y); posturas.pala(e.x, e.y, e.fuerza >= golpeFuerte); },
    seta(e) { pintor.destella(e.x, e.y); pintor.aplasta(e.x, e.y); posturas.rebote(e.x, e.y, false); sonido.toca('seta', combo); particulas.estalla(img.dianaEncendida, e.x, e.y, 3, 60, 3, 0); },
    maquina(e) {
      pintor.aplasta(e.x, e.y); posturas.rebote(e.x, e.y, false); sonido.toca('seta', combo); camara.tiembla(J.temblor.rompe);
      particulas.estalla(img.maquinaEncendida, e.x, e.y - 6, 3, 70, 3, 0);
    },
    rebotador(e) { pintor.aplasta(e.x, e.y); posturas.rebote(e.x, e.y, false); sonido.toca('golpe', combo); sonido.vibra(J.vibra.pala); },
    fotocopia(e) {
      pintor.fotocopia(); sonido.toca('cofre'); particulas.estalla(img.papel, e.x + 6, e.y, J.particulas.papeles, 130, 6, 0.35);
      cifra({ x: e.x, y: e.y - 14 }, '+' + PB.miles(e.puntos), 'pb-puntos');
      if (e.fichas) fichas(e, e.fichas);
    },
    tienda_entra() { sonido.toca('mejora'); },
    tienda_sin_fichas(e) { sonido.toca('aviso'); cifra({ x: e.x + 30, y: e.y + 16 }, tr('¡Faltan {n} fichas!').replace('{n}', e.faltan), 'pb-menos'); },
    bola_perdida(e) { sonido.toca('pierde'); sonido.vibra(J.vibra.pierde); if (e.segundos) cifra({ x: 90, y: e.y - 30 }, '−' + e.segundos + ' s', 'pb-menos'); },
    caos_empieza() { cifras.letrero(tr('¡CAOS!'), 'pb-naranja', 1.4); sonido.toca('caos'); sonido.vibra(J.vibra.caos); camara.tiembla(J.temblor.explosion); },
    escalera_abierta() { cifras.letrero(tr('¡ASCENSOR ABIERTO!'), 'pb-verde', 1.2); sonido.toca('abierta'); },
    escalera_entra(e) { sonido.toca('escalera'); if (e.expres) cifras.letrero(tr('¡EXPRÉS!') + ' +5 s', 'pb-azul', 1); },
    por_los_pelos(e) { bucle.camaraLenta(e.camaraLenta, e.factor); cifras.letrero(tr('¡POR LOS PELOS!'), 'pb-rojo', 1.2); sonido.toca('pelos'); },
    jefe_aviso() { sonido.toca('aviso'); },
    pala_congelada() { sonido.toca('hielo'); },
    jefe_golpe(e) { pintor.destella(e.x, e.y); cifra(e, String(Math.round(e.dano)), 'pb-critico'); sonido.toca('fuerte'); camara.tiembla(J.temblor.rompe); },
    jefe_vencido(e) {
      bucle.camaraLenta(e.camaraLenta, e.factor); bucle.paron(J.paron.jefe); camara.tiembla(J.temblor.explosion);
      pintor.explota(e.x, e.y, 30); particulas.anillo(img.dianaEncendida, e.x, e.y, 16, 160); particulas.estalla(img.moneda, e.x, e.y, 14, 160, 6);
      sonido.toca('jefe'); cifras.letrero(tr('¡SURVIVALBOT VENCIDO!'), 'pb-naranja', 2); fichas(e, 3);
    },
    mejora() { sonido.toca('mejora'); },
    explosion(e) { pintor.explota(e.x, e.y, e.radio); particulas.anillo(img.dianaEncendida, e.x, e.y, J.particulas.chispas); camara.tiembla(J.temblor.explosion); sonido.toca('explosion'); },
    salvabolas(e) { cifra({ x: e.x, y: e.y - 20 }, tr('¡SALVADA!'), 'pb-tiempo'); },
    fichaje(e) { cifra(e, '−' + e.segundos + ' s', 'pb-menos'); },
    jefe_nucleo() { cifras.letrero(tr('¡NÚCLEO ABIERTO!'), 'pb-amarillo', 1); },
    rampa() { sonido.toca('abierta'); },
  };
  // los letreros de combo al pasar de ×10, ×20 y ×30 golpes seguidos
  function letreroCombo(nuevo) {
    for (const n of J.combo.letreros) if (combo < n && nuevo >= n) cifras.letrero(tr('¡×{n}!').replace('{n}', n), 'pb-amarillo', 0.8);
    combo = nuevo;
  }
  return {
    procesa(eventos, foto) {
      letreroCombo(foto.combo);
      for (const e of eventos) if (TABLA[e.tipo]) TABLA[e.tipo](e);
    },
    reinicia() { combo = 0; },
  };
};
