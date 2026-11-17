// Fans Of · LA PORTADA · en qué grupo de la biblioteca va cada tarjeta (ADR 102 y 104). Regla pura: sin pantalla ni almacenamiento. La usa biblioteca/agrupar.js.
// Solo hay dos tipos (data-tipo): «Prototipo», todo lo vivo, y «Archivo», lo parado. Aparte, data-favorito marca a mano «Nuestros favoritos».
//   favoritos  → «Nuestros favoritos»: los prototipos que eligen Arkioner o Pepins (hoy Rouflage y Karts).
//   prototipos → todo lo demás que no está archivado.
//   archivo    → lo parado; un favorito archivado deja de ser favorito.
// De los prototipos, los 4 con más votos se destacan en «Los más pedidos» (ADR 103): masPedidos(). Ni los favoritos ni el Archivo entran.
'use strict';
const GRUPOS = (() => {
  const de = (tipo, favorito) => {
    if (tipo === 'Archivo') return 'archivo';
    return favorito ? 'favoritos' : 'prototipos';
  };
  // datos: lo que contesta votos_destacados() (SQL 126), { idDelJuego: { puntos, ultimo } }; ids: los prototipos en el orden de la página.
  // Gana quien tiene más puntos; si empatan, quien llegó más tarde a ellos (su voto contado más reciente); si aún empatan, el primero de la página. Sin puntos no entra.
  const masPedidos = (datos, ids, cuantos = 4) => ids
    .map((id, orden) => { const d = (datos && datos[id]) || {}; return { id, orden, puntos: Number(d.puntos) || 0, llegada: Date.parse(d.ultimo) || 0 }; })
    .filter(x => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.llegada - a.llegada || a.orden - b.orden)
    .slice(0, cuantos)
    .map(x => ({ id: x.id, puntos: x.puntos }));
  // ¿Un toque en la tarjeta abre su ficha? Sí, salvo que caiga en algo de DENTRO de la tarjeta que ya hace otra cosa (un enlace, su plegable de novedades).
  // El plegable del grupo (Prototipos, Archivo) envuelve a la tarjeta por fuera y no cuenta. tarjeta y objetivo: elementos (closest y contains).
  const tocaAbreFicha = (tarjeta, objetivo) => {
    const propio = objetivo.closest('a, details');
    return !propio || !tarjeta.contains(propio);
  };
  return { de, masPedidos, tocaAbreFicha };
})();
