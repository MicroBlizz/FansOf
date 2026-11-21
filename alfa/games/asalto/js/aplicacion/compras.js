// Fans of Asalto · APLICACIÓN · Las compras (ADR 200, tarea #317): las Coronas, los aspectos de héroe, lo que entregan los productos con euros y
// «Sin anuncios». Se monta dentro de AS.creaCasos (casos.js) con sus puertos y sus casos de uso se mezclan con los de allí:
//   leer() el progreso de ahora · escribe(p) lo guarda · activo() ¿está abierto lo nuevo? (modo desarrollo, preguntado cada vez)
//   pruebas() ¿valen las compras de prueba en local? (modo desarrollo) · sinAnuncios() ¿tiene el derecho «sin-anuncios»? (core: DERECHOS)
//   tienda: AJUSTES.tiendaFija · servidor: el monedero del servidor (adaptadores/monedero-servidor.js: listo, copia, compra, refresca, alCambiar)
// QUIÉN MANDA: con cuenta y monedero abierto, el servidor (saldo, aspectos comprados y Pack de inicio salen de su copia; el progreso del móvil no cuenta);
// sin él, solo en pruebas (modo desarrollo) lo del móvil; si no, nada. Poner y quitar un aspecto es solo qué lleva puesto: siempre local.
// Fuera de lo activo no cambia nada: ni se ven aspectos ni se salta ningún anuncio.
'use strict';
AS.creaCompras = ({ datos, leer, escribe, activo = () => false, pruebas = () => false, sinAnuncios = () => false, tienda = {}, servidor = null }) => {
  const AT = AS.aspectosTienda, AM = AS.monedero;
  const sv = servidor || { listo: () => false, copia: AM.vacia(), compra: async () => AS.error('sin-cuenta'), refresca: async () => AS.error('sin-cuenta'), alCambiar: () => {} };
  const guarda = r => { if (r.ok) escribe(r.valor); return r; };
  const tiene = () => activo() && !!sinAnuncios();
  const fuente = () => (sv.listo() ? 'servidor' : pruebas() ? 'local' : 'nada');
  // el progreso como lo ve el jugador (Coronas, aspectos, Pack de inicio y lo puesto), según quién manda
  function vista() {
    const f = fuente(), p = leer();
    return f === 'local' ? p : AM.vista(datos, p, f === 'servidor' ? sv.copia : AM.vacia());
  }
  const sinFuente = () => AS.error('sin-cuenta');
  // lo que lleva puesto no es del servidor: solo se guarda qué lleva puesto cada tipo de héroe
  const guardaPuesto = r => { if (r.ok) escribe({ ...leer(), pieles: r.valor.pieles }); return r; };
  // un aspecto por el servidor: la misma regla que en local sirve para no mandar lo que no puede salir; quien cobra es el servidor
  async function compraEnServidor(id) {
    const antes = AT.compra(datos, vista(), id);
    if (!antes.ok) return antes;
    const p = AM.pedido(tienda, id);
    return p.ok ? sv.compra(p.valor) : p;
  }
  return {
    comprasActivas: activo,
    // lo que vale cada moneda para MONEDAS (core/js/sistema/monedas.js): 'comprada' = Coronas, 'ganada' = plumas
    saldo: cual => (cual === 'comprada' ? vista().coronas : leer().plumas),
    // MONEDAS.escribir (solo el puente de cambio, que Asalto no tiene): las Coronas con servidor no se escriben aquí
    ponSaldo(cual, n) {
      const v = Math.max(0, Math.floor(Number(n) || 0)), clave = cual === 'comprada' ? 'coronas' : 'plumas';
      if (clave === 'coronas' && fuente() !== 'local') return;
      escribe({ ...leer(), [clave]: v });
    },
    coronas: () => vista().coronas,
    aspectos: () => AT.escaparate(datos, vista()),
    // comprar un aspecto: con servidor, comprar_fijo; en pruebas, en local; si no, sin-cuenta. Siempre una promesa con AS.ok o el error
    async compraAspecto(id) {
      const f = fuente();
      if (f === 'servidor') return compraEnServidor(id);
      return f === 'local' ? guarda(AT.compra(datos, leer(), id)) : sinFuente();
    },
    ponAspecto: id => guardaPuesto(AT.pon(datos, vista(), id)),
    quitaAspecto: tipo => guardaPuesto(AT.quita(datos, vista(), tipo)),
    // el aspecto que lleva puesto un tipo de héroe (para dibujarlo); sin lo nuevo abierto, ninguno
    pielDe: tipo => (activo() ? AT.puesto(datos, vista(), tipo) : null),
    inicioComprado: () => vista().inicio,
    // ¿manda el servidor? (con él, la compra de prueba no vale: su saldo y sus aspectos no son los del móvil)
    conServidor: () => fuente() === 'servidor',
    // la compra de prueba del modo desarrollo: se entrega en local. Una compra real o de probador la entrega el servidor: adoptaDelServidor
    entregaDeProducto: producto => (fuente() === 'local' ? guarda(AS.coronas.entrega(datos, leer(), producto)) : AS.error(fuente() === 'servidor' ? 'prueba-con-servidor' : 'sin-cuenta')),
    // tras una compra con euros (que entrega el servidor): se pide el estado y se adopta lo que diga. AS.ok o el error con nombre
    adoptaDelServidor: () => sv.refresca(),
    alCambiarSaldo: f => sv.alCambiar(f),
    // «Sin anuncios»: ¿el botón de anuncio da el premio al tocarlo? (el derecho se lee de la cuenta)
    sinAnuncios: tiene,
    // el clic que pondría el anuncio: con «Sin anuncios» da el premio directo (visto: true, sin llamar a ver) y con el mismo tope de siempre,
    // porque quien da el premio es el mismo caso de uso de antes; sin él, pone el anuncio (ver(sitio) devuelve { visto }) y no cambia nada
    async verAnuncio(sitio, ver) { return tiene() ? { visto: true, directo: true } : ver(sitio); },
  };
};
