// Fans of Nova · Retos: misiones diarias y semanales y logros (los DATOS). El sistema es común: core/js/sistema/retos-ligero.js.
// Se pagan en aleación, que se guarda con la campaña (SAVE, campana.js). La pantalla está en retos-ui.js.
// Eventos que avisa la partida (nvCierraMision, campana.js): mision, victoria, muertos, sector (liberado) y rango (el más alto).
'use strict';
const RETOS_NOVA = {
  diarias: [
    { id: 'm2', txt: 'Juega 2 misiones', goal: 2, ev: 'mision', r: 15 },
    { id: 'v1', txt: 'Gana una misión', goal: 1, ev: 'victoria', r: 20 },
    { id: 'v2', txt: 'Gana 2 misiones', goal: 2, ev: 'victoria', r: 35 },
    { id: 'k150', txt: 'Destruye 150 naves enemigas', goal: 150, ev: 'muertos', r: 20 },
    { id: 'k400', txt: 'Destruye 400 naves enemigas', goal: 400, ev: 'muertos', r: 35 },
  ],
  semanales: [
    { id: 'sm10', txt: 'Juega 10 misiones', goal: 10, ev: 'mision', r: 100 },
    { id: 'sv5', txt: 'Gana 5 misiones', goal: 5, ev: 'victoria', r: 120 },
    { id: 'sk1500', txt: 'Destruye 1.500 naves enemigas', goal: 1500, ev: 'muertos', r: 120 },
    { id: 'ss3', txt: 'Libera 3 sectores', goal: 3, ev: 'sector', r: 150 },
  ],
  logros: [
    { id: 'l-v1', txt: 'Gana tu primera misión', goal: 1, ev: 'victoria', r: 20 },
    { id: 'l-v10', txt: 'Gana 10 misiones', goal: 10, ev: 'victoria', r: 80 },
    { id: 'l-v50', txt: 'Gana 50 misiones', goal: 50, ev: 'victoria', r: 300 },
    { id: 'l-s5', txt: 'Libera 5 sectores', goal: 5, ev: 'sector', r: 60 },
    { id: 'l-s20', txt: 'Libera 20 sectores', goal: 20, ev: 'sector', r: 250 },
    { id: 'l-r10', txt: 'Llega al rango 10', goal: 10, ev: 'rango', r: 40 },
    { id: 'l-r30', txt: 'Llega al rango 30', goal: 30, ev: 'rango', r: 150 },
    { id: 'l-r50', txt: 'Llega al rango 50', goal: 50, ev: 'rango', r: 400 },
    { id: 'l-k500', txt: 'Destruye 500 naves enemigas', goal: 500, ev: 'muertos', r: 40 },
    { id: 'l-k5000', txt: 'Destruye 5.000 naves enemigas', goal: 5000, ev: 'muertos', r: 200 },
    { id: 'l-c8', txt: 'Descubre 8 combos', goal: 8, ev: 'combos', r: 60 },          // los combos los cuenta combos-ui.js (NV.Combos)
    { id: 'l-c16', txt: 'Descubre todos los combos', goal: 16, ev: 'combos', r: 200 },
  ],
};
// Las firmas que pide el sistema común: dónde se guarda y en qué se paga (aleación, de la campaña).
const NV_RETOS = RETOSL.crear({
  save: () => SAVE, guardar: () => nvCampGuarda(),
  pagar: r => { nvCamp().aleacion += r; },
  diarias: RETOS_NOVA.diarias, semanales: RETOS_NOVA.semanales, logros: RETOS_NOVA.logros, nDiarias: 3, nSemanales: 2,
});
