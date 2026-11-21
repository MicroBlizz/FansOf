// Fans Of · /gestion · TABLERO · dominio · COMPARTIR (tarea #302, Pepins): el mensaje para mandar una tarea por WhatsApp o lo que ofrezca el móvil
// («#N nombre · columna · responsable», el principio de «Qué hay que hacer» y el enlace directo) y el enlace directo /gestion/?seccion=tablero&tarea=N:
// cómo se arma y cómo se lee al abrir la página. Funciones puras, sin pantalla ni red: `location` llega como parámetro.
'use strict';
TABLERO.TOPE_COMPARTIR = 200;   // letras de la descripción que van en el mensaje

// El texto cortado a `tope` letras como mucho, en un límite de palabra y con «…» si se ha cortado (una sola palabra más larga que el tope se corta a lo bruto)
TABLERO.recortaTexto = (texto, tope) => {
  const limpio = String(texto || '').replace(/\s+/g, ' ').trim();
  if (limpio.length <= tope) return limpio;
  const trozo = limpio.slice(0, tope + 1), corte = trozo.lastIndexOf(' ');
  return (corte > 0 ? trozo.slice(0, corte) : limpio.slice(0, tope)).replace(/[\s,.;:—-]+$/, '') + '…';
};

// El mensaje de una tarea (json o TABLERO.Tarea con corto, descripcion y responsable): { titulo, texto, enlace, completo }. `titulo` es la primera línea,
// `texto` la primera línea y la descripción (para navigator.share, que lleva el enlace aparte) y `completo` todo junto con el enlace (para wa.me)
TABLERO.mensajeCompartir = (t, enlace) => {
  const titulo = `#${t.id} ${t.corto || t.titulo} · ${TABLERO.tituloDe(t.estado)} · ${TABLERO.responsableTexto(t)}`;
  const que = TABLERO.recortaTexto(t.descripcion, TABLERO.TOPE_COMPARTIR);
  const texto = que ? titulo + '\n\n' + que : titulo;
  return Object.freeze({ titulo, texto, enlace, completo: texto + '\n\n' + enlace });
};

// La carpeta de /gestion a partir de `location` ({ origin, pathname }): vale igual en producción (/FansOf/gestion/) y en la alfa (/FansOf/alfa/gestion/),
// con o sin index.html y con o sin la barra del final
const carpeta = pathname => {
  const ruta = String(pathname || '/');
  const ultimo = ruta.slice(ruta.lastIndexOf('/') + 1);
  return ultimo.includes('.') ? ruta.slice(0, ruta.length - ultimo.length) : ultimo ? ruta + '/' : ruta;
};
TABLERO.enlaceTarea = (loc, id) => `${loc.origin}${carpeta(loc.pathname)}?seccion=tablero&tarea=${id}`;

// El número de tarea de un enlace directo (`location.search`), o null: solo un entero positivo y solo si la sección es el tablero (o no se dice)
TABLERO.tareaDelEnlace = search => {
  const p = new URLSearchParams(String(search || '')), seccion = p.get('seccion'), tarea = String(p.get('tarea') ?? '').trim();
  if (seccion !== null && seccion !== 'tablero') return null;
  return /^\d{1,9}$/.test(tarea) && Number(tarea) > 0 ? Number(tarea) : null;
};
