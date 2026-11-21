// Fans of Island · dominio/bichos-comun: lo que comparten todos los bichos. El «mundo» m que reciben sus reglas es un objeto con el
// jugador (m.J), la física (m.fis), el nivel (m.nivel), el azar (m.azar: una función que da un número entre 0 y 1, la pasa la capa
// de fuera), el reloj (m.reloj), las medidas del lienzo (m.vw, m.cH, m.bH), los giros de perfil (m.giroDer, m.giroIzq) y las listas
// de bichos. Las reglas mueven los bichos y devuelven EVENTOS con nombre (salpica, suena, pisa, golpe…) que aplica quien llama:
// nunca tocan al jugador. Puro: sin pantalla, sin reloj propio, sin azar propio.
'use strict';
IS.evSalpica = (x, y, z, n, col) => ({ tipo: 'salpica', x, y, z, n, col });   // col: 'agua', 'astillas' o 'cangrejo'
IS.evSuena = nombre => ({ tipo: 'suena', nombre });
IS.giraBicho = (m, o, dt) => {   // el bicho se vuelve poco a poco hacia donde mira
  const obj = o.mira > 0 ? m.giroDer : m.giroIzq;
  o.giro += (obj - o.giro) * Math.min(1, dt * 14);
};
IS.quitaSi = (lista, viva) => {   // quita de la lista, en su sitio y en orden, lo que ya no está vivo
  let k = 0;
  for (const x of lista) if (viva(x)) lista[k++] = x;
  lista.length = k;
};
