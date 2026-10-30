// Fans of Nova · Arsenal: el pool de cartas de la campaña. Empieza con las armas básicas; el Arsenal de la nave capital desbloquea armas y módulos nuevos,
// y desde aquí se pagan retiradas (cada una cuesta más) y subidas de probabilidad. Sin campaña (simulador) todo está disponible.
'use strict';
const NV_ARS_NIVEL = { comun: 1, rara: 2, epica: 3, legendaria: 4 };   // nivel del Arsenal que desbloquea cada rareza
const NV_ARS_BUFF_MAX = 5, NV_ARS_BUFF_PASO = 0.5;                     // cada subida de probabilidad suma +50 % de peso
let NV_ARS_CACHE = null;
function nvArsenalEntradas() {
  if (NV_ARS_CACHE) return NV_ARS_CACHE;
  const out = [];
  for (const p in NOVA_ARMAS.portadores) {
    out.push({ id: 'arma:' + p + ':base', tipo: 'arma', portador: p, variante: null, nombre: NOVA_ARMAS.portadores[p].nombre, rareza: 'comun', nivel: 0, txt: NOVA_ARMAS.portadores[p].fuerte, ic: ['arma', p] });
    for (const v of NOVA_VARIANTES) if (v.portador === p && v.tipoArma !== 'insignia') out.push({ id: 'arma:' + p + ':' + v.id, tipo: 'arma', portador: p, variante: v.id, nombre: v.nombre, rareza: v.rareza, nivel: v.faccion ? 0 : NV_ARS_NIVEL[v.rareza], txt: v.efecto, ic: ['arma', v.id], fac: v.faccion ? v : null });
  }
  out.push({ id: 'def:escudo', tipo: 'def', nombre: 'Escudo', rareza: 'rara', nivel: 1, txt: 'Absorbe daño y se regenera', ic: ['sis', 'escudo'] });
  out.push({ id: 'def:blindaje', tipo: 'def', nombre: 'Blindaje', rareza: 'rara', nivel: 2, txt: 'Recibes menos daño', ic: ['sis', 'blindaje'] });
  for (const m of NV_MEJORAS_SISTEMA) out.push({ id: 'sis:' + m.id, tipo: 'sis', nombre: m.titulo, rareza: 'comun', nivel: 0, txt: m.detalle, ic: ['sis', m.id] });
  NV_ARS_CACHE = out;
  return out;
}
function nvArsEntrada(id) { return nvArsenalEntradas().find(e => e.id === id); }
function nvArsEstado() { const c = nvCamp(); if (!c.arsenal) c.arsenal = { ret: {}, buff: {} }; return c.arsenal; }
function nvArsDesbloqueada(e) { return nvNivelCapital('arsenal') >= e.nivel && (!e.fac || nvFacArmaLibre(e.fac)); }
// ¿Puede salir en las cartas ahora mismo?
function nvEnPool(id) {
  const e = nvArsEntrada(id);
  if (!NVP.camp) return !e || !e.fac || nvFacArmaLibre(e.fac);
  return !e || (nvArsDesbloqueada(e) && !nvArsEstado().ret[id]);
}
function nvPesoPool(id) { return NVP.camp ? 1 + NV_ARS_BUFF_PASO * (nvArsEstado().buff[id] || 0) : 1; }
function nvArsRetiradas() { return Object.keys(nvArsEstado().ret).filter(k => nvArsEstado().ret[k]).length; }
function nvArsCosteRetirar() { return Math.round(30 * Math.pow(1.6, nvArsRetiradas())); }
function nvArsCosteBuff(id) { return Math.round(40 * Math.pow(1.5, nvArsEstado().buff[id] || 0)); }
function nvArsPuedeRetirar(e) {
  if (!nvArsDesbloqueada(e) || nvArsEstado().ret[e.id]) return false;
  if (e.tipo === 'arma' && nvArsenalEntradas().filter(x => x.tipo === 'arma' && nvEnPool(x.id)).length <= 1) return false;   // siempre queda alguna arma
  return nvCamp().aleacion >= nvArsCosteRetirar();
}
function nvArsRetirar(e) { if (!nvArsPuedeRetirar(e)) return false; nvCamp().aleacion -= nvArsCosteRetirar(); nvArsEstado().ret[e.id] = true; nvCampGuarda(); return true; }
function nvArsReponer(e) { if (!nvArsEstado().ret[e.id]) return false; delete nvArsEstado().ret[e.id]; nvCampGuarda(); return true; }
function nvArsPuedeBuff(e) { return nvArsDesbloqueada(e) && !nvArsEstado().ret[e.id] && (nvArsEstado().buff[e.id] || 0) < NV_ARS_BUFF_MAX && nvCamp().aleacion >= nvArsCosteBuff(e.id); }
function nvArsBuff(e) { if (!nvArsPuedeBuff(e)) return false; nvCamp().aleacion -= nvArsCosteBuff(e.id); nvArsEstado().buff[e.id] = (nvArsEstado().buff[e.id] || 0) + 1; nvCampGuarda(); return true; }

// ---------- pantalla del Arsenal (se abre desde la nave capital) ----------
function nvArsenal() {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ARSENAL')));
  nvCabecera(p);
  p.appendChild(nvEl('nv-cdet', tr('Nivel del Arsenal') + ': ' + nvNivelCapital('arsenal') + '/4 · ' + tr('Retirar cuesta') + ' ' + nvArsCosteRetirar() + ' ' + tr('de aleación')));
  const grupos = [['arma', 'ARMAS'], ['def', 'DEFENSAS'], ['sis', 'SISTEMAS']];
  for (const [t, titulo] of grupos) {
    p.appendChild(nvEl('nv-ctipo', tr(titulo)));
    for (const e of nvArsenalEntradas().filter(x => x.tipo === t)) {
      const R = NOVA_RAREZAS[e.rareza], libre = nvArsDesbloqueada(e), ret = !!nvArsEstado().ret[e.id], bf = nvArsEstado().buff[e.id] || 0;
      const b = nvEl('nv-carta'); b.style.setProperty('--col', R.color); if (!libre || ret) b.style.opacity = 0.55;
      b.appendChild(nvEl('nv-ctipo', tr(R.nombre).toUpperCase() + ' · ' + (!libre ? (e.fac ? nvFacBloqueo(e.fac) : tr('Bloqueada: Arsenal nivel') + ' ' + e.nivel) : ret ? tr('Retirada del pool') : tr('En el pool') + (bf ? ' · ' + tr('Probabilidad') + ' +' + Math.round(bf * NV_ARS_BUFF_PASO * 100) + ' %' : ''))));
      b.appendChild(nvEl('nv-cnom', tr(e.nombre))); b.appendChild(nvEl('nv-cdet', tr(e.txt)));
      nvConIcono(b, e.ic[0], e.ic[1], R.color, 44);
      if (libre) {
        const f = nvEl('nv-botones');
        const q = nvEl('nv-boton nv-chico', ret ? tr('Reponer') : tr('Retirar') + ' · ' + nvArsCosteRetirar(), 'button'); q.disabled = !ret && !nvArsPuedeRetirar(e);
        q.onclick = () => { if (ret ? nvArsReponer(e) : nvArsRetirar(e)) nvArsenal(); };
        f.appendChild(q);
        if (!ret) {
          const u = nvEl('nv-boton nv-chico', bf >= NV_ARS_BUFF_MAX ? tr('Al máximo') : tr('Más probable') + ' · ' + nvArsCosteBuff(e.id), 'button'); u.disabled = !nvArsPuedeBuff(e);
          u.onclick = () => { if (nvArsBuff(e)) nvArsenal(); };
          f.appendChild(u);
        }
        b.appendChild(f);
      }
      p.appendChild(b);
    }
  }
  const v = nvEl('nv-boton', tr('Volver a la nave capital'), 'button'); v.onclick = nvNaveCapital; p.appendChild(v);
  nvInfo(p, ['arsenal', 'armasFaccion']);
  cont.appendChild(p);
}
