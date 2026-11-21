// Fans of Asalto · Los ajustes de las compras (ADR 200, tarea #317): las Coronas (la moneda comprada de core), los aspectos de héroe que se
// compran con ellas, lo que se vende con euros (Sin anuncios, Pack de inicio, bolsas de Coronas) y las Coronas que dan los logros grandes.
// Solo datos: las reglas están en dominio/coronas.js, dominio/aspectos-tienda.js y dominio/monedero.js. TODO esto va detrás de NUCLEO.desarrollo hasta que lo abran.
// Los ids de producto son los mismos de web/games/asalto/play-productos.json y de public.productos (el precio real lo pone siempre el servidor).
// Con cuenta, las Coronas son las «gemas» del monedero 'asalto' del servidor: lo que entrega una compra con euros (servidor/90) y lo que cobra comprar_fijo (servidor/112).
'use strict';
// precios en euros; coronas: lo que trae. El Pack de inicio se compra una sola vez.
ASALTO.compras = {
  sinAnuncios: { producto: 'asalto_sin_anuncios', precio: 6.99 },
  // el Pack de inicio: el servidor da `coronas` y apunta `derecho` en reclamos (productos.gemas y productos.derecho); el aspecto lo da el cliente al verlo
  inicio: { producto: 'asalto_inicio', precio: 2.99, coronas: 300, aspecto: 'bunny-gala', derecho: 'asalto-inicio' },
  bolsas: [
    { producto: 'asalto_coronas_100', coronas: 100, precio: 0.99 },
    { producto: 'asalto_coronas_550', coronas: 550, precio: 4.99 },
    { producto: 'asalto_coronas_1200', coronas: 1200, precio: 9.99 },
    { producto: 'asalto_coronas_2600', coronas: 2600, precio: 19.99 },
    { producto: 'asalto_coronas_7000', coronas: 7000, precio: 49.99 },
  ],
};
// Los aspectos: solo cambian cómo se ve el héroe (nunca una cifra del combate). heroe: el tipo al que visten; coronas: su precio fijo (null =
// no se vende con Coronas: lo da un pack); tinte: el recoloreado provisional del dibujo (giro de matiz en grados, saturación y luz) y adorno:
// lo que lleva puesto, dibujado por código (js/adaptadores/pieles.js), hasta que Yoshi dibuje los de verdad (tarea #315).
ASALTO.aspectos = {
  'ardilla-primavera': { heroe: 'heroe-ardilla', nombre: 'MadSquirrel de Primavera', coronas: 300, tinte: { giro: 75, sat: 1.15, luz: 1.05 }, adorno: 'lazo' },
  'bunny-glacial': { heroe: 'heroe-bunny', nombre: 'CrazyBunny Glacial', coronas: 400, tinte: { giro: 175, sat: 1.1, luz: 1.08 }, adorno: 'gorro' },
  'zorro-noche': { heroe: 'heroe-zorro', nombre: 'SlyFox de Medianoche', coronas: 600, tinte: { giro: 235, sat: 0.9, luz: 0.8 }, adorno: 'antifaz' },
  'vaca-cromada': { heroe: 'heroe-mechavaca', nombre: 'MechaVaca Cromada', coronas: 800, tinte: { giro: 0, sat: 0.25, luz: 1.3 }, adorno: 'casco' },
  'bunny-gala': { heroe: 'heroe-bunny', nombre: 'CrazyBunny de Gala', coronas: null, tinte: { giro: 0, sat: 1.05, luz: 1.12 }, adorno: 'corona' },
};
// La tienda fija del servidor (core: docs/core/TIENDA-GEMAS.md): los aspectos que se venden con Coronas, a precio fijo, salen de ASALTO.aspectos (un solo
// sitio para el precio). El de Gala (coronas: null) no está: solo lo da el Pack de inicio. herramientas de datos y el servidor leen esto: comprar_fijo cobra
// su `precio` (tablas_juego.datos.tienda) y apunta 'fijo:<artículo>' en reclamos. Asalto es ligero y no carga las pestañas de core: la pantalla es la suya.
AJUSTES.tiendaFija = {
  articulos: Object.fromEntries(Object.entries(ASALTO.aspectos).filter(([, a]) => a.coronas > 0)
    .map(([id, a]) => ['aspecto:' + id, { sec: 'cosmeticos', grupo: 'Aspectos de héroe', tipo: 'aspecto', id, precio: a.coronas }])),
};
// Las dos monedas de la serie (core/js/sistema/monedas.js, ADR 004): Plumas = la ganada (solo jugando, nunca se vende) y Coronas = la comprada
// (euros, solo aspectos). Se declaran solo en modo desarrollo (preguntado cada vez), para que fuera de él core no vea nada nuevo.
const ICONO_CORONA = '<svg class="as-corona-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 18 2 7l6 5 4-8 4 8 6-5-1 11Z" fill="#f6c63a" stroke="#2a1a14" stroke-width="2.4" stroke-linejoin="round"/><path d="M3.5 21h17" stroke="#2a1a14" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="14" r="1.8" fill="#e8392c" stroke="#2a1a14" stroke-width="1"/></svg>';
Object.defineProperty(AJUSTES, 'monedas', {
  enumerable: true,
  get: () => (NUCLEO.desarrollo ? {
    ganada: { id: 'plumas', nombre: 'Plumas', nombre_en: 'Feathers', icono: () => '' }, comprada: { id: 'coronas', nombre: 'Coronas', nombre_en: 'Crowns', icono: () => ICONO_CORONA },
    cambio: 0,   // sin puente de plumas a Coronas: las plumas no se cambian (ADR 200)
    leer: cual => (AS.casos ? AS.casos.saldo(cual) : 0), escribir: (cual, n) => { if (AS.casos) AS.casos.ponSaldo(cual, n); },
  } : undefined),
});
