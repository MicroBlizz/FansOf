// Fans Of Pets · adaptador · CUIDADO COMER: la VISTA del minijuego de la cuchara (dominio/comida.js, docs/pets/cuidados-minijuegos.md). Traduce los
// gestos (arrastrar la cuchara) a llenaCuchara y daBocado, y dibuja el bol, la cuchara y la ayuda. El muñeco solo reacciona: atiende y, tras cada
// bocado, mastica (pose). Recibe la sesión de PT.creaCuidadoJugado (juego + termina) y devuelve { baja, mueve, sube, pose, pinta, terminado }.
// pinta(ctx, t, { ancla(hueso), lado }) y pose(t) → { nombre, desde }; el que la usa pinta el muñeco con esa pose y llama a pinta encima.
'use strict';
PT.cuidadoComer = (() => {
  const D = PT.cuidadoDibujo, A = PETS.cuidado.comida, MASTICA = 1.4, DESPLAZA = 52, AGARRE = 70;   // segundos de masticar; la cuchara va sobre el dedo; px para agarrarla
  const REPOSO = A.cuchara, BOL = A.bol;

  function crea(sesion) {
    const j = sesion.juego, v = { x: REPOSO.x, y: REPOSO.y, lleva: false, t: 0, bocado: -9, fin: -1, boca: null };
    const cuchara = () => ({ x: v.x, y: v.y });
    const sobreBol = () => D.distancia(cuchara(), BOL) < BOL.radio;
    const sobreBoca = () => v.boca && D.distancia(cuchara(), v.boca) < A.boca.radio * v.lado;
    function baja(x, y) { if (D.distancia({ x, y: y - DESPLAZA }, cuchara()) < AGARRE || D.distancia({ x, y }, cuchara()) < AGARRE) { v.lleva = true; mueve(x, y); } }
    function mueve(x, y) {
      if (!v.lleva) return;
      v.x = x; v.y = y - DESPLAZA;
      if (sobreBol() && !j.cucharaLlena) j.llenaCuchara();
    }
    function sube() {
      if (!v.lleva) return;
      v.lleva = false;
      if (j.cucharaLlena && sobreBoca()) bocado();
    }
    function bocado() {
      j.daBocado();
      v.bocado = v.t;
      if (j.terminada && sesion.termina().ok) v.fin = v.t;
    }
    const pose = t => (t - v.bocado < MASTICA ? { nombre: 'mastica', desde: v.bocado } : { nombre: 'atiende', desde: 0 });
    function pinta(ctx, t, { ancla, lado }) {
      v.t = t; v.lado = lado;
      const cabeza = ancla(A.boca.hueso);
      v.boca = cabeza && { x: cabeza.x + A.boca.dx * lado, y: cabeza.y + A.boca.dy * lado };
      if (!v.lleva) { v.x += (REPOSO.x - v.x) * 0.25; v.y += (REPOSO.y - v.y) * 0.25; }
      pintaBol(ctx, j.nivelBol);
      if (v.lleva && j.cucharaLlena && v.boca) aro(ctx, v.boca, A.boca.radio * lado, t);
      pintaCuchara(ctx, v, j.cucharaLlena);
      D.ayuda(ctx, v.fin >= 0 ? tr('¡Qué rico!') : j.cucharaLlena ? tr('Llévala a su boca') : tr('Llena la cuchara en el bol'));
    }
    return { baja, mueve, sube, pose, pinta, get terminado() { return v.fin; } };
  }
  function pintaBol(ctx, nivel) {
    const { x, y, radio: r } = BOL;
    D.forma(ctx, '#ffb74a', D.poligono([[x - r, y - 22], [x + r, y - 22], [x + r * 0.7, y + 30], [x - r * 0.7, y + 30]]));
    D.forma(ctx, '#7a4a2a', D.elipse(x, y - 22, r, 20));
    if (nivel > 0) {
      const alto = 22 * nivel;
      D.forma(ctx, '#e8a24a', D.elipse(x, y - 22 - alto * 0.4, r * 0.82, 6 + 16 * nivel));
    }
  }
  function pintaCuchara(ctx, v, llena) {
    D.forma(ctx, '#c9ced8', D.poligono([[v.x + 8, v.y + 6], [v.x + 78, v.y + 74], [v.x + 66, v.y + 86], [v.x - 4, v.y + 18]]), 5);
    D.forma(ctx, '#c9ced8', D.elipse(v.x, v.y, 26, 20, 0.2));
    if (llena) D.forma(ctx, '#e8a24a', D.elipse(v.x, v.y - 8, 20, 14, 0.2), 4);
  }
  // el aro que late sobre la boca cuando la cuchara va llena: ahí se suelta
  function aro(ctx, p, r, t) {
    ctx.beginPath(); ctx.arc(p.x, p.y, r * (1 + 0.08 * Math.sin(t * 8)), 0, Math.PI * 2);
    ctx.setLineDash([10, 8]); ctx.lineWidth = 5; ctx.strokeStyle = '#fff6df'; ctx.stroke(); ctx.setLineDash([]);
  }
  return { crea };
})();
