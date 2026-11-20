// Fans of Pinball · dominio · PROGRESO: las mejoras permanentes de las criaturas (niveles 1 a 5 con fichas). Funciones puras: las cifras
// de una criatura a un nivel (daño 10, 12, 14, 16, 18 y su poder, que mejora en los niveles 3 y 5) y lo que cuesta subirla. Quien guarda
// la partida (adaptadores) guarda los niveles y las fichas; aquí solo se calcula.
'use strict';
PB.progreso = (() => {
  const enNivel = (valor, nivel) => (Array.isArray(valor) ? valor[nivel - 1] : valor);
  // las cifras de la criatura `id` a ese nivel: { poder, dano, cada, radio, danoPoder, espera, multiplicador, caida }
  function cifras(reglas, id, nivel = 1) {
    const c = reglas.criaturas.lista[id];
    if (!c) return PB.error('criatura_desconocida', { id });
    const n = Math.max(1, Math.min(reglas.progreso.nivelMaximo, nivel | 0));
    return PB.ok(PB.congela({
      id, nivel: n, poder: c.poder, dano: reglas.puntos.dano + reglas.progreso.danoPorNivel * (n - 1),
      cada: enNivel(c.cada, n), radio: enNivel(c.radio, n), danoPoder: c.dano, espera: enNivel(c.espera, n),
      multiplicador: c.multiplicador, caida: c.caida,
    }));
  }
  // fichas que cuesta pasar del nivel `nivel` al siguiente (null si ya está al máximo)
  const coste = (reglas, nivel) => (nivel >= reglas.progreso.nivelMaximo ? null : reglas.progreso.coste[nivel + 1]);
  // sube un nivel si llegan las fichas: PB.ok({ nivel, fichas }) con lo que queda, o un error con nombre
  function sube(reglas, nivel, fichas) {
    const precio = coste(reglas, nivel);
    if (precio === null) return PB.error('nivel_maximo', { nivel });
    if (fichas < precio) return PB.error('sin_fichas', { falta: precio - fichas });
    return PB.ok({ nivel: nivel + 1, fichas: fichas - precio });
  }
  return { cifras, coste, sube };
})();
