// Fans of Asalto · DOMINIO · La partida: la raíz de una bajada a la mazmorra (zona, oleada, oro, vidas, Altar, equipo, reliquias, racha,
// misiones, premios y Despertar). Solo cambia por sus métodos, que la dejan válida y devuelven AS.ok(...) o AS.error('codigo'). Fases:
// 'preparar' → 'batalla' → ('premio') → 'preparar'… y 'fin'. Pura: el azar se pasa. Cuentas: reglas.js; lo guardado: guardado.js y partida-guardado.js.
'use strict';
AS.Partida = (() => {
  const LLAVE = Symbol('partida');   // solo las fábricas de este archivo pueden crear una partida

  class Partida {
    #d; #m; #E; #zona; #sinFin; #n = 0; #fase = 'preparar'; #oro; #vidas; #plumas = 0; #altar = null; #tiradas = 0; #gratis = false; #empujones = 0;
    #equipo; #reliquias = []; #proxima = null; #sigId = 1; #premios = []; #antes = null; #cuenta = AS.guardado.CUENTA(); #final = null; #mejoras; #rarezas = 0;
    #guiada = false; #racha = 0; #fallos = 0; #misiones = []; #escalones = {}; #avisos = []; #esencia = 0; #tienda = null; #piedras = AS.piedras.vacio(); #vivo = false; #anuncios = AS.anuncios.vacio();
    #maquina; #dif; #estallidos = 0; #leg;

    constructor(llave, datos, cfg) {
      if (llave !== LLAVE) throw new Error('La partida se crea con AS.Partida.nueva o AS.Partida.deJSON');
      this.#d = datos; this.#mejoras = { ...(cfg.mejoras || {}) }; this.#rarezas = Math.floor(cfg.rarezas) || 0; this.#m = AS.reglas.mods(datos, cfg.mejoras, this.#rarezas); this.#E = cfg.equipo || {};
      this.#zona = cfg.zona; this.#sinFin = !!cfg.sinFin; this.#guiada = !!cfg.guiada;
      this.#maquina = AS.guardado.maquina(datos, cfg.maquina); this.#dif = AS.guardado.dificultad(datos, cfg.dificultad, this.#sinFin);
      this.#oro = datos.partida.oro + this.#m.oro; this.#vidas = datos.partida.vidas + this.#m.vidas;
      this.#equipo = AS.equipo.vacio(datos, this.#m.abiertos); this.#leg = AS.despertar.nuevo(datos, cfg.despertar);
    }
    // cfg: { zona, sinFin, guiada, maquina ('altar' o 'estallido'), dificultad (0 a 2), mejoras: { corazon: 1… }, rarezas (abiertas),
    // despertar (0 a 3 abiertos), equipo: { vida: 5… } (el equipo puesto, en %) }
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
    get despertar() { return this.#leg; }   // { abiertos, oferta: null | { id, cartas, cambiada } }
    // piedras: misión (o null), bolsa, rareza tope y tiradas seguras
    get piedras() { return { mision: AS.piedras.progreso(this.#d, this.#piedras, this.#n, this.#cuenta), bolsa: this.#piedras.bolsa, abiertas: this.#m.rarezas, seguras: this.#piedras.suerte }; }
    get altarVivo() { return this.#vivo; }   // ¿hay en el Altar una tirada de esta oleada (se puede empujar)?
    get costeCambio() { return AS.tienda.costeCambio(this.#d, this.#tienda); }
    get contexto() { return { equipo: this.#E, reliquias: this.#reliquias.slice(), objetos: this.#tienda.objetos, ganadas: this.#cuenta.oleadasGanadas, distintas: Object.keys(this.sinergias.puntos).length }; }
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
    get coste() { return this.#gratis ? 0 : AS.reglas.coste(this.#d, this.#tiradas, this.#reliquias, this.#tienda.objetos); }
    tipoDeOleada(n) { return AS.oleadas.tipo(this.#d, this.#zona, n, this.#sinFin); }

    #preparaOleada(n, azar) {
      this.#n = n; this.#proxima = AS.oleadas.genera(this.#d, this.#zona, n, azar, this.#sinFin, this.#dif);
      this.#aPreparar();
      if (n > 1) this.#oro += AS.reglas.interes(this.#reliquias, this.#oro);
    }
    // vuelta a preparar: Altar de cero (coste de salida, empujones nuevos); también al repetir una oleada perdida (mismos enemigos)
    #aPreparar() {
      this.#tiradas = 0; this.#gratis = false; this.#vivo = false; this.#antes = null; this.#fase = 'preparar';
      this.#empujones = AS.reglas.empujones(this.#d, this.#m, this.#reliquias, this.#maquina); this.#estallidos = AS.reglas.estallidos(this.#d, this.#maquina);
    }
    #pesos() { return AS.reglas.pesos(this.#d, this.#m, this.#reliquias, this.#tienda && this.#tienda.objetos); }
    #apuntaNivel(h) { if (h.nivel > this.#cuenta.nivelMax) this.#cuenta.nivelMax = h.nivel; }
    // tras cambiar el equipo: nacen legendarios y se abre la oferta del Despertar
    #despierta(azar, avisos = []) {
      const r = AS.despertar.revisa(this.#d, this.#equipo, this.#leg, AS.despertar.larga(this.#sinFin, this.#dif), azar);
      this.#equipo = r.equipo; this.#leg = r.estado; this.#avisos.push(...avisos, ...r.avisos);
      if (r.cambio || avisos.length) this.#antes = null;   // ya no se deshace
    }

    /* ---------- el Altar ---------- */
    // un héroe nuevo: a un hueco o al banquillo; si no cabe, lo absorbe el de su tipo (o el de más nivel)
    #llega(clase, nivel, dorado, azar, piedra) {
      const h = AS.reglas.heroeNuevo(this.#d, this.#m, this.#reliquias, this.#cuenta.invocados === 0, 'h' + (this.#sigId++), { clase, nivel, dorado, piedra }, azar);
      return this.#coloca(piedra ? AS.piedrasEfectos.heroe(this.#d, h, piedra, azar) : h, clase);
    }
    // el que llega va a un hueco o al banquillo; si no cabe, se funde
    #coloca(h, clase) {
      this.#cuenta.invocados++;
      const r = AS.equipo.recibe(this.#d, this.#equipo, h);
      if (r.ok) { this.#equipo = r.valor; this.#apuntaNivel(h); return { heroe: h, clase, sitio: AS.equipo.sitioDe(r.valor, h.id) }; }
      const f = AS.equipo.funde(this.#d, this.#equipo, h);
      this.#equipo = f.equipo; this.#apuntaNivel(f.crecido);
      return { heroe: h, clase, sitio: f.sitio, fundido: f.crecido };
    }
    // piedra: la de la tirada de piedra (rareza, nivel e improntas de los que llegan; al Animal Dorado no)
    #paga(lineas, azar, rompe, piedra) {
      const A = this.#d.altar, n = lineas.length, llegados = lineas.map(l => this.#llega(l.clase, 1, false, azar, piedra));
      let oroExtra = A.premioLineas[Math.min(n, A.premioLineas.length - 1)], dorado = null;
      if (n >= A.dorado.lineas) { dorado = this.#llega(AS.altar.masRepetida(lineas), A.dorado.nivel, true, azar); oroExtra += A.dorado.oro; this.#cuenta.dorados++; }
      this.#oro += oroExtra; this.#cuenta.lineas += n; this.#antes = null;
      if (n >= 2) this.#cuenta.dobles++;
      this.#despierta(azar);
      return { lineas, llegados, oroExtra, dorado, ...this.#encadena(n > 0, rompe) };
    }
    // la racha: cada invocación (o empujón) con línea la sube y da oro; una sin línea la corta (rompe = false: empujón)
    #encadena(hubo, rompe) {
      if (hubo) this.#racha++; else if (rompe !== false) this.#racha = 0;
      const oroRacha = hubo ? AS.reglas.oroRacha(this.#d, this.#racha) : 0;
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
    // los avisos de las acciones (misiones, legendarios…): la pantalla los recoge y se vacían
    recogeAvisos() { return this.#avisos.splice(0); }
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
    // las runas de una invocación (altar.js; con la línea segura de la Piedra de la suerte)
    #tirada(azar) {
      const s = AS.piedras.usaSuerte(this.#piedras);
      this.#piedras = s.estado;
      return AS.altar.invocacion(this.#d.altar, this.#pesos(), { primera: this.#cuenta.tiradas === 0, guiada: this.#guiada, fallos: this.#fallos, segura: s.segura }, azar);
    }
    // tira la piedra i de la bolsa: gratis, con línea segura, rareza subida y lo suyo (piedras-efectos.js). eleccion: { clase }
    tiraPiedra(i, azar, eleccion) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!AS.equipo.hayHueco(this.#equipo)) return AS.error('sin-sitio');
      const t = AS.piedrasEfectos.tira(this.#d, this.#piedras, i, this.#pesos(), eleccion, azar), { piedra, premio } = t.valor || {};
      if (!t.ok) return t;
      this.#piedras = t.valor.estado; this.#vivo = true; this.#cuenta.piedras++; this.#altar = t.valor.columnas; this.#suma(premio);
      const res = this.#paga(AS.altar.lineas(this.#altar), azar, undefined, piedra), ll = res.llegados[0];
      if (AS.piedrasEfectos.gemela(this.#d, piedra)) res.gemela = this.#coloca(AS.heroe.gemelo(ll.heroe, 'h' + (this.#sigId++)), ll.clase);
      this.#fallos = 0;
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, coste: 0, piedra, premio });
    }
    // dir 1: la columna baja (entra la runa que asoma arriba); -1: sube
    empuja(col, dir, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!this.#altar || !this.#vivo) return AS.error('sin-tirada');
      if (this.#empujones <= 0) return AS.error('sin-empujones');
      const r = AS.altar.empuja(this.#altar, col, dir, this.#pesos(), azar);
      if (!r.ok) return r;
      this.#altar = r.valor; this.#empujones--;
      const res = this.#paga(AS.altar.lineasDeColumna(this.#altar, col), azar, false);
      if (res.lineas.length) this.#fallos = 0;
      this.#cobraMisiones();
      return AS.ok({ ...res, columnas: this.#altar, col, dir });
    }
    // el Estallido (su máquina, uno por oleada): rompe las runas de la clase más repetida y pagan las líneas nuevas
    estalla(azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      if (!this.#altar || !this.#vivo) return AS.error('sin-tirada');
      if (this.#estallidos <= 0) return AS.error('sin-estallido');
      const r = AS.altar.estalla(this.#altar, this.#pesos(), azar);
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
    // lo que pasaría al unir (`hasta` se queda y crece), sin cambiar nada
    vistaUnion(desde, hasta) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      return AS.union.vista(this.#d, this.#equipo, desde, hasta, this.contexto);
    }
    absorbe(desde, hasta, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.absorbe(this.#d, this.#equipo, desde, hasta), quedaba = AS.equipo.leer(this.#equipo, hasta);
      if (!r.ok) return r;
      this.#antes = this.#equipo; this.#equipo = r.valor.equipo; this.#apuntaNivel(r.valor.heroe); this.#cuenta.absorbidos++;
      this.#despierta(azar, AS.despertar.avisoSer(quedaba, r.valor.heroe, hasta));
      this.#cobraMisiones();
      return AS.ok(r.valor.heroe);
    }
    deshace() {
      if (!this.puedeDeshacer) return AS.error('nada-que-deshacer');
      this.#equipo = this.#antes; this.#antes = null; this.#cuenta.absorbidos = Math.max(0, this.#cuenta.absorbidos - 1);
      return AS.ok(true);
    }
    asciende(sitio, clase, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.equipo.asciende(this.#d, this.#equipo, sitio, clase);
      if (!r.ok) return r;
      this.#equipo = r.valor.equipo; this.#antes = null; this.#cuenta.ascensos++;
      this.#despierta(azar);
      return AS.ok(AS.equipo.leer(this.#equipo, sitio));
    }
    // la carta de Despertar elegida de la oferta (y se abre la siguiente, si quedan)
    eligeCarta(carta, azar) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = AS.despertar.elige(this.#d, this.#equipo, this.#leg, carta, azar);
      if (!r.ok) return r;
      this.#equipo = r.valor.equipo; this.#leg = r.valor.estado; this.#antes = null;
      return AS.ok(r.valor.heroe);
    }

    /* ---------- la oleada ---------- */
    // sale a luchar: devuelve lo que necesita AS.batalla.crea (menos el azar)
    lucha() {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const campo = AS.equipo.enCampo(this.#equipo);
      if (!campo.length) return AS.error('sin-heroes');
      if (this.#leg.oferta) return AS.error('elige-carta');
      this.#fase = 'batalla'; this.#antes = null; this.#anuncios = AS.anuncios.lucha(this.#anuncios);
      const nivel = this.sinergias.nivel, ctx = { ...this.contexto, nivel }, sale = AS.piedrasEfectos.aLuchar(this.#piedras, this.#proxima);   // con el verdugo
      this.#piedras = sale.estado;
      return AS.ok({ datos: this.#d, oleada: sale.oleada, nivel, reliquias: this.#reliquias.slice(), efectos: AS.objetos.efectos(this.#d, this.#tienda.objetos),
        heroes: campo.map(({ h, i }) => ({ hueco: i, ref: h.id, cifras: AS.poder.deHeroe(this.#d, h, ctx) })) });
    }
    // suma lo ganado ({ oro, plumas, esencia, vidas }) y lo apunta en la cuenta
    #suma(x) {
      const oro = x.oro || 0, esencia = x.esencia || 0;
      this.#oro += oro; this.#cuenta.oroGanado += oro; this.#plumas += x.plumas || 0; this.#esencia += esencia; this.#cuenta.esencia += esencia; this.#vidas += x.vidas || 0;
    }
    #gana(ol, azar) {
      const g = AS.reglas.ganancia(this.#d, ol, { reliquias: this.#reliquias, objetos: this.#tienda.objetos, dif: this.#dif, sinFin: this.#sinFin }, azar);
      this.#suma(g); this.#cuenta.oleadasGanadas++;
      if (ol.tipo === 'jefe') this.#cuenta.jefes++;
      return g.premios;
    }
    // la oleada siguiente; cada dos, oferta nueva (con el épico del mercader); cada tres, misión de piedra (con la Brújula)
    #siguiente(azar) {
      this.#preparaOleada(this.#n + 1, azar);
      if (AS.tienda.toca(this.#d, this.#n)) ({ estado: this.#piedras, tienda: this.#tienda } = AS.piedrasEfectos.oferta(this.#d, this.#piedras, this.#tienda, azar));
      this.#revisaPiedra();   // la misión de piedra que no llegó a tiempo caduca aquí
      if (!AS.piedras.toca(this.#d, this.#piedras, this.#n)) return;
      this.#piedras = AS.piedras.propone(this.#d, this.#piedras, this.#n, this.#cuenta, azar, AS.objetos.brujula(this.#d, this.#tienda.objetos));
      this.#avisos.push({ tipo: 'piedra-mision', ...this.piedras.mision });
    }
    // ¿se acaba la partida? (reglas.final); la derrota se lleva los premios
    #decideFinal(gano, tipo) { this.#final = AS.reglas.final(this.#vidas, gano, tipo, this.#sinFin); if (this.#final === 'derrota') this.#premios = []; }
    // res: AS.batalla.resultado(B) (más la Cosecha). Aplica oro, esencia y vidas, decide si acaba y prepara la siguiente (o repite la normal perdida)
    terminaOleada(res, azar) {
      if (this.#fase !== 'batalla') return AS.error('ahora-no');
      const ol = this.#proxima, perdidas = AS.reglas.vidasPerdidas(this.#d, ol.tipo, res), tenia = this.#esencia, cosecha = AS.despertar.cosecha(res);
      this.#esencia += cosecha; this.#cuenta.esencia += cosecha; this.#oro += res.oro; this.#cuenta.bajas += res.bajas; this.#cuenta.oroGanado += res.oro;
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
    // hace: la operación de AS.tienda; esencia: lo que suma (o resta) a la esencia; sale: lo que devuelve
    #enTienda(hace, esencia, sale) {
      if (this.#fase !== 'preparar') return AS.error('ahora-no');
      const r = hace(this.#d, this.#tienda);
      if (!r.ok) return r;
      this.#tienda = r.valor.tienda; this.#esencia += esencia(r.valor);
      return AS.ok(sale(r.valor));
    }
    compraObjeto(i) { return this.#enTienda((d, t) => AS.tienda.compra(d, t, i, this.#esencia), v => -v.coste, v => v.objeto); }
    vendeObjeto(id) { return this.#enTienda((d, t) => AS.tienda.vende(d, t, id), v => v.esencia, v => v.esencia); }
    cambiaOferta(azar) { return this.#enTienda((d, t) => AS.tienda.cambia(d, t, this.#esencia, azar), v => -v.coste, v => v.coste); }

    /* ---------- los anuncios opcionales (AS.anuncios): se llaman DESPUÉS de verse ---------- */
    puedeAnuncio(tipo) { return AS.anuncios.puede(this.#d, this.#anuncios, tipo, this.#fase, this.#n, this.#leg.oferta); }
    anuncio(tipo, azar) {
      const r = AS.anuncios.usa(this.#d, this.#anuncios, tipo, this.#fase, this.#n, this.#leg.oferta);
      if (!r.ok) return r;
      const v = r.valor;
      if (v.cartas) { this.#leg = AS.despertar.cambia(this.#d, this.#equipo, this.#leg, azar); return AS.ok({ cartas: this.#leg.oferta.cartas }); }
      this.#anuncios = v.anuncios; this.#esencia += v.esencia; this.#vidas += v.vidas;
      if (v.oferta) this.#tienda = AS.tienda.cambiaGratis(this.#d, this.#tienda, azar);
      return AS.ok({ esencia: v.esencia, vidas: v.vidas, oferta: v.oferta });
    }

    /* ---------- los premios (las reglas, en premios.js) ---------- */
    #sigue() {
      this.#premios = this.#premios.slice(1);
      if (!this.#premios.length) this.#fase = this.#final ? 'fin' : 'preparar';
    }
    // el cofre de la oleada de élite o el botín del jefe. doble: con anuncio (solo el cofre)
    cobraCofre(doble) {
      const r = AS.premios.cofre(this.premio, doble);
      if (r.ok) { this.#suma(r.valor); this.#sigue(); }
      return r;
    }
    // las reliquias elegidas (r: AS.ok([id…]) o un error) pasan a ser suyas; la Palanca da su empujón ya
    #toma(r) {
      if (!r.ok) return r;
      for (const id of r.valor) { this.#reliquias.push(id); if (id === 'palanca' && this.#fase !== 'fin') this.#empujones++; }
      this.#sigue();
      return r;
    }
    eligeReliquia(id) { const r = this.#toma(AS.premios.elige(this.premio, id)); return r.ok ? AS.ok(id) : r; }
    // con anuncio: otras tres, o llevarse las tres
    refrescaReliquias(azar) {
      const r = AS.premios.refresca(this.#d, this.premio, this.#reliquias, azar);
      if (r.ok) this.#premios = [r.valor, ...this.#premios.slice(1)];
      return r.ok ? AS.ok(r.valor.opciones) : r;
    }
    todasLasReliquias() { return this.#toma(AS.premios.todas(this.premio)); }

    /* ---------- guardar y cargar (entre oleadas y con los premios por cobrar) ---------- */
    // en plena batalla y ya acabada (con o sin premios por cobrar) no se guarda: null
    aJSON() {
      if (this.#final || (this.#fase !== 'preparar' && this.#fase !== 'premio')) return null;
      return AS.partidaGuardado.aJSON(this, { gratis: this.#gratis, mejoras: { ...this.#mejoras }, rarezas: this.#rarezas, sigId: this.#sigId, misiones: this.#misiones.slice(),
        escalones: { ...this.#escalones }, piedras: this.#piedras, anuncios: this.#anuncios, premios: this.#premios.slice() });
    }
    #carga(j, azar) {
      const d = this.#d, g = AS.guardado.lee(d, j, this.#m.abiertos), v = g.valor;
      if (!g.ok) return g;
      this.#equipo = v.equipo; this.#reliquias = v.reliquias;
      this.#preparaOleada(v.n, azar);
      this.#oro = v.oro; this.#vidas = v.vidas; this.#plumas = v.plumas; this.#sigId = v.sigId; this.#tiradas = v.tiradas; this.#gratis = v.gratis;
      this.#empujones = Math.min(v.empujones, this.#empujones); this.#estallidos = Math.min(v.estallidos, this.#estallidos);
      this.#altar = v.altar; this.#vivo = v.vivo; this.#cuenta = v.cuenta; this.#racha = v.racha; this.#fallos = v.fallos;
      this.#misiones = v.misiones; this.#escalones = v.escalones; this.#esencia = v.esencia;
      this.#tienda = AS.tienda.deJSON(d, j.tienda, azar); this.#piedras = v.piedras; this.#anuncios = v.anuncios;
      this.#leg = AS.despertar.deJSON(d, this.#equipo, j.oferta, this.#leg.abiertos); this.#despierta(azar);
      if (v.premios.length) { this.#premios = v.premios; this.#fase = 'premio'; }   // se guardó con premios por cobrar: se sigue en ellos
      return AS.ok(this);
    }
    // de la partida guardada: una partida entera y válida, o un error (nunca una a medias). equipo = el equipo puesto de ahora
    static deJSON(datos, j, equipo, azar) {
      if (!j || j.v !== 1 || !datos.zonas[j.zona]) return AS.error('partida-invalida');
      return new Partida(LLAVE, datos, AS.partidaGuardado.cfgDe(j, equipo)).#carga(j, azar);
    }
  }
  return Partida;
})();
