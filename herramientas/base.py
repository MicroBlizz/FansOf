"""Deja en _base/ una copia del juego tal como estaba en un commit, para compararla con lo que tienes ahora.

Uso, desde la raíz del repositorio:   python herramientas/base.py [commit]      (por defecto, HEAD: lo último guardado en git)

La carpeta _base/ no se sube al repositorio. La usa el comparador de herramientas/pruebas/: abre el mismo guion
en la copia de _base/ y en tu versión, y dice en qué se diferencian.
"""
import io, os, shutil, subprocess, sys, tarfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMMIT = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
DEST = os.path.join(RAIZ, '_base')

datos = subprocess.run(['git', 'archive', COMMIT, 'core', 'games'], cwd=RAIZ, capture_output=True, check=True).stdout
if os.path.isdir(DEST):
    shutil.rmtree(DEST)
os.makedirs(DEST)
with tarfile.open(fileobj=io.BytesIO(datos)) as t:
    try:
        t.extractall(DEST, filter='data')
    except TypeError:   # versiones de Python anteriores a ese aviso de seguridad
        t.extractall(DEST)
nombre = subprocess.run(['git', 'log', '-1', '--format=%h %s', COMMIT], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8').stdout.strip()
open(os.path.join(DEST, 'COMMIT.txt'), 'w', encoding='utf-8').write(nombre + '\n')
print('_base/ es ahora:', nombre)
