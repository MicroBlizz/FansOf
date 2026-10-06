"""Escribe MAPA.md: un índice de todos los archivos de código (tamaño y lo que declaran en el primer nivel), para saber a dónde ir sin abrirlos.

Uso, desde la raíz del repositorio:   python herramientas/mapa.py
Hay que volver a ejecutarlo cuando se parte, se crea o se mueve un archivo.
"""
import os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALTAR = {'_base', '.git', 'node_modules', '.claude'}
DECLARA = re.compile(r'^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)|^(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)')
MAX = 40   # nombres por archivo; el resto se cuenta


def nombres(ruta):
    out = []
    with open(ruta, encoding='utf-8', errors='replace') as f:
        for linea in f:
            m = DECLARA.match(linea)
            if m:
                out.append(m.group(1) or m.group(2))
    return out


def main():
    filas = []
    for dir, dirs, files in os.walk(RAIZ):
        dirs[:] = sorted(d for d in dirs if d not in SALTAR)
        for f in sorted(files):
            if not f.endswith(('.js', '.css', '.html', '.py')):
                continue
            ruta = os.path.join(dir, f)
            rel = os.path.relpath(ruta, RAIZ).replace(os.sep, '/')
            if rel == 'MAPA.md':
                continue
            kb = os.path.getsize(ruta) / 1024
            txt = f'- `{rel}` · {kb:.0f} KB' if kb >= 1 else f'- `{rel}` · <1 KB'
            if f.endswith('.js'):
                n = nombres(ruta)
                if n:
                    txt += ' · ' + ', '.join(n[:MAX]) + (f' … (+{len(n) - MAX})' if len(n) > MAX else '')
            filas.append(txt)
    cab = ('# MAPA · índice de archivos\n\nGenerado por `python herramientas/mapa.py`: no se edita a mano. Cada línea es archivo, tamaño y lo que declara en el primer nivel '
           '(funciones, const, let, class). Los objetos grandes (ART, CFG, TYPES…) se buscan con grep.\n\n')
    with open(os.path.join(RAIZ, 'MAPA.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(cab + '\n'.join(filas) + '\n')
    print(f'MAPA.md: {len(filas)} archivos')


if __name__ == '__main__':
    main()
