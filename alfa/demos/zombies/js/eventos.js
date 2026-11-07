// Fans of Zombies · LO QUE PASA (pantalla): lee e.eventos de las reglas y los convierte en sonidos, temblores rojos y avisos de la
// radio (el parche de cada mañana, las alarmas, los gritos del streamer, la oleada del anochecer, el corte de luz, el botín…).
'use strict';
const NO_PUEDES = {
  sinSueno: 'No tienes sueño todavía.', hayZombis: 'Con fans tan cerca no hay quien duerma.', noTienes: 'No te queda de eso.',
  nadaCerca: 'No hay nada que registrar aquí.', sinArma: 'No llevas esa arma en la mochila.', sinFuego: 'Para cocinar necesitas un fuego o una cocina con luz.', faltaMaterial: 'Te falta material.', sinAgua: 'Ya no sale agua.', sinBotella: 'No tienes ninguna botella vacía.', noSeDesmonta: 'Esto no se puede desmontar.', yaDesmontado: 'Ya está desmontado.', sinHerramienta: 'Necesitas una palanca o un martillo.', sinMartillo: 'Necesitas un martillo.', sinTablas: 'Necesitas tablas y 2 clavos.', yaTapado: 'Ya tiene 3 tablas.', puertaRota: 'Esa puerta ya no existe.', conTablas: 'Tiene tablas clavadas.', sinRefugio: 'No tienes refugio al que mandarlo.', sinLlave: 'No tienes la llave de este coche. Registra su guantera o busca en las casas de alrededor.', cocheRoto: 'Este coche ya no arranca.', tanqueLleno: 'El depósito está lleno.', sinGasolina: 'No llevas ningún bidón de gasolina.', nadaQueCurar: 'No tienes ninguna herida que necesite eso.', faltan: 'No te queda de eso.', noHaceFalta: 'No hace falta.',
};
// lo que cuenta la radio al cambiar de estación y el parche de Microblizz que la acompaña
const AVISO_ESTACION = { invierno: 'Llega el invierno. Vuelve la nieve: tus huellas te delatan y el frío da hambre.', primavera: 'Llega la primavera. Se funde la nieve: la lluvia tapa tus ruidos y los huertos dan verdura.', verano: 'Llega el verano. Calor: bebe el doble, la carne se pudre y los fans van más rápido.', otono: 'Llega el otoño. Niebla y hojas secas: se ve menos y tus pasos crujen.' };
const TEXTO_ESTACION = { invierno: 'Hemos añadido el invierno. La calefacción es contenido de pago.', primavera: 'Primavera: hemos cambiado la nieve por lluvia. No hace falta que nos lo agradezcáis.', verano: 'Verano: el aire acondicionado llegará en la temporada 2.', otono: 'Otoño: las hojas caídas son un error conocido. No lo arreglaremos.' };
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
  infectado: () => avisa(tr('Te han infectado. Busca antibióticos o a la médica del refugio.'), 'malo'),
  herida: (v) => { avisa(trf('%1 en %2.', tr(ZOM.AJ.cuerpo.heridas[v.herida].n), tr(NOMBRE_PARTE[v.parte])), 'malo'); },
  ropaPara: () => avisa(tr('La ropa ha parado el mordisco.'), 'bien'),
  curada: (v) => avisa(trf('Se ha curado: %1 en %2.', tr(ZOM.AJ.cuerpo.heridas[v.herida].n), tr(NOMBRE_PARTE[v.parte])), 'bien'),
  cura: () => play('cura'),
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
  ropaRota: (v) => { play('metal'); avisa(trf('Se te ha roto: %1.', tr(ZOM.AJ.objetos[v.id].n)), 'malo'); },
  viste: (v) => { play('coge'); avisa(trf('Te pones: %1.', tr(ZOM.AJ.objetos[v.id].n))); },
  cose: (v) => { play('fabrica'); avisa(trf('Has cosido: %1.', tr(ZOM.AJ.objetos[v.id].n)), 'bien'); },
  despierta: (v) => avisa(tr(v.susto ? '¡Te despiertas de golpe! Hay fans cerca.' : 'Te despiertas descansado.'), v.susto ? 'malo' : 'bien'),
  noPuedes: (v) => avisa(tr(NO_PUEDES[v.codigo] || 'No puedes hacer eso ahora.')),
  muerte: () => play('dolor'),
  puerta: () => play('puerta'),
  tabla: (v) => { play('fabrica'); avisa(trf('Tabla clavada (%1/3).', v.tablas), 'bien'); },
  tablaRota: () => play('metal'),
  huecoRoto: (v) => { play(v.hueco === 'ventana' ? 'metal' : 'puerta'); avisa(tr(v.hueco === 'ventana' ? '¡Han roto una ventana!' : '¡Han tirado una puerta!'), 'malo'); },
  golpeHueco: () => play('impacto'),
  llave: (v) => { play('coge'); avisa(tr(v.donde === 'guantera' ? '¡La llave estaba en la guantera! Ya puedes subir (F).' : 'Entre las cosas había la llave de un coche de por aquí. La guardas en el llavero.'), 'bien'); },
  subeCoche: (v) => { play('metal'); if (v.gas <= 0) avisa(tr('No le queda gasolina. Busca un bidón (G para repostar).'), 'malo'); },
  bajaCoche: () => play('puerta'),
  reposta: (v) => { play('bebe'); avisa(trf('Depósito al %1 %.', Math.round(v.gas * 100)), 'bien'); },
  choque: (v) => { play('impacto'); EFECTOS.temblor = Math.max(EFECTOS.temblor, Math.min(0.4, v.v * 0.02)); },
  atropello: (v) => { const J = JUEGO.e.jugador; play('carne'); sangre(v.x, v.z, 8, J.x, J.z); zombiRespingo(v.id); },
  estacion: (v) => { play('alerta'); HUD.parche = { dia: ZOM.diaDe(JUEGO.e.min), parche: { n: TEXTO_ESTACION[v.estacion] } }; HUD.tParche = 14; avisa(tr(AVISO_ESTACION[v.estacion]), 'malo'); },
  poda: (v) => { for (const id of v.ids) quitaVistaZombi(id); },
  hayRescate: () => { play('alerta'); avisa(tr('Por la radio: alguien pide ayuda muy cerca. Está atrapado en un edificio y rodeado de fans.'), 'bien'); },
  rescate: (v) => { play('win'); avisa(trf('%1 se va a tu refugio. Hará de %2.', ZOM.AJ.animales[v.animal].n, tr(OFICIO_TXT[v.oficio]).toLowerCase()), 'bien'); },
  vigia: (v) => { play('alerta'); avisa(trf('Desde el refugio: ¡hay %1 fans cerca!', v.n), 'malo'); },
  despensa: () => avisa(tr('Han dejado comida en la despensa del refugio.'), 'bien'),
  reparado: (v) => { if (v.n) avisa(trf('Han reforzado %1 puertas y ventanas del refugio.', v.n), 'bien'); },
  rescateMuere: (v) => { play('dolor'); avisa(trf('Los fans han entrado en el refugio y han matado a %1.', ZOM.AJ.animales[v.animal].n), 'malo'); },
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
