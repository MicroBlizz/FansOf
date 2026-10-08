// Fans of Rumble · las pestañas del Salón de la Fama (la pantalla es común: core/js/clasificacion.js)
'use strict';
// La pestaña del PvP sale EN CONSTRUCCIÓN hasta que esto pase a true (decisión de Daniel, 9-10-2026); entonces enseña la clasificación del PvP.
const SALON_PVP = false;
// Colores de cada dificultad, los mismos que sus pestañas en la campaña. extra = la dificultad más alta con estrellas (1 Fácil … 5 Mítica).
const SALON_DIF = { 1: ['f', '#1f9a5a'], 2: ['n', '#5b3a8f'], 3: ['h', '#c0283d'], 4: ['x', '#c4621f'], 5: ['m', '#7a2fd6'] };
const salonDif = n => { const D = SALON_DIF[n]; if (!D || !CDIFF[D[0]]) return ''; return `Máximo: <span class="salon-dif" style="background:${D[1]}">${CDIFF[D[0]].name.toUpperCase()}</span>`; };

const SALON = {
  pestanas: [
    { id: 'campana', nombre: 'Campaña', tabla: 'campana', icono: STAR_SVG, unidad: 'estrellas',
      explica: 'Quién tiene más estrellas de campaña, sumando todas las dificultades. Si empatan, gana quien haya superado la más difícil.',
      vacio: 'Gana tu primera estrella en la campaña para entrar.',
      info: r => salonDif(r.extra) },
    { id: 'poder', nombre: 'Poder', tabla: 'poder', icono: FLAME_SVG, unidad: 'poder',
      explica: 'Poder es la suma de los niveles de todos tus personajes. Cada mejora te sube en el Salón.',
      vacio: 'Mejora un personaje para entrar.',
      info: r => r.extra === 1 ? '1 personaje mejorado' : `${fmt(r.extra)} personajes mejorados` },
    { id: 'pvp', nombre: 'Copas PvP', icono: CROWN_SVG, unidad: 'copas',
      explica: 'Aquí irán las copas del PvP: ganas contra gente de verdad y subes; pierdes y bajas.',
      vacio: 'Juega una partida de PvP para entrar.',
      obras: () => !SALON_PVP,
      // cuando se abra el PvP, la lista sale de su propia clasificación (modo Estándar)
      cargar: async () => {
        const l = (await PVPNET.redes.servidor.clasificacion('estandar')) || [];
        const lista = l.map((r, i) => ({ puesto: i + 1, nombre: r.nombre, valor: r.puntos, extra: r.jugadas, yo: !!r.yo }));
        return { lista, yo: lista.find(r => r.yo) || null, total: lista.length };
      },
      info: r => r.extra === 1 ? '1 partida' : `${fmt(r.extra)} partidas` },
  ],
};
