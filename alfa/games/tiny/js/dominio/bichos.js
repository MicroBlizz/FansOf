// Tiny Fans · dominio · BICHOS: hormiga, araña y cucaracha (puntos dormidos que despiertan fuera de pantalla, persecución, mordisco,
// grupos de hormigas que rodean, la araña que vuelve a su tela, los que calientan los primeros segundos, el primer mordisco perdonado
// y las oleadas cazadoras). Puro: el tiempo y la posición del becario se le pasan. Dueño: N3 (dominio de la expedición).
'use strict';
TN.Bichos = class Bichos {
  #lista = []; #sig = 1;

  // lista: [{ clase, x, z, grupo?, tela? }], dormidos hasta que el becario se acerca
  static nuevos(reglas, lista) {
    const b = new Bichos();
    for (const d of lista) b.#crea(reglas, d, false, false);
    return b;
  }

  #crea(reglas, d, despierto, caza) {
    const c = reglas.bichos.clases[d.clase];
    const b = { id: this.#sig++, clase: d.clase, x: d.x, z: d.z, vida: c.vida, vidaMax: c.vida, despierto, caza, casa: { x: d.x, z: d.z },
      tela: d.tela || null, hueco: d.hueco || 0, espera: 0, toca: false, visto: 0 };
    this.#lista.push(b);
    return b;
  }

  // los que hay en el suelo, en copia: [{ id, clase, x, z, vida, vidaMax, despierto, caza }]
  get lista() {
    return this.#lista.map(b => ({ id: b.id, clase: b.clase, x: b.x, z: b.z, vida: b.vida, vidaMax: b.vidaMax, despierto: b.despierto, caza: b.caza }));
  }
  get despiertos() { return this.#lista.filter(b => b.despierto).length; }
  // a los que se puede disparar: [{ id, x, z }]
  get blancos() { return this.#lista.filter(b => b.despierto).map(b => ({ id: b.id, x: b.x, z: b.z })); }

  // despierta los puntos dormidos que quedan entre `desde` y `hasta` del becario (así nacen fuera de pantalla). Devuelve eventos
  despierta(reglas, bx, bz) {
    const { desde, hasta } = reglas.bichos.despierta, ev = [];
    for (const b of this.#lista) {
      const d = Math.hypot(b.x - bx, b.z - bz);
      if (b.despierto || d < desde || d >= hasta || this.despiertos >= reglas.bichos.tope) continue;
      b.despierto = true;
      ev.push({ tipo: 'bicho-sale', bicho: b.id, clase: b.clase, x: b.x, z: b.z });
    }
    return ev;
  }

  // una oleada cazadora: [{ clase, x, z, hueco }], ya despierta y persiguiendo desde lejos. Devuelve eventos
  agrega(reglas, lista) {
    return lista.map(d => {
      const b = this.#crea(reglas, d, true, true);
      return { tipo: 'bicho-sale', bicho: b.id, clase: b.clase, x: b.x, z: b.z };
    });
  }

  // la oleada que toca a los t segundos (fila de la tabla), o null antes de la primera
  static oleada(reglas, t) {
    const filas = reglas.bichos.oleadas.tabla.filter(f => t >= f.desde);
    return filas.length ? filas[filas.length - 1] : null;
  }

  // mueve a los despiertos hacia el becario (o a su casa). t: segundos desde que salió (calientan)
  mueve(reglas, dt, t, bx, bz) {
    const torpe = t < reglas.trucos.calientan.segundos ? reglas.trucos.calientan.velocidad : 1;
    for (const b of this.#lista) if (b.despierto) this.#mueveUno(reglas, b, dt * torpe, bx, bz);
  }

  #mueveUno(reglas, b, dt, bx, bz) {
    const m = this.#meta(reglas, b, bx, bz), dx = m.x - b.x, dz = m.z - b.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return;
    const paso = Math.min(d, reglas.bichos.clases[b.clase].velocidad * TN.mapa.freno(reglas, b.x, b.z) * dt);
    const p = TN.mapa.mueve(reglas, b.x, b.z, b.x + dx / d * paso, b.z + dz / d * paso, reglas.bichos.radio);
    b.x = p.x; b.z = p.z;
  }

  // adónde va: al becario si caza o lo tiene cerca (las hormigas, a su hueco alrededor), si no a su casa (la araña, a su tela)
  #meta(reglas, b, bx, bz) {
    const d = Math.hypot(b.x - bx, b.z - bz), casa = b.tela || b.casa;
    const lejosDeCasa = b.tela && Math.hypot(bx - casa.x, bz - casa.z) > reglas.bichos.persigue;
    if (lejosDeCasa || (!b.caza && d >= reglas.bichos.persigue)) return casa;
    const r = reglas.bichos.rodea;
    if (b.clase === 'hormiga' && d < r.desde) return { x: bx + Math.cos(b.hueco) * r.radio, z: bz + Math.sin(b.hueco) * r.radio };
    return { x: bx, z: bz };
  }

  // los mordiscos de este paso: [{ bicho, clase, x, z, dano, perdonado }]. aSalvo: el becario está en el felpudo (no muerden)
  muerden(reglas, dt, t, bx, bz, aSalvo) {
    const fuera = [];
    for (const b of this.#lista) {
      if (!b.despierto) continue;
      this.#mira(reglas, b, dt, bx, bz);
      const m = this.#muerde(reglas, b, dt, t, Math.hypot(b.x - bx, b.z - bz) < reglas.bichos.muerde.alcance && !aSalvo);
      if (m) fuera.push(m);
    }
    return fuera;
  }

  // cuánto tiempo lleva a la vista (dentro de lo que enseña la pantalla alrededor del becario)
  #mira(reglas, b, dt, bx, bz) {
    const v = reglas.trucos.vista;
    if (Math.abs(b.x - bx) < v.ancho && Math.abs(b.z - bz) < v.alto) b.visto += dt;
  }

  #muerde(reglas, b, dt, t, toca) {
    const m = reglas.bichos.muerde, cal = reglas.trucos.calientan;
    if (toca && !b.toca) b.espera = Math.max(b.espera, t < cal.segundos ? cal.esperaAtaque : m.primero);
    b.toca = toca;
    b.espera -= dt;
    if (!toca || b.espera > 0) return null;
    b.espera = m.cada;
    const perdonado = reglas.trucos.primerMordiscoGratis && b.visto < reglas.trucos.vista.segundos;
    b.visto = Math.max(b.visto, reglas.trucos.vista.segundos);   // ya lo ha visto: el siguiente sí da
    return { bicho: b.id, clase: b.clase, x: b.x, z: b.z, dano: reglas.bichos.clases[b.clase].dano, perdonado };
  }

  // un golpe de grapa: { muere, bicho: { id, clase, x, z }, vida } o null si ese bicho ya no está
  dana(id, dano) {
    const i = this.#lista.findIndex(b => b.id === id);
    if (i < 0) return null;
    const b = this.#lista[i];
    b.vida = Math.max(0, b.vida - dano);
    if (b.vida <= 0) this.#lista.splice(i, 1);
    return { muere: b.vida <= 0, vida: b.vida, bicho: { id: b.id, clase: b.clase, x: b.x, z: b.z } };
  }
};
