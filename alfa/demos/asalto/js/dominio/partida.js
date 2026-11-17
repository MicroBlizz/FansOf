// Fans of Asalto · DOMINIO · La partida: la raíz de una bajada a la mazmorra. Guarda la zona, la oleada, el oro, las vidas, el Altar,
// el equipo, las reliquias y los premios por cobrar, y solo cambia por sus métodos: invocar y empujar en el Altar, mover, absorber y
// ascender héroes, salir a luchar, cerrar la oleada con el resultado de la batalla y cobrar los premios. Cada método deja la partida
// válida y devuelve AS.ok(...) o AS.error('codigo'). Fases: 'preparar' → 'batalla' → ('premio') → 'preparar'… y 'fin'.
// Pura: el azar se le pasa en cada método que lo necesita. Las cuentas sueltas están en reglas.js.
'use strict';
AS.Partida = (() => {
  const LLAVE = Symbol('partida');   // solo las fábricas de este archivo pueden crear una partida
  const CUENTA = () => ({ lineas: 0, invocados: 0, ascensos: 0, dorados: 0, nivelMax: 1, bajas: 0, oroGanado: 0, oleadasGanadas: 0, jefes: 0 });
  // la clase que más se repite en unas líneas (para el Animal Dorado)
  function masRepetida(lineas) {
    const n = {};
    for (const l of lineas) n[l.clase] = (n[l.clase] || 0) + 1;
    return Object.keys(n).sort((a, b) => n[b] - n[a])[0];
  }

  class Partida {
    #d; #m; #E; #zona; #sinFin; #n = 0; #fase = 'preparar'; #oro; #vidas; #plumas = 0; #altar = null; #tiradas = 0; #gratis = false; #empujones = 0;
    #equipo; #reliquias = []; #proxima = null; #sigId = 1; #premios = []; #antes = null; #cuenta = CUENTA(); #final = null; #mejoras;

    constructor(llave, datos, cfg) {
      if (llave !== LLAVE) throw new Error('La partida se crea con AS.Partida.nueva o AS.Partida.deJSON');
      this.#d = datos; this.#mejoras = { ...(cfg.mejoras || {}) }; this.#m = AS.reglas.mods(datos, cfg.mejoras); this.#E = cfg.equipo || {};
      this.#zona = cfg.zona; this.#sinFin = !!cfg.sinFin;
      this.#oro = datos.partida.oro + this.#m.oro; this.#vidas = datos.partida.vidas + this.#m.vidas;
      this.#equipo = AS.equipo.vacio(datos, this.#m.abiertos);
    }
    // cfg: { zona, sinFin, mejoras: { corazon: 1… }, equipo: { vida: 5… } (el equipo puesto, en %) }
    static nueva(datos, cfg, azar) {
      if (!cfg || !datos.zonas[cfg.zona]) return AS.error('zona-desconocida');
      const p = new Partida(LLAVE, datos, cfg);
      p.#preparaOleada(1, azar);
      p.#llega(null, 1, false, azar);   // nadie empieza con las manos vacías: un héroe común ya en el campo
      return AS.ok(p);
    }

    /* ---------- lo que la pantalla puede mirar ---------- */
    get zona() { return this.#zona; }
    get sinFin() { return this.#sinFin; }
    get oleada() { return this.#n; }
    get oleadas() { return this.#sinFin ? 0 : this.#d.zonas[this.#zona].oleadas; }
    get fase() { return this.#fase; }
    get oro() { return this.#oro; }
    get vidas() { return this.#vidas; }
    get plumas() { return this.#plumas; }
    get altar() { return this.#altar; }
    get tiradas() { return this.#tiradas; }
    get empujones() { return this.#empujones; }
    get equipo() { return this.#equipo; }
    get reliquias() { return this.#reliquias.slice(); }
    get proxima() { return this.#proxima; }
    get premio() { return this.#premios[0] || null; }
    get final() { return this.#final; }
    get cuenta() { return { ...this.#cuenta }; }
    get puedeDeshacer() { return !!this.#antes && this.#fase === 'preparar'; }
    get sinergias() { return AS.equipo.sinergias(this.#d, this.#equipo); }
    get coste() {
      if (this.#gratis) return 0;
      const r = this.#reliquias;
      return AS.altar.coste(this.#d.altar, this.#tiradas, { rebaja: r.includes('rebaja') ? 1 : 0, gratis: r.includes('gratis') });
    }
    tipoDeOleada(n) { return AS.oleadas.tipo(this.#d, this.#zona, n, this.#sinFin); }

    #preparaOleada(n, azar) {
      this.#n = n; this.#proxima = AS.oleadas.genera(this.#d, this.#zona, n, azar, this.#sinFin);
      this.#tiradas = 0; this.#gratis = false; this.#antes = null; this.#fase = 'preparar';
      this.#empujones = AS.reglas.empujones(this.#d, this.#m, this.#reliquias);
      if (n > 1) this.#oro += AS.reglas.interes(this.#reliquias, this.#oro);
    }
    #apuntaNivel(h) { if (h.nivel > this.#cuenta.nivelMax) this.#cuenta.nivelMax = h.nivel; }

    /* ---------- el Altar ---------- */
    // un héroe nuevo: va a un hueco o al banquillo; si no cabe, lo absorbe el de su mismo tipo (o el de más nivel)
    #llega(clase, nivel, dorado, azar) {
      const d = this.#d;
      let niv = nivel;
      if (!dorado && this.#cuenta.invocados === 0) niv += this.#m.veterano;
      if (!dorado && this.#reliquias.includes('eco') && azar() < 0.25) niv += 1;
      const h = AS.heroe.crea(d, 'h' + (this.#sigId++), AS.reglas.heroeDe(d, clase, this.#m, azar), niv, dorado).valor;
      this.#cuenta.invocados++;
      const r = AS.equipo.recibe(d, this.#equipo, h);
      if (r.ok) { this.#equipo = r.valor; this.#apuntaNivel(h); return { heroe: h, clase, sitio: AS.equipo.sitioDe(r.valor, h.id) }; }
      return this.#funde(h, clase);
    }
    #funde(h, clase) {
      const lista = AS.equipo.todos(this.#equipo).sort((a, b) => b.h.nivel - a.h.nivel);
      const destino = lista.find(x => x.h.tipo === h.tipo) || lista[0];
      const crecido = AS.heroe.absorbe(this.#d, destino.h, h).valor;
      this.#equipo = AS.equipo.pon(this.#equipo, destino.sitio, crecido); this.#apuntaNivel(crecido);
      return { heroe: h, clase, sitio: destino.sitio, fundido: crecido };
    }
    #paga(lineas, azar) {
      const A = this.#d.altar, n = lineas.length, llegados = lineas.map(l => this.#llega(l.clase, 1, false, azar));
      let oroExtra = A.premioLineas[Math.min(n, A.premioLineas.length - 1)], dorado = null;
      if (n >= A.dorado.lineas) { dorado = this.#llega(masRepetida(lineas), A.dorado.nivel, true, azar); oroExtra += A.dorado.oro; this.#cuenta.dorados++; }
      this.#oro += oroExtra; this.#cuenta.lineas += n; this.#antes = null;
      return { lineas, llegados, oroExtra, dorado };
    }
    invoca(azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!AS.equipo.hayHueco(this.#equipo)) return AS.error('sin-sitio');
      const coste = this.coste;
      if (this.#oro < coste) return AS.error('sin-oro', { coste });
      this.#oro -= coste; this.#gratis = false;
      this.#altar = AS.altar.tira(AS.reglas.pesos(this.#d, this.#m, this.#reliquias), azar);
      const primera = this.#tiradas === 0;
      this.#tiradas++;
      const res = this.#paga(AS.altar.lineas(this.#altar), azar);
      if (primera && !res.lineas.length && this.#reliquias.includes('repite')) { this.#gratis = true; res.repite = true; }
      return AS.ok({ ...res, columnas: this.#altar, coste });
    }
    // dir 1: la columna baja (entra la runa que asoma arriba); -1: sube
    empuja(col, dir, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!this.#altar || this.#tiradas === 0) return AS.error('sin-tirada');
      if (this.#empujones <= 0) return AS.error('sin-empujones');
      const r = AS.altar.empuja(this.#altar, col, dir, AS.reglas.pesos(this.#d, this.#m, this.#reliquias), azar);
      if (!r.ok) return r;
      this.#altar = r.valor; this.#empujones--;
      return AS.ok({ ...this.#paga(AS.altar.lineasDeColumna(this.#altar, col), azar), columnas: this.#altar, col, dir });
    }

    /* ---------- el equipo ---------- */
    mueve(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.mueve(this.#equipo, desde, hasta);
      if (!r.ok) return r;
      this.#equipo = r.valor; this.#antes = null;
      return AS.ok(true);
    }
    absorbe(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.absorbe(this.#d, this.#equipo, desde, hasta);
      if (!r.ok) return r;
      this.#antes = this.#equipo; this.#equipo = r.valor.equipo; this.#apuntaNivel(r.valor.heroe);
      return AS.ok(r.valor.heroe);
    }
    deshace() {
      if (!this.puedeDeshacer) return AS.error('nada-que-deshacer');
      this.#equipo = this.#antes; this.#antes = null;
      return AS.ok(true);
    }
    asciende(sitio, clase) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.asciende(this.#d, this.#equipo, sitio, clase);
      if (!r.ok) return r;
      this.#equipo = r.valor.equipo; this.#antes = null; this.#cuenta.ascensos++;
      return AS.ok(r.valor.heroe);
    }

    /* ---------- la oleada ---------- */
    // sale a luchar: devuelve lo que necesita AS.batalla.crea (menos el azar)
    lucha() {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const campo = AS.equipo.enCampo(this.#equipo);
      if (!campo.length) return AS.error('sin-heroes');
      this.#fase = 'batalla'; this.#antes = null;
      const nivel = this.sinergias.nivel, ctx = { equipo: this.#E, reliquias: this.#reliquias, nivel };
      return AS.ok({ datos: this.#d, oleada: this.#proxima, nivel, reliquias: this.#reliquias.slice(),
        heroes: campo.map(({ h, i }) => ({ hueco: i, ref: h.id, cifras: AS.poder.deHeroe(this.#d, h, ctx) })) });
    }
    #gana(ol, azar) {
      const oro = AS.reglas.oroDeGanar(this.#d, ol, this.#reliquias);
      this.#oro += oro; this.#cuenta.oroGanado += oro; this.#cuenta.oleadasGanadas++;
      this.#plumas += this.#sinFin ? this.#d.sinFin.plumasOleada : this.#d.partida.plumasOleada;
      if (ol.tipo === 'jefe') this.#cuenta.jefes++;
      return AS.reglas.premios(this.#d, ol, this.#reliquias, azar);
    }
    // res: AS.batalla.resultado(B). Aplica el oro y las vidas, decide si la partida acaba y prepara la oleada siguiente.
    terminaOleada(res, azar) {
      if (this.#fase !== 'batalla') return AS.error('ahora-no');
      const ol = this.#proxima, perdidas = AS.reglas.vidasPerdidas(this.#d, ol.tipo, res);
      this.#oro += res.oro; this.#cuenta.bajas += res.bajas; this.#cuenta.oroGanado += res.oro;
      this.#vidas = Math.max(0, this.#vidas - perdidas);
      this.#premios = res.gano ? this.#gana(ol, azar) : [];
      if (this.#vidas <= 0 || (!res.gano && ol.tipo !== 'normal')) { this.#final = 'derrota'; this.#premios = []; }
      else if (res.gano && ol.tipo === 'jefe' && !this.#sinFin) this.#final = 'victoria';
      if (!this.#final) this.#preparaOleada(this.#n + 1, azar);
      if (this.#premios.length) this.#fase = 'premio'; else if (this.#final) this.#fase = 'fin';
      return AS.ok({ gano: res.gano, perdidas, tipo: ol.tipo, oleada: ol.n, final: this.#final, premios: this.#premios.slice() });
    }

    /* ---------- los premios ---------- */
    #sigue() {
      this.#premios = this.#premios.slice(1);
      if (!this.#premios.length) this.#fase = this.#final ? 'fin' : 'preparar';
    }
    // el cofre de la oleada de élite o el botín del jefe. doble: con anuncio (solo el cofre)
    cobraCofre(doble) {
      const p = this.premio;
      if (!p || (p.tipo !== 'cofre' && p.tipo !== 'jefe')) return AS.error('sin-premio');
      const k = doble && p.tipo === 'cofre' ? 2 : 1;
      this.#oro += p.oro * k; this.#plumas += p.plumas * k; this.#cuenta.oroGanado += p.oro * k;
      this.#sigue();
      return AS.ok({ oro: p.oro * k, plumas: p.plumas * k, objetos: p.objetos || 0 });
    }
    #toma(id) {
      this.#reliquias.push(id);
      if (id === 'palanca' && this.#fase !== 'fin') this.#empujones++;
    }
    eligeReliquia(id) {
      const p = this.premio;
      if (!p || p.tipo !== 'reliquia') return AS.error('sin-premio');
      if (!p.opciones.includes(id)) return AS.error('no-esta-en-la-oferta');
      this.#toma(id); this.#sigue();
      return AS.ok(id);
    }
    // con anuncio: otras tres, o llevarse las tres
    refrescaReliquias(azar) {
      const p = this.premio;
      if (!p || p.tipo !== 'reliquia') return AS.error('sin-premio');
      const nuevas = AS.reglas.tresReliquias(this.#d, this.#reliquias, azar);
      this.#premios = [{ ...p, opciones: nuevas }, ...this.#premios.slice(1)];
      return AS.ok(nuevas);
    }
    todasLasReliquias() {
      const p = this.premio;
      if (!p || p.tipo !== 'reliquia') return AS.error('sin-premio');
      for (const id of p.opciones) this.#toma(id);
      this.#sigue();
      return AS.ok(p.opciones.slice());
    }

    /* ---------- guardar y cargar (solo entre oleadas) ---------- */
    aJSON() {
      if (this.#fase !== 'preparar') return null;
      return { v: 1, zona: this.#zona, sinFin: this.#sinFin, n: this.#n, oro: this.#oro, vidas: this.#vidas, plumas: this.#plumas, altar: this.#altar, tiradas: this.#tiradas,
        gratis: this.#gratis, empujones: this.#empujones, equipo: this.#equipo, reliquias: this.#reliquias.slice(), sigId: this.#sigId, cuenta: { ...this.#cuenta }, mejoras: { ...this.#mejoras } };
    }
    #carga(j, azar) {
      const d = this.#d, eq = AS.equipo.deJSON(d, { ...j.equipo, abiertos: this.#m.abiertos });
      if (!eq.ok) return eq;
      const num = (v, min) => Number.isFinite(v) && v >= min;
      if (!num(j.n, 1) || !num(j.oro, 0) || !num(j.vidas, 1) || !num(j.sigId, 1)) return AS.error('partida-invalida');
      this.#equipo = eq.valor; this.#reliquias = (j.reliquias || []).filter(r => d.reliquias[r]);
      this.#preparaOleada(Math.floor(j.n), azar);
      this.#oro = Math.floor(j.oro); this.#vidas = Math.floor(j.vidas); this.#plumas = Math.floor(j.plumas) || 0; this.#sigId = Math.floor(j.sigId);
      this.#tiradas = Math.floor(j.tiradas) || 0; this.#gratis = !!j.gratis; this.#empujones = Math.max(0, Math.min(Math.floor(j.empujones) || 0, this.#empujones));
      this.#altar = altarValido(d, j.altar);
      for (const k in this.#cuenta) if (num(j.cuenta && j.cuenta[k], 0)) this.#cuenta[k] = Math.floor(j.cuenta[k]);
      return AS.ok(this);
    }
    // de la partida guardada: una partida entera y válida, o un error (nunca una a medias). equipo = el equipo puesto de ahora
    static deJSON(datos, j, equipo, azar) {
      if (!j || j.v !== 1 || !datos.zonas[j.zona]) return AS.error('partida-invalida');
      return new Partida(LLAVE, datos, { zona: j.zona, sinFin: !!j.sinFin, mejoras: j.mejoras, equipo }).#carga(j, azar);
    }
  }
  // el Altar guardado vale si son 3 columnas de 5 runas conocidas; si no, se empieza sin tirada
  function altarValido(datos, a) {
    const vale = Array.isArray(a) && a.length === 3 && a.every(c => Array.isArray(c) && c.length === 5 && c.every(r => r === AS.altar.COMODIN || datos.clases[r]));
    return vale ? Object.freeze(a.map(c => Object.freeze(c.slice()))) : null;
  }
  return Partida;
})();
