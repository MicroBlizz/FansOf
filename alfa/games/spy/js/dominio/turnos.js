// Fans of Spy · DOMINIO · El orden de los turnos y el final de la planta. Cada guardia y cada cámara lleva su reloj: `listo` es el
// momento en que le vuelve a tocar. El agente gasta coste con sus cartas y, mientras tanto, actúan todos los que tengan su momento
// antes o a la vez (en empate, van primero los demás). «Esperar» (acabar el turno sin jugar cartas) deja actuar a los demás hasta
// que pasa algo que se ve. Aquí está también la nota de C a S y los Clips que da.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const G = S.guardias;

  // Los demás (guardias en pie y cámaras), por orden de a quién le toca antes.
  function otros(p) {
    const lista = [];
    p.guardias.forEach((g, i) => { if (g.estado !== 'derribado') lista.push({ id: g.id, clase: 'guardia', tipo: g.tipo, listo: g.listo, ref: g, orden: i }); });
    p.camaras.forEach((cam, i) => { lista.push({ id: cam.id, clase: 'camara', tipo: 'camara', listo: cam.listo, ref: cam, orden: 100 + i }); });
    return lista.sort((a, b) => a.listo - b.listo || a.orden - b.orden);
  }

  // La nota de la planta: 100 puntos menos las alertas, los guardias derribados que otro encontró y los turnos de más. La S pide cero alertas.
  function nota(aj, planta, p) {
    const N = aj.nota, k = p.cuenta;
    const puntos = Math.max(0, 100 - N.alerta * k.alertas - N.cuerpo * k.cuerposVistos - N.turno * Math.max(0, k.turnos - planta.par));
    let letra = N.cortes.find((corte) => puntos >= corte[1])[0];
    if (letra === 'S' && k.alertas > 0) letra = 'A';
    return { nota: letra, puntos, clips: N.clips[letra] + N.secreto * k.secretos };
  }

  // Se acaba la planta: 'meta' (el agente llega a la puerta, con su nota) o 'caido' (se queda sin vida).
  function termina(c, como) {
    if (c.p.fin) return;
    c.p.fin = como === 'meta' ? { como, ...nota(c.aj, c.planta, c.p) } : { como, nota: null, puntos: 0, clips: 0 };
    c.p.eventos.push({ t: 'fin', ...c.p.fin });
  }

  function actua(c, s) {
    s.ref.listo += s.clase === 'guardia' ? G.turnoGuardia(c, s.ref) : G.turnoCamara(c, s.ref);
    if (c.p.agente.vida <= 0) termina(c, 'caido');
  }

  // Deja actuar a los demás. Normal: todos los que tengan su momento en `hasta` o antes. Esperando: hasta que uno haga algo que
  // se vea (y con él, los que actúan en ese mismo momento), con un tope de turnos ajenos. Devuelve el momento en que le vuelve
  // a tocar al agente.
  function corre(c, hasta, espera) {
    const p = c.p;
    let ahora = p.reloj, n = 0, visto = false;
    for (let s = otros(p)[0]; s && !p.fin; s = otros(p)[0]) {
      if (espera ? ((visto && s.listo > ahora) || n >= c.aj.turno.esperas) : s.listo > hasta) break;
      const antes = p.eventos.length;
      ahora = Math.max(ahora, s.listo); n++;
      actua(c, s);
      visto = visto || p.eventos.length > antes;
    }
    if (!espera) return hasta;
    return n ? ahora : p.reloj + c.aj.turno.minimo;
  }

  // Para la barra de turnos: los demás con lo que les falta (`en`) y en cuánto vuelve a tocarle al agente si acaba ahora el turno
  // habiendo gastado, además, `previsto` (la carta que tiene elegida). vuelve = null es «esperar»: hasta que pase algo.
  function orden(aj, p, previsto = 0) {
    const gasto = p.turno.gasto + previsto, espera = !p.turno.jugadas && !gasto;
    const lista = otros(p).map((s) => ({ id: s.id, clase: s.clase, tipo: s.tipo, estado: s.ref.estado || null, en: Math.max(0, s.listo - p.reloj) }));
    return { lista, vuelve: espera ? null : Math.max(aj.turno.minimo, gasto) };
  }

  S.turnos = Object.freeze({ otros, corre, orden, nota, termina });
})(SPY);
