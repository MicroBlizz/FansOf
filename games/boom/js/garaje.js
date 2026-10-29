// Fans of Boom · GARAJE: elegir móvil al preparar la partida. Una ficha por facción con su dibujo, su piloto y sus tres tiros
// (cuánto pegan, cuánto les afecta el viento y qué hacen). Se abre en la ventana de encima (#bm-modal) y avisa de la elección.
'use strict';
const GARAJE = (() => {
  const viento = t => (t.viento == null ? 1 : t.viento);   // el del proyectil que se tira (el golpe del cielo cae recto, pero el marcador sí lleva viento)
  const QUE = {   // lo que hace cada efecto, en una frase
    racimo: 'Se abre en trozos arriba del todo.', rebota: 'Rebota y explota otra vez.', fantasma: 'Atraviesa el suelo flotando y explota al salir.', taladro: 'Se mete en el suelo, sube haciendo una curva y explota al salir.',
    combo: 'Explota varias veces seguidas.', parte: 'Pulsa otra vez en el aire y se parte.', glitch: 'Arriba del todo salta hacia delante.', vuelve: 'Rebota hacia ti y explota otra vez.',
    cielo: 'Donde cae, golpe desde el cielo.', barrido: 'Donde cae, el rayo del satélite barre el suelo hacia delante.', pega: 'Se pega a lo que toca y explota en tu siguiente turno.',
    muro: 'Aplasta y se queda tumbado como un muro nuevo.', raid: 'Marca con humo: en tu siguiente turno pasa un avión y lo bombardea.', cadena: 'Un trueno donde cae que salta a los rivales cercanos.',
    empuje: 'Explota y empuja lejos a todos los que pille.', artilleria: 'Donde cae, una fila de obuses de un lado a otro.', tren: 'Sale un tren hacia el rival más cercano.', minas: 'Se queda en el suelo y anda hacia el rival en tu siguiente turno.',
  };
  function dano(t) {   // el daño de un tiro tal como se lee en la ficha: «105 × 4», «110 + 110 por carga»…
    const e = t.efecto || {};
    if (e.tipo === 'cielo') return (e.x.length > 1 ? e.dano + ' × ' + e.x.length : String(e.dano)) + (e.porCarga ? ' ' + tr('+{n} por carga', { n: e.porCarga }) : '');
    if (e.tipo === 'parte') return t.dano + ' / ' + e.trozo.dano + ' × ' + e.n;
    if (e.tipo === 'barrido') return e.dano + ' × ' + Math.round(e.largo / e.cada) + ' ' + tr('+{n} por carga', { n: e.porCarga });
    if (e.tipo === 'raid' || e.tipo === 'artilleria') return e.dano + ' × ' + e.n;
    if (e.tipo === 'pega') return String(e.dano);
    if (e.tipo === 'cadena') return e.dano + ' → ' + Math.round(e.dano * e.baja) + ' → ' + Math.round(e.dano * e.baja * e.baja);
    const n = e.tipo === 'racimo' ? e.n : e.tipo === 'combo' ? e.veces : e.tipo === 'rebota' ? e.veces + 1 : e.tipo === 'vuelve' ? 2 : 1, m = t.multi ? t.multi.n : 1;
    return t.dano + (n * m > 1 ? ' × ' + n * m : '');
  }
  function dibujo(def) {   // el móvil pintado en un lienzo pequeño, con el banderín del equipo naranja
    const cv = document.createElement('canvas'), k = 2; cv.width = 140 * k; cv.height = 84 * k; cv.className = 'bm-g-cv';
    const c = cv.getContext('2d'); c.scale(k * 1.35, k * 1.35); c.translate(52, 56);
    CUERPOS.pinta(c, { def }, BOOM.equipos[0], 0);
    c.save(); c.translate(0, -BOOM.movil.centro); c.rotate(-0.6); c.fillStyle = def.colores[1]; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); rrPath(c, -2, -4, BOOM.movil.boca + 2, 8, 3); c.fill(); c.stroke(); c.restore();
    return cv;
  }
  // vídeo cortito de cada tiro (grabado con herramientas/boom/demos.js); solo si se grabó con el tiro tal como es ahora
  const hayDemo = (d, i) => typeof BOOM_DEMOS !== 'undefined' && BOOM_DEMOS[d.id + ':' + i] === firma(d.tiros[i]);
  function demo(caja, id, t) {
    play('select');
    const v = document.createElement('div'); v.className = 'bm-g-video';
    v.innerHTML = `<div><video src="demos/${id}.mp4" autoplay muted loop playsinline></video><b>${tr(t.nombre)}</b><small>${tr('Toca para cerrar')}</small></div>`;
    v.onclick = e => { e.stopPropagation(); v.remove(); };
    caja.append(v);
  }
  function abre(actual, alElegir) {
    const caja = document.createElement('div'); caja.className = 'bm-tarjeta bm-garaje';
    caja.innerHTML = `<h2>${tr('GARAJE')}</h2><p class="bm-nota">${tr('Un móvil por facción. Lo que más pega, menos agujero hace; y al que más le afecta el viento, más pega.')}</p><div class="bm-g-lista"></div><button class="bm-btn bm-sec" id="bm-g-x">${tr('CERRAR')}</button>`;
    const lista = caja.querySelector('.bm-g-lista');
    for (const d of BOOM.moviles) {
      const f = document.createElement('button'); f.className = 'bm-g-ficha' + (d.id === actual ? ' bm-on' : ''); f.style.setProperty('--c1', d.colores[0]); f.style.setProperty('--c2', d.colores[1]);
      f.append(dibujo(d));
      const tiros = d.tiros.map((t, i) => `<li class="${i === 2 ? 'bm-g-ss' : ''}">${hayDemo(d, i) ? `<span class="bm-g-ver" role="button" tabindex="0" data-v="${d.id}-${i}" title="${tr('Ver cómo es')}"><img class="bm-ico" src="${ICONOS.tiro(d, i)}" alt=""><i></i></span>` : `<img class="bm-ico" src="${ICONOS.tiro(d, i)}" alt="">`}<div><b>${i < 2 ? tr('TIRO ' + (i + 1)) : 'SS'} · ${tr(t.nombre)}</b><span>${tr('Daño')} ${dano(t)} · ${tr('Viento')} ×${String(viento(t)).replace('.', ',')}</span>${t.efecto ? `<em>${tr(QUE[t.efecto.tipo])}</em>` : t.carga ? `<em>${tr('Carga el satélite.')}</em>` : ''}${i === 1 ? `<em class="bm-g-cd">${tr('No se puede usar dos turnos seguidos.')}</em>` : ''}</div></li>`).join('');
      f.insertAdjacentHTML('beforeend', `<div class="bm-g-txt"><h3>${tr(d.nombre)}</h3><small>${tr(d.faccion)} · ${d.piloto} · ${tr('Vida')} ${d.vida}</small><p>${tr(d.nota)}</p><ul>${tiros}</ul></div>`);
      f.onclick = e => {
        const v = e.target.closest('.bm-g-ver');
        if (v) { e.stopPropagation(); return demo(caja, v.dataset.v, d.tiros[+v.dataset.v.split('-').pop()]); }
        play('select'); alElegir(d.id);
      };
      f.onkeydown = e => { const v = e.target.closest('.bm-g-ver'); if (v && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); v.click(); } };
      lista.append(f);
    }
    $('#bm-modal').replaceChildren(caja); $('#bm-modal').hidden = false;
    caja.querySelector('#bm-g-x').onclick = () => { play('select'); $('#bm-modal').hidden = true; };
  }
  function firma(t) {   // huella corta de un tiro: si cambia una cifra, cambia (así el vídeo de demo viejo deja de salir)
    let h = 5381; for (const ch of JSON.stringify(t)) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    return h.toString(36);
  }
  return { abre, firma };
})();
