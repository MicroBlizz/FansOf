// Fans Of Pets · dominio · PARTIDA: la raíz de todo lo que se guarda. Lleva la fase (entrevista → huevos → horario → huevo → mascota → ascenso o
// final), el modo de ritmo, la semilla y los huevos, la criatura elegida, el horario de vida, la mascota (PT.Mascota) cuando nace y el álbum
// de las que ya pasaron. Solo cambia por sus métodos, que comprueban la fase y devuelven un resultado; una partida guardada que no vale no se
// carga a medias: da un error y se empieza de cero. El formato guardado (v: 1) es el del prototipo: lo nuevo son campos opcionales, así que
// una partida anterior carga igual (la fase «bebe» de antes es la mascota en su etapa bebé). Las cifras vienen de PETS; el catálogo (PT.criaturas) se le pasa.
'use strict';
PT.Partida = class Partida {
  static FASES = ['entrevista', 'huevos', 'horario', 'huevo', 'mascota', 'ascenso', 'final', 'ritmo'];   // ritmo: tras otro huevo, Lola pregunta solo el ritmo
  #r; #catalogo;   // las reglas (PETS) y el catálogo de criaturas { lista: [{ id, fac, … }], facciones: [...] }
  #fase = 'entrevista'; #ritmo; #semilla = 0; #huevos = []; #criatura = ''; #horario; #huevoDesde = 0; #mascota = null;
  #album = []; #final = null;   // final: { motivo: 'dimision' | 'despedida' } mientras se enseña la carta

  constructor(reglas, catalogo) {
    this.#r = reglas;
    this.#catalogo = catalogo;
    this.#ritmo = reglas.ritmoPorDefecto;
    this.#horario = PT.Horario.crear(reglas.horario, reglas.horario).valor;
  }

  static nueva(reglas, catalogo) { return new Partida(reglas, catalogo); }

  // Resultado: la partida guardada, o un error ('partida-invalida', 'horario-…', 'mascota-invalida', 'criatura-desconocida') si no vale
  static desdeJson(reglas, catalogo, j) {
    if (!j || typeof j !== 'object' || j.v !== 1) return PT.error('partida-invalida');
    const fase = j.fase === 'bebe' ? 'mascota' : j.fase;
    if (!Partida.FASES.includes(fase)) return PT.error('partida-invalida', { fase: j.fase });
    const p = new Partida(reglas, catalogo);
    const error = p.#carga({ ...j, fase });
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
    this.#album = Array.isArray(j.album) ? j.album.map(e => ({ ...e })) : [];
    this.#final = j.final ? { motivo: j.final.motivo } : null;
    if (!['mascota', 'ascenso', 'final'].includes(this.#fase)) return null;
    const m = PT.Mascota.desdeJson(this.#r, this.ritmo, j);
    if (!m.ok) return m;
    this.#mascota = m.valor;
    return null;
  }

  aJson() {
    const j = {
      v: 1, fase: this.#fase, ritmo: this.#ritmo, semilla: this.#semilla, huevos: this.#huevos.slice(), criatura: this.#criatura,
      horario: this.#horario.aJson(), huevoDesde: this.#huevoDesde, album: this.#album.map(e => ({ ...e })), final: this.#final ? { ...this.#final } : null,
    };
    return this.#mascota ? Object.assign(j, this.#mascota.aJson()) : j;
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
  get mascota() { return this.#mascota; }
  get album() { return this.#album.map(e => ({ ...e })); }
  get final() { return this.#final ? { ...this.#final } : null; }
  get eclosionaEn() { return this.#huevoDesde + this.#r.huevoHoras * 60 * PT_MINUTO; }

  // ¿es de día para ella a la hora t? (minutoDelDia pasa de hora a minuto del día)
  esDia(t, minutoDelDia) { return this.#horario.esDia(minutoDelDia(t)); }

  // ─── lo que hace el jugador, en orden de fase ───
  // la pregunta del ritmo: en la entrevista o al pedir otro huevo (fase 'ritmo'); con la criatura en marcha no se cambia.
  // Resultado: ok, o 'fase-equivocada' / 'ritmo-desconocido'
  eligeRitmo(nombre) {
    if (this.#fase !== 'entrevista' && this.#fase !== 'ritmo') return PT.error('fase-equivocada', { fase: this.#fase });
    if (!this.#r.ritmos[nombre]) return PT.error('ritmo-desconocido', { ritmo: nombre });
    this.#ritmo = nombre;
    return PT.ok(nombre);
  }

  // acaba la entrevista: con la semilla salen los huevos misteriosos. Resultado: los huevos, o 'fase-equivocada'
  terminaEntrevista(semilla) {
    if (this.#fase !== 'entrevista') return PT.error('fase-equivocada', { fase: this.#fase });
    this.#sacaHuevos(semilla);
    return PT.ok(this.huevos);
  }
  #sacaHuevos(semilla) {
    this.#semilla = semilla >>> 0;
    this.#huevos = PT.huevos.elige(this.#semilla, this.#catalogo.lista, this.#catalogo.facciones, this.#r.huevos);
    this.#fase = 'huevos';
  }

  // se queda el huevo i. Resultado: la criatura, o 'fase-equivocada' o 'huevo-invalido'
  eligeHuevo(i) {
    if (this.#fase !== 'huevos') return PT.error('fase-equivocada', { fase: this.#fase });
    if (!Number.isInteger(i) || i < 0 || i >= this.#huevos.length) return PT.error('huevo-invalido', { i });
    this.#criatura = this.#huevos[i];
    this.#fase = 'horario';
    return PT.ok(this.criatura);
  }

  // pone o cambia el horario de vida a la hora `ahora`. Si ya hay mascota, lo vivido hasta ahora cuenta con el horario de antes.
  // La primera vez (fase horario) empieza a incubar el huevo. Resultado: el Horario, o el error de PT.Horario o 'fase-equivocada'
  ponHorario(datos, ahora, minutoDelDia) {
    if (this.#fase === 'entrevista' || this.#fase === 'huevos' || this.#fase === 'ritmo') return PT.error('fase-equivocada', { fase: this.#fase });
    const h = PT.Horario.crear(datos, this.#r.horario);
    if (!h.ok) return h;
    if (this.#mascota) this.#mascota.simulaHasta(ahora, this.#horario, minutoDelDia);
    this.#horario = h.valor;
    if (this.#fase === 'horario') {
      this.#fase = 'huevo';
      this.#huevoDesde = ahora;
    }
    return h;
  }

  // simula desde la última vez hasta ahora: la eclosión del huevo y la vida de la mascota. Devuelve lo que ha pasado:
  // { nacio, durmio, desperto, crecio, carta, convencida, seMarcha } (si se marcha, la partida pasa al final con su carta)
  simulaHasta(ahora, minutoDelDia) {
    const pasa = {};
    if (this.#fase === 'huevo' && ahora >= this.eclosionaEn) {   // eclosiona: la mascota empieza a vivir a la hora de la eclosión
      this.#mascota = PT.Mascota.nace(this.#r, this.ritmo, this.eclosionaEn);
      this.#fase = 'mascota';
      pasa.nacio = true;
    }
    if (this.#fase !== 'mascota') return pasa;
    Object.assign(pasa, this.#mascota.simulaHasta(ahora, this.#horario, minutoDelDia));
    if (pasa.seMarcha) this.#termina('dimision');
    return pasa;
  }

  // la mascota se va (dimisión) o la despiden: su carta y al álbum
  #termina(motivo) {
    this.#album.push({ criatura: this.#criatura, etapa: this.#mascota.etapa, resultado: motivo, rama: '', cuando: this.#mascota.ultimo });
    this.#final = { motivo };
    this.#fase = 'final';
  }

  #conMascota(fn) {
    if (this.#fase !== 'mascota') return PT.error('fase-equivocada', { fase: this.#fase });
    return fn(this.#mascota);
  }
  // un cuidado de la mascota. Resultado: el de PT.Mascota, o 'fase-equivocada'
  cuida(tipo) { return this.#conMascota(m => m.cuida(tipo)); }
  // ¿se le puede hacer ese cuidado ahora? Como cuida, sin aplicarlo. Resultado: el de PT.Mascota, o 'fase-equivocada'
  puedeCuidar(tipo) { return this.#conMascota(m => m.puedeCuidar(tipo)); }
  // un minijuego. Resultado: el de PT.Mascota, o 'fase-equivocada'
  juega(id) { return this.#conMascota(m => m.juega(id)); }
  // dormir o despertar a la mascota a la hora `ahora`. Resultado: lo que ha pasado ('dormir', 'despertar', 'noche'), o 'fase-equivocada'
  dormirODespertar(ahora, minutoDelDia) { return this.#conMascota(m => PT.ok(m.dormirODespertar(ahora, this.esDia(ahora, minutoDelDia)))); }
  // la contraoferta ante la carta de dimisión. Resultado: el de PT.Mascota, o 'fase-equivocada'
  contraoferta() { return this.#conMascota(m => m.contraoferta()); }

  // el ascenso a jefe: la mascota adulta con buen cuidado. Resultado: la rama, o 'fase-equivocada' / 'no-puede-ascender'
  asciende() {
    return this.#conMascota(m => {
      const r = m.asciende();
      if (!r.ok) return r;
      this.#album.push({ criatura: this.#criatura, etapa: 'jefe', resultado: 'ascenso', rama: r.valor, cuando: m.ultimo });
      this.#fase = 'ascenso';
      return r;
    });
  }

  // despedirla (desde opciones, con confirmación en la pantalla). Resultado: ok, o 'fase-equivocada'
  despide() {
    return this.#conMascota(() => {
      this.#termina('despedida');
      return PT.ok('despedida');
    });
  }

  // tras el ascenso o el final: otro huevo. Sin repetir la entrevista: Lola pregunta solo el ritmo (fase 'ritmo') y después salen los huevos
  // (huevosNuevos). Resultado: ok, o 'fase-equivocada'
  otroHuevo() {
    if (this.#fase !== 'ascenso' && this.#fase !== 'final') return PT.error('fase-equivocada', { fase: this.#fase });
    this.#mascota = null;
    this.#final = null;
    this.#criatura = '';
    this.#huevoDesde = 0;
    this.#fase = 'ritmo';
    return PT.ok('ritmo');
  }
  // con el ritmo ya elegido, los 3 huevos nuevos con la semilla dada. Resultado: los huevos, o 'fase-equivocada'
  huevosNuevos(semilla) {
    if (this.#fase !== 'ritmo') return PT.error('fase-equivocada', { fase: this.#fase });
    this.#sacaHuevos(semilla);
    return PT.ok(this.huevos);
  }
};
