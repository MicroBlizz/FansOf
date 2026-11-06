// Fans of Zombies · LOS SUPERVIVIENTES EN PANTALLA (pantalla): el refugio de la partida (la casa donde empiezas, con su despensa), los
// animales atrapados y los del refugio dibujados con los modelos de la serie, el cartel para rescatarlos y lo que se puede abrir. Las
// reglas están en js/rescates.js.
'use strict';
const RESCATES = { vistas: new Map(), despensa: null };
const OFICIO_TXT = { vigia: 'VIGÍA', cocinera: 'COCINERA', carpintera: 'CARPINTERA', medica: 'MÉDICA' };
// el refugio de una casa o edificio: su caja, sus puertas y ventanas y un sitio libre para la despensa
function refugioDe(C) {
  if (!C) return null;
  const d = libreCerca((C.x0 + C.x1) / 2, (C.z0 + C.z1) / 2, 0.6);
  return { x0: C.x0, z0: C.z0, x1: C.x1, z1: C.z1, huecos: BARRIO.huecos.filter((h) => h.casa === C.id).map((h) => h.id), despensa: { x: d.x, z: d.z } };
}
// un sitio libre al azar dentro de una caja (dentro de casas también), o null
function libreDentro(r, azar) {
  for (let k = 0; k < 25; k++) { const x = r.x0 + 0.8 + azar() * (r.x1 - r.x0 - 1.6), z = r.z0 + 0.8 + azar() * (r.z1 - r.z0 - 1.6); if (!choca(x, z, 0.5)) return { x, z }; }
  return null;
}
// lo que se puede abrir o hacer con F: la despensa del refugio y los atrapados que tienes cerca
function sitiosRefugio(e) {
  const out = [], R = e.refugio, J = e.jugador;
  if (R && R.despensa) out.push({ id: 'refugio', tipo: 'despensa', x: R.despensa.x, z: R.despensa.z });
  for (const s of e.rescates || []) if (s.estado === 'atrapado' && ZOM.dist(s.x, s.z, J.x, J.z) < 30) out.push({ id: 'sup:' + s.id, tipo: 'superviviente', x: s.x, z: s.z, s: s.id, animal: s.animal });
  return out;
}
function rescataA(e, sitio) {
  const r = ZOM.rescata(ZOM.AJ, e, sitio.s, MUNDO, azarJuego);
  if (!r.ok) e.eventos.push({ tipo: 'noPuedes', codigo: r.codigo });
}
// cada fotograma: los animales (atrapados, en el refugio o caídos) y la caja de la despensa
function pintaRescates(e, dt) {
  pintaDespensa(e.refugio);
  for (const s of e.rescates || []) {
    let v = RESCATES.vistas.get(s.id);
    if (!v) { v = { mod: montaPersonaje(s.animal, true), fase: Math.random() * 6 }; MOTOR.escena.add(v.mod.grupo); RESCATES.vistas.set(s.id, v); }
    const g = v.mod.grupo, muerto = s.estado === 'muerto';
    v.fase += dt * (s.estado === 'atrapado' ? 5 : 1.5);
    g.position.set(s.x, muerto ? 0.3 : 0, s.z); g.rotation.x = muerto ? -Math.PI / 2 : 0;
    g.rotation.y = s.estado === 'atrapado' ? Math.sin(v.fase) * 0.6 : Math.sin(v.fase * 0.3) * 1.5;   // el atrapado mira a todos lados
    g.scale.setScalar(v.mod.escala);
    animaPersonaje(v.mod, v.fase, false);
  }
}
function pintaDespensa(R) {
  if (!R || !R.despensa) { if (RESCATES.despensa) RESCATES.despensa.visible = false; return; }
  if (!RESCATES.despensa) {
    const o = new Obra(); o.caja(1.1, 0.7, 0.7, 0x6a8a4a, 0, 0.35, 0); o.caja(1.15, 0.1, 0.75, 0x4a6a3a, 0, 0.72, 0); o.caja(0.3, 0.12, 0.05, 0xf9c531, 0, 0.45, 0.36);
    RESCATES.despensa = o.hecha(); MOTOR.escena.add(RESCATES.despensa);
  }
  RESCATES.despensa.visible = true; RESCATES.despensa.position.set(R.despensa.x, 0, R.despensa.z);
}
function limpiaRescates() { for (const v of RESCATES.vistas.values()) MOTOR.escena.remove(v.mod.grupo); RESCATES.vistas.clear(); if (RESCATES.despensa) RESCATES.despensa.visible = false; }
// el panel del refugio en la mochila (quién hay y qué hace)
function htmlRefugio(e) {
  const AJ = ZOM.AJ, en = (e.rescates || []).filter((s) => s.estado !== 'atrapado');
  if (!en.length) return '<div class="vm-ref"><b>' + esc(tr('REFUGIO')) + '</b><p class="vm-ayuda">' + esc(tr('Rescata supervivientes y vivirán en tu refugio.')) + '</p></div>';
  return '<div class="vm-ref"><b>' + esc(tr('REFUGIO')) + '</b>' + en.map((s) => '<p class="' + (s.estado === 'muerto' ? 'muerto' : '') + '">' + esc(AJ.animales[s.animal].n) + ' · ' + esc(s.estado === 'muerto' ? tr('CAÍDO') : tr(OFICIO_TXT[ZOM.oficioDe(AJ, s.animal)])) + (s.estado === 'muerto' ? '' : ' · ' + Math.ceil(s.vida)) + '</p>').join('') + '</div>';
}
