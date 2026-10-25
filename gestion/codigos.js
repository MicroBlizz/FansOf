// Fans Of · /gestion: la pestaña CÓDIGOS DE ROUFLAGE. Crear, cambiar, activar y desactivar los códigos regalo que se dan en redes (Daniel, 25-10-2026).
// Cada jugador canjea cada código una vez (en el juego: OPCIONES › CÓDIGO REGALO, games/rouflage/js/codigos.js). Premio: Gotas, Acciones y piezas
// (ropa del armario y paquetes de pegatinas, 'categoria:id'); la lista de piezas válidas la da el propio servidor.
// Datos: gestion_codigos(token), gestion_codigo_guardar(token, codigo, premio, max_usos, caduca, nota) y gestion_codigo_activo(token, codigo, activo),
// servidor/94-rouflage-codigos.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $().
'use strict';
(() => {
  let L = [], PIEZAS = [], chips = [];
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  const limpio = t => String(t || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
  const ERRORES = { codigo_no_valido: 'El código solo puede llevar letras, números y guiones (de 3 a 24).', premio_vacio: 'El premio está vacío: pon Gotas, Acciones o alguna pieza.',
    premio_cifra_no_valida: 'Cifra fuera de lo normal (hasta 100 000 Gotas y 10 000 Acciones).', premio_piezas_no_validas: 'Como mucho 10 piezas por código.', pieza_no_existe: 'Alguna pieza no existe en el catálogo del juego.' };
  const error = e => { const m = String(e.message || e); const k = Object.keys(ERRORES).find(x => m.includes(x)); return k ? ERRORES[k] : sinFuncion(e) ? 'Los códigos aún no están en el servidor (servidor/94-rouflage-codigos.sql).' : textoError(e); };

  function pintaChips() {
    $('cd-chips').innerHTML = chips.map((k, i) => `<button type="button" data-i="${i}" title="Quitar">${esc(k)} ×</button>`).join('');
  }
  function textoPremio(p) {
    const t = [];
    if (p.todo) t.push('<span><b>TODO</b> (desarrollo)</span>');
    if (p.gotas) t.push(`<span>${p.gotas} Gotas</span>`);
    if (p.acciones) t.push(`<span>${p.acciones} Acciones</span>`);
    for (const k of p.piezas || []) t.push(`<span class="codigo" style="font-size:13px">${esc(k)}</span>`);
    return t.join('');
  }
  function pinta() {
    const hoy = Date.now();
    $('cd-lista').innerHTML = L.length ? L.map((c, i) => {
      const caducado = c.caduca && new Date(c.caduca).getTime() < hoy, agotado = c.max_usos && c.usos >= c.max_usos;
      const estado = !c.activo ? 'desactivado' : caducado ? 'caducado' : agotado ? 'agotado' : 'activo';
      return `<article class="cuenta${estado === 'activo' ? '' : ' apagado'}"><div class="cab"><span class="codigo">${esc(c.codigo)}</span><span class="estado${estado === 'activo' ? '' : ' si'}">${estado}</span>
        <span class="puntos">${c.usos}${c.max_usos ? ' / ' + c.max_usos : ''} usos</span></div>
        <div class="cod-premio">${textoPremio(c.premio || {})}</div>
        <div class="meta">${c.caduca ? 'Vale hasta el ' + esc(new Date(new Date(c.caduca).getTime() - 1000).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'medium' })) + ' (incluido) · ' : 'No caduca · '}Creado ${esc(fecha(c.creado))}${c.creador ? ' por ' + esc(c.creador) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}</div>
        <div class="filtros"><button type="button" data-editar="${i}">Editar</button><button type="button" class="${c.activo ? 'peligro' : ''}" data-activo="${i}">${c.activo ? 'Desactivar' : 'Activar'}</button></div></article>`;
    }).join('')
      : '<div class="vacio"><b>Aún no hay códigos</b>Crea el primero con el formulario de arriba.</div>';
  }
  async function cargar() {
    $('cd-aviso').textContent = '';
    try {
      const r = await rpc('gestion_codigos', { p_token: leerToken() });
      L = r.codigos || []; PIEZAS = r.piezas || [];
      $('cd-piezas').innerHTML = PIEZAS.map(k => `<option value="${esc(k)}">`).join('');
      pinta();
    } catch (e) { $('cd-aviso').textContent = error(e); }
  }
  function vaciar() {
    for (const id of ['cd-codigo', 'cd-gotas', 'cd-acciones', 'cd-max', 'cd-caduca', 'cd-nota', 'cd-pieza']) $(id).value = '';
    $('cd-todo').checked = false;
    chips = []; pintaChips(); $('cd-codigo').readOnly = false;
  }
  function editar(c) {
    vaciar();
    $('cd-codigo').value = c.codigo; $('cd-codigo').readOnly = true;
    $('cd-gotas').value = c.premio.gotas || ''; $('cd-acciones').value = c.premio.acciones || ''; $('cd-todo').checked = !!c.premio.todo;
    $('cd-max').value = c.max_usos || ''; $('cd-nota').value = c.nota || '';
    if (c.caduca) { const d = new Date(new Date(c.caduca).getTime() - 1000); $('cd-caduca').value = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }); }
    chips = (c.premio.piezas || []).slice(); pintaChips();
    $('cd-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function anadePieza() {
    const k = $('cd-pieza').value.trim(); if (!k) return;
    if (PIEZAS.length && !PIEZAS.includes(k)) { $('cd-aviso').textContent = 'Esa pieza no está en el catálogo: elígela de la lista que sale al escribir.'; return; }
    if (!chips.includes(k)) chips.push(k);
    $('cd-pieza').value = ''; $('cd-aviso').textContent = ''; pintaChips();
  }
  // la fecha del formulario es el último día en que vale: caduca al acabar ese día en Madrid
  function caducaDe(v) {
    if (!v) return null;
    const [a, m, d] = v.split('-').map(Number), fin = new Date(Date.UTC(a, m - 1, d + 1, 0, 0, 0));
    const madrid = new Date(fin.toLocaleString('en-US', { timeZone: 'Europe/Madrid' })), utc = new Date(fin.toLocaleString('en-US', { timeZone: 'UTC' }));
    return new Date(fin.getTime() - (madrid - utc)).toISOString();
  }
  async function guardar(ev) {
    ev.preventDefault(); $('cd-aviso').textContent = '';
    if ($('cd-pieza').value.trim()) anadePieza();
    const cod = limpio($('cd-codigo').value); $('cd-codigo').value = cod;
    const premio = { gotas: Math.max(0, parseInt($('cd-gotas').value, 10) || 0), acciones: Math.max(0, parseInt($('cd-acciones').value, 10) || 0), piezas: chips };
    if ($('cd-todo').checked) premio.todo = true;
    const b = $('cd-guardar'); b.disabled = true;
    try {
      await rpc('gestion_codigo_guardar', { p_token: leerToken(), p_codigo: cod, p_premio: premio, p_max_usos: parseInt($('cd-max').value, 10) || 0, p_caduca: caducaDe($('cd-caduca').value), p_nota: $('cd-nota').value });
      $('cd-aviso').textContent = ''; vaciar(); await cargar();
    } catch (e) { $('cd-aviso').textContent = error(e); }
    finally { b.disabled = false; }
  }

  const tabs = () => [...document.querySelectorAll('#tabs button')].map(b => b.id).filter(id => id !== 't-codigos');
  function mostrar(si) {
    $('pan-codigos').hidden = !si; $('t-codigos').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-codigos') p.hidden = true; }); tabs().forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-codigos').onclick = () => mostrar(true);
  tabs().forEach(t => $(t).addEventListener('click', () => { $('pan-codigos').hidden = true; $('t-codigos').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-codigos').hidden = true; $('t-codigos').classList.remove('activa'); });
  $('salir').addEventListener('click', () => mostrar(false));
  $('cd-form').onsubmit = guardar;
  $('cd-limpiar').onclick = vaciar;
  $('cd-anadir').onclick = anadePieza;
  $('cd-pieza').onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); anadePieza(); } };
  $('cd-codigo').oninput = () => { const v = limpio($('cd-codigo').value); if (v !== $('cd-codigo').value) $('cd-codigo').value = v; };
  $('cd-chips').onclick = ev => { const b = ev.target.closest('button[data-i]'); if (!b) return; chips.splice(+b.dataset.i, 1); pintaChips(); };
  $('cd-lista').onclick = async ev => {
    const e = ev.target.closest('button[data-editar]'); if (e) { editar(L[+e.dataset.editar]); return; }
    const b = ev.target.closest('button[data-activo]'); if (!b) return;
    const c = L[+b.dataset.activo]; b.disabled = true; $('cd-aviso').textContent = '';
    try { await rpc('gestion_codigo_activo', { p_token: leerToken(), p_codigo: c.codigo, p_activo: !c.activo }); await cargar(); }
    catch (err) { $('cd-aviso').textContent = error(err); b.disabled = false; }
  };
})();
