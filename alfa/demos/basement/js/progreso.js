// Fans of Basement · Progreso (dominio, sin DOM ni reloj ni localStorage): lo que se queda entre bajadas. Las monedas, el nivel de
// las tres mejoras de la mesa (café, caja y daño), el récord de planta y las estadísticas que dan a la siguiente bajada.
// Las reglas devuelven BAS.ok(valor) o BAS.error(codigo): nunca lanzan por una regla incumplida.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  B.ok = (valor) => Object.freeze({ ok: true, valor });
  B.error = (codigo, datos) => Object.freeze({ ok: false, codigo, datos: datos || null });

  const MEJORAS = ['cafe', 'caja', 'dano'];
  B.MEJORAS = MEJORAS;

  const entero = (n, min, max) => Math.max(min, Math.min(max, Math.floor(Number(n) || 0)));

  B.progresoNuevo = () => ({ monedas: 0, niveles: { cafe: 0, caja: 0, dano: 0 }, record: 0, bajadas: 0 });

  // Lee lo guardado (formato for-basement-v1). Lo que falte o no valga vuelve a su valor de partida, sin romper la partida.
  B.progresoDesde = function (AJ, datos) {
    const p = B.progresoNuevo();
    if (!datos || typeof datos !== 'object') return p;
    p.monedas = entero(datos.monedas, 0, 1e9);
    p.record = entero(datos.record, 0, 9999);
    p.bajadas = entero(datos.bajadas, 0, 1e9);
    const n = datos.niveles || {};
    for (const id of MEJORAS) p.niveles[id] = entero(n[id], 0, AJ.mejoras[id].max);
    return p;
  };

  B.progresoAGuardar = (p) => ({ formato: 'for-basement-v1', monedas: p.monedas, niveles: { ...p.niveles }, record: p.record, bajadas: p.bajadas });

  B.costeMejora = (AJ, id, nivel) => Math.round(AJ.mejoras[id].base * Math.pow(AJ.mejoras[id].factor, nivel));

  // Comprar un nivel de mejora: devuelve el progreso nuevo o por qué no se puede.
  B.comprar = function (AJ, p, id) {
    if (!MEJORAS.includes(id)) return B.error('mejoraDesconocida', { id });
    const nivel = p.niveles[id];
    if (nivel >= AJ.mejoras[id].max) return B.error('nivelMaximo', { id });
    const coste = B.costeMejora(AJ, id, nivel);
    if (p.monedas < coste) return B.error('faltanMonedas', { id, coste, faltan: coste - p.monedas });
    return B.ok({ ...p, monedas: p.monedas - coste, niveles: { ...p.niveles, [id]: nivel + 1 } });
  };

  // Lo que dan las mejoras a la bajada: café máximo, capacidad de la caja y daño de cada disparo.
  B.statsDe = (AJ, p) => Object.freeze({
    cafeMax: AJ.cafe.base + AJ.cafe.porNivel * p.niveles.cafe,
    caja: AJ.caja.base + AJ.caja.porNivel * p.niveles.caja,
    dano: Math.round(AJ.arma.dano * (1 + AJ.arma.porNivel * p.niveles.dano) * 10) / 10,
  });

  // Al terminar una bajada: se cobran las monedas ganadas y se apunta el récord de planta.
  B.cobrar = function (p, resultado) {
    const r = resultado || {};
    return { ...p, monedas: p.monedas + Math.max(0, Math.floor(r.monedas || 0)), record: Math.max(p.record, r.planta || 0), bajadas: p.bajadas + 1, niveles: { ...p.niveles } };
  };
})(BAS);
