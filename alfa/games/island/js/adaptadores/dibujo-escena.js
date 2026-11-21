// Fans of Island · adaptadores/dibujo-escena: TODO LO QUE SE MUEVE y lo de delante: lo que va por el carril de CrazyBunny (IS.Dibujo.carril:
// gaviotas, cocos, zanahorias, bandera, cangrejos, Brotitos y el propio CrazyBunny), los peces y las rocas del mar, y lo de delante
// (IS.Dibujo.delante: detalles del suelo, gotas, salpicaduras, arbustos y el agua con su oleaje). Lee el estado de v.sesion.estado.
'use strict';
{
  const { T, D, CARRIL } = IS.MEDIDAS;
  const { MAR } = IS.FISICA;
  const { PIEZA, PILAS_PEZ, PILAS_GAV, PILA_COCO, PILA_ZANA, PILA_BANDERA, PILAS_CANG, PILAS_B, PILAS_C, PILA_GOTA, PILAS_OLA } = IS.arte;
  const { sy, cerca, vuelta, ente } = IS.Dibujo;
  const ALETEO = ['abajo', 'medio', 'arriba', 'medio'];
  const FILAS_OLA = [{ y: D + 1, sep: 62, vel: 7, sube: 3, lado: 1 }, { y: D + 9, sep: 78, vel: 10, sube: 4, lado: -1 }];   // dos filas de olas que suben, bajan y van y vienen

  function pez(v, f) {   // recortado en la línea del agua, con su espuma
    if (f.estado === 'oculto') return;
    const { ctx, reloj } = v, wl = sy(v, f.y, MAR), sx = Math.round(f.x - v.cx), VW = v.L.vw;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, wl); ctx.clip();
    ente(v, PILAS_PEZ[IS.posePez(f)], f.giro, f.x, f.y, f.z, 0);
    ctx.restore();
    ctx.fillStyle = '#bfeaff';
    const w = 13 + Math.round(Math.sin(reloj * 5 + f.x) * 2);
    ctx.fillRect(sx - w, wl, 2 * w, 1); ctx.fillRect(sx - w - 4, wl + 1, 5, 1); ctx.fillRect(sx + w - 1, wl + 1, 5, 1);
  }
  function rocaMar(v, r) {   // hundida: se corta en su línea del agua (como los peces) y lleva espuma alrededor
    const { ctx, reloj } = v, wl = sy(v, r.y, MAR), sx = Math.round(r.x - v.cx), w = 14 + Math.round(Math.sin(reloj * 3 + r.x) * 2);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, v.L.vw, wl); ctx.clip();
    ente(v, PIEZA.rocaMar, 0.3, r.x, r.y, MAR - 12, 0);
    ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - w, wl, 2 * w, 1);
    ctx.fillStyle = '#bfeaff'; ctx.fillRect(sx - w - 4, wl + 1, 5, 1); ctx.fillRect(sx + w - 1, wl + 1, 5, 1);
  }
  function aves(v, est) {   // gaviotas (con su coco en el pico) y cocos que caen
    for (const g of est.gaviotas) {
      ente(v, PILAS_GAV[ALETEO[Math.floor(g.t * 9) % 4]], g.giro, g.x, CARRIL - 4, g.z, 0);
      if (g.coco) ente(v, PILA_COCO, 0, g.x + g.mira * 3, CARRIL - 3, g.z - 8, 0);
    }
    for (const c of est.cocos) ente(v, PILA_COCO, c.giro, c.x, c.y, c.z, 7);
  }
  function coleccionables(v, est) {   // zanahorias y bandera
    for (const z of est.zanas) if (!z.cogida) ente(v, PILA_ZANA, v.reloj * 2, z.x, CARRIL, z.z + Math.round(Math.sin(v.reloj * 3 + z.x) * 3), 5);
    ente(v, PILA_BANDERA, 0, est.meta.x - 4, CARRIL - 4, est.meta.z, 5);
  }
  function bichos(v, est) {   // cangrejos y Brotitos
    for (const k of est.cangrejos) if (!(k.muerto > 0.3)) ente(v, PILAS_CANG[k.muerto ? 'paso2' : (Math.floor(k.t / 0.12) % 2 ? 'paso1' : 'paso2')], Math.sin(k.t * 9) * 0.12, k.x, CARRIL, k.z, 13);
    for (const e of est.enemigos) if (!(e.muerto > 0.35)) ente(v, PILAS_B[IS.poseBrotito(e)], e.giro, e.x, CARRIL, e.z, 13);
  }
  function carril(v) {   // todo lo que va por el carril de CrazyBunny
    const est = v.sesion.estado, J = est.J;
    aves(v, est); coleccionables(v, est); bichos(v, est);
    if (!(J.inv > 0 && Math.floor(J.inv * 12) % 2)) ente(v, PILAS_C[v.sesion.pose()], J.giro, J.x, CARRIL, J.z, 12);   // parpadea al estar herido
  }
  function filaOlas(v, f, n) {
    const { ctx, reloj } = v;
    for (let i = 0; i < Math.ceil(v.L.vw / f.sep) + 2; i++) {
      const q = PILAS_OLA[(i + n) % PILAS_OLA.length], fase = reloj * 1.8 + i * 1.7 + n;
      const x = vuelta(i * f.sep - v.cx + Math.floor(reloj * f.vel) * f.lado * 0.3 + n * 31, v.L.vw + f.sep * 2, f.sep);
      const z = MAR - q.al + 3 + Math.round((Math.sin(fase) * 0.5 + 0.5) * f.sube);
      ctx.drawImage(q.c, Math.round(x) - q.m, sy(v, f.y, z) - (q.al - 1) - q.m);
    }
  }
  function olas(v, wy) {   // el oleaje de delante (PILAS_OLA, arte-olas.js) y la espuma de la orilla
    const { ctx, reloj } = v;
    if (PILAS_OLA.length) FILAS_OLA.forEach((f, n) => filaOlas(v, f, n));
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < v.L.vw; x += 2) if (Math.sin((x + v.cx) * 0.11 + reloj * 2.5) > 0.1) ctx.fillRect(x, wy, 2, 1);
  }
  function agua(v) {   // el agua de delante, por encima de todo
    const wy = sy(v, D, MAR), { vw: VW, vh: VH } = v.L;
    if (wy >= VH) return;
    v.ctx.fillStyle = 'rgba(47,143,208,0.92)'; v.ctx.fillRect(0, wy, VW, VH - wy);
    olas(v, wy);
  }
  function delanteDelSuelo(v, est) {   // detalles del suelo, peces de delante, gotas, salpicaduras y arbustos
    const { NIV, DECO, DELANTE } = v.nivel, { arribaSuelo } = v.fisica;
    for (const d of DECO) if (d.t !== 'flor' && cerca(v, d.x, 20)) ente(v, PIEZA[d.t], d.giro, d.x, d.y, arribaSuelo(Math.floor(d.x / T)), 0);
    for (const f of est.peces) if (f.y > CARRIL) pez(v, f);
    for (const g of est.gotas) ente(v, PILA_GOTA, 0, g.x, g.y, g.z, 4);
    for (const p of v.parts) { v.ctx.fillStyle = p.c; v.ctx.fillRect(Math.round(p.x - v.cx), sy(v, p.y, p.z), 2, 2); }
    for (const a of DELANTE) if (NIV[a.c].s >= 0) ente(v, PIEZA.arbusto, a.giro, (a.c + 0.5) * T, D - 7, arribaSuelo(a.c), 0);
  }
  function delante(v) {   // detalles del suelo, peces de delante, gotas, salpicaduras, arbustos, rocas y el agua
    delanteDelSuelo(v, v.sesion.estado);
    for (const r of v.nivel.ROCAS_MAR) if (cerca(v, r.x, 30)) rocaMar(v, r);
    agua(v);
  }
  Object.assign(IS.Dibujo, { pez, carril, delante });
}
