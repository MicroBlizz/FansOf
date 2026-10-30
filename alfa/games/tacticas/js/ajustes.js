// Fans of Rumble: Tácticas · AJUSTES: el nombre del juego para core y el ritmo del combate. Se carga antes de lo común.
'use strict';
/* ---------- ritmo del combate ---------- */
const AJUSTES = {
  id: 'tacticas',                // para core: la partida en la nube lleva este nombre
  guardado: 'for-tacticas-v1',   // la clave de la partida en este navegador
  caosAtaque: 5,      // CAOS que gana el héroe con cada ataque normal
  atbBase: 20,        // lo que se llena la barra por segundo, más la velocidad de cada uno (100 = turno)
  atbVel: 1.6,        // cuánto suma cada punto de velocidad
  critico: 0.08,      // probabilidad de golpe crítico
  critMult: 1.6,
  defensa: 60,        // daño = poder × 2 × (defensa / (defensa + DEF del que recibe))
  crecer: 1.08,       // cada nivel multiplica vida, ataque, magia y defensa
  crecerCaos: 1.06,
  xpNivel: L => 20 + 15 * L,   // experiencia para pasar del nivel L al siguiente
  cafe: 30,           // lo que cuesta curar a todo el grupo en el mapa
  revivirGemas: 20,   // revivir al perder pagando gemas
};
