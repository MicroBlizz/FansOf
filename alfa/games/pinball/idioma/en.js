// Fans of Pinball · Inglés: todos los textos del prototipo (menú, equipo, marcador, letreros, ventanas, Lola y los datos de AJUSTES:
// mejoras, criaturas y misiones). Una frase nueva del juego lleva aquí su inglés (lo comprueba tests/pinball/unitarios/idioma.test.mjs).
'use strict';
IDIOMA.add({
  // 0.2.9
  "<b>MEJORAS POR DENTRO</b>: ajustes de rendimiento y de ahorro de batería en los sistemas internos de la web.": "<b>IMPROVEMENTS UNDER THE HOOD</b>: performance and battery-saving tweaks in the internal systems of the website.",
  "Microblizz ha puesto la web en modo ahorro y Phony ha apagado hasta la luz de la nevera de los becarios.": "Microblizz put the website in saving mode and Phony switched off even the interns' fridge light.",
  // 0.2.8
  "<b>MEJORAS POR DENTRO</b>: la web tiene una página 404 propia que reenvía las direcciones antiguas, y el anuncio con premio es más claro.": "<b>IMPROVEMENTS UNDER THE HOOD</b>: the website has its own 404 page that forwards the old addresses, and the rewarded ad is clearer.",
  "Microblizz ha puesto un cartel de «te has perdido» en la web y Phony ya ha pedido una copia para la cocina.": "Microblizz put a 'you are lost' sign on the website and Phony has already asked for a copy for the kitchen.",
  // 0.2.7
  "<b>MEJORAS POR DENTRO</b>: la web reintenta leer los avisos y ajustes del servidor cuando la conexión falla un momento.": "<b>IMPROVEMENTS UNDER THE HOOD</b>: the site retries reading the server notices and settings when the connection hiccups.",
  "Microblizz le ha dicho a la conexión que insista y Phony ha aprovechado para pedir lo mismo con el café.": "Microblizz told the connection to keep trying and Phony took the chance to ask the same of the coffee machine.",
  // 0.2.6
  "<b>MEJORAS POR DENTRO</b>: ajustes en los sistemas internos de la web y de la portada.": "<b>IMPROVEMENTS UNDER THE HOOD</b>: tweaks to the internal systems of the website and the front page.",
  "Microblizz ha cambiado los muebles de sitio en la portada y Phony jura que él no ha tocado nada.": "Microblizz moved the furniture around on the front page and Phony swears he touched nothing.",
  // menú, equipo y pantallas
  "JUGAR": "PLAY", "EQUIPO": "TEAM", "HISTORIA": "STORY", "VOLVER": "BACK", "COBRAR": "COLLECT", "Vale": "OK",
  "Este prototipo está en obras. Vuelve pronto.": "This prototype is under construction. Come back soon.",
  "Racha: {n} días": "Streak: {n} days", "Racha: 1 día": "Streak: 1 day", "RACHA: DÍA {n}": "STREAK: DAY {n}", "Primera partida del día: fichas ×2": "First game of the day: tokens ×2",
  "Récord: planta {p} · {n} puntos": "Record: floor {p} · {n} points", "Historia: capítulo Oficinas": "Story: Offices chapter", "mejor planta {n}": "best floor {n}",
  "MISIONES DEL DÍA": "DAILY MISSIONS", "HECHA": "DONE",
  "NIVEL MÁXIMO": "MAX LEVEL", "SUBIR": "LEVEL UP", "Faltan {n}": "{n} to go", "LÍDER": "LEADER", "PONER DE LÍDER": "MAKE LEADER",
  "Vence a SurvivalBot para desbloquearla": "Beat SurvivalBot to unlock it", "Nivel {n}": "Level {n}", "nivel {n}": "level {n}",
  // marcador, letreros y pausa
  "Pausa": "Pause", "PAUSA": "PAUSE", "SEGUIR": "RESUME", "SALIR": "EXIT", "SONIDO": "SOUND", "VIBRACIÓN": "VIBRATION", "SÍ": "ON", "NO": "OFF",
  "PLANTA {n}": "FLOOR {n}", "¡CAOS!": "CHAOS!", "¡ASCENSOR ABIERTO!": "ELEVATOR OPEN!", "¡EXPRÉS!": "EXPRESS!", "¡POR LOS PELOS!": "JUST IN TIME!",
  "¡SURVIVALBOT!": "SURVIVALBOT!", "¡SURVIVALBOT VENCIDO!": "SURVIVALBOT DOWN!", "¡NÚCLEO ABIERTO!": "CORE OPEN!", "¡SALVADA!": "SAVED!", "¡×{n}!": "×{n}!",
  // mejoras
  "ELIGE UNA MEJORA": "PICK AN UPGRADE", "BARAJAR": "SHUFFLE", "Común": "Common", "Rara": "Rare", "Épica": "Epic",
  "Pala de acero": "Steel flipper", "Palas un 20 % más fuertes": "Flippers 20% stronger",
  "Bola gorda": "Fat ball", "Bola más grande y +3 de daño": "Bigger ball and +3 damage",
  "Imán de fichas": "Token magnet", "Fichas ×1,3": "Tokens ×1.3",
  "Café doble": "Double coffee", "El CAOS se llena más rápido": "CHAOS fills up faster",
  "Horas extra": "Overtime", "+2 s por cofre y +1 s por enemigo": "+2 s per chest and +1 s per enemy",
  "Ascensor exprés": "Express elevator", "El ascensor se abre antes": "The elevator opens sooner",
  "Golpe crítico": "Critical hit", "A veces el golpe hace el triple": "Sometimes a hit deals triple",
  "Rebote explosivo": "Explosive bounce", "Cada 5 golpes, la bola explota": "Every 5 hits, the ball explodes",
  "Estela de fuego": "Fire trail", "El golpe fuerte deja una estela que quema": "Strong hits leave a burning trail",
  "Dianas locas": "Crazy targets", "Dianas y máquinas sueltan chispas": "Targets and machines throw sparks",
  "Salvavidas": "Lifesaver", "Una vez por sala, la bola rebota desde el hueco": "Once per room, the ball bounces back from the drain",
  "CAOS largo": "Long CHAOS", "El CAOS dura 2 s más": "CHAOS lasts 2 s longer",
  "Perforante": "Piercing", "Al romper algo, la bola sigue sin frenar": "When it breaks something, the ball keeps its speed",
  "Cuarta bola": "Fourth ball", "En el CAOS sale además un clon": "In CHAOS a clone joins too",
  // criaturas
  "Cada pocos golpes da un bote y aplasta lo de alrededor": "Every few hits it bounces and crushes what is around",
  "Tras un golpe fuerte de pala, lo siguiente que toca explota": "After a strong flipper hit, the next thing it touches explodes",
  "Si pasa un rato sin tocar nada, su siguiente golpe hace el triple": "After a while without touching anything, its next hit deals triple",
  "Cada pocos golpes suelta una bolsa de basura que explota": "Every few hits it drops an exploding trash bag",
  // misiones del día
  "Rompe 40 vasijas": "Break 40 pots", "Llega a la planta 6": "Reach floor 6", "Activa el CAOS 3 veces": "Trigger CHAOS 3 times",
  "Vence a 15 becarios": "Beat 15 interns", "Abre 6 cofres": "Open 6 chests", "Sube 8 veces en ascensor": "Ride the elevator 8 times", "Juega 3 partidas": "Play 3 games",
  "Haz 20.000 puntos en una partida": "Score 20,000 points in one game",
  // Lola
  "Toca a cada lado para golpear": "Tap each side to flip", "Con fichas, te vendo mejoras en mi tienda": "Got tokens? I sell upgrades in my shop",
  "Perder la bola te quita tiempo": "Losing the ball costs you time", "Desde aquí, si se acaba el reloj, pierdes": "From now on, if time runs out, you lose",
  "Rompe sus cajas y dale en el núcleo": "Break its boxes and hit the core",
  // tienda de Lola
  "TIENDA DE LOLA": "LOLA'S SHOP", "¡Bienvenido! ¿Qué te llevas?": "Welcome! What will it be?", "COMPRAR": "BUY",
  "¡Faltan {n} fichas!": "{n} more tokens needed!",
  // resultado
  "¡CAPÍTULO SUPERADO!": "CHAPTER CLEARED!", "¡NUEVO RÉCORD!": "NEW RECORD!", "¡SE ACABÓ EL TIEMPO!": "TIME'S UP!",
  "PLANTA": "FLOOR", "PUNTOS": "POINTS", "OTRA": "AGAIN", "MENÚ": "MENU", "fichas": "tokens", "primera del día": "first of the day",
  "Te faltó 1 planta para el jefe": "You were 1 floor short of the boss", "Te faltaron {n} plantas para el jefe": "You were {n} floors short of the boss",
  "Te faltó 1 planta para tu récord": "You were 1 floor short of your record", "Te faltaron {n} plantas para tu récord": "You were {n} floors short of your record",
  "Te faltaron {n} puntos para tu récord": "You were {n} points short of your record",
  "Te faltan {n} fichas para": "{n} tokens to go for", "¡ya puedes subirla de nivel!": "you can level it up now!",
  "¡JunkCoon se une a tu equipo!": "JunkCoon joins your team!", "Capítulo 2: Cementerio de juegos, pronto": "Chapter 2: Game Graveyard, coming soon",
  "¡Misión!": "Mission!", "La semana cierra en {d} d {h} h": "The week closes in {d} d {h} h",
  // novedades (js/novedades.js): las entradas más nuevas
  "<b>VUELVEN EL ZORRO Y LA SURICATA DE SIEMPRE</b> dentro de la cápsula: nos gustaban más.": "<b>THE CLASSIC FOX AND MEERKAT ARE BACK</b> inside the capsule: we liked them better.",
  "SlyFox exige que se borre la versión anterior de su foto de ficha. Recursos Humanos dice que ya es tarde.": "SlyFox demands that the previous version of his badge photo be deleted. HR says it is too late.",
  "<b>MACETA ROTA NUEVA</b>: al romper una maceta ahora se ve hecha pedazos, con la tierra por el suelo.": "<b>NEW BROKEN POT</b>: when you smash a flower pot it now shows in pieces, with the soil all over the floor.",
  "Mantenimiento recuerda que las macetas son de cerámica corporativa y que cada trozo cuenta como inventario.": "Maintenance reminds everyone that the pots are corporate ceramics and every shard counts as inventory.",
  "<b>ZORRO Y SURICATA NUEVOS</b> dentro de la cápsula: más claros y con más color. El conejo sigue con su dibujo provisional mientras buscamos uno que se lea bien tan pequeño.": "<b>NEW FOX AND MEERKAT</b> inside the capsule: clearer and more colourful. The rabbit keeps its temporary drawing while we find one that reads well at such a small size.",
  "SlyFox ha pedido que conste en acta que él cabía en la cápsula «perfectamente» y que la cola no cuenta.": "SlyFox asked for the record to show he fit in the capsule “perfectly” and that the tail does not count.",
  "<b>CÁPSULA Y MACETA NUEVAS</b>: los dos primeros dibujos definitivos. La cápsula ya es de cristal de verdad, hueca, para ver bien a tu criatura dentro. El resto del arte sigue siendo provisional.": "<b>NEW CAPSULE AND FLOWER POT</b>: the first two final drawings. The capsule is now real glass, hollow, so you can see your creature inside. The rest of the art is still temporary.",
  "Microblizz ha comprado las cápsulas al por mayor y avisa de que «transparente» no significa «con ventilación».": "Microblizz bought the capsules in bulk and warns that “transparent” does not mean “ventilated”.",
  "<b>MESA NUEVA</b>, más grande y con píxeles más gordos: arriba, el <b>ascensor</b> (la salida a la planta siguiente), la <b>tienda de Lola</b> (mete la bola con fichas y compra mejoras), tres <b>máquinas de café</b> que rebotan y sueltan fichas y una <b>fotocopiadora gigante</b> que te sube por la rampa entre papeles. Abajo, rebotadores sobre las palas y carriles de salida a los lados. El centro cambia en cada planta. El arte sigue siendo provisional.": "<b>NEW TABLE</b>, bigger and with chunkier pixels: up top, the <b>elevator</b> (the way to the next floor), <b>Lola's shop</b> (shoot the ball in with tokens and buy upgrades), three <b>coffee machines</b> that bounce and drop tokens and a <b>giant photocopier</b> that lifts you up the ramp among flying papers. Down below, slingshots over the flippers and outlanes at the sides. The middle changes on every floor. The art is still temporary.",
  "Recursos Humanos confirma que la tienda de Lola acepta fichas, sonrisas y horas extra, pero que la fotocopiadora sigue «en mantenimiento» desde 2019.": "HR confirms that Lola's shop takes tokens, smiles and overtime, but that the photocopier has been \"under maintenance\" since 2019.",
  "<b>PRIMER PROTOTIPO</b>, solo en la alfa: un pinball de dos pisos donde la bola es tu criatura, hecha un ovillo dentro de una cápsula. Rompe macetas y cofres, llena el <b>CAOS</b> para soltar a todo el equipo, sube la escalera antes de que se acabe el reloj y elige 1 de 3 mejoras en cada planta, hasta el jefe SurvivalBot. Parte del arte es provisional: el definitivo llegará después.": "<b>FIRST PROTOTYPE</b>, alpha only: a two-level pinball where the ball is your creature, curled up inside a capsule. Smash plant pots and chests, fill <b>CHAOS</b> to release the whole team, climb the stairs before the clock runs out and pick 1 of 3 upgrades on every floor, all the way to the boss SurvivalBot. Some of the art is temporary: the final art will come later.",
  "Microblizz aclara que recibir golpes de una cápsula de gashapon «entra en el convenio de los becarios», y que las macetas rotas se descuentan de la nómina.": "Microblizz clarifies that being hit by a gashapon capsule \"is covered by the interns' agreement\", and that broken plant pots come out of their pay.",
});
