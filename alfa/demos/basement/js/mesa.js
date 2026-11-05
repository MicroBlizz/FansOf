// Fans of Basement · Tu mesa (solo pantalla): la cabecera con las monedas y el récord, las tres pestañas (FORMACIÓN, EQUIPO y
// PAQUETES) y el botón BAJAR. Aquí está la pestaña de formación: un tablero Kanban con tres columnas de pósits (los cursos), y
// al tocar uno, su ficha con lo que da y el botón de comprar. Las pestañas de equipo y paquetes están en mesa-equipo.js y el
// resultado de la bajada en resultado.js. Las reglas (qué se puede comprar) están en inventario.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const PESTANAS = [{ id: 'formacion', nombre: 'FORMACIÓN' }, { id: 'equipo', nombre: 'EQUIPO' }, { id: 'paquetes', nombre: 'PAQUETES' }];
  const COLOR_COL = { bienestar: '#ff8a2a', logistica: '#3b8de0', productividad: '#e5322d' };
  const POSIT = { hecho: '#8fe07a', disponible: '#ffe14a', bloqueado: '#efe3c6' };

  // Lo que hace un efecto, en una frase por cada cosa que da.
  const FRASE = {
    cafe: '+{n} de café máximo', caja: '+{n} de sitio en la caja', dano: '+{n} % de daño', cadencia: 'Dispara un {n} % más rápido',
    alcance: '+{n} de alcance', iman: '+{n} de imán para el botín', espera: 'El ascensor llega {n} s antes', gasto: 'Gastas un {n} % menos de café',
    crunch: 'La CRUNCH ZONE gasta un {n} % menos', valor: 'El botín vale un {n} % más', taza: 'Las tazas rellenan {n} más de café',
    multi: '+{n} grapa por disparo', vel: '+{n} % de velocidad', freno: 'Las reuniones te frenan un {n} % menos',
  };
  const PORCIENTO = { dano: 1, cadencia: 1, gasto: 1, crunch: 1, valor: 1, vel: 1, freno: 1 };
  UI.describe = (ef) => Object.keys(ef).map((k) => tr(FRASE[k], { n: PORCIENTO[k] ? Math.round(ef[k] * 100) : ef[k] }));

  // Parte un texto en líneas que quepan en `ancho` (como mucho `max` líneas, bajando la letra si hace falta).
  UI.lineas = function (g, t, x, y, tam, ancho, color, alin, max) {
    let n = tam, filas;
    do { g.font = '800 ' + n + 'px ' + "'Baloo 2', sans-serif"; filas = parte(g, t, ancho); n--; } while (filas.length > (max || 2) && n > 7);
    filas.forEach((f, i) => T(g, f, x, y + i * (n + 3), n + 1, color, alin, false, false));
    return filas.length * (n + 3);
  };
  function parte(g, t, ancho) {
    const filas = [];
    let linea = '';
    for (const p of t.split(' ')) {
      const prueba = linea ? linea + ' ' + p : p;
      if (g.measureText(prueba).width > ancho && linea) { filas.push(linea); linea = p; } else linea = prueba;
    }
    if (linea) filas.push(linea);
    return filas;
  }

  UI.zonaMesa = (H) => ({ y0: 164, y1: H - 100 });

  function cabecera(g, W, p) {
    T(g, tr('TU MESA'), W / 2, 34, 30, C.amarillo, 'center', true);
    UI.moneda(g, W / 2 - 50, 72, 14);
    T(g, String(p.monedas), W / 2 - 28, 74, 24, '#ffffff', 'left', true);
    T(g, p.record ? tr('Récord: planta') + ' -' + p.record : tr('El servidor se ha caído. Baja a arreglarlo.'), W / 2, 100, 12, '#ffffff');
  }

  function pestanas(g, W, m, botones) {
    const w = (W - 24 - 12) / 3;
    PESTANAS.forEach((q, i) => {
      const b = { x: 12 + i * (w + 6), y: 116, w, h: 36, accion: 'pestana', id: q.id }, activa = m.pestana === q.id;
      UI.caja(g, b.x, b.y, b.w, b.h, activa ? C.naranja : '#2f5fa8', 10);
      UI.textoCabe(g, tr(q.nombre), b.x + w / 2, b.y + 20, 15, w - 10, '#ffffff', 'center', true);
      botones.push(b);
    });
  }

  // ---------- pestaña FORMACIÓN: el tablero Kanban ----------
  function posit(g, AJ, p, c, b) {
    const estado = B.estadoCurso(AJ, p, c.id);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(b.x + 3, b.y + 3, b.w, b.h);
    g.fillStyle = POSIT[estado]; g.fillRect(b.x, b.y, b.w, b.h);
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(b.x, b.y, b.w, 5);
    const grande = b.h >= 44;
    UI.lineas(g, tr(c.nombre), b.x + 5, b.y + (grande ? 13 : b.h / 2), 11, b.w - 10, estado === 'bloqueado' ? '#9a8a6a' : C.tinta, 'left', grande ? 2 : 1);
    if (!grande) return;
    const y = b.y + b.h - 10;
    if (estado === 'hecho') { T(g, tr('HECHO'), b.x + b.w - 6, y, 11, '#2a6b3a', 'right', true, false); return; }
    if (estado === 'bloqueado') { candado(g, b.x + b.w - 14, y - 2); return; }
    UI.moneda(g, b.x + 12, y, 7);
    T(g, String(c.coste), b.x + 23, y + 1, 12, p.monedas >= c.coste ? C.tinta : C.rojo, 'left', true, false);
  }
  function candado(g, x, y) {
    g.fillStyle = '#9a8a6a'; g.fillRect(x - 6, y - 3, 12, 9);
    g.strokeStyle = '#9a8a6a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 3, 4, Math.PI, 0); g.stroke();
  }

  function formacion(g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), cw = (W - 24 - 12) / 3, top = y0 + 26;
    const ch = Math.max(26, Math.floor((y1 - top) / 7) - 5);
    AJ.columnas.forEach((col, i) => {
      const x = 12 + i * (cw + 6);
      UI.caja(g, x, y0, cw, 20, COLOR_COL[col], 6);
      UI.textoCabe(g, tr(AJ.nombreColumna[col]), x + cw / 2, y0 + 11, 11, cw - 8, '#ffffff', 'center', true, false);
      AJ.formacion.filter((c) => c.col === col).forEach((c, k) => {
        const b = { x: x + 2, y: top + k * (ch + 5), w: cw - 4, h: ch, accion: 'curso', id: c.id };
        posit(g, AJ, p, c, b);
        botones.push(b);
      });
    });
  }

  // La ficha de un curso: nombre, columna, lo que da y el botón de comprar.
  function fichaCurso(g, W, H, AJ, p, id) {
    const c = AJ.formacion.find((q) => q.id === id), estado = B.estadoCurso(AJ, p, id), x = 24, w = W - 48, y = H / 2 - 140;
    const botones = [];
    UI.caja(g, x, y, w, 260, C.crema, 16);
    T(g, tr(AJ.nombreColumna[c.col]), W / 2, y + 22, 12, COLOR_COL[c.col], 'center', true, false);
    UI.lineas(g, tr(c.nombre), W / 2, y + 48, 20, w - 30, C.tinta, 'center', 2);
    UI.describe(c.ef).forEach((f, i) => T(g, f, W / 2, y + 102 + i * 22, 15, '#2a6b3a', 'center', false, false));
    const comprar = { x: x + 20, y: y + 180, w: w / 2 - 30, h: 58, accion: 'comprarCurso', id };
    const cerrar = { x: W / 2 + 10, y: y + 180, w: w / 2 - 30, h: 58, accion: 'cerrar' };
    if (estado === 'disponible') {
      UI.caja(g, comprar.x, comprar.y, comprar.w, comprar.h, p.monedas >= c.coste ? C.verde : C.marron, 12);
      UI.moneda(g, comprar.x + 22, comprar.y + 29, 10);
      T(g, String(c.coste), comprar.x + comprar.w / 2 + 12, comprar.y + 31, 20, '#ffffff', 'center', true);
      botones.push(comprar);
    } else {
      T(g, estado === 'hecho' ? tr('YA LO TIENES') : tr('Antes, el curso de arriba'), comprar.x + comprar.w / 2, comprar.y + 29, 13, estado === 'hecho' ? '#2a6b3a' : C.rojo, 'center', true, false);
    }
    UI.caja(g, cerrar.x, cerrar.y, cerrar.w, cerrar.h, '#2f5fa8', 12);
    T(g, tr('CERRAR'), cerrar.x + cerrar.w / 2, cerrar.y + 31, 18, '#ffffff', 'center', true);
    botones.push(cerrar, { x: 0, y: 0, w: W, h: H, accion: 'cerrar' });
    return botones;
  }

  const CONTENIDO = { formacion, equipo: (...a) => UI.pestanaEquipo(...a), paquetes: (...a) => UI.pestanaPaquetes(...a) };

  // m = { pestana, sel (curso abierto), apertura (paquete que se está abriendo) }
  UI.mesa = function (g, W, H, t, AJ, p, m) {
    UI.fondo(g, W, H, t * 0.3);
    if (m.apertura) return UI.apertura(g, W, H, t, AJ, m.apertura);
    const botones = [];
    cabecera(g, W, p);
    pestanas(g, W, m, botones);
    CONTENIDO[m.pestana](g, W, H, AJ, p, botones);
    const bajar = { x: W / 2 - 110, y: H - 86, w: 220, h: 66, accion: 'bajar' };
    UI.caja(g, bajar.x, bajar.y, bajar.w, bajar.h, C.naranja, 16);
    T(g, tr('BAJAR'), W / 2, bajar.y + 36, 34, '#ffffff', 'center', true);
    botones.push(bajar);
    if (!m.sel) return botones;
    g.fillStyle = 'rgba(10,14,30,0.7)'; g.fillRect(0, 0, W, H);
    return fichaCurso(g, W, H, AJ, p, m.sel);
  };
})(BAS);
