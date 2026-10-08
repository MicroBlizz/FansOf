"""Copia core/ y games/rumble/ a android-app/www/ conservando rutas (../../core/...).
Uso: python herramientas/android_www.py   (luego: cd android-app && npx cap sync android)"""
import shutil, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
W = R / 'android-app' / 'www'
if W.exists(): shutil.rmtree(W)
(W / 'games').mkdir(parents=True)
ign = shutil.ignore_patterns('_base', '__pycache__', '*.md')
shutil.copytree(R / 'core', W / 'core', ignore=ign)
shutil.copytree(R / 'games' / 'rumble', W / 'games' / 'rumble', ignore=ign)
# Raíz: entra directo al juego
(W / 'index.html').write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=games/rumble/">')
print('www listo:', sum(1 for _ in W.rglob('*') if _.is_file()), 'archivos')
