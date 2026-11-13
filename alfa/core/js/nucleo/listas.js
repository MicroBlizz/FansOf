// Fans Of · NÚCLEO · las listas: qué archivos de core carga cada tipo de juego y en qué orden, los diccionarios de lo común por idioma y las
// hojas de las pantallas comunes. Solo datos. Una pieza de nucleo.js (tarea #28). Un archivo nuevo de core se apunta aquí (COMUN o LIGERO).
// La lee también herramientas/idioma_claves.py (LIGERO).
'use strict';
(() => {
  const DICCIONARIOS = { en: ['idioma/en-serie-1.js', 'idioma/en-serie-2.js', 'idioma/en-serie-3.js', 'idioma/en-pantallas-1.js', 'idioma/en-pantallas-2.js', 'idioma/en-pantallas-3.js', 'idioma/en-pantallas-4.js', 'idioma/en-pantallas-5.js', 'idioma/en-plantillas.js', 'idioma/en-plantillas-2.js', 'idioma/en-extra.js', 'idioma/en-monedas.js', 'idioma/en-pases.js', 'idioma/en-salon.js', 'idioma/en-frases.js', 'idioma/en-feedback.js', 'idioma/en-tienda-gemas.js'],
    pt: ['idioma/pt-ligero.js'], fr: ['idioma/fr-ligero.js'], de: ['idioma/de-ligero.js'], it: ['idioma/it-ligero.js'] };   // los de lo común, por idioma; cada juego añade los suyos en juego({ idioma: { en: [...], pt: [...] } }). De momento solo el inglés cubre todo lo común: los demás idiomas llevan lo que usan los juegos ligeros (*-ligero.js) y un juego solo los ofrece si tiene su diccionario

  // LO COMÚN, en el orden en que se carga. Un archivo nuevo de core se apunta aquí y lo reciben todos los juegos.
  const COMUN = [
    'js/sistema/utiles.js',        // utilidades: no dependen de nada
    'js/sistema/flags.js',         // flags remotos (abrir/cerrar cosas desde la base de datos), mantenimiento y versión mínima
    'js/sistema/sonido.js',        // el altavoz, los efectos y el motor de música
    'js/sistema/sonido-archivos.js', // los efectos grabados en archivo (SONIDO_ARCHIVO), con el de código de repuesto (ADR 077)
    'js/serie/config.js',          // la serie: constantes y CFG (las cartas, unidades, tipos y roles los añade cada facción)
    'js/serie/facciones/animales.js', 'js/serie/facciones/nomuertos.js', 'js/serie/facciones/streamers.js', 'js/serie/facciones/heroes.js', 'js/serie/facciones/ciber.js', 'js/serie/facciones/memes.js', 'js/serie/facciones/gamer.js', 'js/serie/facciones/olvidados.js', 'js/serie/facciones/pop.js', 'js/serie/facciones/microblizz.js', 'js/serie/facciones/phony.js',
    'js/serie/facciones/cierre.js', // lo que se calcula con todas las cartas ya puestas
    'js/serie/arte/base.js',        //           las ayudas de dibujo y ART y BOX vacíos
    'js/serie/arte/animales.js', 'js/serie/arte/nomuertos.js', 'js/serie/arte/streamers.js', 'js/serie/arte/heroes.js', 'js/serie/arte/ciber.js', 'js/serie/arte/memes.js', 'js/serie/arte/gamer.js', 'js/serie/arte/olvidados.js', 'js/serie/arte/pop.js', 'js/serie/arte/microblizz.js', 'js/serie/arte/phony.js',
    'js/serie/arte/sprites.js',     //           las cajas, buildSprites y drawVector (después de todos los dibujos)
    'js/serie/arte/fondos.js',      //           el campo y los colores de cada facción
    'js/serie/canciones.js',       //           las canciones
    'js/serie/frases.js',          //           frases de humor comunes
    'js/serie/iconos.js',          //           iconos y colores
    'js/serie/catalogo.js',        //           qué habilidades y objetos existen
    'js/serie/miniaturas.js', 'js/serie/miniaturas-armas.js', 'js/serie/miniaturas-cabeza-y-accesorios.js',   // los dibujos de sus miniaturas
    'js/sistema/progreso.js',      // economía, catálogo de cada juego, calidades, tienda y partida guardada
    'js/sistema/economia.js',      // el oro, las gemas y las entradas pasan siempre por ECO
    'js/sistema/monedas.js',       // las dos monedas de todo juego, ganada y comprada (nombres, iconos, ratio y el puente ganada → comprada; PLAN-MONEDAS.md)
    'js/sistema/cuenta.js',       // la partida también en la nube: cuenta de invitado, subir y bajar
    'js/cuenta/dominio/roles.js', 'js/cuenta/aplicacion/roles-casos.js', 'js/cuenta/adaptadores/roles-servidor.js', 'js/cuenta/adaptadores/roles-almacen.js',   // los roles de la cuenta (ADR 097): dominio, casos de uso y adaptadores
    'js/cuenta/roles.js',         //           su composición (CUENTA.roles), ya con CUENTA cargada
    'js/sistema/hora.js',         // la hora del servidor para los temporizadores (HORA.ahora)
    'js/sistema/cola.js',         // la cola sin conexión: lo que se manda al servidor cuando hay red (COLA.crea)
    'js/sistema/pagos.js',         // compras con dinero real dentro de la app de Android (Google Play Billing); en la web no hace nada
    'js/sistema/pagos-web.js',     // compras con euros en la web, con Paddle (tras el flag pago-web): lo entrega el mismo servidor
    'js/sistema/alfa.js',         // solo en /alfa/: la franja «ALFA» y la puerta de probadores
    'js/sistema/economia-sombra.js', // modo sombra: el servidor apunta lo que se gana y se gasta, para compararlo (PLAN-CUENTAS, fase 1)
    'js/sistema/pantallas.js',     // lo que usan todas las pantallas: cambiar de una a otra, cartera, niveles, avisos
    'js/sistema/coleccion.js',     // colección: las cartas y lo que llevan puesto
    'js/sistema/biblioteca.js',    // biblioteca: galería de habilidades y objetos
    'js/sistema/inventario.js',    // inventario: las copias de habilidades y objetos
    'js/sistema/gachapon.js',      // gashapón
    'js/sistema/gachapon-gratis.js', // gashapón: la tirada gratis cada 2 horas, con cuenta atrás
    'js/sistema/gachapon-anim.js', // gashapón: la animación nueva al tirar y el marco de las máquinas animadas (flag 'gashapon-nuevo')
    'js/sistema/gachapon-clasica.js', // gashapón: la máquina clásica animada (bolas, manivela, trampilla)
    'js/sistema/gachapon-garra.js', // gashapón: la máquina de gancho (Cartas de Rumble, CASA de Rouflage)
    'js/sistema/probabilidades.js', // tablas de probabilidades del gashapón (las enseña la tienda)
    'js/sistema/tienda.js',        // tienda
    'js/sistema/horas-extra.js', 'js/sistema/horas-extra-escena.js',   // horas extra: el minijuego del menú
    'js/sistema/idioma-banderas.js', // el selector de idioma de Opciones
    'js/sistema/opciones.js',      // opciones comunes (música del menú, versión) e instalar como app
    'js/sistema/volumen.js',        // el volumen de efectos y música por separado (VOLUMEN.crear): lo que piden volGeneral() y volMusica()
    'js/sistema/opciones-comunes.js', // el componente de la pantalla de Opciones: filas ya hechas (volumen, interruptor, idioma, cuenta, novedades, instalar, versión)
    'js/sistema/cuenta-pantalla.js', // la fila «Cuenta» de Opciones (guardar con email, entrar, cerrar sesión, borrar)
    'js/sistema/datos-partida.js', // el interruptor «Datos de partida anónimos» (DATOS.activo()): lo miran las funciones que mandan datos
    'js/sistema/energia.js',       // la energía del PvP y la energía ilimitada (el servidor manda; apagada no se ve)
    'js/sistema/etiqueta-prototipo.js', // la etiqueta «PROTOTIPO» del borde izquierdo, que lleva a votar en la ficha (ADR 106)
    'js/sistema/feedback-reglas.js', // las reglas de los topes del feedback y de la oferta de beta tester (ADR 106)
    'js/sistema/feedback.js',      // la pestaña de feedback (ideas, fallos y opiniones, con permiso de contacto por email)
    'js/sistema/rendimiento.js',   // contador de fps y envío anónimo de rendimiento (lo activa cada juego)
    'js/sistema/presencia.js',     // el pulso anónimo cada minuto (conectados, jugadores por día, retención) tras el flag «presencia»; arranca solo
    'js/sistema/caja-negra.js',     // la lista de los últimos sucesos (pantallas, toques, habilidades, errores) para los reportes; tras el flag «caja-negra»
    'js/sistema/reporte-prueba.js', // botón «!» solo para cuentas admin (todos los juegos): reportar una situación con nota, datos del juego y captura (REPORTE.activar)
    'js/sistema/telemetria.js',    // el progreso anónimo de una partida, en lotes (lo configura cada juego; respeta DATOS.activo())
    'js/sistema/errores.js',       // apunta en el servidor los fallos de código y los errores del servidor, para encontrarlos después
    'js/sistema/promo-reglas.js',  // a quién enseña nuestro anuncio: todos los vivos, más a menudo los más votados (ADR 109)
    'js/sistema/promo-juegos.js',  // la miniatura de otro de nuestros juegos en los anuncios de prueba
    'js/sistema/anuncios.js',      // la capa común de anuncios con premio: AdMob en la app, H5 Games Ads en la web y el nuestro de reserva (tras el flag «anuncios»)
    'js/sistema/energia-anuncio.js', // el botón «ver un anuncio y ganar caos primordial»
    'js/sistema/energia-premio.js',  // la celebración al ganar y recuperar el caos primordial gastado
    'js/sistema/pruebas.js',       // el modo pruebas de Opciones: todo al máximo, con copia para volver a tu partida
    'js/novedades.js',             // el informe de parches (la lista es de cada juego: su js/novedades.js)
  ];

  // LO LIGERO: lo mínimo para un juego con su propia partida y sus pantallas (ver core/js/sistema/ligero.js). Cuenta e idioma, nada de economía.
  const LIGERO = [
    'js/sistema/utiles.js', 'js/sistema/flags.js', 'js/sistema/sonido.js', 'js/sistema/sonido-archivos.js',
    'js/sistema/ligero.js',        // SAVE_KEY y, si el juego no las tiene, la ventana de confirmación y el aviso
    'js/sistema/monedas.js',       // las dos monedas (el juego pone AJUSTES.monedas.leer/escribir)
    'js/sistema/cuenta.js',        // la partida en la nube
    'js/cuenta/dominio/roles.js', 'js/cuenta/aplicacion/roles-casos.js', 'js/cuenta/adaptadores/roles-servidor.js', 'js/cuenta/adaptadores/roles-almacen.js',   // los roles de la cuenta (ADR 097)
    'js/cuenta/roles.js',          //           su composición (CUENTA.roles)
    'js/sistema/hora.js',          // la hora del servidor para los temporizadores (HORA.ahora)
    'js/sistema/cola.js',          // la cola sin conexión: lo que se manda al servidor cuando hay red (COLA.crea)
    'js/sistema/pagos.js',         // compras con dinero real en la app de Android (Google Play Billing): lo entrega el servidor (productos.entrega = el juego)
    'js/sistema/pagos-web.js',     // compras con euros en la web, con Paddle (tras el flag pago-web)
    'js/sistema/alfa.js',          // solo en /alfa/: la franja «ALFA» y la puerta de probadores
    'js/sistema/idioma-banderas.js', // el selector de idioma
    'js/sistema/volumen.js',        // el volumen de efectos y música por separado (VOLUMEN.crear): lo que piden volGeneral() y volMusica()
    'js/sistema/opciones-comunes.js', // el componente de la pantalla de Opciones: filas ya hechas (volumen, interruptor, idioma, cuenta, novedades, instalar, versión)
    'js/sistema/cuenta-pantalla.js', // la fila «Cuenta» (el juego la coloca en sus Opciones: window.filaCuenta)
    'js/sistema/datos-partida.js', // el interruptor «Datos de partida anónimos» (DATOS.activo(); window.filaDatos para colocarlo en Opciones)
    'js/sistema/energia.js',       // la energía del PvP (la pinta el juego donde quiera)
    'js/sistema/etiqueta-prototipo.js', // la etiqueta «PROTOTIPO» del borde izquierdo, que lleva a votar en la ficha (ADR 106)
    'js/sistema/feedback-reglas.js', // las reglas de los topes del feedback y de la oferta de beta tester (ADR 106)
    'js/sistema/feedback.js',      // la pestaña de feedback (ideas, fallos y opiniones, con permiso de contacto por email)
    'js/sistema/rendimiento.js',   // contador de fps y envío anónimo de rendimiento (lo activa cada juego)
    'js/sistema/presencia.js',     // el pulso anónimo cada minuto (conectados, jugadores por día, retención) tras el flag «presencia»; arranca solo
    'js/sistema/caja-negra.js',     // la lista de los últimos sucesos (pantallas, toques, habilidades, errores) para los reportes; tras el flag «caja-negra»
    'js/sistema/reporte-prueba.js', // botón «!» solo para cuentas admin (todos los juegos): reportar una situación con nota, datos del juego y captura (REPORTE.activar)
    'js/sistema/telemetria.js',    // el progreso anónimo de una partida, en lotes (lo configura cada juego; respeta DATOS.activo())
    'js/sistema/errores.js',       // apunta en el servidor los fallos de código y los errores del servidor, para encontrarlos después
    'js/sistema/promo-reglas.js',  // a quién enseña nuestro anuncio: todos los vivos, más a menudo los más votados (ADR 109)
    'js/sistema/promo-juegos.js',  // la miniatura de otro de nuestros juegos en los anuncios de prueba
    'js/sistema/anuncios.js',      // la capa común de anuncios con premio: AdMob en la app, H5 Games Ads en la web y el nuestro de reserva (tras el flag «anuncios»)
    'js/sistema/energia-anuncio.js', // el botón «ver un anuncio y ganar caos primordial»
    'js/sistema/energia-premio.js',  // la celebración al ganar y recuperar el caos primordial gastado
  ];

  // las pantallas comunes: un juego pide la primera y se cargan todas, en este orden
  const ESTILOS_COMUNES = ['../../core/css/menus.css', '../../core/css/menus-tienda.css', '../../core/css/menus-extra.css', '../../core/css/menus-pases.css', '../../core/css/miniaturas.css', '../../core/css/tienda-gemas.css'];

  const listas = Object.freeze({ DICCIONARIOS: Object.freeze(DICCIONARIOS), COMUN: Object.freeze(COMUN), LIGERO: Object.freeze(LIGERO), ESTILOS_COMUNES: Object.freeze(ESTILOS_COMUNES) });
  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.listas = listas;
  if (typeof module !== 'undefined') module.exports = listas;
})();
