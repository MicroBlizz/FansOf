// Fans Of · /gestion · TABLERO · dominio · BORRADOR: lo que se escribe en el formulario de una tarea, validado ANTES de ir al servidor. Los límites son los mismos
// que los checks del SQL del tablero (117 y 120). Resultado: los datos limpios (textos recortados, responsable vacío = nadie), o 'campo-invalido' con el campo en datos.
// `requiere` («#3, 7») sale como lista de números (requisitos.js).
'use strict';
TABLERO.LIMITES = Object.freeze({ titulo: [1, 120], descripcion: [0, 4000], criterio: [0, 2000], refinado: [0, 4000], esperando: [0, 200], enlaces: [0, 1000], hilo: [0, 300] });
TABLERO.borrador = form => {
  const f = form || {}, datos = {};
  for (const [campo, [min, max]] of Object.entries(TABLERO.LIMITES)) {
    const v = String(f[campo] == null ? '' : f[campo]).trim();
    if (v.length < min || v.length > max) return TABLERO.error('campo-invalido', { campo });
    datos[campo] = v;
  }
  const juego = String(f.juego || 'general').trim();
  if (!/^[a-z0-9-]{1,40}$/.test(juego)) return TABLERO.error('campo-invalido', { campo: 'juego' });
  if (!Object.hasOwn(TABLERO.PRIORIDADES, f.prioridad || 'normal')) return TABLERO.error('campo-invalido', { campo: 'prioridad' });
  if (f.responsable && !Object.hasOwn(TABLERO.RESPONSABLES, f.responsable)) return TABLERO.error('campo-invalido', { campo: 'responsable' });
  const req = TABLERO.requisitosDelFormulario(f);
  if (!req.ok) return req;
  return TABLERO.ok({ ...datos, juego, prioridad: f.prioridad || 'normal', responsable: f.responsable || null, ...req.valor });
};
