// Fans Of Pets · adaptador · CUIDADO DUCHA: la VISTA del minijuego de la ducha (dominio/ducha.js, docs/pets/cuidados-minijuegos.md). Frotar: la esponja
// sigue al dedo y llena de espuma la zona del cuerpo que toca (los px frotados dentro de la zona). Aclarar: la ducha, con el dedo pulsado sobre una
// zona, le quita la espuma (los segundos). El muñeco reacciona: se deja frotar y, al acabar, se sacude. Devuelve { baja, mueve, sube, pose, pinta, terminado }.
'use strict';
PT.cuidadoDucha = (() => {
  const D = PT.cuidadoDibujo, A = PETS.cuidado.ducha, BOLAS = 16, TINTA = D.TINTA;
  // cómo se nombra cada zona en el aviso de lo que falta (cada nombre pasa por tr() antes de pegarlo)
  const NOMBRE = { cabeza: () => tr('la cabeza'), torso: () => tr('el torso'), brazos: () => tr('los brazos'), piernas: () => tr('las piernas'), cola: () => tr('la cola') };

  function crea(sesion) {
    const j = sesion.juego, v = { lleva: false, p: null, ultimo: null, t: 0, fin: -1, zonas: {}, lado: 1 };
    // la zona bajo un punto: la de ancla más cercana dentro de su radio (en fracciones del lado)
    function zonaEn(p) {
      let mejor = null, mejorD = Infinity;
      for (const [z, anclas] of Object.entries(v.zonas)) {
        for (const a of anclas) {
          const d = D.distancia(p, a);
          if (d < A.zonas[z].radio * v.lado && d < mejorD) { mejor = z; mejorD = d; }
        }
      }
      return mejor;
    }
    function baja(x, y) { v.lleva = true; v.ultimo = { x, y }; v.p = { x, y }; }
    function mueve(x, y) {
      if (!v.lleva) return;
      const p = { x, y }, z = zonaEn(p);
      if (j.fase === 'frotar' && z) j.frota(z, D.distancia(p, v.ultimo) / A.frotar);
      v.ultimo = v.p = p;
    }
    const sube = () => { v.lleva = false; };
    function aclara(dt) {
      const z = v.lleva && v.p && j.fase === 'aclarar' ? zonaEn(v.p) : null;
      if (z) j.aclara(z, dt / A.aclarar);
    }
    function pose(t) {
      if (j.terminada) return { nombre: 'sacude', desde: v.fin };
      return { nombre: j.fase === 'frotar' && v.lleva && v.p && zonaEn(v.p) ? 'frotado' : 'atiende', desde: 0 };
    }
    function pinta(ctx, t, { ancla, lado }) {
      const dt = Math.min(0.1, Math.max(0, t - v.t)); v.t = t; v.lado = lado;
      for (const [z, c] of Object.entries(A.zonas)) v.zonas[z] = puntos(c.puntos, ancla, lado);
      aclara(dt);
      if (j.terminada && v.fin < 0 && sesion.termina().ok) v.fin = t;
      for (const z of j.zonas) espuma(ctx, v.zonas[z], j.espuma(z), lado, t, z);
      if (v.fin < 0) herramienta(ctx, v, j.fase, t);
      const faltan = j.fase === 'frotar' ? j.zonas.filter(z => j.espuma(z) < 1) : [];
      if (faltan.length && faltan.length < j.zonas.length) for (const z of faltan) aviso(ctx, v.zonas[z], A.zonas[z].radio * lado, t);
      D.ayuda(ctx, textoAyuda(j.fase, v.fin >= 0, faltan.length < j.zonas.length ? faltan : []));
    }
    return { baja, mueve, sube, pose, pinta, get terminado() { return v.fin; } };
  }
  // el texto de arriba: lo que toca ahora y, al frotar, las zonas donde aún falta jabón (las que quedan sin cubrir del todo)
  function textoAyuda(fase, acabado, faltan) {
    if (acabado) return tr('¡Limpito!');
    if (fase !== 'frotar') return fase === 'aclarar' ? tr('¡Bien enjabonado! Aclara con la ducha: mantén pulsado') : tr('Aclara con la ducha: mantén pulsado');
    if (!faltan.length) return tr('Frótalo con la esponja');
    // con dos o menos se dicen por su nombre; con más no cabrían en la línea, y los aros ya las señalan
    return faltan.length <= 2 ? tr('Te falta jabón en {zonas}', { zonas: faltan.map(z => NOMBRE[z]()).join(tr(' y ')) }) : tr('Te falta jabón en {n} zonas', { n: faltan.length });
  }
  // un aro discontinuo que late sobre una zona a medio enjabonar, para ver dónde falta
  function aviso(ctx, anclas, radio, t) {
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 5);
    for (const a of anclas) { ctx.beginPath(); ctx.arc(a.x, a.y, radio, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  // los puntos de una zona en el lienzo: el hueso más su desplazamiento (en fracciones del lado); los que aún no tienen muñeco se saltan
  function puntos(lista, ancla, lado) {
    return lista.map(([hueso, dx, dy]) => { const a = ancla(hueso); return a && { x: a.x + dx * lado, y: a.y + dy * lado }; }).filter(Boolean);
  }
  // las bolas de espuma de una zona: sitios fijos alrededor de sus anclas; cuanta más espuma, más bolas y más grandes
  function espuma(ctx, anclas, cantidad, lado, t, zona) {
    if (!anclas.length || cantidad <= 0) return;
    const n = Math.ceil(BOLAS * cantidad), semilla = [...zona].reduce((s, c) => s + c.charCodeAt(0), 0);
    for (let i = 0; i < n; i++) {
      const a = anclas[i % anclas.length], ang = (i * 2.399 + semilla) % (Math.PI * 2), d = (0.35 + 0.65 * ((i * 7 + semilla) % 10) / 10) * A.zonas[zona].radio * lado;
      const r = lado * (0.018 + 0.03 * cantidad) * (0.8 + 0.4 * ((i * 3 + semilla) % 5) / 5), bob = Math.sin(t * 2 + i) * 1.5;
      D.forma(ctx, '#ffffff', D.elipse(a.x + Math.cos(ang) * d, a.y + Math.sin(ang) * d * 0.8 + bob, r, r * 0.9), 3);
    }
  }
  function herramienta(ctx, v, fase, t) {
    const p = v.p || { x: 440, y: 700 };
    if (fase === 'frotar') esponja(ctx, p);
    else ducha(ctx, p, v.lleva, t);
  }
  function esponja(ctx, p) {
    D.forma(ctx, '#ffd23f', D.poligono([[p.x - 38, p.y - 24], [p.x + 38, p.y - 24], [p.x + 42, p.y + 22], [p.x - 42, p.y + 22]]));
    for (const [dx, dy] of [[-18, -4], [8, 6], [22, -8]]) D.forma(ctx, '#c9961a', D.elipse(p.x + dx, p.y + dy, 5, 4), 2);
  }
  // la alcachofa: un disco con la tija; con el dedo pulsado cae el agua en rayas
  function ducha(ctx, p, agua, t) {
    D.forma(ctx, '#c9ced8', D.poligono([[p.x + 14, p.y - 70], [p.x + 70, p.y - 120], [p.x + 80, p.y - 106], [p.x + 26, p.y - 56]]), 5);
    D.forma(ctx, '#9bd7f5', D.elipse(p.x, p.y - 50, 36, 14, -0.15));
    if (!agua) return;
    ctx.strokeStyle = '#7fc8f0'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
      const y0 = p.y - 40 + ((t * 300 + i * 41) % 60), x = p.x + i * 10;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 2, y0 + 22); ctx.stroke();
    }
    ctx.strokeStyle = TINTA;
  }
  return { crea };
})();
