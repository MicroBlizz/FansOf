// Fans of Zombies · RELOJ (dominio): la hora y el día, la noche, el parche de Microblizz de cada mañana, las alarmas de coche que
// saltan solas, las oleadas de fans que llegan al anochecer y el corte de luz. Lo que pasa se apunta en e.eventos para la pantalla.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.diaDe = (min) => Math.floor(min / 1440) + 1;
  Z.horaDe = (min) => ((min % 1440) + 1440) % 1440;
  Z.esNoche = (AJ, min) => { const h = Z.horaDe(min); return h < AJ.reloj.amanece || h >= AJ.reloj.anochece; };
  Z.textoHora = (min) => { const h = Z.horaDe(Math.floor(min)); return String(Math.floor(h / 60)).padStart(2, '0') + ':' + String(h % 60).padStart(2, '0'); };
  // ¿ha pasado la hora h (en minutos del día) entre antes y ahora?
  const cruza = (antes, ahora, h) => Math.floor((antes - h) / 1440) !== Math.floor((ahora - h) / 1440);
  Z.parcheDe = (AJ, e) => AJ.parches.find((p) => p.id === e.parche) || null;

  // avanza el reloj dt segundos reales (más rápido durmiendo) y lanza lo que toque
  Z.avanzaReloj = function (AJ, e, dt, mundo, azar) {
    const antes = e.min, ritmo = e.jugador.duerme ? AJ.reloj.minDormido : AJ.reloj.minPorSeg;
    e.min += dt * ritmo;
    if (cruza(antes, e.min, AJ.reloj.amanece)) nuevoParche(AJ, e, azar);
    if (cruza(antes, e.min, AJ.reloj.anochece)) oleada(AJ, e, mundo, azar);
    if (!e.sinLuz && Z.diaDe(e.min) >= e.diaCorte && cruza(antes, e.min, AJ.reloj.anochece - 60)) { e.sinLuz = true; e.eventos.push({ tipo: 'corte' }); }
    if (!e.sinAgua && Z.diaDe(e.min) >= e.diaCorteAgua && cruza(antes, e.min, 12 * 60)) { e.sinAgua = true; e.eventos.push({ tipo: 'corteAgua' }); }
    const horas = (e.min - antes) / 60;
    if (azar() < AJ.mundo.alarmaPorHora * horas) alarma(AJ, e, mundo, azar);
    return horas;
  };
  function nuevoParche(AJ, e, azar) {
    if (Z.diaDe(e.min) < 2) return;
    const p = AJ.parches[Math.floor(azar() * AJ.parches.length)];
    e.parche = p.id; e.eventos.push({ tipo: 'parche', parche: p, dia: Z.diaDe(e.min) });
  }
  function oleada(AJ, e, mundo, azar) {
    const p = Z.parcheDe(AJ, e), n = Math.round(AJ.mundo.oleada * e.dif.zombis * ((p && p.oleada) || 1));
    let llegan = 0;
    for (let i = 0; i < n && Z.vivos(e).length < AJ.mundo.maxZombis; i++) { const s = mundo.aparicion(azar); Z.nuevoZombi(AJ, e, Z.sortea(AJ.reparto, azar), s.x, s.z, azar); llegan++; }
    if (llegan) e.eventos.push({ tipo: 'oleada', n: llegan });
  }
  function alarma(AJ, e, mundo, azar) {
    const s = mundo.alarma(azar);
    if (!s) return;
    Z.haceRuido(AJ, e, s.x, s.z, AJ.ruido.alarma, 'alarma', AJ.ruido.duraAlarma);
    e.eventos.push({ tipo: 'alarma', x: s.x, z: s.z });
  }
})(ZOM);
