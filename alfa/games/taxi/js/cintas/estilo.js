// Fans Of Taxi · CINTAS / estilo: colores y medidas de lo que se construye (un solo sitio para retocarlos).
'use strict';
CINTAS.estilo = {
  colores: {
    asfalto: 0x2a2438,
    bordillo: 0x6a6280,
    rayaAmarilla: 0xffcb3d,
    rayaBlanca: 0xfff6ea,
    muro: 0x5b5668,
    remate: 0x8a8399,      // lo de encima de los muros y la franja de suelo de fuera
    tunel: 0x4a3f66,
    mirador: 0x9a93a8,
  },
  medidas: {
    sobreSuelo: 0.03,       // la calzada, un poco por encima de lo que pisa el coche
    rayaSobreSuelo: 0.06,
    bordillo: 0.4,          // lo que baja el borde de la calzada
    techoTunel: 8,
    bajoTunel: 1.5,         // las paredes del túnel empiezan por debajo de la calzada
    grosorMuro: 0.8,
    alturaPretil: 1,        // el muro de la trinchera sobresale del terreno
    franjaFuera: 4,         // suelo que tapa el borde recortado del terreno junto a la trinchera
    anchoRayaAmarilla: 0.24, largoRaya: 3, cadaRaya: 6,
    anchoRayaBlanca: 0.3,
  },
};
