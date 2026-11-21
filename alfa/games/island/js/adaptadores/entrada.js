// Fans of Island · adaptadores/entrada: LOS CONTROLES (IS.creaMandos). Mitad izquierda de la pantalla: moverse (según caiga el dedo a un
// lado u otro de las flechas; se puede deslizar). Mitad derecha: saltar. Funcionan a la vez con dos dedos. Teclado: flechas o A-D, y
// espacio, arriba, W o Z. lee() devuelve {dir, salto, buffer}: buffer guarda un pulsado de salto un instante, para que salte aunque se
// pulse un pelín antes de tocar el suelo.
'use strict';
IS.creaMandos = () => {
  const ent = { dir: 0, salto: false, buffer: 0, dirTactil: 0, saltoTactil: false };
  const teclas = new Set(), TECLAS_SALTO = ['Space', 'ArrowUp', 'KeyW', 'KeyZ'];
  const captura = (el, e) => { try { el.setPointerCapture(e.pointerId); } catch (err) { /* el dedo ya se fue: no pasa nada */ } };

  function conectaMover() {
    const zona = document.getElementById('zonaMover'), fIzq = document.getElementById('fIzq'), fDer = document.getElementById('fDer');
    const dedos = new Map();
    function dirTactil() {
      let d = 0;
      if (dedos.size) {
        const r = document.getElementById('cruceta').getBoundingClientRect(), m = r.left + r.width / 2;
        const x = [...dedos.values()].pop();
        d = x < m - 5 ? -1 : (x > m + 5 ? 1 : 0);
      }
      ent.dirTactil = d;
      fIzq.classList.toggle('pulsada', d < 0); fDer.classList.toggle('pulsada', d > 0);
    }
    zona.addEventListener('pointerdown', e => { e.preventDefault(); captura(zona, e); dedos.set(e.pointerId, e.clientX); dirTactil(); });
    zona.addEventListener('pointermove', e => { if (dedos.has(e.pointerId)) { dedos.set(e.pointerId, e.clientX); dirTactil(); } });
    const suelta = e => { if (dedos.delete(e.pointerId)) dirTactil(); };
    zona.addEventListener('pointerup', suelta); zona.addEventListener('pointercancel', suelta);
  }
  function conectaSalto() {
    const zona = document.getElementById('zonaSalto'), boton = document.getElementById('saltar'), dedos = new Set();
    zona.addEventListener('pointerdown', e => {
      e.preventDefault(); captura(zona, e);
      dedos.add(e.pointerId); ent.saltoTactil = true; ent.buffer = 0.13; boton.classList.add('pulsado');
    });
    const suelta = e => { dedos.delete(e.pointerId); if (!dedos.size) { ent.saltoTactil = false; boton.classList.remove('pulsado'); } };
    zona.addEventListener('pointerup', suelta); zona.addEventListener('pointercancel', suelta);
  }
  function conectaTeclado() {
    addEventListener('keydown', e => {
      if (TECLAS_SALTO.includes(e.code) && !teclas.has(e.code)) ent.buffer = 0.13;
      teclas.add(e.code);
    });
    addEventListener('keyup', e => teclas.delete(e.code));
  }
  function lee() {   // los mandos de este fotograma (se leen del teclado y de los dedos)
    const k = (teclas.has('ArrowRight') || teclas.has('KeyD')) - (teclas.has('ArrowLeft') || teclas.has('KeyA'));
    ent.dir = ent.dirTactil || k;
    ent.salto = !!ent.saltoTactil || TECLAS_SALTO.some(c => teclas.has(c));
    return ent;
  }
  conectaMover(); conectaSalto(); conectaTeclado();
  addEventListener('contextmenu', e => e.preventDefault());
  return { lee };
};
