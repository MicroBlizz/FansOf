// Fans of Basement · Tu mesa: la campaña (solo pantalla, estilo Swipe). Elegir en qué departamento empiezas la bajada (los que ya
// tienen el jefe de antes vencido; el Legacy, al arreglar el servidor), la ventana del ascenso tras el final, y la pestaña
// CATÁLOGO con los bichos tumbados (los que faltan, en sombra). Las reglas están en campana.js, inventario.js y progreso.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const TRUCO = { null: 'Para empezar', tickets: 'Los tickets se reabren', bugs: 'Los bugs se duplican', apagon: 'Apagones', urgente: 'Todo es urgente', todo: 'Un poco de todo, y sin fondo' };
  const NOMBRE = { bug: 'Bug de descarga', correo: 'Correo urgente', miniCorreo: 'RE: RE:', reunion: 'Reunión', dorado: 'Descarga dorada', spam: 'Spam', critico: 'Bug crítico' };
  const JEFE = { producto: ['ladirectora', 0.9], rrhh: ['survivalbot', 0.9], lanzamiento: ['servidorbot', 0.9], accionistas: ['presidente', 0.8], ceo: ['ceo', 0.8] };
  UI.nombreBicho = (AJ, id) => tr(AJ.jefes[id] ? AJ.jefes[id].nombre : NOMBRE[id]);

  // ---------- ¿dónde bajas? ----------
  function cerrado(AJ, z) {
    if (z.id === 'legacy') return tr('Arregla el servidor para abrirlo');
    const jefe = B.jefes.dePlanta(AJ, z.desde - 1);
    return tr('Vence a: {n}', { n: tr(AJ.jefes[jefe.id].nombre) });
  }

  function filaDep(g, AJ, p, z, d, b) {
    UI.panel(g, b.x, b.y, b.w, b.h, '#1a0f1f', null, null, 4);
    UI.fondo(g, z.img, b.x + 6, b.y + 6, 110, b.h - 12, d.abierto ? 0.1 : 0.6, z.filtro);
    UI.textoCabe(g, tr(z.nombre).toUpperCase(), b.x + 134, b.y + b.h * 0.32, 26, b.w - 150, d.abierto ? C.oro : '#8a7a68', 'left', 5);
    const plantas = z.sinFin ? tr('Desde la planta -{n}', { n: z.desde }) : tr('Plantas -{a} a -{b}', { a: z.desde, b: z.desde + 4 });
    T(g, plantas + ' · ' + tr(TRUCO[z.truco]), b.x + 134, b.y + b.h * 0.62, 16, C.crema, 'left', 3);
    if (!d.abierto) T(g, cerrado(AJ, z), b.x + 134, b.y + b.h * 0.84, 15, C.rojo, 'left', 3);
  }

  UI.departamentos = function (g, W, H, AJ, p) {
    UI.fondoMenu(g, W, H, 'fondo-vestibulo');
    g.fillStyle = 'rgba(10,5,20,0.75)'; g.fillRect(0, 0, W, H);
    UI.titulo(g, tr('¿DÓNDE BAJAS?'), W / 2, 60, 46);
    UI.franja(g, tr('El ascensor te deja en el departamento que elijas'), W / 2, 116, 17);
    const deps = B.departamentos(AJ, p), h = Math.min(130, Math.floor((H - 320) / deps.length) - 10), botones = [];
    deps.forEach((d, i) => {
      const z = AJ.zonas.find((q) => q.id === d.id), b = { x: 20, y: 156 + i * (h + 10), w: W - 40, h, accion: 'departamento', id: d.id };
      filaDep(g, AJ, p, z, d, b);
      if (d.abierto) botones.push(b);
    });
    const cerrar = { x: W / 2 - 120, y: H - 110, w: 240, h: 76, accion: 'cerrarDep' };
    UI.boton(g, cerrar, 'azul', tr('VOLVER'), 32);
    return [...botones, cerrar];
  };

  // ---------- el ascenso ----------
  UI.ascenso = function (g, W, H, AJ, p) {
    g.fillStyle = 'rgba(10,5,20,0.85)'; g.fillRect(0, 0, W, H);
    const x = 26, w = W - 52, y = H / 2 - 260, R = AJ.porRango;
    UI.pergamino(g, x, y, w, 520);
    UI.titulo(g, tr('ASCENSO'), W / 2, y + 60, 48);
    T(g, tr(AJ.rangos[p.rango]) + '  >  ' + tr(AJ.rangos[p.rango + 1] || AJ.rangos[p.rango]), W / 2, y + 120, 26, C.naranja, 'center', 4);
    const lineas = [tr('Has arreglado el servidor. Microblizz te asciende.'), tr('+{d} % de daño y +{v} % de botín para siempre', { d: R.dano * 100, v: R.valor * 100 }),
      tr('Los bichos y los jefes serán más duros'), tr('La campaña empieza otra vez: los jefes vuelven a dar su paquete'), tr('Te quedas con todo lo demás')];
    lineas.forEach((l, i) => UI.lineas(g, l, W / 2, y + 170 + i * 52, 19, w - 60, i ? C.cafe : '#2e6a2a', 'center', 0, 22));
    const si = { x: x + 26, y: y + 420, w: w / 2 - 36, h: 74, accion: 'confirmarAscenso' }, no = { x: W / 2 + 10, y: y + 420, w: w / 2 - 36, h: 74, accion: 'cerrarAscenso' };
    UI.boton(g, si, 'oro', tr('ASCENDER'), 28);
    UI.boton(g, no, 'azul', tr('AHORA NO'), 26);
    return [si, no];
  };

  // ---------- pestaña CATÁLOGO ----------
  function celda(g, AJ, p, x, b) {
    const n = p.catalogo[x.id] || 0, borde = x.clase === 'raro' ? C.azul : x.clase === 'jefe' ? C.rojo : '#6b4424';
    UI.panel(g, b.x, b.y, b.w, b.h, borde, null, null, 4);
    UI.panel(g, b.x + 6, b.y + 6, b.w - 12, b.h - 12, n ? C.perg : '#3a2e48', null, null, 3);
    const opc = n ? null : { filtro: 'brightness(0)', alfa: 0.55 }, cy = b.y + b.h * 0.42;
    if (JEFE[x.id]) V().pinta(g, JEFE[x.id][0], b.x + b.w / 2, cy, JEFE[x.id][1], opc); else V().pintaCosa(g, x.id, b.x + b.w / 2, cy, opc, 0.8);
    UI.textoCabe(g, n ? UI.nombreBicho(AJ, x.id) : '???', b.x + b.w / 2, b.y + b.h - 34, 15, b.w - 16, n ? C.cafe : '#8a7a68', 'center', 0);
    T(g, n ? 'x' + n : tr(x.clase === 'raro' ? 'RARO' : x.clase === 'jefe' ? 'JEFE' : ''), b.x + b.w / 2, b.y + b.h - 15, 14, n ? '#8a5a24' : '#8a7a68', 'center', 0);
  }

  UI.pestanaCatalogo = function (g, W, H, AJ, p) {
    const { y0, y1 } = UI.zonaMesa(H), lista = B.entradasCatalogo(AJ), vistos = lista.filter((x) => p.catalogo[x.id]).length;
    UI.franja(g, tr('Descubiertos {a} de {b}', { a: vistos, b: lista.length }) + ' · ' + tr('Complétalo: {n} paquetes del jefe', { n: AJ.catalogo.completo }), W / 2, y0 + 18, 17, W - 30);
    const cols = 4, filas = Math.ceil(lista.length / cols), w = (W - 24 - (cols - 1) * 8) / cols, h = Math.min(200, (y1 - y0 - 50) / filas - 8);
    lista.forEach((x, i) => celda(g, AJ, p, x, { x: 12 + (i % cols) * (w + 8), y: y0 + 46 + Math.floor(i / cols) * (h + 8), w, h }));
  };
})(BAS);
