// Fans of Rouflage · DOMINIO: CUÁNDO SE ACABA LA CAZA y quién gana (fuera del PvP, donde lo decide el anfitrión con rfpComprueba). Regla pura:
// recibe lo que pasa en la partida y devuelve { victoria, motivo } o null si sigue. El orden de las comprobaciones es el de siempre.
// `victoria` es la del jugador: como colado gana si aguanta; como becario, si despide a todos.
'use strict';

RF.Fin = (() => {
  // s: { modo: 'camaleon'|'cazador', yoFuera, escondidos (cuántos colados siguen), cazadoresVivos (becarios con cartas), boteLleno, reloj (segundos que quedan) }
  const caza = s => {
    if (s.modo === 'camaleon') {
      if (s.yoFuera && !s.escondidos) return { victoria: false, motivo: 'despedido' };      // despedido, pero sigue de espectador mientras algún compañero aguante
      if (s.reloj <= 0) return { victoria: true, motivo: 'tiempo' };
      if (!s.cazadoresVivos) return { victoria: true, motivo: 'cartas' };
      if (s.boteLleno) return { victoria: true, motivo: 'bote' };
      return null;
    }
    if (!s.escondidos) return { victoria: true, motivo: 'todos' };
    if (!s.cazadoresVivos) return { victoria: false, motivo: 'cartas' };      // sin cartas sigues de espectador mientras otro cazador aguante
    if (s.boteLleno) return { victoria: false, motivo: 'bote' };
    if (s.reloj <= 0) return { victoria: false, motivo: 'tiempo' };
    return null;
  };
  return { caza };
})();
