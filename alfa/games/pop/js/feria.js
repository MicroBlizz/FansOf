// Fans of Pop · FERIA DEL FINDE (dominio; tarea #97, ADR 151): evento en solitario de viernes 00:00 a domingo 23:59 (hora local del móvil).
// Cada nivel ganado da tickets; los tickets alcanzan tramos con premio que se recogen a mano; lo que no se recoge se entrega solo después.
// Funciones puras: sin reloj, azar, SAVE, red ni dibujo; la hora (un Date) y el azar (una función en [0, 1)) llegan por parámetro.
// Los errores son resultados con nombre: tickets, no_existe, no_alcanzado, ya_cogido. Abrir un cofre lo hace la pantalla con abreCofre.
'use strict';
const PP_FERIA = Object.freeze((() => {
  const TICKETS = Object.freeze({ nivel: 1, tresEstrellas: 2, jefe: 3 });
  const tr = (tk, premio) => Object.freeze({ tk, premio: Object.freeze(premio) });
  const TRAMOS = Object.freeze([
    tr(3, { monedas: 30 }),
    tr(6, { ayudas: Object.freeze({ martillo: 1 }) }),
    tr(10, { monedas: 50 }),
    tr(14, { infinitas: 30 }),
    tr(19, { cofre: 'pequeno' }),
    tr(24, { ayudas: Object.freeze({ bomba: 1, toques3: 1 }) }),
    tr(30, { monedas: 80 }),
    tr(36, { infinitas: 60 }),
    tr(43, { ayudas: Object.freeze({ pista: 1, deshacer: 1 }) }),
    tr(50, { cofre: 'gordo' })
  ]);
  const COFRES = Object.freeze({
    pequeno: Object.freeze({ monedas: Object.freeze([40, 80]), ayudas: 1, infinitas: 0 }),
    gordo: Object.freeze({ monedas: Object.freeze([100, 200]), ayudas: 3, infinitas: 60 })
  });
  const AYUDAS_COFRE = Object.freeze(['martillo', 'bomba', 'toques3', 'pista', 'deshacer']);
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const DIA = 3;   // días de la feria abierta (viernes, sábado y domingo)
  const pad = n => String(n).padStart(2, '0');
  const idDe = f => `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;
  // Fecha local a medianoche, a `dias` del viernes de referencia (constructor con argumentos: aguanta los cambios de hora)
  const medianoche = (ahora, dias) => new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + dias);
  // ventana de la feria para una hora: abierta de viernes 00:00 a domingo 23:59:59.999 locales
  function ventana(ahora) {
    const desdeViernes = (ahora.getDay() + 2) % 7;   // viernes 0, sábado 1, domingo 2, lunes 3 … jueves 6
    const viernes = medianoche(ahora, -desdeViernes);
    const abierta = desdeViernes < DIA;
    const cierra = medianoche(ahora, DIA - desdeViernes) - ahora;
    const abre = medianoche(ahora, 7 - desdeViernes) - ahora;
    return Object.freeze({ abierta, id: idDe(viernes), cierraEn: abierta ? cierra : 0, abreEn: abierta ? 0 : abre });
  }
  function tickets(estrellas, jefe) {
    if (jefe) return TICKETS.jefe;
    return estrellas === 3 ? TICKETS.tresEstrellas : TICKETS.nivel;
  }
  const nueva = id => Object.freeze({ id, tickets: 0, cogidos: Object.freeze([]) });
  const tramo = tk => TRAMOS.filter(t => tk >= t.tk).length;
  function siguiente(tk) {
    const k = tramo(tk);
    return k >= TRAMOS.length ? null : Object.freeze({ k, faltan: TRAMOS[k].tk - tk });
  }
  function pendientes(estado) {
    const alcanzados = tramo(estado.tickets);
    const idx = [];
    for (let k = 0; k < alcanzados; k++) if (!estado.cogidos.includes(k)) idx.push(k);
    return Object.freeze(idx);
  }
  function suma(estado, n) {
    if (!Number.isInteger(n) || n <= 0) return error('tickets');
    const nuevo = Object.freeze({ ...estado, tickets: estado.tickets + n, cogidos: Object.freeze([...estado.cogidos]) });
    return ok({ estado: nuevo, subio: tramo(nuevo.tickets) - tramo(estado.tickets) });
  }
  function coge(estado, k) {
    if (!Number.isInteger(k) || k < 0 || k >= TRAMOS.length) return error('no_existe');
    if (k >= tramo(estado.tickets)) return error('no_alcanzado');
    if (estado.cogidos.includes(k)) return error('ya_cogido');
    const cogidos = Object.freeze([...estado.cogidos, k].sort((a, b) => a - b));
    return ok({ estado: Object.freeze({ ...estado, cogidos }), premio: TRAMOS[k].premio });
  }
  const validoEstado = e => !!e && typeof e === 'object' && typeof e.id === 'string' && Number.isInteger(e.tickets) && e.tickets >= 0 && Array.isArray(e.cogidos);
  // lo que se entrega solo de un finde ya pasado: los premios pendientes, con todos los alcanzados ya cogidos
  function liquida(estado) {
    const premios = pendientes(estado).map(k => TRAMOS[k].premio);
    const cogidos = Object.freeze(Array.from({ length: tramo(estado.tickets) }, (_, k) => k));
    return { premios, estado: Object.freeze({ ...estado, cogidos }) };
  }
  // qué hacer con lo guardado al abrir el juego: { estado, entregar } (entregar = premios que el juego da solo)
  function alDia(estado, v) {
    const fuera = Object.freeze({ estado: v.abierta ? nueva(v.id) : null, entregar: Object.freeze([]) });
    if (!validoEstado(estado)) return fuera;
    if (estado.id === v.id && v.abierta) return Object.freeze({ estado, entregar: Object.freeze([]) });
    const l = liquida(estado);
    if (estado.id === v.id) return Object.freeze({ estado: l.estado, entregar: Object.freeze(l.premios) });
    return Object.freeze({ estado: fuera.estado, entregar: Object.freeze(l.premios) });
  }
  // `extra`: ayudas que también pueden salir (la red, solo con los compañeros abiertos: tarea #329)
  function abreCofre(cual, azar, extra = []) {
    const lista = AYUDAS_COFRE.concat(extra);
    const c = Object.prototype.hasOwnProperty.call(COFRES, cual) ? COFRES[cual] : null;
    if (!c) return error('no_existe');
    const [min, max] = c.monedas;
    const premio = { monedas: min + Math.floor(azar() * (max - min + 1)), ayudas: {} };
    for (let i = 0; i < c.ayudas; i++) {
      const a = lista[Math.floor(azar() * lista.length)];
      premio.ayudas[a] = (premio.ayudas[a] || 0) + 1;
    }
    if (c.infinitas > 0) premio.infinitas = c.infinitas;
    Object.freeze(premio.ayudas);
    return ok({ premio: Object.freeze(premio) });
  }
  return Object.freeze({ TICKETS, TRAMOS, COFRES, AYUDAS_COFRE, ventana, tickets, nueva, tramo, siguiente, pendientes, suma, coge, alDia, abreCofre });
})());
