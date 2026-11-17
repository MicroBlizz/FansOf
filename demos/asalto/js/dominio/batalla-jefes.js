// Fans of Asalto · DOMINIO · Los jefes: además de pegar como cualquiera, cada jefe tiene sus golpes especiales (ajustes: jefes.golpes).
// Cada golpe espera su tiempo, AVISA (un aviso en B.avisos que la pantalla pinta en el suelo: círculo o franja) y, al acabar el aviso,
// cae. Con poca vida el jefe entra en FURIA: pega y anda más rápido. Tipos de golpe: torbellino y maletin (círculo alrededor del jefe
// o sobre un héroe), despido (una franja de lado a lado en la fila de un héroe), mordisco (un golpe enorme a uno) e invoca (trae esbirros).
'use strict';
AS.jefes = (() => {
  const BT = () => AS.batalla;
  // qué aviso pone cada golpe (dónde va a caer)
  const AVISA = {
    torbellino: (B, j, g) => ({ forma: 'circulo', x: j.x, y: j.y, radio: g.radio, sigue: j.id }),
    maletin: (B, j, g, ob) => ({ forma: 'circulo', x: ob.x, y: ob.y, radio: g.radio }),
    despido: (B, j, g, ob) => ({ forma: 'franja', y: ob.y, ancho: g.ancho }),
    mordisco: (B, j, g, ob) => ({ forma: 'circulo', x: ob.x, y: ob.y, radio: 34, sigue: ob.id }),
    invoca: (B, j) => ({ forma: 'circulo', x: j.x - 60, y: j.y, radio: 50 }),
  };
  const dentro = (a, u) => (a.forma === 'franja' ? Math.abs(u.y - a.y) < a.ancho : Math.hypot(u.x - a.x, u.y - a.y) < a.radio);
  // lo que hace cada golpe al caer
  const CAE = {
    area: (B, j, a) => { for (const u of BT().vivos(B, 'heroe')) if (dentro(a, u)) AS.golpes.dana(B, j, u, j.dano * a.g.mult, 'jefe'); },
    invoca: (B, j, a) => {
      const esbirros = BT().vivos(B, 'enemigo').filter(u => !u.jefe).length;
      for (let i = 0; i < a.g.cuantos && esbirros + i < a.g.tope; i++) {
        const u = BT().enemigo(B, { tipo: B.azar.elige(a.g.quien), fuerza: B.oleada.fuerza * 0.7, x: a.x + B.azar.entre(-30, 30), y: a.y + B.azar.entre(-50, 50) });
        B.u.push(u);
      }
    },
  };
  function lanza(B, j, g) {
    const heroes = BT().vivos(B, 'heroe');
    if (!heroes.length) return;
    const ob = B.azar.elige(heroes), a = AVISA[g.tipo](B, j, g, ob);
    B.avisos.push({ ...a, tipo: g.tipo, g, t: 0, dura: g.aviso });
    B.eventos.push({ e: 'aviso', tipo: g.tipo, id: j.id });
  }
  function avisos(B, j, dt) {
    for (const a of B.avisos) {
      a.t += dt;
      if (a.sigue) { const u = B.u.find(x => x.id === a.sigue); if (u && !u.muerta) { a.x = u.x; a.y = u.y; } }
      if (a.t < a.dura) continue;
      a.fin = true;
      (CAE[a.tipo] || CAE.area)(B, j, a);
      B.eventos.push({ e: 'cae', tipo: a.tipo, forma: a.forma, x: a.x, y: a.y, radio: a.radio, ancho: a.ancho });
    }
    B.avisos = B.avisos.filter(a => !a.fin);
  }
  function furia(B, j) {
    if (j.enFuria || j.vida > j.max * j.furia) return;
    j.enFuria = true; j.cada *= 0.7; j.vel *= 1.3;
    for (const g of j.golpes) g.cada *= 0.75;
    B.eventos.push({ e: 'furia', id: j.id });
  }
  function avanza(B, j, dt) {
    furia(B, j);
    for (const g of j.golpes) { g.t += dt; if (g.t >= g.cada) { g.t = 0; lanza(B, j, g); } }
    avisos(B, j, dt);
  }
  return { avanza };
})();
