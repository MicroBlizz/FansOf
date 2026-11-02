// Fans of Nova · La flota que trabaja mientras no juegas (adaptador de NV.Flota, dominio/flota.js): qué naves puedes reclutar, en qué
// sectores pueden minar, la hora (la del servidor si se puede, core/js/sistema/hora.js) y guardar. Las pantallas están en flota-ui.js.
// Diseño: docs/nova/idle-flota.md.
'use strict';
const NV_FLOTA_FUERA = 3600000;   // fuera más de una hora: al volver sale el informe
function nvFlota() { const c = nvCamp(); return c.flota || (c.flota = NV.Flota.nueva()); }
// La hora de la flota: la del servidor si se ha podido saber, y nunca antes de la última que se vio (el reloj no va hacia atrás)
function nvFlotaAhora() { return Math.max(HORA.ahora(), nvFlota().visto || 0); }

// Las naves que puedes reclutar: las 6 unidades de tu facción y las de cada facción a la que le has liberado un sector
function nvFlotaFacciones() {
  const c = nvCamp(), out = [c.faccion];
  for (const k of c.libres) { const d = NVP.gal[k] && NVP.gal[k].dueno; if (d && NV_FACCIONES.includes(d) && !out.includes(d)) out.push(d); }
  return out;
}
function nvFlotaCandidatas() {
  return nvFlotaFacciones().flatMap(f => ((typeof FACTIONS !== 'undefined' && FACTIONS[f] && FACTIONS[f].units) || []).map(u => ({ id: f + '-' + u, fac: f, unidad: u })));
}
const nvFlotaNombre = u => (typeof CFG !== 'undefined' && CFG.cards[u] ? CFG.cards[u].name : u);

// Los sectores donde se puede minar: los que has liberado (tu base incluida), con lo que rinde su tipo
function nvFlotaSectores() {
  return nvCamp().libres.filter(k => NVP.gal[k]).map(k => ({ id: k, tipo: NVP.gal[k].tipo, rinde: (NOVA_FLOTA.trabajos.minar.sectores[NVP.gal[k].tipo] || 1) }));
}

// ---------- lo que se hace desde las pantallas: cada una guarda y devuelve si se pudo ----------
function nvFlotaSuma(total) { const c = nvCamp(); c.aleacion += total.aleacion || 0; return total.aleacion || 0; }
function nvFlotaRecoge() {
  const x = nvFlotaSuma(NV.Flota.recoge(nvFlota(), nvFlotaAhora(), NOVA_FLOTA));
  nvCampGuarda();
  return x;
}
function nvFlotaRecluta(id) { const ok = NV.Flota.recluta(nvCamp(), nvFlota(), id, NOVA_FLOTA); if (ok) nvCampGuarda(); return ok; }
function nvFlotaAsigna(id, sector) {
  const s = sector && NVP.gal[sector], r = NV.Flota.asigna(nvFlota(), id, sector ? 'minar' : null, sector, s ? s.tipo : null, nvFlotaAhora(), NOVA_FLOTA);
  if (!r) return false;
  nvFlotaSuma(r); nvCampGuarda();
  return true;
}
function nvFlotaSubeNivel(id) {
  const r = NV.Flota.subeNivel(nvCamp(), nvFlota(), id, nvFlotaAhora(), NOVA_FLOTA);
  if (!r) return false;
  nvFlotaSuma(r); nvCampGuarda();
  return true;
}
function nvFlotaMejora(m) {
  const fl = nvFlota(), c = nvCamp(), coste = NV.Flota.coste(fl, m, NOVA_FLOTA);
  if (coste === null || c.aleacion < coste) return false;   // sin poder comprarla no se recoge nada
  nvFlotaSuma(NV.Flota.recoge(fl, nvFlotaAhora(), NOVA_FLOTA));   // antes de mejorar se recoge, para que la mejora no cuente hacia atrás
  const ok = NV.Flota.mejora(c, fl, m, NOVA_FLOTA);
  nvCampGuarda();
  return ok;
}

// ---------- al abrir: ¿sale el informe? ----------
// Devuelve lo pendiente si llevas más de una hora fuera y hay algo que recoger; apunta la visita en cualquier caso.
function nvFlotaAlVolver(ahora) {
  const fl = nvFlota(), fuera = ahora - (fl.visto || ahora), p = NV.Flota.pendiente(fl, ahora, NOVA_FLOTA);
  fl.visto = Math.max(fl.visto || 0, ahora);
  return fuera >= NV_FLOTA_FUERA && p.total.aleacion > 0 ? Object.assign(p, { fuera }) : null;
}
