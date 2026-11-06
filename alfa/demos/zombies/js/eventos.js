// Fans of Zombies · LO QUE PASA (pantalla): lee e.eventos de las reglas y los convierte en sonidos, temblores rojos y avisos de la
// radio (el parche de cada mañana, las alarmas, los gritos del streamer, la oleada del anochecer, el corte de luz, el botín…).
'use strict';
const NOMBRE_COSA = { judias: 'judías', agua: 'agua', venda: 'venda', cartuchos: 'cartuchos' };
const NO_PUEDES = {
  sinSueno: 'No tienes sueño todavía.', hayZombis: 'Con fans tan cerca no hay quien duerma.', noTienes: 'No te queda de eso.',
  yaRegistrado: 'Aquí ya has mirado.', nadaCerca: 'No hay nada que registrar aquí.',
};
const EVENTOS = {
  parche: (v) => { HUD.parche = v; HUD.tParche = 12; play('alerta'); },
  alarma: () => { avisa(tr('¡Una alarma de coche! Todos los fans de la zona van hacia allí.'), 'malo'); play('alarma'); },
  grito: () => { avisa(tr('Un streamer te ha visto y está avisando a su chat.'), 'malo'); play('alerta'); },
  oleada: (v) => { avisa(trf('Anochece. Llegan %1 fans más al distrito.', v.n), 'malo'); play('bocina'); },
  corte: () => { avisa(tr('Se ha ido la luz en el distrito. Las noches serán más negras.'), 'malo'); play('cuelgue'); },
  botin: (v) => { play(v.cosas.length ? 'coge' : 'registra'); avisa(v.cosas.length ? trf('Encuentras: %1.', v.cosas.map((c) => tr(NOMBRE_COSA[c])).join(', ')) : tr('Nada. Alguien pasó antes.'), v.cosas.length ? 'bien' : ''); },
  mordisco: () => { play('dolor'); MOTOR.postMat.uniforms.dano.value = 0.8; },
  infectado: () => avisa(tr('Te han infectado. Véndate (V) para frenarlo.'), 'malo'),
  ataque: (v) => { play(v.arma === 'escopeta' ? 'escopeta' : 'esquiva'); if (v.arma === 'escopeta') { const J = JUEGO.e.jugador; destello(J.x + Math.sin(J.a), 1.2, J.z + Math.cos(J.a), 0xffc060, 3, 0.08); } if (v.tocados.length) play('carne'); },
  baja: () => play('impacto'),
  sinMunicion: () => { play('vacio'); avisa(tr('Sin cartuchos. Usa la palanca (2).')); },
  despierta: (v) => avisa(tr(v.susto ? '¡Te despiertas de golpe! Hay fans cerca.' : 'Te despiertas descansado.'), v.susto ? 'malo' : 'bien'),
  noPuedes: (v) => avisa(tr(NO_PUEDES[v.codigo] || 'No puedes hacer eso ahora.')),
  muerte: () => play('dolor'),
};
function leeEventos(e) {
  for (const v of e.eventos) { const f = EVENTOS[v.tipo]; if (f) f(v); }
  e.eventos.length = 0;
}
