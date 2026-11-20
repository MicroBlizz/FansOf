// Fans of Toys · datos · NOTICIAS: lo que puede pasar un mes. Unas solo cambian el mes (`efecto`); otras piden elegir entre dos
// `opciones`, cada una con sus `resultados` posibles (p = probabilidad; suman 1). Las claves de `efecto`, en dominio/noticias.js.
// `real` cuenta el caso de verdad en que se inspira (fuentes: investigación de la tarea #259). Textos en español; su inglés, en idioma/en-noticias.js.
'use strict';
TY.NOTICIAS = TY.congela([
  { id: 'fiebre', titulo: 'Fiebre en los patios', texto: 'Los niños solo hablan de un juguete. Este mes ese se vende mucho más.',
    real: 'En 1996 nadie encontraba un muñeco que se reía con cosquillas y se revendía carísimo.', efecto: { demandaOferta: 1.7 } },
  { id: 'feria', titulo: 'Feria del Juguete', texto: 'Las grandes cadenas han visto tus prototipos y se fían. Todo se vende un poco más.',
    real: 'Las tiendas eligen los juguetes de Navidad en ferias que se celebran en febrero.', efecto: { demanda: 1.25 } },
  { id: 'peleas', titulo: 'Peleas en el centro comercial', texto: 'Dos padres se han peleado por tu juguete y ha salido en la tele. Publicidad gratis, pero llega una multa.',
    real: 'En 1983 hubo peleas en las tiendas por unos muñecos con cara de repollo.', efecto: { demanda: 1.4, multaFija: 35 } },
  { id: 'barco', titulo: 'Barco atascado', texto: 'Un barco cruzado en un canal retrasa el plástico. Fabricar cuesta un 30 % más este mes.',
    real: 'Un solo barco atascado puede parar medio comercio del mundo durante días.', efecto: { costeUnidad: 1.3 } },
  { id: 'monstruito', titulo: 'El monstruito ya no mola', texto: 'La moda del trimestre se enfría de golpe. Este mes no cuenta.',
    real: 'Una empresa vivía de un solo muñeco de moda y, cuando se pasó, cayeron sus ventas.', efecto: { sinModa: true } },
  { id: 'vitrina', titulo: 'Adultos con vitrina', texto: 'Los coleccionistas adultos compran todo lo caro para no abrirlo nunca. Los juguetes caros se venden más.',
    real: 'En 2025 los coleccionables fueron lo que más creció en las jugueterías de Estados Unidos.', efecto: { demandaLujo: 1.6 } },
  { id: 'rebaja', titulo: 'Rebaja diabólica', texto: 'La tienda oficial lo rebaja todo a 6,66. Este mes el precio barato arrasa.',
    real: 'Una tienda oficial rebajó la figura de un duende del tesoro justo a 6,66.', efecto: { baratoDemanda: 2.1 } },
  { id: 'url', titulo: 'La web equivocada', texto: 'La imprenta ha puesto en las cajas la dirección de una web que no es la tuya. Y no es para niños.',
    real: 'Pasó en 2024 con unas muñecas de una película: las cajas con el error se revendieron como rarezas.',
    opciones: [
      { texto: 'Retirar las cajas', resultados: [{ p: 1, efecto: { multa: 0.1 }, nota: 'Pagas la retirada y aquí no ha pasado nada.' }] },
      { texto: 'Venderlas como rareza', resultados: [
        { p: 0.5, efecto: { demanda: 1.5 }, nota: 'Los coleccionistas se las quitan de las manos.' },
        { p: 0.5, efecto: { multa: 0.22 }, nota: 'Sale en las noticias. La multa es de las que duelen.' }] },
    ] },
  { id: 'piratas', titulo: 'Copias pirata', texto: 'En el mercadillo venden copias de tus juguetes con un ojo más grande que el otro.',
    real: 'Un juego de crear videojuegos castigaba con piratería a quien lo jugaba pirateado.',
    opciones: [
      { texto: 'Avisarles con educación', resultados: [{ p: 1, efecto: { demanda: 0.88 }, nota: 'Te contestan con otro muñeco pirata. Vendes un poco menos.' }] },
      { texto: 'Mandar a los abogados', resultados: [{ p: 1, efecto: { multaFija: 45, demanda: 1.12 }, nota: 'Los abogados cobran, pero el mercadillo se queda sin copias.' }] },
    ] },
  { id: 'iman', titulo: 'El imán peligroso', texto: 'Seguridad avisa: una pieza con imán de un juguete del almacén se suelta demasiado fácil.',
    real: 'Los imanes pequeños de los juguetes han llevado a miles de niños a urgencias.',
    opciones: [
      { texto: 'Retirar lo del almacén', resultados: [{ p: 1, efecto: { pierdeStock: true }, nota: 'Vacías el almacén. Duele, pero duermes tranquilo.' }] },
      { texto: 'Mirar para otro lado', resultados: [
        { p: 0.65, efecto: {}, nota: 'Esta vez no pasa nada. Esta vez.' },
        { p: 0.35, efecto: { multa: 0.3, pierdeStock: true }, nota: 'Retirada obligatoria y multa. Seguridad te mira con cara de «te lo dije».' }] },
    ] },
  { id: 'merch', titulo: 'Merch antes que el juego', texto: 'Marketing quiere anunciar la figura de un personaje de un juego que todavía no existe.',
    real: 'Más de una vez se han vendido los muñecos antes de que saliera el juego.',
    opciones: [
      { texto: 'Anunciarla ya', resultados: [{ p: 1, efecto: { demanda: 1.35, resaca: 0.8 }, nota: 'Este mes vuela. El mes que viene preguntarán por el juego.' }] },
      { texto: 'Esperar al juego', resultados: [{ p: 1, efecto: {}, nota: 'Marketing suspira. No pasa nada.' }] },
    ] },
]);
