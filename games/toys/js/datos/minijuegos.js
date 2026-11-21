// Fans of Toys · datos · MINIJUEGOS: el nombre, lo que hay que hacer y qué bonus da cada uno de los tres minijuegos del mes. `clave` es el
// efecto de TY.Minijuegos.efecto que sube con la nota: el texto del bonus lleva {n} (el porcentaje).
'use strict';
TY.MINIJUEGOS = TY.congela({
  calidad: { nombre: 'Control de calidad', clave: 'precio', premio: 'Precio de venta +{n}%',
    texto: 'Toca los juguetes rotos antes de que lleguen al final de la cinta. Los rotos llevan una raya roja. No toques los buenos.' },
  prensa: { nombre: 'La prensa', clave: 'unidades', premio: 'Unidades gratis +{n}%',
    texto: 'Mantén pulsado para cargar la prensa y suelta cuando la barra esté en la zona verde. Son tres golpes.' },
  likes: { nombre: 'Likes del chat', clave: 'demanda', premio: 'Ventas esperadas +{n}%',
    texto: 'Toca los likes y los mensajes del chat antes de que caigan. Los SPAM en rojo te quitan puntos.' },
});
