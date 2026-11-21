// Fans of Island · transicion: ALIAS de transición. El nivel y la física ya viven en IS (dominio/); los archivos que aún usan los nombres
// de siempre (partida, jugador, bichos, dibujo, arte-*) los siguen viendo aquí. Se borra en N4 (docs/island/MIGRACION.md), cuando
// cada archivo pase a leer de IS.
'use strict';
const { T, D, CARRIL } = IS.MEDIDAS;
const ruido = IS.ruido;
const { G, V_SALTO, V_MAX, R_J, R_E, MAR, Z_OCULTO, Z_ASOMA } = IS.FISICA;
IS.nivel = IS.creaNivel();
const { COLS, INICIO, META, NIV, PLAT, ZANAS0, ENEM0, ATRAS, DELANTE, DECO, ROCAS_MAR, CANG0, PECES0 } = IS.nivel;
IS.fisica = IS.creaFisica(IS.nivel);
const { arribaSuelo, arribaCol, sueloDe, mueveX, cae } = IS.fisica;
