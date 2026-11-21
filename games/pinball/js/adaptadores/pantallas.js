// Fans of Pinball · adaptador · GESTOR DE PANTALLAS (como el de Tiny): cada pantalla se apunta sola con PB.pantallas.registra({ id, … })
// al cargarse; solo hay una a la vista: ve(id, datos) saca la actual (sale) y mete la nueva (entra). El bucle le pasa cada paso de física
// y cada pintado. Una pantalla: { id, enPartida?, entra(datos), sale(), paso(dt, entrada), pinta(alfa, dt), estado()? }.
'use strict';
PB.creaGestorPantallas = () => {
  const pantallas = new Map(), OBLIGATORIAS = ['entra', 'sale', 'paso', 'pinta'];
  let actual = null;
  return {
    registra(p) {
      const falta = OBLIGATORIAS.filter(f => typeof p[f] !== 'function');
      if (!p.id || falta.length || pantallas.has(p.id)) throw new Error('Fans of Pinball: pantalla mal apuntada: ' + p.id + ' ' + falta.join(', '));
      pantallas.set(p.id, p);
    },
    ids: () => [...pantallas.keys()],
    get actual() { return actual ? actual.id : ''; },
    // cambia de pantalla: ok(id) o error('pantalla_desconocida')
    ve(id, datos) {
      const nueva = pantallas.get(id);
      if (!nueva) return PB.error('pantalla_desconocida', { id });
      if (actual) actual.sale();
      PB.ventanas.cierra();
      actual = nueva;
      nueva.entra(datos || {});
      return PB.ok(id);
    },
    paso(dt, entrada) { if (actual) actual.paso(dt, entrada); },
    pinta(alfa, dt) { if (actual) actual.pinta(alfa, dt); },
    enPartida: () => Boolean(actual && actual.enPartida && actual.enPartida()),
    estado: () => ({ pantalla: actual ? actual.id : '', ...(actual && actual.estado ? actual.estado() : {}) }),
  };
};
PB.pantallas = PB.creaGestorPantallas();
