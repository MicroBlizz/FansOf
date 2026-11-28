// Fans of Pop · RAID, el jefe CEO con carácter (dominio puro, tarea 448, nodo n4; Pepins 28-11-2026: «asomado toda la semana»). Dice de qué HUMOR
// está según cómo va la raid y qué FRASE suelta en cada momento. Los textos van en español (la pantalla los pasa por tr()); su inglés, en
// idioma/en-raid.js. El azar entra por parámetro (una función que da un número de 0 a 1).
'use strict';
const PP_RAID_CEO = (() => {
  // de más tranquilo a peor: chulo → molesto → nervioso → furioso → pelea (baja a pelear, con su barra de vida) → vencido; `gana` = se acabó el
  // tiempo sin vaciar el tablero
  const HUMORES = Object.freeze(['chulo', 'molesto', 'nervioso', 'furioso', 'pelea', 'vencido', 'gana']);
  const FRASES = Object.freeze({
    chulo: ['Esas burbujas son de la empresa.', 'Tocad, tocad. Tengo más de doscientas mil.', 'Ni entre todos me hacéis cosquillas.', 'Cada burbuja lleva mi firma. Y mi factura.'],
    molesto: ['¿Quién os ha dado permiso para hacer pop ahí?', 'Eso que suena es mi presupuesto.', 'Voy a convocar una reunión sobre esto.', 'Os estoy apuntando en una hoja de cálculo.'],
    nervioso: ['¡Parad! ¡Que eso cuenta como activo!', 'A ver, hablemos. ¿Queréis una pegatina?', '¡Seguridad! ¿Dónde está seguridad?', 'Esto no estaba en la previsión del trimestre.'],
    furioso: ['¡MIS BURBUJAS!', '¡Os pienso descontar cada plop de la nómina!', '¡Como quede una sola, es mía!', '¡Que alguien apague los móviles de esta gente!'],
    pelea: ['¡Ahora bajo yo en persona!', '¡A mí no se me hace pop!', '¡Tengo un traje antigolpes carísimo!', '¡Venid de uno en uno, que así sale más barato!'],
    vencido: ['Vale. Me tomo el resto de la semana.', 'Esto lo pongo como «pérdidas imprevistas».', 'Habéis ganado. No se lo digáis a los accionistas.'],
    gana: ['Se acabó el tiempo. El tiempo es mío, como todo.', 'Casi. «Casi» no cotiza en bolsa.', 'Gracias por participar. Las burbujas se quedan aquí.'],
    cofre: ['¡Eh! ¡Ese cofre era de la caja B!', '¡Mis ahorros para el yate!', '¡Eso no sale en las cuentas, devuélvelo!'],
    racha: ['¡Más despacio, que no me da tiempo a contar!', '¡Tanto dedo no puede ser legal!', '¡Eso es abuso de pantalla táctil!'],
    toque: ['¡No me toques el traje!', '¿Tienes cita? Pues pide cita.', 'Las quejas, por triplicado.', 'Cuidado, que este peinado cuesta un sueldo.'],
    golpe: ['¡Ay!', '¡Mi corbata!', '¡Eso duele en la cuenta de resultados!', '¡Llamaré a mis abogados!'],
    sinToques: ['¿Sin toques? Qué lástima. Qué grandísima lástima.', 'Descansa, descansa. Yo mientras hincho más.', 'El depósito vacío. Como mi corazón.'],
    ajenas: ['¡¿Otro más?! ¡Esto es una plaga!', '¡Encima venís en grupo!', '¡Trabajo en equipo! Con lo que me costó prohibirlo.'],
  });

  // el humor según el resumen de la raid (el de PP_RAID_SINCRONIA.estado()) y los umbrales de vivas (por defecto 75, 50 y 25 %)
  function humor(s, umbrales = [0.75, 0.5, 0.25]) {
    if (!s) return 'chulo';
    if (s.vaciada) return 'vencido';
    if (s.acabada) return 'gana';
    if (s.jefe && s.jefe.activo) return 'pelea';
    const parte = s.total > 0 ? s.vivas / s.total : 1;
    return ['chulo', 'molesto', 'nervioso'][umbrales.findIndex(u => parte > u)] || 'furioso';
  }
  // una frase de un momento (un humor o un suceso), distinta de la última que dijo si hay más de una
  function frase(momento, azar, ultima = null) {
    const lista = FRASES[momento];
    if (!lista) return null;
    const otras = lista.length > 1 ? lista.filter(f => f !== ultima) : lista;
    return otras[Math.min(otras.length - 1, Math.floor(azar() * otras.length))];
  }
  // cuánto enfado enseña la cara, de 0 (tranquilo) a 1 (rojo del todo)
  const enfado = h => ({ chulo: 0, molesto: 0.3, nervioso: 0.55, furioso: 1, pelea: 0.85, vencido: 0, gana: 0 })[h] || 0;

  return Object.freeze({ HUMORES, FRASES, humor, frase, enfado });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_CEO;
