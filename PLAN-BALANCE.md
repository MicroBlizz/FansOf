# Plan de pruebas de balance (Rumble): habilidades y objetos

Cómo comprobar si una habilidad o un objeto está demasiado fuerte o no sirve para nada, y cómo repetirlo cada vez que se cambie algo.
Primera medición: 9-10-2026 (ver «Valores de referencia» al final).

## 1. Qué hace la prueba
- Juega partidas **espejo**: las dos partes con la misma facción, el mismo mazo (sus 6 primeras unidades y el líder), todo a nivel 5, y las dos jugadas por la IA.
- Solo una parte lleva lo que se mide:
  - una **habilidad**: en sus 7 cartas (como un jugador que la lleva en todo el mazo);
  - un **objeto**: en el líder (los objetos solo los lleva el líder).
- Siempre con calidad normal (0,5: el valor central).
- Se repite en las 9 facciones, la mitad de las veces en cada lado del campo (así no influye qué lado juega mejor) y con varias semillas (cada semilla es una partida distinta, pero siempre la misma: el resultado se puede repetir).
- Si sale igualado, lo medido no cambia nada; cuanto más gana quien lo lleva, más fuerte es.

## 2. Cómo leer el resultado
- **Margen**: cuántas torres de ventaja le quedan al final a quien lo lleva (torres y sede cuentan de 0 a 1 cada una; va de -3 a 3). Es la cifra buena.
- **Gana**: % de partidas que gana quien lo lleva (empate = media). Con la IA actual, en espejo casi cualquier ventaja gana casi siempre (Piel dura gana el ~90 %), así que este número se satura: mira el margen.
- **Dura**: segundos que dura la partida de media (si baja mucho, lo medido acaba las partidas muy rápido).

Qué es normal (habilidades, medido con la IA de la 0.9.90):

| Margen | Qué significa | Ejemplos |
|---|---|---|
| más de 1,9 | Demasiado fuerte: decide la partida sola | Antes del arreglo: DLC 2,64, Microtransacción 2,60 |
| 1,0 a 1,9 | Buena | Piel 1,54, Puños 1,34, Reflejos 1,28 |
| 0,5 a 1,0 | Floja pero útil | Microtransacción 0,96, Modo foto 0,98 |
| menos de 0,5 | Casi no hace nada | Cafeína, Speedrun, Escarcha |

Los objetos dan márgenes más pequeños porque solo los lleva el líder: compara objetos con objetos y habilidades con habilidades.

**Importante: la escala cambia cuando cambia la IA, las unidades o FAC_BAL.** Compara solo con cosas medidas el mismo día y con el mismo juego. Por eso conviene medir siempre todas las habilidades (o todos los objetos) a la vez, no una suelta.

## 3. Cómo lanzarla
Antes: tener Chrome o Edge instalado (lo mismo que para `comprobar.py`).

### Opción A: rápida, sin ventana (recomendada)
Desde la raíz del repositorio:

```
python herramientas/balance.py habilidades
python herramientas/balance.py objetos
python herramientas/balance.py todo
python herramientas/balance.py dlc,piel,gafas_pixel          (solo esas)
python herramientas/balance.py habilidades --procesos=4        (más rápido si el ordenador tiene 4 núcleos o más)
python herramientas/balance.py dlc --valor=dlc:0.5             (probar otro número sin tocar el juego)
```

- Enseña el progreso, y al acabar la tabla ordenada de más fuerte a más floja, con avisos («demasiado fuerte», «casi no hace nada»).
- Guarda la tabla en `_balance/resumen.txt` y todas las partidas en `_balance/ultimo.json` (esa carpeta no se sube a git; si quieres conservar una medición, copia el resumen a otro sitio o a un plan).
- `--semillas=12` (lo normal) son 216 partidas por habilidad u objeto. Con 6 va el doble de rápido y es menos precisa.
- Tiempos aproximados con 2 procesos: habilidades unos 10 minutos; objetos unos 15; todo unos 25.
- Si no encuentra el navegador: pon su ruta en la variable `CHROME`.

### Opción B: en el navegador, viendo la tabla
1. `python herramientas/servidor.py`
2. Abre http://localhost:8765/herramientas/pruebas/balance.html
3. Elige qué medir y pulsa **Empezar**. Al acabar sale la tabla (en rojo lo demasiado fuerte, en azul lo que no hace nada) y un botón para descargar las partidas.

Va en un solo proceso, así que tarda más que la opción A.

## 4. Cómo ajustar una habilidad o un objeto (el flujo completo)
1. **Medir todo** (`python herramientas/balance.py habilidades`) y apuntar el margen de las que se salen y de un par de referencias (Piel, Puños).
2. **Probar números sin tocar el juego** con `--valor` (solo habilidades): por ejemplo `--valor=dlc:0.5` y `--valor=dlc:0.75`. Elige el que deje el margen entre 1,0 y 1,9, cerca de las referencias.
3. **Cambiar el número en el juego**: `games/rumble/js/02a-objetos.js`, en `vals: [flojo, central, fuerte]` (habilidades) o `st: [...]` (objetos). Mantén la proporción: flojo ≈ 0,7 × central y fuerte ≈ 1,3 × central.
4. **Medir otra vez todo** para confirmar (los cambios mueven un poco a las demás).
5. Si cambia el texto, su inglés va en `games/rumble/idioma/en-*.js`.
6. Guardar en main y, al desplegar, nota en NEWS (el jugador lo nota).

## 5. Cuándo repetirla
- Al crear una habilidad o un objeto nuevo: sale solo en la medición (la lista se lee del juego). Una habilidad nueva necesita su efecto en `applyAbility` (06a-despliegue.js); un objeto, en `applyItem`.
- Al cambiar la IA, las cifras de las unidades, FAC_BAL o las pasivas de facción.
- Antes de abrir el PvP Salvaje (donde cuentan habilidades y objetos).

## 6. Cosas a tener en cuenta (para no engañarse)
- **El líder**: la IA de pruebas no lo saca por sí sola. La prueba hace que las dos partes lo saquen en cuanto pueden; sin eso, los objetos no harían nada (pasó en la primera medición).
- **Lo visual va apagado** (partículas, sonidos, chat): no cambia el resultado (se comprobó jugando las mismas partidas con y sin) y va mucho más rápido.
- **Objetos de facción**: solo se prueban en su facción, con 4 veces más semillas; aun así tienen menos partidas que los demás (resultado menos seguro).
- **Precisión**: con 216 partidas, un margen se mueve más o menos ±0,1 de una medición a otra. Diferencias más pequeñas no significan nada.
- **Qué NO mide**: si la campaña es fácil (la IA de la campaña no lleva habilidades), los hechizos, ni las estrellas o niveles de las cartas. Para la dificultad de la campaña haría falta otra prueba: niveles de campaña jugados por la IA con y sin habilidades.

## 7. Archivos
- `herramientas/balance.py`: lanza la medición sin ventana, en varios Chrome a la vez, y junta el resultado.
- `herramientas/pruebas/balance.html` y `balance-pagina.js`: la página (prepara las partidas, las reparte y hace el resumen).
- `herramientas/pruebas/balance.js`: lo que se mete dentro del juego y juega cada partida (modo PvP con equipos cerrados, semilla fija).

## Valores de referencia (9-10-2026, juego 0.9.90, 216 partidas por habilidad)
Margen después de los arreglos de DLC, Microtransacción, Clon, Rage Quit y Gigante:

Renacer 1,95 · DLC 1,69 · Cadena 1,67 · Gigante 1,59 · Clon 1,58 · Imán 1,57 · Piel 1,54 · Plasma 1,49 · Rage Quit 1,43 · Hitbox 1,38 · Puños 1,34 · Reflejos 1,28 · Sigilo 1,20 · Grito 1,17 · Vampiro 1,09 · Furia 1,04 · Modo foto 0,98 · Microtransacción 0,96 · Provoca 0,63 · Escarcha 0,21 · Speedrun 0,02 · Cafeína -0,04

Objetos (primera medición, IA anterior, en % de victorias): ninguno roto. Los más fuertes: Alfombrilla 63 %, Teclado RGB 61 %, Cofre 59 %, Botón de pausa 59 %. BanHammer de oro y Micrófono de oro no aportan.

Pendiente: Renacer algo alta; Cafeína, Speedrun, Escarcha y Provoca casi no hacen nada; volver a medir los objetos con la IA actual.
