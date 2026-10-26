// Fans Of Taxi · FONDO: el cielo de noche (degradado, estrellas y luna en una esfera que sigue a la cámara), el mar más allá del mundo y
// la niebla del horizonte. El terreno, las montañas y las ciudades de verdad los monta TROZOS.
'use strict';

const FONDO = (() => {
  const HORIZONTE = 0x3a1f5c;   // el color de la niebla y de la parte baja del cielo: así lo lejano se funde
  let cielo = null;

  function texturaCielo(T) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const g = c.getContext('2d'), az = mulberry32(11);
    const d = g.createLinearGradient(0, 0, 0, 512);
    d.addColorStop(0, '#07040f'); d.addColorStop(0.3, '#160b2e'); d.addColorStop(0.44, '#4a2170');
    d.addColorStop(0.49, '#ff6f9f'); d.addColorStop(0.5, '#3a1f5c'); d.addColorStop(1, '#3a1f5c');
    g.fillStyle = d; g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 260; i++) {   // estrellas, más en lo alto
      const y = Math.pow(az(), 1.6) * 220, x = az() * 1024, r = az() < 0.1 ? 1.6 : 0.8;
      g.globalAlpha = 0.4 + az() * 0.6; g.fillStyle = '#fff6ea'; g.fillRect(x, y, r, r);
    }
    g.globalAlpha = 1;
    // la luna, con su contorno grueso como todo en la serie
    g.fillStyle = '#fff1c4'; g.strokeStyle = '#20102c'; g.lineWidth = 4;
    g.beginPath(); g.arc(300, 110, 26, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#e9d7a4'; g.beginPath(); g.arc(292, 104, 6, 0, Math.PI * 2); g.arc(309, 120, 4, 0, Math.PI * 2); g.fill();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }

  function montar(T, escena, toon, contorno) {
    const M = TAXI.mundo, cx = M.ancho / 2, cz = M.largo / 2;
    escena.background = new T.Color(HORIZONTE); escena.fog = new T.Fog(HORIZONTE, 500, 1700);   // lejos se ve el mundo entero (lo lejano de TROZOS); la niebla solo funde el horizonte
    // cielo: una esfera por dentro que sigue a la cámara
    cielo = new T.Mesh(new T.SphereGeometry(900, 24, 12), new T.MeshBasicMaterial({ map: texturaCielo(T), side: T.BackSide, fog: false, depthWrite: false }));
    cielo.renderOrder = -1; escena.add(cielo);
    // el mar, más allá del mundo (dentro, el suelo lejano ya lo pinta)
    const mar = new T.Mesh(new T.PlaneGeometry(9000, 9000), new T.MeshLambertMaterial({ color: 0x1d3a6e }));
    mar.rotation.x = -Math.PI / 2; mar.position.set(cx, M.nivelMar - 2.5, cz); escena.add(mar);
  }
  // el cielo va con la cámara: nunca se llega al borde
  function sigue(camara) { if (cielo) cielo.position.copy(camara.position); }
  return { montar, sigue };
})();
