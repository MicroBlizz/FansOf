// Fans of Island · LOS CONTROLES. Mitad izquierda de la pantalla: moverse (según caiga el dedo a un lado u otro de las flechas;
// se puede deslizar). Mitad derecha: saltar. Funcionan a la vez con dos dedos. Teclado: flechas o A-D, y espacio, arriba, W o Z.
// ent.buffer guarda un pulsado de salto un instante, para que salte aunque se pulse un pelín antes de tocar el suelo.
'use strict';
const ent = { dir: 0, salto: false, buffer: 0, dirTactil: 0, saltoTactil: false };
(() => {
  const zonaMover = document.getElementById('zonaMover'), zonaSalto = document.getElementById('zonaSalto');
  const fIzq = document.getElementById('fIzq'), fDer = document.getElementById('fDer'), bSaltar = document.getElementById('saltar');
  const dedosMover = new Map(), dedosSalto = new Set();
  const captura = (el, e) => { try { el.setPointerCapture(e.pointerId); } catch (err) { /* el dedo ya se fue: no pasa nada */ } };
  function dirTactil() {
    let d = 0;
    if (dedosMover.size) {
      const r = document.getElementById('cruceta').getBoundingClientRect(), m = r.left + r.width / 2;
      const x = [...dedosMover.values()].pop();
      d = x < m - 5 ? -1 : (x > m + 5 ? 1 : 0);
    }
    ent.dirTactil = d;
    fIzq.classList.toggle('pulsada', d < 0); fDer.classList.toggle('pulsada', d > 0);
  }
  zonaMover.addEventListener('pointerdown', e => { e.preventDefault(); captura(zonaMover, e); dedosMover.set(e.pointerId, e.clientX); dirTactil(); });
  zonaMover.addEventListener('pointermove', e => { if (dedosMover.has(e.pointerId)) { dedosMover.set(e.pointerId, e.clientX); dirTactil(); } });
  const sueltaMover = e => { if (dedosMover.delete(e.pointerId)) dirTactil(); };
  zonaMover.addEventListener('pointerup', sueltaMover); zonaMover.addEventListener('pointercancel', sueltaMover);
  zonaSalto.addEventListener('pointerdown', e => {
    e.preventDefault(); captura(zonaSalto, e);
    dedosSalto.add(e.pointerId); ent.saltoTactil = true; ent.buffer = 0.13; bSaltar.classList.add('pulsado');
  });
  const sueltaSalto = e => { dedosSalto.delete(e.pointerId); if (!dedosSalto.size) { ent.saltoTactil = false; bSaltar.classList.remove('pulsado'); } };
  zonaSalto.addEventListener('pointerup', sueltaSalto); zonaSalto.addEventListener('pointercancel', sueltaSalto);
  addEventListener('contextmenu', e => e.preventDefault());
})();
const TECLAS = { pulsadas: new Set(), salto: ['Space', 'ArrowUp', 'KeyW', 'KeyZ'] };
addEventListener('keydown', e => {
  if (TECLAS.salto.includes(e.code) && !TECLAS.pulsadas.has(e.code)) ent.buffer = 0.13;
  TECLAS.pulsadas.add(e.code);
});
addEventListener('keyup', e => TECLAS.pulsadas.delete(e.code));
function leeControles() {
  const t = TECLAS.pulsadas, k = (t.has('ArrowRight') || t.has('KeyD')) - (t.has('ArrowLeft') || t.has('KeyA'));
  ent.dir = ent.dirTactil || k;
  ent.salto = !!ent.saltoTactil || TECLAS.salto.some(c => t.has(c));
}
