// Fans of Skate · los 12 mundos de la campaña (nombres, historias, facciones, niveles, mazos y jefes). Vienen de Fans of Rumble.
'use strict';
const SK_MUNDOS = [
 {
  "name": "Oficinas de Microblizz",
  "efac": "microblizz",
  "story": "Microblizz, una empresa millonaria, ha comprado el estudio que hacía tus juegos favoritos. Lo primero: despedir a la gente y poner robots.",
  "levels": [
   {
    "name": "La compra",
    "elvl": 1,
    "income": 0.6,
    "deck": [
     "becario",
     "starbot"
    ],
    "id": "1-1",
    "wi": 0,
    "li": 0
   },
   {
    "name": "Cartas de despido",
    "elvl": 1,
    "income": 0.65,
    "deck": [
     "becario",
     "starbot",
     "fallen"
    ],
    "id": "1-2",
    "wi": 0,
    "li": 1
   },
   {
    "name": "Cierre del estudio",
    "elvl": 1,
    "income": 0.7,
    "deck": [
     "becario",
     "starbot",
     "fallen",
     "cajabotin"
    ],
    "id": "1-3",
    "wi": 0,
    "li": 2
   },
   {
    "name": "SurvivalBot",
    "elvl": 2,
    "income": 0.75,
    "boss": "SurvivalBot",
    "deck": [
     "becario",
     "starbot",
     "fallen",
     "cajabotin"
    ],
    "id": "1-4",
    "wi": 0,
    "li": 3
   }
  ]
 },
 {
  "name": "Cementerio de juegos",
  "efac": "nomuertos",
  "unlock": "nomuertos",
  "story": "Aquí entierra Microblizz los juegos que cierra. Los No-Muertos trabajan para ellos… sin cobrar.",
  "levels": [
   {
    "name": "Tumbas sin nombre",
    "elvl": 2,
    "income": 0.5,
    "id": "2-1",
    "wi": 1,
    "li": 0
   },
   {
    "name": "Fosa de las horas extra",
    "elvl": 2,
    "income": 0.53,
    "id": "2-2",
    "wi": 1,
    "li": 1
   },
   {
    "name": "Mausoleo de juegos cerrados",
    "elvl": 3,
    "income": 0.56,
    "id": "2-3",
    "wi": 1,
    "li": 2
   },
   {
    "name": "NecroLord corrupto",
    "elvl": 3,
    "income": 0.55,
    "boss": "NecroLord corrupto",
    "id": "2-4",
    "wi": 1,
    "li": 3
   }
  ]
 },
 {
  "name": "Plató Abandonado",
  "efac": "streamers",
  "unlock": "streamers",
  "story": "Un plató vacío. Microblizz compró el canal, echó al público y ahora solo pone anuncios.",
  "levels": [
   {
    "name": "Directo sin audio",
    "elvl": 3,
    "income": 0.55,
    "id": "3-1",
    "wi": 2,
    "li": 0
   },
   {
    "name": "Caída del chat",
    "elvl": 3,
    "income": 0.58,
    "id": "3-2",
    "wi": 2,
    "li": 1
   },
   {
    "name": "Oleada de baneos",
    "elvl": 4,
    "income": 0.6,
    "id": "3-3",
    "wi": 2,
    "li": 2
   },
   {
    "name": "StreamKing corrupto",
    "elvl": 4,
    "income": 0.6,
    "boss": "StreamKing corrupto",
    "id": "3-4",
    "wi": 2,
    "li": 3
   }
  ]
 },
 {
  "name": "Olimpo Abandonado",
  "efac": "heroes",
  "unlock": "heroes",
  "story": "Desde que Microblizz compró a los dioses, nadie arregla su juego. Están de muy mal humor.",
  "levels": [
   {
    "name": "Templo en obras",
    "elvl": 4,
    "income": 0.58,
    "id": "4-1",
    "wi": 3,
    "li": 0
   },
   {
    "name": "Laberinto de quejas",
    "elvl": 4,
    "income": 0.6,
    "id": "4-2",
    "wi": 3,
    "li": 1
   },
   {
    "name": "Monte olvidado",
    "elvl": 5,
    "income": 0.62,
    "id": "4-3",
    "wi": 3,
    "li": 2
   },
   {
    "name": "EpicChampion corrupto",
    "elvl": 5,
    "income": 0.62,
    "boss": "EpicChampion corrupto",
    "id": "4-4",
    "wi": 3,
    "li": 3
   }
  ]
 },
 {
  "name": "Sector Neón",
  "efac": "ciber",
  "unlock": "ciber",
  "story": "Una ciudad de neón que Microblizz compró entera. Ahora todo es de pago, hasta las farolas.",
  "levels": [
   {
    "name": "Callejón de neón",
    "elvl": 5,
    "income": 0.6,
    "id": "5-1",
    "wi": 4,
    "li": 0
   },
   {
    "name": "Red de drones",
    "elvl": 5,
    "income": 0.62,
    "id": "5-2",
    "wi": 4,
    "li": 1
   },
   {
    "name": "Servidor central",
    "elvl": 6,
    "income": 0.65,
    "id": "5-3",
    "wi": 4,
    "li": 2
   },
   {
    "name": "CyberMarine corrupto",
    "elvl": 6,
    "income": 0.64,
    "boss": "CyberMarine corrupto",
    "id": "5-4",
    "wi": 4,
    "li": 3
   }
  ]
 },
 {
  "name": "El Foro Infinito",
  "efac": "memes",
  "unlock": "memes",
  "story": "El foro de los fans. Microblizz lo compró, borró las quejas y lo llenó de anuncios.",
  "levels": [
   {
    "name": "Hilo infinito",
    "elvl": 6,
    "income": 0.62,
    "id": "6-1",
    "wi": 5,
    "li": 0
   },
   {
    "name": "Borrado de quejas",
    "elvl": 6,
    "income": 0.65,
    "id": "6-2",
    "wi": 5,
    "li": 1
   },
   {
    "name": "Lluvia de anuncios",
    "elvl": 7,
    "income": 0.68,
    "id": "6-3",
    "wi": 5,
    "li": 2
   },
   {
    "name": "MemeLord corrupto",
    "elvl": 7,
    "income": 0.68,
    "boss": "MemeLord corrupto",
    "id": "6-4",
    "wi": 5,
    "li": 3
   }
  ]
 },
 {
  "name": "Torre de Microblizz",
  "efac": "microblizz",
  "story": "La sede de la empresa. En el último piso, el CEO cuenta sus millones mientras decide qué juego cerrar.",
  "levels": [
   {
    "name": "Recepción",
    "elvl": 7,
    "income": 0.8,
    "id": "7-1",
    "wi": 6,
    "li": 0
   },
   {
    "name": "Planta de las cajas de botín",
    "elvl": 8,
    "income": 0.88,
    "id": "7-2",
    "wi": 6,
    "li": 1
   },
   {
    "name": "Despacho de los despidos",
    "elvl": 8,
    "income": 0.95,
    "id": "7-3",
    "wi": 6,
    "li": 2
   },
   {
    "name": "El CEO de Microblizz",
    "elvl": 9,
    "income": 1,
    "boss": "El CEO de Microblizz",
    "baseHp": 2600,
    "id": "7-4",
    "wi": 6,
    "li": 3
   }
  ]
 },
 {
  "name": "El Sótano de Microblizz",
  "efac": "olvidados",
  "unlock": "olvidados",
  "story": "Con el CEO despedido, encuentras una puerta al sótano. Ahí guardaba Microblizz los juegos que canceló antes de que salieran. Llevan años a oscuras… y están muy enfadados.",
  "levels": [
   {
    "name": "Cajas sin abrir",
    "elvl": 8,
    "income": 0.85,
    "id": "8-1",
    "wi": 7,
    "li": 0
   },
   {
    "name": "Proyectos en pausa",
    "elvl": 8,
    "income": 0.88,
    "id": "8-2",
    "wi": 7,
    "li": 1
   },
   {
    "name": "La sala de los cancelados",
    "elvl": 9,
    "income": 0.92,
    "id": "8-3",
    "wi": 7,
    "li": 2
   },
   {
    "name": "VikingoPerdido corrupto",
    "elvl": 9,
    "income": 0.95,
    "boss": "VikingoPerdido corrupto",
    "id": "8-4",
    "wi": 7,
    "li": 3
   }
  ]
 },
 {
  "camp": 2,
  "openAfter": "7-4",
  "name": "Tiendas sin discos",
  "efac": "phony",
  "story": "Phony ha quitado el lector de discos de su consola, la PayStation, para ahorrarse millones. Ahora todo es digital, todo es de alquiler… y lo que compras te lo pueden borrar.",
  "levels": [
   {
    "name": "La última tienda",
    "elvl": 7,
    "income": 0.75,
    "deck": [
     "descargabot",
     "licenciabot",
     "plusbot"
    ],
    "id": "9-1",
    "wi": 8,
    "li": 0
   },
   {
    "name": "Estanterías vacías",
    "elvl": 7,
    "income": 0.8,
    "deck": [
     "descargabot",
     "licenciabot",
     "plusbot",
     "cobradlc"
    ],
    "id": "9-2",
    "wi": 8,
    "li": 1
   },
   {
    "name": "Devoluciones imposibles",
    "elvl": 8,
    "income": 0.85,
    "deck": [
     "descargabot",
     "licenciabot",
     "plusbot",
     "cobradlc",
     "servidorbot"
    ],
    "id": "9-3",
    "wi": 8,
    "li": 2
   },
   {
    "name": "PayStation sin lector",
    "elvl": 8,
    "income": 0.88,
    "boss": "PayStation sin lector",
    "id": "9-4",
    "wi": 8,
    "li": 3
   }
  ]
 },
 {
  "camp": 2,
  "name": "La LAN Party",
  "efac": "gamer",
  "unlock": "gamer",
  "story": "Phony ha comprado los servidores de la comunidad: ahora para jugar online hay que pagar. A los gamers les ha obligado a firmar contratos de exclusividad y ya no juegan por diversión.",
  "levels": [
   {
    "name": "Mesas sin cables",
    "elvl": 8,
    "income": 0.82,
    "id": "10-1",
    "wi": 9,
    "li": 0
   },
   {
    "name": "Torneo de pago",
    "elvl": 8,
    "income": 0.86,
    "id": "10-2",
    "wi": 9,
    "li": 1
   },
   {
    "name": "Servidores cerrados",
    "elvl": 9,
    "income": 0.9,
    "id": "10-3",
    "wi": 9,
    "li": 2
   },
   {
    "name": "ProGamer corrupto",
    "elvl": 9,
    "income": 0.92,
    "boss": "ProGamer corrupto",
    "id": "10-4",
    "wi": 9,
    "li": 3
   }
  ]
 },
 {
  "camp": 2,
  "name": "Estudios Phony",
  "efac": "pop",
  "unlock": "pop",
  "story": "Phony también tiene estudios de cine. Allí solo se ruedan secuelas, remakes y anuncios de la PayStation. Los de Cultura Pop están hartos de repetir la misma película.",
  "levels": [
   {
    "name": "Rodaje del remake",
    "elvl": 9,
    "income": 0.85,
    "id": "11-1",
    "wi": 10,
    "li": 0
   },
   {
    "name": "La secuela de la secuela",
    "elvl": 9,
    "income": 0.9,
    "id": "11-2",
    "wi": 10,
    "li": 1
   },
   {
    "name": "Pase de prensa",
    "elvl": 10,
    "income": 0.94,
    "id": "11-3",
    "wi": 10,
    "li": 2
   },
   {
    "name": "LaDirectora corrupta",
    "elvl": 10,
    "income": 0.96,
    "boss": "LaDirectora corrupta",
    "id": "11-4",
    "wi": 10,
    "li": 3
   }
  ]
 },
 {
  "camp": 2,
  "name": "Sede de Phony",
  "efac": "phony",
  "story": "La sede de Phony. En el último piso, el Presidente sube otra vez la suscripción mientras los fans protestan en la puerta. Es hora de recuperar los discos.",
  "levels": [
   {
    "name": "Atención al cliente",
    "elvl": 9,
    "income": 0.92,
    "id": "12-1",
    "wi": 11,
    "li": 0
   },
   {
    "name": "Departamento de precios",
    "elvl": 10,
    "income": 0.96,
    "id": "12-2",
    "wi": 11,
    "li": 1
   },
   {
    "name": "Sala de licencias",
    "elvl": 10,
    "income": 1,
    "id": "12-3",
    "wi": 11,
    "li": 2
   },
   {
    "name": "El Presidente de Phony",
    "elvl": 10,
    "income": 1.05,
    "boss": "El Presidente de Phony",
    "baseHp": 2800,
    "id": "12-4",
    "wi": 11,
    "li": 3
   }
  ]
 }
];
