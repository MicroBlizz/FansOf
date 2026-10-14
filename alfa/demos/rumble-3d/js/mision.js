// Boceto 3D de Fans of Rumble · «La primera misión»: una partida corta para enseñar el 3D (unos 3 minutos).
// 1. Presentación: cada personaje baja, mira a la cámara y se presenta (toca para seguir, o «Saltar»).
// 2. Batalla: oro que se llena, cuatro cartas y oleadas de becarios.
// 3. Jefe: al caer una torre de Microblizz (o al minuto y diez) sale SurvivalBot de la sede, con su música.
// 4. Final: si cae la sede de Microblizz, fiesta; si cae La Madriguera, derrota.
// Todo el rato narra Paco Rumble, el comentarista, como en el fútbol.
'use strict';
import * as THREE from './three.min.js';
import { hablar, SFX } from './voces.js';
import { poner, agachar } from './musica.js';
import { tr, NARRADOR } from './textos.js';

export const COSTE = { bunny: 4, squirrel: 2, meercat: 3, mechavaca: 5 };
const ORO_MAX = 10, ORO_CADA = 1.15;
const elige = l => l[(Math.random() * l.length) | 0];
const azar = (a, b) => a + Math.random() * (b - a);
const VIDAS = { pt: 1000, pb: 1800, et: 650, eb: 1500 };

export class Mision {
  constructor(partida, efectos, ui) {
    this.p = partida; this.fx = efectos; this.ui = ui;   // ui: comentar(texto, seg), objetivo(texto), saltar(si), final(gana), oro(n)
    this.fase = 'nada'; this.foco = null; this.oro = 0;
    partida.alEvento = (tipo, d) => this.evento(tipo, d);
  }

  /* ---------- empezar ---------- */
  empezar() {
    const p = this.p;
    p.reiniciar(); p.modo = 'mision';
    for (const e of p.edificios) { e.max = e.vida = e.lado === 'p' ? (e.tipo === 'base' ? VIDAS.pb : VIDAS.pt) : (e.tipo === 'base' ? VIDAS.eb : VIDAS.et); }
    this.fase = 'intro'; this.t = 0; this.oro = 6; this.charlaT = 0; this.oleadaT = 4; this.oleadas = 0; this.jefe = null; this.decir = null;
    this.reparto = {};
    this.guion = [
      { quien: 'narrador', frase: '¡Buenas noches y bienvenidos a Fans of Rumble 3D! Soy Paco Rumble.', foco: null },
      { quien: 'narrador', frase: 'Microblizz ha comprado nuestro juego favorito… ¡para cerrarlo!', foco: [0, -20, 30, 0.85] },
      { quien: 'bunny', en: [-6, 13], frase: '¡Ni hablar! Soy CrazyBunny y vengo a por su sede.' },
      { quien: 'squirrel', en: [3, 12], frase: '¡Y nosotras mordemos tobillos!' },
      { quien: 'meercat', en: [-1, 17.5], frase: 'Yo os curo. Quedaos cerca de mí.' },
      { quien: 'mechavaca', en: [8, 16.5], frase: '¡Muuu! Yo aguanto lo que me echen.' },
      { quien: 'becario', en: [-3, -11], frase: '¿Esto cuenta como prácticas?' },
      { quien: 'narrador', frase: 'Toca tu lado del campo para soltar cartas. ¡A por la sede de Microblizz!', foco: null },
    ];
    this.linea = -1; this.siguiente();
    this.ui.objetivo(''); this.ui.saltar(true);
    poner('menu');
  }

  // pasa a la siguiente frase de la presentación
  siguiente() {
    this.linea++;
    const l = this.guion[this.linea];
    if (!l) { this.batalla(); return; }
    this.lineaT = 0;
    if (l.quien === 'narrador') {
      this.foco = l.foco; this.lineaDura = this.narrar(l.frase, true) + 0.4;
      return;
    }
    // baja el personaje y, al llegar, habla mirando a la cámara
    const [x, z] = l.en, lado = l.quien === 'becario' ? 'e' : 'p';
    const u = this.p.soltar(l.quien, x, z, lado, 16, false, { callado: true });
    if (l.quien === 'squirrel') this.p.soltar('squirrel', x + 1.8, z + 0.4, lado, 17.5, false, { callado: true });   // salen de dos en dos
    for (const v of this.p.unidades) if (v.estado === 'cae' || v === u) { v.quieto = true; v.callado = true; }
    this.reparto[l.quien] = u;
    this.foco = [x, z - 1, 15, 0.62];
    this.espera = u; this.lineaDura = 99;
  }

  batalla() {
    this.fase = 'batalla'; this.t = 0; this.foco = null; this.espera = null;
    for (const u of this.p.unidades) { u.quieto = false; u.callado = false; }
    this.ui.saltar(false); this.ui.objetivo(tr('Derriba la sede de Microblizz'));
    poner('animales'); SFX.bocina();
  }

  saltarIntro() {
    if (this.fase !== 'intro') return;
    for (const l of this.guion) if (l.en && !this.reparto[l.quien]) {
      const lado = l.quien === 'becario' ? 'e' : 'p';
      this.p.soltar(l.quien, l.en[0], l.en[1], lado, 16, false, { callado: true });
      if (l.quien === 'squirrel') this.p.soltar('squirrel', l.en[0] + 1.8, l.en[1] + 0.4, lado, 17.5, false, { callado: true });
      this.reparto[l.quien] = true;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.batalla();
  }

  // un toque en la pantalla durante una escena: pasa a la siguiente frase
  toque() {
    if (this.fase === 'intro' && !this.espera && this.lineaT > 0.5) this.siguiente();
    else if (this.fase === 'jefeIntro' && this.lineaT > 0.6) this.siguienteJefe();
  }
  enEscena() { return this.fase === 'intro' || this.fase === 'jefeIntro'; }

  /* ---------- cartas y oro ---------- */
  puede(carta) {
    if (this.fase !== 'batalla' && this.fase !== 'jefe') return false;
    if (carta === 'bunny' && this.p.unidades.some(u => u.tipo === 'bunny' && u.lado === 'p' && !u.quitado)) return false;   // el líder, solo uno
    return this.oro >= COSTE[carta];
  }
  soltar(carta, x, z) {
    if (!this.puede(carta)) { SFX.no(); return false; }
    this.oro -= COSTE[carta]; SFX.carta();
    this.p.pedir(carta, x, z);
    return true;
  }

  /* ---------- cada fotograma ---------- */
  actualizar(dt) {
    this.p.sinBarras = this.enEscena() || this.fase === 'final';
    if (this.fase === 'nada' || this.fase === 'final') return;
    this.t += dt; this.lineaT += dt; this.charlaT -= dt;
    const p = this.p;
    if (this.fase === 'intro') {
      // el personaje que baja: cuando aterriza, habla
      if (this.espera && this.espera.estado === 'pose' && this.espera.estadoT > 0.25) {
        const l = this.guion[this.linea], u = this.espera;
        this.espera = null; this.lineaT = 0;
        this.lineaDura = this.decirUnidad(u, l.frase) + 0.5;
      }
      if (!this.espera && this.lineaT > this.lineaDura) this.siguiente();
      return;
    }
    if (this.fase === 'jefeIntro') {
      if (this.espera && this.espera.estado === 'pose' && this.espera.estadoT > 0.3) { this.espera = null; this.siguienteJefe(); }
      else if (!this.espera && this.lineaT > this.lineaDura) this.siguienteJefe();
      return;
    }
    // batalla y jefe: oro, oleadas, jefe y final
    const antes = this.oro;
    this.oro = Math.min(ORO_MAX, this.oro + dt / ORO_CADA);
    if (antes < ORO_MAX && this.oro >= ORO_MAX) this.comentar('oro');
    this.oleadaT -= dt;
    if (this.oleadaT <= 0) this.oleada();
    if (this.fase === 'batalla' && (this.t > 70 || p.edificios.some(e => e.lado === 'e' && e.tipo === 'torre' && e.estado !== 'ok'))) this.salirJefe();
    if (p.fin) this.acabar(p.fin === 'p');
  }

  oleada() {
    const enJefe = this.fase === 'jefe';
    this.oleadaT = enJefe ? 13 : 9.5; this.oleadas++;
    if (this.p.unidades.filter(u => u.lado === 'e').length > 24) return;
    const carril = this.oleadas % 2 ? -1 : 1, n = Math.min(5, 2 + Math.floor(this.oleadas / 2));
    for (let i = 0; i < n; i++) this.p.soltar('becario', carril * 16 + azar(-3, 3), azar(-14, -9), 'e', 16 + i * 2);
  }

  /* ---------- el jefe ---------- */
  salirJefe() {
    this.fase = 'jefeIntro'; this.lineaT = 0; this.foco = [0, -21, 32, 0.55];
    this.ui.saltar(true, false);
    poner('boss0');
    this.ui.objetivo('');
    this.pasoJefe = 0;
    this.narrar('¡Atención! ¡Se abren las puertas de la sede!', true);
    this.lineaDura = 2.4;
  }
  siguienteJefe() {
    this.pasoJefe++; this.lineaT = 0;
    if (this.pasoJefe === 1) {
      const j = this.p.soltar('survivalbot', 0, -17, 'e', 22, false, { callado: true });
      j.quieto = true; this.jefe = j; this.espera = j; this.lineaDura = 99;
    } else if (this.pasoJefe === 2) this.lineaDura = this.decirUnidad(this.jefe, '¡Soy SurvivalBot! Sobrevivo a todo… menos a las críticas.') + 0.4;
    else if (this.pasoJefe === 3) this.lineaDura = this.decirUnidad(this.jefe, 'Vuestro juego queda… ¡CERRADO!') + 0.4;
    else {
      this.fase = 'jefe'; this.foco = null; this.jefe.quieto = false; this.jefe.callado = false; this.ui.saltar(false);
      this.ui.objetivo(tr('Derrota a SurvivalBot y tira la sede'));
      this.oleadaT = 6;
    }
  }

  /* ---------- final ---------- */
  acabar(gana) {
    this.fase = 'final';
    this.ui.objetivo(''); poner(gana ? 'win' : 'lose', 0, null);
    const p = this.p;
    if (gana) {
      const heroe = p.unidades.find(u => u.lado === 'p' && u.tipo === 'bunny' && !u.quitado) || p.unidades.find(u => u.lado === 'p' && !u.quitado);
      if (heroe) { this.foco = [heroe.x, heroe.z - 1, 16, 0.6]; setTimeout(() => this.decirUnidad(heroe, heroe.tipo === 'bunny' ? '¡Lo hemos conseguido! ¡El juego sigue abierto!' : '¡Victoria para los animales!'), 900); }
      else this.foco = [0, -20, 28, 0.8];
      setTimeout(() => this.narrar('¡VICTORIA! ¡Qué partido, señoras y señores!', true), 3200);
    } else {
      this.foco = [0, 20, 22, 0.7];
      setTimeout(() => this.narrar('Microblizz se lleva la partida… por esta vez.', true), 800);
    }
    setTimeout(() => this.ui.final(gana), 5200);
  }

  /* ---------- voces ---------- */
  decirUnidad(u, frase) {
    agachar(true);
    const d = hablar(frase, u.tipo, () => { u.silaba = 1; });
    u.habla = d;
    const v = new THREE.Vector3();
    this.fx.bocadillo(() => (u.quitado ? null : v.set(u.x, u.y + u.def.alto + 0.7, u.z)), tr(frase), d, u.lado);
    clearTimeout(this.agachado); this.agachado = setTimeout(() => agachar(false), d * 1000);
    return d;
  }
  narrar(frase, siempre = false) {
    if (!siempre && this.charlaT > 0) return 0;
    this.charlaT = 4.5;
    agachar(true);
    const d = hablar(frase, 'narrador');
    this.ui.comentar(tr(frase), d + 0.8);
    clearTimeout(this.agachado); this.agachado = setTimeout(() => agachar(false), d * 1000);
    return d;
  }
  comentar(clave, siempre = false) {
    const lista = NARRADOR[clave];
    if (lista) this.narrar(elige(lista), siempre);
  }

  // lo que pasa en la partida, contado por Paco Rumble
  evento(tipo, d) {
    if (this.fase !== 'batalla' && this.fase !== 'jefe') return;
    if (tipo === 'llega' && d.lado === 'p') this.comentar('llega_' + d.tipo);
    else if (tipo === 'salto') this.comentar('salto');
    else if (tipo === 'cura' && Math.random() < 0.35) this.comentar('cura');
    else if (tipo === 'vaca') this.comentar('vaca', true);
    else if (tipo === 'congela') this.comentar('congela', true);
    else if (tipo === 'edificio' && d.tipo === 'torre') this.comentar(d.lado === 'e' ? 'torreSuya' : 'torreNuestra', true);
    else if (tipo === 'cae' && d.tipo === 'survivalbot') { this.comentar('jefeCae', true); this.ui.objetivo(tr('Derriba la sede de Microblizz')); }
    else if (tipo === 'cae' && d.tipo === 'becario' && Math.random() < 0.12) this.comentar('becario');
  }
}
