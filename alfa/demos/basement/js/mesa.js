// Fans of Basement · Tu mesa (solo pantalla), al estilo de Fans of Swipe: la cabecera de madera con las monedas y el récord, las
// tres pestañas (FORMACIÓN, EQUIPO y PAQUETES) y el botón BAJAR. Aquí está la pestaña de formación: un tablero Kanban con tres
// columnas de pósits (los cursos) y, al tocar uno, su ficha de pergamino con lo que da y el botón de comprar. Las pestañas de
// equipo y paquetes están en mesa-equipo.js y el resultado de la bajada en resultado.js. Las reglas, en inventario.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const PESTANAS = [{ id: 'formacion', nombre: 'FORMACIÓN' }, { id: 'equipo', nombre: 'EQUIPO' }, { id: 'paquetes', nombre: 'PAQUETES' }, { id: 'catalogo', nombre: 'CATÁLOGO' }, { id: 'taller', nombre: 'TALLER' }];
  const COLUMNA = { bienestar: ['naranja', 'r-taza'], logistica: ['azul', 'r-iman'], productividad: ['rojo', 'r-grapadora'] };
  const POSIT = { hecho: ['#9ee38a', '#c8f5b8', '#5fae5a'], disponible: ['#ffd23a', '#fff3a0', '#c8901a'], bloqueado: ['#d9c8a4', '#e8dcc0', '#b8a47c'] };

  // Lo que hace un efecto, en una frase por cada cosa que da.
  const FRASE = {
    cafe: '+{n} de café máximo', caja: '+{n} de sitio en la caja', dano: '+{n} % de daño', cadencia: 'Dispara un {n} % más rápido',
    alcance: '+{n} de alcance', iman: '+{n} de imán para el botín', espera: 'El ascensor llega {n} s antes', gasto: 'Gastas un {n} % menos de café',
    crunch: 'La CRUNCH ZONE gasta un {n} % menos', valor: 'El botín vale un {n} % más', taza: 'Las tazas rellenan {n} más de café',
    multi: '+{n} grapa por disparo', vel: '+{n} % de velocidad', freno: 'Las reuniones te frenan un {n} % menos',
    blindaje: 'Los golpes quitan un {n} % menos', rebote: 'Tus disparos rebotan {n} vez más',
  };
  const PORCIENTO = { dano: 1, cadencia: 1, gasto: 1, crunch: 1, valor: 1, vel: 1, freno: 1, blindaje: 1 };
  UI.describe = (ef) => Object.keys(ef).map((k) => tr(FRASE[k], { n: PORCIENTO[k] ? Math.round(ef[k] * 100) : ef[k] }));

  UI.zonaMesa = (H) => ({ y0: 206, y1: H - 140 });

  // La cabecera: el título, las monedas, tu cargo y el récord; tras arreglar el servidor, el botón de ASCENDER.
  function cabecera(g, W, AJ, p, botones) {
    UI.panel(g, -6, -6, W + 12, 126, C.madera, '#c2432e', '#5a1714', 5);
    UI.titulo(g, tr('TU MESA'), W / 2, 30, 36);
    UI.becario(g, AJ, B.aspectoDe(AJ, p), W / 2, 98, 0.9);   // tu becario, con lo que llevas puesto (debajo del título, sin taparlo)
    UI.moneda(g, 34, 92, 3);
    T(g, String(p.monedas), 60, 93, 28, C.oro, 'left', 5);
    T(g, tr(AJ.rangos[p.rango]), W - 24, 30, 18, C.naranja, 'right', 3);
    if (p.final && p.rango < AJ.rangos.length - 1) {
      const b = { x: W - 186, y: 66, w: 172, h: 50, accion: 'ascender' };
      UI.boton(g, b, 'oro', tr('ASCENDER'), 22);
      botones.push(b);
      return;
    }
    T(g, p.record ? tr('Récord: planta') + ' -' + p.record : tr('Primera bajada'), W - 24, 93, 18, C.crema, 'right', 3);
  }

  function pestanas(g, W, m, botones) {
    const w = (W - 24 - 6 * (PESTANAS.length - 1)) / PESTANAS.length;
    PESTANAS.forEach((q, i) => {
      const b = { x: 12 + i * (w + 6), y: 136, w, h: 58, accion: 'pestana', id: q.id };
      UI.boton(g, b, m.pestana === q.id ? 'naranja' : 'azul', '', 0);
      UI.textoCabe(g, tr(q.nombre), b.x + w / 2, b.y + 27, 19, w - 10, '#ffffff', 'center', 4);
      botones.push(b);
    });
  }

  // ---------- pestaña FORMACIÓN: el tablero Kanban ----------
  function posit(g, AJ, p, c, b) {
    const estado = B.estadoCurso(AJ, p, c.id), [base, luz, sombra] = POSIT[estado];
    UI.panel(g, b.x, b.y, b.w, b.h, base, luz, sombra, 3);
    const grande = b.h >= 62;
    UI.lineas(g, tr(c.nombre), b.x + 10, b.y + (grande ? 18 : b.h / 2), 14, b.w - 20, estado === 'bloqueado' ? '#8a7a5a' : C.cafe, 'left', 0, 15);
    if (!grande) return;
    const y = b.y + b.h - 16;
    if (estado === 'hecho') { T(g, tr('HECHO'), b.x + b.w - 10, y, 15, '#2e6a2a', 'right', 0); return; }
    if (estado === 'bloqueado') { candado(g, b.x + b.w - 20, y); return; }
    UI.moneda(g, b.x + 20, y, 1.5);
    T(g, String(c.coste), b.x + 36, y + 1, 18, p.monedas >= c.coste ? C.cafe : C.rojo, 'left', 0);
  }
  function candado(g, x, y) {
    g.fillStyle = '#8a7a5a'; g.fillRect(x - 8, y - 4, 16, 12);
    g.strokeStyle = '#8a7a5a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - 4, 5, Math.PI, 0); g.stroke();
  }

  function formacion(g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), cw = (W - 24 - 16) / 3, top = y0 + 58;
    const ch = Math.max(40, Math.floor((y1 - top) / 7) - 6);
    AJ.columnas.forEach((col, i) => {
      const x = 12 + i * (cw + 8), [color, icono] = COLUMNA[col];
      UI.boton(g, { x, y: y0, w: cw, h: 48 }, color, '', 0);
      UI.dibuja(g, icono, x + 24, y0 + 23, 1);
      UI.textoCabe(g, tr(AJ.nombreColumna[col]), x + cw / 2 + 14, y0 + 23, 16, cw - 52, '#ffffff');
      AJ.formacion.filter((c) => c.col === col).forEach((c, k) => {
        const b = { x, y: top + k * (ch + 6), w: cw, h: ch, accion: 'curso', id: c.id };
        posit(g, AJ, p, c, b);
        botones.push(b);
      });
    });
  }

  // La ficha de un curso: nombre, columna, lo que da y el botón de comprar.
  function fichaCurso(g, W, H, AJ, p, id) {
    const c = AJ.formacion.find((q) => q.id === id), estado = B.estadoCurso(AJ, p, id), x = 30, w = W - 60, y = H / 2 - 190;
    const botones = [];
    UI.pergamino(g, x, y, w, 380);
    const [color, icono] = COLUMNA[c.col];
    UI.dibuja(g, icono, W / 2, y + 56, 2.5);
    T(g, tr(AJ.nombreColumna[c.col]), W / 2, y + 102, 18, UI.C[color] || C.naranja, 'center', 3);
    UI.lineas(g, tr(c.nombre), W / 2, y + 140, 30, w - 50, C.oro, 'center', 5, 34);
    UI.describe(c.ef).forEach((f, i) => T(g, f, W / 2, y + 210 + i * 30, 22, '#2e6a2a', 'center', 0));
    const comprar = { x: x + 26, y: y + 278, w: w / 2 - 36, h: 74, accion: 'comprarCurso', id };
    const cerrar = { x: W / 2 + 10, y: y + 278, w: w / 2 - 36, h: 74, accion: 'cerrar' };
    if (estado === 'disponible') {
      UI.boton(g, comprar, p.monedas >= c.coste ? 'verde' : 'apagado', '', 0);
      UI.moneda(g, comprar.x + 36, comprar.y + 36, 2.5);
      T(g, String(c.coste), comprar.x + comprar.w / 2 + 18, comprar.y + 36, 30, '#ffffff', 'center', 5);
      botones.push(comprar);
    } else {
      UI.lineas(g, estado === 'hecho' ? tr('YA LO TIENES') : tr('Antes, el curso de arriba'), comprar.x + comprar.w / 2, comprar.y + 30, 20, comprar.w, estado === 'hecho' ? '#2e6a2a' : C.rojo, 'center', 0);
    }
    UI.boton(g, cerrar, 'azul', tr('CERRAR'), 28);
    botones.push(cerrar, { x: 0, y: 0, w: W, h: H, accion: 'cerrar' });   // tocar fuera también cierra (va el último)
    return botones;
  }

  const CONTENIDO = { formacion, equipo: (...a) => UI.pestanaEquipo(...a), paquetes: (...a) => UI.pestanaPaquetes(...a), catalogo: (...a) => UI.pestanaCatalogo(...a), taller: (...a) => UI.pestanaTaller(...a) };

  // m = { pestana, sel (curso abierto), apertura (paquete que se está abriendo), dep (eligiendo departamento: el id del marcado), ascenso (la ventana),
  //       armeria (eligiendo arma), taller (la receta abierta en el taller) }
  UI.mesa = function (g, W, H, t, AJ, p, m) {
    if (m.apertura) return UI.apertura(g, W, H, t, AJ, m.apertura);
    if (m.dep) return UI.departamentos(g, W, H, AJ, p, m.dep);
    UI.fondoMenu(g, W, H, 'fondo-oficinas');
    g.fillStyle = 'rgba(10,5,20,0.45)'; g.fillRect(0, 0, W, H);
    const botones = [];
    cabecera(g, W, AJ, p, botones);
    pestanas(g, W, m, botones);
    CONTENIDO[m.pestana](g, W, H, AJ, p, botones);
    const bajar = { x: W / 2 - 150, y: H - 122, w: 300, h: 100, accion: 'bajar' }, k = 1 + 0.03 * Math.round(Math.sin(t * 5.6));
    g.save(); g.translate(W / 2, bajar.y + 50); g.scale(k, k); g.translate(-W / 2, -(bajar.y + 50));
    UI.boton(g, bajar, 'naranja', tr('BAJAR'), 52);
    g.restore();
    botones.push(bajar);
    if (m.ascenso) return UI.ascenso(g, W, H, AJ, p);
    if (m.armeria) return UI.armeria(g, W, H, AJ, p);
    if (m.taller) return UI.fichaTaller(g, W, H, AJ, p, m.taller);
    if (!m.sel) return botones;
    g.fillStyle = 'rgba(10,5,20,0.8)'; g.fillRect(0, 0, W, H);
    return fichaCurso(g, W, H, AJ, p, m.sel);
  };
})(BAS);
