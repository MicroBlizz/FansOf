// Fans of Island · aplicacion/sesion: LA SESIÓN, una vuelta al nivel de principio a fin. Crea al jugador y los bichos, lleva el orden
// de cada fotograma (jugador, Brotitos, peces, cangrejos, gotas, gaviotas y choques), aplica los eventos del dominio (pisotones, golpes,
// zanahorias, meta), cuenta las zanahorias, quita vidas, devuelve al jugador al último suelo firme si cae al mar y acaba con victoria
// o derrota. Sin pantalla ni reloj propio: el azar, los mandos y todo lo de fuera (sonido, marcador, vibración, salpicaduras, final)
// entran por parámetros; el dibujo lee el estado por sesion.estado. Las partículas de adorno y la cámara son de dibujo y no están aquí.
'use strict';
{
  const SIN_PUERTO = () => {};
  const PUERTOS = { sonido: SIN_PUERTO, marcador: SIN_PUERTO, vibra: SIN_PUERTO, salpica: SIN_PUERTO, final: SIN_PUERTO };

  // nivel y fisica: los de IS.creaNivel/IS.creaFisica; azar(): número entre 0 y 1; mandos(): {dir, salto, buffer} ya leídos;
  // lienzo: {vw, cH, bH}, las medidas de pantalla que usan las reglas; puertos: lo que la sesión avisa hacia fuera
  IS.creaSesion = ({ nivel, fisica, azar, mandos, lienzo, puertos }) => {
    const P = { ...PUERTOS, ...puertos };
    const { T } = IS.MEDIDAS;
    const estado = { J: null, enemigos: [], zanas: [], total: 0, meta: null, cangrejos: [], peces: [], gotas: [], gaviotas: [], cocos: [], tGav: 3,
      jugando: false, final: null };
    let reloj = 0, mando = null;

    const mundo = () => ({ J: estado.J, fis: fisica, nivel, azar, reloj, vw: lienzo.vw, cH: lienzo.cH, bH: lienzo.bH,
      giroDer: IS.GIRO.DER, giroIzq: IS.GIRO.IZQ, enemigos: estado.enemigos, peces: estado.peces, cangrejos: estado.cangrejos,
      gotas: estado.gotas, gaviotas: estado.gaviotas, cocos: estado.cocos, zanas: estado.zanas, meta: estado.meta, tGav: estado.tGav });
    const cogidas = () => estado.zanas.filter(z => z.cogida).length;
    const avisaMarcador = () => P.marcador({ vidas: estado.J.vidas, zanas: cogidas(), total: estado.total });

    function nueva() {   // el orden de las llamadas al azar es el de siempre: Brotitos, peces, cangrejos
      const e = estado;
      e.J = IS.Jugador.crea((nivel.INICIO + 0.5) * T, fisica.arribaCol(nivel.INICIO));
      e.enemigos = IS.creaBrotitos(mundo());
      e.zanas = nivel.ZANAS0.map(z => ({ x: z.x, z: z.z, cogida: false }));
      e.peces = IS.creaPeces(mundo());
      e.gotas = []; e.gaviotas = []; e.cocos = []; e.tGav = 4;
      e.cangrejos = IS.creaCangrejos(mundo());
      e.meta = { x: (nivel.META + 0.5) * T, z: fisica.arribaCol(nivel.META) };
      e.total = e.zanas.length;
      e.jugando = false; e.final = null;
      avisaMarcador();
    }
    const empieza = () => { nueva(); estado.jugando = true; };

    function acaba(gana) {   // meta o sin vidas: la sesión deja de avanzar
      estado.jugando = false;
      estado.final = { gana, zanas: cogidas(), total: estado.total };
      P.final(estado.final);
    }
    function efectosDaño() {
      avisaMarcador(); P.sonido('womp'); P.vibra();
      if (estado.J.vidas <= 0) acaba(false);
    }
    function daño() {   // true si de verdad quita una vida (no está parpadeando)
      if (!IS.Jugador.daña(estado.J)) return false;
      efectosDaño();
      return true;
    }
    function pasoJugador(dt) {
      for (const ev of IS.Jugador.paso(estado.J, mando, dt, fisica)) {
        if (ev === 'salto') P.sonido('jump');
        else if (ev === 'daño') efectosDaño();
      }
    }
    function pisaPez(e) { IS.Jugador.pisaPez(estado.J, e.arriba, mando.salto); P.sonido('pop'); }   // un pez pisado: queda encima y rebota
    function rebota() { IS.Jugador.rebota(estado.J, mando.salto); P.sonido('pop'); }   // tras pisar a alguien
    function golpeado(dx) { if (IS.Jugador.golpeado(estado.J, dx)) efectosDaño(); }
    function golpeaGota(e) { if (IS.Jugador.golpeaGota(estado.J, e.dir)) efectosDaño(); }
    function cogeZana() { avisaMarcador(); P.sonido('carrot'); }

    const EVENTOS = {
      salpica: e => P.salpica(e.x, e.y, e.z, e.n, e.col),
      suena: e => P.sonido(e.nombre),
      pisa: e => (e.clase === 'pez' ? pisaPez(e) : rebota()),
      golpe: e => golpeado(e.dx),
      gotaGolpea: golpeaGota,
      cocoGolpea: () => daño(),
      cogeZana,
      meta: () => acaba(true),
    };
    const aplica = eventos => { for (const e of eventos) EVENTOS[e.tipo](e); };

    function pasoGaviotas(dt) {
      const m = mundo();
      aplica(IS.pasoGaviotas(m, dt));
      estado.tGav = m.tGav;
    }
    function pasoBichos(dt) {   // el orden es el de siempre: cambiarlo cambia el azar
      for (const e of estado.enemigos) IS.pasoBrotito(mundo(), e, dt);
      for (const f of estado.peces) aplica(IS.pasoPez(mundo(), f, dt));
      for (const k of estado.cangrejos) IS.pasoCangrejo(mundo(), k, dt);
      aplica(IS.pasoGotas(mundo(), dt));
      pasoGaviotas(dt);
    }
    function paso(dt, relojNuevo) {   // un fotograma; no hace nada si la sesión no está en juego
      reloj = relojNuevo;
      if (!estado.jugando) return;
      mando = mandos();
      pasoJugador(dt);
      pasoBichos(dt);
      aplica(IS.choques(mundo()));
    }
    return { nueva, empieza, paso, estado, cogidas, nivel, fisica, pose: () => IS.Jugador.pose(estado.J) };
  };
}
