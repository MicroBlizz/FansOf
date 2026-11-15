// Fans Of Paperwork · dominio · PLANTA: una planta del archivo, un pasillo de columnas × filas archivadores. Se crea con su número, el azar que
// le pasan (una función que da números de 0 a 1) y los bonos; cada archivador guarda un tipo de documento y tiene su vida (las hojas por mirar). Rebuscar quita vida; un archivador a
// cero se vacía y suelta sus documentos. La planta está limpia al vaciar la parte AJ.planta.limpia de sus archivadores.
'use strict';
PW.planta = (() => {
  const AJ = PW.AJ, C = PW.curvas;
  const total = () => AJ.planta.columnas * AJ.planta.filas;

  // las plantas especiales se encadenan: solo una planta jefe puede pasar a arcoíris (B.ceo es la parte de las jefes)
  function especialDe(azar, B) {
    if (azar() >= B.jefe) return 'normal';
    return azar() < B.ceo ? 'ceo' : 'jefe';
  }
  // especialidad: { indice de documento: vaciados de toda la vida }; su rango baja la vida del archivador
  function archivadorDe(n, azar, especialidad) {
    const [a, b, parteB] = C.documentosDe(n);
    const m = azar() < parteB ? b : a;
    const rango = C.rangoEspecialidad(especialidad[m] || 0);
    const vida = Math.max(1, Math.round(C.vidaDocumento(m, n) * AJ.especialidad.vida[rango]));
    return { m, vida, max: vida };
  }
  function crea(n, azar, B, especialidad) {
    const archivadores = [];
    for (let i = 0; i < total(); i++) archivadores.push(archivadorDe(n, azar, especialidad));
    return { n, archivadores, vaciados: 0, especial: especialDe(azar, B) };
  }
  const objetivo = () => Math.ceil(total() * AJ.planta.limpia);
  const limpia = p => p.vaciados >= objetivo();
  // el primer archivador lleno (el que pica el líder), o -1
  const primerLleno = p => p.archivadores.findIndex(b => b && b.vida > 0);
  const llenos = p => p.archivadores.reduce((acc, b, i) => (b && b.vida > 0 ? acc.concat(i) : acc), []);

  // rebusca en el archivador i con d de lectura. Resultado: PW.ok({ vacio, m }) o PW.error('sin-archivador')
  function rebusca(p, i, d) {
    const b = p.archivadores[i];
    if (!b || b.vida <= 0) return PW.error('sin-archivador', { i });
    b.vida = Math.max(0, b.vida - d);
    if (b.vida > 0) return PW.ok({ vacio: false, m: b.m, i });
    p.vaciados++;
    return PW.ok({ vacio: true, m: b.m, i });
  }
  // multiplicador del botín de la planta
  const multiPlanta = p => (p.especial === 'ceo' ? AJ.especiales.ceoMulti : p.especial === 'jefe' ? AJ.especiales.jefeMulti : 1);

  return { crea, rebusca, limpia, primerLleno, llenos, objetivo, multiPlanta, total };
})();
