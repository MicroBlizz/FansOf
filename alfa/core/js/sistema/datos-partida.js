// Fans Of · DATOS DE PARTIDA: el interruptor de core para ayudar a mejorar los juegos con datos ANÓNIMOS de las partidas (rendimiento, equilibrio…).
// Está en TODOS los juegos, recojan datos o no: antes de mandar nada que salga de una partida, se pregunta DATOS.activo() (rendimiento.js y la telemetría ya lo hacen).
// Viene ENCENDIDO por defecto (interés legítimo: mejorar los juegos, sin nombre, email ni cuenta; ver privacidad/); en Opciones se apaga. La elección es una sola para toda la web.
// La fila de Opciones sale sola junto a la de Cuenta: en los juegos con la lista de Opciones de core, debajo de Cuenta; en un juego ligero va dentro de window.filaCuenta,
// así que cualquier juego que ya coloque la fila de Cuenta coloca también esta sin tocar nada.
'use strict';
const DATOS = (() => {
  const CLAVE = 'fansof-datos';
  const leer = () => { try { return localStorage.getItem(CLAVE) !== 'no'; } catch (e) { return true; } };
  let on = leer();
  const poner = v => { on = !!v; try { localStorage.setItem(CLAVE, on ? 'si' : 'no'); } catch (e) { /* sin almacenamiento: vale para esta sesión */ } };
  {
    const ancla = document.getElementById('btn-export'), lista = ancla && ancla.closest('.opt-list');
    const fila = document.createElement('div'); fila.className = 'opt-row'; fila.id = 'opt-datos';
    const span = document.createElement('span'), boton = document.createElement('button'); boton.className = 'btn-ghost ol';
    const pinta = () => {
      span.innerHTML = '<b></b><br><small></small>';
      span.firstChild.textContent = tr('Datos de partida anónimos');
      span.lastChild.innerHTML = tr('Ayúdanos a mejorar los juegos con datos anónimos de tus partidas: sin nombre, sin email y sin cuenta. Puedes apagarlo cuando quieras.') + ' <a href="' + location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '') + 'privacidad/?lang=' + (typeof IDIOMA !== 'undefined' ? IDIOMA.actual : 'es') + '" target="_blank" rel="noopener">' + tr('Privacidad') + '</a>';
      boton.textContent = on ? tr('ENCENDIDO') : tr('APAGADO');
    };
    boton.onclick = () => { poner(!on); if (typeof play === 'function') play('select'); pinta(); };
    fila.append(span, boton);
    if (lista) lista.insertBefore(fila, ancla.closest('.opt-row'));
    else if (window.filaCuenta) { const g = document.createElement('div'); g.style.display = 'contents'; g.append(window.filaCuenta, fila); window.filaCuenta = g; }   // juego ligero: viaja con la fila de Cuenta
    else window.filaCuenta = fila;   // sin cuenta (CUENTA apagada): el juego coloca esta como colocaría la de Cuenta
    pinta(); document.addEventListener('DOMContentLoaded', pinta);
  }
  return { activo: () => on, poner };
})();
