// Fans Of Pets · dominio · HORARIO de vida: a qué hora se despierta y a qué hora se acuesta la criatura (minutos desde las 0:00).
// Value object: no se puede crear uno que la tenga despierta menos de las horas mínimas ni durmiendo menos de las suyas (PETS.horario).
'use strict';
PT.Horario = class Horario {
  #despierta; #acuesta;

  constructor(despierta, acuesta) {
    this.#despierta = despierta;
    this.#acuesta = acuesta;
    Object.freeze(this);
  }

  // Resultado: el Horario, o 'horario-invalido' (no son minutos del día) o 'horario-corto' (poco tiempo despierta o dormida).
  // limites: { minDespierta, minDuerme } en minutos
  static crear({ despierta, acuesta } = {}, limites) {
    if (!Horario.#esMinutoDelDia(despierta) || !Horario.#esMinutoDelDia(acuesta)) return PT.error('horario-invalido');
    const enPie = (acuesta - despierta + 1440) % 1440;
    if (enPie < limites.minDespierta || 1440 - enPie < limites.minDuerme) {
      return PT.error('horario-corto', { minDespierta: limites.minDespierta, minDuerme: limites.minDuerme });
    }
    return PT.ok(new Horario(despierta, acuesta));
  }

  static #esMinutoDelDia(m) { return Number.isInteger(m) && m >= 0 && m < 1440; }

  get despierta() { return this.#despierta; }
  get acuesta() { return this.#acuesta; }

  // ¿a ese minuto del día (0..1439) está en su horario de vida, es decir, es «de día» para ella?
  esDia(minutoDelDia) {
    const d = this.#despierta, a = this.#acuesta;
    if (d < a) return minutoDelDia >= d && minutoDelDia < a;
    return minutoDelDia >= d || minutoDelDia < a;   // se acuesta pasada la medianoche
  }

  aJson() { return { despierta: this.#despierta, acuesta: this.#acuesta }; }
};
