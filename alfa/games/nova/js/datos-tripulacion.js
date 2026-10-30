// Fans of Nova · Datos de tripulación: las 5 facetas, qué ROLES de la serie encajan en cada una y los 9 capitanes con pasiva y pega (PLAN-NOVA.md, «Pilotos» y «Tripulación»).
// PROVISIONAL (fase 0). JSON estricto a propósito: herramientas/nova/nova-balance.py lo lee y lo comprueba contra core/js/serie.
'use strict';
const NOVA_TRIPULACION = {
 "version": "provisional-0.1",
 "nota": "Tripulación PROVISIONAL de la fase 0 (PLAN-NOVA.md, «Pilotos» y «Tripulación»). Las claves de capitán y los roles son los de core/js/serie. JSON estricto: herramientas/nova/nova-balance.py lo lee y comprueba los roles contra core.",
 "asientos": { "capitan": 1, "oficiales": 2, "cuartoAsiento": "por decidir (nivel de campaña, según pruebas)" },
 "facetas": {
  "fuego": {
   "nombre": "Potencia de fuego",
   "mejora": "Daño, crítico y cadencia de las armas",
   "roles": ["ranged", "assassin", "buster"]
  },
  "defensa": {
   "nombre": "Defensa",
   "mejora": "Casco, blindaje y escudos",
   "roles": ["tank"]
  },
  "ingenieria": {
   "nombre": "Ingeniería / Reparación",
   "mejora": "Reparación en combate, disipación, vampirismo",
   "roles": ["support"]
  },
  "tacticas": {
   "nombre": "Tácticas",
   "mejora": "La habilidad activa y las pasivas de la serie (CATALOGO.ab)",
   "roles": ["spell"],
   "lideres": true
  },
  "navegacion": {
   "nombre": "Navegación / Logística",
   "mejora": "Velocidad, radio de absorción de chatarra, sensores y producción idle de la flota",
   "roles": ["swarm"],
   "propuestaNueva": true
  }
 },
 "sinFaceta": {
  "roles": ["control"],
  "nota": "El rol `control` (HackerKid, Medusa, Banshee, Spoiler) no aparece en el plan: por decidir. Mientras, sirve en la flota idle."
 },
 "rolesSerie": ["tank", "swarm", "buster", "assassin", "support", "ranged", "spell", "control"],
 "capitanes": [
  {
   "id": "bunny",
   "nombre": "CrazyBunny",
   "faccion": "animales",
   "pasivaSerie": "Rabia",
   "ventaja": "+10 % de daño por enemigo a menos de 2 casillas, hasta +50 %",
   "ventajaFx": { "danoPorEnemigo": 0.1, "radioCasillas": 2, "tope": 0.5 },
   "pega": "Las armas de largo alcance −20 %",
   "pegaFx": { "largoAlcance": -0.2 }
  },
  {
   "id": "necrolord",
   "nombre": "NecroLord",
   "faccion": "nomuertos",
   "pasivaSerie": "Renacer",
   "ventaja": "Revives una vez por partida con la mitad de casco",
   "ventajaFx": { "revives": 1, "cascoAlRevivir": 0.5 },
   "pega": "Los drones cuestan el doble",
   "pegaFx": { "costeDrones": 2.0 }
  },
  {
   "id": "twitchking",
   "nombre": "TwitchKing",
   "faccion": "streamers",
   "pasivaSerie": "Hype",
   "ventaja": "Cada muerte en 2 s seguidas +5 % de cadencia, hasta +50 %",
   "ventajaFx": { "cadenciaPorMuerte": 0.05, "ventanaSeg": 2, "tope": 0.5 },
   "pega": "El hype se pierde al recibir daño",
   "pegaFx": { "pierdeAlRecibirDano": true }
  },
  {
   "id": "epicchampion",
   "nombre": "EpicChampion",
   "faccion": "heroes",
   "pasivaSerie": "Experiencia",
   "ventaja": "Subes de rango un 20 % antes",
   "ventajaFx": { "rangoAntes": 0.2 },
   "pega": "Las cartas de rango no dan reroll",
   "pegaFx": { "rerollPorRango": 0 }
  },
  {
   "id": "cybermarine",
   "nombre": "CyberMarine",
   "faccion": "ciber",
   "pasivaSerie": "Escudos",
   "ventaja": "Escudo +50 % y se regenera en combate",
   "ventajaFx": { "escudo": 0.5, "regeneraEnCombate": true },
   "pega": "Blindaje −30 %",
   "pegaFx": { "blindaje": -0.3 }
  },
  {
   "id": "memelord",
   "nombre": "MemeLord",
   "faccion": "memes",
   "pasivaSerie": "RNG",
   "ventaja": "Cada carta tiene un 25 % de salir de rareza superior",
   "ventajaFx": { "rarezaSuperior": 0.25 },
   "pega": "Cada carta tiene un 10 % de ser basura",
   "pegaFx": { "basura": 0.1 }
  },
  {
   "id": "vikingo",
   "nombre": "Vikingo",
   "faccion": "olvidados",
   "pasivaSerie": "Nostalgia",
   "ventaja": "Las armas L pegan +25 %",
   "ventajaFx": { "danoL": 0.25 },
   "pega": "Las armas S pegan −30 %",
   "pegaFx": { "danoS": -0.3 }
  },
  {
   "id": "progamer",
   "nombre": "ProGamer",
   "faccion": "gamer",
   "pasivaSerie": "Juego limpio",
   "ventaja": "Ni bonus ni pega: cifras base. Como única ventaja, ve la tendencia del pool y las probabilidades reales",
   "ventajaFx": { "veTendenciaPool": true, "veProbabilidades": true },
   "pega": "Ninguna",
   "pegaFx": {  }
  },
  {
   "id": "directora",
   "nombre": "La Directora",
   "faccion": "pop",
   "pasivaSerie": "Auras",
   "ventaja": "Empiezas con un aura al azar y ganas otra cada vez que tu nave evoluciona",
   "ventajaFx": { "auras": true },
   "pega": "Cada aura trae también su penalización",
   "pegaFx": { "auras": true }
  }
 ],
 "aurasDirectora": [
  {
   "id": "taquillazo",
   "nombre": "Taquillazo",
   "bono": "+20 % de daño explosivo",
   "bonoFx": { "danoExplosivo": 0.2 },
   "penalizacion": "−15 % de escudo",
   "penalizacionFx": { "escudo": -0.15 },
   "propuesta": false
  },
  {
   "id": "remake",
   "nombre": "Remake",
   "bono": "Las fusiones salen el doble",
   "bonoFx": { "pesoFusion": 2 },
   "penalizacion": "El pool se inclina menos",
   "penalizacionFx": { "inclinacionPool": -0.5 },
   "propuesta": false
  },
  {
   "id": "secuela",
   "nombre": "Secuela",
   "bono": "+15 % de cadencia",
   "bonoFx": { "cadencia": 0.15 },
   "penalizacion": "−15 % de casco",
   "penalizacionFx": { "casco": -0.15 },
   "propuesta": true
  },
  {
   "id": "crossover",
   "nombre": "Crossover",
   "bono": "+20 % a las fusiones de portador y carga distintos",
   "bonoFx": { "danoFusionMixta": 0.2 },
   "penalizacion": "−20 % a las fusiones de mismo tipo",
   "penalizacionFx": { "danoFusionDoble": -0.2 },
   "propuesta": true
  },
  {
   "id": "cameo",
   "nombre": "Cameo",
   "bono": "Un reroll más por rango",
   "bonoFx": { "rerollPorRango": 1 },
   "penalizacion": "−10 % de chatarra absorbida",
   "penalizacionFx": { "chatarra": -0.1 },
   "propuesta": true
  }
 ],
 "aurasNota": "El plan da 2 auras (Taquillazo y Remake, propuesta:false). Las otras 3 (propuesta:true) completan las 5 y están por confirmar: el encargo pedía al menos 4."
};
