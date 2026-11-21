// Fans of Toys · datos · FRASES: las reseñas de los clientes, el chat de los fans y los correos del CEO, por cómo ha ido el mes
// (agotado, sobra, caro, barato o normal). {juguete} se cambia por el nombre del juguete. En español; su inglés, en idioma/en-frases.js.
'use strict';
TY.FRASES = TY.congela({
  resena: {
    agotado: ['Fui a tres tiendas a por {juguete} y solo quedaba el cartel.', 'Mi hija quiere {juguete}. Yo quiero saber dónde lo esconden.', 'Agotado otra vez. Empiezo a pensar que {juguete} no existe.'],
    sobra: ['Había tantos {juguete} en la estantería que pensé que eran la estantería.', 'Me regalaron dos {juguete} por comprar pan.', 'En la tienda me pidieron por favor que me llevara otro {juguete}.'],
    caro: ['{juguete} es precioso. Lo sé porque lo miro desde fuera del escaparate.', 'He pedido un préstamo para {juguete}. El banco se ha reído.', 'A ese precio espero que {juguete} recoja la habitación solo.'],
    barato: ['Tan barato que compré {juguete} para toda la clase.', 'Con lo que cuesta {juguete} ya no regalo calcetines.', 'Compré {juguete} con las monedas del sofá.'],
    normal: ['{juguete} llegó entero. Cinco estrellas.', 'Mi hijo no suelta {juguete} ni para dormir.', 'Buen juguete. El perro opina lo mismo y ya no tiene orejas.'],
  },
  chat: {
    agotado: ['SIN STOCK?? Microblizz haciendo de Microblizz', 'lo vi en reventa por el triple, gracias por nada', 'alguien me cambia uno por mi hermano pequeño'],
    sobra: ['han fabricado uno para cada habitante del planeta', 'los usan de relleno en las cajas de otros juguetes', 'mi tienda los regala con el tique'],
    caro: ['trae el juego dentro o que', 'precio de coleccionista, plástico de mercadillo', 'he vendido la consola para comprarlo. espera'],
    barato: ['a este precio me llevo doce', 'por fin algo de Microblizz que puedo pagar', 'huele a liquidación y me encanta'],
    normal: ['pues no está mal, que rabia', 'lo tengo en la mesa y me juzga', 'compra aprobada por mi gato'],
  },
  usuarios: ['xX_Fan_Xx', 'LolaEsMiJefa', 'becario_23', 'CrazyBunnyOficial_no', 'SoporteNivel0', 'PixelPaco', 'AbuelaGamer', 'elquepagaelpase'],
  ceo: {
    bien: ['Buen mes. No te acostumbres: la meta sube.', 'El consejo ha sonreído. Fue raro para todos.', 'Sigue así y te subo de planta. De sueldo ya veremos.'],
    mal: ['He visto los números. Los números también me han visto a mí.', 'El almacén no es un museo.', 'Te recuerdo que tu silla tiene ruedas por algo.'],
  },
});
