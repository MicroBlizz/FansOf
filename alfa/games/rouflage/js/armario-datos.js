// Fans of Rouflage · ARMARIO (datos): el catálogo de la Temporada 1. Primero los CONJUNTOS (un personaje del Rumble entero: cabeza,
// espalda, cara y papel a la vez) y luego las piezas sueltas por categoría. Cada cosa: id, nombre (n), rareza (r: comun, rara, epica,
// legend), de dónde sale (de: base, conjunto, gratis, premium, diario, tienda, migas, subs), el texto de cómo se consigue (txt; en la tienda
// es su precio en Purpurina, un número) y su dibujo de icono (x). Las piezas del cuerpo llevan además `v`: la clave de ARD con la que se
// dibujan sobre la galleta (OJOS, BOCAS, PAPEL/COLOR_PAPEL, CABEZAS, ESPALDAS). Todo es cosmético: nada cambia cómo se juega.
'use strict';
const CATALOGO_AR = (() => {
  const { vestida, cara, shape, el, OL, humo, rastro, fantasma, congelar, sello, linterna, marco, titulo, gesto, OJOS, BOCAS } = ARD;
  const it = (id, n, r, de, txt, x, v) => ({ id, n, r, de, txt, x, v });
  // la cabeza de la galleta en grande, con unos ojos o una boca puestos
  const caraIcono = (ojos, boca) => (c, w) => { c.save(); c.translate(w / 2, w / 2); c.scale(w / 34, w / 34); shape(c, el(0, 0, 11.5, 11.5), '#f4f1fa', 2.2); cara(c, ojos, boca, 2, 0); c.restore(); };
  const O = k => caraIcono(OJOS[k], null), B = k => caraIcono(null, BOCAS[k]);
  const G = o => (c, w) => vestida(c, w, w, Object.assign({ esc: w / 88 }, o));

  /* ---------- CONJUNTOS: cabeza + espalda + ojos + boca + papel ---------- */
  const conj = (id, n, r, de, txt, piezas) => Object.assign(it(id, n, r, de, txt, G({ cabeza: piezas.cabeza, espalda: piezas.espalda, ojos: OJOS[piezas.ojos], boca: BOCAS[piezas.bocas], papel: piezas.papel })), { piezas });
  const conjuntosR = [
    conj('bunny', 'CrazyBunny', 'rara', 'base', 'Al empezar', { cabeza: 'bunny', espalda: 'capa', ojos: 'espiral', bocas: 'conejo', papel: 'blanco' }),
    conj('squirrel', 'MadSquirrel', 'rara', 'base', 'Al empezar', { cabeza: 'orejasArdilla', espalda: 'colaArdilla', ojos: 'campana', bocas: 'ardilla', papel: 'blanco' }),
    conj('fox', 'SlyFox', 'rara', 'base', 'Al empezar', { cabeza: 'orejasFox', espalda: 'colaFox', ojos: 'foxgafas', bocas: 'sonrisa', papel: 'blanco' }),
    conj('beaver', 'BoomBeaver', 'rara', 'gratis', 'Pase gratis · nv 12', { cabeza: 'cascoBeaver', espalda: 'colaBeaver', ojos: 'campana', bocas: 'dienton', papel: 'kraft' }),
    conj('meercat', 'MeerCat', 'epica', 'gratis', 'Pase gratis · nv 24', { cabeza: 'meercat', espalda: 'alasAngel', ojos: 'campana', bocas: 'sonrisa', papel: 'blanco' }),
    conj('coon', 'JunkCoon', 'epica', 'premium', 'Pase premium · nv 10', { cabeza: 'orejasCoon', espalda: 'colaCoon', ojos: 'campana', bocas: 'colmillos', papel: 'blanco' }),
    conj('champion', 'EpicChampion', 'epica', 'premium', 'Pase premium · nv 30', { cabeza: 'yelmo', espalda: 'capaAzul', ojos: 'campana', bocas: 'sonrisa', papel: 'oro' }),
    conj('necro', 'NecroLord', 'legend', 'premium', 'Pase premium · nv 40', { cabeza: 'cuernosNecro', espalda: 'capaNecro', ojos: 'necro', bocas: 'o', papel: 'morado' }),
    conj('ninja', 'CyberNinja', 'epica', 'tienda', 600, { cabeza: null, espalda: 'katana', ojos: 'visor', bocas: 'sonrisa', papel: 'negro' }),
    conj('progamer', 'ProGamer', 'epica', 'tienda', 500, { cabeza: 'cascoGamer', espalda: 'teclado', ojos: 'campana', bocas: 'sonrisa', papel: 'verde' }),
    conj('suchdog', 'SuchDog', 'rara', 'tienda', 400, { cabeza: 'orejasDog', espalda: null, ojos: 'campana', bocas: 'lengua', papel: 'kraft' }),
    conj('medusa', 'Medusa', 'legend', 'tienda', 800, { cabeza: 'medusa', espalda: null, ojos: 'necro', bocas: 'colmillos', papel: 'verde' }),
  ];
  // ARD no tiene «bunny» ni «meercat» como una sola pieza: se arman aquí con dos
  ARD.CABEZAS.bunny = c => { ARD.CABEZAS.orejas(c); ARD.CABEZAS.corona(c); };
  ARD.CABEZAS.meercat = c => { ARD.CABEZAS.cofia(c); ARD.CABEZAS.aureola(c); };
  const dc = n => 'Conjunto ' + n;   // «viene con el conjunto …»

  const ojosR = [
    it('campana', 'Los de la campaña', 'comun', 'base', 'Al empezar', O('campana'), 'campana'),
    it('grandes', 'Grandes', 'comun', 'base', 'Al empezar', O('grandes'), 'grandes'), it('dormido', 'Dormido', 'comun', 'base', 'Al empezar', O('dormido'), 'dormido'),
    it('espiral', 'Espiral de CrazyBunny', 'rara', 'conjunto', dc('CrazyBunny'), O('espiral'), 'espiral'), it('foxgafas', 'Gafas de SlyFox', 'rara', 'conjunto', dc('SlyFox'), O('foxgafas'), 'foxgafas'),
    it('necro', 'Ojos de NecroLord', 'legend', 'conjunto', dc('NecroLord'), O('necro'), 'necro'), it('visor', 'Visor de CyberNinja', 'epica', 'conjunto', dc('CyberNinja'), O('visor'), 'visor'),
    it('gafas', 'Gafas redondas', 'rara', 'gratis', 'Pase gratis · nv 4', O('gafas'), 'gafas'), it('estrellas', 'Estrellas', 'epica', 'premium', 'Pase premium · nv 18', O('estrellas'), 'estrellas'),
    it('guino', 'Guiño', 'comun', 'migas', '150 Migas', O('guino'), 'guino'), it('bizco', 'Bizco', 'rara', 'diario', 'Diario · día 7 (semana 2)', O('bizco'), 'bizco'),
    it('sol', 'Gafas de sol', 'rara', 'tienda', 200, O('sol'), 'sol'), it('monoculo', 'Monóculo', 'epica', 'premium', 'Pase premium · nv 31', O('monoculo'), 'monoculo'),
    it('laser', 'Láser de jefe', 'legend', 'tienda', 800, O('laser'), 'laser'), it('corazones', 'Corazones', 'rara', 'gratis', 'Pase gratis · nv 22', O('corazones'), 'corazones'),
  ];
  const bocasR = [
    it('sonrisa', 'Sonrisa', 'comun', 'base', 'Al empezar', B('sonrisa'), 'sonrisa'), it('o', '«O»', 'comun', 'base', 'Al empezar', B('o'), 'o'),
    it('conejo', 'Dientes de CrazyBunny', 'rara', 'conjunto', dc('CrazyBunny'), B('conejo'), 'conejo'), it('ardilla', 'Diente de MadSquirrel', 'rara', 'conjunto', dc('MadSquirrel'), B('ardilla'), 'ardilla'),
    it('dienton', 'Dientón de BoomBeaver', 'rara', 'conjunto', dc('BoomBeaver'), B('dienton'), 'dienton'), it('colmillos', 'Colmillos de JunkCoon', 'epica', 'conjunto', dc('JunkCoon'), B('colmillos'), 'colmillos'),
    it('lengua', 'Lengua', 'rara', 'gratis', 'Pase gratis · nv 7', B('lengua'), 'lengua'), it('bigote', 'Bigote', 'epica', 'premium', 'Pase premium · nv 9', B('bigote'), 'bigote'),
    it('silbando', 'Silbando', 'rara', 'diario', 'Diario · día 7 (semana 1)', B('silbando'), 'silbando'), it('sorpresa', 'Sorprendido', 'comun', 'migas', '150 Migas', B('sorpresa'), 'sorpresa'),
    it('barba', 'Barba de papel', 'epica', 'tienda', 400, B('barba'), 'barba'), it('vampiro', 'Vampiro', 'rara', 'gratis', 'Pase gratis · nv 28', B('vampiro'), 'vampiro'),
    it('bufanda', 'Bufanda de lana', 'rara', 'tienda', 200, B('bufanda'), 'bufanda'),
  ];
  const PA = k => G({ papel: k });
  const papelR = [
    ['blanco', 'Folio blanco', 'comun', 'base', 'Al empezar'], ['kraft', 'Kraft', 'comun', 'base', 'Al empezar'], ['cuadricula', 'Cuadriculado', 'comun', 'base', 'Al empezar'], ['rayas', 'Libreta de rayas', 'comun', 'base', 'Al empezar'],
    ['oro', 'Oro de EpicChampion', 'epica', 'conjunto', dc('EpicChampion')], ['morado', 'Túnica de NecroLord', 'legend', 'conjunto', dc('NecroLord')], ['negro', 'Traje de CyberNinja', 'epica', 'conjunto', dc('CyberNinja')], ['verde', 'Camiseta de ProGamer', 'epica', 'conjunto', dc('ProGamer')],
    ['periodico', 'Periódico', 'rara', 'gratis', 'Pase gratis · nv 13'], ['carton', 'Cartón', 'comun', 'migas', '250 Migas'], ['purpurina', 'Purpurina', 'epica', 'premium', 'Pase premium · nv 25'], ['regalo', 'Papel de regalo', 'rara', 'tienda', 250],
    ['mapa', 'Mapa del tesoro', 'epica', 'tienda', 500], ['partitura', 'Partitura', 'rara', 'diario', 'Diario · 20 días del mes'], ['arcoiris', 'Papel arcoíris', 'legend', 'premium', 'Pase premium · nv 38'], ['celofan', 'Cinta adhesiva', 'epica', 'subs', 'Caos ilimitado · noviembre'],
  ].map(([k, n, r, de, t]) => it(k, n, r, de, t, PA(k), k));
  const CA = k => G({ cabeza: k, esc: 1.3 });
  const cabezaR = [
    ['bunny', 'Orejas y corona de CrazyBunny', 'rara', 'conjunto', dc('CrazyBunny')], ['orejasArdilla', 'Orejas de MadSquirrel', 'rara', 'conjunto', dc('MadSquirrel')], ['orejasFox', 'Orejas de SlyFox', 'rara', 'conjunto', dc('SlyFox')],
    ['cascoBeaver', 'Casco de BoomBeaver', 'rara', 'conjunto', dc('BoomBeaver')], ['meercat', 'Cofia y aureola de MeerCat', 'epica', 'conjunto', dc('MeerCat')], ['orejasCoon', 'Antifaz de JunkCoon', 'epica', 'conjunto', dc('JunkCoon')],
    ['yelmo', 'Yelmo de EpicChampion', 'epica', 'conjunto', dc('EpicChampion')], ['cuernosNecro', 'Cuernos de NecroLord', 'legend', 'conjunto', dc('NecroLord')], ['cascoGamer', 'Cascos de ProGamer', 'epica', 'conjunto', dc('ProGamer')],
    ['orejasDog', 'Orejas de SuchDog', 'rara', 'conjunto', dc('SuchDog')], ['medusa', 'Serpientes de Medusa', 'legend', 'conjunto', dc('Medusa')],
    ['gorra', 'Gorra de becario', 'rara', 'tienda', 'Pack de inicio'], ['corona', 'Corona', 'epica', 'tienda', 300], ['aureola', 'Aureola', 'rara', 'gratis', 'Pase gratis · nv 10'],
    ['chistera', 'Chistera', 'epica', 'premium', 'Pase premium · nv 15'], ['cuernos', 'Cuernos', 'rara', 'gratis', 'Pase gratis · nv 31'], ['flor', 'Flor', 'comun', 'migas', '200 Migas'], ['antena', 'Antena', 'comun', 'diario', 'Diario · día 2'],
    ['fiesta', 'Gorro de fiesta', 'comun', 'gratis', 'Pase gratis · nv 1'], ['lazo', 'Lazo', 'comun', 'migas', '200 Migas'], ['hoja', 'Brote', 'comun', 'gratis', 'Pase gratis · nv 16'], ['pulpo', 'Pulpo sombrero', 'legend', 'premium', 'Pase premium · nv 35'],
  ].map(([k, n, r, de, t]) => it(k, n, r, de, t, CA(k), k));
  const ES = k => G({ espalda: k, esc: 1.25 });
  const espaldaR = [
    ['capa', 'Capa de CrazyBunny', 'rara', 'conjunto', dc('CrazyBunny')], ['colaArdilla', 'Cola de MadSquirrel', 'rara', 'conjunto', dc('MadSquirrel')], ['colaFox', 'Cola de SlyFox', 'rara', 'conjunto', dc('SlyFox')],
    ['colaBeaver', 'Cola de BoomBeaver', 'rara', 'conjunto', dc('BoomBeaver')], ['alasAngel', 'Alas de MeerCat', 'epica', 'conjunto', dc('MeerCat')], ['colaCoon', 'Cola de JunkCoon', 'epica', 'conjunto', dc('JunkCoon')],
    ['capaAzul', 'Capa de EpicChampion', 'epica', 'conjunto', dc('EpicChampion')], ['capaNecro', 'Capa de NecroLord', 'legend', 'conjunto', dc('NecroLord')], ['katana', 'Katana de CyberNinja', 'epica', 'conjunto', dc('CyberNinja')], ['teclado', 'Teclado de ProGamer', 'epica', 'conjunto', dc('ProGamer')],
    ['alasMurci', 'Alas de murciélago', 'epica', 'tienda', 500], ['alasMariposa', 'Alas de mariposa', 'legend', 'tienda', 900], ['mochila', 'Mochila', 'comun', 'migas', '250 Migas'],
    ['colaGato', 'Cola de gato', 'comun', 'diario', 'Diario · día 7 (semana 3)'], ['propulsor', 'Propulsor', 'legend', 'premium', 'Pase premium · nv 20'], ['baston', 'Bastón de NecroLord', 'epica', 'premium', 'Pase premium · nv 12'],
  ].map(([k, n, r, de, t]) => it(k, n, r, de, t, ES(k), k));
  const H = col => (c, w) => humo(c, w, col);
  const humoR = [
    it('gris', 'Gris de oficina', 'comun', 'base', 'Al empezar', H()), it('confeti', 'Confeti', 'rara', 'gratis', 'Pase gratis · nv 13', H(['#7ee04a', '#39d5e8', '#ffcb3d'])),
    it('purpurina', 'Purpurina', 'epica', 'premium', 'Pase premium · nv 11', H(['#ff6fb5', '#ffcb3d', '#b45cff'])), it('arcoiris', 'Arcoíris', 'epica', 'tienda', 500, H(['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8', '#b45cff'])),
    it('calamar', 'Tinta de calamar', 'rara', 'gratis', 'Pase gratis · nv 25', H(['#3a2a5e', '#55407e'])), it('cafe', 'Café con leche', 'comun', 'migas', '200 Migas', H(['#b98a4f', '#e3c69a'])),
    it('fuego', 'Fuego frío', 'legend', 'premium', 'Pase premium · nv 38', H(['#39d5e8', '#8fe3ff', '#2e8bff'])), it('menta', 'Menta', 'comun', 'diario', 'Diario · día 7 (semana 4)', H(['#7ee04a', '#c8f7a8'])),
    it('atardecer', 'Atardecer', 'rara', 'tienda', 300, H(['#ff7a1a', '#ff6fb5', '#ffcb3d'])), it('cielo', 'Cielo', 'rara', 'subs', 'Caos ilimitado · diciembre', H(['#58b8ff', '#cfe0ff'])),
  ];
  const R = t => (c, w) => rastro(c, w, t);
  const silbidoR = [
    it('ondas', 'Ondas', 'comun', 'base', 'Al empezar', R('ondas')), it('notas', 'Notas musicales', 'rara', 'gratis', 'Pase gratis · nv 6', R('notas')),
    it('pajaros', 'Pajaritos de papel', 'epica', 'premium', 'Pase premium · nv 22', R('pajaros')), it('burbujas', 'Burbujas', 'comun', 'migas', '200 Migas', R('burbujas')),
    it('estrellas', 'Estrellas', 'rara', 'tienda', 250, R('estrellas')), it('zzz', 'Zzz', 'comun', 'diario', 'Diario · día 4', R('zzz')),
    it('arcoiris', 'Arcoíris', 'epica', 'tienda', 500, R('arcoiris')), it('bellotas', 'Bellotas de MadSquirrel', 'legend', 'premium', 'Pase premium · nv 33', R('bellotas')), it('chispas', 'Chispas', 'rara', 'gratis', 'Pase gratis · nv 34', R('chispas')),
  ];
  const F = t => (c, w) => fantasma(c, w, t);
  const fantasmaR = [
    it('galleta', 'Tu galleta fantasma', 'comun', 'base', 'Al empezar', F('galleta')), it('sabana', 'Sábana', 'comun', 'migas', '150 Migas', F('sabana')),
    it('avion', 'Avión de papel', 'rara', 'diario', 'Diario · 20 días del mes', F('avion')), it('caja', 'Caja de cartón', 'rara', 'gratis', 'Pase gratis · nv 37', F('caja')),
    it('bola', 'Bola de papel', 'comun', 'gratis', 'Pase gratis · nv 3', F('bola')), it('globo', 'Globo', 'epica', 'tienda', 400, F('globo')),
    it('nube', 'Nube', 'rara', 'tienda', 300, F('nube')), it('dorado', 'Fantasma dorado', 'epica', 'premium', 'Pase premium · nv 14', F('dorado')), it('polaroid', 'Foto de despedida', 'legend', 'premium', 'Pase premium · nv 27', F('polaroid')),
  ];
  const C = t => (c, w) => congelar(c, w, t);
  const congelarR = [
    it('nada', 'Sin efecto', 'comun', 'base', 'Al empezar', C('')), it('destello', 'Destello', 'rara', 'gratis', 'Pase gratis · nv 9', C('destello')),
    it('escarcha', 'Escarcha', 'epica', 'premium', 'Pase premium · nv 24', C('escarcha')), it('pegatina', 'Pegatina', 'rara', 'tienda', 250, C('pegatina')),
    it('confeti', 'Confeti', 'comun', 'migas', '200 Migas', C('confeti')), it('flash', 'Flash de foto', 'rara', 'diario', 'Diario · día 7 (semana 2)', C('flash')), it('tinta', 'Mancha de tinta', 'epica', 'tienda', 400, C('tinta')),
  ];
  const S = t => (c, w) => sello(c, w, t);
  const selloR = [
    it('rojo', 'Tampón rojo', 'comun', 'base', 'Al empezar', S('rojo')), it('azul', 'Tampón azul', 'comun', 'migas', '150 Migas', S('azul')),
    it('verde', 'Tampón verde', 'comun', 'gratis', 'Pase gratis · nv 21', S('verde')), it('grapa', 'Grapa', 'rara', 'gratis', 'Pase gratis · nv 26', S('grapa')),
    it('firma', 'Firma del jefe', 'epica', 'premium', 'Pase premium · nv 17', S('firma')), it('huella', 'Huella de becario', 'rara', 'tienda', 250, S('huella')), it('oro', '«ASCENDIDO» dorado', 'legend', 'premium', 'Pase premium · nv 36', S('oro')),
  ];
  const L = (col, b) => (c, w) => linterna(c, w, col, b);
  const linternaR = [
    it('bombilla', 'Bombilla', 'comun', 'base', 'Al empezar', L('rgba(255,236,170,.6)', '')), it('ambar', 'Ámbar', 'comun', 'migas', '200 Migas', L('rgba(255,160,60,.55)', 'linea')),
    it('hielo', 'Hielo', 'rara', 'gratis', 'Pase gratis · nv 18', L('rgba(143,227,255,.55)', 'linea')), it('disco', 'Discoteca', 'epica', 'premium', 'Pase premium · nv 26', L('rgba(255,111,181,.55)', 'puntos')),
    it('estrellada', 'Estrellada', 'legend', 'tienda', 800, L('rgba(255,203,61,.55)', 'estrellas')), it('radar', 'Verde radar', 'rara', 'diario', 'Diario · día 7 (semana 3)', L('rgba(126,224,74,.5)', 'linea')),
  ];
  const M = t => (c, w) => marco(c, w, t);
  const marcosR = [
    ['madera', 'Madera', 'comun', 'base', 'Al empezar'], ['corcho', 'Corcho con chinchetas', 'comun', 'migas', '200 Migas'], ['cinta', 'Cinta adhesiva', 'rara', 'gratis', 'Pase gratis · nv 30'],
    ['pixel', 'Píxel', 'rara', 'tienda', 'Pack de inicio'], ['neon', 'Neón', 'epica', 'premium', 'Pase premium · nv 21'], ['oro', 'Oro', 'legend', 'premium', 'Pase premium · nv 39'],
  ].map(([k, n, r, de, t]) => it(k, n, r, de, t, M(k), k));
  const TI = (t, col) => Object.assign((c, w) => titulo(c, w, t, col), { texto: t, color: col });
  const titulosR = [
    it('becario', 'Becario', 'comun', 'base', 'Al empezar', TI('BECARIO', '#cdb9ea')), it('indespedible', 'Indespedible', 'rara', 'gratis', 'Pase gratis · nv 20', TI('INDESPEDIBLE', '#7ee04a')),
    it('delmes', 'Becario del mes', 'epica', 'premium', 'Pase premium · nv 23', TI('BECARIO DEL MES', '#ffcb3d')), it('mancha', 'Mancha en la pared', 'rara', 'diario', 'Diario · 20 días del mes', TI('MANCHA EN LA PARED', '#39d5e8')),
    it('inhumanos', 'Recursos Inhumanos', 'epica', 'gratis', 'Misión de temporada', TI('RECURSOS INHUMANOS', '#ff4b5c')), it('nimimadre', 'Ni mi madre me encuentra', 'legend', 'premium', 'Pase premium · nv 37', TI('NI MI MADRE ME ENCUENTRA', '#ff6fb5')),
    it('cafe', 'Café con piernas', 'comun', 'migas', '150 Migas', TI('CAFÉ CON PIERNAS', '#d9a25b')), it('despedidor', 'Despedidor', 'rara', 'gratis', 'Misión: despide a 50', TI('DESPEDIDOR', '#2e8bff')),
  ];
  const GE = t => (c, w) => gesto(c, w, t);
  const gestosR = [
    it('saludo', 'Saludo', 'comun', 'base', 'Al empezar', GE('saludo')), it('baile', 'Baile', 'rara', 'gratis', 'Pase gratis · nv 15', GE('baile')),
    it('reverencia', 'Reverencia', 'epica', 'premium', 'Pase premium · nv 29', GE('reverencia')), it('risa', 'Risa', 'comun', 'migas', '200 Migas', GE('risa')),
    it('llorar', 'Llorar', 'rara', 'diario', 'Diario · día 7 (semana 4)', GE('llorar')), it('selfie', 'Selfie', 'epica', 'tienda', 400, GE('selfie')),
    it('cafe', 'Pausa del café', 'rara', 'premium', 'Pase premium · nv 8', GE('cafe')), it('dormir', 'Siesta', 'comun', 'gratis', 'Pase gratis · nv 24', GE('dormir')),
  ];
  // vacio: se puede ir sin nada puesto; cuerpo: se ve sobre la galleta del armario; conjuntos: ponerse uno viste entera la galleta
  return [
    { id: 'conjuntos', nombre: 'Conjuntos del Rumble', corto: 'Conjuntos', nota: 'Un personaje entero: cabeza, espalda, cara y papel. Luego puedes mezclar sus piezas', conjuntos: true, cuerpo: true, items: conjuntosR },
    { id: 'ojos', nombre: 'Ojos', corto: 'Ojos', nota: 'Desaparecen al congelarte, igual para todos', cuerpo: true, items: ojosR },
    { id: 'bocas', nombre: 'Bocas', corto: 'Boca', nota: 'Desaparecen al congelarte, igual para todos', cuerpo: true, items: bocasR },
    { id: 'papel', nombre: 'Papel (el color de tu galleta)', corto: 'Papel', nota: 'Se ve mientras andas; al pintarte lo tapa tu pintura', cuerpo: true, items: papelR },
    { id: 'cabeza', nombre: 'En la cabeza', corto: 'Cabeza', nota: 'Desaparecen al congelarte', vacio: true, cuerpo: true, items: cabezaR },
    { id: 'espalda', nombre: 'Colas, alas y espalda', corto: 'Espalda', nota: 'Desaparecen al congelarte', vacio: true, cuerpo: true, items: espaldaR },
    { id: 'humo', nombre: 'Bomba de humo', corto: 'Humo', nota: 'Todas tapan igual: mismo tamaño, misma duración; solo cambia el color', items: humoR },
    { id: 'silbido', nombre: 'Rastro del silbido', corto: 'Silbido', nota: 'Se oye y se ve igual de lejos con todos', items: silbidoR },
    { id: 'fantasma', nombre: 'Fantasma al ser despedido', corto: 'Fantasma', items: fantasmaR },
    { id: 'congelar', nombre: 'Efecto al congelarte', corto: 'Congelar', nota: 'Dura 1 segundo y luego no queda nada', items: congelarR },
    { id: 'sello', nombre: 'Sello de «DESPEDIDO»', corto: 'Sello', nota: 'Lo que dejas en el suelo cuando despides a alguien (de becario)', items: selloR },
    { id: 'linterna', nombre: 'Linterna del becario', corto: 'Linterna', nota: 'Solo cambia el color del borde: el haz alumbra igual', items: linternaR },
    { id: 'marcos', nombre: 'Marcos de la clasificación', corto: 'Marco', items: marcosR },
    { id: 'titulos', nombre: 'Títulos (salen bajo tu nombre)', corto: 'Título', items: titulosR },
    { id: 'gestos', nombre: 'Gestos', corto: 'Gestos', nota: 'Solo en la sala de espera, al final de la ronda o de fantasma', items: gestosR },
  ];
})();
