// Fans Of · EL ESTILO NUEVO de la web («Arcade nocturno», ADR 128 y 135): pone en <html> la clase «portada-nueva», de la que cuelgan la paleta de la noche,
// el logo del menú y la barra de abajo (estilo/web.css), SOLO con el flag «portada-nueva» abierto (servidor/143: hoy, en la alfa). Sin él, la web de siempre.
// Lo cargan todas las páginas con menú, detrás de core/js/nucleo.js y core/js/sistema/flags.js. El flag se pregunta cada vez (nunca se guarda en una constante)
// y los cambios llegan de fondo: abrirlo o cerrarlo en /gestion se nota sin recargar. La portada pregunta aquí si está activo (biblioteca/portada-nueva.js).
// DEUDA (tarea #69): al dar la portada por buena se quita el flag; esta pieza y la clase desaparecen y las reglas pasan a ser las de siempre.
'use strict';
const ESTILO_NUEVO = (() => {
  const activo = () => NUCLEO.flag('portada-nueva', 'Estilo nuevo de la web (Arcade nocturno, tareas #69 y #87)');
  const aplicar = () => { document.documentElement.classList.toggle('portada-nueva', activo()); };
  aplicar();
  NUCLEO.alCambiarFlags(aplicar);
  return { activo };
})();
