// Fans Of · Google Analytics de la web y los juegos (G-T6C335RWHZ), solo con permiso del visitante.
// Una sola propiedad: cada página se separa por su ruta y el juego (games/<juego>/) va como parámetro «juego».
// Lo carga la página principal y NUCLEO.juego(); en localhost (pruebas y app de Android) no hace nada.
// Sin pulsar «Aceptar» no se carga nada de Google ni se crea ninguna cookie. La respuesta se guarda en este navegador.
// Se puede cambiar después con el enlace «Cookies» de la política de privacidad (analitica-cambiar).
'use strict';
(function () {
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return;
  const raiz = (() => { try { return new URL('../../../', document.currentScript.src).href; } catch (e) { return '/'; } })();
  const juego = (location.pathname.match(/\/games\/([^/]+)\//) || [])[1] || '';
  const ID = 'G-T6C335RWHZ', CLAVE = 'fansof-analitica';
  const leer = () => { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } };
  const guardar = v => { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin guardar */ } };
  let idioma = ''; try { idioma = localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  const en = (idioma || navigator.language || 'es').slice(0, 2) === 'en';

  function cargar() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false, juego: juego || 'web' });
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }
  function borrarCookies() {
    for (const c of document.cookie.split(';')) {
      const n = c.split('=')[0].trim(); if (/^_ga/.test(n)) document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
  }
  function aviso() {
    const d = document.createElement('div'); d.setAttribute('role', 'dialog');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:520px;margin:0 auto;padding:12px 14px;border:3px solid #20102c;border-radius:14px;background:#26143c;color:#fff6ea;font:600 14px/1.35 "Baloo 2",system-ui,sans-serif;box-shadow:0 6px 0 #20102c';
    d.innerHTML = '<div>' + (en
      ? 'We use Google Analytics cookies to understand how people use our games, so we can improve the experience. The data is statistical: it carries no name, is not linked to your account and is not used for advertising or personal profiles. Phony only wants to know how many of you press the button that says do not press.'
      : 'Usamos cookies de Google Analytics para entender cómo se usan nuestros juegos y poder mejorar la experiencia. Los datos son estadísticos: no llevan tu nombre, no se unen a tu cuenta y no se usan para publicidad ni para crear perfiles personales. Phony solo quiere saber cuántos pulsáis el botón que dice «no pulsar».')
      + ' <a href="' + raiz + 'privacidad/" style="color:#ffb347">' + (en ? 'Privacy' : 'Privacidad') + '</a></div>'
      + '<div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end"></div>';
    const fila = d.lastChild;
    const boton = (txt, v, fondo) => {
      const b = document.createElement('button'); b.textContent = txt;
      b.style.cssText = 'font:inherit;font-weight:800;padding:8px 14px;border:3px solid #20102c;border-radius:10px;cursor:pointer;color:#20102c;background:' + fondo;
      b.onclick = () => { guardar(v); d.remove(); if (v === 'si') cargar(); else borrarCookies(); };
      fila.appendChild(b);
    };
    boton(en ? 'Reject' : 'Rechazar', 'no', '#cdb9ea');
    boton(en ? 'Accept' : 'Aceptar', 'si', '#ffcb3d');
    document.body.appendChild(d);
  }

  window.analiticaCambiar = () => { guardar(''); borrarCookies(); aviso(); };
  const v = leer();
  if (v === 'si') cargar();
  else if (v !== 'no') { if (document.body) aviso(); else document.addEventListener('DOMContentLoaded', aviso); }
})();
