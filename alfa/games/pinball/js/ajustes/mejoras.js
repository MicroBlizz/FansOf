// Fans of Pinball · AJUSTES · MEJORAS de partida: la lista cerrada de 14 (PROTOTIPO.md), su rareza, cuántas veces se apilan, sus cifras
// y la probabilidad de cada rareza. Los nombres y textos son datos que enseña la pantalla (su inglés va en el diccionario del juego).
'use strict';
AJUSTES.mejoras = PB.congela({
  rarezas: {                    // (espec.) probabilidad y cuántas veces se apila
    comun: { probabilidad: 0.65, max: 3 },
    rara: { probabilidad: 0.28, max: 2 },
    epica: { probabilidad: 0.07, max: 1 },
  },
  porEleccion: 3,               // (espec.) elegir 1 de 3
  barajarGratis: 1,             // (espec.) un barajar gratis por partida
  primeraEleccion: ['bola_gorda', 'cafe_doble', 'pala_acero'],   // (espec.) la primera elección de la primera partida es fija
  lista: [
    { id: 'pala_acero', nombre: 'Pala de acero', texto: 'Palas un 20 % más fuertes', rareza: 'comun', fuerza: 0.2 },
    { id: 'bola_gorda', nombre: 'Bola gorda', texto: 'Bola más grande y +3 de daño', rareza: 'comun', radio: 0.04, dano: 3 },
    { id: 'iman_fichas', nombre: 'Imán de fichas', texto: 'Fichas ×1,3', rareza: 'comun', fichas: 0.3 },
    { id: 'cafe_doble', nombre: 'Café doble', texto: 'El CAOS se llena más rápido', rareza: 'comun', caos: 0.25 },
    { id: 'horas_extra', nombre: 'Horas extra', texto: '+2 s por cofre y +1 s por enemigo', rareza: 'comun', cofre: 2, enemigo: 1 },
    { id: 'escalera_expres', nombre: 'Ascensor exprés', texto: 'El ascensor se abre antes', rareza: 'comun', menos: 15, minimo: 30 },
    { id: 'golpe_critico', nombre: 'Golpe crítico', texto: 'A veces el golpe hace el triple', rareza: 'rara', probabilidad: 0.15, multiplicador: 3 },
    { id: 'rebote_explosivo', nombre: 'Rebote explosivo', texto: 'Cada 5 golpes, la bola explota', rareza: 'rara', cada: 5, dano: 20, radio: 22 },
    { id: 'estela_fuego', nombre: 'Estela de fuego', texto: 'El golpe fuerte deja una estela que quema', rareza: 'rara', segundos: 1, dano: 10, cada: 0.05 },
    { id: 'setas_locas', nombre: 'Dianas locas', texto: 'Dianas y máquinas sueltan chispas', rareza: 'rara', chispas: 2, dano: 10, combo: 2 },
    { id: 'salvavidas', nombre: 'Salvavidas', texto: 'Una vez por sala, la bola rebota desde el hueco', rareza: 'rara' },
    { id: 'caos_largo', nombre: 'CAOS largo', texto: 'El CAOS dura 2 s más', rareza: 'rara', segundos: 2 },
    { id: 'perforante', nombre: 'Perforante', texto: 'Al romper algo, la bola sigue sin frenar', rareza: 'epica' },
    { id: 'cuarta_bola', nombre: 'Cuarta bola', texto: 'En el CAOS sale además un clon', rareza: 'epica' },
  ],
});
