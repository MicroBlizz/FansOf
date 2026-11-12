// Fans Of · /gestion · TABLERO · dominio · REQUISITOS: una tarea puede requerir otras (tarea #15, ADR 099). Leer la lista escrita en el formulario («#3, 7»),
// saber cuáles siguen abiertas (una tarea solo entra en curso si cada requisito está en revisión o hecho) y avisar de una lista que no vale (ella misma o un
// ciclo) antes de ir al servidor, que lo vuelve a comprobar (_tarea_requisitos_motivo en servidor/125-tablero-requisitos.sql). Funciones puras.
'use strict';
TABLERO.REQUISITOS_MAX = 20;
TABLERO.requisitoCumplido = estado => estado === 'en_revision' || estado === 'hecho';

// «#3, 7 #12» → [3, 7, 12] (sin repetir, ordenados). Resultado: la lista, o 'campo-invalido' con campo 'requiere' (algo que no es un número o más de 20)
TABLERO.leeRequisitos = texto => {
  const trozos = String(texto == null ? '' : texto).split(/[\s,;]+/).filter(Boolean);
  if (!trozos.every(x => /^#?[1-9]\d{0,8}$/.test(x))) return TABLERO.error('campo-invalido', { campo: 'requiere' });
  const ids = [...new Set(trozos.map(x => Number(x.replace('#', ''))))].sort((a, b) => a - b);
  return ids.length > TABLERO.REQUISITOS_MAX ? TABLERO.error('campo-invalido', { campo: 'requiere' }) : TABLERO.ok(ids);
};
// Para el borrador: { requiere: [ids] } si el formulario trae el campo, {} si no (sin la clave, el servidor no toca los requisitos), o el error de leeRequisitos
TABLERO.requisitosDelFormulario = f => {
  if (!Object.hasOwn(f, 'requiere')) return TABLERO.ok({});
  const r = TABLERO.leeRequisitos(f.requiere);
  return r.ok ? TABLERO.ok({ requiere: r.valor }) : r;
};

// ¿Lo escrito en «Requiere» es la misma lista que ya tiene la tarea (json)? Entonces no se manda: guardar otro campo no pisa requisitos que haya puesto
// otro mientras tanto. Lo que no se lee bien no es la misma (el borrador dará el error)
TABLERO.mismosRequisitos = (texto, t) => {
  const r = TABLERO.leeRequisitos(texto);
  return r.ok && r.valor.join() === (t.requiere || []).map(x => x.id).sort((a, b) => a - b).join();
};

// Los números de los requisitos de una tarea (json) que aún no están en revisión ni hechos
TABLERO.requisitosAbiertos = t => (t.requiere || []).filter(r => !TABLERO.requisitoCumplido(r.estado)).map(r => r.id);

// Por qué no vale que la tarea `id` (null si es nueva) requiera `ids`, mirando lo que requieren las `tareas` cargadas: null si vale, o
// 'requisito-propio', o 'ciclo' con los requisitos que llevan de vuelta a ella. Las hechas antiguas no están cargadas: el servidor mira el resto
TABLERO.motivoRequisitos = (id, ids, tareas = []) => {
  if (id == null) return null;   // una tarea nueva no la requiere nadie
  if (ids.includes(id)) return TABLERO.error('requisito-propio', { id });
  const requisitosDe = new Map(tareas.filter(t => t.id !== id).map(t => [t.id, (t.requiere || []).map(r => r.id)]));
  const vuelve = origen => {
    const vistos = new Set(), cola = [origen];
    while (cola.length) {
      const n = cola.shift();
      if (n === id) return true;
      if (!vistos.has(n)) { vistos.add(n); cola.push(...(requisitosDe.get(n) || [])); }
    }
    return false;
  };
  const ciclo = ids.filter(vuelve);
  return ciclo.length ? TABLERO.error('ciclo', { requisitos: ciclo }) : null;
};

// Lo que aún espera una tarea que no ha empezado (ideas, refinamiento o pendiente): sus requisitos abiertos. Ya en curso o después, nada: solo se mira al
// empezarla (Tarea.mueve y _tarea_mover usan esta misma regla)
TABLERO.bloqueos = t => {
  const columna = id => TABLERO.COLUMNAS.findIndex(c => c.id === id);
  return columna(t.estado) < columna('en_curso') ? TABLERO.requisitosAbiertos(t) : [];
};
