// Fans Of Paperwork · dominio · SELLOS: el sello que trae un archivador al vaciarlo. Confidencial multiplica sus documentos (y alto secreto,
// más todavía); urgente los aparta en un montón con cuenta atrás: si se entrega a tiempo paga AJ.sellos.urgenteMulti veces su precio, y si
// no, pasa a ser papel normal; caducado no vale para clasificar ni vender: va al montón de caducados, que solo sirve para atascar la Trituradora.
'use strict';
PW.sellos = (() => {
  const S = PW.AJ.sellos, C = PW.curvas;

  // qué sello sale: 'secreto', 'confidencial', 'urgente', 'caducado' o 'normal'
  function tira(B, azar) {
    const t = azar();
    if (t < B.confidencial) return azar() < B.altoSecreto ? 'secreto' : 'confidencial';
    if (t < B.confidencial + S.urgente) return 'urgente';
    return t < B.confidencial + S.urgente + S.caducado ? 'caducado' : 'normal';
  }
  const multi = sello => (sello === 'secreto' ? S.confidencialMulti * S.secretoMulti : sello === 'confidencial' ? S.confidencialMulti : 1);
  // aparta los documentos que no van a clasificarse ahora. Devuelve true si los ha guardado (caducados o urgentes con sitio)
  function guarda(e, m, n, sello) {
    if (sello === 'caducado') { e.r.caducados += n; return true; }
    if (sello !== 'urgente' || e.r.urgentes.length >= S.urgentesMax) return false;
    e.r.urgentes.push({ m, n, falta: S.urgenteDura });
    return true;
  }
  // lo que paga entregar ahora un montón urgente
  const pagaUrgente = (B, u) => Math.max(1, Math.round((u.n / C.receta(u.m)) * C.valorExpediente(u.m) * PW.bonos.precioDe(B, u.m) * S.urgenteMulti));
  // entrega todos los urgentes pendientes. Resultado: PW.ok({ oro, montones }) o 'sin-urgentes'
  function entrega(e, B) {
    const r = e.r;
    if (!r.urgentes.length) return PW.error('sin-urgentes');
    const oro = r.urgentes.reduce((s, u) => s + pagaUrgente(B, u), 0), montones = r.urgentes.length;
    r.urgentes = [];
    r.oro += oro;
    e.c.totales.oro += oro;
    return PW.ok({ oro, montones });
  }
  // corre la cuenta atrás: el urgente que no se entrega a tiempo pasa a papel normal y se clasifica
  function avanza(e, B, dt, azar, sucesos) {
    const r = e.r, tarde = [];
    for (const u of r.urgentes) { u.falta -= dt; if (u.falta <= 0) tarde.push(u); }
    if (!tarde.length) return;
    r.urgentes = r.urgentes.filter(u => u.falta > 0);
    for (const u of tarde) {
      r.sueltos[u.m] += u.n;
      PW.rebuscar.clasifica(e, B, u.m, azar, sucesos);
      sucesos.push({ t: 'urgente-tarde', m: u.m });
    }
  }
  return { tira, multi, guarda, pagaUrgente, entrega, avanza };
})();
