// Fans of Rumble · las pestañas del Salón de la Fama (la pantalla es común: core/js/clasificacion.js)
'use strict';
// La pestaña del PvP enseña la clasificación del PvP con esto a true (9-10-2026: el PvP ya está abierto). El cartel EN CONSTRUCCIÓN
// vive ahora en la pestaña Clanes (decisión de Daniel: el cartel se queda), que sigue en obras hasta que haya clanes.
const SALON_PVP = true;
// Colores de cada dificultad, los mismos que sus pestañas en la campaña. extra = la dificultad más alta con estrellas (1 Fácil … 5 Mítica).
const SALON_DIF = { 1: ['f', '#1f9a5a'], 2: ['n', '#5b3a8f'], 3: ['h', '#c0283d'], 4: ['x', '#c4621f'], 5: ['m', '#7a2fd6'] };
const salonDif = n => { const D = SALON_DIF[n]; if (!D || !CDIFF[D[0]]) return ''; return `Máximo: <span class="salon-dif" style="background:${D[1]}">${CDIFF[D[0]].name.toUpperCase()}</span>`; };

// Mítica semanal (js/10d-mitica-semanal.js): una pestaña con tres vistas (esta semana, la pasada y la suma de todas). La vista se elige con
// los botones que van dentro de su explicación; al cambiarla se olvida lo cargado para que el Salón la pida de nuevo.
const MIT_VISTAS = [
  { id: 'mitica', nombre: 'Esta semana', explica: 'Estrellas de la Mítica ganadas esta semana. Cada lunes vuelven a 0: los 10 primeros se llevan un título.', vacio: 'Gana una estrella en la Mítica esta semana para entrar.' },
  { id: 'mitica_pasada', nombre: 'Semana pasada', explica: 'Así quedó la semana pasada. Los 10 primeros ya tienen su título en el armario.', vacio: 'La semana pasada no ganaste estrellas en la Mítica.' },
  { id: 'mitica_total', nombre: 'De siempre', explica: 'Todas las estrellas de la Mítica semanal, sumando todas las semanas.', vacio: 'Gana tu primera estrella en la Mítica para entrar.' },
];
let mitVista = 'mitica';
const mitV = () => MIT_VISTAS.find(v => v.id === mitVista) || MIT_VISTAS[0];
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-mitv]'); if (!b || b.dataset.mitv === mitVista) return;
  play('select'); mitVista = b.dataset.mitv; delete SALON_UI.cache.mitica; salonPinta(); $('#salon-list').scrollTop = 0;
});

const SALON = {
  pestanas: [
    { id: 'campana', nombre: 'Campaña', tabla: 'campana', icono: STAR_SVG, unidad: 'estrellas',
      explica: 'Quién tiene más estrellas de campaña, sumando todas las dificultades. Si empatan, gana quien haya superado la más difícil.',
      vacio: 'Gana tu primera estrella en la campaña para entrar.',
      info: r => salonDif(r.extra) },
    { id: 'mitica', nombre: 'Mítica', icono: STAR_SVG, unidad: 'estrellas',
      get explica() { return `${mitV().explica}<span class="mit-vistas">${MIT_VISTAS.map(v => `<button type="button" data-mitv="${v.id}" aria-pressed="${v.id === mitVista}">${v.nombre}</button>`).join('')}</span>`; },
      get vacio() { return mitV().vacio; },
      cargar: async () => {
        if (typeof CUENTA === 'undefined' || !CUENTA.activa) throw new Error('sin_nube');
        return CUENTA.rpc('clasificacion', { p_juego: AJUSTES.id, p_tabla: mitVista });
      },
      info: r => mitVista === 'mitica_total' ? (r.extra === 1 ? '1 semana' : `${fmt(r.extra)} semanas`) : (r.extra === 1 ? '1 nivel' : `${fmt(r.extra)} niveles`) },
    { id: 'poder', nombre: 'Poder', tabla: 'poder', icono: FLAME_SVG, unidad: 'poder',
      explica: 'Poder es la suma de los niveles de todos tus personajes. Cada mejora te sube en el Salón.',
      vacio: 'Mejora un personaje para entrar.',
      info: r => r.extra === 1 ? '1 personaje mejorado' : `${fmt(r.extra)} personajes mejorados` },
    { id: 'pvp', nombre: 'Copas PvP', icono: CROWN_SVG, unidad: 'copas',
      explica: 'Copas del PvP (modo Estándar): ganas contra gente de verdad y subes; pierdes y bajas.',
      vacio: 'Juega una partida de PvP para entrar.',
      obras: () => !SALON_PVP,
      // cuando se abra el PvP, la lista sale de su propia clasificación (modo Estándar)
      cargar: async () => {
        if (typeof CUENTA === 'undefined' || !CUENTA.activa) throw new Error('sin_nube');
        const l = (await PVPNET.redes.servidor.clasificacion('estandar')) || [];
        const lista = l.map((r, i) => ({ puesto: i + 1, nombre: r.nombre, avatar: r.avatar || (r.look && r.look.avatar), fac: r.fac || (r.look && r.look.fac), look: r.look || null, valor: r.puntos, extra: r.jugadas, yo: !!r.yo }));   // look: marco y título (v0.9.110)
        return { lista, yo: lista.find(r => r.yo) || null, total: lista.length };
      },
      info: r => r.extra === 1 ? '1 partida' : `${fmt(r.extra)} partidas` },
    { id: 'clanes', nombre: 'Clanes', icono: CROWN_SVG, unidad: '',
      explica: 'Aquí irán los clanes: juntaos con otros fans y subid juntos en el Salón.',
      obras: () => true },
  ],
};
