// Fans of Nova · Datos de la primera misión guiada: los pasos (frase y suceso de la partida que lo completa) y lo que la hace fácil.
// El guion lo lleva NV.Guion (dominio/guion.js) y lo enseña guion.js. Diseño: docs/nova/primera-mision.md.
// cuanto: cuántas veces (o segundos, en «mueve») hace falta el suceso; espera: segundos tras los que el paso se da por hecho aunque no
// pase (los que dependen de la suerte de las cartas o de las cargas que lleves).
'use strict';
const NOVA_GUION = {
 "pasos": [
  { "id": "mueve", "suceso": "mueve", "cuanto": 1.5, "txt": "Arrastra el dedo para moverte (en el ordenador, las flechas o WASD)." },
  { "id": "baja", "suceso": "baja", "txt": "Tus armas disparan solas: acércate a un enemigo." },
  { "id": "chatarra", "suceso": "chatarra", "cuanto": 3, "txt": "Pasa por encima de los restos para comértelos y crecer." },
  { "id": "carta", "suceso": "carta", "txt": "Sigue comiendo restos: al subir de rango eliges una carta, una mejora para esta misión." },
  { "id": "habilidad", "suceso": "habilidad", "espera": 30, "txt": "Ya tienes tu habilidad activa: toca el botón redondo de abajo a la derecha." },
  { "id": "fusion", "suceso": "fusion", "espera": 75, "txt": "Cuando dos armas encajan sale una carta de fusión: elígela y mira lo que pasa al juntarlas." },
  { "id": "combo", "suceso": "combo", "espera": 60, "txt": "Dos cargas distintas sobre el mismo enemigo hacen un combo." },
  { "id": "jefe", "suceso": "victoria", "txt": "¡Llega el jefe! Derrótalo y el sector es tuyo." }
 ],
 "jefeEn": 300,
 "jefeVida": 0.35
};
