// Fans of Rouflage · ARMARIO (datos 2): más cosas inspiradas en las unidades del Rumble, añadidas al CATALOGO_AR de armario-datos.js.
// - CONJUNTOS nuevos (un personaje entero): cada uno trae su cabeza, su espalda, su papel y, a veces, ojos o boca propios; esas piezas
//   salen aquí solas (de: conjunto: son tuyas si tienes el conjunto). El dibujo está en armario-dibujo3.js (cuerpo) y armario-dibujo4.js (papeles).
// - Más titulos, colores de humo y de linterna, y la categoría MASCOTAS (dibujos en armario-mascotas.js; cómo se mueven en mascotas.js).
// Los precios no están aquí: los fija la rareza en armario-precios.js.
'use strict';
(() => {
  const { vestida, OJOS, BOCAS, humo, linterna, titulo, MASCOTAS, mascotaIcono } = ARD;
  const cat = id => CATALOGO_AR.find(c => c.id === id);
  const it = (id, n, r, de, txt, x, v) => ({ id, n, r, de, txt, x, v });
  const G = o => (c, w) => vestida(c, w, w, Object.assign({ esc: w / 88 }, o));
  const caraIcono = (ojos, boca) => (c, w) => { c.save(); c.translate(w / 2, w / 2); c.scale(w / 34, w / 34); ARD.shape(c, ARD.el(0, 0, 11.5, 11.5), '#f4f1fa', 2.2); ARD.cara(c, ojos, boca, 2, 0); c.restore(); };

  /* ---------- conjuntos: [id, nombre, rareza, cabeza, [id espalda, nombre], papel, [nombre papel], ojos, bocas, piezas propias] ---------- */
  // pieza: [categoría ('cabeza', 'espalda', 'papel', 'ojos', 'bocas'), id, nombre]
  const CONJ = [
    ['marine', 'CyberMarine', 'epica', { cabeza: ['cascoMarine', 'Casco de CyberMarine'], espalda: ['mochilaMarine', 'Mochila de CyberMarine'], papel: ['marine', 'Traje de CyberMarine'], ojos: 'grandes', bocas: 'sonrisa' }],
    ['hackerkid', 'HackerKid', 'rara', { cabeza: ['capucha', 'Capucha de HackerKid'], espalda: ['portatil', 'Portátil de HackerKid'], papel: ['hacker', 'Sudadera de HackerKid'], ojos: 'campana', bocas: 'o' }],
    ['neonsniper', 'NeonSniper', 'epica', { cabeza: ['gorroNeon', 'Gorra de NeonSniper'], espalda: ['rifle', 'Rifle de NeonSniper'], papel: ['neon', 'Traje de NeonSniper'], ojos: ['neonojos', 'Ojos de NeonSniper'], bocas: 'sonrisa' }],
    ['speedrunner', 'Speedrunner', 'comun', { cabeza: ['cinta', 'Cinta de Speedrunner'], espalda: ['cronometro', 'Cronómetro de Speedrunner'], papel: ['speedrun', 'Chándal de Speedrunner'], ojos: 'grandes', bocas: 'o' }],
    ['ragequitter', 'RageQuitter', 'rara', { cabeza: ['vapor', 'Vapor de RageQuitter'], espalda: ['mandoRoto', 'Mando roto de RageQuitter'], papel: ['ragequit', 'Camiseta de RageQuitter'], ojos: ['enfadado', 'Cejas de RageQuitter'], bocas: ['grito', 'Grito de RageQuitter'] }],
    ['recreativa', 'Recreativa', 'epica', { cabeza: ['pantallaRec', 'Pantalla de Recreativa'], espalda: ['joystick', 'Joystick de Recreativa'], papel: ['recre', 'Carcasa de Recreativa'], ojos: ['pixel', 'Píxeles de Recreativa'], bocas: 'o' }],
    ['cupidarcher', 'CupidArcher', 'comun', { cabeza: ['alitas', 'Alitas de CupidArcher'], espalda: ['arcoCupido', 'Arco de CupidArcher'], papel: ['cupido', 'Túnica de CupidArcher'], ojos: 'campana', bocas: 'sonrisa' }],
    ['shieldmaiden', 'ShieldMaiden', 'rara', { cabeza: ['cascoAlado', 'Casco alado de ShieldMaiden'], espalda: ['escudoRedondo', 'Escudo de ShieldMaiden'], papel: ['escudo', 'Armadura de ShieldMaiden'], ojos: 'campana', bocas: 'sonrisa' }],
    ['thundergod', 'ThunderGod', 'epica', { cabeza: ['coronaRayos', 'Corona de ThunderGod'], espalda: ['martilloRayo', 'Martillo de ThunderGod'], papel: ['trueno', 'Túnica de ThunderGod'], ojos: ['electrico', 'Ojos de ThunderGod'], bocas: 'sonrisa' }],
    ['minotaur', 'Minotaur', 'epica', { cabeza: ['cuernosToro', 'Cuernos de Minotaur'], espalda: ['hachaDoble', 'Hacha de Minotaur'], papel: ['minotauro', 'Pelaje de Minotaur'], ojos: 'grandes', bocas: 'o' }],
    ['memelord', 'MemeLord', 'legend', { cabeza: ['coronaPixel', 'Corona de MemeLord'], espalda: ['capaMeme', 'Capa de MemeLord'], papel: ['meme', 'Sudadera de MemeLord'], ojos: 'campana', bocas: 'sonrisa' }],
    ['synthcat', 'SynthCat', 'rara', { cabeza: ['orejasSynth', 'Orejas de SynthCat'], espalda: ['tecladoSynth', 'Teclado de SynthCat'], papel: ['synth', 'Pelaje de SynthCat'], ojos: 'campana', bocas: 'sonrisa' }],
    ['stonks', 'Stonks', 'rara', { cabeza: ['sombreroStonks', 'Bombín de Stonks'], espalda: ['flechaStonks', 'Flecha de Stonks'], papel: ['stonks', 'Traje de Stonks'], ojos: 'grandes', bocas: 'sonrisa' }],
    ['chonkcat', 'ChonkCat', 'epica', { cabeza: ['orejasChonk', 'Orejas de ChonkCat'], espalda: ['colaChonk', 'Cola de ChonkCat'], papel: ['chonk', 'Pelaje de ChonkCat'], ojos: 'dormido', bocas: ['gato', 'Bigotes de ChonkCat'] }],
    ['skeleton', 'SkeletonCrew', 'comun', { cabeza: ['huesoPelo', 'Hueso de SkeletonCrew'], espalda: ['costillar', 'Costillas de SkeletonCrew'], papel: ['hueso', 'Huesos de SkeletonCrew'], ojos: ['cruces', 'Cuencas de SkeletonCrew'], bocas: 'sonrisa' }],
    ['zombie', 'CrunchZombie', 'rara', { cabeza: ['cerebro', 'Cerebro de CrunchZombie'], espalda: ['brazoZombi', 'Brazo de CrunchZombie'], papel: ['zombi', 'Piel de CrunchZombie'], ojos: 'dormido', bocas: ['dientes', 'Dientes de CrunchZombie'] }],
    ['ghostmage', 'GhostMage', 'epica', { cabeza: ['gorroMago', 'Sombrero de GhostMage'], espalda: ['colaEspectro', 'Cola de GhostMage'], papel: ['espectro', 'Túnica de GhostMage'], ojos: 'grandes', bocas: 'o' }],
    ['vikingo', 'VikingoPerdido', 'legend', { cabeza: ['cascoViking', 'Casco de VikingoPerdido'], espalda: ['escudoViking', 'Escudo de VikingoPerdido'], papel: ['vikingo', 'Pieles de VikingoPerdido'], ojos: 'campana', bocas: 'sonrisa' }],
    ['directora', 'LaDirectora', 'legend', { cabeza: ['boina', 'Boina de LaDirectora'], espalda: ['claqueta', 'Claqueta de LaDirectora'], papel: ['directora', 'Traje de LaDirectora'], ojos: ['dorados', 'Mirada de LaDirectora'], bocas: 'sonrisa' }],
    ['detective', 'Detective', 'rara', { cabeza: ['sombreroDetective', 'Sombrero de Detective'], espalda: ['lupa', 'Lupa de Detective'], papel: ['detective', 'Gabardina de Detective'], ojos: 'grandes', bocas: 'o' }],
    ['paparazzi', 'Paparazzi', 'epica', { cabeza: ['flashCabeza', 'Flash de Paparazzi'], espalda: ['camaraGrande', 'Cámara de Paparazzi'], papel: ['paparazzi', 'Chaleco de Paparazzi'], ojos: 'grandes', bocas: 'sonrisa' }],
    ['streamking', 'StreamKing', 'legend', { cabeza: ['coronaStream', 'Corona de StreamKing'], espalda: ['anilloLuz', 'Aro de luz de StreamKing'], papel: ['streamer', 'Sudadera de StreamKing'], ojos: 'campana', bocas: 'sonrisa' }],
    ['banhammer', 'BanHammer', 'epica', { cabeza: ['cascoMod', 'Casco de BanHammer'], espalda: ['martillo', 'Martillo de BanHammer'], papel: ['martillo', 'Uniforme de BanHammer'], ojos: 'campana', bocas: 'o' }],
    ['mechavaca', 'MechaVaca', 'epica', { cabeza: ['orejasVaca', 'Cuernos de MechaVaca'], espalda: ['tanqueMecha', 'Mecha de MechaVaca'], papel: ['mecha', 'Manchas de MechaVaca'], ojos: 'grandes', bocas: 'sonrisa' }],
  ];
  const PIEZA = { cabeza: k => G({ cabeza: k, esc: 1.3 }), espalda: k => G({ espalda: k, esc: 1.25 }), papel: k => G({ papel: k }), ojos: k => caraIcono(OJOS[k], null), bocas: k => caraIcono(null, BOCAS[k]) };
  for (const [id, n, r, p] of CONJ) {
    const piezas = {}, dc = 'Conjunto ' + n;
    for (const k of ['cabeza', 'espalda', 'papel', 'ojos', 'bocas']) {
      const v = p[k]; if (!v) continue;
      if (typeof v === 'string') { piezas[k] = v; continue; }      // una pieza que ya existe (base): solo se pone
      piezas[k] = v[0]; cat(k).items.push(it(v[0], v[1], r, 'conjunto', dc, PIEZA[k](v[0]), v[0]));
    }
    const o = { cabeza: piezas.cabeza, espalda: piezas.espalda, ojos: OJOS[piezas.ojos], boca: BOCAS[piezas.bocas], papel: piezas.papel };
    cat('conjuntos').items.push(Object.assign(it(id, n, r, 'tienda', 0, G(o)), { piezas }));
  }

  /* ---------- títulos, humo y linterna ---------- */
  const TI = (t, col) => Object.assign((c, w) => titulo(c, w, t, col), { texto: t, color: col });
  cat('titulos').items.push(
    it('doble', 'Doble de riesgo', 'comun', 'tienda', 0, TI('DOBLE DE RIESGO', '#cdb9ea')), it('lunes', 'Alérgico al lunes', 'comun', 'tienda', 0, TI('ALÉRGICO AL LUNES', '#7ee04a')),
    it('siesta', 'Pro de la siesta', 'comun', 'tienda', 0, TI('PRO DE LA SIESTA', '#b48cff')), it('espnada', 'Especialista en nada', 'rara', 'tienda', 0, TI('ESPECIALISTA EN NADA', '#39d5e8')),
    it('memero', 'Cazador de memes', 'rara', 'tienda', 0, TI('CAZADOR DE MEMES', '#f97316')), it('streamer', 'Streamer de pasillo', 'rara', 'tienda', 0, TI('STREAMER DE PASILLO', '#9146ff')),
    it('rrhh', 'RR. HH. me quiere', 'rara', 'tienda', 0, TI('RR. HH. ME QUIERE', '#ff6fb5')), it('kaiju', 'Kaiju de oficina', 'epica', 'tienda', 0, TI('KAIJU DE OFICINA', '#34d399')),
    it('mejorjefe', 'Mejor que tu jefe', 'epica', 'tienda', 0, TI('MEJOR QUE TU JEFE', '#ffcb3d')), it('rumble', 'Campeón del Rumble', 'legend', 'tienda', 0, TI('CAMPEÓN DEL RUMBLE', '#ff4b5c')),
    it('microblizz', 'Aprobado por Microblizz', 'legend', 'tienda', 0, TI('APROBADO POR MICROBLIZZ', '#ffcb3d')),
  );
  const H = col => Object.assign((c, w) => humo(c, w, col), { colores: col });
  cat('humo').items.push(
    it('nube', 'Nube de tormenta', 'comun', 'tienda', 0, H(['#64748b', '#94a3b8'])), it('bosque', 'Bosque', 'comun', 'tienda', 0, H(['#166534', '#4ade80', '#bbf7d0'])),
    it('rayo', 'Rayo', 'rara', 'tienda', 0, H(['#fde047', '#38bdf8'])), it('lava', 'Lava', 'rara', 'tienda', 0, H(['#ef4444', '#f97316', '#fde047'])),
    it('neon', 'Neón', 'epica', 'tienda', 0, H(['#ff3df0', '#22e3ff', '#a855f7'])), it('oro', 'Polvo de oro', 'legend', 'tienda', 0, H(['#facc15', '#fde68a', '#fff7d6'])),
  );
  const L = (col, b) => Object.assign((c, w) => linterna(c, w, col, b), { color: col, borde: b });
  cat('linterna').items.push(
    it('violeta', 'Violeta', 'comun', 'tienda', 0, L('rgba(180,92,255,.5)', 'linea')), it('menta', 'Menta', 'comun', 'tienda', 0, L('rgba(126,224,190,.5)', '')),
    it('rosa', 'Rosa chicle', 'rara', 'tienda', 0, L('rgba(255,111,181,.5)', 'puntos')), it('fuego', 'Fuego', 'epica', 'tienda', 0, L('rgba(255,100,40,.55)', 'estrellas')),
  );

  /* ---------- mascotas: [id, nombre, rareza, de, texto] ---------- */
  const MASC = [
    ['conejo', 'Conejito de CrazyBunny', 'comun', 'base', 'Al empezar'], ['pollo', 'Pollito de oficina', 'comun', 'gratis', 'Pase gratis · nv 2'],
    ['ardilla', 'Ardillita de MadSquirrel', 'comun', 'tienda', 0], ['perro', 'Perrito de SuchDog', 'comun', 'gratis', 'Pase gratis · nv 19'],
    ['nanobot', 'NanoBot', 'comun', 'tienda', 0], ['bichito', 'Bicho de SwarmBugs', 'comun', 'tienda', 0],
    ['zorro', 'Zorrito de SlyFox', 'rara', 'tienda', 0], ['castor', 'Castorcito de BoomBeaver', 'rara', 'tienda', 0], ['suricato', 'Suricato de MeerCat', 'rara', 'tienda', 0],
    ['mapache', 'Mapachito de JunkCoon', 'rara', 'tienda', 0], ['vaca', 'Vaquita de MechaVaca', 'rara', 'tienda', 0], ['gato', 'Gatito de ChonkCat', 'rara', 'tienda', 0],
    ['calavera', 'Calavera saltarina', 'rara', 'tienda', 0], ['murcielago', 'Murciélago de oficina', 'rara', 'tienda', 0], ['pulpo', 'Pulpito', 'rara', 'tienda', 0],
    ['huron', 'Hurón ninja', 'epica', 'amigos', 'Trae amigos · 3'], ['zombi', 'Zombi en miniatura', 'epica', 'tienda', 0], ['fantasma', 'Fantasmita de GhostMage', 'epica', 'premium', 'Pase premium · nv 13'],
    ['kaiju', 'Kaiju de goma', 'epica', 'tienda', 0], ['recreativa', 'Recreativa en miniatura', 'epica', 'tienda', 0], ['cupido', 'Corazón alado de CupidArcher', 'epica', 'premium', 'Pase premium · nv 32'],
    ['serpiente', 'Serpiente de Medusa', 'epica', 'tienda', 0], ['dron', 'Dron cazador', 'legend', 'amigos', 'Trae amigos · 10'],
  ];
  CATALOGO_AR.push({ id: 'mascotas', nombre: 'Mascotas', corto: 'Mascotas', nota: 'Te siguen mientras te preparas y salen corriendo al empezar. Todos ven su aspecto, pero no cambian cómo se juega', vacio: true, cuerpo: true,
    items: MASC.map(([id, n, r, de, txt]) => it(id, n, r, de, txt, mascotaIcono(id), id)) });
})();
