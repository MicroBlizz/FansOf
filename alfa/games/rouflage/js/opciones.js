// Fans of Rouflage · OPCIONES DEL MÓVIL (pantalla OPCIONES): gráficos (AUTO, ALTA, NORMAL, BAJA), ahorro de batería (30 FPS),
// vibración, tamaño de los botones de la partida, el chat (chat-frases.js), salir en el escenario de la semana (en SAVE) y mano izquierda. Se guardan en el navegador (claves 'rouflage-op-…') y se aplican
// al momento. Los gráficos solo cambian la nitidez (DPR del lienzo, principal.js) y unos pocos adornos (graficosAdornos): la
// pintura de los personajes, el suelo, la luz y todo lo que cuenta para jugar se ven igual en todas las calidades.
'use strict';

const OPC_CALIDADES = ['alta', 'normal', 'baja'];
const opLee = (k, def, vale) => { try { const v = localStorage.getItem('rouflage-op-' + k); return v !== null && (!vale || vale.includes(v)) ? v : def; } catch (_) { return def; } };
const opGuarda = (k, v) => { try { localStorage.setItem('rouflage-op-' + k, String(v)); } catch (_) { /* sin guardar: vale para esta visita */ } };
const OPC = {
  graficos: opLee('graficos', 'auto', ['auto', ...OPC_CALIDADES]),
  auto: opLee('graficos-auto', '', OPC_CALIDADES),      // lo que eligió AUTO la última vez que midió
  bateria: opLee('bateria', '0') === '1', vibra: opLee('vibracion', '1') === '1',
  botones: opLee('botones', 'normal', ['normal', 'grande']), zurdo: opLee('zurdo', '0') === '1',
  chat: opLee('chat', '1') === '1',      // el chat (chat-*.js): frases rápidas en partida y el de la sala de espera
};
const opMovil = () => matchMedia('(pointer: coarse)').matches;
const opPorDefecto = () => (opMovil() ? 'normal' : 'alta');      // AUTO, antes de medir: Normal en el móvil, Alta en el ordenador
function calidadGraficos() { return OPC.graficos !== 'auto' ? OPC.graficos : OPC.auto || opPorDefecto(); }
// la nitidez del lienzo: Alta como siempre (hasta 2), Normal hasta 1,5 y Baja 1 (cuatro veces menos píxeles que pintar que Alta en un móvil normal).
// La llama ajusta() (principal.js) cada vez que cambia algo, y de paso apunta el nivel de adornos para no calcularlo en cada fotograma.
let _opNivel = 0;
function dprGraficos() { const d = window.devicePixelRatio || 1, q = calidadGraficos(); _opNivel = OPC_CALIDADES.indexOf(q); return Math.min(d, q === 'baja' ? 1 : q === 'normal' ? 1.5 : 2); }
// los adornos que se quitan: 0 = todos (Alta), 1 = algunos menos (Normal), 2 = solo lo imprescindible (Baja). Nunca la pintura, el suelo, la luz ni las pistas
const graficosAdornos = () => _opNivel;

// AUTO: en los primeros segundos de cada partida mide los FPS de verdad; si va lento baja un escalón (o dos si va muy lento),
// y si va sobrado sube uno, como mucho hasta lo de por defecto. Se apunta para la próxima vez.
const OPC_MIDE = { fase: '', t: 0, medido: 0, n: 0, hecho: false };
function opMide(dtReal) {
  const m = OPC_MIDE, juega = (J.fase === 'prep' || J.fase === 'caza') && !J.pausa && !document.hidden;
  if (J.fase !== m.fase) { if (J.fase === 'prep' || J.fase === 'titulo' || J.fase === 'paseo') m.hecho = false; m.fase = J.fase; m.t = m.medido = m.n = 0; }
  if (OPC.graficos !== 'auto' || m.hecho || !juega || dtReal <= 0 || dtReal > 0.5) return;
  m.t += dtReal; if (m.t < 1.5) return;      // el primer segundo y medio no cuenta (se está montando todo)
  m.medido += dtReal; m.n++; if (m.medido < 5) return;
  m.hecho = true;
  const fps = m.n / m.medido, q = calidadGraficos(), i = OPC_CALIDADES.indexOf(q), tope = OPC_CALIDADES.indexOf(opPorDefecto());
  let n = i;
  if (fps < (OPC.bateria ? 22 : 26)) n = 2; else if (fps < (OPC.bateria ? 26 : 42)) n = Math.min(2, i + 1);
  else if (!OPC.bateria && fps >= 56 && i > tope) n = i - 1;
  if (n !== i) { OPC.auto = OPC_CALIDADES[n]; opGuarda('graficos-auto', OPC.auto); ajusta(); opPinta(); }
}

// la vibración en los momentos clave: se mira qué ha cambiado de un fotograma a otro (vale igual contra bots y por internet)
const OPC_VIB = { yo: null };
const vibra = patron => { if (OPC.vibra && navigator.vibrate) try { navigator.vibrate(patron); } catch (_) { /* sin vibración */ } };
function opVibra() {
  const yo = J.yo, v = OPC_VIB;
  if (!yo || !(J.fase === 'prep' || J.fase === 'caza')) { v.yo = null; return; }
  const ahora = { fuera: !!yo.fuera, balas: yo.balas, aciertos: yo.pts ? yo.pts.aciertos : 0, apunta: yo.tApunta || 0 };
  if (v.yo === yo) {
    if (ahora.fuera && !v.fuera) vibra([90, 60, 200]);      // te despiden
    else if (yo.clase === 'cazador') {
      if (ahora.apunta > v.apunta + 0.3) vibra(15);      // disparas
      if (ahora.aciertos > v.aciertos) vibra([40, 40, 70]);      // aciertas
      else if (ahora.balas < v.balas) vibra(130);      // fallas: carta perdida
    }
    if (yo.clase === 'camaleon' && J.fase === 'caza' && !ahora.fuera) {      // te ven: el peligro se dispara
      if (!v.visto && J.peligro > 0.75) { v.visto = true; vibra([30, 50, 30]); } else if (J.peligro < 0.45) v.visto = false;
    }
  } else v.visto = false;
  Object.assign(v, ahora); v.yo = yo;
}

// se llama en cada fotograma (principal.js); con el ahorro de batería dice si este toca saltárselo (máximo 30 FPS)
let _opUltimo = 0;
function opcionesFotograma(ahora) {
  if (OPC.bateria && _opUltimo && ahora - _opUltimo < 1000 / 30 - 3) return false;
  const dt = _opUltimo ? (ahora - _opUltimo) / 1000 : 0; _opUltimo = ahora;
  opMide(dt); opVibra();
  return true;
}

// la pantalla
const OPC_NOTA = {
  alta: () => tr('Máxima nitidez. Para móviles potentes y ordenadores.'),
  normal: () => tr('Un poco menos nítido y con menos adornos: va más suelto.'),
  baja: () => tr('Menos nítido y sin adornos, para móviles sencillos. Lo que importa para jugar se ve igual.'),
};
const OPC_NOMBRE = { alta: () => tr('ALTA'), normal: () => tr('NORMAL'), baja: () => tr('BAJA') };
function opPinta() {
  const marca = (id, v) => { for (const b of document.querySelectorAll('#' + id + ' button')) { const si = b.dataset.v === String(v); b.classList.toggle('activo', si); b.setAttribute('aria-pressed', si ? 'true' : 'false'); } };
  marca('op-graficos', OPC.graficos); marca('op-bateria', OPC.bateria ? 1 : 0); marca('op-vibracion', OPC.vibra ? 1 : 0);
  marca('op-botones', OPC.botones); marca('op-zurdo', OPC.zurdo ? 1 : 0); marca('op-chat', OPC.chat ? 1 : 0);
  marca('op-semana', SAVE.escNoSemana ? 0 : 1);      // salir o no en el ESCENARIO DE LA SEMANA (visita.js): va en la partida guardada
  const q = calidadGraficos();
  E('op-graficos-nota').textContent = OPC.graficos === 'auto' ? tr('Elige sola según lo rápido que vaya la partida. Ahora: {q}.', { q: OPC_NOMBRE[q]() }) : OPC_NOTA[q]();
  document.body.classList.toggle('op-grandes', OPC.botones === 'grande');
  document.body.classList.toggle('op-zurdo', OPC.zurdo);
}
function preparaOpciones() {
  const elige = (id, fn) => { for (const b of document.querySelectorAll('#' + id + ' button')) b.onclick = () => { play('select'); fn(b.dataset.v); opPinta(); }; };
  elige('op-graficos', v => { OPC.graficos = v; opGuarda('graficos', v); OPC_MIDE.hecho = false; ajusta(); });
  elige('op-bateria', v => { OPC.bateria = v === '1'; opGuarda('bateria', v); });
  elige('op-vibracion', v => { OPC.vibra = v === '1'; opGuarda('vibracion', v); if (OPC.vibra) vibra(40); });
  elige('op-botones', v => { OPC.botones = v; opGuarda('botones', v); });
  elige('op-zurdo', v => { OPC.zurdo = v === '1'; opGuarda('zurdo', v); });
  elige('op-semana', v => { SAVE.escNoSemana = v === '0'; guardaPartida(); if (typeof escPublica === 'function') escPublica(); });      // se vuelve a publicar con la marca (ns)
  for (const b of document.querySelectorAll('#op-chat button')) b.onclick = () => { if ((b.dataset.v === '1') !== OPC.chat) chatPon(b.dataset.v === '1'); };      // chat-frases.js: lo guarda y repinta los paneles
  E('op-fila-vibracion').hidden = !navigator.vibrate;      // en el iPhone el navegador no deja vibrar: mejor no enseñarlo
  opPinta();
}
