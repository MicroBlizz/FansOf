// Fans of Asalto · DOMINIO · Los legendarios, el Despertar y los seres secretos (tarea #109; datos en ajustes-legendarios.js).
// Un héroe ascendido que llega al nivel de legendario se hace legendario (campo `legendario: true`) si cabe en el tope del equipo:
// lo comprueba quien llama con puedeSer y luego lo marca con hazLegendario. Un legendario gana su habilidad (la de su tipo y rama) y,
// en cada Despertar (por nivel, y solo los abiertos con plumas fuera de la partida), elige una carta de Despertar entre 3.
// Dos legendarios de distinto tipo que se unen forman un ser secreto (siempre legendario), que ya no se puede volver a unir así.
// Tarea #156: si la pareja (por tipo y rama, en cualquier orden) es la de un dios (ajustes-dioses.js), nace ese dios en vez del ser:
// un héroe con `dios: '<id>'` y `ser: null`, legendario, que tampoco se puede volver a unir.
'use strict';
AS.legendario = (() => {
  const L = datos => datos.legendarios;
  // es legendario de verdad: marcado como tal, un ser o un dios
  const es = (datos, h) => !!h.ser || !!h.dios || h.legendario === true;
  // cumple lo que pide el nivel: ascendido y con el nivel de legendario
  const alcanza = (datos, h) => !!h.rama && h.nivel >= L(datos).nivel;
  const clave = h => (h.rama ? h.tipo + '-' + h.rama : null);
  const ramaDe = claveLegendario => claveLegendario.slice(claveLegendario.lastIndexOf('-') + 1);

  // lo que es: { nombre, habilidad, txt } del legendario, { nombre, habilidades, cumbres } del ser (las de sus dos padres) o
  // { nombre, txt, dios } del dios (su poder divino, sin los de sus padres); si no, null
  function datosDe(datos, h) {
    const D = L(datos);
    if (h.dios) { const g = datos.dioses.lista[h.dios]; return { nombre: g.nombre, txt: g.txt, dios: h.dios, habilidades: [], cumbres: [] }; }
    if (h.ser) return { nombre: D.seres[h.ser.clave].nombre, habilidades: h.ser.padres.map(p => D.lista[p].habilidad), cumbres: h.ser.padres.map(ramaDe) };
    const k = clave(h);
    return k && D.lista[k] ? D.lista[k] : null;
  }
  // cuántos legendarios caben a la vez en el equipo: uno en la partida normal, dos en la larga (sin fin o dificultad 1 o más)
  const tope = (datos, larga) => (larga ? L(datos).tope.larga : L(datos).tope.normal);
  // si este héroe puede ser legendario ya: cumple el nivel y cabe en el tope (contando a los demás legendarios del equipo, no a él)
  function puedeSer(datos, heroes, h, larga) {
    if (es(datos, h)) return true;
    if (!alcanza(datos, h)) return false;
    return heroes.filter(x => x.id !== h.id && es(datos, x)).length < tope(datos, larga);
  }
  // marca al héroe como legendario (el tope no se mira aquí: lo mira quien llama con puedeSer)
  function hazLegendario(datos, h) {
    if (!h.rama) return AS.error('sin-rama');
    if (h.nivel < L(datos).nivel) return AS.error('nivel-bajo', { hace_falta: L(datos).nivel });
    if (es(datos, h)) return AS.error('ya-legendario');
    return AS.ok(AS.heroe.con(h, { legendario: true }));
  }
  // cuántos Despertares le tocan por su nivel, como mucho los `abiertos` con plumas (0 a 3); 0 si no es legendario
  function despertaresAbiertos(datos, h, abiertos) {
    if (!es(datos, h)) return 0;
    const porNivel = L(datos).despertar.filter(n => h.nivel >= n).length;
    return Math.max(0, Math.min(porNivel, abiertos || 0));
  }
  // los Despertares que le quedan por elegir carta
  const pendientes = (datos, h, abiertos) => Math.max(0, despertaresAbiertos(datos, h, abiertos) - h.cartas.length);
  // 3 cartas distintas al azar entre las que aún no tiene (menos si no quedan). azar: función que da números de 0 a 1 (dominio/azar.js)
  function oferta(datos, h, azar) {
    const libres = Object.keys(L(datos).cartas).filter(c => !h.cartas.includes(c));
    for (let i = libres.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [libres[i], libres[j]] = [libres[j], libres[i]]; }
    return Object.freeze(libres.slice(0, 3));
  }
  // la clave de un ser: los dos tipos ordenados y unidos por '+'
  const claveSer = (tipoA, tipoB) => [tipoA, tipoB].sort().join('+');
  // el dios de la pareja de legendarios con estas dos claves '<tipo>-<rama>', en cualquier orden (o null)
  function diosDe(datos, claveA, claveB) {
    const lista = (datos.dioses && datos.dioses.lista) || {};
    return Object.keys(lista).find(id => { const p = lista[id].padres; return (p[0] === claveA && p[1] === claveB) || (p[0] === claveB && p[1] === claveA); }) || null;
  }
  // si ya salió de una unión: 'ya-es-dios', 'ya-es-ser' o null
  const unido = h => (h.dios ? 'ya-es-dios' : h.ser ? 'ya-es-ser' : null);
  // por qué dos héroes no forman un ser (o null si sí)
  function motivo(datos, a, b) {
    if (!es(datos, a) || !es(datos, b)) return 'no-legendario';
    const ya = unido(a) || unido(b);
    if (ya) return ya;
    if (a.tipo === b.tipo) return 'mismo-tipo';
    if (!clave(a) || !clave(b) || !L(datos).seres[claveSer(a.tipo, b.tipo)]) return 'sin-ser';
    return null;
  }
  // a (el que queda) y b forman un ser (o el dios de su pareja): lo de a, la rareza más alta, los niveles sumados, las marcas como al
  // absorber y las cartas de los dos
  function une(datos, a, b) {
    const m = a.id === b.id ? 'mismo-tipo' : motivo(datos, a, b);
    if (m) return AS.error('no-es-pareja', { motivo: m });
    const base = AS.heroe.absorbe(datos, a, b).valor, dios = diosDe(datos, clave(a), clave(b));
    if (dios) return AS.ok(AS.heroe.con(base, { nivel: a.nivel + b.nivel, legendario: true, ser: null, dios }));
    const ser = { clave: claveSer(a.tipo, b.tipo), padres: [clave(a), clave(b)] };
    return AS.ok(AS.heroe.con(base, { nivel: a.nivel + b.nivel, legendario: true, ser }));
  }
  return { es, alcanza, clave, datosDe, tope, puedeSer, hazLegendario, despertaresAbiertos, pendientes, oferta, claveSer, diosDe, une };
})();
