// Fans of Swipe · ACTO 2, «La Era Digital» (la campaña 2 de Fans of Rumble, contra Phony): los actos de la torre, los enemigos
// de Phony con sus mecánicas (suscripción, licencia caducada, peaje y facturas que no para el escudo), sus eventos y las reliquias
// de las facciones liberadas (ganar a un líder corrupto hace que su facción se una a ti). Solo datos: las reglas están en
// js/combate.js y el paso de un acto a otro en js/partida.js. Se carga justo después de js/ajustes.js.
'use strict';

// Los actos: de qué piso a qué piso van, dónde caen el tesoro y el descanso, quién es el jefe y qué enemigos salen.
// El Acto 2 se abre la primera vez que ganas al CEO (SAVE.acto2); desde entonces cada subida sigue tras el CEO hasta el piso 30.
const SW_ACTOS = [
  { n: 1, desde: 1, hasta: 15, tesoro: 8, descanso: 14, jefe: 'ceo', iconoJefe: 'n-jefe', nombreJefe: 'El CEO',
    normales: piso => (piso <= 6 ? SW_NORMALES_1 : SW_NORMALES_2), elites: () => SW_ELITES },
  { n: 2, desde: 16, hasta: 30, tesoro: 23, descanso: 29, jefe: 'presidente', iconoJefe: 'n-jefe2', nombreJefe: 'El Presidente de Phony',
    normales: piso => (piso <= 22 ? SW_NORMALES_3 : SW_NORMALES_4), elites: () => SW_ELITES_2 },
];
const swActo = P => SW_ACTOS[(P && P.acto ? P.acto : 1) - 1];
const swActoDePiso = piso => SW_ACTOS.find(a => piso >= a.desde && piso <= a.hasta) || SW_ACTOS[0];

// Enemigos de Phony. Intenciones nuevas: suscribe n (cada turno te cobra n de oro hasta que lo vences; si no llegas, te hiere),
// licencia n (una carta de tu mazo caduca n turnos y no sale), peaje n (2 turnos: cada carta que juegas cuesta n de oro; si no
// llegas, te hiere) y directo (sus golpes no los para el escudo: las facturas caen del cielo).
Object.assign(SW_ENEMIGOS, {
  descargabot: { nombre: 'Descarga99', tipo: 'normal', vida: 30, oro: [16, 22], int: [{ atq: 4, k: 2 }, { def: 8, txt: 'Descargando…' }, { atq: 9 }] },
  licenciabot: { nombre: 'LicenciaBot', tipo: 'normal', vida: 32, oro: [16, 22], int: [{ atq: 8 }, { atq: 4, licencia: 2, txt: 'Licencia caducada' }, { def: 7, atq: 4 }] },
  plusbot:     { nombre: 'PayPlus', tipo: 'normal', vida: 28, oro: [18, 24], int: [{ suscribe: 3, def: 5, txt: 'Suscripción Plus' }, { atq: 7 }, { atq: 5, def: 5 }] },
  cobradlc:    { nombre: 'CobraDLC', tipo: 'normal', vida: 36, oro: [24, 32], int: [{ atq: 6, roba: 12, txt: 'DLC de pago' }, { atq: 10 }, { fuerza: 2, def: 6, txt: 'Pase de temporada' }] },
  servidorbot: { nombre: 'Servidor Caído', tipo: 'normal', vida: 42, oro: [22, 30], int: [{ def: 10 }, { atq: 5, k: 2 }, { carga: 12, txt: 'Servidores caídos' }, { atq: 22, cargado: true, txt: 'Desconexión' }] },
  paystation:  { nombre: 'PayStation sin lector', tipo: 'elite', vida: 62, oro: [44, 56], int: [{ atq: 10 }, { suscribe: 4, def: 8, txt: 'Suscripción obligatoria' }, { carga: 15, txt: 'Actualización obligatoria' }, { atq: 28, cargado: true, txt: 'Pantallazo azul' }] },
  progamer:    { nombre: 'ProGamer corrupto', tipo: 'elite', vida: 48, oro: [44, 56], libera: 'r-progamer', int: [{ atq: 5, k: 3, txt: 'Combo de torneo' }, { def: 10, fuerza: 1, txt: 'Calentando' }, { carga: 14, txt: 'Speedrun' }, { atq: 8, k: 3, cargado: true, txt: 'Récord mundial' }] },
  ladirectora: { nombre: 'LaDirectora corrupta', tipo: 'elite', vida: 56, oro: [44, 56], libera: 'r-directora', int: [{ atq: 11 }, { licencia: 2, cura: 10, txt: 'Derechos de autor' }, { carga: 15, txt: '¡Acción!' }, { atq: 24, cargado: true, txt: 'Explosión de rodaje' }] },
  presidente:  { nombre: 'El Presidente de Phony', tipo: 'jefe', vida: 115, oro: [0, 0],
    int: [{ atq: 9 }, { peaje: 6, def: 10, txt: 'Peaje en el puente' }, { atq: 4, k: 3, directo: true, txt: 'Lluvia de facturas' }, { suscribe: 4, def: 12, txt: 'Suscripción Premium' },
      { carga: 18, txt: 'Subida de precios anual' }, { atq: 28, cargado: true, txt: 'Ya no está disponible en tu región' }, { cura: 14, txt: 'Recompra' }] },
});
const SW_NORMALES_3 = ['descargabot', 'plusbot', 'licenciabot', 'descargabot'];        // pisos 16 a 22
const SW_NORMALES_4 = ['licenciabot', 'cobradlc', 'servidorbot', 'plusbot'];          // pisos 23 en adelante
const SW_ELITES_2 = ['paystation', 'progamer', 'ladirectora'];

// Reliquias de las facciones liberadas: solo se ganan venciendo a su líder corrupto (nunca salen en la tienda ni al azar)
Object.assign(SW_RELIQUIAS, {
  'r-progamer':  { nombre: 'Mando de torneo', faccion: 'Comunidad Gamer', texto: 'Empiezas cada combate con racha 2: el FRENESÍ llega antes.' },
  'r-directora': { nombre: 'Claqueta', faccion: 'Cultura Pop', texto: 'Secuela: tu primera carta de cada combate se juega dos veces.' },
});

// Los eventos del Acto 2 (acto: 2). Los del Acto 1 no llevan acto.
SW_EVENTOS.push(
  { id: 'devoluciones', acto: 2, arte: 'ev-devoluciones', titulo: 'Devoluciones imposibles', texto: 'Un cartel enorme: «No se admiten devoluciones. Ni de juegos digitales, ni de nada».',
    izq: { nombre: 'Insistir', ef: [{ t: 'azar', p: 0.4, si: [{ t: 'oro', n: 45 }], no: [{ t: 'herida', n: 6 }] }] },
    der: { nombre: 'Llevarte la caja vacía', ef: [{ t: 'oro', n: 12 }, { t: 'cura', n: 4 }] } },
  { id: 'torneo', acto: 2, arte: 'ev-torneo', titulo: 'Torneo de pago', texto: 'Inscripción: 30 de oro. Premio: «visibilidad».',
    izq: { nombre: 'Apuntarte', pago: 30, ef: [{ t: 'azar', p: 0.55, si: [{ t: 'reliquia' }], no: [{ t: 'herida', n: 5 }] }] },
    der: { nombre: 'Mirar desde la grada', ef: [{ t: 'mejora' }] } },
  { id: 'remake', acto: 2, arte: 'ev-remake', titulo: 'Rodaje del remake', texto: 'Están rodando el remake de un juego que ya era perfecto. Les falta un extra.',
    izq: { nombre: 'Hacer de extra', ef: [{ t: 'herida', n: 4 }, { t: 'oro', n: 35 }] },
    der: { nombre: 'Robar el guion', ef: [{ t: 'carta' }] } },
  { id: 'atencion', acto: 2, arte: 'ev-atencion', titulo: 'Atención al cliente', texto: '«Su llamada es muy importante para nosotros». Tiempo de espera: 4 horas.',
    izq: { nombre: 'Esperar', ef: [{ t: 'cura', n: 14 }] },
    der: { nombre: 'Colgar y quejarte', ef: [{ t: 'fuerzaBase', n: 1 }, { t: 'herida', n: 4 }] } },
  { id: 'servidores', acto: 2, arte: 'ev-servidores', titulo: 'Servidores cerrados', texto: 'Phony ha apagado los servidores de un juego querido. Las luces aún parpadean.',
    izq: { nombre: 'Encenderlos', ef: [{ t: 'azar', p: 0.5, si: [{ t: 'vidaMax', n: 8 }], no: [{ t: 'herida', n: 7 }] }] },
    der: { nombre: 'Llevarte un disco duro', ef: [{ t: 'oro', n: 28 }] } },
  { id: 'lan', acto: 2, arte: 'ev-lan', titulo: 'La LAN Party', texto: 'Unos fans resisten con ordenadores viejos, pizza fría y cero suscripciones.',
    izq: { nombre: 'Jugar con ellos', ef: [{ t: 'cura', n: 99 }] },
    der: { nombre: 'Pedirles una carta', ef: [{ t: 'quita' }, { t: 'carta' }] } },
);

// zona (fondo) de cada piso, en los dos actos
function swZona(piso) {
  if (piso >= 30) return 'fondo-sede';
  if (piso >= 26) return 'fondo-estudios';
  if (piso >= 21) return 'fondo-lan';
  if (piso >= 16) return 'fondo-tiendas';
  return piso >= 15 ? 'fondo-azotea' : piso >= 11 ? 'fondo-servidores' : piso >= 6 ? 'fondo-oficinas' : 'fondo-vestibulo';
}
