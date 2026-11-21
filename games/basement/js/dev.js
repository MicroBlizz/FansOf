// Fans of Basement · utilidades del panel DEV. El panel DEV de core (core/js/sistema/desarrollo.js) solo existe en la alfa y en
// localhost, nunca en la web publicada: lo que se toca aquí es solo para probar (monedas y paquetes de prueba, abrir toda la
// formación o todo el equipo, abrir departamentos, todas las armas, cambiar de cargo para ver el aspecto y empezar de cero).
'use strict';
const UTILIDADES_JUEGO = [{ titulo: 'Fans of Basement: pruebas', pinta(caja) {
  const estado = Object.assign(document.createElement('p'), { style: 'margin:4px 0;color:#ffe14a' });
  const pinta = () => { const p = SAVE.progreso; estado.textContent = 'Monedas ' + p.monedas + ' · Cursos ' + p.cursos.length + ' · Paquetes ' + p.paquetes.normal + '+' + p.paquetes.jefe + ' · Récord: planta -' + p.record; };
  const fila = () => { const d = document.createElement('div'); d.className = 'fila'; caja.append(d); return d; };
  const cambia = (f) => { const p = BAS.copiaProgreso(SAVE.progreso); f(p); SAVE.progreso = p; };
  const boton = (d, txt, f) => d.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => { cambia(f); basGuarda(); pinta(); } }));
  caja.append(estado);
  let d = fila();
  boton(d, '+100 monedas', (p) => { p.monedas += 100; });
  boton(d, '+10000 monedas', (p) => { p.monedas += 10000; });
  boton(d, '+5 paquetes de cada', (p) => { p.paquetes.normal += 5; p.paquetes.jefe += 5; });
  d = fila();
  boton(d, 'Toda la formación', (p) => { const vistos = new Set(); p.cursos = BAS.AJ.formacion.filter((c) => !c.grupo || (!vistos.has(c.grupo) && vistos.add(c.grupo))).map((c) => c.id); });
  boton(d, 'Todo el equipo y mascotas', (p) => {
    for (const h of Object.keys(BAS.AJ.equipo)) { for (const r of BAS.AJ.rarezas) p.equipo.tiene[h + ':' + r] = true; p.equipo.puesto[h] = 'legendario'; }
    for (const m of Object.keys(BAS.AJ.mascotas)) p.mascotas[m] = BAS.AJ.nivelMascota.max;
    p.mascota = 'dron';
  });
  d = fila();
  boton(d, 'Abrir todos los departamentos', (p) => { p.vencidos = [4, 9, 14, 19, 24]; });
  boton(d, 'Servidor arreglado (final)', (p) => { p.final = true; if (!p.vencidos.includes(24)) p.vencidos.push(24); });
  boton(d, 'Todas las armas', (p) => { for (const a of Object.keys(BAS.AJ.armas)) if (BAS.AJ.armas[a].rareza) p.armas[a] = BAS.AJ.nivelArma.max; });
  boton(d, 'Cargo +1 (aspecto)', (p) => { p.rango = (p.rango + 1) % BAS.AJ.rangos.length; });
  boton(d, 'Empezar de cero', (p) => Object.assign(p, BAS.progresoNuevo()));
  pinta();
} }];
