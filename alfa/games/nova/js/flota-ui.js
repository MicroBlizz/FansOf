// Fans of Nova · Pantallas de la flota: la pantalla FLOTA (reclutar, poner a minar en un sector liberado, subir de nivel, mejoras y
// recoger) y el informe «Mientras estabas fuera» al abrir la campaña. Reglas en dominio/flota.js; datos y guardado en flota-nova.js.
'use strict';
const NV_TIPO_NOMBRE = k => tr((NV_TIPOS_SECTOR[k] || {}).nombre || k);

// El dibujo de una nave de la flota: la nave de su facción, pequeña (hasta que haya retratos propios)
function nvFlotaIcono(fac, tam) {
  const cv = document.createElement('canvas'), d = tam * 2, c = cv.getContext('2d'), casco = (NOVA_FACCIONES[fac] && NOVA_FACCIONES[fac].nave && NOVA_FACCIONES[fac].nave.casco) || fac;
  cv.width = cv.height = d; cv.style.width = cv.style.height = tam + 'px';
  const im = NOVA_PIEZAS.cascos[casco] && nvNaveImagen(casco, 0);
  if (im) c.drawImage(im, NV_SOMBRA_L * 0.3, NV_SOMBRA_L * 0.3, NV_SOMBRA_L * 0.4, NV_SOMBRA_L * 0.4, 0, 0, d, d);
  else { c.beginPath(); c.arc(d / 2, d / 2, d * 0.4, 0, 6.283); c.fillStyle = NV_FAC_COLOR[fac]; c.fill(); }
  return cv;
}

// ---------- la pantalla FLOTA ----------
function nvFlotaMenu() {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('FLOTA')));
  nvCabecera(p);
  const fl = nvFlota(), ahora = nvFlotaAhora(), pend = NV.Flota.pendiente(fl, ahora, NOVA_FLOTA);
  p.appendChild(nvEl('nv-cdet', tr('Tus naves minan aleación en los sectores que has liberado mientras no juegas. La bodega se llena en {h} horas.', { h: NV.Flota.topeHoras(fl, NOVA_FLOTA) })));
  p.appendChild(nvEl('nv-cdet', tr('Trabajando') + ': ' + NV.Flota.trabajando(fl).length + ' / ' + NV.Flota.maxNaves(fl, NOVA_FLOTA) + (pend.llena ? ' · ' + tr('Bodega llena') : '')));
  const rec = nvEl('btn-big ol nv-ok', tr('RECOGER') + ' · ' + (pend.total.aleacion || 0) + ' ' + tr('Aleación'), 'button');
  rec.disabled = !pend.total.aleacion;
  rec.onclick = () => { nvFlotaRecoge(); play('crown'); nvFlotaMenu(); };
  p.appendChild(rec);
  for (const n of nvFlotaCandidatas()) p.appendChild(nvFlotaCarta(n, fl, pend));
  p.appendChild(nvEl('nv-cdet', tr('Patrullar y Escoltar: próximamente.')));
  nvFlotaMejoras(p, fl);
  const v = nvEl('nv-boton', tr('Volver a la galaxia'), 'button'); v.onclick = nvGalaxiaMenu; p.appendChild(v);
  cont.appendChild(p);
}
function nvFlotaCarta(n, fl, pend) {
  const b = nvEl('nv-carta nv-flota'), N = fl.naves[n.id], c = nvCamp();
  b.style.setProperty('--col', NV_FAC_COLOR[n.fac]);
  b.appendChild(nvEl('nv-cnom', tr(nvFlotaNombre(n.unidad)) + (N ? ' · ' + tr('Nivel') + ' ' + N.nivel : '')));
  const botones = nvEl('nv-flota-bot');
  const boton = (txt, fn, no) => { const x = nvEl('btn-ghost ol', txt, 'button'); x.disabled = !!no; x.onclick = () => { if (fn()) { play('select'); nvFlotaMenu(); } }; botones.appendChild(x); };
  if (!N) {
    const p = NV.Flota.costeRecluta(fl, NOVA_FLOTA);
    b.appendChild(nvEl('nv-cdet', tr('Sin reclutar')));
    boton(p ? tr('Reclutar') + ' · ' + p : tr('Reclutar gratis'), () => nvFlotaRecluta(n.id), c.aleacion < p);
  } else {
    b.appendChild(nvEl('nv-cdet', N.trabajo ? tr('Minando en') + ' ' + NV_TIPO_NOMBRE(N.tipo) + ' · ' + ((pend.naves[n.id] || {}).cantidad || 0) + ' ' + tr('Aleación') : tr('En el hangar')));
    if (N.trabajo) boton(tr('Retirar'), () => nvFlotaAsigna(n.id, null));
    else boton(tr('Minar'), () => { nvFlotaEligeSector(n.id); return false; }, NV.Flota.trabajando(fl).length >= NV.Flota.maxNaves(fl, NOVA_FLOTA));
    const k = NV.Flota.costeNivel(N, NOVA_FLOTA);
    boton(k === null ? tr('Al máximo') : tr('Subir nivel') + ' · ' + k, () => nvFlotaSubeNivel(n.id), k === null || c.aleacion < k);
  }
  b.appendChild(botones);
  b.prepend(nvFlotaIcono(n.fac, 44));
  return b;
}
// Elegir en qué sector liberado mina: cada uno con lo que rinde su tipo
function nvFlotaEligeSector(id) {
  const c = nvVentana(tr('¿DÓNDE MINA?')), l = nvEl('opt-list');
  for (const s of nvFlotaSectores()) {
    const b = nvEl('btn-ghost ol', NV_TIPO_NOMBRE(s.tipo) + ' ' + s.id + (s.rinde !== 1 ? ' · ×' + s.rinde : ''), 'button');
    b.onclick = () => { if (nvFlotaAsigna(id, s.id)) play('select'); nvCierraVentana(); nvFlotaMenu(); };
    l.appendChild(b);
  }
  c.appendChild(nvEl('nv-cdet', tr('Los cinturones de asteroides rinden más y los pecios, menos.')));
  c.appendChild(l);
}
const NV_FLOTA_MEJORAS = { bodega: ['Bodega', 'Más horas hasta llenarse'], velocidad: ['Velocidad de minado', 'Todas las naves producen más'], naves: ['Hangar de la flota', 'Más naves trabajando a la vez'] };
function nvFlotaMejoras(p, fl) {
  p.appendChild(nvEl('nv-cnom', tr('Mejoras de la flota')));
  for (const m in NV_FLOTA_MEJORAS) {
    const k = NV.Flota.nivel(fl, m), coste = NV.Flota.coste(fl, m, NOVA_FLOTA), [nombre, txt] = NV_FLOTA_MEJORAS[m];
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', '#ffd93d');
    b.appendChild(nvEl('nv-ctipo', tr('Nivel') + ' ' + k + '/' + NOVA_FLOTA.mejoras[m].max));
    b.appendChild(nvEl('nv-cnom', tr(nombre)));
    b.appendChild(nvEl('nv-cdet', tr(txt)));
    b.appendChild(nvEl('nv-cdet', coste === null ? tr('Al máximo') : tr('Mejorar') + ': ' + coste + ' ' + tr('de aleación')));
    b.disabled = coste === null || nvCamp().aleacion < coste;
    b.onclick = () => { if (nvFlotaMejora(m)) { play('select'); nvFlotaMenu(); } };
    p.appendChild(b);
  }
}

// ---------- el informe al abrir la campaña ----------
// Primero pide la hora del servidor; si llevas más de una hora fuera y hay algo, sale el informe; si no, sigue `luego` (el parte de
// guerra), que también sale después de recoger porque recoger vuelve a abrir la galaxia.
function nvAlAbrirCampana(luego) {
  HORA.sincroniza().then(() => {
    if (!document.querySelector('.nv-galaxia')) return;   // mientras llegaba la hora se fue a otra pantalla: ya saldrá al volver
    const inf = nvFlotaAlVolver(nvFlotaAhora());
    nvCampGuarda();
    if (inf) nvFlotaInforme(inf); else luego();
  });
}
function nvFlotaInforme(inf) {
  const c = nvVentana(tr('TU FLOTA'));
  const h = Math.floor(inf.fuera / 3600000);
  c.appendChild(nvEl('nv-cnom', tr('Tu flota ha minado {n} de aleación', { n: inf.total.aleacion })));
  c.appendChild(nvEl('nv-cdet', tr('Has estado fuera {h} horas.', { h }) + (inf.llena ? ' ' + tr('La bodega ya estaba llena: con una visita al día basta.') : '')));
  if (nvFrenteActivo()) {
    const est = nvFrenteHoy(), i = est.ranking.findIndex(x => x.faccion === nvPatron()), quedan = 6 - (new Date().getDay() + 6) % 7;
    if (i >= 0) c.appendChild(nvEl('nv-cdet', tr('Galaxia de la comunidad') + ': ' + tr(NOVA_CASCOS.facciones[nvPatron()].nombre) + ' ' + tr('va {p}.ª', { p: i + 1 }) + ' · ' + (quedan ? tr('Quedan {n} días.', { n: quedan }) : tr('Hoy es el último día.'))));
  }
  const ok = nvEl('btn-big ol nv-ok', tr('RECOGER TODO'), 'button');
  ok.onclick = () => { nvFlotaRecoge(); play('crown'); nvCierraVentana(); nvGalaxiaMenu(); };   // la galaxia vuelve a abrir y sigue con el parte
  c.appendChild(ok);
}
