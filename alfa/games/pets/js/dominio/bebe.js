// Fans Of Pets · dominio · BEBÉ: la criatura recién nacida y sus reglas de vida. Un agregado: por dentro guarda las necesidades, si duerme
// y por qué, cuánto lleva creciendo y hasta cuándo se ha vivido; por fuera solo se cambia con sus métodos (vive minuto a minuto, un
// cuidado, dormir o despertar), y cada uno la deja en un estado válido o no hace nada y devuelve un error con nombre.
// No mira el reloj ni la pantalla: le dan la hora (ms), el horario de vida (PT.Horario) y la función que pasa de hora a minuto del día.
// Las cifras (gasto por hora, noche mala, siesta, cuidados, tope de ausencia) vienen de PETS (ajustes.js); el ritmo, del modo elegido.
'use strict';
const PT_MINUTO = 60000;

PT.Bebe = class Bebe {
  #r; #ritmo;   // las reglas (PETS) y el ritmo { bebeHoras, gasto }
  #nec; #dormida = false; #motivo = ''; #despiertaHasta = 0; #nocheMala = false;
  #crecido = 0; #ultimo; #nacio; #avisoCrecido = false; #siesta = false;

  constructor(reglas, ritmo, estado) {
    this.#r = reglas;
    this.#ritmo = ritmo;
    Object.assign(this, {});   // (nada público que asignar: todo va en campos privados)
    this.#nec = estado.nec;
    this.#nacio = estado.nacio;
    this.#ultimo = estado.ultimo;
    this.#dormida = !!estado.dormida;
    this.#motivo = estado.motivo || '';
    this.#despiertaHasta = estado.despiertaHasta || 0;
    this.#nocheMala = !!estado.nocheMala;
    this.#crecido = estado.crecido || 0;
    this.#avisoCrecido = !!estado.avisoCrecido;
    this.#siesta = !!estado.siesta;
  }

  // nace a la hora t, despierto y con las necesidades de nacer
  static nace(reglas, ritmo, t) {
    const nec = PT.Necesidades.crear(reglas.nacer).valor;
    return new Bebe(reglas, ritmo, { nec, nacio: t, ultimo: t });
  }

  // Resultado: el bebé tal como se guardó, o 'bebe-invalido' si la partida guardada no vale
  static desdeJson(reglas, ritmo, j) {
    const nec = PT.Necesidades.crear(j.nec);
    if (!nec.ok) return nec;
    if (!Number.isFinite(j.nacio) || !Number.isFinite(j.ultimo)) return PT.error('bebe-invalido');
    if (!['', 'noche', 'siesta'].includes(j.motivo || '')) return PT.error('bebe-invalido');
    return PT.ok(new Bebe(reglas, ritmo, { ...j, nec: nec.valor }));
  }

  aJson() {
    return {
      nec: this.#nec.aJson(), nacio: this.#nacio, ultimo: this.#ultimo, crecido: this.#crecido, avisoCrecido: this.#avisoCrecido,
      dormida: this.#dormida, motivo: this.#motivo, despiertaHasta: this.#despiertaHasta, nocheMala: this.#nocheMala, siesta: this.#siesta,
    };
  }

  // lo que se ve desde fuera
  get necesidades() { return this.#nec; }
  get dormida() { return this.#dormida; }
  get motivo() { return this.#motivo; }
  get nocheMala() { return this.#nocheMala; }
  get crecido() { return this.#crecido; }          // minutos que lleva creciendo bien cuidado
  get ultimo() { return this.#ultimo; }            // hasta cuándo se ha vivido (ms)
  get nacio() { return this.#nacio; }
  get siesta() { return this.#siesta; }            // ya lo han despertado de noche alguna vez
  get visibles() { return this.#r.visibles.bebe; }
  get minutosDeBebe() { return this.#ritmo.bebeHoras * 60; }
  get listoParaCrecer() { return this.#crecido >= this.minutosDeBebe; }
  get faltaParaCrecer() { return this.minutosDeBebe - this.#crecido; }
  // crece solo mientras ninguna necesidad visible está por los suelos
  get crece() { return this.#nec.todasAlMenos(this.visibles, this.#r.crecerMinimo); }
  get triste() { return this.#nec.algunaPorDebajo(this.visibles, this.#r.triste); }

  // el aviso de «lista para crecer» se da una sola vez: devuelve true la primera vez que toca darlo
  avisaCrecido() {
    if (!this.listoParaCrecer || this.#avisoCrecido) return false;
    this.#avisoCrecido = true;
    return true;
  }

  // ─── el paso del tiempo ───
  // simula minuto a minuto desde la última vez hasta ahora (con el tope de ausencia). Devuelve lo que merece contarse: { durmio } o { desperto }
  simulaHasta(ahora, horario, minutoDelDia) {
    const tope = this.#r.tiempo.topeHoras * 60 * PT_MINUTO;
    if (ahora - this.#ultimo > tope) this.#ultimo = ahora - tope;   // lo que pase del tope no cuenta
    const antes = this.#dormida;
    let t = this.#ultimo, eraDia = horario.esDia(minutoDelDia(t));
    while (t + PT_MINUTO <= ahora) {
      t += PT_MINUTO;
      eraDia = this.#vive(t, horario.esDia(minutoDelDia(t)), eraDia);
    }
    this.#ultimo = t;
    if (antes === this.#dormida) return {};
    return this.#dormida ? { durmio: true } : { desperto: true };
  }

  // un minuto de vida a la hora t: el sueño según el horario y el gasto de las necesidades. Devuelve si era de día
  #vive(t, dia, eraDia) {
    this.#sueno(t, dia, eraDia);
    this.#nec = this.#nec.gasta(this.#gastoPorMinuto());
    if (this.crece) this.#crecido = Math.min(this.minutosDeBebe, this.#crecido + 1);
    return dia;
  }

  // se acuesta y se levanta con su horario; de noche aguanta despierto un rato; la siesta acaba sola
  #sueno(t, dia, eraDia) {
    const siesta = this.#dormida && this.#motivo === 'siesta';
    if (dia !== eraDia) this.#cambiaElDia(dia, siesta);
    const seAcabaElRato = !this.#despiertaHasta || t >= this.#despiertaHasta;
    if (!dia && !this.#dormida && seAcabaElRato) this.#duerme('noche');
    if (siesta && this.#nec.de('sueno') >= this.#r.siestaHasta) this.#despierta();
  }

  // la hora de acostarse (una siesta larga pasa a ser la noche) o la de levantarse
  #cambiaElDia(dia, siesta) {
    if (!dia) {
      if (!this.#dormida || siesta) this.#duerme('noche');
      return;
    }
    if (this.#dormida && this.#motivo === 'noche') this.#despierta();
    this.#despiertaHasta = 0;
  }

  // cuánto baja cada necesidad en un minuto (dormida: menos, y el sueño se recupera; tras una noche mala, peor)
  #gastoPorMinuto() {
    const porHora = this.#dormida ? this.#r.gastoDormida : this.#r.gastoDespierta;
    const ritmo = this.#dormida ? 1 : this.#ritmo.gasto, mala = this.#dormida && this.#nocheMala;
    const g = {};
    for (const k in porHora) {
      let v = porHora[k] * ritmo;
      if (mala && k === 'sueno') v *= this.#r.nocheMala.sueno;
      if (mala && k === 'hambre') v *= this.#r.nocheMala.hambre;
      g[k] = v / 60;
    }
    return g;
  }

  #duerme(motivo) {
    const u = this.#r.nocheMala.umbral;
    this.#dormida = true;
    this.#motivo = motivo;
    this.#despiertaHasta = 0;
    this.#nocheMala = motivo === 'noche' && this.#nec.algunaPorDebajo(['hambre', 'sed', 'limpieza'], u);
  }

  #despierta() {
    this.#dormida = false;
    this.#motivo = '';
    this.#nocheMala = false;
  }

  // ─── lo que hace el jugador ───
  // un cuidado (comer, beber, bañar). Resultado: ok, o 'durmiendo' o 'llena' (de eso ya no quiere más)
  cuida(tipo) {
    if (this.#dormida) return PT.error('durmiendo');
    const efecto = this.#r.cuidados[tipo];
    if (!efecto) return PT.error('cuidado-desconocido', { tipo });
    const k = Object.keys(efecto)[0];
    if (this.#nec.de(k) >= this.#r.llena) return PT.error('llena', { tipo });
    this.#nec = this.#nec.con(k, efecto[k]);
    return PT.ok(tipo);
  }

  // el botón de dormir o despertar, a la hora `ahora` (esDia: si es de día para ella). Devuelve qué ha pasado:
  // 'dormir' (se duerme: siesta de día, noche si no), 'despertar' (de día) o 'noche' (despertada de noche: un rato en pie, con sueño)
  dormirODespertar(ahora, esDia) {
    if (!this.#dormida) {
      this.#duerme(esDia ? 'siesta' : 'noche');
      return 'dormir';
    }
    this.#despierta();
    if (esDia) return 'despertar';
    this.#despiertaHasta = ahora + this.#r.noche.rato * PT_MINUTO;
    const sueno = this.#nec.de('sueno'), max = this.#r.noche.suenoMax;
    if (sueno > max) this.#nec = this.#nec.con('sueno', max - sueno);
    this.#siesta = true;   // desde ahora se sabe que se puede: la siesta llegará más adelante
    return 'noche';
  }
};
