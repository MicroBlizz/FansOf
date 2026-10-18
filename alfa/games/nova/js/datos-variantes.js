// Fans of Nova · Variantes de armas y rarezas: cada portador tiene armas con nombre propio que se ofrecen en las cartas (y en la estación).
// Cuanto más rara, más fuerte y más difícil de encontrar. Cada variante multiplica la base del portador (datos-armas.js) sin tocar sus cifras.
// CIFRAS PROVISIONALES. dano/cad/alc multiplican; perf suma perforaciones (railgun, lanzador); n suma proyectiles (flak) o drones.
'use strict';
const NOVA_RAREZAS = {
  comun: { nombre: 'Común', peso: 1, color: '#9fb4d8', precio: 1 },
  rara: { nombre: 'Rara', peso: 0.45, color: '#4aa8ff', precio: 1.5 },
  epica: { nombre: 'Épica', peso: 0.18, color: '#b46bff', precio: 2.2 },
  legendaria: { nombre: 'Legendaria', peso: 0.06, color: '#ffb52e', precio: 3.5 }
};
const NOVA_RAREZAS_ORDEN = ['comun', 'rara', 'epica', 'legendaria'];
const NOVA_VARIANTES = [
  { id: 'carabinaRiel', portador: 'railgun', nombre: 'Carabina de riel', rareza: 'comun', dano: 0.8, cad: 1.35, efecto: 'Dispara más deprisa, pero pega menos' },
  { id: 'railgunPesado', portador: 'railgun', nombre: 'Railgun pesado', rareza: 'rara', dano: 1.45, cad: 0.85, alc: 1.1, efecto: 'Cada bala pega mucho más' },
  { id: 'lanzaRiel', portador: 'railgun', nombre: 'Lanza de riel', rareza: 'epica', dano: 1.2, alc: 1.25, perf: 3, efecto: 'Atraviesa a más enemigos y llega más lejos' },
  { id: 'railgunVacio', portador: 'railgun', nombre: 'Railgun del Vacío', rareza: 'legendaria', dano: 1.9, alc: 1.35, perf: 5, efecto: 'Una lanza de energía que perfora filas enteras' },
  { id: 'flakCalle', portador: 'flak', nombre: 'Flak de barrio', rareza: 'comun', dano: 0.9, n: 2, efecto: 'Dos perdigones más por salva' },
  { id: 'flakDispersion', portador: 'flak', nombre: 'Flak de dispersión', rareza: 'rara', dano: 0.85, n: 4, efecto: 'Cuatro perdigones más por salva' },
  { id: 'flakAsalto', portador: 'flak', nombre: 'Flak de asalto', rareza: 'epica', dano: 1.15, cad: 1.35, n: 2, efecto: 'Salvas más rápidas y más fuertes' },
  { id: 'flakTormenta', portador: 'flak', nombre: 'Flak tormenta', rareza: 'legendaria', dano: 1.1, cad: 1.2, n: 8, efecto: 'Una nube de metralla que limpia la pantalla' },
  { id: 'laserPulso', portador: 'laser', nombre: 'Láser de pulsos', rareza: 'comun', dano: 0.85, cad: 1.3, efecto: 'Pulsos rápidos y flojitos' },
  { id: 'laserPrecision', portador: 'laser', nombre: 'Láser de precisión', rareza: 'rara', dano: 1.35, alc: 1.2, efecto: 'Más daño y más alcance' },
  { id: 'laserPesado', portador: 'laser', nombre: 'Láser pesado', rareza: 'epica', dano: 1.8, cad: 0.7, alc: 1.15, efecto: 'Lento, pero cada haz quema' },
  { id: 'rayoSolar', portador: 'laser', nombre: 'Rayo solar', rareza: 'legendaria', dano: 1.6, cad: 1.25, alc: 1.3, efecto: 'Un haz de estrella rápido, fuerte y de largo alcance' },
  { id: 'miniMisiles', portador: 'lanzador', nombre: 'Minimisiles', rareza: 'comun', dano: 0.7, cad: 1.5, efecto: 'Muchos misiles pequeños' },
  { id: 'lanzamisiles', portador: 'lanzador', nombre: 'Lanzamisiles', rareza: 'rara', dano: 1.3, alc: 1.15, efecto: 'Misiles más grandes que llegan más lejos' },
  { id: 'torpedo', portador: 'lanzador', nombre: 'Torpedo', rareza: 'epica', dano: 2.0, cad: 0.6, perf: 1, efecto: 'Lento y devastador; atraviesa un enemigo' },
  { id: 'misilNuclear', portador: 'lanzador', nombre: 'Misil de cabeza nuclear', rareza: 'legendaria', dano: 2.6, cad: 0.7, alc: 1.2, perf: 2, efecto: 'El misil que borra al jefe' },
  { id: 'dronesEnjambre', portador: 'drones', nombre: 'Drones de enjambre', rareza: 'comun', dano: 0.8, n: 1, efecto: 'Un dron más, algo más flojos' },
  { id: 'dronesGuardian', portador: 'drones', nombre: 'Drones guardianes', rareza: 'rara', dano: 1.3, cad: 1.2, efecto: 'Pegan más y más a menudo' },
  { id: 'dronesReparador', portador: 'drones', nombre: 'Drones reparadores', rareza: 'rara', repara: true, efecto: 'No atacan: reparan tu casco cada pocos segundos' },
  { id: 'dronesCombate', portador: 'drones', nombre: 'Drones de combate', rareza: 'epica', dano: 1.2, n: 2, efecto: 'Dos drones más y con más mordisco' },
  { id: 'colmena', portador: 'drones', nombre: 'Colmena', rareza: 'legendaria', dano: 1.15, cad: 1.2, n: 4, efecto: 'Un enjambre de cuatro drones extra' }
];
const NV_VAR_ID = {};
for (const v of NOVA_VARIANTES) NV_VAR_ID[v.id] = v;
// Multiplicadores de la variante de un arma (1 / 0 si es la básica).
const NV_VAR_BASE = { dano: 1, cad: 1, alc: 1, perf: 0, n: 0, repara: false };
function nvVar(w) {
  const v = w && w.variante && NV_VAR_ID[w.variante];
  return v ? { dano: v.dano || 1, cad: v.cad || 1, alc: v.alc || 1, perf: v.perf || 0, n: v.n || 0, repara: !!v.repara } : NV_VAR_BASE;
}
