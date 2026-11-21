// Fans Of · /gestion · TABLERO · dominio · BORRADOR: lo que se escribe en el formulario de una tarea, validado ANTES de ir al servidor. Los límites son los mismos
// que los checks del SQL del tablero (117, 120, 141: el nombre corto, y 169: qué mirar). Resultado: los datos limpios (textos recortados; responsable y quién la pidió vacíos = nadie; ADR 136), o 'campo-invalido' con el campo en datos.
// El responsable es Arkioner, Pepins o nadie (ADR 154: Claude no es responsable) y ya no se manda `para`.
// `requiere` («#3, 7») sale como lista de números (requisitos.js).
'use strict';
TABLERO.LIMITES = Object.freeze({ titulo: [1, 120], corto: [0, 60], descripcion: [0, 4000], criterio: [0, 2000], refinado: [0, 4000], esperando: [0, 200], enlaces: [0, 1000], hilo: [0, 300], que_mirar: [0, 1500] });
TABLERO.borrador = (() => {
  // Los campos de elegir (juego, prioridad, responsable y quién la pidió): el nombre del primero que no vale, o null
  const campoDeElegirMal = (f, juego) => {
    const persona = c => !f[c] || Object.hasOwn(TABLERO.PERSONAS, f[c]);   // vacío = nadie
    if (!/^[a-z0-9-]{1,40}$/.test(juego)) return 'juego';
    if (!Object.hasOwn(TABLERO.PRIORIDADES, f.prioridad || 'normal')) return 'prioridad';
    return ['responsable', 'pedida_por'].find(c => !persona(c)) || null;
  };
  return form => {
    const f = form || {}, datos = {};
    for (const [campo, [min, max]] of Object.entries(TABLERO.LIMITES)) {
      const v = String(f[campo] == null ? '' : f[campo]).trim();
      if (v.length < min || v.length > max) return TABLERO.error('campo-invalido', { campo });
      datos[campo] = v;
    }
    const juego = String(f.juego || 'general').trim();
    const mal = campoDeElegirMal(f, juego);
    if (mal) return TABLERO.error('campo-invalido', { campo: mal });
    const req = TABLERO.requisitosDelFormulario(f);
    if (!req.ok) return req;
    return TABLERO.ok({ ...datos, juego, prioridad: f.prioridad || 'normal', responsable: f.responsable || null,
      pedida_por: f.pedida_por || null, ...req.valor });
  };
})();
