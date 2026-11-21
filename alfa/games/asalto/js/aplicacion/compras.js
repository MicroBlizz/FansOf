// Fans of Asalto · APLICACIÓN · Las compras (ADR 200, tarea #317): las Coronas, los aspectos de héroe, lo que entregan los productos con
// euros y «Sin anuncios». Se monta dentro de AS.creaCasos (casos.js) con sus puertos y sus casos de uso se mezclan con los de allí:
//   leer() el progreso de ahora · escribe(p) lo guarda · activo() ¿está abierto lo nuevo? (modo desarrollo, preguntado cada vez)
//   sinAnuncios() ¿tiene el derecho «sin-anuncios»? (core: DERECHOS)
// Fuera de lo activo no cambia nada: ni se ven aspectos, ni dan Coronas los logros, ni se salta ningún anuncio.
'use strict';
AS.creaCompras = ({ datos, leer, escribe, activo = () => false, sinAnuncios = () => false }) => {
  const AT = AS.aspectosTienda;
  const guarda = r => { if (r.ok) escribe(r.valor); return r; };
  const tiene = () => activo() && !!sinAnuncios();
  return {
    comprasActivas: activo,
    // lo que vale cada moneda para MONEDAS (core/js/sistema/monedas.js): 'comprada' = Coronas, 'ganada' = plumas
    saldo: cual => (cual === 'comprada' ? leer().coronas : leer().plumas),
    ponSaldo(cual, n) { const v = Math.max(0, Math.floor(Number(n) || 0)); escribe({ ...leer(), [cual === 'comprada' ? 'coronas' : 'plumas']: v }); },
    coronas: () => leer().coronas,
    aspectos: () => AT.escaparate(datos, leer()),
    compraAspecto: id => guarda(AT.compra(datos, leer(), id)),
    ponAspecto: id => guarda(AT.pon(datos, leer(), id)),
    quitaAspecto: tipo => guarda(AT.quita(datos, leer(), tipo)),
    // el aspecto que lleva puesto un tipo de héroe (para dibujarlo); sin lo nuevo abierto, ninguno
    pielDe: tipo => (activo() ? AT.puesto(datos, leer(), tipo) : null),
    inicioComprado: () => leer().inicio,
    // la compra de prueba del modo desarrollo: se entrega en local. Una compra real o de probador la entrega el servidor: adopta lo que dice
    entregaDeProducto: producto => guarda(AS.coronas.entrega(datos, leer(), producto)),
    adoptaDelServidor(estado) { escribe(AS.coronas.adopta(datos, leer(), estado)); return AS.ok(true); },
    // «Sin anuncios»: ¿el botón de anuncio da el premio al tocarlo? (el derecho se lee de la cuenta)
    sinAnuncios: tiene,
    // el clic que pondría el anuncio: con «Sin anuncios» da el premio directo (visto: true, sin llamar a ver) y con el mismo tope de siempre,
    // porque quien da el premio es el mismo caso de uso de antes; sin él, pone el anuncio (ver(sitio) devuelve { visto }) y no cambia nada
    async verAnuncio(sitio, ver) { return tiene() ? { visto: true, directo: true } : ver(sitio); },
  };
};
