// Fans of Asalto · DOMINIO · Los anuncios opcionales de la partida y sus topes: otra oferta de la tienda gratis (una por oferta),
// esencia extra (una por oleada) y reintentar una oleada perdida sin perder la vida (las veces de sus ajustes, por partida, y solo
// antes de volver a lucharla). Solo dice si se puede y qué da: lo aplica partida.js DESPUÉS de verse el anuncio. El estado es un valor
// congelado: { oferta: la oleada con la que empezó la oferta en la que ya se usó, esencia: la oleada en la que ya se usó, vidas: las
// devueltas en la partida, perdida: la oleada perdida que aún se puede reintentar sin perder la vida (0 si ninguna) }.
'use strict';
AS.anuncios = (() => {
  const TIPOS = ['oferta', 'esencia', 'vida'];
  const congela = a => Object.freeze({ oferta: a.oferta, esencia: a.esencia, vidas: a.vidas, perdida: a.perdida });
  const vacio = () => congela({ oferta: 0, esencia: 0, vidas: 0, perdida: 0 });
  // la oleada con la que empezó la oferta de la tienda que se ve en la oleada n (la 1, la 3, la 5…)
  const oferta = (datos, n) => n - (n - 1) % datos.tienda.cada;
  // por qué no se puede ver ese anuncio ahora (un error con nombre), o null si se puede. fase y n: los de la partida
  function motivo(datos, a, tipo, fase, n) {
    if (!TIPOS.includes(tipo)) return 'anuncio-invalido';
    if (fase !== 'preparar') return 'ahora-no';
    const ya = { oferta: a.oferta === oferta(datos, n), esencia: a.esencia === n, vida: a.perdida !== n || a.vidas >= datos.anuncios.vida.veces };
    return ya[tipo] ? 'ya-visto' : null;
  }
  const puede = (datos, a, tipo, fase, n) => !motivo(datos, a, tipo, fase, n);
  // el anuncio ya visto: el estado nuevo y lo que da { anuncios, esencia, vidas, oferta: si toca sortear otra oferta gratis }
  function usa(datos, a, tipo, fase, n) {
    const m = motivo(datos, a, tipo, fase, n);
    if (m) return AS.error(m);
    const da = { esencia: 0, vidas: 0, oferta: false };
    if (tipo === 'oferta') { da.oferta = true; a = { ...a, oferta: oferta(datos, n) }; }
    if (tipo === 'esencia') { da.esencia = datos.anuncios.esencia.cantidad; a = { ...a, esencia: n }; }
    if (tipo === 'vida') { da.vidas = datos.partida.vidasPorPerder; a = { ...a, vidas: a.vidas + 1, perdida: 0 }; }
    return AS.ok({ anuncios: congela(a), ...da });
  }
  // al perder una oleada normal (se repite) se puede reintentar sin perder la vida; al volver a luchar, ya no
  const pierde = (a, n) => congela({ ...a, perdida: n });
  const lucha = a => (a.perdida ? congela({ ...a, perdida: 0 }) : a);
  const ent = v => Math.max(0, Math.floor(v) || 0);
  const deJSON = j => (j ? congela({ oferta: ent(j.oferta), esencia: ent(j.esencia), vidas: ent(j.vidas), perdida: ent(j.perdida) }) : vacio());
  return { TIPOS, vacio, oferta, puede, usa, pierde, lucha, deJSON };
})();
