// Fans of Toys · datos · TUTORIAL: los pasos del tutorial guiado de la primera partida. Cada pantalla tiene su lista; `objetivo` es el
// selector de lo que se ilumina (null = el globo sale en el centro). Textos en español: su inglés, en idioma/en-tutorial.js.
'use strict';
TY.TUTORIAL = TY.congela({
  mejora: [
    { objetivo: null, titulo: 'Bienvenido a la fábrica', texto: 'Llevas la fábrica de juguetes de Microblizz durante un año. Cada mes decides qué fabricar, a qué precio y cuánto lo anuncias. Te lo enseño rápido.' },
    { objetivo: '.ty-carta-mejora', titulo: 'Tu primer fichaje', texto: 'Elige a un ejecutivo. Cada uno cambia una regla durante todo el año. Lee lo que hace y ficha al que más te guste.' },
  ],
  fabrica: [
    { objetivo: '.ty-meta', titulo: 'La meta', texto: 'Arriba ves el mes, tu dinero y la meta. Cada 3 meses el consejo pide un beneficio mínimo. Si no llegas, te despiden. Si llegas, fichas a alguien nuevo.' },
    { objetivo: '.ty-mano', titulo: 'Elige un juguete', texto: 'Toca una carta para elegir qué fabricas. Ves lo que cuesta hacer cada uno y a cuánto se vende. El molde se paga solo la primera vez.' },
    { objetivo: '.ty-f-cantidad', titulo: 'Cuántos fabricas', texto: 'Más cantidad cuesta más. Lo que sobra se queda en el almacén y te cuesta dinero cada mes.' },
    { objetivo: '.ty-f-precio', titulo: 'A qué precio', texto: 'Caro: ganas más por cada uno, pero se vende menos. Barato: se vende mucho, pero ganas poco por cada uno.' },
    { objetivo: '.ty-f-publicidad', titulo: 'Publicidad', texto: 'Anunciarte cuesta dinero, pero la gente quiere más juguetes. Al principio no hace falta.' },
    { objetivo: '.ty-resumen', titulo: 'La previsión', texto: 'Aquí ves lo que vas a gastar y cuántas ventas se esperan. Fabrica algo parecido: ni te quedes corto ni te sobre.' },
    { objetivo: '#ty-producir', titulo: 'A producir', texto: 'Al pulsar sale un minijuego rápido: si lo haces bien, ese mes ganas un bonus. Si no te apetece, lo puedes saltar.' },
  ],
  resultado: [
    { objetivo: '.ty-cuenta', titulo: 'Las ventas', texto: 'Vendidas por precio son los ingresos. Si la gente quería más de lo que fabricaste, te quedaste corto. Si quería menos, te sobraron.' },
    { objetivo: '.ty-beneficio', titulo: 'El beneficio', texto: 'Ingresos menos gastos es el beneficio del mes. Se suma a la meta del trimestre: míralo en la barra de arriba.' },
    { objetivo: null, titulo: 'Ya sabes jugar', texto: 'En diciembre se vende el triple y a veces salen noticias con decisiones. Si vendes mucho un juguete, tendrá edición dorada para tu vitrina. Suerte, director.' },
  ],
});
