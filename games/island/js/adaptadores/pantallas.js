// Fans of Island · adaptadores/pantallas: LAS PANTALLAS Y EL MARCADOR (IS.creaPantallas): las vidas y las zanahorias de arriba, la pantalla
// de final, los botones de jugar, otra vez y silencio, y la vibración. La música del final (win o lose) la pone aquí el final.
'use strict';
{
  const CORAZON = '<svg viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#2a1830" d="M1 0h2v1h1V0h2v1h1v3H6v1H5v1H2V5H1V4H0V1h1z"/><path fill="COLOR" d="M1 1h2v1h1V1h2v2H5v1H4v1H3V4H2V3H1z"/><path fill="#fff6e0" d="M1 1h1v1H1z"/></svg>';
  const el = id => document.getElementById(id);

  function marcador({ vidas, zanas, total }) {
    el('vidas').innerHTML = [0, 1, 2].map(i => CORAZON.replace('COLOR', i < vidas ? '#f04b53' : '#56101e')).join('');
    el('cuenta').textContent = zanas + '/' + total;
  }
  function final({ gana, zanas, total }) {
    IS.fuera.musicSet(gana ? 'win' : 'lose');
    el('finTitulo').textContent = gana ? tr('Meta') : tr('Otra vez será');
    el('finTexto').textContent = tr('Zanahorias: {n} de {t}', { n: zanas, t: total });
    el('fin').classList.remove('oculto');
  }
  function vibra() {
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* sin vibración: se juega igual */ }
  }
  function pintaSonido() {
    el('ondas').style.display = IS.Guardado.silenciado() ? 'none' : '';
    el('tachado').style.display = IS.Guardado.silenciado() ? '' : 'none';
  }
  function conectaSonido() {
    const boton = el('sonido');
    boton.addEventListener('pointerdown', e => e.stopPropagation());
    boton.onclick = () => { IS.Guardado.alternaSilencio(); IS.fuera.aplicaVolumen(); pintaSonido(); };
    pintaSonido();
  }

  IS.creaPantallas = () => {
    const jugar = el('jugar');
    jugar.disabled = true; jugar.textContent = tr('Cargando...');
    conectaSonido();
    return {
      marcador, final, vibra,
      listo() { jugar.disabled = false; jugar.textContent = tr('Jugar'); },   // ya están todas las piezas dibujadas
      alEmpezar(empieza) {   // «Jugar» y «Otra vez»: empieza la partida y esconde las dos pantallas
        const pulsa = () => { empieza(); el('inicio').classList.add('oculto'); el('fin').classList.add('oculto'); };
        jugar.onclick = pulsa; el('otra').onclick = pulsa;
      },
    };
  };
}
