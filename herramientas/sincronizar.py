"""Pasa a core/ las mejoras hechas en el Rumble (games/rumble/), que es el juego principal.

Uso, desde la raíz del repositorio:   python herramientas/sincronizar.py

Regenera lo de core/ que sale de archivos del Rumble y dice qué ha cambiado:
  core/css/menus.css   estilos de los menús   <- games/rumble/css/estilos.css
  core/js/idle.js      horas extra            <- games/rumble/js/13-horas-extra.js

No hace falta para core/js/serie/ (facciones y cartas, arte, canciones, frases e iconos): esos archivos son la única copia
y el Rumble los carga de ahí, igual que los demás juegos.

Lo que NO se hereda solo, porque está reescrito a mano para los demás juegos: core/js/meta.js (progreso), core/js/menus.js
(colección, inventario, gashapón, tienda y opciones), core/js/save.js, core/js/audio.js y core/js/music.js.
"""
import subprocess, sys

def rd(p): return open(p, encoding='utf-8').read().replace('\r\n', '\n')

GEN = {'core/css/menus.css': 'herramientas/estilos_menus.py', 'core/js/idle.js': 'herramientas/horas_extra.py'}

changed = []
for path, tool in GEN.items():
    before = rd(path); r = subprocess.run([sys.executable, tool], capture_output=True, text=True, encoding='utf-8')
    if r.returncode: sys.exit(f'FALLA {tool}: el Rumble ha cambiado algo que esta herramienta esperaba encontrar.\n{r.stderr.strip().splitlines()[-1]}')
    if rd(path) != before: changed.append(path)
print('core/ ya estaba al día con el Rumble.' if not changed else 'Actualizado desde el Rumble:\n  ' + '\n  '.join(changed)
      + '\nPrueba los juegos, sube la versión (el ?v= de nucleo.js en su index.html) de los juegos que usen estos archivos, y publica.')
