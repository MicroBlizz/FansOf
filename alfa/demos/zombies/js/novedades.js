// Fans of Zombies · Novedades: lo publicado de esta demo, la versión más nueva primero. La Biblioteca de la raíz lo enseña en su tarjeta
// y en la ventana NOVEDADES. Al publicar un cambio que se note, añade arriba una entrada con su versión (y su inglés en idioma/en-raiz.js).
'use strict';
const NEWS = [
  { v: '0.5.0', real: ['<b>LOS BARRIOS DEL SUR</b>: el mapa crece con el polígono (naves y contenedores), la zona comercial (supermercado, gasolinera, ferretería y farmacia) y las afueras (comisaría con armería, colegio y granja). Y más fans.',
    '<b>ARMAS NUEVAS QUE SE GASTAN</b>: pistola, bate, hacha y cuchillo (por la espalda, de un golpe), de la 1 a la 6. Todas se desgastan y se rompen.',
    '<b>EL MAPA</b> (M) con lo que ya has visto y un <b>TUTORIAL</b> del primer día que se puede saltar.'],
    joke: ['Microblizz ha abierto un supermercado en el distrito. Los precios son los de la tienda del juego: altos y sin devolución.'] },
  { v: '0.4.0', real: ['<b>FABRICAR Y COCINAR</b>: vendas con tela; filete y guiso junto a un bidón con fuego o en la cocina de casa mientras haya luz. Cada sitio da lo suyo, la carne cruda sienta mal y, sin luz, la de las neveras se pudre.',
    '<b>EL GRIFO Y LAS BOTELLAS</b>: bebe y llena botellas en la cocina hasta que corten el agua. Y desmonta armarios y cajas con la palanca o el martillo para sacar tablas y clavos.',
    '<b>LOS FANS RODEAN</b>: ya no se atascan en vallas y esquinas; buscan el camino hasta ti y prefieren una puerta abierta a romper una ventana.'],
    joke: ['Microblizz ha añadido el corte de agua «para fomentar la hidratación responsable». Phony vende botellas a precio de DLC.'] },
  { v: '0.3.0', real: ['<b>EL BARRIO RESIDENCIAL</b>: el mapa crece hacia el oeste con calles, farolas, vallas, buzones, coches y unas 25 casas en las que se entra. Al entrar se quita el tejado y ves las habitaciones; empiezas en tu casa.',
    '<b>PUERTAS, VENTANAS Y BARRICADAS</b>: F abre y cierra puertas; B clava tablas (martillo, tablas y clavos). Los fans buscan la puerta o ventana más cercana y la golpean hasta entrar; el troll rompe el triple.'],
    joke: ['Microblizz ha puesto el barrio a la venta como «vivienda con experiencia de supervivencia incluida». Las tablas se cobran aparte.'] },
  { v: '0.2.0', real: ['<b>GOLPES QUE SE SIENTEN</b>: la palanca barre con estela, la escopeta retrocede, los fans salen despedidos y aturdidos y la sangre se queda en la nieve. Nuevo <b>EMPUJÓN</b> (clic derecho o R): tumba sin ruido. Y <b>AGUANTE</b>: correr y golpear cansan.',
    '<b>MOCHILA TETRIS</b> (Tab): cada cosa ocupa su forma y gira. Al registrar eliges qué coges; lo que dejas se queda en el sitio o en un montón en el suelo.',
    '<b>SE GUARDA LA PARTIDA</b>: cada minuto, al pausar y al cerrar. En el menú, CONTINUAR. Y ahora todo se ve en <b>HD</b>.'],
    joke: ['Microblizz ha visto la mochila Tetris y quiere cobrar por cada casilla. Phony ya ha registrado la patente del giro de 90 grados.'] },
  { v: '0.1.0', real: ['<b>PRIMER PROTOTIPO</b>: sobrevive en la ciudad nevada de Ratkov con teclado y ratón. Hambre, sed, sueño e infección; todo hace ruido (los anillos te dicen hasta dónde llega) y tus huellas en la nieve te delatan. Seis tipos de fans zombificados, alarmas de coche, oleadas al anochecer, corte de luz y un parche nuevo de Microblizz cada mañana. Al caer, el cartel de «SE BUSCA» con tu historia.'],
    joke: ['Microblizz aclara que los fans no están infectados: «solo están muy comprometidos con la comunidad».'] },
];
