// Fans of Nova · Datos de cascos: plantilla de ranuras por facción (9 + Microblizz) y por rango 1-5, con tamaño S/M/L, tipos admitidos y arco por cara.
// PROVISIONAL (fase 0). JSON estricto a propósito: herramientas/nova-balance.py lo lee de aquí. Abajo, novaPlantilla() saca las ranuras de una facción en un rango.
'use strict';
const NOVA_CASCOS = {
 "version": "provisional-0.1",
 "nota": "Plantillas PROVISIONALES de la fase 0 (PLAN-NOVA.md, «Afinidad arma-facción» y «Ranuras por cara»). Cada ranura se abre en el rango `desde`; `crece` dice a qué tamaño pasa en cada rango. JSON estricto para que herramientas/nova-balance.py lo lea.",
 "caras": {
  "proa": { "arco": 30, "dano": 1.2, "nota": "Más daño, arco estrecho" },
  "babor": { "arco": 120, "dano": 1.0, "nota": "Lateral" },
  "estribor": { "arco": 120, "dano": 1.0, "nota": "Lateral" },
  "dorsal": { "arco": 360, "dano": 0.8, "nota": "Cobertura total, menos daño" },
  "popa": { "arco": 0, "dano": 0, "soloDefensa": true, "nota": "Solo defensivo y de movilidad" }
 },
 "tamanos": ["S", "M", "L"],
 "tipos": ["railgun", "flak", "laser", "lanzador", "drones", "defensa", "universal"],
 "reglas": "Una ranura acepta un arma de su tamaño o menor y del mismo tipo; universal acepta cualquier tipo pero el arma no sube de tamaño; defensa solo va en popa y dorsal; en la popa una ranura universal solo admite defensas. Multiplicadores de daño por cara (dano) provisionales.",
 "rangos": 5,
 "facciones": {
  "animales": {
   "nombre": "Animales Locos",
   "afinidad": "Cinético de corto alcance, embestida",
   "casco": "Ágil, proa fuerte",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["railgun", "flak"],
     "desde": 1,
     "crece": { "3": "M", "5": "L" }
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["flak"],
     "desde": 2
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["flak"],
     "desde": 3
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 4
    },
    {
     "cara": "dorsal",
     "tam": "M",
     "tipos": ["railgun", "flak", "defensa"],
     "desde": 5
    }
   ],
   "nota": "Proa que crece hasta L; el resto, ranuras de flak."
  },
  "nomuertos": {
   "nombre": "No-Muertos",
   "afinidad": "Drones y reparación (Renacer)",
   "casco": "Casco regenerativo",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["drones", "laser"],
     "desde": 1
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["drones", "defensa"],
     "desde": 2,
     "crece": { "4": "M" }
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["drones"],
     "desde": 3
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["drones"],
     "desde": 4
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 5,
     "crece": { "5": "M" }
    }
   ],
   "nota": "Ranuras de drones; la popa lleva reparación."
  },
  "streamers": {
   "nombre": "Streamers",
   "afinidad": "Misiles en enjambre (Hype)",
   "casco": "Muchas ranuras S",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["lanzador"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["lanzador"],
     "desde": 2
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["lanzador"],
     "desde": 3
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["lanzador", "defensa"],
     "desde": 3
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 4
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["lanzador", "drones"],
     "desde": 5
    }
   ],
   "nota": "Una ranura más que el resto desde el rango 3: 1, 2, 4, 5, 6."
  },
  "heroes": {
   "nombre": "Héroes",
   "afinidad": "Energía pesada, crítico",
   "casco": "Equilibrado, ranura L dorsal",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["railgun", "laser"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["railgun", "laser"],
     "desde": 2
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["railgun", "laser"],
     "desde": 3
    },
    {
     "cara": "dorsal",
     "tam": "M",
     "tipos": ["railgun", "laser", "defensa"],
     "desde": 4,
     "crece": { "5": "L" }
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 5
    }
   ],
   "nota": "La dorsal pasa de M a L en el rango 5."
  },
  "ciber": {
   "nombre": "Ciberpunks",
   "afinidad": "Láser y escudos (Escudos)",
   "casco": "Escudo grande, casco fino",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["laser"],
     "desde": 1
    },
    {
     "cara": "popa",
     "tam": "M",
     "tipos": ["defensa"],
     "desde": 2,
     "crece": { "4": "L" }
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["laser"],
     "desde": 3
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["laser"],
     "desde": 4
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["laser", "defensa"],
     "desde": 5
    }
   ],
   "nota": "La popa de escudo es M desde el rango 2 y L desde el 4."
  },
  "memes": {
   "nombre": "Memes",
   "afinidad": "EM, aleatorio (RNG)",
   "casco": "Ranuras universales",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "M",
     "tipos": ["universal"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["universal"],
     "desde": 2
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["universal"],
     "desde": 3
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["universal"],
     "desde": 4
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["universal"],
     "desde": 5
    }
   ],
   "nota": "Todas universales: aceptan cualquier tipo, pero el arma no sube de tamaño."
  },
  "gamer": {
   "nombre": "Comunidad Gamer",
   "afinidad": "Railgun de precisión",
   "casco": "Torretas laterales",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["railgun"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["railgun"],
     "desde": 2,
     "crece": { "4": "M" },
     "arco": 180
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["railgun"],
     "desde": 3,
     "crece": { "4": "M" },
     "arco": 180
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 4
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["railgun", "defensa"],
     "desde": 5
    }
   ],
   "nota": "Laterales con 180° de arco (torretas) y M desde el rango 4."
  },
  "olvidados": {
   "nombre": "Olvidados",
   "afinidad": "Flak y artillería retro",
   "casco": "Blindaje pesado",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "M",
     "tipos": ["flak", "railgun"],
     "desde": 1,
     "crece": { "3": "L" }
    },
    {
     "cara": "dorsal",
     "tam": "L",
     "tipos": ["flak", "lanzador"],
     "desde": 2
    },
    {
     "cara": "popa",
     "tam": "M",
     "tipos": ["defensa"],
     "desde": 3,
     "crece": { "4": "L" }
    },
    {
     "cara": "dorsal",
     "tam": "L",
     "tipos": ["flak", "lanzador"],
     "desde": 5
    }
   ],
   "nota": "Pocas ranuras pero grandes: 1, 2, 3, 3, 4 (la última, una segunda dorsal)."
  },
  "pop": {
   "nombre": "Cultura Pop",
   "afinidad": "Apoyo, auras, combos",
   "casco": "Ranuras híbridas",
   "jugable": true,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "S",
     "tipos": ["railgun", "lanzador"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "S",
     "tipos": ["laser", "drones"],
     "desde": 2
    },
    {
     "cara": "estribor",
     "tam": "S",
     "tipos": ["flak", "lanzador"],
     "desde": 3
    },
    {
     "cara": "dorsal",
     "tam": "S",
     "tipos": ["drones", "laser", "defensa"],
     "desde": 4
    },
    {
     "cara": "popa",
     "tam": "S",
     "tipos": ["defensa"],
     "desde": 5
    }
   ],
   "nota": "Cada ranura admite dos o tres tipos."
  },
  "microblizz": {
   "nombre": "Microblizz / Phony",
   "afinidad": "De todo, por rango",
   "casco": "Jefes: estaciones que crecen como tú",
   "jugable": false,
   "ranuras": [
    {
     "cara": "proa",
     "tam": "M",
     "tipos": ["universal"],
     "desde": 1
    },
    {
     "cara": "babor",
     "tam": "M",
     "tipos": ["universal"],
     "desde": 1
    },
    {
     "cara": "estribor",
     "tam": "M",
     "tipos": ["universal"],
     "desde": 2
    },
    {
     "cara": "dorsal",
     "tam": "L",
     "tipos": ["universal"],
     "desde": 3
    },
    {
     "cara": "popa",
     "tam": "M",
     "tipos": ["universal"],
     "desde": 4,
     "crece": { "5": "L" }
    },
    {
     "cara": "dorsal",
     "tam": "L",
     "tipos": ["universal"],
     "desde": 5
    }
   ],
   "nota": "No es un casco de jugador: plantilla de los jefes, una ranura más que el jugador y todo universal."
  }
 }
};

// Las ranuras de una facción en un rango: [{ cara, tam, tipos, arco }]. `crece` cambia el tamaño al llegar a ciertos rangos.
function novaPlantilla(faccion, rango) {
  const f = NOVA_CASCOS.facciones[faccion];
  return f.ranuras.filter(r => r.desde <= rango).map(r => {
    let tam = r.tam;
    for (const k in (r.crece || {})) if (+k <= rango) tam = r.crece[k];
    return { cara: r.cara, tam, tipos: r.tipos, arco: r.arco || NOVA_CASCOS.caras[r.cara].arco };
  });
}
