// Fans Of Pets · dominio · PARTIDA: la raíz de todo lo que se guarda. Lleva la fase (entrevista → huevos → horario → huevo → bebé), el modo
// de ritmo, la semilla y los huevos, la criatura elegida, el horario de vida y, cuando nace, el bebé (PT.Bebe). Solo cambia por sus métodos,
// que comprueban la fase y devuelven un resultado; una partida guardada que no vale no se carga a medias: da un error y se empieza de cero.
// El formato guardado (v: 1) es el del prototipo y no cambia; las cifras vienen de PETS y el catálogo de criaturas (PT.criaturas) se le pasa.
'use strict';
PT.Partida = class Partida {
  static FASES = ['entrevista', 'huevos', 'horario', 'huevo', 'bebe'];
  #r; #catalogo;   // las reglas (PETS) y el catálogo de criaturas { lista: [{ id, fac, … }], facciones: [...] }
  #fase = 'entrevista'; #ritmo; #semilla = 0; #huevos = []; #criatura = ''; #horario; #huevoDesde = 0; #bebe = null;

  constructor(reglas, catalogo) {
    this.#r = reglas;
    this.#catalogo = catalogo;
    this.#ritmo = reglas.ritmoPorDefecto;
    this.#horario = PT.Horario.crear(reglas.horario, reglas.horario).valor;
  }

  static nueva(reglas, catalogo) { return new Partida(reglas, catalogo); }

  // Resultado: la partida guardada, o un error ('partida-invalida', 'horario-…', 'bebe-invalido', 'criatura-desconocida') si no vale
  static desdeJson(reglas, catalogo, j) {
    if (!j || typeof j !== 'object' || j.v !== 1) return PT.error('partida-invalida');
    if (!Partida.FASES.includes(j.fase)) return PT.error('partida-invalida', { fase: j.fase });
    const p = new Partida(reglas, catalogo);
    const error = p.#carga(j);
    return error || PT.ok(p);
  }

  // rellena desde el JSON; devuelve el error que lo impida, o nada
  #carga(j) {
    this.#fase = j.fase;
    if (j.ritmo !== undefined) {
      if (!this.#r.ritmos[j.ritmo]) return PT.error('ritmo-desconocido', { ritmo: j.ritmo });
      this.#ritmo = j.ritmo;
    }
    this.#semilla = j.semilla || 0;
    this.#huevos = Array.isArray(j.huevos) ? j.huevos.slice() : [];
    if (j.criatura && !this.#buscaCriatura(j.criatura)) return PT.error('criatura-desconocida', { criatura: j.criatura });   // una criatura que ya no existe: de cero
    this.#criatura = j.criatura || '';
    if (j.horario) {
      const h = PT.Horario.crear(j.horario, this.#r.horario);
      if (!h.ok) return h;
      this.#horario = h.valor;
    }
    this.#huevoDesde = j.huevoDesde || 0;
    if (this.#fase !== 'bebe') return null;
    const b = PT.Bebe.desdeJson(this.#r, this.ritmo, j);
    if (!b.ok) return b;
    this.#bebe = b.valor;
    return null;
  }

  aJson() {
    const j = {
      v: 1, fase: this.#fase, ritmo: this.#ritmo, semilla: this.#semilla, huevos: this.#huevos.slice(), criatura: this.#criatura,
      horario: this.#horario.aJson(), huevoDesde: this.#huevoDesde,
    };
    return this.#bebe ? Object.assign(j, this.#bebe.aJson()) : j;
  }

  #buscaCriatura(id) { return this.#catalogo.lista.find(c => c.id === id) || null; }

  get fase() { return this.#fase; }
  get nombreRitmo() { return this.#ritmo; }
  get ritmo() { return this.#r.ritmos[this.#ritmo]; }
  get semilla() { return this.#semilla; }
  get huevos() { return this.#huevos.slice(); }
  get criatura() { return this.#buscaCriatura(this.#criatura); }
  get horario() { return this.#horario; }
  get huevoDesde() { return this.#huevoDesde; }
  get bebe() { return this.#bebe; }
  get eclosionaEn() { return this.#huevoDesde + this.#r.huevoHoras * 60 * PT_MINUTO; }

  // ¿es de día para ella a la hora t? (minutoDelDia pasa de hora a minuto del día)
  esDia(t, minutoDelDia) { return this.#horario.esDia(minutoDelDia(t)); }

  // ─── lo que hace el jugador, en orden de fase ───
  // en la entrevista, la pregunta del ritmo. Resultado: ok o 'ritmo-desconocido'
  eligeRitmo(nombre) {
    if (!this.#r.ritmos[nombre]) return PT.error('ritmo-desconocido', { ritmo: nombre });
    this.#ritmo = nombre;
    return PT.ok(nombre);
  }

  // acaba la entrevista: con la semilla salen los huevos misteriosos. Resultado: los huevos, o 'fase-equivocada'
  terminaEntrevista(semilla) {
    if (this.#fase !== 'entrevista') return PT.error('fase-equivocada', { fase: this.#fase });
    this.#semilla = semilla >>> 0;
    this.#huevos = PT.huevos.elige(this.#semilla, this.#catalogo.lista, this.#catalogo.facciones, this.#r.huevos);
    this.#fase = 'huevos';
    return PT.ok(this.huevos);
  }

  // se queda el huevo i. Resultado: la criatura, o 'fase-equivocada' o 'huevo-invalido'
  eligeHuevo(i) {
    if (this.#fase !== 'huevos') return PT.error('fase-equivocada', { fase: this.#fase });
    if (!Number.isInteger(i) || i < 0 || i >= this.#huevos.length) return PT.error('huevo-invalido', { i });
    this.#criatura = this.#huevos[i];
    this.#fase = 'horario';
    return PT.ok(this.criatura);
  }

  // pone o cambia el horario de vida a la hora `ahora`. Si ya hay bebé, lo vivido hasta ahora cuenta con el horario de antes.
  // La primera vez (fase horario) empieza a incubar el huevo. Resultado: el Horario, o el error de PT.Horario o 'fase-equivocada'
  ponHorario(datos, ahora, minutoDelDia) {
    if (this.#fase === 'entrevista' || this.#fase === 'huevos') return PT.error('fase-equivocada', { fase: this.#fase });
    const h = PT.Horario.crear(datos, this.#r.horario);
    if (!h.ok) return h;
    if (this.#bebe) this.#bebe.simulaHasta(ahora, this.#horario, minutoDelDia);
    this.#horario = h.valor;
    if (this.#fase === 'horario') {
      this.#fase = 'huevo';
      this.#huevoDesde = ahora;
    }
    return h;
  }

  // simula desde la última vez hasta ahora: la eclosión del huevo y la vida del bebé. Devuelve lo que ha pasado: { nacio, durmio, desperto }
  simulaHasta(ahora, minutoDelDia) {
    const pasa = {};
    if (this.#fase === 'huevo' && ahora >= this.eclosionaEn) {   // eclosiona: el bebé empieza a vivir a la hora de la eclosión
      this.#bebe = PT.Bebe.nace(this.#r, this.ritmo, this.eclosionaEn);
      this.#fase = 'bebe';
      pasa.nacio = true;
    }
    if (!this.#bebe) return pasa;
    return Object.assign(pasa, this.#bebe.simulaHasta(ahora, this.#horario, minutoDelDia));
  }

  // un cuidado del bebé. Resultado: el de PT.Bebe, o 'fase-equivocada'
  cuida(tipo) {
    if (!this.#bebe) return PT.error('fase-equivocada', { fase: this.#fase });
    return this.#bebe.cuida(tipo);
  }

  // dormir o despertar al bebé a la hora `ahora`. Resultado: lo que ha pasado ('dormir', 'despertar', 'noche'), o 'fase-equivocada'
  dormirODespertar(ahora, minutoDelDia) {
    if (!this.#bebe) return PT.error('fase-equivocada', { fase: this.#fase });
    return PT.ok(this.#bebe.dormirODespertar(ahora, this.esDia(ahora, minutoDelDia)));
  }

  // solo DEV: cambia la criatura sin repetir la entrevista. Resultado: la criatura, o 'criatura-desconocida'
  cambiaCriatura(id) {
    if (!this.#buscaCriatura(id)) return PT.error('criatura-desconocida', { criatura: id });
    this.#criatura = id;
    return PT.ok(this.criatura);
  }
};
