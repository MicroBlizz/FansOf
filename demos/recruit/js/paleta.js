// Fans of Recruit · LA PALETA: los materiales del juego. Cada uno tiene 6 tonos, del más oscuro al más claro
// (contorno, sombra honda, sombra, base, luz y brillo). Las sombras tiran a azul y a morado y las luces a amarillo, como
// en las recreativas de los 90. Los colores base de cada personaje son los de su dibujo de la serie (core/js/serie/arte/).
'use strict';

const MAT = {
  // CrazyBunny
  pelo:    material(['#3f3768', '#8580b4', '#b7b3da', '#e9e7f7', '#ffffff', '#ffffff'], { mate: true }),
  peloF:   material(['#332c58', '#5d5890', '#8580b6', '#b0acd8', '#cfccea', '#e6e4f6'], { mate: true }),   // lo del otro lado, más apagado
  rosa:    material(['#6e2148', '#b0457a', '#dc6a9e', '#f595be', '#ffbfd9', '#ffe3ef'], { mate: true }),
  capa:    material(['#5c1a0e', '#a02d10', '#d2501a', '#f47c20', '#ffa63d', '#ffd07a'], { mate: true }),
  oro:     material(['#5e3306', '#a8600e', '#dc9418', '#f9c531', '#ffe56e', '#fffac8'], { pulido: true }),
  hoja:    material(['#0f3320', '#1a5c2c', '#2c8a38', '#52b846', '#8cdc64', '#d0f8a0'], { mate: true }),
  caqui:   material(['#1e2412', '#3d4a22', '#5a6c2e', '#7c9040', '#a4b85e', '#d0dc96'], { mate: true }),   // el chaleco de recluta
  // armas y correajes
  acero:   material(['#10121b', '#262b39', '#414859', '#5f687d', '#8d97ac', '#d5dceb'], { pulido: true }),
  madera:  material(['#351c0e', '#69401f', '#96652f', '#c08c4c', '#e0b678', '#f7dcab']),
  cuero:   material(['#2a160e', '#4f2c18', '#744424', '#9a6034', '#be8450', '#e0b080'], { mate: true }),
  // Microblizz
  robot:   material(['#272c42', '#565f7e', '#808aa8', '#aab4c8', '#d0d8e6', '#f5f8fc']),
  robotO:  material(['#12141f', '#2a2f42', '#434a62', '#5d6682', '#8690aa', '#bcc6da']),
  pantalla: material(['#0a1a4a', '#12308c', '#1b4cc8', '#2f6ef0', '#6ca4ff', '#c0dcff'], { pulido: true }),
  rojo:    material(['#56101e', '#98192b', '#cf2b3b', '#f04b53', '#ff8a85', '#ffd2ca']),
  cian:    material(['#0a4460', '#127ea0', '#22b4d6', '#58d6f0', '#a6f0ff', '#e8fdff'], { pulido: true }),
  nave:    material(['#0c1226', '#1c2848', '#2c3e6c', '#40588e', '#6480b4', '#a0b8e0']),
  ala:     material(['#141c36', '#2a3a60', '#40588a', '#5c78ae', '#88a2d6', '#c0d2f2']),
  // MechaVaca
  mecha:   material(['#641a44', '#a2386c', '#d05494', '#f07fb8', '#ffabd2', '#ffdcec'], { pulido: true }),
  mechaO:  material(['#4a1034', '#7c2456', '#a83a76', '#c85896', '#e884b4', '#ffb8d8']),
  blanco:  material(['#3c3a52', '#8684a0', '#b6b4c8', '#e2e0ea', '#f6f5fa', '#ffffff']),
  negro:   material(['#08080e', '#15161f', '#242633', '#363949', '#545970', '#8a90a8']),
  // gente y oficina
  piel:    material(['#5c2a1c', '#a65a3e', '#d48a64', '#f0b48e', '#ffd8b8', '#fff0e2'], { mate: true }),
  cinta:   material(['#4a3a06', '#9a7a0c', '#d0a814', '#f4d024', '#fff06a', '#fffcc8']),
  telaAzul: material(['#0e2030', '#1c4460', '#2a688c', '#3f8cb4', '#6cb4d8', '#b0e0f4'], { mate: true }),
  carton:  material(['#3a2412', '#7a5226', '#a87a40', '#cfa262', '#e8c68c', '#f8e4b8'], { mate: true }),
  edificio: material(['#0d2259', '#16306b', '#1d3f8a', '#2e5bb8', '#5b8fe6', '#9fc0f4']),   // el cuerpo de SurvivalBot
  // la oficina de Microblizz: el decorado va más frío y apagado que los personajes y sin negros, para que estos destaquen
  techo:   material(['#141a26', '#1a2130', '#242d3c', '#303a4a', '#44505f', '#5c6a78'], { mate: true, fuera: 0.05 }),
  pared:   material(['#242e3e', '#303c4e', '#445264', '#58687c', '#6e7e92', '#8c9cac'], { mate: true, fuera: 0.05 }),
  pilar:   material(['#28323f', '#384454', '#4e5c6e', '#667688', '#8090a0', '#a0aebc'], { mate: true, fuera: 0.05 }),
  marco:   material(['#1c2838', '#243044', '#2e3c50', '#3e5066', '#586e86', '#8498b0'], { fuera: 0.05 }),
  persiana: material(['#444238', '#5c584c', '#827c6a', '#a6a08a', '#c6c0aa', '#e4e0cc'], { mate: true, fuera: 0.05 }),
  beige:   material(['#3e3628', '#665a46', '#8e826a', '#b4a88c', '#d2c8ac', '#ece4cc'], { fuera: 0.1 }),          // monitores y fotocopiadora
  tela:    material(['#1e2a36', '#2a3a48', '#3e5262', '#526a7c', '#6c8898', '#90a8b4'], { mate: true, fuera: 0.1 }),   // mamparas y sillas
  maceta:  material(['#3c1c12', '#662818', '#944024', '#b85c36', '#d48456', '#eab088'], { mate: true, fuera: 0.1 }),
  planta:  material(['#123222', '#164a28', '#246c32', '#3c9040', '#62b458', '#96d880'], { mate: true, fuera: 0.1 }),
  agua:    material(['#143c5a', '#1a5c88', '#2c88b8', '#54acd8', '#8cd0ee', '#ccf0fc'], { pulido: true, fuera: 0.1 }),
  tablon:  material(['#182c24', '#1e4434', '#2c5c46', '#3c765a', '#5e987a', '#94c2a8'], { mate: true, fuera: 0.05 }),
  mesa:    material(['#322218', '#523822', '#765232', '#9a7448', '#ba9666', '#d8ba8c'], { fuera: 0.1 }),
  valla:   material(['#3a3418', '#665a22', '#8a7a2e', '#a8963c', '#c2b058', '#d8cc8a'], { mate: true, fuera: 0.1 }),   // amarillo de obra, apagado (el oro es de las monedas)
  papel:   material(['#5a6a84', '#8a9cb8', '#aabdd6', '#c4d6ea', '#dce8f4', '#eef4fa'], { mate: true, fuera: 0 }),     // folios que vuelan
  oscuro:  material(['#1c2432', '#262e3e', '#343e50', '#465266', '#5e6c82', '#8490a4'], { fuera: 0.05 }),              // marcos y aparatos del fondo
  nube:    material(['#8fb4d8', '#a9c8e6', '#c4dcf2', '#e2eefa', '#ffffff', '#ffffff'], { mate: true, fuera: 0 }),
  // fuego, humo y polvo: sin línea oscura alrededor (el fuego se recorta solo)
  fuego:   material(['#5a1410', '#a8241a', '#e8501c', '#ff9a1c', '#ffd83c', '#fffbe0'], { fuera: 0.1 }),
  humo:    material(['#1e181c', '#3a3036', '#564a50', '#74686c', '#968a8a', '#b8aeaa'], { mate: true, fuera: 0.1 }),
  polvo:   material(['#6a6258', '#8c8478', '#aaa294', '#c6beae', '#ded8ca', '#f2eee4'], { mate: true, fuera: 0 }),
  moqueta: material(['#141c26', '#243240', '#32424f', '#3e5262', '#4e6679', '#62809a'], { mate: true, fuera: 0.2 }),
};
