// Fans of Nova · Datos de facciones: su nave y sus tres armas propias (diseño en docs/nova/facciones-y-armas.md).
// INSIGNIA: la lleva montada su nave desde el principio; solo existe en esa nave. SECRETA (legendaria): se desbloquea al pasarte la campaña con la facción
// y desde entonces sale en las cartas y la estación de todas tus partidas. ESPECIAL (rara, útil): se desbloquea al llegar a cierto rango con la facción.
// Las cargas respetan lo que admite cada portador (datos-armas.js) y no tocan la lógica de estados y combos: solo usan sus tipos.
// `rasgo` (o `rasgos`) es lo único que no es un multiplicador: lo aplica facciones.js. CIFRAS PROVISIONALES: se iteran jugando y con nova-balance.py.
// nave.anclajes[etapa][n] = [x, y] de las ranuras babor n / estribor n (x de estribor; babor es -x) que con su arte propio quedaban fuera del casco, recolocadas por etapa.
// nave.base + nave.matiz: mientras llega el arte propio, la nave se dibuja con el casco de `base` teñido; con arte propio (ids «<facción>-casco…») se usa ese.
'use strict';
const NOVA_FACCIONES = {
  animales: {
    nave: { nombre: 'Caza', casco: 'caza' },
    insignia: { id: 'lanzazanahorias', portador: 'lanzador', carga: 'explosiva', nombre: 'Lanzazanahorias', dano: 2, cad: 1.4, rasgo: { tipo: 'rabia', paso: 0.1, tope: 0.5, radio: 220 }, efecto: 'Rabia: pega un 10 % más por cada enemigo cerca, hasta un 50 %' },
    secreta: { id: 'zanahoriaAtomica', portador: 'lanzador', carga: 'explosiva', nombre: 'Zanahoria atómica', dano: 7, cad: 0.06, alc: 1.1, rasgo: { tipo: 'area', radio: 260, mult: 0.8 }, efecto: 'Una carga enorme cada 15 s que borra a los enemigos pequeños' },
    especial: { id: 'cuernosHierro', portador: 'railgun', carga: 'cinetica', nombre: 'Cuernos de hierro', dano: 1.3, perf: 3, efecto: 'Un railgun que atraviesa a cuatro enemigos', rango: 15 }
  },
  nomuertos: {
    nave: { nombre: 'Sepulcro', base: 'fragata', matiz: 135, anclajes: { 1: { 2: [22, -36], 3: [70, 0], 4: [78, 40] }, 2: { 1: [76, 42], 2: [24, -31], 3: [74, 22], 4: [90, 57] }, 3: { 2: [49, -10], 3: [105, 14], 4: [109, 42] }, 4: { 4: [129, 34] }, 5: { 3: [102, 16], 4: [143, 86] } }, brief: 'Casco morado oscuro con costillas de hueso, proa con calavera, alas de murciélago de hueso y brillo verde azulado.' },
    insignia: { id: 'segadoraAlmas', portador: 'drones', carga: 'energia', nombre: 'Segadora de almas', dano: 1.2, n: 1, rasgo: { tipo: 'robo', parte: 0.08 }, efecto: 'Sus drones te curan una parte del daño que hacen' },
    secreta: { id: 'coroAlmas', portador: 'drones', carga: 'energia', nombre: 'Coro de almas', dano: 0.8, n: 5, cad: 1.1, efecto: 'Un enjambre de ocho espectros que lo atraviesan todo' },
    especial: { id: 'dronesTumba', portador: 'drones', carga: 'cinetica', nombre: 'Drones de la tumba', dano: 1.15, n: 1, rasgo: { tipo: 'robo', parte: 0.03 }, efecto: 'Un dron más que cura un poco al golpear y derriba misiles', rango: 15 }
  },
  streamers: {
    nave: { nombre: 'Directo', base: 'caza', matiz: 245, anclajes: { 1: { 2: [18, -18], 3: [57, 30], 5: [72, 66] }, 2: { 3: [65, 34], 5: [94, 76] }, 3: { 3: [92, 7], 5: [97, 79] }, 4: { 3: [120, 5], 5: [110, 82] }, 5: { 3: [121, 49], 5: [147, 100] } }, brief: 'Morado y rosa neón, luz roja «LIVE» en la proa, antenas parabólicas y vainas de cámara en las alas.' },
    insignia: { id: 'canonHype', portador: 'railgun', carga: 'explosiva', nombre: 'Cañón de Hype', dano: 0.9, rasgo: { tipo: 'hype', paso: 0.05, tope: 0.5 }, efecto: 'Dispara más rápido con cada baja seguida; se enfría si te hieren' },
    secreta: { id: 'hypeTrain', portador: 'flak', carga: 'explosiva', nombre: 'Hype train', dano: 0.9, n: 8, cad: 1.3, rasgo: { tipo: 'critico', prob: 0.35, mult: 2 }, efecto: 'Una tormenta de perdigones con críticos a menudo' },
    especial: { id: 'misilesSeguidores', portador: 'lanzador', carga: 'explosiva', nombre: 'Misiles de seguidores', dano: 0.8, cad: 1.5, n: 1, efecto: 'Dos misiles por salva y más a menudo, cada uno algo más flojo', rango: 15 }
  },
  heroes: {
    nave: { nombre: 'Templo', base: 'crucero', matiz: 185, anclajes: { 1: { 2: [49, -42], 3: [80, -14] }, 2: { 2: [34, -43], 3: [110, 18] }, 3: { 3: [125, 18] }, 4: { 2: [60, -54], 3: [128, -15] }, 5: { 3: [168, -23] } }, brief: 'Dorado y azul real, columnas como motores, cresta alada de laurel; alas en forma de escudo.' },
    insignia: { id: 'rayoZeus', portador: 'laser', carga: 'energia', nombre: 'Rayo de Zeus', dano: 1.3, cad: 0.8, rasgos: [{ tipo: 'cadena', saltos: 2, mult: 0.5, radio: 240 }, { tipo: 'precision', cada: 5, mult: 2 }], efecto: 'Salta a dos enemigos más; cada quinto disparo es un crítico seguro' },
    secreta: { id: 'tormentaOlimpica', portador: 'laser', carga: 'energia', nombre: 'Tormenta olímpica', dano: 1.1, cad: 0.9, rasgo: { tipo: 'cadena', saltos: 3, mult: 0.7, radio: 99999 }, efecto: 'Cada rayo cae además sobre tres enemigos más, estén donde estén' },
    especial: { id: 'lanzaAlba', portador: 'railgun', carga: 'energia', nombre: 'Lanza del Alba', dano: 1.2, alc: 1.2, perf: 3, efecto: 'Una lanza de luz que llega lejos y atraviesa', rango: 15 }
  },
  ciber: {
    nave: { nombre: 'Crucero', casco: 'crucero' },
    insignia: { id: 'pulsoHackeo', portador: 'laser', carga: 'energia', nombre: 'Pulso de hackeo', dano: 1, cad: 1.2, alc: 0.85, rasgo: { tipo: 'hackeo', parte: 0.5 }, efecto: 'El primer pulso sobre un enemigo le quita la mitad del escudo' },
    secreta: { id: 'firewall', portador: 'drones', carga: 'cinetica', nombre: 'Firewall', dano: 1.2, n: 2, cad: 1.3, efecto: 'Drones cortafuegos que derriban misiles y pegan fuerte', },
    especial: { id: 'laserRed', portador: 'laser', carga: 'energia', nombre: 'Láser de red', dano: 1.1, cad: 1.3, alc: 1.2, efecto: 'Un láser rápido y de largo alcance', rango: 15 }
  },
  memes: {
    nave: { nombre: 'Troll', base: 'caza', matiz: 60, anclajes: { 1: { 3: [60, 18], 5: [72, 34] }, 2: { 3: [74, 32], 5: [97, 76] }, 3: { 3: [73, 19], 5: [92, 75] }, 4: { 5: [110, 82] }, 5: { 3: [128, 45], 5: [147, 100] } }, brief: 'Lima y amarillo, paneles desparejados y asimétricos, emblema de shiba, cabina con gafas de sol.' },
    insignia: { id: 'canonRNG', portador: 'flak', carga: 'cinetica', nombre: 'Cañón RNG', dano: 1, rasgo: { tipo: 'rng', prob: 0.1, mult: 5 }, efecto: 'Cada salva sale con una carga al azar; a veces es un meme crítico ×5' },
    secreta: { id: 'memeLegendario', portador: 'railgun', carga: 'energia', nombre: 'Meme legendario', dano: 1.2, rasgo: { tipo: 'azar', min: 0.3, max: 5 }, efecto: 'Cada disparo pega entre muy poco y muchísimo' },
    especial: { id: 'cajaSorpresa', portador: 'flak', carga: 'termica', nombre: 'Caja sorpresa', dano: 1, n: 3, rasgo: { tipo: 'azar', min: 0.7, max: 1.6 }, efecto: 'Una flak con más perdigones y daño variable', rango: 15 }
  },
  gamer: {
    nave: { nombre: 'Setup', base: 'fragata', matiz: 110, anclajes: { 1: { 3: [72, 0], 4: [86, 24] }, 2: { 1: [76, 42], 3: [69, 18], 4: [90, 57] }, 3: { 2: [49, -10], 3: [102, -10], 4: [109, 42] }, 4: { 3: [126, -16], 4: [124, 68] }, 5: { 2: [45, -24], 3: [121, 12], 4: [145, 72] } }, brief: 'Verde y negro, paneles de teclado, tiras LED RGB en las alas, torretas laterales.' },
    insignia: { id: 'francotirador', portador: 'railgun', carga: 'cinetica', nombre: 'Francotirador', dano: 1.1, cad: 0.7, alc: 1.4, perf: 4, rasgo: { tipo: 'lejano', mult: 1.5 }, efecto: 'Cuanto más lejos el blanco, más daño: hasta un 150 % más' },
    secreta: { id: 'aimbot', portador: 'lanzador', carga: 'cinetica', nombre: 'Aimbot', dano: 0.9, cad: 1.4, n: 2, perf: 2, efecto: 'Una salva de tres proyectiles guiados que no fallan', },
    especial: { id: 'rifleMarca', portador: 'railgun', carga: 'cinetica', nombre: 'Rifle de marca', dano: 1.25, alc: 1.4, efecto: 'Un railgun de alcance enorme', rango: 15 }
  },
  olvidados: {
    nave: { nombre: 'Fragata', casco: 'fragata' },
    insignia: { id: 'canonNostalgico', portador: 'flak', carga: 'explosiva', nombre: 'Cañón nostálgico', dano: 1.3, n: 2, cad: 0.8, rasgo: { tipo: 'nostalgia', porRango: 0.01 }, efecto: 'Un +1 % de daño por cada rango que tengas' },
    secreta: { id: 'titanBeta', portador: 'lanzador', carga: 'explosiva', nombre: 'Titán beta', dano: 4.5, cad: 0.2, perf: 1, rasgo: { tipo: 'area', radio: 190, mult: 0.9 }, efecto: 'Un obús enorme y lento con una onda expansiva gigante' },
    especial: { id: 'morteroOxidado', portador: 'lanzador', carga: 'termica', nombre: 'Mortero oxidado', dano: 1.5, cad: 0.7, alc: 1.1, efecto: 'Lento, pero cada obús deja al enemigo ardiendo', rango: 15 }
  },
  pop: {
    nave: { nombre: 'Estreno', base: 'crucero', matiz: 110, anclajes: { 1: { 2: [24, -36], 3: [105, 16] }, 2: { 2: [34, -11], 3: [110, 18] }, 4: { 3: [132, -19] }, 5: { 2: [50, -38], 3: [152, 9] } }, brief: 'Rosa y blanco, rayas de claqueta en las alas, focos en la proa, proa de megáfono.' },
    insignia: { id: 'secuela', portador: 'laser', carga: 'termica', nombre: 'Secuela', dano: 0.9, rasgo: { tipo: 'secuela', espera: 0.4, mult: 1.5 }, efecto: 'Cada disparo se repite como secuela con un 50 % más de daño' },
    secreta: { id: 'spoiler', portador: 'laser', carga: 'termica', nombre: 'Spoiler', dano: 1.3, cad: 1.1, rasgo: { tipo: 'jefe', mult: 2 }, efecto: 'Revela el punto débil de los jefes: el doble de daño contra ellos' },
    especial: { id: 'canonConfeti', portador: 'flak', carga: 'termica', nombre: 'Cañón de confeti', dano: 0.9, n: 5, efecto: 'Una nube de perdigones que calienta a todo el grupo', rango: 15 }
  }
};
