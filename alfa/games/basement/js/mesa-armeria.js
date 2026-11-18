// Fans of Basement · La armería de tu mesa (solo pantalla): la ventana que se abre con CAMBIAR en la fila del arma (pestaña EQUIPO).
// Enseña todas las armas en una rejilla, del color de su rareza y con su nivel si la tienes, o en negro con «?» si todavía no ha
// salido de ningún paquete; tocar una que tengas te la pone. Debajo, lo que hace el arma puesta. Las reglas, en inventario.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const QUE_HACE = {
    grapadora: 'Una grapa al más cercano', clips: 'Tres clips en abanico', taladro: 'Atraviesa a varios bichos',
    extintor: 'Explota y daña alrededor', raton: 'Rebota de bicho en bicho', cinta: 'Pega y frena a los bichos',
    perforadora: 'Confeti de agujeros en abanico', abrecartas: 'Rápido y atraviesa en línea', boli: 'Clic, clic, clic: muy rápido y flojito',
    impresora: 'Ráfaga de folios', trituradora: 'De cerca, una lluvia de tiras', router: 'Ondas en todas direcciones',
    laser: 'Rayo rapidísimo que atraviesa', sello: 'Cae en el sitio y daña alrededor', proyector: 'Cono de luz que frena',
    taza: 'Cada bicho que tumba te da café', industrial: 'Grapas gordas que atraviesan y rebotan',
  };
  UI.queHaceArma = (id) => tr(QUE_HACE[id] || '');

  UI.armeria = function (g, W, H, AJ, p) {
    g.fillStyle = 'rgba(10,5,20,0.85)'; g.fillRect(0, 0, W, H);
    const ids = Object.keys(AJ.armas), cols = 4, filas = Math.ceil(ids.length / cols), x = 24, w = W - 48, lado = Math.floor(Math.min((w - 40 - (cols - 1) * 12) / cols, (H - 320) / filas - 12));
    const alto = 130 + filas * (lado + 12) + 150, y = Math.max(20, (H - alto) / 2), x0 = x + (w - cols * lado - (cols - 1) * 12) / 2, a = B.armaDe(AJ, p), botones = [];
    UI.pergamino(g, x, y, w, alto);
    UI.titulo(g, tr('TUS ARMAS'), W / 2, y + 52, 40);
    ids.forEach((id, i) => {
      const d = AJ.armas[id], nivel = d.rareza ? p.armas[id] || 0 : 1, b = { x: x0 + (i % cols) * (lado + 12), y: y + 100 + Math.floor(i / cols) * (lado + 12), w: lado, h: lado };
      UI.cuadroRareza(g, b, nivel ? (d.rareza ? AJ.colorRareza[d.rareza] : C.perg2) : null, nivel ? (cx, cy) => V().pintaCosa(g, id, cx, cy, null, 1.05) : null, a.id === id);
      if (!nivel) return;
      if (d.rareza) T(g, String(nivel), b.x + b.w - 6, b.y + b.h - 10, 18, '#ffffff', 'right', 3);
      botones.push({ ...b, accion: 'arma', id });
    });
    const yt = y + 100 + filas * (lado + 12) + 6;
    UI.textoCabe(g, tr(a.nombre), W / 2, yt + 14, 24, w - 40, a.rareza ? AJ.colorRareza[a.rareza] : C.cafe, 'center', a.rareza ? 4 : 0);
    UI.textoCabe(g, UI.queHaceArma(a.id), W / 2, yt + 44, 18, w - 40, '#2e6a2a', 'center', 0);
    const cerrar = { x: W / 2 - 110, y: yt + 66, w: 220, h: 66, accion: 'cerrarArmeria' };
    UI.boton(g, cerrar, 'azul', tr('CERRAR'), 28);
    return [...botones, cerrar, { x: 0, y: 0, w: W, h: H, accion: 'cerrarArmeria' }];   // tocar fuera también cierra (va el último)
  };
})(BAS);
