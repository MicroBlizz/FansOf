// Fans of Asalto · DOMINIO · Lo que hace la tirada de cada piedra de destino (ajustes-piedras.js, `extra`): todas son una tirada gratis
// con línea segura y algunas traen además lo suyo. Aquí: las runas de la tirada (la de la clase pone una fila de la clase elegida y la
// del comodín, una de comodines; tira: gastarla y sacar sus runas), lo que da al usarla (oro, esencia, vidas), cómo llega el héroe (nivel mínimo e improntas de una clase
// al azar), si llega su gemelo y la vida de menos del próximo jefe. Los encargos para después (suerte, mercader, verdugo) los guarda
// piedras.js. Puro: el azar llega de fuera; quien aplica todo es la partida.
'use strict';
AS.piedrasEfectos = (() => {
  const X = (datos, piedra) => AS.piedras.extra(datos, piedra);
  // ¿hay que elegir la clase antes de tirar? (Piedra de la clase)
  const pideClase = (datos, piedra) => !!X(datos, piedra).elige;
  // las runas de la tirada de piedra. eleccion: { clase } (solo para la que la pide). Devuelve AS.ok(columnas) o AS.error('elige-clase')
  function columnas(datos, piedra, pesos, eleccion, azar) {
    const x = X(datos, piedra);
    if (x.elige) {
      const clase = eleccion && eleccion.clase;
      return datos.clases[clase] ? AS.ok(AS.altar.conFila(AS.altar.tira(pesos, azar), azar.entero(3), clase)) : AS.error('elige-clase');
    }
    if (x.comodin) return AS.ok(AS.altar.conFila(AS.altar.tira(pesos, azar), azar.entero(3), AS.altar.COMODIN));
    return AS.ok(AS.altar.conLinea(AS.altar.tira(pesos, azar), pesos, azar));
  }
  // lo que da al usarla: { oro, esencia, vidas }
  function premio(datos, piedra) {
    const x = X(datos, piedra);
    return { oro: x.oro || 0, esencia: x.esencia || 0, vidas: x.vidas || 0 };
  }
  // el héroe que llega con la piedra: con su nivel mínimo y, si la piedra las trae, improntas de una clase al azar
  function heroe(datos, h, piedra, azar) {
    const x = X(datos, piedra), marcas = x.marcas ? { [azar.elige(Object.keys(datos.clases))]: x.marcas } : {};
    return AS.heroe.mejora(datos, h, { nivel: x.nivel || 0, marcas }).valor;
  }
  const gemela = (datos, piedra) => !!X(datos, piedra).gemela;
  // la tirada de la piedra i de la bolsa: AS.ok({ estado (la bolsa sin ella), piedra, columnas, premio }) o el error (sin piedra,
  // elige-clase). pesos: los de las runas del Altar; eleccion: { clase } para la que la pide
  function tira(datos, estado, i, pesos, eleccion, azar) {
    const r = AS.piedras.gasta(datos, estado, i);
    if (!r.ok) return r;
    const { piedra } = r.valor, cols = columnas(datos, piedra, pesos, eleccion, azar);
    return cols.ok ? AS.ok({ estado: r.valor.estado, piedra, columnas: cols.valor, premio: premio(datos, piedra) }) : cols;
  }
  // la oleada con el jefe mermado (Piedra del verdugo): sus enemigos jefe llevan `merma` (0 a 1), la vida de menos con la que empiezan
  const conMerma = (oleada, merma) => ({ ...oleada, enemigos: oleada.enemigos.map(e => (e.jefe ? { ...e, merma } : e)) });
  // la oleada con la que se sale a luchar: si trae jefe y hay verdugo pendiente, el jefe mermado y el encargo gastado. { estado, oleada }
  function aLuchar(estado, oleada) {
    if (!oleada.enemigos.some(e => e.jefe)) return { estado, oleada };
    const v = AS.piedras.usaVerdugo(estado);
    return { estado: v.estado, oleada: v.merma > 0 ? conMerma(oleada, v.merma) : oleada };
  }
  // la oferta nueva de la tienda: con el épico seguro si hay mercader pendiente (y el encargo gastado). { estado, tienda }
  function oferta(datos, estado, tienda, azar) {
    const m = AS.piedras.usaMercader(estado);
    return { estado: m.estado, tienda: (m.epico ? AS.tienda.ofertaConEpico : AS.tienda.ofertaNueva)(datos, tienda, azar) };
  }
  return { pideClase, columnas, premio, heroe, gemela, tira, conMerma, aLuchar, oferta };
})();
