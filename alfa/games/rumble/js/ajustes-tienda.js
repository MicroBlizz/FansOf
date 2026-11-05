// Fans of Rumble · AJUSTES de la TIENDA DE GEMAS (ADR 050, docs/core/TIENDA-GEMAS.md): qué se vende con gemas, a precio fijo y sin azar.
// El sistema está en core/js/sistema/tienda-fija.js; herramientas/subir_datos.py sube precios y escaparate al servidor, que es quien cobra.
// articulos: id → { sec (pestaña), grupo (título dentro de la pestaña), tipo (qué da: marco, frases…), rar, precio en gemas, nota }.
// Los marcos y las frases que se venden aquí están en js/retos-armario.js con de: 'En la tienda de gemas'.
// escaparate: n objetos cada lunes desde `inicio`, recorriendo `lista` en orden; calidad fija q (0,9 = Director, la penúltima) y precio por rareza.
'use strict';
AJUSTES.tiendaFija = {
  articulos: {
    'marco:diafana': { sec: 'cosmeticos', grupo: 'Marcos de perfil', tipo: 'marco', id: 'diafana', rar: 'rare', precio: 300 },
    'marco:vistas':  { sec: 'cosmeticos', grupo: 'Marcos de perfil', tipo: 'marco', id: 'vistas', rar: 'epic', precio: 450 },
    'marco:phony':   { sec: 'cosmeticos', grupo: 'Marcos de perfil', tipo: 'marco', id: 'phony', rar: 'epic', precio: 450 },
    'frases:reunion': { sec: 'cosmeticos', grupo: 'Frases para la partida', tipo: 'frases', name: 'Pack «Reunión que pudo ser un correo»', rar: 'epic', precio: 250,
      frases: ['offline', 'calendario', 'alinear', 'kpi'], nota: '4 frases para soltar en plena partida.' },
  },
  // decisión de Daniel y Arkioner (5-11-2026): más caros que en el boceto y con calidad Director; nunca legendarias ni CEO
  escaparate: {
    inicio: '2026-11-02', n: 3, q: 0.9, precios: { rare: 650, epic: 1400 },
    lista: [
      { k: 'ab', id: 'plasma' }, { k: 'ab', id: 'vampiro' }, { k: 'ab', id: 'dlc' },
      { k: 'eq', id: 'raton_dpi' }, { k: 'eq', id: 'corona_carton' }, { k: 'eq', id: 'teclado_rgb' },
      { k: 'ab', id: 'microtrans' }, { k: 'ab', id: 'escarcha' }, { k: 'eq', id: 'gorro_aluminio' },
    ],
  },
};
