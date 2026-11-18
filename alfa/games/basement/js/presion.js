// Fans of Basement · Presión (dominio): como el fondo de Well Diver, que aplasta y frena, cada departamento pide su acreditación.
// Sin ella se puede bajar igual, pero allí te mueves más lento y el café se gasta más. Las acreditaciones se compran una vez, con
// monedas, en la pantalla de elegir departamento. Cifras en ajustes.js (presion).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // ¿Te aprieta la presión en esta zona? (stats.acreditaciones = las zonas acreditadas)
  B.bajoPresion = (AJ, zonaId, stats) => AJ.presion.coste[zonaId] != null && !((stats && stats.acreditaciones) || []).includes(zonaId);
  // Cuánto multiplica la presión: k = 'vel' | 'cafe' (1 si estás acreditado).
  B.presionDe = (AJ, zonaId, stats, k) => (B.bajoPresion(AJ, zonaId, stats) ? AJ.presion[k] : 1);

  B.comprarAcreditacion = function (AJ, p, zonaId) {
    const coste = AJ.presion.coste[zonaId];
    if (coste == null) return B.error('sinAcreditacion', { zona: zonaId });
    if (p.acreditaciones.includes(zonaId)) return B.error('yaAcreditado', { zona: zonaId });
    if (p.monedas < coste) return B.error('faltanMonedas', { coste });
    const q = B.copiaProgreso(p);
    q.monedas -= coste; q.acreditaciones.push(zonaId);
    return B.ok(q);
  };
})(BAS);
