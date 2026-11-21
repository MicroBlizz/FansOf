// Fans of Asalto · La composición: monta los casos de uso con sus puertos (el almacén de este navegador, un azar con semilla de reloj y el día de hoy con la hora del servidor),
// prepara el lienzo, la pantalla de la partida y el menú, espera a las letras y a los dibujos, y arranca el bucle: en cada fotograma
// pinta la partida o el fondo del menú. Es el único sitio que conoce a todas las piezas.
'use strict';
(() => {
  HORA.sincroniza();   // la hora del servidor: el día del tope de plumas y del regalo diario no se engaña cambiando el reloj del aparato
  AS.relojDev = { dias: 0 };                         // SOLO PARA PRUEBAS (panel DEV, «Pasar al día siguiente»): días que se suman a la hora del servidor
  const hoy = () => MEDIDOR_ANUNCIOS.fechas(new Date(HORA.ahora() + (NUCLEO.desarrollo ? AS.relojDev.dias : 0) * 86400000)).dia;   // fuera del modo desarrollo no cuenta
  const casos = AS.creaCasos({ datos: ASALTO, almacen: AS.almacen, azar: AS.creaAzar((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0), hoy });
  AS.casos = casos;                                  // a mano para el panel DEV y las pruebas en el navegador
  window.enPartida = () => AS.pantalla.activa;       // core lo pregunta (avisos y pantalla de la cuenta)
  let ultimo = 0;
  function fotograma(ahora) {
    requestAnimationFrame(fotograma);
    const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0.016);
    ultimo = ahora;
    AS.suena.bucle();
    if (AS.pantalla.activa) AS.pantalla.fotograma(dt); else AS.menu.fotograma(dt);
  }
  function arranca() {
    const cv = $('#cv'), raiz = document.documentElement.style;
    AS.lienzo.monta(cv); AS.pantalla.monta(cv); AS.menu.monta(casos);
    for (const [k, v] of Object.entries(AS.tema.css())) raiz.setProperty(k, v);   // las piezas del tema, para las ventanas y el menú
    // las letras de píxeles: cada texto se guarda ya dibujado, así que hay que esperar a que lleguen; si llegan tarde, se borra lo guardado
    if (document.fonts) document.fonts.addEventListener('loadingdone', () => AS.texto.limpia());
    const letras = document.fonts ? Promise.race([Promise.all(['32px "Jersey 10"', '64px "Jersey 10"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]) : Promise.resolve();
    AS.dibujos.carga(() => letras.then(() => {
      AS.texto.limpia();
      AS.menu.abre();
      const carga = $('#carga');
      if (carga) carga.remove();
      requestAnimationFrame(fotograma);
    }));
  }
  arranca();
})();
