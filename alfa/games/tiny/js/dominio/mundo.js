// Tiny Fans · dominio · MUNDO: sortea lo pequeño de una salida (bichos, materiales, pilas y pasadas del gigante) y lo deja como un
// ESCENARIO de datos. Lo grande (muebles, río, telas y sitios) no se sortea: está en reglas.mapa. Con la misma semilla sale el mismo
// escenario; un test escribe el suyo a mano. Puro. Dueño: N3 (dominio de la expedición).
'use strict';
TN.mundo = {
  // datos: { caidasSeguidas }. Devuelve un escenario: { bichos: [{ clase, x, z, hueco?, tela? }], botin: [{ material, cantidad, x, z }],
  // gigante: [{ t, x, z, pasada }], oleadas } (oleadas: cuántas oleadas cazadoras salen, 1 = todas, 0,75 = un 25 % menos, 0 = ninguna)
  genera(reglas, semilla, datos = {}) {
    const azar = TN.azar(semilla), ad = reglas.trucos.seAdapta;
    const menos = (datos.caidasSeguidas || 0) >= ad.caidasSeguidas ? ad.menosBichos : 0;
    const bichos = TN.mundo.quita(azar, reglas.bichos.reparto.flatMap(z => TN.mundo.bichosDe(reglas, azar, z)), menos);
    const botin = reglas.botin.reparto.flatMap(z => TN.mundo.botinDe(reglas, azar, z));
    return { bichos, botin, gigante: TN.mundo.gigante(reglas, azar), oleadas: 1 - menos };
  },

  // el escenario de la PRIMERA salida de una partida: el mismo sorteo, sin bichos cerca del nido y con unos montones fijos a la vista
  primera(reglas, semilla, datos = {}) {
    const esc = TN.mundo.genera(reglas, semilla, datos), p = reglas.trucos.primeraSalida, n = reglas.mapa.nido;
    return { ...esc, bichos: esc.bichos.filter(b => Math.hypot(b.x - n.x, b.z - n.z) >= p.sinBichosA), botin: p.botin.map(b => ({ ...b })).concat(esc.botin) };
  },

  // un punto libre al azar en una zona ('cerca', 'medio', 'lejos' o un sitio señalado), o null si no lo encuentra
  punto(reglas, azar, donde, radio = 1) {
    for (let i = 0; i < 40; i++) {
      const p = TN.mundo.candidato(reglas, azar, donde);
      if (TN.mundo.vale(reglas, p, donde) && !TN.mapa.choca(reglas, p.x, p.z, radio)) return p;
    }
    return null;
  },
  candidato(reglas, azar, donde) {
    const m = reglas.mapa, s = m.sitios.find(o => o.id === donde), l = m.limite - 1;
    const aro = s ? [0, s.radio] : { cerca: [m.cercaDesde, m.anillos[0]], medio: m.anillos }[donde];
    if (!aro) return { x: azar.entre(-l, l), z: azar.entre(-l, l) };   // lejos: todo el cuadrado (vale() quita lo de dentro)
    const c = s || m.nido, a = azar.entre(0, Math.PI * 2), r = Math.sqrt(azar.entre(aro[0] * aro[0], aro[1] * aro[1]));
    return { x: c.x + Math.cos(a) * r, z: c.z + Math.sin(a) * r };
  },
  // ¿cae en su anillo? (los sitios no miran anillo)
  vale(reglas, p, donde) {
    const anillo = { cerca: 0, medio: 1, lejos: 2 }[donde];
    if (anillo === undefined) return true;
    const n = reglas.mapa.nido, d = Math.hypot(p.x - n.x, p.z - n.z);
    return TN.mapa.anillo(reglas, p.x, p.z) === anillo && d >= reglas.mapa.cercaDesde;
  },

  // los bichos fijos de una zona del reparto
  bichosDe(reglas, azar, zona) {
    const fuera = [];
    for (const n of zona.grupos) fuera.push(...TN.mundo.grupo(reglas, azar, TN.mundo.punto(reglas, azar, zona.donde), n));
    const telas = reglas.mapa.telas.filter(t => t.donde === zona.donde).slice(0, zona.aranas);
    for (const t of telas) fuera.push({ clase: 'arana', x: t.x, z: t.z, tela: { x: t.x, z: t.z, radio: t.radio } });
    for (let i = 0; i < zona.cucarachas; i++) {
      const p = TN.mundo.punto(reglas, azar, zona.donde);
      if (p) fuera.push({ clase: 'cucaracha', x: p.x, z: p.z });
    }
    return fuera;
  },
  // un grupo de n hormigas alrededor de un punto, cada una con su hueco para rodear
  grupo(reglas, azar, p, n) {
    if (!p) return [];
    return Array.from({ length: n }, (_, i) => ({ clase: 'hormiga', x: p.x + azar.entre(-1, 1), z: p.z + azar.entre(-1, 1), hueco: i * 2 * Math.PI / n }));
  },
  // quita una parte de la lista al azar (la dificultad que se adapta)
  quita(azar, lista, parte) {
    const quedan = lista.slice();
    for (let n = Math.round(lista.length * parte); n > 0; n--) quedan.splice(Math.floor(azar.uno() * quedan.length), 1);
    return quedan;
  },

  // los montones de una zona del reparto (con pesos al azar o con su lista fija) y sus pilas, de una en una
  botinDe(reglas, azar, zona) {
    const materiales = zona.lista || Array.from({ length: zona.montones }, () => TN.mundo.pesa(azar, zona.pesos));
    const montones = materiales.map(material => ({ material, cantidad: zona.cantidad }));
    for (let i = 0; i < zona.pilas; i++) montones.push({ material: 'pilas', cantidad: 1 });
    return montones.map(m => ({ ...m, ...TN.mundo.punto(reglas, azar, zona.donde) })).filter(m => Number.isFinite(m.x));
  },
  pesa(azar, pesos) {
    const lista = Object.keys(pesos), total = lista.reduce((s, k) => s + pesos[k], 0);
    let r = azar.uno() * total;
    for (const k of lista) { r -= pesos[k]; if (r < 0) return k; }
    return lista[lista.length - 1];
  },

  // las pisadas del zapato: cada pasada que sale, de su punto de partida al de llegada, alternando a un lado y a otro de la línea
  gigante(reglas, azar) {
    const g = reglas.gigante, fuera = [];
    g.pasadas.forEach((p, i) => {
      if (!azar.pasa(p.prob)) return;
      const t0 = Math.max(g.nuncaAntesDe, azar.entre(p.desde, p.hasta));
      fuera.push(...TN.mundo.pisadas(reglas, p, t0, i));
    });
    return fuera;
  },
  pisadas(reglas, p, t0, pasada) {
    const g = reglas.gigante, n = reglas.mapa.nido;
    const dx = p.a[0] - p.de[0], dz = p.a[1] - p.de[1], largo = Math.hypot(dx, dz), ux = dx / largo, uz = dz / largo;
    const fuera = [];
    for (let i = 0, d = 0; d <= largo; i++, d += g.pisadaCada) {
      const lado = i % 2 ? g.lado : -g.lado;
      const x = p.de[0] + ux * d - uz * lado, z = p.de[1] + uz * d + ux * lado;
      if (Math.hypot(x - n.x, z - n.z) > n.radio + g.radio) fuera.push({ t: t0 + i * g.paso, x, z, pasada });   // nunca pisa el nido
    }
    return fuera;
  },
};
