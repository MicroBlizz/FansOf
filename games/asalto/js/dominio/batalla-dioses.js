// Fans of Asalto · DOMINIO · Lo que hacen en la BATALLA los 16 DIOSES (tarea #156; cifras en ajustes-dioses.js, bloque `efecto` de cada
// uno). Un dios es una unidad de los héroes con `dios` = su id (lo pone poder.js); sus poderes valen mientras siga en pie, salvo lo que
// se hace al empezar. batalla.js y batalla-golpes.js lo llaman en sus momentos, junto a los de los legendarios: al empezar (empieza), en
// cada paso (avanza), al andar y atacar los enemigos (freno), al contar un golpe (mult), después de darlo (trasGolpe), al ir a morir
// (aguanta), al morir (alMorir) y al acabar el combate (acaba). La visibilidad y el objetivo forzado reutilizan `invisible` y `muralla`
// de los legendarios (batalla-legendarios.js). Si no hay ningún dios en el campo (B.hayDios falso) nada de esto hace nada ni gasta azar.
// «paga» cambia el ataque del dios a 'moneda' (un proyectil más). Lo que deja en la batalla: B.oroDios (el oro de más de «paga»: la batalla lo suma a su oro en el resultado) y en cada dios, `div`
// (sus relojes y lo que ya ha gastado).
// Eventos que apunta en B.eventos (la pantalla los pinta):
//   { e: 'divino', cual, id, x, y, radio, a? }  cual = id del dios (jefe, nomina, lunes…); id, x, y = el dios; radio = el alcance del
//                                         efecto (0 si es a toda la arena o a uno solo). `a`, la lista de ids tocados cuando importa.
//                                         nomina lleva `todo: true` en la cura entera; dragon, `renace: true` al renacer, y su meteorito
//                                         va con x, y = donde cae; ceo, `aguanta: true` cuando se queda con 1 de vida; actualizando,
//                                         `fin: true` al curar al acabar. Al empezar, uno por dios con `inicio: true`
'use strict';
AS.dioses = (() => {
  const BT = () => AS.batalla, G = () => AS.golpes;
  const EF = (B, id) => B.datos.dioses.lista[id].efecto;
  const ev = (B, e) => { B.eventos.push(e); };
  const divino = (B, u, cual, mas) => ev(B, { e: 'divino', cual, id: u.id, x: u.x, y: u.y, radio: 0, ...mas });
  const heroes = B => BT().vivos(B, 'heroe').filter(u => !u.extra);
  const enemigos = B => BT().vivos(B, 'enemigo');
  const dioses = B => BT().vivos(B, 'heroe').filter(u => u.dios);
  const vivo = (B, id) => dioses(B).find(u => u.dios === id) || null;
  const aturde = (u, t) => AS.leyendas.aturde(u, t);
  const media = (lista, k) => lista.reduce((s, u) => s + u[k], 0) / lista.length;
  const quedan = B => enemigos(B).length + B.cola.length;

  /* ---------- al empezar (cada dios apunta además { e: 'divino', cual, inicio: true }: la pantalla enseña su nombre) ---------- */
  function jefe(B) {
    const C = EF(B, 'jefe');
    for (const a of heroes(B)) { a.dano *= 1 + C.mas; a.max = Math.round(a.max * (1 + C.mas)); a.vida = a.max; }
  }
  const lunes = B => { for (const r of enemigos(B)) aturde(r, EF(B, 'lunes').duerme); };
  // apagón: los enemigos andan, pero no pueden atacar hasta que pase (su espera entre ataques empieza larga)
  const apagon = B => { for (const r of enemigos(B)) r.cd = Math.max(r.cd, EF(B, 'apagon').dura); };
  // cada héroe, +10 % de daño por cada aliado de otra clase principal (la primera de sus dos clases)
  function organigrama(B) {
    const lista = heroes(B), mas = EF(B, 'organigrama').mas;
    for (const a of lista) a.dano *= 1 + mas * lista.filter(o => o !== a && o.clases[0] !== a.clases[0]).length;
  }
  const cafe = B => { for (const a of heroes(B)) a.cada /= 1 + EF(B, 'cafe').prisa; };
  const direccion = B => { for (const a of heroes(B)) AS.poder.doblaRama(a, EF(B, 'direccion').veces); };
  const INICIO = {
    jefe, lunes, apagon, organigrama, cafe, direccion,
    ceo: (B, u) => { u.muralla = 1e9; },
    teletrabajo: (B, u) => { u.invisible = 1e9; },
    // dispara monedas: si su animal cura, en esta batalla dispara en vez de curar (sus monedas son proyectiles: 'moneda')
    paga: (B, u) => { u.ataque = 'moneda'; },
  };
  // va antes que AS.leyendas.empieza: lo que dan los legendarios al empezar (escudos…) ya cuenta con la vida de más de los dioses
  function empieza(B) {
    const lista = dioses(B);
    B.hayDios = lista.length > 0;
    B.oroDios = 0;
    if (!B.hayDios) return;
    for (const u of lista) u.div = { t: {}, curo: false, renacio: false, ultimo: false };
    for (const u of lista) { if (INICIO[u.dios]) INICIO[u.dios](B, u); divino(B, u, u.dios, { inicio: true }); }
  }

  /* ---------- cada pocos segundos ---------- */
  // rayo divino: a todos los enemigos
  function rayo(B, u) {
    const lista = enemigos(B);
    divino(B, u, 'jefe', { a: lista.map(r => r.id) });
    for (const r of lista) G().dana(B, u, r, u.dano * EF(B, 'jefe').mult, 'magia', true);
  }
  // lluvia de luz: cura a los tuyos y quema a los enemigos
  function lluvia(B, u) {
    const C = EF(B, 'nomina');
    divino(B, u, 'nomina');
    for (const a of heroes(B)) if (a.vida < a.max) G().cura(B, a, a.max * C.cura, u);
    for (const r of enemigos(B)) G().dana(B, u, r, u.dano * C.mult, 'magia', true);
  }
  // meteorito enorme en medio de los enemigos
  function meteorito(B, u) {
    const lista = enemigos(B), C = EF(B, 'dragon');
    const x = media(lista, 'x'), y = media(lista, 'y');
    ev(B, { e: 'divino', cual: 'dragon', id: u.id, x, y, radio: C.radio });
    for (const r of G().enArea(B, u, x, y, C.radio)) G().dana(B, u, r, u.dano * C.mult, 'magia', true);
  }
  // el Reorganizador baraja los sitios de los enemigos y los deja confusos
  function baraja(B, u) {
    const lista = enemigos(B), sitios = B.azar.baraja(lista.map(r => ({ x: r.x, y: r.y })));
    lista.forEach((r, i) => { r.x = sitios[i].x; r.y = sitios[i].y; aturde(r, EF(B, 'reorganizador').confunde); });
    divino(B, u, 'reorganizador', { a: lista.map(r => r.id) });
  }
  function reunion(B, u) {
    const lista = enemigos(B);
    for (const r of lista) aturde(r, EF(B, 'reunion').quietos);
    divino(B, u, 'reunion', { a: lista.map(r => r.id) });
  }
  const PERIODO = { jefe: rayo, nomina: lluvia, dragon: meteorito, reorganizador: baraja, reunion };
  function periodico(B, u, dt) {
    const hace = PERIODO[u.dios];
    if (!hace) return;
    u.div.t[u.dios] = (u.div.t[u.dios] || 0) + dt;
    if (u.div.t[u.dios] < EF(B, u.dios).cada) return;
    u.div.t[u.dios] = 0;
    if (enemigos(B).length) hace(B, u);
  }

  /* ---------- lo que vigila en cada paso ---------- */
  // Nómina: la primera vez que un aliado baja del umbral, cura entero al equipo
  function nomina(B, u) {
    if (u.div.curo || !heroes(B).some(a => a.vida < a.max * EF(B, 'nomina').umbral)) return;
    u.div.curo = true;
    for (const a of heroes(B)) if (a.vida < a.max) G().cura(B, a, a.max - a.vida, u);
    divino(B, u, 'nomina', { todo: true });
  }
  // Lunes: los enemigos normales por debajo del umbral, mueren
  function lunesRemata(B, u) {
    const lista = enemigos(B).filter(r => !r.jefe && !r.elite && r.vida < r.max * EF(B, 'lunes').umbral);
    for (const r of lista) { G().quita(B, r, r.vida, u); G().muere(B, r, u); }
    if (lista.length) divino(B, u, 'lunes', { a: lista.map(r => r.id) });
  }
  // Correo de las 23:59: cuando queda un solo enemigo (y nadie más por llegar), un último golpe a todos los que queden (una vez)
  function correo(B, u) {
    const C = EF(B, 'correo'), lista = enemigos(B);
    if (u.div.ultimo || !lista.length || quedan(B) > C.quedan) return;
    u.div.ultimo = true;
    divino(B, u, 'correo', { a: lista.map(r => r.id) });
    for (const r of lista) G().dana(B, u, r, u.dano * C.mult, 'magia', true);
  }
  const VIGILA = { nomina, lunes: lunesRemata, correo };
  function avanza(B, dt) {
    if (!B.hayDios) return;
    for (const u of dioses(B)) {
      periodico(B, u, dt);
      if (VIGILA[u.dios] && !u.muerta) VIGILA[u.dios](B, u);
    }
  }

  /* ---------- al andar, al pegar y al morir ---------- */
  // Actualizando: los enemigos andan y atacan más despacio (multiplica su paso y lo que les baja la espera)
  const freno = (B, u) => (B.hayDios && u.lado === 'enemigo' && vivo(B, 'actualizando') ? 1 - EF(B, 'actualizando').lento : 1);
  // Viernes: con pocos enemigos, los héroes hacen más daño
  function mult(B, de) {
    if (!B.hayDios || !de || de.lado !== 'heroe' || !vivo(B, 'viernes')) return 1;
    const C = EF(B, 'viernes');
    return quedan(B) <= C.quedan ? C.mult : 1;
  }
  // Paga: sus monedas explotan; Teletrabajo: el golpe salta a otros enemigos (los más cercanos al tocado)
  function paga(B, u, a, dano, tipo) {
    const C = EF(B, 'paga');
    for (const r of G().enArea(B, u, a.x, a.y, C.radio)) if (r !== a) G().dana(B, u, r, dano * C.parte, tipo, true);
    ev(B, { e: 'divino', cual: 'paga', id: u.id, x: a.x, y: a.y, radio: C.radio });
  }
  function teletrabajo(B, u, a, dano, tipo) {
    const C = EF(B, 'teletrabajo'), otros = BT().rivales(B, u).filter(r => r !== a).sort((p, q) => BT().dist(a, p) - BT().dist(a, q)).slice(0, C.saltos);
    if (!otros.length) return;
    divino(B, u, 'teletrabajo', { x: a.x, y: a.y, a: otros.map(r => r.id) });
    for (const r of otros) G().dana(B, u, r, dano * C.parte, tipo, true);
  }
  const GOLPE = { paga, teletrabajo };
  function trasGolpe(B, de, a, dano, tipo) {
    if (!B.hayDios || !de || !de.dios || a.lado === de.lado || !GOLPE[de.dios]) return;
    GOLPE[de.dios](B, de, a, dano, tipo);
  }
  // CEO: no muere los primeros segundos (se queda con 1); Dragón: renace una vez con toda su vida. Devuelve true si no muere
  function aguanta(B, u) {
    if (!B.hayDios || !u.dios) return false;
    if (u.dios === 'ceo' && B.t < EF(B, 'ceo').aguanta) { u.vida = 1; divino(B, u, 'ceo', { aguanta: true }); return true; }
    if (u.dios !== 'dragon' || u.div.renacio) return false;
    u.div.renacio = true; u.vida = u.max; u.tVeneno = 0; u.anim = 'reposo'; u.tAnim = 0;
    divino(B, u, 'dragon', { renace: true });
    return true;
  }
  // Paga: cada enemigo que cae da oro de más
  function alMorir(B, u) {
    if (!B.hayDios || u.lado !== 'enemigo') return;
    const d = vivo(B, 'paga');
    if (d) B.oroDios += EF(B, 'paga').oro;
  }
  // Actualizando: al acabar el combate, cura a todo el equipo
  function acaba(B) {
    const d = B.hayDios && vivo(B, 'actualizando');
    if (!d) return;
    for (const a of heroes(B)) if (a.vida < a.max) G().cura(B, a, a.max - a.vida, d);
    divino(B, d, 'actualizando', { fin: true });
  }
  return { empieza, avanza, freno, mult, trasGolpe, aguanta, alMorir, acaba };
})();
