// Fans Of Pets · dominio · CARRERA: lo que la criatura lleva hecho en su etapa, día a día: cuántos días buenos, su estilo de cuidado (aguante,
// juego, cariño), las siestas, y la dimisión (días seguidos al mínimo, la carta con preaviso y las contraofertas). Con eso dice si puede
// ascender y a qué rama de jefe (docs/pets/evoluciones.md, «Ramas al ascender») y si se marcha (docs/pets/diseno.md, «Despedida y dimisión»).
// Es parte del agregado Mascota: solo ella la cambia. Las cifras vienen de PETS.ascenso y PETS.dimision.
'use strict';
PT.Carrera = class Carrera {
  #r; #dias = { buenos: 0, total: 0 }; #estilo = { aguante: 0, juego: 0, carino: 0 }; #siestas = 0;
  #diasMal = 0; #dimision = null; #contraofertas = 0;

  constructor(reglas, j = {}) {
    this.#r = reglas;
    if (j.dias) this.#dias = { buenos: j.dias.buenos || 0, total: j.dias.total || 0 };
    if (j.estilo) this.#estilo = { aguante: j.estilo.aguante || 0, juego: j.estilo.juego || 0, carino: j.estilo.carino || 0 };
    this.#siestas = j.siestas || 0;
    this.#diasMal = j.diasMal || 0;
    this.#dimision = j.dimision ? { dia: j.dimision.dia } : null;
    this.#contraofertas = j.contraofertas || 0;
  }

  aJson() {
    return { dias: { ...this.#dias }, estilo: { ...this.#estilo }, siestas: this.#siestas, diasMal: this.#diasMal, dimision: this.#dimision ? { ...this.#dimision } : null, contraofertas: this.#contraofertas };
  }

  get dias() { return { ...this.#dias }; }
  get estilo() { return { ...this.#estilo }; }
  get siestas() { return this.#siestas; }
  get diasMal() { return this.#diasMal; }
  get dimision() { return this.#dimision ? { ...this.#dimision } : null; }   // { dia }: el día (de la etapa) en que dejó la carta
  get contraofertas() { return this.#contraofertas; }
  get parteBuena() { return this.#dias.total ? this.#dias.buenos / this.#dias.total : 0; }

  // en una etapa nueva se empieza de cero (el estilo se cuenta por etapa; la dimisión y sus contraofertas también)
  static nueva(reglas) { return new Carrera(reglas); }

  // lo que hace el jugador suma a un estilo
  apunta(estilo) { if (estilo in this.#estilo) this.#estilo[estilo]++; }
  apuntaSiesta() { this.#siestas++; }

  // se cierra un día al acostarse. bueno: cuidada casi todo el día; alMinimo: con alguna necesidad a 0 casi todo el día.
  // Devuelve lo que merece contarse: { carta } (deja la carta de dimisión), { convencida } (rompe la carta) o { seMarcha }
  cierraDia({ bueno, alMinimo }) {
    this.#dias.total++;
    if (bueno) this.#dias.buenos++;
    this.#diasMal = alMinimo ? this.#diasMal + 1 : 0;
    if (this.#dimision) return this.#diaConCarta(bueno);
    if (this.#diasMal >= this.#r.dimision.diasSeguidos) {
      this.#dimision = { dia: this.#dias.total };
      return { carta: true };
    }
    return {};
  }
  #diaConCarta(bueno) {
    if (bueno) {   // cuidarla en el preaviso la convence gratis
      this.#dimision = null;
      this.#diasMal = 0;
      return { convencida: true };
    }
    if (this.#dias.total - this.#dimision.dia >= this.#r.dimision.preavisoDias) return { seMarcha: true };
    return {};
  }

  // la contraoferta: con la carta presentada, como mucho PETS.dimision.contraofertas por etapa. Resultado: ok o 'sin-carta' / 'sin-contraofertas'
  contraoferta() {
    if (!this.#dimision) return PT.error('sin-carta');
    if (this.#contraofertas >= this.#r.dimision.contraofertas) return PT.error('sin-contraofertas');
    this.#contraofertas++;
    this.#dimision = null;
    this.#diasMal = 0;
    return PT.ok(this.#contraofertas);
  }

  // ¿puede ascender? Al menos la parte de días buenos que pide PETS.ascenso (y algún día cerrado)
  get puedeAscender() { return this.#dias.total > 0 && this.parteBuena >= this.#r.ascenso.diasBuenos; }

  // la rama del jefe: la siesta (secreta) manda si ha dormido siestas casi todos los días; gamberro si el cuidado fue irregular;
  // si no, el estilo que más se ha cuidado (empate: aguante > juego > cariño)
  get rama() {
    const A = this.#r.ascenso;
    if (this.#dias.total && this.#siestas / this.#dias.total >= A.siestasDesde) return 'siesta';
    if (this.parteBuena < A.gamberroHasta) return 'gamberro';
    const e = this.#estilo;
    if (e.juego > e.aguante && e.juego >= e.carino) return 'creativo';
    if (e.carino > e.aguante && e.carino > e.juego) return 'personas';
    return 'operaciones';
  }
};
