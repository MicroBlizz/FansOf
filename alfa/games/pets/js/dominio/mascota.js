// Fans Of Pets · dominio · MASCOTA: la criatura desde que nace hasta que asciende, y sus reglas de vida. Un agregado: por dentro guarda la
// etapa, las necesidades, si duerme y por qué, cuánto lleva creciendo, el día en curso, las chucherías y su carrera (PT.Carrera); por fuera
// solo se cambia con sus métodos (vive minuto a minuto, un cuidado, dormir o despertar, un minijuego, la contraoferta), y cada uno la deja
// en un estado válido o no hace nada y devuelve un error con nombre. No mira el reloj ni la pantalla: le dan la hora (ms), el horario de
// vida (PT.Horario) y la función que pasa de hora a minuto del día. Las cifras vienen de PETS (ajustes.js); el ritmo, del modo elegido.
'use strict';
const PT_MINUTO = 60000;

PT.Mascota = class Mascota {
  #r; #ritmo;   // las reglas (PETS) y el ritmo { horas: { etapa: h }, gasto }
  #etapa = 'bebe'; #nec; #dormida = false; #motivo = ''; #despiertaHasta = 0; #nocheMala = false;
  #crecido = 0; #ultimo; #nacio; #avisoCrecido = false; #siesta = false;
  #hoy = { despierta: 0, mal: 0, alMinimo: 0, chuches: 0, jugadas: 0, siesta: false };   // el día en curso, en minutos (se cierra al acostarse)
  #empachoHasta = 0; #carrera; #rama = '';   // rama: la del jefe, cuando asciende

  constructor(reglas, ritmo, estado) {
    this.#r = reglas;
    this.#ritmo = ritmo;
    this.#etapa = estado.etapa || 'bebe';
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
    if (estado.hoy) this.#hoy = { ...this.#hoy, ...estado.hoy };
    this.#empachoHasta = estado.empachoHasta || 0;
    this.#carrera = new PT.Carrera(reglas, estado.carrera || {});
    this.#rama = estado.rama || '';
  }

  // nace a la hora t, despierta y con las necesidades de nacer
  static nace(reglas, ritmo, t) {
    const nec = PT.Necesidades.crear(reglas.nacer).valor;
    return new Mascota(reglas, ritmo, { nec, nacio: t, ultimo: t });
  }

  // Resultado: la mascota tal como se guardó, o 'mascota-invalida' si la partida guardada no vale
  static desdeJson(reglas, ritmo, j) {
    const nec = PT.Necesidades.crear(j.nec);
    if (!nec.ok) return nec;
    if (!Number.isFinite(j.nacio) || !Number.isFinite(j.ultimo)) return PT.error('mascota-invalida');
    if (!['', 'noche', 'siesta'].includes(j.motivo || '')) return PT.error('mascota-invalida');
    if (j.etapa && !reglas.etapas.includes(j.etapa)) return PT.error('mascota-invalida', { etapa: j.etapa });
    return PT.ok(new Mascota(reglas, ritmo, { ...j, nec: nec.valor }));
  }

  aJson() {
    return {
      etapa: this.#etapa, nec: this.#nec.aJson(), nacio: this.#nacio, ultimo: this.#ultimo, crecido: this.#crecido, avisoCrecido: this.#avisoCrecido,
      dormida: this.#dormida, motivo: this.#motivo, despiertaHasta: this.#despiertaHasta, nocheMala: this.#nocheMala, siesta: this.#siesta,
      hoy: { ...this.#hoy }, empachoHasta: this.#empachoHasta, carrera: this.#carrera.aJson(), rama: this.#rama,
    };
  }

  // ─── lo que se ve desde fuera ───
  get etapa() { return this.#etapa; }
  get necesidades() { return this.#nec; }
  get dormida() { return this.#dormida; }
  get motivo() { return this.#motivo; }
  get nocheMala() { return this.#nocheMala; }
  get crecido() { return this.#crecido; }          // minutos que lleva creciendo bien cuidada en esta etapa
  get ultimo() { return this.#ultimo; }            // hasta cuándo se ha vivido (ms)
  get nacio() { return this.#nacio; }
  get siesta() { return this.#siesta; }            // ya la han despertado de noche alguna vez: la siesta está desbloqueada
  get carrera() { return this.#carrera; }
  get rama() { return this.#rama; }                // la rama del jefe al que ha ascendido ('' hasta entonces)
  get hoy() { return { ...this.#hoy }; }
  get visibles() { return this.#r.visibles[this.#etapa]; }
  get cuidados() { return this.#r.desbloquea[this.#etapa]; }
  get minijuegos() { return this.#r.etapas.slice(0, this.#r.etapas.indexOf(this.#etapa) + 1).flatMap(e => this.#r.minijuegos[e]); }
  get minutosDeEtapa() { return this.#ritmo.horas[this.#etapa] * 60; }
  get listaParaCrecer() { return this.#crecido >= this.minutosDeEtapa; }
  get faltaParaCrecer() { return this.minutosDeEtapa - this.#crecido; }
  get esAdulta() { return this.#etapa === 'adulto'; }
  get empachada() { return this.#ultimo < this.#empachoHasta; }
  // crece solo mientras ninguna necesidad visible está por los suelos
  get crece() { return this.#nec.todasAlMenos(this.visibles, this.#r.crecerMinimo); }
  get triste() { return this.#nec.algunaPorDebajo(this.visibles, this.#r.triste); }
  // una adulta con buen cuidado asciende al terminar su etapa; si no llega, sigue de adulta hasta conseguirlo
  get puedeAscender() { return this.esAdulta && this.listaParaCrecer && this.#carrera.puedeAscender; }

  // el aviso de «lista para crecer» (o ascender) se da una sola vez por etapa: true la primera vez que toca darlo
  avisaCrecido() {
    if (!this.listaParaCrecer || this.#avisoCrecido) return false;
    this.#avisoCrecido = true;
    return true;
  }

  // ─── el paso del tiempo ───
  // simula minuto a minuto desde la última vez hasta ahora (con el tope de ausencia). Devuelve lo que merece contarse:
  // { durmio } o { desperto }, { crecio: etapa } si ha pasado de etapa, y lo de la carrera ({ carta }, { convencida }, { seMarcha })
  simulaHasta(ahora, horario, minutoDelDia) {
    const tope = this.#r.tiempo.topeHoras * 60 * PT_MINUTO;
    if (ahora - this.#ultimo > tope) this.#ultimo = ahora - tope;   // lo que pase del tope no cuenta
    const antes = this.#dormida, pasa = {};
    let t = this.#ultimo, eraDia = horario.esDia(minutoDelDia(t));
    while (t + PT_MINUTO <= ahora) {
      t += PT_MINUTO;
      eraDia = this.#vive(t, horario.esDia(minutoDelDia(t)), eraDia, pasa);
    }
    this.#ultimo = t;
    if (antes !== this.#dormida) pasa[this.#dormida ? 'durmio' : 'desperto'] = true;
    return pasa;
  }

  // un minuto de vida a la hora t: el sueño según el horario, el gasto de las necesidades, el día en curso y el crecimiento. Devuelve si era de día
  #vive(t, dia, eraDia, pasa) {
    this.#sueno(t, dia, eraDia, pasa);
    this.#nec = this.#nec.gasta(this.#gastoPorMinuto());
    if (this.#dormida) this.#nec = this.#nec.alMenos(this.visibles, this.#r.sueloDormida);   // la noche no la deja en rojo
    this.#apuntaElMinuto();
    if (this.crece && !this.listaParaCrecer) this.#crecido++;
    if (this.listaParaCrecer && !this.esAdulta) pasa.crecio = this.#creceDeEtapa();
    return dia;
  }

  #apuntaElMinuto() {
    if (this.#dormida) return;
    this.#hoy.despierta++;
    if (!this.crece) this.#hoy.mal++;
    if (this.#nec.algunaPorDebajo(this.visibles, 1)) this.#hoy.alMinimo++;
  }

  // se acuesta y se levanta con su horario; de noche aguanta despierta un rato; la siesta acaba sola
  #sueno(t, dia, eraDia, pasa) {
    const siesta = this.#dormida && this.#motivo === 'siesta';
    if (dia !== eraDia) this.#cambiaElDia(dia, siesta, pasa);
    const seAcabaElRato = !this.#despiertaHasta || t >= this.#despiertaHasta;
    if (!dia && !this.#dormida && seAcabaElRato) this.#duerme('noche');
    if (siesta && this.#nec.de('sueno') >= this.#r.siestaHasta) this.#despierta();
  }

  // la hora de acostarse (una siesta larga pasa a ser la noche; se cierra el día) o la de levantarse
  #cambiaElDia(dia, siesta, pasa) {
    if (!dia) {
      if (!this.#dormida || siesta) this.#duerme('noche');
      Object.assign(pasa, this.#cierraElDia());
      return;
    }
    if (this.#dormida && this.#motivo === 'noche') this.#despierta();
    this.#despiertaHasta = 0;
  }

  // el día se cierra al acostarse: bueno si ha estado descuidada poco rato; al mínimo si alguna necesidad ha estado a 0 casi todo el día
  #cierraElDia() {
    const h = this.#hoy, D = this.#r.dia, despierta = Math.max(1, h.despierta);
    if (h.siesta) this.#carrera.apuntaSiesta();
    const pasa = this.#carrera.cierraDia({ bueno: h.mal / despierta <= D.buenoHasta, alMinimo: h.alMinimo / despierta >= D.alMinimoDesde });
    this.#hoy = { despierta: 0, mal: 0, alMinimo: 0, chuches: 0, jugadas: 0, siesta: false };
    return pasa;
  }

  // pasa a la etapa siguiente: empieza a contar de cero (crecimiento, aviso, día y carrera)
  #creceDeEtapa() {
    const E = this.#r.etapas;
    this.#etapa = E[E.indexOf(this.#etapa) + 1];
    this.#crecido = 0;
    this.#avisoCrecido = false;
    this.#carrera = PT.Carrera.nueva(this.#r);
    return this.#etapa;
  }

  // cuánto baja cada necesidad visible en un minuto (dormida: menos, y el sueño se recupera; tras una noche mala o con empacho, peor)
  #gastoPorMinuto() {
    const porHora = this.#dormida ? this.#r.gastoDormida : this.#r.gastoDespierta;
    const ritmo = this.#dormida ? 1 : this.#ritmo.gasto, mala = this.#dormida && this.#nocheMala;
    const g = {};
    for (const k of this.visibles) {
      let v = (porHora[k] || 0) * ritmo;
      if (mala && k === 'sueno') v *= this.#r.nocheMala.sueno;
      if (mala && k === 'hambre') v *= this.#r.nocheMala.hambre;
      if (this.#dormida && this.empachada && k === 'sueno') v *= this.#r.chuches.suenoEmpacho;
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
  // un cuidado (comer, beber, bañar, el aseo, una chuchería). Resultado: ok, o 'durmiendo', 'llena' (de eso ya no quiere más),
  // 'no-desbloqueado' (aún no toca en esta etapa), 'empacho' (no quiere comida de verdad) o 'muchas-chuches' (hoy ya no más)
  cuida(tipo) {
    if (this.#dormida) return PT.error('durmiendo');
    const efecto = this.#r.cuidados[tipo];
    if (!efecto || tipo === 'jugar') return PT.error('cuidado-desconocido', { tipo });
    if (!this.cuidados.includes(tipo)) return PT.error('no-desbloqueado', { tipo });
    const k = Object.keys(efecto)[0];
    if (this.#nec.de(k) >= this.#r.llena) return PT.error('llena', { tipo });
    if (tipo === 'comer' && this.empachada) return PT.error('empacho');
    if (tipo === 'chuche' && this.#hoy.chuches >= this.#r.chuches.topeDia) return this.#empacha();
    for (const n in efecto) this.#nec = this.#nec.con(n, efecto[n]);
    this.#apuntaElCuidado(tipo);
    return PT.ok(tipo);
  }
  #empacha() {
    this.#hoy.chuches++;
    this.#empachoHasta = this.#ultimo + this.#r.chuches.empachoHoras * 60 * PT_MINUTO;
    return PT.error('muchas-chuches');
  }
  #apuntaElCuidado(tipo) {
    this.#carrera.apunta('carino');
    if (tipo === 'comer' || tipo === 'beber') this.#carrera.apunta('aguante');
    if (tipo === 'chuche') this.#hoy.chuches++;
  }

  // un minijuego: diversión y estilo de juego, hasta el tope del día. Resultado: ok, o 'durmiendo', 'no-desbloqueado' o 'muchas-jugadas'
  juega(id) {
    if (this.#dormida) return PT.error('durmiendo');
    if (!this.minijuegos.some(m => m.id === id)) return PT.error('no-desbloqueado', { id });
    if (this.#hoy.jugadas >= this.#r.jugadasDia) return PT.error('muchas-jugadas');
    this.#hoy.jugadas++;
    this.#nec = this.#nec.con('diversion', this.#r.cuidados.jugar.diversion);
    this.#carrera.apunta('juego');
    this.#carrera.apunta('carino');
    return PT.ok(id);
  }

  // el botón de dormir o despertar, a la hora `ahora` (esDia: si es de día para ella). Devuelve qué ha pasado:
  // 'dormir' (se duerme: siesta de día, noche si no), 'despertar' (de día) o 'noche' (despertada de noche: un rato en pie, con sueño)
  dormirODespertar(ahora, esDia) {
    if (!this.#dormida) {
      this.#duerme(esDia ? 'siesta' : 'noche');
      if (esDia) this.#hoy.siesta = true;
      return 'dormir';
    }
    this.#despierta();
    if (esDia) return 'despertar';
    this.#despiertaHasta = ahora + this.#r.noche.rato * PT_MINUTO;
    const sueno = this.#nec.de('sueno'), max = this.#r.noche.suenoMax;
    if (sueno > max) this.#nec = this.#nec.con('sueno', max - sueno);
    this.#siesta = true;   // desde ahora se sabe que se puede: la siesta queda desbloqueada
    return 'noche';
  }

  // la contraoferta ante la carta de dimisión: se queda y repone algo las necesidades. Resultado: el de PT.Carrera
  contraoferta() {
    const r = this.#carrera.contraoferta();
    if (!r.ok) return r;
    for (const k of this.visibles) if (this.#nec.de(k) < this.#r.dimision.repone) this.#nec = this.#nec.con(k, this.#r.dimision.repone - this.#nec.de(k));
    return r;
  }

  // el ascenso a jefe: la rama queda fijada. Resultado: la rama, o 'no-puede-ascender'
  asciende() {
    if (!this.puedeAscender) return PT.error('no-puede-ascender');
    this.#rama = this.#carrera.rama;
    return PT.ok(this.#rama);
  }
};
