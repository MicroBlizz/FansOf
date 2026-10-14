// Fans Of · Arte: las cajas de cada sprite, buildSprites y drawVector (se carga después de todos los dibujos)
'use strict';
// sprite box: [width, height, anchorX, anchorY]
Object.assign(BOX, {
  squirrel: [60, 56, 30, 50], fox: [70, 62, 35, 56], bunny: [90, 96, 45, 88],
  becario: [52, 48, 26, 42], starbot: [60, 58, 28, 52], fallen: [70, 66, 35, 60],
  beaver: [56, 56, 28, 50], meercat: [64, 60, 32, 54], junkcoon: [66, 60, 33, 54], mechavaca: [84, 78, 42, 70], vaca: [52, 50, 26, 44],
  necrolord: [84, 92, 42, 84], skeleton: [44, 40, 22, 36], zombie: [54, 50, 27, 44], ghostmage: [62, 66, 31, 60], banshee: [64, 60, 32, 54], skullknight: [76, 78, 38, 70], stitchbrute: [92, 84, 46, 76],
  u_tower: [70, 96, 35, 90], u_base: [124, 128, 62, 120], u_rubble: [64, 40, 32, 30],
  twitchking: [86, 92, 43, 84], subswarm: [44, 42, 22, 38], hypebeast: [56, 56, 28, 50], viralbot: [60, 58, 30, 52], snackmom: [62, 60, 31, 54], hypetrain: [86, 68, 43, 62], banhammer: [86, 82, 43, 74],
  epicchampion: [90, 96, 45, 88], cupidarcher: [60, 58, 30, 52], hoplite: [56, 58, 28, 52], shieldmaiden: [66, 66, 33, 58], thundergod: [70, 72, 35, 64], medusa: [64, 62, 32, 54], minotaur: [86, 84, 43, 76],
  cybermarine: [88, 90, 44, 82], drone: [44, 40, 22, 36], nanobot: [40, 36, 20, 32], cyberninja: [60, 56, 30, 50], techdroid: [60, 58, 30, 52], hackerkid: [56, 52, 28, 46], neonsniper: [72, 58, 36, 52], siegemech: [92, 82, 46, 74],
  memelord: [84, 90, 42, 82], suchdog: [56, 52, 28, 46], gifblaster: [60, 56, 30, 50], synthcat: [64, 56, 32, 50], trollbot: [70, 66, 35, 58], stonks: [64, 64, 32, 56], chonkcat: [92, 80, 46, 72],
  s_tower: [70, 100, 35, 94], s_base: [124, 124, 62, 116], h_tower: [70, 108, 35, 102], h_base: [130, 128, 65, 120], c_tower: [70, 96, 35, 90], c_base: [130, 124, 65, 116], m_tower: [70, 100, 35, 94], m_base: [124, 128, 62, 120], x_rubble: [64, 40, 32, 30],
  p_tower: [70, 96, 35, 90], p_base: [124, 120, 62, 112], e_tower: [64, 100, 32, 94], e_base: [140, 162, 70, 154],
  p_rubble: [64, 40, 32, 30], e_rubble: [64, 40, 32, 30],
  cajabotin: [64, 56, 32, 50], soportebot: [60, 60, 30, 54], parchebot: [80, 74, 40, 66],
  vikingo: [96, 96, 48, 88], vikingsquad: [52, 52, 26, 46], swarmbug: [44, 34, 20, 30], retromarine: [72, 62, 34, 56], ghostagent: [72, 56, 30, 50], rockracer: [64, 40, 32, 34], titanbeta: [96, 84, 48, 76],
  o_tower: [70, 100, 35, 94], o_base: [124, 124, 62, 116],
  descargabot: [44, 50, 22, 44], licenciabot: [56, 56, 26, 50], plusbot: [56, 52, 26, 46], cobradlc: [64, 62, 30, 56], servidorbot: [76, 76, 38, 70], remasterbot: [80, 72, 38, 64],
  y_tower: [70, 104, 35, 98], y_base: [130, 132, 65, 124],
  directora: [92, 86, 44, 78], extras: [40, 42, 20, 38], doble: [52, 52, 26, 46], heroe: [56, 60, 28, 56], detective: [58, 58, 26, 52], spoiler: [56, 56, 26, 50], kaiju: [100, 80, 54, 72],
  k_tower: [70, 96, 35, 90], k_base: [124, 120, 62, 112],
  progamer: [90, 88, 42, 80], noobs: [40, 44, 20, 40], speedrunner: [56, 50, 28, 46], modder: [56, 56, 26, 50], coleccionista: [60, 56, 30, 50], ragequitter: [60, 70, 28, 64], recreativa: [76, 80, 38, 72],
  g_tower: [70, 92, 35, 86], g_base: [124, 116, 62, 108],
  // v0.9.15: gashapón de cartas
  ceo: [60, 72, 26, 68], presi: [60, 72, 26, 68], sp_crunch: [56, 54, 28, 50], sp_review: [56, 54, 28, 50], huron: [64, 56, 32, 50], sombra: [62, 60, 31, 54], hater: [64, 64, 30, 58], arpia: [64, 60, 32, 54], dron: [56, 50, 28, 44], clickbait: [52, 56, 26, 50], campero: [60, 58, 30, 52], espia: [56, 60, 28, 54], paparazzi: [60, 60, 26, 54], sp_bellotas: [56, 54, 28, 50], sp_botiquin: [56, 54, 28, 50], sp_pulgas: [56, 54, 28, 50], sp_lapidas: [56, 54, 28, 50], sp_formol: [56, 54, 28, 50], sp_eternas: [56, 54, 28, 50], sp_donaciones: [56, 54, 28, 50], sp_merienda: [56, 54, 28, 50], sp_baneo: [56, 54, 28, 50], sp_rayo: [56, 54, 28, 50], sp_ambrosia: [56, 54, 28, 50], sp_nerfeo: [56, 54, 28, 50], sp_orbital: [56, 54, 28, 50], sp_nanobots: [56, 54, 28, 50], sp_update: [56, 54, 28, 50], sp_gatos: [56, 54, 28, 50], sp_likes: [56, 54, 28, 50], sp_confusion: [56, 54, 28, 50], sp_critico: [56, 54, 28, 50], sp_energetica: [56, 54, 28, 50], sp_ping: [56, 54, 28, 50], sp_cartuchos: [56, 54, 28, 50], sp_parchefan: [56, 54, 28, 50], sp_cancelado: [56, 54, 28, 50], sp_taquilla: [56, 54, 28, 50], sp_maquillaje: [56, 54, 28, 50], sp_remake: [56, 54, 28, 50], sp_despido: [56, 54, 28, 50], sp_cobro: [56, 54, 28, 50],
});
const SPR = {};
function buildSprites() {
  for (const key in ART) {
    const [w, h, ax, ay] = BOX[key];
    const c = document.createElement('canvas'); c.width = Math.ceil(w * RES); c.height = Math.ceil(h * RES);
    const x = c.getContext('2d'); x.scale(RES, RES); x.translate(ax, ay); x.lineJoin = 'round'; x.lineCap = 'round';
    ART[key](x);
    if (!key.endsWith('_rubble')) {   // v0.9.8: luz suave arriba y sombra abajo para dar volumen
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
      const sg = x.createLinearGradient(0, 0, 0, c.height);
      sg.addColorStop(0, 'rgba(255,248,225,.24)'); sg.addColorStop(0.4, 'rgba(255,248,225,0)'); sg.addColorStop(0.66, 'rgba(40,10,60,0)'); sg.addColorStop(1, 'rgba(40,10,60,.3)');
      x.fillStyle = sg; x.fillRect(0, 0, c.width, c.height); x.restore();
    }
    const wc = document.createElement('canvas'); wc.width = c.width; wc.height = c.height;
    const wx = wc.getContext('2d'); wx.drawImage(c, 0, 0); wx.globalCompositeOperation = 'source-in'; wx.fillStyle = '#fff'; wx.fillRect(0, 0, wc.width, wc.height);
    let gc = null;
    if (TYPES[key]) { gc = document.createElement('canvas'); gc.width = c.width; gc.height = c.height; const gx = gc.getContext('2d'); gx.drawImage(c, 0, 0); gx.globalCompositeOperation = 'source-in'; gx.fillStyle = '#9aa3a0'; gx.fillRect(0, 0, gc.width, gc.height); }
    SPR[key] = { c, w: wc, g: gc, wd: w, ht: h, ax, ay };
  }
}
// draw a character straight from vectors (sharp at any size: cards and title)
function drawVector(c, key, x, y, h, flip = 1) {
  const sc = h / (TYPES[key] ? TYPES[key].top : TOPS[key]);
  c.save(); c.translate(x, y); c.scale(sc * flip, sc); c.lineJoin = 'round'; c.lineCap = 'round'; ART[key](c);
  const T = TYPES[key];
  if (T && T.foot) { for (const fx of [-0.4, 0.4]) { const r = CFG.units[key].r; c.beginPath(); c.ellipse(fx * r, -1, r * 0.3, r * 0.19, 0, 0, Math.PI * 2); c.fillStyle = T.foot; c.fill(); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); } }
  c.restore();
}

/* ---------- arena background (painted once) ---------- */
