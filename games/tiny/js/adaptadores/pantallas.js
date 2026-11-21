// Tiny Fans · adaptador · GESTOR DE PANTALLAS: cada pantalla es un archivo que se apunta solo con TN.pantallas.registra({ id, … }) al
// cargarse; principal.js no las conoce por su nombre. Solo hay una a la vista: ve(id, datos) saca la actual (sale) y mete la nueva
// (entra), y el bucle le pasa cada paso de simulación y cada pintado. No toca la página: eso es cosa de cada pantalla.
// Una pantalla: { id, joystick?, enPartida?, entra(datos), sale(), paso(entrada), pinta(alfa, dt), estado()? }. Dueño: N1 (arquitectura).
'use strict';
TN.creaGestorPantallas = () => {
  const pantallas = new Map(), alCambiar = [];
  let actual = null;
  const OBLIGATORIAS = ['entra', 'sale', 'paso', 'pinta'];
  return {
    registra(p) {
      if (!p || typeof p.id !== 'string' || !p.id) throw new Error('Tiny Fans: una pantalla necesita su id');
      const falta = OBLIGATORIAS.filter(f => typeof p[f] !== 'function');
      if (falta.length) throw new Error('Tiny Fans: a la pantalla «' + p.id + '» le falta ' + falta.join(', '));
      if (pantallas.has(p.id)) throw new Error('Tiny Fans: la pantalla «' + p.id + '» ya está apuntada');
      pantallas.set(p.id, p);
    },
    ids: () => [...pantallas.keys()],
    get actual() { return actual ? actual.id : ''; },
    // cambia de pantalla. Resultado: ok(id) o error('pantalla-desconocida')
    ve(id, datos) {
      const nueva = pantallas.get(id);
      if (!nueva) return TN.error('pantalla-desconocida', { id });
      const de = actual ? actual.id : '';
      if (actual) actual.sale();
      actual = nueva;
      nueva.entra(datos);
      for (const fn of alCambiar) fn({ de, a: id });
      return TN.ok(id);
    },
    alCambiar(fn) { alCambiar.push(fn); },
    paso(entrada) { if (actual) actual.paso(entrada); },
    pinta(alfa, dt) { if (actual) actual.pinta(alfa, dt); },
    joystick: () => !!(actual && actual.joystick),
    enPartida: () => !!(actual && actual.enPartida),
    // para las pruebas: qué pantalla hay y lo que ella quiera contar de su estado (una copia)
    estado: () => ({ pantalla: actual ? actual.id : '', ...(actual && actual.estado ? actual.estado() : {}) }),
  };
};
TN.pantallas = TN.creaGestorPantallas();
