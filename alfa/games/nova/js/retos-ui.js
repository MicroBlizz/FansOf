// Fans of Nova · Pantalla de retos: tres tabs (diarias, semanales, logros) con su barra y el botón de cobrar.
// Usa NV_RETOS (retos.js, que se apoya en core/js/sistema/retos-ligero.js) y la ventana común de menu.js.
'use strict';
const NV_RETOS_TABS = [['d', 'DIARIAS'], ['s', 'SEMANALES'], ['l', 'LOGROS']];
function nvRetos(tab) {
  tab = tab || 'd';
  const c = nvVentana(tr('RETOS')), cab = nvEl('nv-ret-tabs');
  for (const [p, t] of NV_RETOS_TABS) {
    const n = NV_RETOS.listos(p), b = nvEl('btn-ghost ol' + (p === tab ? ' nv-ret-act' : ''), tr(t) + (n ? ' (' + n + ')' : ''), 'button');
    b.onclick = () => nvRetos(p); cab.appendChild(b);
  }
  c.appendChild(cab);
  const caja = nvEl('nv-ret-lista');
  for (const m of NV_RETOS.lista(tab)) {
    const fila = nvEl('nv-ret' + (m.cobrada ? ' nv-ret-hecho' : '')), barra = nvEl('nv-ret-barra'), relleno = nvEl('nv-ret-rell');
    relleno.style.width = Math.round(100 * m.prog / m.goal) + '%'; barra.appendChild(relleno);
    barra.appendChild(nvEl('nv-ret-num', m.prog.toLocaleString() + ' / ' + m.goal.toLocaleString()));
    const txt = nvEl('nv-ret-txt'); txt.appendChild(nvEl('', tr(m.txt))); txt.appendChild(barra);
    const premio = nvEl('btn-ghost ol nv-ret-cobra', m.cobrada ? '✓' : String(m.r), 'button');
    premio.disabled = !m.listo || m.cobrada; premio.title = tr('Aleación');
    premio.onclick = () => { if (NV_RETOS.cobrar(tab, m.id)) { play('crown'); nvRetos(tab); nvPintaMenu(); } };
    fila.appendChild(txt); fila.appendChild(premio); caja.appendChild(fila);
  }
  c.appendChild(caja);
  c.appendChild(nvEl('nv-ver', tab === 'd' ? tr('Se renuevan cada día. Los premios son de aleación.') : tab === 's' ? tr('Se renuevan cada lunes. Los premios son de aleación.') : tr('Se miden con toda tu campaña. Los premios son de aleación.'), 'p'));
}
