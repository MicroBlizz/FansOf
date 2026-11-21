// Tiny Fans · aplicación · CASOS DE USO DEL ASALTO: entrar al nido abandonado, dar un paso, abandonar y terminar (con éxito, el botín
// pasa al almacén). El nido abandonado se queda vacío tras un asalto con éxito y se rellena cuando se vuelve de `rellenaCada`
// expediciones con botín (se apunta en el extra 'asalto'). Puertos: { reglas, sesion, reloj, eventos }.
'use strict';
TN.creaCasosAsalto = ({ reglas, sesion, eventos }) => {
  let asalto = null, cerrado = true;
  const A = reglas.asalto;
  // cuántas expediciones con botín faltan para que vuelva a haber algo que llevarse (0: se puede asaltar)
  function faltan() {
    const x = sesion.partida.extra('asalto');
    return x ? Math.max(0, A.rellenaCada - (sesion.partida.contadores.vueltasConBotin - x.vaciadoCon)) : 0;
  }
  function termina(fin) {
    if (cerrado) return;
    cerrado = true;
    const p = sesion.partida;
    p.cuenta('asaltos');
    if (fin.tipo === 'sale' && fin.unidades) {
      const r = TN.Nido.desdeJson(reglas, p.nido), n = r.ok ? r.valor : TN.Nido.nuevo(reglas);
      n.guarda(fin.botin); p.ponNido(n.aJson());
      p.cuenta('asaltosConBotin'); p.ponExtra('asalto', { vaciadoCon: p.contadores.vueltasConBotin });
    }
    sesion.guarda();
  }
  const anuncia = lista => { eventos.emite(lista); return lista; };
  return {
    get abierto() { return sesion.partida.asaltoAbierto; },
    get enCurso() { return !!asalto && !cerrado; },
    faltan,
    // Resultado: ok(foto) o error('asalto-cerrado' | 'asalto-vacio', { faltan })
    entra(datos = {}) {
      if (!sesion.partida.asaltoAbierto) return TN.error('asalto-cerrado');
      if (faltan()) return TN.error('asalto-vacio', { faltan: faltan() });
      const r = TN.Asalto.nuevo(reglas, datos);
      if (!r.ok) return r;
      asalto = r.valor; cerrado = false;
      anuncia({ tipo: 'asalto-empieza', segundos: A.segundos });
      return TN.ok(asalto.foto());
    },
    paso(entrada) {
      if (!asalto || cerrado) return [];
      const lista = asalto.paso(entrada), foto = asalto.foto();
      if (foto.fin) termina(foto.fin);
      return anuncia(lista);
    },
    abandona() {
      if (!asalto || cerrado) return TN.error('sin-asalto');
      const r = asalto.abandona();
      if (r.ok) { termina(asalto.foto().fin); anuncia(r.valor); }
      return r;
    },
    foto: () => (asalto ? asalto.foto() : null),
  };
};
