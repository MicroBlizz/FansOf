// Fans Of · ALFA: la puerta y la franja de la copia de pruebas (la carpeta /alfa/ de la web, que pone sola la Action alfa.yml; ver PLAN-REPOS.md).
// En la release no hace nada. En /alfa/: franja «ALFA <hash>» abajo y, sin cuenta con el rol «alfa», una pantalla «Solo probadores» en vez del juego.
// El veredicto se recuerda 6 horas por cuenta (así no se pregunta en cada carga) y se vuelve a comprobar de fondo.
'use strict';
(() => {
  if (!NUCLEO.alfa) return;
  const CLAVE = 'fansof-alfa', HORAS = 6;
  const hash = String(NUCLEO.version).split('-a')[1] || '';
  const base = location.pathname.split('/alfa/')[0] + '/';   // la librería, un nivel por encima de alfa/
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null') || {}; } catch (e) { return {}; } };
  const guardar = v => { try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) { /* sin guardar */ } };
  const T = typeof tr === 'function' ? tr : x => x;

  // la franja: siempre visible, no estorba (abajo a la izquierda, no recibe toques)
  const franja = document.createElement('div');
  franja.textContent = 'ALFA ' + hash;
  franja.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99980;pointer-events:none;background:#7a2cff;color:#fff;font:800 11px/1 system-ui,sans-serif;padding:4px 7px;border-radius:6px;border:2px solid #20102c;opacity:.9';
  const poner = () => document.body.append(franja);
  document.body ? poner() : window.addEventListener('DOMContentLoaded', poner);

  function puerta(motivo) {   // el juego se quita de en medio y queda esta pantalla
    document.body.replaceChildren();
    const caja = document.createElement('div');
    caja.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#20102c;color:#fff;font:600 16px/1.4 system-ui,sans-serif;text-align:center;padding:24px';
    const dentro = document.createElement('div'); dentro.style.cssText = 'max-width:420px';
    const h = document.createElement('h1'); h.textContent = T('SOLO PROBADORES'); h.style.cssText = 'font:900 28px system-ui,sans-serif;margin:0 0 12px';
    const p = document.createElement('p'); p.textContent = T(motivo);
    const botones = document.createElement('div'); botones.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px';
    const boton = (txt, fn) => { const b = document.createElement('button'); b.textContent = T(txt); b.onclick = fn; b.style.cssText = 'font:800 15px system-ui,sans-serif;padding:10px 16px;border-radius:10px;border:3px solid #20102c;background:#ffcb3d;color:#20102c;cursor:pointer'; return b; };
    if (typeof CUENTA !== 'undefined' && CUENTA.invitado) botones.append(boton('ENTRAR CON GOOGLE', () => CUENTA.entrarConGoogle()));
    botones.append(boton('VOLVER A LA LIBRERÍA', () => { location.href = base; }));
    dentro.append(h, p, botones); caja.append(dentro); document.body.append(caja);
  }

  async function comprobar() {
    if (typeof CUENTA === 'undefined' || !CUENTA.activa) return;   // sin cuenta posible (archivo suelto, iframe del comparador…): no se exige nada
    try {
      const tiene = await CUENTA.rpc('tiene_rol', { p_rol: 'alfa' });
      guardar(tiene ? { u: CUENTA.usuario, hasta: Date.now() + HORAS * 3600e3 } : {});
      if (!tiene) puerta(CUENTA.invitado ? 'Esta es la copia de pruebas de Fans Of. Entra con tu cuenta de probador para jugar.' : 'Esta cuenta no tiene acceso a la copia de pruebas. Pídelo a Microblizz.');
    } catch (e) { if (!recordado()) puerta('No se ha podido comprobar tu acceso a la copia de pruebas. Revisa la conexión y recarga.'); }   // con el veredicto recordado se sigue jugando
  }

  const recordado = () => { const v = leer(); return typeof CUENTA !== 'undefined' && !!v.u && v.u === CUENTA.usuario && v.hasta > Date.now(); };
  if (recordado()) setTimeout(comprobar, 5000);   // recordado: juega ya y se vuelve a mirar de fondo
  else window.addEventListener('load', () => setTimeout(comprobar, 0));
})();
