// Fans of Pinball · aplicación · CASOS DE USO fuera de la mesa: empezar una partida (historia o sin fin, con la primera partida y la
// ayuda que se adapta), terminarla (fichas, ×2 de la primera del día, récord y «te faltaron», historia superada y su premio, misiones),
// subir de nivel a una criatura y elegir líder. Todo pasa por la sesión (la única que guarda). Puertos:
//   { reglas, sesion, reloj: { semilla() }, diario (PB.creaDiario), clasificacion: { envia(resultado) } }
'use strict';
PB.creaCasos = ({ reglas, sesion, reloj, diario, clasificacion }) => {
  const V = reglas.vida, d = () => sesion.datos;
  // opciones de PB.Partida.nueva: ok(opciones) o error('sinfin_cerrado')
  function empieza(modo, extra = {}) {
    if (modo === 'sinfin' && !d().sinfinAbierto) return PB.error('sinfin_cerrado');
    return PB.ok({
      semilla: reloj.semilla(), modo, equipo: d().equipo.slice(), niveles: { ...d().niveles },
      primeraPartida: d().partidas === 0, menosEnemigos: d().cortas >= V.cortasParaAyuda, ...extra,
    });
  }
  // lo que dice Lola antes de la sala de esa planta ('' si nada): solo en la historia y en las primeras partidas
  function frase(modo, planta) {
    if (modo !== 'historia' || d().partidasHistoria >= reglas.guia.partidas) return '';
    return reglas.guia.frases[planta] || '';
  }
  const mejor = (a, b) => a.planta > b.planta || (a.planta === b.planta && a.puntos > b.puntos);
  // «te faltaron»: contra el récord del sin fin (plantas o, si empatan, puntos); en la historia, las plantas hasta el jefe
  function faltan(r) {
    if (r.modo === 'historia') return r.resultado === 'victoria' ? null : { plantas: reglas.plantas.historia.plantas - r.planta, jefe: true };
    const rec = d().record;
    if (rec.planta === 0 || mejor(r, rec)) return null;
    return rec.planta > r.planta ? { plantas: rec.planta - r.planta } : { puntos: rec.puntos - r.puntos };
  }
  function marcas(r) {
    if (r.modo !== 'sinfin') return { nuevoRecord: false, mejorSemana: false };
    const D = d(), clave = diario.claveSemana();
    if (D.semana.clave !== clave) D.semana = { clave, planta: 0, puntos: 0 };
    const nuevoRecord = mejor(r, D.record), mejorSemana = mejor(r, D.semana);
    if (nuevoRecord) D.record = { planta: r.planta, puntos: r.puntos };
    if (mejorSemana) D.semana = { clave, planta: r.planta, puntos: r.puntos };
    return { nuevoRecord, mejorSemana };
  }
  // la historia superada por primera vez: fichas, JunkCoon y el sin fin abierto
  function premioHistoria(r) {
    const D = d();
    if (r.modo === 'historia') D.historia.mejorPlanta = Math.max(D.historia.mejorPlanta, r.planta);
    if (r.modo !== 'historia' || r.resultado !== 'victoria' || D.historia.superada) return null;
    const p = reglas.jefe.premio;
    D.historia.superada = true; D.sinfinAbierto = true; D.fichas += p.fichas;
    if (!D.desbloqueadas.includes(p.criatura)) D.desbloqueadas.push(p.criatura);
    return { fichas: p.fichas, criatura: p.criatura };
  }
  // la criatura del equipo más cerca de subir: { id, nivel, siguiente, falta } (null si todas al máximo)
  function casiSube() {
    const D = d(), opciones = D.equipo.map(id => ({ id, nivel: D.niveles[id], precio: PB.progreso.coste(reglas, D.niveles[id]) })).filter(c => c.precio !== null);
    if (!opciones.length) return null;
    const c = opciones.reduce((a, b) => (b.precio < a.precio ? b : a));
    return { id: c.id, nivel: c.nivel, siguiente: c.nivel + 1, precio: c.precio, falta: Math.max(0, c.precio - D.fichas) };
  }
  function cuentaMisiones(r) {
    const c = { ...(r.cuenta || {}), partida: 1 };
    if (r.planta >= 6) c.planta6 = 1;
    if (r.puntos >= V.puntosMision) c.puntos20k = 1;
    return c;
  }
  function contadores(r) {
    const D = d();
    D.partidas += 1;
    if (r.modo === 'historia') D.partidasHistoria += 1;
    D.cortas = r.planta < V.plantaCorta ? D.cortas + 1 : 0;
  }
  // r = { modo, resultado: 'tiempo' | 'victoria' | 'abandono', planta, puntos, fichas, cuenta: { vasija, cofre, enemigo, caos, escalera } }
  function termina(r) {
    const D = d(), primera = diario.esPrimeraDelDia, multiplicador = primera ? V.primeraDelDia : 1;
    const fichasGanadas = Math.floor(r.fichas) * multiplicador, falta = faltan(r);
    D.fichas += fichasGanadas;
    if (primera) diario.marcaPrimera();
    const m = marcas(r), premio = premioHistoria(r);
    contadores(r);
    const misiones = diario.apunta(cuentaMisiones(r));
    sesion.guarda();
    if (r.modo === 'sinfin') clasificacion.envia({ planta: r.planta, puntos: r.puntos, semana: D.semana.clave });
    return PB.ok({ modo: r.modo, resultado: r.resultado, planta: r.planta, puntos: r.puntos, fichasPartida: Math.floor(r.fichas), multiplicador,
      fichasGanadas, premio, ...m, faltan: falta, criatura: casiSube(), misiones, fichasTotal: D.fichas, record: { ...D.record } });
  }
  // sube un nivel a la criatura pagando fichas: ok({ id, nivel, fichas }) o error('no_la_tienes' | 'nivel_maximo' | 'sin_fichas')
  function subeNivel(id) {
    const D = d();
    if (!D.desbloqueadas.includes(id)) return PB.error('no_la_tienes', { id });
    const r = PB.progreso.sube(reglas, D.niveles[id], D.fichas);
    if (!r.ok) return r;
    D.niveles[id] = r.valor.nivel; D.fichas = r.valor.fichas;
    sesion.guarda();
    return PB.ok({ id, nivel: r.valor.nivel, fichas: r.valor.fichas });
  }
  // pone de líder (primera bola) a una criatura desbloqueada; si no estaba en el equipo, sale la última
  function ponLider(id) {
    const D = d();
    if (!D.desbloqueadas.includes(id)) return PB.error('no_la_tienes', { id });
    const resto = D.equipo.filter(x => x !== id);
    D.equipo = [id, ...resto].slice(0, reglas.criaturas.equipo.length);
    sesion.guarda();
    return PB.ok(D.equipo.slice());
  }
  return { empieza, frase, termina, subeNivel, ponLider, casiSube };
};
