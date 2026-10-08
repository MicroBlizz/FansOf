// Fans of Rumble · RETOS: el armario (marcos del avatar y títulos) y los dos pases (Temporada y PvP). Solo datos.
// El sistema está en core/js/armario.js (marcos y títulos) y core/js/retos.js (pases). Los marcos se dibujan en armario.js (MARCO_ARTE).
// rar: la rareza (los colores de siempre). serie: lo tienes desde el principio. Lo demás se gana en los pases.
'use strict';
Object.assign(RETOS, {
  armario: {
    marcos: {
      normal:      { name: 'De serie', rar: 'basic', serie: true },
      billetes:    { name: 'Billetes', rar: 'rare' },
      corporativo: { name: 'Corporativo', rar: 'rare' },
      carton:      { name: 'Caja de despido', rar: 'epic' },
      accionista:  { name: 'Accionista', rar: 'epic' },
      maletin:     { name: 'Maletín de oro', rar: 'epic' },
      ceo:         { name: 'Trono del CEO', rar: 'legendary' },
      duelista:    { name: 'Duelista', rar: 'rare' },
      neon:        { name: 'Neón de sala', rar: 'rare' },
      paytowin:    { name: 'Pay to Win', rar: 'epic' },
      leyenda:     { name: 'Leyenda del sofá', rar: 'legendary' },
      trofeo:      { name: 'Trofeo de plástico', rar: 'legendary' },
    },
    titulos: {
      becario:     { name: 'Becario sin sueldo', rar: 'basic', serie: true },
      fiel:        { name: 'Cliente fiel', rar: 'basic' },
      minoritario: { name: 'Accionista minoritario', rar: 'common' },
      despedido:   { name: 'Despedido del mes', rar: 'rare' },
      riesgo:      { name: 'Inversor de riesgo', rar: 'epic' },
      agresivo:    { name: 'Ejecutivo agresivo', rar: 'rare' },
      tiburon:     { name: 'Tiburón de las fusiones', rar: 'epic' },
      consejo:     { name: 'Consejo de administración', rar: 'epic' },
      ceof:        { name: 'CEO en funciones', rar: 'legendary' },
      sofa:        { name: 'Duelista de sofá', rar: 'common' },
      sinpase:     { name: 'Sin pase y sin miedo', rar: 'epic' },
      pray:        { name: 'Pay to Pray', rar: 'rare' },
      ballena:     { name: 'Ballena competitiva', rar: 'epic' },
      tarjeta:     { name: 'Leyenda con tarjeta', rar: 'legendary' },
    },
  },

  /* ---------- PASE DE TEMPORADA (v0.9.92): temporada nueva, más larga, con capítulos y un hito cada 5 niveles ----------
     id: cambia en cada temporada (todos empiezan de cero y el Ejecutivo se vuelve a comprar). fin: último día (hora de Madrid). */
  pase: {
    id: 't1b', name: 'Temporada 1: La Gran Compra', levels: 50, xpPer: 800, eur: 4.99, xpWin: 100, xpLose: 40, xpDaily: 60, xpWeekly: 250, fin: '2026-11-22',
    capitulos: [
      { hasta: 10, tit: 'Microblizz compra la cafetera', txt: 'La primera adquisición. Ahora el café es de suscripción.' },
      { hasta: 20, tit: 'Microblizz compra tu estudio indie favorito', txt: 'Y lo cierra «para cuidarlo mejor».' },
      { hasta: 30, tit: 'Microblizz compra un museo', txt: 'Los cuadros ahora llevan anuncios antes de poder mirarlos.' },
      { hasta: 40, tit: 'Microblizz compra tu partida guardada', txt: 'Para continuar, acepta los nuevos términos (2.000 páginas).' },
      { hasta: 50, tit: 'Microblizz se compra a sí misma', txt: 'El CEO firma consigo mismo y se pone un bonus por la operación.' },
    ],
    // los hitos (cada 5 niveles); lo demás, oro, gemas y alguna tirada
    hitos: {
      free: { 5: { titulo: 'fiel' }, 10: { marco: 'billetes' }, 15: { tickets: 2 }, 20: { titulo: 'minoritario' }, 25: { marco: 'carton' }, 30: { tickets: 3 }, 35: { titulo: 'despedido' }, 40: { marco: 'maletin' }, 45: { titulo: 'riesgo' }, 50: { item: 'diploma' } },
      paid: { 5: { marco: 'corporativo' }, 10: { titulo: 'agresivo' }, 15: { tickets: 3 }, 20: { marco: 'accionista' }, 25: { titulo: 'tiburon' }, 30: { tickets: 4 }, 35: { titulo: 'consejo' }, 40: { marco: 'ceo' }, 45: { titulo: 'ceof' }, 50: { item: 'corbata_ceo' } },
    },
    premio(track, i) {
      const H = this.hitos[track][i]; if (H) return H;
      if (track === 'free') return i % 3 === 0 ? { gems: 15 } : { gold: 150 };
      return i % 2 === 0 ? { gems: 30 } : { gold: 400 };
    },
  },

  /* ---------- PASE PVP: solo se sube jugando PvP en línea. Todo es para lucirse (nada de vida ni daño). ---------- */
  pasePvp: {
    id: 'p1', name: 'Pase Competitivo Pro', levels: 30, xpPer: 300, eur: 2.99, xpWin: 100, xpLose: 40, fin: '2026-11-22',
    hitos: {
      free: { 5: { titulo: 'sofa' }, 10: { marco: 'duelista' }, 15: { tickets: 2 }, 20: { titulo: 'sinpase' }, 25: { tickets: 3 }, 30: { marco: 'leyenda' } },
      paid: { 5: { titulo: 'pray' }, 10: { marco: 'neon' }, 15: { titulo: 'ballena' }, 20: { marco: 'paytowin' }, 25: { titulo: 'tarjeta' }, 30: { marco: 'trofeo' } },
    },
    premio(track, i) {
      const H = this.hitos[track][i]; if (H) return H;
      if (track === 'free') return i % 2 === 0 ? { gems: 10 } : { gold: 200 };
      return i % 2 === 0 ? { gems: 20 } : { gold: 500 };
    },
  },
});
