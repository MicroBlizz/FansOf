// Tiny Fans · adaptador · ICONOS: los dibujos de la interfaz, hechos a mano en SVG con contorno grueso y los colores del juego (nada de
// emojis). TN.iconos.svg(nombre, lado) da el HTML de un <svg>; un nombre que no existe da un recuadro vacío.
'use strict';
TN.iconos = (() => {
  const T = '#3a2414', S = `stroke="${T}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const DIBUJOS = {
    pila: `<rect x="4" y="8" width="14" height="10" rx="2" fill="#4fae3c" ${S}/><rect x="18" y="8" width="5" height="10" rx="1" fill="#ffd23f" ${S}/><rect x="23" y="11" width="3" height="4" fill="#b9c9d6" ${S}/>`,
    mochila: `<path d="M9 9a6 6 0 0 1 12 0" fill="none" ${S}/><rect x="5" y="9" width="20" height="17" rx="5" fill="#ff8a1f" ${S}/><rect x="10" y="16" width="10" height="6" rx="2" fill="#ffd23f" ${S}/>`,
    rayo: `<path d="M17 3 6 17h7l-2 10 12-15h-8z" fill="#7cf0ff" ${S}/>`,
    casa: `<path d="M4 15 15 5l11 10v11H4z" fill="#fff4dc" ${S}/><path d="M2 16 15 4l13 12" fill="none" ${S}/><rect x="12" y="17" width="6" height="9" fill="#ff8a1f" ${S}/>`,
    flecha: `<path d="M4 15h16M14 7l8 8-8 8" fill="none" stroke="${T}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15h16M14 7l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    carton: `<path d="M4 11 15 6l11 5v10l-11 5-11-5z" fill="#c9a063" ${S}/><path d="M4 11l11 5 11-5M15 16v10" fill="none" ${S}/>`,
    grapas: `<path d="M5 20V10h20v10" fill="none" stroke="${T}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20V10h20v10" fill="none" stroke="#dbe6ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    migas: `<circle cx="12" cy="17" r="7" fill="#d9a55a" ${S}/><circle cx="21" cy="12" r="4" fill="#e8bf7a" ${S}/><circle cx="22" cy="22" r="3" fill="#c48f45" ${S}/>`,
    plastico: `<path d="M9 5h12l3 8-4 13H10L6 13z" fill="#4fb8e8" ${S}/><path d="M11 9h6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
    pilas: `<rect x="5" y="9" width="8" height="16" rx="2" fill="#4fae3c" ${S}/><rect x="7" y="5" width="4" height="4" fill="#ffd23f" ${S}/><rect x="17" y="9" width="8" height="16" rx="2" fill="#4fae3c" ${S}/><rect x="19" y="5" width="4" height="4" fill="#ffd23f" ${S}/>`,
    'grapa-doble': `<path d="M4 17V8h9v9M17 22v-9h9v9" fill="none" stroke="${T}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17V8h9v9M17 22v-9h9v9" fill="none" stroke="#dbe6ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    'punta-afilada': `<path d="M15 3l5 14H10z" fill="#dbe6ee" ${S}/><rect x="8" y="17" width="14" height="5" rx="2" fill="#e2452f" ${S}/><rect x="13" y="22" width="4" height="5" fill="#3a2414"/>`,
    'cafe-cargado': `<path d="M6 11h15v9a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6z" fill="#fff4dc" ${S}/><path d="M21 13h3a3 3 0 0 1 0 7h-3" fill="none" ${S}/><path d="M10 7c0-3 3-2 3-5M16 7c0-3 3-2 3-5" fill="none" ${S}/>`,
    'pila-repuesto': `<rect x="4" y="10" width="15" height="10" rx="2" fill="#4fae3c" ${S}/><rect x="19" y="13" width="3" height="4" fill="#ffd23f" ${S}/><path d="M24 6v8M20 10h8" fill="none" stroke="${T}" stroke-width="3.5" stroke-linecap="round"/>`,
    asalto: `<path d="M5 25 20 8l4-1-1 4L8 26z" fill="#dbe6ee" ${S}/><path d="M5 19l6 6" fill="none" ${S}/><path d="M25 25 10 8 6 7l1 4 15 15z" fill="#dbe6ee" ${S}/><path d="M25 19l-6 6" fill="none" ${S}/>`,
    expedicion: `<circle cx="15" cy="15" r="11" fill="#fff4dc" ${S}/><path d="M19 9l-2 8-6 4 2-8z" fill="#e2452f" ${S}/>`,
    construir: `<rect x="4" y="16" width="22" height="9" rx="1" fill="#c9a063" ${S}/><rect x="8" y="7" width="14" height="9" rx="1" fill="#c9a063" ${S}/>`,
    reloj: `<circle cx="15" cy="16" r="10" fill="#fff4dc" ${S}/><path d="M15 10v6l4 3M12 3h6" fill="none" ${S}/>`,
    sonido: `<path d="M5 12h5l6-5v16l-6-5H5z" fill="#ffd23f" ${S}/><path d="M20 11a6 6 0 0 1 0 8M23 8a10 10 0 0 1 0 14" fill="none" ${S}/>`,
    silencio: `<path d="M5 12h5l6-5v16l-6-5H5z" fill="#ffd23f" ${S}/><path d="M20 11l6 8M26 11l-6 8" fill="none" ${S}/>`,
    cerrar: `<path d="M8 8l14 14M22 8 8 22" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`,
    papelera: `<path d="M7 10h16l-2 16H9z" fill="#e2452f" ${S}/><path d="M5 10h20M12 6h6" fill="none" ${S}/>`,
  };
  for (const n of ['pared-carton', 'pared-plastico', 'puerta', 'chinchetas', 'almacen', 'ratonera', 'pegamento', 'ventilador']) DIBUJOS[n] = ({
    'pared-carton': `<rect x="4" y="8" width="22" height="16" rx="1" fill="#c9a063" ${S}/><path d="M4 14h22M4 19h22" fill="none" stroke="#9c7340" stroke-width="2"/>`,
    'pared-plastico': `<rect x="4" y="8" width="22" height="16" rx="3" fill="#4fb8e8" ${S}/><path d="M8 12h8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
    puerta: `<path d="M7 26V9a8 8 0 0 1 16 0v17z" fill="#8a5630" ${S}/><circle cx="19" cy="17" r="2" fill="#ffd23f" ${S}/>`,
    chinchetas: `<path d="M8 24l3-12 3 12zM17 24l3-12 3 12z" fill="#dbe6ee" ${S}/><circle cx="11" cy="10" r="4" fill="#e2452f" ${S}/><circle cx="20" cy="10" r="4" fill="#e2452f" ${S}/>`,
    almacen: `<rect x="4" y="10" width="22" height="15" rx="2" fill="#2f8fd8" ${S}/><rect x="11" y="15" width="8" height="5" rx="1" fill="#ffd23f" ${S}/><path d="M4 10l3-5h16l3 5" fill="#58a8e6" ${S}/>`,
    ratonera: `<rect x="4" y="18" width="22" height="7" rx="1" fill="#d8b06a" ${S}/><path d="M7 18c0-12 16-12 16 0" fill="none" ${S}/>`,
    pegamento: `<ellipse cx="15" cy="20" rx="11" ry="5" fill="#fff0a0" ${S}/><path d="M12 5h6v8h-6z" fill="#fff4dc" ${S}/>`,
    ventilador: `<circle cx="15" cy="15" r="11" fill="#fff4dc" ${S}/><path d="M15 15c-6-8 4-10 2-2 8-6 10 4 2 2 6 8-4 10-2 2-8 6-10-4-2-2z" fill="#4fb8e8" ${S}/>`,
  })[n];
  return {
    nombres: () => Object.keys(DIBUJOS),
    svg(nombre, lado = 30) {
      const d = DIBUJOS[nombre] || `<rect x="4" y="4" width="22" height="22" rx="3" fill="none" ${S}/>`;
      return `<svg class="tn-icono" viewBox="0 0 30 30" width="${lado}" height="${lado}" aria-hidden="true">${d}</svg>`;
    },
    // un <span> con el icono dentro, listo para meter con TN.crea
    nodo(nombre, lado) { const s = document.createElement('span'); s.className = 'tn-ico'; s.innerHTML = this.svg(nombre, lado); return s; },
  };
})();
