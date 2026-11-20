// Fans of Pinball · dominio · MEJORAS de partida: qué 3 se ofrecen tras cada escalera (rareza al azar con semilla, sin repetir, sin pasar
// del tope de cada una, al menos una rara tras la sala tesoro o el jefe, la primera elección fija) y las cifras que dan las que se tienen.
'use strict';
PB.mejoras = (() => {
  const RARAS = new Set(['rara', 'epica']);
  const porId = reglas => Object.fromEntries(reglas.mejoras.lista.map(m => [m.id, m]));
  const cuantas = (tiene, id) => tiene[id] || 0;
  const disponibles = (reglas, tiene) => reglas.mejoras.lista.filter(m => cuantas(tiene, m.id) < reglas.mejoras.rarezas[m.rareza].max);
  function tiraRareza(reglas, azar) {
    let u = azar.uno();
    for (const [id, r] of Object.entries(reglas.mejoras.rarezas)) { if (u < r.probabilidad) return id; u -= r.probabilidad; }
    return 'comun';
  }
  function una(reglas, azar, libres, fuera) {
    const rareza = tiraRareza(reglas, azar), sinRepetir = libres.filter(m => !fuera.includes(m.id));
    const deEsa = sinRepetir.filter(m => m.rareza === rareza);
    return azar.elige(deEsa.length ? deEsa : sinRepetir).id;
  }
  // si toca, cambia la última por una rara o épica
  function garantiza(reglas, azar, libres, oferta) {
    const m = porId(reglas);
    if (!oferta.length || oferta.some(id => RARAS.has(m[id].rareza))) return;
    const raras = libres.filter(x => RARAS.has(x.rareza) && !oferta.includes(x.id));
    if (raras.length) oferta[oferta.length - 1] = azar.elige(raras).id;
  }
  // los ids que se ofrecen. opciones: { primera (la primera elección de la primera partida), garantiza (tras tesoro o jefe) }
  function ofrece(reglas, azar, tiene, opciones = {}) {
    const libres = disponibles(reglas, tiene);
    if (opciones.primera) return reglas.mejoras.primeraEleccion.filter(id => libres.some(m => m.id === id));
    const oferta = [];
    while (oferta.length < Math.min(reglas.mejoras.porEleccion, libres.length)) oferta.push(una(reglas, azar, libres, oferta));
    if (opciones.garantiza) garantiza(reglas, azar, libres, oferta);
    return oferta;
  }
  const veces = (tiene, id) => cuantas(tiene, id);
  // lo que dan juntas las mejoras que se tienen ({ id: veces })
  function cifras(reglas, tiene) {
    const m = porId(reglas), n = id => cuantas(tiene, id), si = (id, valor) => (n(id) ? valor : null);
    return {
      fuerzaPala: 1 + m.pala_acero.fuerza * n('pala_acero'),
      radio: 1 + m.bola_gorda.radio * n('bola_gorda'), dano: m.bola_gorda.dano * n('bola_gorda'),
      fichas: Math.pow(1 + m.iman_fichas.fichas, n('iman_fichas')),
      caos: Math.pow(1 + m.cafe_doble.caos, n('cafe_doble')),
      segCofre: m.horas_extra.cofre * n('horas_extra'), segEnemigo: m.horas_extra.enemigo * n('horas_extra'),
      escaleraMenos: m.escalera_expres.menos * n('escalera_expres'), escaleraMinimo: m.escalera_expres.minimo,
      critico: m.golpe_critico.probabilidad * n('golpe_critico'), criticoX: m.golpe_critico.multiplicador,
      rebote: si('rebote_explosivo', { cada: m.rebote_explosivo.cada, radio: m.rebote_explosivo.radio, dano: m.rebote_explosivo.dano * n('rebote_explosivo') }),
      estela: si('estela_fuego', { segundos: m.estela_fuego.segundos * n('estela_fuego'), dano: m.estela_fuego.dano, cada: m.estela_fuego.cada }),
      setasLocas: si('setas_locas', { chispas: m.setas_locas.chispas * n('setas_locas'), dano: m.setas_locas.dano, combo: m.setas_locas.combo }),
      salvavidas: n('salvavidas'), caosExtra: m.caos_largo.segundos * n('caos_largo'),
      perforante: n('perforante') > 0, cuartaBola: n('cuarta_bola') > 0,
    };
  }
  return { ofrece, cifras, veces, disponibles };
})();
