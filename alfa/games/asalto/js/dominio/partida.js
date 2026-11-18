// Fans of Asalto · DOMINIO · La partida: la raíz de una bajada a la mazmorra. Guarda la zona, la oleada, el oro, las vidas, el Altar,
// el equipo, las reliquias, la racha, las misiones y los premios por cobrar, y solo cambia por sus métodos: invocar y empujar en el Altar, mover, absorber y
// ascender héroes, el Estallido de la segunda máquina, salir a luchar, cerrar la oleada con el resultado de la batalla y cobrar los premios. Cada método deja la partida
// válida y devuelve AS.ok(...) o AS.error('codigo'). Fases: 'preparar' → 'batalla' → ('premio') → 'preparar'… y 'fin'.
// Pura: el azar se le pasa en cada método que lo necesita. Las cuentas sueltas están en reglas.js y la lectura de la partida guardada, en guardado.js.
'use strict';
AS.Partida = (() => {
  const LLAVE = Symbol('partida');   // solo las fábricas de este archivo pueden crear una partida

  class Partida {
    #d; #m; #E; #zona; #sinFin; #n = 0; #fase = 'preparar'; #oro; #vidas; #plumas = 0; #altar = null; #tiradas = 0; #gratis = false; #empujones = 0;
    #equipo; #reliquias = []; #proxima = null; #sigId = 1; #premios = []; #antes = null; #cuenta = AS.guardado.CUENTA(); #final = null; #mejoras; #rarezas = 0;
    #guiada = false; #racha = 0; #fallos = 0; #misiones = []; #escalones = {}; #avisos = []; #esencia = 0; #tienda = null; #piedras = AS.piedras.vacio(); #vivo = false; #anuncios = AS.anuncios.vacio();
    #maquina; #dif; #estallidos = 0;

    constructor(llave, datos, cfg) {
      if (llave !== LLAVE) throw new Error('La partida se crea con AS.Partida.nueva o AS.Partida.deJSON');
      this.#d = datos; this.#mejoras = { ...(cfg.mejoras || {}) }; this.#rarezas = Math.floor(cfg.rarezas) || 0; this.#m = AS.reglas.mods(datos, cfg.mejoras, this.#rarezas); this.#E = cfg.equipo || {};
      this.#zona = cfg.zona; this.#sinFin = !!cfg.sinFin; this.#guiada = !!cfg.guiada;
      this.#maquina = AS.guardado.maquina(datos, cfg.maquina); this.#dif = AS.guardado.dificultad(datos, cfg.dificultad, this.#sinFin);
      this.#oro = datos.partida.oro + this.#m.oro; this.#vidas = datos.partida.vidas + this.#m.vidas;
      this.#equipo = AS.equipo.vacio(datos, this.#m.abiertos);
    }
    // cfg: { zona, sinFin, guiada (la primera partida, con la mano), maquina ('altar' o 'estallido'), dificultad (0, 1 o 2), mejoras: { corazon: 1… },
    // rarezas (cuántas hay abiertas), equipo: { vida: 5… } (el equipo puesto, en %) }
    static nueva(datos, cfg, azar) {
      if (!cfg || !datos.zonas[cfg.zona]) return AS.error('zona-desconocida');
      const p = new Partida(LLAVE, datos, cfg);
      p.#preparaOleada(1, azar);
      p.#misiones = AS.misiones.elige(datos, azar, p.#guiada);
      p.#llega(null, 1, false, azar);   // nadie empieza con las manos vacías: un héroe común ya en el campo
      p.#tienda = AS.tienda.nueva(datos, azar);
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
    get fallos() { return this.#fallos; }
    get mods() { return this.#m; }   // para el panel de suerte
    get maquina() { return this.#maquina; }
    get dificultad() { return this.#dif; }
    get estallidos() { return this.#estallidos; }   // los Estallidos que quedan en esta oleada (solo en su máquina)
    get equipo() { return this.#equipo; }
    get esencia() { return this.#esencia; }
    get tienda() { return this.#tienda; }
    // las piedras de destino: la misión en marcha (o null), las de la bolsa y hasta qué rareza pueden subir (las abiertas)
    get piedras() { return { mision: AS.piedras.progreso(this.#d, this.#piedras, this.#n, this.#cuenta), bolsa: this.#piedras.bolsa, abiertas: this.#m.rarezas }; }
    get altarVivo() { return this.#vivo; }   // ¿hay en el Altar una tirada de esta oleada (se puede empujar)?
    get costeCambio() { return AS.tienda.costeCambio(this.#d, this.#tienda); }
    // lo que cuenta para las cifras de un héroe, menos las clases activas del campo
    get contexto() { return { equipo: this.#E, reliquias: this.#reliquias.slice(), objetos: this.#tienda.objetos }; }
    get reliquias() { return this.#reliquias.slice(); }
    get proxima() { return this.#proxima; }
    get premio() { return this.#premios[0] || null; }
    get final() { return this.#final; }
    get cuenta() { return { ...this.#cuenta }; }
    get guiada() { return this.#guiada; }
    get racha() { return this.#racha; }
    get misiones() { return AS.misiones.estado(this.#d, this.#misiones, this.#escalones, this.#cuenta); }
    get puedeDeshacer() { return !!this.#antes && this.#fase === 'preparar'; }
    get sinergias() { return AS.equipo.sinergias(this.#d, this.#equipo); }
    get coste() {
      if (this.#gratis) return 0;
      const r = this.#reliquias;
      return AS.altar.coste(this.#d.altar, this.#tiradas, { rebaja: r.includes('rebaja') ? 1 : 0, gratis: r.includes('gratis') });
    }
    tipoDeOleada(n) { return AS.oleadas.tipo(this.#d, this.#zona, n, this.#sinFin); }

    #preparaOleada(n, azar) {
      this.#n = n; this.#proxima = AS.oleadas.genera(this.#d, this.#zona, n, azar, this.#sinFin, this.#dif);
      this.#aPreparar();
      if (n > 1) this.#oro += AS.reglas.interes(this.#reliquias, this.#oro);
    }
    // vuelta a preparar: el Altar empieza de cero (coste de salida, empujones nuevos). Es también lo que pasa al repetir una oleada perdida:
    // la misma oleada, con los mismos enemigos, y se puede invocar antes de volver a salir
    #aPreparar() {
      this.#tiradas = 0; this.#gratis = false; this.#vivo = false; this.#antes = null; this.#fase = 'preparar';
      this.#empujones = AS.reglas.empujones(this.#d, this.#m, this.#reliquias, this.#maquina); this.#estallidos = AS.reglas.estallidos(this.#d, this.#maquina);
    }
    #apuntaNivel(h) { if (h.nivel > this.#cuenta.nivelMax) this.#cuenta.nivelMax = h.nivel; }

    /* ---------- el Altar ---------- */
    // un héroe nuevo: va a un hueco o al banquillo; si no cabe, lo absorbe el de su mismo tipo (o el de más nivel)
    #llega(clase, nivel, dorado, azar, piedra) {
      const d = this.#d;
      let niv = nivel;
      if (!dorado && this.#cuenta.invocados === 0) niv += this.#m.veterano;
      if (!dorado && this.#reliquias.includes('eco') && azar() < 0.25) niv += 1;
      const tipo = AS.reglas.heroeDe(d, clase, this.#m, azar), base = clase ? AS.reglas.rarezaDe(d, this.#m, azar) : 0;   // el del arranque (sin clase) es Común
      const rareza = piedra ? AS.piedras.rareza(d, this.#m.rarezas, base, piedra) : base;
      const h = AS.heroe.conCifras(d, AS.heroe.crea(d, 'h' + (this.#sigId++), tipo, niv, dorado, rareza).valor, AS.reglas.cifrasDe(d, azar)).valor;
      this.#cuenta.invocados++;
      const r = AS.equipo.recibe(d, this.#equipo, h);
      if (r.ok) { this.#equipo = r.valor; this.#apuntaNivel(h); return { heroe: h, clase, sitio: AS.equipo.sitioDe(r.valor, h.id) }; }
      return this.#funde(h, clase);
    }
    #funde(h, clase) {
      const f = AS.equipo.funde(this.#d, this.#equipo, h);
      this.#equipo = f.equipo; this.#apuntaNivel(f.crecido);
      return { heroe: h, clase, sitio: f.sitio, fundido: f.crecido };
    }
    // piedra: la de la tirada de piedra (sube la rareza de los que llegan con las líneas; al Animal Dorado no)
    #paga(lineas, azar, rompe, piedra) {
      const A = this.#d.altar, n = lineas.length, llegados = lineas.map(l => this.#llega(l.clase, 1, false, azar, piedra));
      let oroExtra = A.premioLineas[Math.min(n, A.premioLineas.length - 1)], dorado = null;
      if (n >= A.dorado.lineas) { dorado = this.#llega(AS.altar.masRepetida(lineas), A.dorado.nivel, true, azar); oroExtra += A.dorado.oro; this.#cuenta.dorados++; }
      this.#oro += oroExtra; this.#cuenta.lineas += n; this.#antes = null;
      if (n >= 2) this.#cuenta.dobles++;
      return { lineas, llegados, oroExtra, dorado, ...this.#encadena(n > 0, rompe) };
    }
    // la racha: cada invocación (o empujón) seguida con línea la sube y da su oro; una invocación sin línea la corta (rompe = false en el empujón)
    #encadena(hubo, rompe) {
      const R = this.#d.altar.racha;
      if (hubo) this.#racha++; else if (rompe !== false) this.#racha = 0;
      const oroRacha = hubo ? R[Math.min(this.#racha, R.length - 1)] : 0;
      this.#oro += oroRacha; this.#cuenta.oroGanado += oroRacha;
      if (this.#racha > this.#cuenta.rachaMax) this.#cuenta.rachaMax = this.#racha;
      return { racha: this.#racha, oroRacha };
    }
    // las misiones que se acaban de cumplir se cobran solas y dejan un aviso para la pantalla
    #cobraMisiones() {
      for (let e = this.#pendiente(); e; e = this.#pendiente()) {
        this.#escalones[e.id] = e.escalon + 1;
        this.#oro += e.oro; this.#plumas += e.plumas; this.#cuenta.oroGanado += e.oro;
        this.#avisos.push({ tipo: 'mision', id: e.id, meta: e.meta, oro: e.oro, plumas: e.plumas });
      }
      this.#revisaPiedra();
    }
    // la misión de piedra: cumplida (su piedra a la bolsa) o caducada, con su aviso
    #revisaPiedra() {
      const r = AS.piedras.revisa(this.#d, this.#piedras, this.#n, this.#cuenta);
      this.#piedras = r.estado;
      if (!r.evento) return;
      if (r.evento.tipo === 'piedra') this.#antes = null;   // la unión que ganó la piedra ya no se deshace
      this.#avisos.push(r.evento);
    }
    #pendiente() { return AS.misiones.porCobrar(this.#d, this.#misiones, this.#escalones, this.#cuenta); }
    // los avisos que han ido dejando las acciones (misiones cumplidas): la pantalla los recoge y se vacían
    recogeAvisos() { return this.#avisos.splice(0);
    }
    invoca(azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!AS.equipo.hayHueco(this.#equipo)) return AS.error('sin-sitio');
      const coste = this.coste;
      if (this.#oro < coste) return AS.error('sin-oro', { coste });
      this.#oro -= coste; this.#gratis = false; this.#vivo = true;
      this.#altar = this.#tirada(azar);
      const primera = this.#tiradas === 0;
      this.#tiradas++; this.#cuenta.tiradas++;
      const res = this.#paga(AS.altar.lineas(this.#altar), azar);
      this.#fallos = res.lineas.length ? 0 : this.#fallos + 1;
      if (primera && !res.lineas.length && this.#reliquias.includes('repite')) { this.#gratis = true; res.repite = true; }
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, coste });
    }
    // las runas de una invocación (la primera de la partida, la guiada y la red contra la mala suerte: altar.js)
    #tirada(azar) {
      return AS.altar.invocacion(this.#d.altar, AS.reglas.pesos(this.#d, this.#m, this.#reliquias), { primera: this.#cuenta.tiradas === 0, guiada: this.#guiada, fallos: this.#fallos }, azar);
    }
    // la tirada de piedra: gasta la piedra i de la bolsa. No cuesta oro ni cuenta para el coste de invocar, trae línea segura y sube la
    // rareza de los héroes que lleguen según la piedra, sin pasar de las rarezas abiertas
    tiraPiedra(i, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!AS.equipo.hayHueco(this.#equipo)) return AS.error('sin-sitio');
      const r = AS.piedras.gasta(this.#piedras, i);
      if (!r.ok) return r;
      const pesos = AS.reglas.pesos(this.#d, this.#m, this.#reliquias);
      this.#piedras = r.valor.estado; this.#vivo = true; this.#cuenta.piedras++;
      this.#altar = AS.altar.conLinea(AS.altar.tira(pesos, azar), pesos, azar);
      const res = this.#paga(AS.altar.lineas(this.#altar), azar, undefined, r.valor.piedra);
      this.#fallos = 0;
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, coste: 0, piedra: r.valor.piedra });
    }
    // dir 1: la columna baja (entra la runa que asoma arriba); -1: sube
    empuja(col, dir, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!this.#altar || !this.#vivo) return AS.error('sin-tirada');
      if (this.#empujones <= 0) return AS.error('sin-empujones');
      const r = AS.altar.empuja(this.#altar, col, dir, AS.reglas.pesos(this.#d, this.#m, this.#reliquias), azar);
      if (!r.ok) return r;
      this.#altar = r.valor; this.#empujones--;
      const res = this.#paga(AS.altar.lineasDeColumna(this.#altar, col), azar, false);
      if (res.lineas.length) this.#fallos = 0;
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, col, dir });
    }
    // el Estallido (solo en su máquina, uno por oleada): rompe las runas de la clase que más se repite, caen nuevas y pagan las líneas nuevas
    estalla(azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!this.#altar || !this.#vivo) return AS.error('sin-tirada');
      if (this.#estallidos <= 0) return AS.error('sin-estallido');
      const r = AS.altar.estalla(this.#altar, AS.reglas.pesos(this.#d, this.#m, this.#reliquias), azar);
      if (!r.ok) return r;
      this.#altar = r.valor.columnas; this.#estallidos--; this.#cuenta.estallidos++;
      const res = this.#paga(r.valor.lineas, azar, false);
      if (res.lineas.length) this.#fallos = 0;
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, clase: r.valor.clase, rotas: r.valor.rotas });
    }

    /* ---------- el equipo ---------- */
    mueve(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.mueve(this.#equipo, desde, hasta);
      if (!r.ok) return r;
      this.#equipo = r.valor; this.#antes = null;
      return AS.ok(true);
    }
    // dos héroes se cambian el sitio: es lo que pasa al arrastrar uno sobre otro fuera del modo UNIR
    cambia(a, b) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.cambia(this.#equipo, a, b);
      if (!r.ok) return r;
      this.#equipo = r.valor; this.#antes = null;
      return AS.ok(true);
    }
    // lo que pasaría al unir (el de `hasta` se queda y crece), sin cambiar nada: para la ventana de confirmar
    vistaUnion(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      return AS.union.vista(this.#d, this.#equipo, desde, hasta, this.contexto);
    }
    absorbe(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.absorbe(this.#d, this.#equipo, desde, hasta);
      if (!r.ok) return r;
      this.#antes = this.#equipo; this.#equipo = r.valor.equipo; this.#apuntaNivel(r.valor.heroe); this.#cuenta.absorbidos++;
      this.#cobraMisiones();
      return AS.ok(r.valor.heroe);
    }
    deshace() {
      if (!this.puedeDeshacer) return AS.error('nada-que-deshacer');
      this.#equipo = this.#antes; this.#antes = null; this.#cuenta.absorbidos = Math.max(0, this.#cuenta.absorbidos - 1);
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
      this.#fase = 'batalla'; this.#antes = null; this.#anuncios = AS.anuncios.lucha(this.#anuncios);
      const nivel = this.sinergias.nivel, ctx = { ...this.contexto, nivel };
      return AS.ok({ datos: this.#d, oleada: this.#proxima, nivel, reliquias: this.#reliquias.slice(),
        heroes: campo.map(({ h, i }) => ({ hueco: i, ref: h.id, cifras: AS.poder.deHeroe(this.#d, h, ctx) })) });
    }
    #gana(ol, azar) {
      const oro = AS.reglas.oroDeGanar(this.#d, ol, this.#reliquias);
      this.#oro += oro; this.#cuenta.oroGanado += oro; this.#cuenta.oleadasGanadas++;
      this.#plumas += AS.reglas.plumasDe(this.#d, this.#dif, this.#sinFin ? this.#d.sinFin.plumasOleada : this.#d.partida.plumasOleada);
      const esencia = AS.tienda.esenciaDeOleada(this.#d, ol.n);
      this.#esencia += esencia; this.#cuenta.esencia += esencia;
      if (ol.tipo === 'jefe') this.#cuenta.jefes++;
      return AS.reglas.premiosDe(this.#d, this.#dif, AS.reglas.premios(this.#d, ol, this.#reliquias, azar));
    }
    // la oleada siguiente; cada dos, la tienda estrena oferta; cada tres, sale una misión de piedra
    #siguiente(azar) {
      this.#preparaOleada(this.#n + 1, azar);
      if (AS.tienda.toca(this.#d, this.#n)) this.#tienda = AS.tienda.ofertaNueva(this.#d, this.#tienda, azar);
      this.#revisaPiedra();   // la misión de piedra que no llegó a tiempo caduca aquí
      if (!AS.piedras.toca(this.#d, this.#piedras, this.#n)) return;
      this.#piedras = AS.piedras.propone(this.#d, this.#piedras, this.#n, this.#cuenta, azar);
      this.#avisos.push({ tipo: 'piedra-mision', ...this.piedras.mision });
    }
    // ¿se acaba la partida? Sin vidas, o al perder una oleada de élite o de jefe, derrota; al vencer al jefe (menos en el modo sin fin), victoria
    #decideFinal(gano, tipo) {
      if (this.#vidas <= 0 || (!gano && tipo !== 'normal')) { this.#final = 'derrota'; this.#premios = []; }
      else if (gano && tipo === 'jefe' && !this.#sinFin) this.#final = 'victoria';
    }
    // res: AS.batalla.resultado(B). Aplica el oro y las vidas, decide si la partida acaba y prepara la oleada siguiente (o la misma, si
    // era una normal y se ha perdido: cuesta una vida y se repite).
    terminaOleada(res, azar) {
      if (this.#fase !== 'batalla') return AS.error('ahora-no');
      const ol = this.#proxima, perdidas = AS.reglas.vidasPerdidas(this.#d, ol.tipo, res), tenia = this.#esencia;
      this.#oro += res.oro; this.#cuenta.bajas += res.bajas; this.#cuenta.oroGanado += res.oro;
      this.#vidas = Math.max(0, this.#vidas - perdidas);
      this.#premios = res.gano ? this.#gana(ol, azar) : [];
      if (res.gano && !perdidas) this.#cuenta.limpias++;
      this.#cobraMisiones();
      this.#decideFinal(res.gano, ol.tipo);
      const repite = !this.#final && !res.gano;   // una oleada normal perdida se repite
      if (repite) { this.#aPreparar(); this.#anuncios = AS.anuncios.pierde(this.#anuncios, ol.n); } else if (!this.#final) this.#siguiente(azar);
      if (this.#premios.length) this.#fase = 'premio'; else if (this.#final) this.#fase = 'fin';
      return AS.ok({ gano: res.gano, perdidas, tipo: ol.tipo, oleada: ol.n, repite, esencia: this.#esencia - tenia, final: this.#final, premios: this.#premios.slice() });
    }

    /* ---------- la tienda: se paga con esencia ---------- */
    #enTienda(hace) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = hace(this.#d, this.#tienda);
      if (r.ok) this.#tienda = r.valor.tienda;
      return r;
    }
    compraObjeto(i) {
      const r = this.#enTienda((d, t) => AS.tienda.compra(d, t, i, this.#esencia));
      if (r.ok) this.#esencia -= r.valor.coste;
      return r.ok ? AS.ok(r.valor.objeto) : r;
    }
    vendeObjeto(id) {
      const r = this.#enTienda((d, t) => AS.tienda.vende(d, t, id));
      if (r.ok) this.#esencia += r.valor.esencia;
      return r.ok ? AS.ok(r.valor.esencia) : r;
    }
    cambiaOferta(azar) {
      const r = this.#enTienda((d, t) => AS.tienda.cambia(d, t, this.#esencia, azar));
      if (r.ok) this.#esencia -= r.valor.coste;
      return r.ok ? AS.ok(r.valor.coste) : r;
    }

    /* ---------- los anuncios opcionales (AS.anuncios): se llaman DESPUÉS de verse ---------- */
    puedeAnuncio(tipo) { return AS.anuncios.puede(this.#d, this.#anuncios, tipo, this.#fase, this.#n); }
    anuncio(tipo, azar) {
      const r = AS.anuncios.usa(this.#d, this.#anuncios, tipo, this.#fase, this.#n);
      if (!r.ok) return r;
      const v = r.valor;
      this.#anuncios = v.anuncios; this.#esencia += v.esencia; this.#vidas += v.vidas;
      if (v.oferta) this.#tienda = AS.tienda.cambiaGratis(this.#d, this.#tienda, azar);
      return AS.ok({ esencia: v.esencia, vidas: v.vidas, oferta: v.oferta });
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
        gratis: this.#gratis, empujones: this.#empujones, equipo: this.#equipo, reliquias: this.#reliquias.slice(), sigId: this.#sigId, cuenta: { ...this.#cuenta }, mejoras: { ...this.#mejoras }, rarezas: this.#rarezas,
        guiada: this.#guiada, racha: this.#racha, fallos: this.#fallos, misiones: this.#misiones.slice(), escalones: { ...this.#escalones }, esencia: this.#esencia, tienda: this.#tienda, piedras: this.#piedras, vivo: this.#vivo, anuncios: this.#anuncios,
        maquina: this.#maquina, dificultad: this.#dif, estallidos: this.#estallidos };
    }
    #carga(j, azar) {
      const d = this.#d, eq = AS.equipo.deJSON(d, { ...j.equipo, abiertos: this.#m.abiertos }), g = AS.guardado.lee(d, j);
      if (!eq.ok) return eq;
      if (!g.ok) return g;
      const v = g.valor;
      this.#equipo = eq.valor; this.#reliquias = v.reliquias;
      this.#preparaOleada(v.n, azar);
      this.#oro = v.oro; this.#vidas = v.vidas; this.#plumas = v.plumas; this.#sigId = v.sigId; this.#tiradas = v.tiradas; this.#gratis = v.gratis;
      this.#empujones = Math.min(v.empujones, this.#empujones); this.#estallidos = Math.min(v.estallidos, this.#estallidos);
      this.#altar = v.altar; this.#vivo = v.vivo; this.#cuenta = v.cuenta; this.#racha = v.racha; this.#fallos = v.fallos;
      this.#misiones = v.misiones; this.#escalones = v.escalones; this.#esencia = v.esencia;
      this.#tienda = AS.tienda.deJSON(d, j.tienda, azar); this.#piedras = AS.piedras.deJSON(d, j.piedras); this.#anuncios = AS.anuncios.deJSON(j.anuncios);
      return AS.ok(this);
    }
    // de la partida guardada: una partida entera y válida, o un error (nunca una a medias). equipo = el equipo puesto de ahora
    static deJSON(datos, j, equipo, azar) {
      if (!j || j.v !== 1 || !datos.zonas[j.zona]) return AS.error('partida-invalida');
      return new Partida(LLAVE, datos, { zona: j.zona, sinFin: !!j.sinFin, guiada: !!j.guiada, maquina: j.maquina, dificultad: j.dificultad, mejoras: j.mejoras, rarezas: j.rarezas, equipo }).#carga(j, azar);
    }
  }
  return Partida;
})();
