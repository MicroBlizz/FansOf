// Fans of Asalto · Los ajustes de la tienda de la partida y sus objetos (aparte de ajustes.js, que ya va lleno): cada cuánto cambia la
// oferta, lo que cuesta todo en esencia y qué da cada objeto en cada nivel. Solo datos: las reglas están en dominio/tienda.js.
'use strict';
// La tienda de la partida: se paga con esencia (la da ganar oleadas), nunca con oro, y no vende rarezas ni héroes.
// cada: cada cuántas oleadas hay oferta nueva; cambio: lo que cuesta cambiarla (y lo que sube cada vez); venta: la parte que se
// recupera al vender; pesos y precios van por la rareza del objeto (0 común, 1 raro, 2 épico)
ASALTO.tienda = { cada: 2, oferta: 3, huecos: 6, nivelMax: 3, venta: 0.5, cambio: { base: 2, sube: 1 }, esencia: { normal: 1, cinco: 3, diez: 5 }, pesos: [60, 32, 8], precios: [2, 3, 5] };
// Los objetos de la tienda: v es lo que dan en cada nivel (1, 2 y 3). Con `clases`, solo a los héroes de esas clases. Los aplica dominio/poder.js
ASALTO.objetos = {
    afilar:   { nombre: 'Piedra de afilar', icono: 'objeto-afilar', rareza: 0, stat: 'dano', v: [8, 14, 20], txt: '+{v} % de daño para todos' },
    caldo:    { nombre: 'Caldo de la abuela', icono: 'objeto-caldo', rareza: 0, stat: 'vida', v: [10, 18, 26], txt: '+{v} % de vida para todos' },
    espuelas: { nombre: 'Espuelas', icono: 'objeto-espuelas', rareza: 0, stat: 'prisa', v: [6, 11, 16], txt: 'Todos atacan un {v} % más rápido' },
    trebol:   { nombre: 'Trébol de la suerte', icono: 'objeto-trebol', rareza: 0, stat: 'critico', v: [5, 9, 13], txt: '+{v} % de golpe crítico para todos' },
    rodela:   { nombre: 'Rodela', icono: 'objeto-rodela', rareza: 0, stat: 'defensa', v: [5, 9, 13], txt: 'Todos reciben un {v} % menos de daño' },
    vendas:   { nombre: 'Vendas', icono: 'objeto-vendas', rareza: 0, stat: 'regenera', v: [1, 2, 3], txt: 'Todos se curan un {v} % de su vida por segundo' },
    zarza:    { nombre: 'Capa de zarzas', icono: 'objeto-zarza', rareza: 1, stat: 'reflejo', v: [8, 14, 20], txt: 'Todos devuelven el {v} % del daño que reciben' },
    guantes:  { nombre: 'Guanteletes', icono: 'objeto-guantes', rareza: 1, stat: 'danoCrit', v: [15, 25, 35], txt: 'Los golpes críticos de todos hacen un {v} % más' },
    yelmo:    { nombre: 'Yelmo de guardia', icono: 'objeto-yelmo', rareza: 1, stat: 'vida', v: [20, 35, 50], clases: ['tanque'], txt: '+{v} % de vida para los tanques' },
    hacha:    { nombre: 'Hacha mellada', icono: 'objeto-hacha', rareza: 1, stat: 'dano', v: [15, 26, 37], clases: ['luchador'], txt: '+{v} % de daño para los luchadores' },
    daga:     { nombre: 'Daga envenenada', icono: 'objeto-daga', rareza: 1, stat: 'danoCrit', v: [30, 50, 70], clases: ['asesino'], txt: 'Los críticos de los asesinos hacen un {v} % más' },
    carcaj:   { nombre: 'Carcaj sin fondo', icono: 'objeto-carcaj', rareza: 1, stat: 'prisa', v: [12, 20, 28], clases: ['tirador'], txt: 'Los tiradores disparan un {v} % más rápido' },
    grimorio: { nombre: 'Grimorio', icono: 'objeto-grimorio', rareza: 1, stat: 'dano', v: [15, 26, 37], clases: ['mago'], txt: '+{v} % de daño para los magos' },
    caliz:    { nombre: 'Cáliz', icono: 'objeto-caliz', rareza: 1, stat: 'dano', v: [15, 26, 37], clases: ['sanador', 'brujo'], txt: '+{v} % de poder para sanadores y brujos' },
    coraza:   { nombre: 'Coraza de auditor', icono: 'objeto-coraza', rareza: 2, stat: 'defensa', v: [10, 16, 22], txt: 'Todos reciben un {v} % menos de daño' },
    corona:   { nombre: 'Corona del becario', icono: 'objeto-corona', rareza: 2, stat: 'todo', v: [8, 14, 20], txt: '+{v} % de vida y de daño para todos' },
  };
