// Fans of Rouflage · ARMARIO (datos): el catálogo de la Temporada 1, lo mismo que el boceto que eligió Daniel. 14 categorías y 127 cosas.
// Cada cosa: id, nombre, rareza (comun, rara, epica, legend), de dónde sale (base, gratis, premium, diario, tienda, migas, subs), el texto de
// cómo se consigue (en la tienda es su precio en Purpurina, un número) y lo que se le pone a la galleta (ojos y bocas: su dibujo; papel,
// cabeza y espalda: su nombre en ARD) o, para lo demás, solo su dibujo. Todo es cosmético: nada cambia cómo se juega.
'use strict';
const CATALOGO_AR = (() => {
  const { OL, T, forma, vestida, cabezaPapel, ojos, boca, humo, rastro, fantasma, congelar, sello, linterna, marco, titulo, gesto } = ARD;
  const it = (id, n, r, de, txt, x) => ({ id, n, r, de, txt, x });
  const O = t => (c, w) => ojos(c, w, t), B = t => (c, w) => boca(c, w, t);
  const ojosR = [
    it('puntos', 'Puntos', 'comun', 'base', 'Al empezar', O('puntos')), it('grandes', 'Grandes', 'comun', 'base', 'Al empezar', O('grandes')), it('dormido', 'Dormido', 'comun', 'base', 'Al empezar', O('dormido')),
    it('gafas', 'Gafas redondas', 'rara', 'gratis', 'Pase gratis · nv 4', O('gafas')), it('estrellas', 'Estrellas', 'epica', 'premium', 'Pase premium · nv 18', O('estrella')),
    it('guino', 'Guiño', 'comun', 'migas', '150 Migas', (c, w) => { cabezaPapel(c, w); c.lineWidth = w * .05; c.strokeStyle = OL; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * .27, w * .5); c.lineTo(w * .41, w * .5); c.stroke(); c.beginPath(); c.arc(w * .66, w * .5, w * .07, 0, T); c.fillStyle = OL; c.fill(); }),
    it('bizco', 'Bizco', 'rara', 'diario', 'Diario · día 7 (semana 2)', (c, w) => { cabezaPapel(c, w); for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * w * .16, w / 2, w * .1, 0, T); c.fillStyle = '#fff'; c.fill(); c.lineWidth = w * .03; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.arc(w / 2 + s * w * .1, w / 2, w * .05, 0, T); c.fillStyle = OL; c.fill(); } }),
    it('sol', 'Gafas de sol', 'rara', 'tienda', 200, (c, w) => { cabezaPapel(c, w); for (const s of [-1, 1]) forma(c, g => g.roundRect(w / 2 + s * w * .16 - w * .12, w * .43, w * .24, w * .14, w * .04), OL, w * .03); c.lineWidth = w * .03; c.strokeStyle = OL; c.beginPath(); c.moveTo(w * .45, w * .48); c.lineTo(w * .55, w * .48); c.stroke(); }),
    it('monoculo', 'Monóculo', 'epica', 'premium', 'Pase premium · nv 31', (c, w) => { ojos(c, w, 'puntos'); c.lineWidth = w * .03; c.strokeStyle = '#ffcb3d'; c.beginPath(); c.arc(w * .66, w / 2, w * .12, 0, T); c.stroke(); c.beginPath(); c.moveTo(w * .72, w * .61); c.lineTo(w * .76, w * .85); c.stroke(); }),
    it('laser', 'Láser de jefe', 'legend', 'tienda', 800, (c, w) => { ojos(c, w, 'puntos'); c.strokeStyle = '#ff4b5c'; c.lineWidth = w * .03; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(w / 2 + s * w * .16, w / 2); c.lineTo(w / 2 + s * w * .16 + w * .3, w * .2); c.stroke(); } }),
    it('corazones', 'Corazones', 'rara', 'gratis', 'Pase gratis · nv 22', (c, w) => { cabezaPapel(c, w); c.fillStyle = '#ff4b5c'; for (const s of [-1, 1]) { const x = w / 2 + s * w * .16, y = w * .5; c.beginPath(); c.moveTo(x, y + w * .06); c.bezierCurveTo(x - w * .1, y - w * .02, x - w * .04, y - w * .1, x, y - w * .03); c.bezierCurveTo(x + w * .04, y - w * .1, x + w * .1, y - w * .02, x, y + w * .06); c.fill(); } }),
    it('espiral', 'Espiral (CrazyBunny)', 'epica', 'subs', 'Caos ilimitado · octubre', (c, w) => { cabezaPapel(c, w); c.strokeStyle = '#8a2bff'; c.lineWidth = w * .025; for (const s of [-1, 1]) { c.beginPath(); for (let q = 0; q < 3.4 * Math.PI; q += .3) { const r = w * .01 * q; c.lineTo(w / 2 + s * w * .16 + Math.cos(q) * r, w / 2 + Math.sin(q) * r); } c.stroke(); } }),
  ];
  const bocasR = [
    it('sonrisa', 'Sonrisa', 'comun', 'base', 'Al empezar', B('sonrisa')), it('o', '«O»', 'comun', 'base', 'Al empezar', B('o')), it('lengua', 'Lengua', 'rara', 'gratis', 'Pase gratis · nv 7', B('lengua')),
    it('bigote', 'Bigote', 'epica', 'premium', 'Pase premium · nv 9', B('bigote')),
    it('dienton', 'Dientón', 'comun', 'migas', '150 Migas', (c, w) => { boca(c, w, 'sonrisa'); c.fillStyle = '#fff'; c.fillRect(w * .46, w * .74, w * .08, w * .08); c.strokeStyle = OL; c.lineWidth = w * .02; c.strokeRect(w * .46, w * .74, w * .08, w * .08); }),
    it('silbando', 'Silbando', 'rara', 'diario', 'Diario · día 7 (semana 1)', (c, w) => { cabezaPapel(c, w); forma(c, g => g.arc(w * .55, w * .72, w * .05, 0, T), OL, 0); c.strokeStyle = '#ffcb3d'; c.fillStyle = '#ffcb3d'; c.lineWidth = w * .025; c.beginPath(); c.ellipse(w * .7, w * .76, w * .04, w * .03, -.4, 0, T); c.fill(); c.beginPath(); c.moveTo(w * .735, w * .75); c.lineTo(w * .735, w * .6); c.stroke(); }),
    it('sorpresa', 'Sorprendido', 'comun', 'migas', '150 Migas', (c, w) => { cabezaPapel(c, w); forma(c, g => g.ellipse(w / 2, w * .72, w * .07, w * .1, 0, 0, T), OL, 0); }),
    it('barba', 'Barba de papel', 'epica', 'tienda', 400, (c, w) => { cabezaPapel(c, w); forma(c, g => { g.moveTo(w * .24, w * .6); g.quadraticCurveTo(w / 2, w * 1.08, w * .76, w * .6); g.quadraticCurveTo(w / 2, w * .76, w * .24, w * .6); }, '#d9a25b', w * .03); }),
    it('vampiro', 'Vampiro', 'rara', 'gratis', 'Pase gratis · nv 28', (c, w) => { boca(c, w, 'sonrisa'); c.fillStyle = '#fff'; c.strokeStyle = OL; c.lineWidth = w * .015; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(w / 2 + s * w * .09, w * .73); c.lineTo(w / 2 + s * w * .06, w * .82); c.lineTo(w / 2 + s * w * .03, w * .745); c.closePath(); c.fill(); c.stroke(); } }),
    it('mascarilla', 'Mascarilla Microblizz', 'rara', 'tienda', 200, (c, w) => { cabezaPapel(c, w); forma(c, g => g.roundRect(w * .24, w * .6, w * .52, w * .22, w * .06), '#39d5e8', w * .03); c.fillStyle = OL; c.font = `${Math.round(w * .12)}px "Luckiest Guy", sans-serif`; c.textAlign = 'center'; c.fillText('M', w / 2, w * .76); }),
  ];
  const PA = k => (c, w) => vestida(c, w, w, { papel: k }), CA = k => (c, w) => vestida(c, w, w, { cabeza: k, esc: w / 80 }), ES = k => (c, w) => vestida(c, w, w, { espalda: k, esc: w / 72 });
  const papelR = [
    ['blanco', 'Folio blanco', 'comun', 'base', 'Al empezar'], ['kraft', 'Kraft', 'comun', 'base', 'Al empezar'], ['cuadricula', 'Cuadriculado', 'comun', 'base', 'Al empezar'], ['rayas', 'Libreta de rayas', 'comun', 'base', 'Al empezar'],
    ['periodico', 'Periódico', 'rara', 'gratis', 'Pase gratis · nv 13'], ['carton', 'Cartón', 'comun', 'migas', '250 Migas'], ['purpurina', 'Purpurina', 'epica', 'premium', 'Pase premium · nv 25'], ['regalo', 'Papel de regalo', 'rara', 'tienda', 250],
    ['mapa', 'Mapa del tesoro', 'epica', 'tienda', 500], ['partitura', 'Partitura', 'rara', 'diario', 'Diario · 20 días del mes'], ['billete', 'Billete de Microblizz', 'legend', 'premium', 'Pase premium · nv 40'], ['celofan', 'Celofán', 'epica', 'subs', 'Caos ilimitado · noviembre'],
  ].map(([k, n, r, de, t]) => Object.assign(it(k, n, r, de, t, PA(k)), { v: k }));
  const cabezaR = [
    ['orejas', 'Orejas de conejo', 'comun', 'base', 'Al empezar (CrazyBunny)'], ['gorra', 'Gorra de becario', 'rara', 'tienda', 'Pack de inicio'], ['corona', 'Corona', 'epica', 'tienda', 300], ['aureola', 'Aureola', 'rara', 'gratis', 'Pase gratis · nv 10'],
    ['chistera', 'Chistera', 'epica', 'premium', 'Pase premium · nv 15'], ['cuernos', 'Cuernos', 'rara', 'gratis', 'Pase gratis · nv 31'], ['flor', 'Flor', 'comun', 'migas', '200 Migas'], ['antena', 'Antena', 'comun', 'diario', 'Diario · día 2'],
    ['auriculares', 'Auriculares', 'rara', 'tienda', 250], ['casco', 'Casco de obra', 'rara', 'premium', 'Pase premium · nv 5'], ['fiesta', 'Gorro de fiesta', 'comun', 'gratis', 'Pase gratis · nv 1'], ['lazo', 'Lazo', 'comun', 'migas', '200 Migas'],
    ['hoja', 'Brote', 'comun', 'gratis', 'Pase gratis · nv 16'], ['pulpo', 'Pulpo sombrero', 'legend', 'premium', 'Pase premium · nv 35'],
  ].map(([k, n, r, de, t]) => Object.assign(it(k, n, r, de, t, CA(k)), { v: k }));
  const espaldaR = [
    ['zorro', 'Cola de zorro', 'rara', 'gratis', 'Pase gratis · nv 19'], ['ardilla', 'Cola de ardilla', 'rara', 'tienda', 250], ['angel', 'Alas de ángel', 'epica', 'premium', 'Pase premium · nv 20'], ['murcielago', 'Alas de murciélago', 'epica', 'tienda', 500],
    ['mariposa', 'Alas de mariposa', 'legend', 'tienda', 900], ['capa', 'Capa', 'rara', 'premium', 'Pase premium · nv 12'], ['mochila', 'Mochila', 'comun', 'migas', '250 Migas'], ['gato', 'Cola de gato', 'comun', 'diario', 'Diario · día 7 (semana 3)'],
    ['propulsor', 'Propulsor', 'legend', 'premium', 'Pase premium · nv 30'],
  ].map(([k, n, r, de, t]) => Object.assign(it(k, n, r, de, t, ES(k)), { v: k }));
  const H = col => (c, w) => humo(c, w, col);
  const humoR = [
    it('gris', 'Gris de oficina', 'comun', 'base', 'Al empezar', H()), it('confeti', 'Confeti', 'rara', 'gratis', 'Pase gratis · nv 13', H(['#7ee04a', '#39d5e8', '#ffcb3d'])),
    it('purpurina', 'Purpurina', 'epica', 'premium', 'Pase premium · nv 11', H(['#ff6fb5', '#ffcb3d', '#b45cff'])), it('arcoiris', 'Arcoíris', 'epica', 'tienda', 500, H(['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8', '#b45cff'])),
    it('calamar', 'Tinta de calamar', 'rara', 'gratis', 'Pase gratis · nv 25', H(['#3a2a5e', '#55407e'])), it('cafe', 'Café con leche', 'comun', 'migas', '200 Migas', H(['#b98a4f', '#e3c69a'])),
    it('fuego', 'Fuego frío', 'legend', 'premium', 'Pase premium · nv 38', H(['#39d5e8', '#8fe3ff', '#2e8bff'])), it('menta', 'Menta', 'comun', 'diario', 'Diario · día 7 (semana 4)', H(['#7ee04a', '#c8f7a8'])),
    it('atardecer', 'Atardecer', 'rara', 'tienda', 300, H(['#ff7a1a', '#ff6fb5', '#ffcb3d'])), it('azul', 'Microblizz azul', 'rara', 'subs', 'Caos ilimitado · diciembre', H(['#2e8bff', '#cfe0ff'])),
  ];
  const R = t => (c, w) => rastro(c, w, t);
  const silbidoR = [
    it('ondas', 'Ondas', 'comun', 'base', 'Al empezar', R('ondas')), it('notas', 'Notas musicales', 'rara', 'gratis', 'Pase gratis · nv 6', R('notas')),
    it('pajaros', 'Pajaritos de papel', 'epica', 'premium', 'Pase premium · nv 22', R('pajaros')), it('burbujas', 'Burbujas', 'comun', 'migas', '200 Migas', R('burbujas')),
    it('estrellas', 'Estrellas', 'rara', 'tienda', 250, R('estrellas')), it('zzz', 'Zzz', 'comun', 'diario', 'Diario · día 4', R('zzz')),
    it('arcoiris', 'Arcoíris', 'epica', 'tienda', 500, R('arcoiris')), it('monedas', 'Monedas Microblizz', 'legend', 'premium', 'Pase premium · nv 33', R('monedas')), it('chispas', 'Chispas', 'rara', 'gratis', 'Pase gratis · nv 34', R('chispas')),
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
    it('madera', 'Madera', 'comun', 'base', 'Al empezar', M('madera')), it('corcho', 'Corcho con chinchetas', 'comun', 'migas', '200 Migas', M('corcho')),
    it('cinta', 'Cinta adhesiva', 'rara', 'gratis', 'Pase gratis · nv 30', M('cinta')), it('pixel', 'Píxel', 'rara', 'tienda', 'Pack de inicio', M('pixel')),
    it('neon', 'Neón', 'epica', 'premium', 'Pase premium · nv 21', M('neon')), it('oro', 'Oro', 'legend', 'premium', 'Pase premium · nv 39', M('oro')),
  ].map(x => Object.assign(x, { v: x.id }));
  const TI = (t, col) => Object.assign((c, w) => titulo(c, w, t, col), { texto: t, color: col });
  const titulosR = [
    it('becario', 'Becario', 'comun', 'base', 'Al empezar', TI('BECARIO', '#cdb9ea')), it('indespedible', 'Indespedible', 'rara', 'gratis', 'Pase gratis · nv 20', TI('INDESPEDIBLE', '#7ee04a')),
    it('delmes', 'Becario del mes', 'epica', 'premium', 'Pase premium · nv 23', TI('BECARIO DEL MES', '#ffcb3d')), it('mancha', 'Mancha en la pared', 'rara', 'diario', 'Diario · 20 días del mes', TI('MANCHA EN LA PARED', '#39d5e8')),
    it('inhumanos', 'Recursos Inhumanos', 'epica', 'gratis', 'Misión de temporada', TI('RECURSOS INHUMANOS', '#ff4b5c')), it('niphony', 'Ni Phony me encuentra', 'legend', 'premium', 'Pase premium · nv 37', TI('NI PHONY ME ENCUENTRA', '#ff6fb5')),
    it('cafe', 'Café con piernas', 'comun', 'migas', '150 Migas', TI('CAFÉ CON PIERNAS', '#d9a25b')), it('despedidor', 'Despedidor', 'rara', 'gratis', 'Misión: despide a 50', TI('DESPEDIDOR', '#2e8bff')),
  ];
  const G = t => (c, w) => gesto(c, w, t);
  const gestosR = [
    it('saludo', 'Saludo', 'comun', 'base', 'Al empezar', G('saludo')), it('baile', 'Baile', 'rara', 'gratis', 'Pase gratis · nv 15', G('baile')),
    it('reverencia', 'Reverencia', 'epica', 'premium', 'Pase premium · nv 29', G('reverencia')), it('risa', 'Risa', 'comun', 'migas', '200 Migas', G('risa')),
    it('llorar', 'Llorar', 'rara', 'diario', 'Diario · día 7 (semana 4)', G('llorar')), it('selfie', 'Selfie', 'epica', 'tienda', 400, G('selfie')),
    it('cafe', 'Pausa del café', 'rara', 'premium', 'Pase premium · nv 8', G('cafe')), it('dormir', 'Siesta', 'comun', 'gratis', 'Pase gratis · nv 24', G('dormir')),
  ];
  // vacio: se puede ir sin nada puesto (la galleta empieza en blanco); cuerpo: se ve sobre la galleta del armario
  return [
    { id: 'ojos', nombre: 'Ojos', corto: 'Ojos', nota: 'Desaparecen al congelarte, igual para todos', vacio: true, cuerpo: true, items: ojosR },
    { id: 'bocas', nombre: 'Bocas', corto: 'Boca', nota: 'Desaparecen al congelarte, igual para todos', vacio: true, cuerpo: true, items: bocasR },
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
