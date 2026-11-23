// Fans Of · CORE · LOS JUEGOS DE LA PORTADA Y DEL ANUNCIO · cómo sale cada juego tras aplicar los cambios de /gestion → Juegos (tabla juego_portada) sobre el catálogo del repo (ADR 203). Regla pura: sin pantalla, almacenamiento, reloj, azar ni red.
// Entrada: el catálogo (biblioteca/juegos.json: { id, estado: 'vivo'|'alfa'|'archivo', favorito }), las filas de juego_portada
// ({ juego, plataforma: 'alfa'|'web', seccion, en_portada, en_anuncio }; null = lo del repo) y la plataforma que se pinta ('alfa' o 'web').
//   seccion    → la de la fila o, si no trae, la del repo: 'archivo' si está archivado; si no, 'favoritos' si es favorito; si no, 'prototipos'.
//   enPortada  → la fila (o sí); en la web, un juego solo de alfa nunca sale.
//   enAnuncio  → la fila (o sí), pero solo si puedeAnuncio: el anuncio solo se enciende para un juego que se ve (Arkioner, 22-11-2026).
//   motivo     → por qué no puede anunciarse, el primero que aplique en este orden: 'sin_publicar' (estado alfa, en cualquier plataforma),
//                'fuera_de_portada' y 'archivo' (en el Archivo del panel o archivado en el repo: el anuncio solo elige los vivos del repo). null si puede.
// Una fila con valores que no valen (sección o plataforma desconocida, algo que no es booleano) cuenta como null; la de un juego que no está en el catálogo se ignora.
'use strict';
const JUEGOS_PORTADA = (() => {
  const SECCIONES = ['favoritos', 'prototipos', 'archivo'];
  const PLATAFORMAS = ['alfa', 'web'];
  const CAMPOS = ['seccion', 'en_portada', 'en_anuncio'];
  const VACIA = Object.freeze({ seccion: null, en_portada: null, en_anuncio: null });

  const bool = v => (typeof v === 'boolean' ? v : null);
  // La fila con solo lo que vale; lo demás, null.
  const limpia = fila => Object.freeze({
    seccion: SECCIONES.includes(fila && fila.seccion) ? fila.seccion : null,
    en_portada: bool(fila && fila.en_portada),
    en_anuncio: bool(fila && fila.en_anuncio),
  });
  const conValor = fila => CAMPOS.some(c => fila[c] !== null);

  // { idDelJuego: fila limpia } con las filas de esa plataforma; si un juego repite fila, gana la última.
  const filasDe = (filas, plataforma) => {
    const mapa = new Map();
    for (const f of filas || []) {
      if (f && f.plataforma === plataforma && PLATAFORMAS.includes(plataforma)) mapa.set(f.juego, limpia(f));
    }
    return mapa;
  };

  const seccionDelRepo = juego => {
    if (juego.estado === 'archivo') return 'archivo';
    return juego.favorito ? 'favoritos' : 'prototipos';
  };

  const motivoDe = (juego, seccion, enPortada) => {
    if (juego.estado === 'alfa') return 'sin_publicar';
    if (!enPortada) return 'fuera_de_portada';
    if (seccion === 'archivo' || juego.estado === 'archivo') return 'archivo';   // el anuncio solo elige entre los vivos del repo (promo-juegos.js)
    return null;
  };

  const ajusta = (juego, fila, plataforma) => {
    const seccion = fila.seccion ?? seccionDelRepo(juego);
    const enPortada = (fila.en_portada ?? true) && !(plataforma === 'web' && juego.estado === 'alfa');
    const motivo = motivoDe(juego, seccion, enPortada);
    const puedeAnuncio = motivo === null;
    return Object.freeze({
      id: juego.id, seccion, enPortada,
      enAnuncio: puedeAnuncio && (fila.en_anuncio ?? true),
      puedeAnuncio, motivo, cambiado: conValor(fila),
    });
  };

  // Cómo sale cada juego del catálogo, en su orden. Lista y elementos congelados.
  const aplica = (catalogo, filas, plataforma) => {
    const mapa = filasDe(filas, plataforma);
    return Object.freeze((catalogo || []).map(j => ajusta(j, mapa.get(j.id) || VACIA, plataforma)));
  };

  // Los ids que pueden salir en nuestro anuncio en esa plataforma.
  const anunciables = (catalogo, filas, plataforma) => aplica(catalogo, filas, plataforma).filter(a => a.enAnuncio).map(a => a.id);

  // ¿«Pasar a la web» cambiaría algo? Compara lo que vale de cada fila; sin fila = todo null.
  const difiere = (filaAlfa, filaWeb) => {
    const a = limpia(filaAlfa), w = limpia(filaWeb);
    return CAMPOS.some(c => a[c] !== w[c]);
  };

  return Object.freeze({ aplica, anunciables, difiere });
})();
