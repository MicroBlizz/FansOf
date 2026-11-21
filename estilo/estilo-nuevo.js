// Fans Of · EL ESTILO NUEVO de la web («Arcade nocturno», ADR 128 y 135): pone en <html> la clase «portada-nueva», de la que cuelgan la paleta de la noche,
// el logo del menú y la barra de abajo (estilo/web.css), y pinta de ese color la barra del navegador, SOLO con el flag «portada-nueva» abierto (servidor/143: hoy, en la alfa). Sin él, la web de siempre.
// Lo cargan todas las páginas con menú, detrás de core/js/nucleo.js y core/js/sistema/flags.js. El flag se pregunta cada vez (nunca se guarda en una constante)
// y los cambios llegan de fondo: abrirlo o cerrarlo en /gestion se nota sin recargar. La portada pregunta aquí si está activo (biblioteca/portada-nueva.js).
// DEUDA (tarea #69): al dar la portada por buena se quita el flag; esta pieza y la clase desaparecen y las reglas pasan a ser las de siempre.
'use strict';
const ESTILO_NUEVO = (() => {
  const activo = () => NUCLEO.flag('portada-nueva', 'Estilo nuevo de la web (Arcade nocturno, tareas #69 y #87)');
  const NOCHE = '#0b1730';   // el fondo de la noche (--bg de estilo/web.css), para la barra del navegador en el móvil
  // la barra del navegador (<meta name="theme-color">) sigue al estilo: el color de la noche con el flag, y el que traía la página sin él
  function barraDelNavegador(si) {
    const meta = document.querySelector('meta[name="theme-color"]'); if (!meta) return;
    if (!meta.dataset.deSiempre) meta.dataset.deSiempre = meta.content;
    meta.content = si ? NOCHE : meta.dataset.deSiempre;
  }
  const aplicar = () => { const si = activo(); document.documentElement.classList.toggle('portada-nueva', si); barraDelNavegador(si); };
  aplicar();
  NUCLEO.alCambiarFlags(aplicar);
  return { activo };
})();
