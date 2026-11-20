// Fans of Pinball · adaptador · DOM: las ayudas de página que usan todas las pantallas y ventanas. PB.crea monta un elemento, PB.capa() es
// la capa de interfaz (#pb-capa, encima del lienzo) y PB.imagen(nombre, escala) da un <img> pixelado de img/ a escala entera.
'use strict';
// PB.crea('button', { className: 'pb-boton', textContent: tr('Vale'), onclick: fn }, hijo1, hijo2…)
PB.crea = (etiqueta, props = {}, ...hijos) => {
  const e = Object.assign(document.createElement(etiqueta), props);
  e.append(...hijos);
  return e;
};
PB.capa = () => document.getElementById('pb-capa');
// una imagen de img/ a escala entera (el tamaño CSS sale del natural × escala, sin suavizar)
PB.imagen = (archivo, escala = 2, clase = '') => {
  const img = PB.crea('img', { src: AJUSTES.arte.carpeta + archivo, alt: '', className: 'pb-pixel ' + clase, draggable: false });
  img.addEventListener('load', () => { img.style.width = img.naturalWidth * escala + 'px'; img.style.height = img.naturalHeight * escala + 'px'; }, { once: true });
  return img;
};
// un número con puntos de miles (12.345)
PB.miles = n => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, typeof IDIOMA !== 'undefined' && NUCLEO.idioma === 'en' ? ',' : '.');
