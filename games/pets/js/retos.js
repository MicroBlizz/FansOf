// Fans Of Pets · RETOS: los datos de los logros (docs/pets/logros.md), para el sistema común de retos ligeros de core (RETOSL,
// core/js/sistema/retos-ligero.js). Cada logro: id, txt (el nombre), req (el requisito que se lee), tipo (el borde de la chapa y su premio),
// goal (cuántas veces), ev (el aviso que lo cuenta: lo dan los casos de uso por PT.creaAvisos) y r (el premio en Tickets; los grandes, también Bonus).
// Los secretos salen como «???????» hasta conseguirlos. Los de patrón (uno por criatura y por facción) se generan del catálogo.
// Lo que el prototipo aún no tiene (rutinas, vacaciones, rachas, la rama secreta de las empresas, el logro supremo) no está: docs/pets/logros.md.
'use strict';
PT.LOGROS = (() => {
  const P = PETS.premios, grande = { ganada: P.grande, comprada: P.bonusGrande };
  const L = (id, txt, req, tipo, ev, goal = 1, extra = {}) => ({ id, txt, req, tipo, ev, goal, r: extra.r || P[tipo], secreto: !!extra.secreto, antes: extra.antes || [] });
  const fijos = [
    // empezar
    L('contratado', 'Contratado', 'Terminar la entrevista de trabajo.', 'empezar', 'contratado'),
    L('primer-dia', 'Primer día', 'Que eclosione tu primer huevo.', 'empezar', 'nacio', 1, { antes: ['contratado'] }),
    L('horario', 'Ya tiene horario', 'Poner el horario de vida.', 'empezar', 'horario'),
    L('nomina', 'Primera nómina', 'Cobrar la primera evaluación de desempeño del día.', 'empezar', 'nomina', 1, { antes: ['primer-dia'] }),
    L('ascendido', 'Ascendido', 'Ascender por primera vez.', 'empezar', 'ascenso', 1, { antes: ['primer-dia'] }),
    // modos de ritmo
    L('rapido', 'Becario exprés', 'Ascender en modo rápido.', 'modo', 'ascenso-rapido', 1, { antes: ['ascendido'] }),
    L('medio', 'Jornada completa', 'Ascender en modo medio.', 'modo', 'ascenso-medio', 1, { antes: ['ascendido'] }),
    L('largo', 'Contrato indefinido', 'Ascender en modo largo.', 'modo', 'ascenso-largo', 1, { antes: ['ascendido'] }),
    L('polivalente', 'Polivalente', 'Ascender en los tres modos de ritmo.', 'especial', 'polivalente', 1, { antes: ['rapido', 'medio', 'largo'] }),
    // cuidado
    L('chuches', 'Fan Of Chuches', 'Darle tantas chucherías que acabe con empacho 10 veces.', 'especial', 'empacho', 10, { secreto: true }),
    L('siesta', 'Siesta de 20 minutos', 'Echar la primera siesta.', 'cuidado', 'siesta'),
    L('contraoferta', 'Contraoferta aceptada', 'Convencerla para que no dimita (cuidándola en el preaviso o con una contraoferta).', 'cuidado', 'convencida'),
    L('fin-contrato', 'Fin de contrato', 'Que una mascota dimita.', 'cuidado', 'dimision', 1, { secreto: true }),
    L('rrhh', 'Recursos humanos', 'Despedir a una mascota.', 'cuidado', 'despedida', 1, { secreto: true }),
    // ramas y jefes
    L('operaciones', 'Jefe de operaciones', 'Ascender por la rama de operaciones (aguante).', 'rama', 'rama-operaciones', 1, { antes: ['ascendido'] }),
    L('creativo', 'Jefe creativo', 'Ascender por la rama creativa (juego).', 'rama', 'rama-creativo', 1, { antes: ['ascendido'] }),
    L('personas', 'Jefe de personas', 'Ascender por la rama de personas (cariño).', 'rama', 'rama-personas', 1, { antes: ['ascendido'] }),
    L('gamberro', 'Se lleva los méritos', 'Ascender por la rama gamberra.', 'rama', 'rama-gamberro', 1, { secreto: true }),
    L('no-molestar', 'No molestar', 'Conseguir el primer jefe de la siesta.', 'rama', 'rama-siesta', 1, { secreto: true }),
    L('fan-siestas', 'Fan Of Siestas', 'Conseguir el jefe de la siesta de las 72 criaturas.', 'grande', 'jefes-siesta', 72, { secreto: true, r: grande }),
    // colección
    L('medio-album', 'Medio álbum', 'Desbloquear 36 criaturas.', 'especial', 'desbloqueadas', 36),
    L('dios', 'Dios de los coleccionistas', 'Desbloquear las 72 criaturas.', 'grande', 'desbloqueadas', 72, { r: grande }),
  ];
  // por patrón: Fan Of «criatura» (los 5 jefes de esa criatura) y Fan Of «facción» (sus 8 criaturas desbloqueadas)
  const porCriatura = PT.criaturas.lista.map(c => ({ ...L('fan-' + c.id, 'Fan Of {nombre}', 'Conseguir los 5 jefes de {nombre}.', 'criatura', 'jefes:' + c.id, 5), nombre: c.nombre }));
  const porFaccion = PT.criaturas.facciones.map(f => ({ ...L('fan-fac-' + f, 'Fan Of {faccion}', 'Desbloquear las 8 criaturas de {faccion}.', 'faccion', 'fac:' + f, 8), faccion: f }));
  return [...fijos, ...porCriatura, ...porFaccion];
})();
