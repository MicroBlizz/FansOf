"""Pasa a core/ las mejoras hechas en el Rumble (games/rumble/), que es el juego principal.

Uso, desde la raíz del repositorio:   python herramientas/sincronizar.py

Regenera todo lo de core/ que sale del Rumble y dice qué archivos han cambiado:
  core/css/menus.css            estilos de los menús           <- games/rumble/css/estilos.css
  core/js/idle.js               horas extra                    <- games/rumble/js/13-horas-extra.js
  core/js/vendor/05-musica.js   canciones                      <- games/rumble/js/05-audio.js
  core/js/vendor/02-chat.js     usuarios y frases del chat     <- games/rumble/js/02-progresion.js
  core/js/vendor/08-textos.js   iconos y frases del final      <- games/rumble/js/08-controles.js y 09-menus.js

No hace falta para core/js/vendor/01-config.js ni 03-arte.js: el Rumble los carga directamente de core/, así que son
el mismo archivo para todos los juegos.

Lo que NO se hereda solo, porque está reescrito a mano para los demás juegos: core/js/meta.js (progreso), core/js/menus.js
(colección, inventario, gashapón, tienda y opciones), core/js/save.js, core/js/audio.js y core/js/music.js.
"""
import subprocess, sys

R = 'games/rumble/js/'
def rd(p): return open(p, encoding='utf-8').read().replace('\r\n', '\n')
def lines(p): return rd(p).split('\n')
def block(ls, start, end='};'):
    """Las líneas desde la que empieza por `start` hasta la primera que empieza por `end` (incluida)."""
    i = next(k for k, l in enumerate(ls) if l.startswith(start)); j = next(k for k in range(i, len(ls)) if ls[k].startswith(end))
    return ls[i:j + 1]

def musica():
    a = rd(R + '05-audio.js'); i = a.index('/* =========================================================\n   MUSIC (synthesised'); j = a.index('\nconst M = {', i)
    return ("// Fans Of · Las canciones del juego original: copiadas sin cambios de js/05-audio.js de Fans of Rumble (escalas, secuencias y los 25 temas).\n'use strict';\n"
            + a[i:j].strip() + '\n')
def chat():
    ls = lines(R + '02-progresion.js'); i = next(k for k, l in enumerate(ls) if l.startswith('const CHAT_USERS = '))
    return ("// Fans of Rumble · chat falso en directo: usuarios y frases, copiados sin cambios de js/02-progresion.js del original\n'use strict';\n"
            + '\n'.join([ls[i]] + block(ls, 'const CHAT = {')) + '\n')
def textos():
    c8 = lines(R + '08-controles.js'); m9 = lines(R + '09-menus.js')
    i = next(k for k, l in enumerate(c8) if l.startswith('const FLAME_SVG')); j = next(k for k in range(i, len(c8)) if c8[k].startswith('};'))
    a = next(k for k, l in enumerate(m9) if l.startswith('const STAR_SVG')); b = next(k for k, l in enumerate(m9) if l.startswith('const QUOTES_PH')); b2 = next(k for k in range(b, len(m9)) if m9[k].startswith('};'))
    return ("// Fans of Rumble · iconos de las pasivas, estrella y frases del final de partida: copiados sin cambios de js/08-controles.js y js/09-menus.js del original\n'use strict';\n"
            + '\n'.join(c8[i:j + 1]) + '\n' + '\n'.join(m9[a:b2 + 1]) + '\n')

OUT = {'core/js/vendor/05-musica.js': musica, 'core/js/vendor/02-chat.js': chat, 'core/js/vendor/08-textos.js': textos}
GEN = {'core/css/menus.css': 'herramientas/estilos_menus.py', 'core/js/idle.js': 'herramientas/horas_extra.py'}

changed = []
for path, tool in GEN.items():
    before = rd(path); r = subprocess.run([sys.executable, tool], capture_output=True, text=True, encoding='utf-8')
    if r.returncode: sys.exit(f'FALLA {tool}: el Rumble ha cambiado algo que esta herramienta esperaba encontrar.\n{r.stderr.strip().splitlines()[-1]}')
    if rd(path) != before: changed.append(path)
for path, make in OUT.items():
    new = make()
    if new != rd(path): open(path, 'w', encoding='utf-8', newline='\n').write(new); changed.append(path)

print('core/ ya estaba al día con el Rumble.' if not changed else 'Actualizado desde el Rumble:\n  ' + '\n  '.join(changed)
      + '\nPrueba los juegos, sube VERSION y el ?v= de los que usen estos archivos, y publica.')
