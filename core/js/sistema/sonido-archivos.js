// Fans Of · SONIDOS DE ARCHIVO (ADR 077): efectos grabados (los que hace Yoshi, en mp3) tocados por el mismo altavoz que los de código
// (core/js/sistema/sonido.js), así que respetan el volumen y el silencio del juego. Un juego los registra al cargar y, al tocarlos, si el
// archivo aún no ha llegado o no se pudo leer, toca() devuelve false y el juego hace sonar su versión de código: nunca se queda mudo.
//   SONIDO_ARCHIVO.registra(nombre, url)   empieza a bajarlo y descifrarlo ya (sin esperar a que el jugador toque la pantalla)
//   SONIDO_ARCHIVO.toca(nombre, { vol, vel, retraso, salida })  →  true si ha sonado el archivo; false si no (suena el de repuesto)
//     salida: un nodo de audio propio en vez del altavoz común, para lo que suena desde un punto (con su distancia y su lado)
//   SONIDO_ARCHIVO.estado(nombre)          'sin-registrar' | 'cargando' | 'listo' | 'falla'
// SONIDO_ARCHIVO.crear({ descarga, descifra, contexto, salida, apagado }) hace uno con sus propias piezas (lo usan los tests).
// El url lleva ?v= con la versión del juego: el service worker guarda los archivos, y así uno nuevo no se queda tapado por el viejo.
'use strict';
const SONIDO_ARCHIVO = (() => {
  function crear({ descarga, descifra, contexto, salida, apagado }) {
    const sonidos = new Map();      // nombre -> { estado, buf, motivo }
    function registra(nombre, url) {
      if (sonidos.has(nombre)) return;
      const s = { estado: 'cargando', buf: null, motivo: '' };
      sonidos.set(nombre, s);
      Promise.resolve().then(() => descarga(url)).then(descifra)
        .then(buf => { if (!buf) throw new Error('no se pudo descifrar'); s.buf = buf; s.estado = 'listo'; })
        .catch(e => { s.estado = 'falla'; s.motivo = String((e && e.message) || e); });
    }
    function estado(nombre) { const s = sonidos.get(nombre); return s ? s.estado : 'sin-registrar'; }
    function toca(nombre, { vol = 1, vel = 1, retraso = 0, salida: destino = null } = {}) {
      const s = sonidos.get(nombre), ac = contexto(), out = destino || salida();
      if (!s || s.estado !== 'listo' || !ac || !out || apagado()) return false;
      try {
        const fuente = ac.createBufferSource(), g = ac.createGain();
        fuente.buffer = s.buf; fuente.playbackRate.value = vel; g.gain.value = vol;
        fuente.connect(g); g.connect(out); fuente.start(ac.currentTime + retraso);
        return true;
      } catch (e) {
        s.estado = 'falla'; s.motivo = String((e && e.message) || e);      // el altavoz no lo aceptó: desde ahora, el de repuesto
        return false;
      }
    }
    return { registra, estado, toca, motivo: nombre => (sonidos.get(nombre) || {}).motivo || '' };
  }

  // en el navegador: se baja con fetch y se descifra con un contexto sin sonido (OfflineAudioContext), que no necesita que el jugador
  // haya tocado la pantalla; el sonido ya descifrado vale para el altavoz de verdad (AC) cuando llegue
  function descargaWeb(url) {
    return fetch(url).then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status + ' ' + url))));
  }
  function descifraWeb(bytes) {
    const Mudo = typeof window !== 'undefined' && (window.OfflineAudioContext || window.webkitOfflineAudioContext);
    if (!Mudo) return Promise.reject(new Error('este navegador no descifra audio'));
    // el Safari antiguo (webkitOfflineAudioContext) no devuelve promesa: avisa con funciones; el moderno hace las dos cosas
    return new Promise((bien, mal) => {
      const p = new Mudo(1, 1, 44100).decodeAudioData(bytes, bien, mal);
      if (p && typeof p.then === 'function') p.then(bien, mal);
    });
  }
  const web = crear({
    descarga: descargaWeb, descifra: descifraWeb,
    contexto: () => (typeof AC === 'undefined' ? null : AC),
    salida: () => (typeof master === 'undefined' ? null : master),
    apagado: () => typeof sonidoApagado === 'function' && sonidoApagado(),
  });
  return { crear, registra: web.registra, estado: web.estado, toca: web.toca, motivo: web.motivo };
})();
