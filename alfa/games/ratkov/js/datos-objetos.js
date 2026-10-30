// Fans of Ratkov · LOS OBJETOS: todo lo que se puede encontrar, llevar, vender o fabricar. Cada uno tiene nombre (n), tipo (t), peso en kg (p),
// valor en chapas (v), rareza de 0 a 4 (r), cuántos caben en una casilla (max) y una frase (d). Los dibujos de sus iconos están en js/iconos.js.
// Tipos: botin (solo para vender), material (para fabricar), muni (balas de un calibre), med (se usa), granada, arma, mod (pieza de arma),
// anom (anomalía bugueada para el taller), chaleco, casco, mochila y llave.
'use strict';
const RAREZA = ['COMÚN', 'NORMAL', 'BUENO', 'RARO', 'ANÓMALO'];
const COLOR_RAREZA = ['#8a9aa4', '#7ec0e0', '#7ee04a', '#ffcb3d', '#c99bff'];
const OBJ = {
  // ---- materiales para el banco ----
  tornillos: { n: 'Tornillos', t: 'material', p: 0.2, v: 18, r: 0, max: 10, d: 'Un puñado de tornillos de una mesa de oficina de Microblizz.' },
  tuberia: { n: 'Tubería', t: 'material', p: 1.0, v: 30, r: 0, max: 3, d: 'Sirve para fabricar silenciadores y cañones. También para pegar.' },
  cables: { n: 'Cables', t: 'material', p: 0.3, v: 24, r: 0, max: 6, d: 'Cables de cargadores que ya no cargan nada.' },
  tela: { n: 'Tela', t: 'material', p: 0.3, v: 20, r: 0, max: 6, d: 'Restos de uniformes de becario. Huelen a café.' },
  cinta: { n: 'Cinta americana', t: 'material', p: 0.2, v: 40, r: 1, max: 5, d: 'Arregla cualquier cosa. Incluso esta ciudad, si tuvieras bastante.' },
  polvora: { n: 'Pólvora', t: 'material', p: 0.3, v: 45, r: 1, max: 6, d: 'Para fabricar balas y zanahorias bomba.' },
  lente: { n: 'Lente', t: 'material', p: 0.2, v: 70, r: 1, max: 3, d: 'De una cámara de seguridad. Te sigue mirando.' },
  alcohol: { n: 'Alcohol', t: 'material', p: 0.5, v: 38, r: 0, max: 3, d: 'Para desinfectar. Solo para desinfectar.' },
  hierbas: { n: 'Hierbas', t: 'material', p: 0.1, v: 22, r: 0, max: 6, d: 'Lo único verde que queda en la ciudad.' },
  lata: { n: 'Lata de conserva', t: 'material', p: 0.4, v: 26, r: 0, max: 4, d: 'Caducó durante la guerra. Está buenísima.' },
  placa: { n: 'Placa de blindaje', t: 'material', p: 2.0, v: 110, r: 2, max: 2, d: 'Para fabricar chalecos. Pesa como un lunes.' },
  chip: { n: 'Chip de Microblizz', t: 'material', p: 0.1, v: 130, r: 2, max: 5, d: 'Tiene grabado «propiedad intelectual». Ahora es tuya.' },
  // ---- botín: solo vale chapas ----
  taza: { n: 'Taza «Mejor CEO»', t: 'botin', p: 0.3, v: 70, r: 0, max: 2, d: 'Nadie se la regaló. Se la compró él.' },
  disco: { n: 'Disco duro de Microblizz', t: 'botin', p: 0.4, v: 260, r: 2, max: 3, d: 'Lleno de juegos cancelados. Alguien pagará por ellos.' },
  documentos: { n: 'Documentos del parche', t: 'botin', p: 0.2, v: 380, r: 2, max: 3, d: 'El parche que empezó la guerra. Pone «solo es un pequeño cambio».' },
  figura: { n: 'Figura de CrazyBunny', t: 'botin', p: 0.6, v: 450, r: 3, max: 1, d: 'Edición de coleccionista, con la corona torcida de serie.' },
  mando: { n: 'Mando dorado', t: 'botin', p: 0.5, v: 720, r: 3, max: 1, d: 'Premio al empleado del mes. Los botones no hacen nada.' },
  grafica: { n: 'Tarjeta gráfica GeForzuda', t: 'botin', p: 0.8, v: 1400, r: 4, max: 1, d: 'Lo más valioso del mundo después de la guerra. Y antes.' },
  blizzcoin: { n: 'Blizzcoin físico', t: 'botin', p: 0.1, v: 950, r: 4, max: 3, d: 'Una moneda de una criptomoneda. Nadie ha entendido nunca por qué.' },
  muestra: { n: 'Muestra sin etiquetar', t: 'botin', p: 0.5, v: 520, r: 3, max: 2, d: 'Algo burbujea dentro. Pone «no abrir hasta el parche 2.0».' },
  cafe: { n: 'Café de máquina', t: 'botin', p: 0.3, v: 35, r: 0, max: 3, d: 'Frío desde hace años. Aun así, mejor que el de la oficina.' },
  // ---- munición: el número es cuántas balas ----
  m9: { n: 'Balas de 9 mm', t: 'muni', p: 0.01, v: 6, r: 0, max: 90, d: 'Para la pistola y la metralleta.' },
  cart: { n: 'Cartuchos', t: 'muni', p: 0.04, v: 15, r: 0, max: 30, d: 'Para la escopeta. De cerca no fallan.' },
  m762: { n: 'Balas de 7,62', t: 'muni', p: 0.02, v: 18, r: 1, max: 60, d: 'Para el fusil y el de precisión.' },
  // ---- lo que se usa ----
  venda: { n: 'Venda', t: 'med', p: 0.1, v: 35, r: 0, max: 4, d: 'Corta la hemorragia y cura 10.', usa: { sangra: true, vida: 10, t: 2.4 } },
  botiquin: { n: 'Botiquín', t: 'med', p: 0.6, v: 150, r: 1, max: 1, d: 'Cura 60 poco a poco y corta la hemorragia.', usa: { sangra: true, vida: 60, t: 4 } },
  te: { n: 'Té caliente', t: 'med', p: 0.4, v: 60, r: 0, max: 2, d: 'Quita 45 de frío. Sabe a refugio.', usa: { frio: 45, t: 1.6 } },
  inyector: { n: 'Inyector de horas extra', t: 'med', p: 0.1, v: 240, r: 2, max: 2, d: 'Cura 30 y corres más durante 20 s. Microblizz lo daba en la cena de Navidad.', usa: { vida: 30, prisa: 20, t: 0.8 } },
  granada: { n: 'Zanahoria bomba', t: 'granada', p: 0.4, v: 90, r: 1, max: 3, d: 'Se lanza con el botón de granada. Explota a los dos segundos.' },
  // ---- armas (sus números están en js/datos-armas.js) ----
  pistola: { n: 'Pistola Zanahórov', t: 'arma', p: 1.0, v: 160, r: 0, max: 1, d: 'Fiable, pequeña y con poco cargador.' },
  metralleta: { n: 'Metralleta Bellota-9', t: 'arma', p: 2.4, v: 900, r: 1, max: 1, d: 'Escupe 9 mm muy deprisa. Gasta mucho.' },
  escopeta: { n: 'Escopeta Trituradora', t: 'arma', p: 3.2, v: 750, r: 1, max: 1, d: 'Siete perdigones. Para los pasillos y los becarios confiados.' },
  fusil: { n: 'Fusil AK-Bunny', t: 'arma', p: 3.6, v: 1900, r: 2, max: 1, d: 'El de toda la vida, con una zanahoria pintada en la culata.' },
  franco: { n: 'Fusil Lupa Larga', t: 'arma', p: 5.0, v: 2700, r: 3, max: 1, d: 'De precisión. Un tiro, una baja, un enemigo menos en la nómina.' },
  // ---- piezas de arma (se montan en el taller) ----
  silenciador: { n: 'Silenciador', t: 'mod', ranura: 'boca', p: 0.4, v: 320, r: 1, max: 1, d: 'Los disparos se oyen mucho menos lejos. Algo menos de daño.' },
  canon: { n: 'Cañón largo', t: 'mod', ranura: 'canon', p: 0.6, v: 360, r: 1, max: 1, d: 'Más daño y más alcance. Pesa más.' },
  mira: { n: 'Mira', t: 'mod', ranura: 'mira', p: 0.3, v: 380, r: 2, max: 1, d: 'Disparos más precisos y más lejos.' },
  cargador: { n: 'Cargador ampliado', t: 'mod', ranura: 'cargador', p: 0.3, v: 300, r: 1, max: 1, d: 'Caben la mitad más de balas.' },
  culata: { n: 'Culata', t: 'mod', ranura: 'culata', p: 0.5, v: 260, r: 1, max: 1, d: 'Retrocede menos al disparar seguido.' },
  // ---- anomalías: piezas que no deberían existir (ver ANOMALIAS en js/datos-armas.js) ----
  'an-lag': { n: 'Cañón con lag', t: 'anom', p: 0.5, v: 1100, r: 4, max: 1, d: 'Cada disparo sale dos veces: la segunda, medio segundo tarde.' },
  'an-crack': { n: 'Cargador crackeado', t: 'anom', p: 0.3, v: 1300, r: 4, max: 1, d: 'No gasta balas. A veces el arma «deja de responder». Muy pocas veces explota.' },
  'an-rebote': { n: 'Física rota', t: 'anom', p: 0.3, v: 1000, r: 4, max: 1, d: 'Las balas rebotan en las paredes dos veces.' },
  'an-hitbox': { n: 'Hitbox gigante', t: 'anom', p: 0.4, v: 900, r: 4, max: 1, d: 'Tus balas son tres veces más gordas. Cuesta fallar.' },
  'an-hielo': { n: 'Parche de invierno', t: 'anom', p: 0.3, v: 950, r: 4, max: 1, d: 'Lo que tocas se congela un poco: va a la mitad de rápido.' },
  'an-desync': { n: 'Desincronía', t: 'anom', p: 0.3, v: 1200, r: 4, max: 1, d: 'Las balas atraviesan a los enemigos y siguen.' },
  // ---- lo que se lleva puesto ----
  'chaleco-l': { n: 'Chaleco de becario', t: 'chaleco', p: 3.0, v: 400, r: 1, max: 1, d: 'Para el 25 % del daño hasta que se rompe.', arm: 0.25, dur: 80 },
  'chaleco-p': { n: 'Chaleco de Seguridad', t: 'chaleco', p: 6.0, v: 1500, r: 3, max: 1, d: 'Para el 45 % del daño. Lleva el logo de Microblizz: tápalo.', arm: 0.45, dur: 150 },
  casco: { n: 'Casco con orejeras', t: 'casco', p: 1.4, v: 450, r: 1, max: 1, d: 'Para el 12 % del daño y abriga: el frío sube más despacio.', arm: 0.12, dur: 60 },
  'mochila-p': { n: 'Mochila pequeña', t: 'mochila', p: 0.6, v: 120, r: 0, max: 1, d: '4 × 4 casillas.', cas: 8 },
  'mochila-m': { n: 'Mochila de excursión', t: 'mochila', p: 1.2, v: 650, r: 1, max: 1, d: '5 × 5 casillas.', cas: 12 },
  'mochila-g': { n: 'Mochila de mudanza', t: 'mochila', p: 2.0, v: 1600, r: 2, max: 1, d: '6 × 7 casillas. Cabe una oficina entera.', cas: 16 },
  // ---- llaves ----
  palanca: { n: 'Palanca', t: 'llave', p: 1.5, v: 500, r: 2, max: 1, d: 'Abre la tapa de la alcantarilla: una salida que nadie vigila.' },
  tarjeta: { n: 'Tarjeta roja de directivo', t: 'llave', p: 0.05, v: 800, r: 3, max: 1, d: 'Abre el Despacho del Director, junto a la torre. Se gasta al usarla.' },
  'llave-despacho': { n: 'Llave de despacho', t: 'llave', p: 0.05, v: 420, r: 2, max: 1, dur: 3, d: 'Abre cajas fuertes y archivadores cerrados sin hacer ruido. Se gasta: tres usos.' },
  abrecartas: { n: 'Abrecartas de directivo', t: 'llave', p: 0.2, v: 260, r: 1, max: 1, dur: 4, d: 'Hace falta para despedir a alguien por la espalda. Se mella: cuatro despidos y a la basura.' },
};
for (const [id, o] of Object.entries(OBJ)) o.id = id;
const esArma = id => OBJ[id] && OBJ[id].t === 'arma';
const nombreDe = id => tr(OBJ[id] ? OBJ[id].n : id);
