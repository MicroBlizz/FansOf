// Fans of Toys · dominio · MINIJUEGOS: lo que no necesita pantalla de los tres minijuegos del mes. Cuál toca cada mes, cómo se valida
// y qué efecto tiene el bonus que se saca (la nota va de 0 a 1), el escenario de cada uno (qué sale y cuándo, siempre igual con el mismo
// número) y cómo se puntúa lo que hizo el jugador. Puro: la pantalla (adaptadores/minijuego-*.js) solo pinta el escenario y cuenta toques.
'use strict';
TY.Minijuegos = (() => {
  const redondea = n => Math.round(n * 100) / 100;
  const limita = n => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
  const SIN_EFECTO = TY.congela({ precio: 1, unidades: 0, demanda: 1 });

  // uno por mes, siempre en el mismo orden
  const tipoDelMes = (partida, reglas) => reglas.minijuegos.orden[Math.max(0, partida.mes) % reglas.minijuegos.orden.length];

  // el bonus es opcional (null = minijuego saltado); si viene, su tipo existe y su nota queda entre 0 y 1
  const valida = (bonus, reglas) => {
    if (bonus === undefined || bonus === null) return TY.ok(null);
    if (typeof bonus !== 'object' || !reglas.minijuegos.orden.includes(bonus.tipo) || !Number.isFinite(bonus.nota)) return TY.error('bonus-no-valido', { bonus });
    return TY.ok({ tipo: bonus.tipo, nota: redondea(limita(bonus.nota)) });
  };

  // lo que cambia el bonus: el precio de venta (x), las unidades gratis (% del lote) y la demanda (x)
  const efecto = (bonus, reglas) => {
    if (!bonus) return SIN_EFECTO;
    const r = reglas.minijuegos[bonus.tipo];
    return { precio: 1 + (r.precio || 0) * bonus.nota, unidades: (r.unidades || 0) * bonus.nota, demanda: 1 + (r.demanda || 0) * bonus.nota };
  };

  // Control de calidad: doce piezas por la cinta, cinco rotas
  const calidad = azar => {
    const total = 12, rotas = new Set(azar.varios([...Array(total).keys()], 5));
    const piezas = Array.from({ length: total }, (_, i) => ({ t: Math.round(i * 700 + azar.entre(0, 200)), malo: rotas.has(i) }));
    return { viaje: 3200, piezas, malos: rotas.size };
  };
  // La prensa: tres golpes, cada uno con la zona verde más pequeña
  const prensa = azar => ({ subida: 1400, intentos: [0.18, 0.14, 0.1].map(ancho => ({ ancho, centro: redondea(azar.entre(0.5, 0.9)) })) });
  // Likes del chat: ocho likes, tres mensajes que valen más y tres spam que restan
  const likes = azar => {
    const clases = azar.varios([...Array(8).fill('like'), ...Array(3).fill('chat'), ...Array(3).fill('spam')], 14);
    return { caida: 2400, maximo: 8 + 3 * 3, cosas: clases.map((clase, i) => ({ t: i * 620, x: redondea(azar.entre(0.08, 0.8)), clase })) };
  };
  const ESCENARIOS = { calidad, prensa, likes };
  const escenario = (tipo, semilla) => ESCENARIOS[tipo](TY.azar(semilla));

  // lo que vale un golpe de prensa: 1 si cae en el centro de la zona, 0,7 en el borde, y baja deprisa si se pasa
  const puntuaPrensa = (posicion, intento) => {
    const lejos = Math.abs(posicion - intento.centro), medio = intento.ancho / 2;
    return redondea(lejos <= medio ? 1 - 0.3 * lejos / medio : Math.max(0, 0.7 - (lejos - medio) * 3));
  };
  const PUNTOS_LIKES = { like: 1, chat: 3, spam: -2 };
  const NOTAS = {
    calidad: d => (d.malos ? (d.aciertos - d.fallos * 0.5) / d.malos : 1),
    prensa: d => (d.puntos || []).reduce((n, p) => n + p, 0) / 3,
    likes: d => d.puntos / d.maximo,
  };
  const nota = (tipo, datos) => redondea(limita(NOTAS[tipo](datos)));

  return { tipoDelMes, valida, efecto, escenario, puntuaPrensa, nota, PUNTOS_LIKES };
})();
