// Fans Of · CAOS PRIMORDIAL de premio: quien gana una partida online recupera el punto que gastó (lo decide el servidor: el resultado trae `energia_premio`).
// Aquí solo se celebra: un estallido dorado con el icono encima de la pantalla de victoria.
// Uso: ENERGIA.premioVictoria(respuestaDelServidor) → true si salió la celebración (una vez por partida aunque se llame varias veces).
'use strict';
(() => {
  let ultimo = null;
  const chispas = () => Array.from({ length: 14 }, (_, i) => `<i style="--a:${Math.round(i * 360 / 14)}deg;--d:${(i % 3) * 0.08}s"></i>`).join('');
  ENERGIA.premioVictoria = r => {
    if (!r || !(r.energia_premio > 0) || r.error) return false;
    const clave = String(r.sala || '') + ':' + String(r.puntos == null ? '' : r.puntos) + ':' + Math.floor(Date.now() / 60000);
    if (ultimo && Date.now() - ultimo.t < 20000) return false;   // la misma respuesta llega varias veces mientras se espera al rival
    ultimo = { k: clave, t: Date.now() };
    ENERGIA.cargar().catch(() => { /* el contador se pondrá al día en cuanto se pueda */ });
    let ov = document.getElementById('en-premio'); if (ov) ov.remove();
    document.body.insertAdjacentHTML('beforeend', `<section id="en-premio" class="en-premio" role="status" aria-live="polite"><div class="en-pr-rayos"></div><div class="en-pr-centro"><div class="en-pr-ico">${ENERGIA.icono(120)}</div><div class="en-pr-chispas">${chispas()}</div><b class="en-pr-mas ol">+${r.energia_premio}</b><b class="en-pr-t ol">${tr('CAOS PRIMORDIAL RECUPERADO')}</b><span class="en-pr-s">${tr('Quien gana, no paga: el caos primordial de esta partida vuelve a ti.')}</span></div></section>`);
    ov = document.getElementById('en-premio'); try { play('levelup'); setTimeout(() => play('crown'), 350); } catch (e) { /* sin sonido */ }
    const quita = () => { if (!ov.isConnected) return; ov.classList.add('sale'); setTimeout(() => ov.remove(), 400); };
    ov.onclick = quita; setTimeout(quita, 4200);
    return true;
  };
})();
