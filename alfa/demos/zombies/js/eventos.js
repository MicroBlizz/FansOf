// Fans of Zombies · LO QUE PASA (pantalla): lee e.eventos de las reglas y los convierte en sonidos, temblores rojos y avisos de la
// radio (el parche de cada mañana, las alarmas, los gritos del streamer, la oleada del anochecer, el corte de luz, el botín…).
'use strict';
const NO_PUEDES = {
  sinSueno: 'No tienes sueño todavía.', hayZombis: 'Con fans tan cerca no hay quien duerma.', noTienes: 'No te queda de eso.',
  nadaCerca: 'No hay nada que registrar aquí.', sinArma: 'No llevas esa arma en la mochila.', sinFuego: 'Para cocinar necesitas un fuego o una cocina con luz.', faltaMaterial: 'Te falta material.', sinAgua: 'Ya no sale agua.', sinBotella: 'No tienes ninguna botella vacía.', noSeDesmonta: 'Esto no se puede desmontar.', yaDesmontado: 'Ya está desmontado.', sinHerramienta: 'Necesitas una palanca o un martillo.', sinMartillo: 'Necesitas un martillo.', sinTablas: 'Necesitas tablas y 2 clavos.', yaTapado: 'Ya tiene 3 tablas.', puertaRota: 'Esa puerta ya no existe.', conTablas: 'Tiene tablas clavadas.',
};
const EVENTOS = {
  parche: (v) => { HUD.parche = v; HUD.tParche = 12; play('alerta'); },
  alarma: () => { avisa(tr('¡Una alarma de coche! Todos los fans de la zona van hacia allí.'), 'malo'); play('alarma'); },
  grito: () => { avisa(tr('Un streamer te ha visto y está avisando a su chat.'), 'malo'); play('alerta'); },
  oleada: (v) => { avisa(trf('Anochece. Llegan %1 fans más al distrito.', v.n), 'malo'); play('bocina'); },
  corte: () => { avisa(tr('Se ha ido la luz en el distrito. Las noches serán más negras.'), 'malo'); play('cuelgue'); },
  abre: (v) => { play(v.nuevo && !v.cosas.length ? 'registra' : 'coge'); if (v.nuevo && !v.cosas.length) avisa(tr('Nada. Alguien pasó antes.')); abreMochila(); },
  usa: (v) => { TUTO.uso = true; play('bebe'); if (v.mal) { avisa(tr('Te ha sentado fatal.'), 'malo'); MOTOR.postMat.uniforms.dano.value = 0.5; } },
  fabrica: () => play('fabrica'),
  desmontado: (v) => { play('puerta'); avisa(trf('Mueble desmontado: %1 tablas y %2 clavos.', v.tablas, v.clavos), 'bien'); },
  corteAgua: () => { avisa(tr('Han cortado el agua. Los grifos ya no echan nada: guarda botellas.'), 'malo'); play('cuelgue'); },
  mordisco: () => { play('dolor'); MOTOR.postMat.uniforms.dano.value = 0.8; },
  infectado: () => avisa(tr('Te han infectado. Véndate (V) para frenarlo.'), 'malo'),
  ataque: (v) => {
    TUTO.pelea = true;
    const J = JUEGO.e.jugador, escopeta = v.arma === 'escopeta';
    play(escopeta ? 'escopeta' : v.arma === 'pistola' ? 'pistola' : 'esquiva'); efectoGolpe(v.arma);
    if (v.despide) avisa(tr('Despedido por la espalda. Como en Microblizz.'), 'bien');
    if (escopeta) { destello(J.x + Math.sin(J.a), 1.2, J.z + Math.cos(J.a), 0xffc060, 3, 0.08); efectoTrazas(J); }
    for (const t of v.tocados) { sangre(t.x, t.z, escopeta ? 9 : 5, J.x, J.z); zombiRespingo(t.id); }
    if (v.tocados.length) { play('carne'); EFECTOS.temblor = Math.max(EFECTOS.temblor, 0.07); }
  },
  empujon: (v) => { TUTO.pelea = true; play('esquiva'); efectoGolpe('empujon'); for (const id of v.tocados) zombiRespingo(id); if (v.tocados.length) play('impacto'); },
  baja: () => play('impacto'),
  sinMunicion: () => { play('vacio'); avisa(tr('Sin munición. Cambia de arma (1 a 6).')); },
  armaRota: (v) => { play('metal'); avisa(trf('Se te ha roto: %1.', tr(ZOM.AJ.armas[v.arma].n)), 'malo'); },
  despierta: (v) => avisa(tr(v.susto ? '¡Te despiertas de golpe! Hay fans cerca.' : 'Te despiertas descansado.'), v.susto ? 'malo' : 'bien'),
  noPuedes: (v) => avisa(tr(NO_PUEDES[v.codigo] || 'No puedes hacer eso ahora.')),
  muerte: () => play('dolor'),
  puerta: () => play('puerta'),
  tabla: (v) => { play('fabrica'); avisa(trf('Tabla clavada (%1/3).', v.tablas), 'bien'); },
  tablaRota: () => play('metal'),
  huecoRoto: (v) => { play(v.hueco === 'ventana' ? 'metal' : 'puerta'); avisa(tr(v.hueco === 'ventana' ? '¡Han roto una ventana!' : '¡Han tirado una puerta!'), 'malo'); },
  golpeHueco: () => play('impacto'),
  subeNivel: (v) => { play('fabrica'); avisa(trf('%1 sube a nivel %2.', tr(NOMBRE_HAB[v.hab][0]), v.nivel), 'bien'); },
  planta: (v) => entraPlanta(v.n),
  refuerzos: (v) => { avisa(trf('El CEO llama a %1 bots de atención al cliente.', v.n), 'malo'); play('alerta'); },
  embiste: () => { play('bocina'); EFECTOS.temblor = Math.max(EFECTOS.temblor, 0.12); },
  jefeCaido: () => { play('impacto'); EFECTOS.temblor = 0.4; musica('ciber'); SAVE.ceos = (SAVE.ceos || 0) + 1; guardaPartida(); avisa(tr('¡El CEO ha caído! Registra su maletín. Microblizz sigue sin jefe… y tú sigues vivo. De momento.'), 'bien'); },
};
// al cambiar de planta: el aviso, la música (la del jefe en la azotea) y el tejado de la torre de la calle
function entraPlanta(n) {
  const AJ = ZOM.AJ, e = JUEGO.e;
  play('puerta');
  if (n === ZOM.AZOTEA(AJ)) { musica('boss'); avisa(tr('La azotea. Ahí está EL CEO, rodeado de su escolta. Si cae él, cae Microblizz.'), 'malo'); return; }
  musica('ciber');
  if (!n) { avisa(tr('De vuelta en la calle.')); return; }
  avisa(n === 1 && !e.torre.avisada ? tr('Dentro de la Torre de Microblizz. Diez plantas de oficinas y, arriba del todo, el CEO.') : trf('Planta %1. Cuanto más arriba, más ejecutivos.', n), n > 6 ? 'malo' : '');
  e.torre.avisada = true;
}
function leeEventos(e) {
  for (const v of e.eventos) { const f = EVENTOS[v.tipo]; if (f) f(v); }
  e.eventos.length = 0;
}
