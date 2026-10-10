"""Prepara la app Android de UN juego: copia core/ y games/<juego>/ a android-app/www/
(conservando rutas ../../core/...) y fija nombre e id de la app.
Uso: python herramientas/android_www.py [rumble|td|survivors|skate|tacticas]   (por defecto rumble)
Luego: cd android-app && npm ci && npx cap sync android && cd android && ./gradlew assembleDebug -PappId=<id>
Imprime el id de la app (última línea). CI: .github/workflows/android.yml"""
import shutil, pathlib, sys
JUEGOS = {  # juego: (nombre en el móvil, id de la app)
    'rumble': ('Fans Of: Rumble', 'com.microblizz.fansofrumble'),
    'td': ('Fans Of: TD', 'com.microblizz.fansoftd'),
    'survivors': ('Fans Of: Survivors', 'com.microblizz.fansofsurvivors'),
    'skate': ('Fans Of: Skate', 'com.microblizz.fansofskate'),
    'tacticas': ('Fans Of: Tácticas', 'com.microblizz.fansoftacticas'),
}
j = sys.argv[1] if len(sys.argv) > 1 else 'rumble'
if j not in JUEGOS: sys.exit('Juego desconocido: %s (%s)' % (j, ', '.join(JUEGOS)))
nombre, app_id = JUEGOS[j]
R = pathlib.Path(__file__).resolve().parent.parent
A = R / 'android-app'
W = A / 'www'
if W.exists(): shutil.rmtree(W)
(W / 'games').mkdir(parents=True)
ign = shutil.ignore_patterns('_base', '__pycache__', '*.md')
shutil.copytree(R / 'core', W / 'core', ignore=ign)
shutil.copytree(R / 'games' / j, W / 'games' / j, ignore=ign)
(W / 'index.html').write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=games/%s/">' % j)
(A / 'capacitor.config.json').write_text('{\n  "appId": "%s",\n  "appName": "%s",\n  "webDir": "www",\n  "android": { "allowMixedContent": false },\n  "server": { "androidScheme": "https" }\n}\n' % (app_id, nombre), encoding='utf-8')
(A / 'android/app/src/main/res/values/strings.xml').write_text(
    "<?xml version='1.0' encoding='utf-8'?>\n<resources>\n    <string name=\"app_name\">%s</string>\n    <string name=\"title_activity_main\">%s</string>\n    <string name=\"package_name\">%s</string>\n    <string name=\"custom_url_scheme\">%s</string>\n</resources>\n" % ((nombre, nombre, app_id, app_id)), encoding='utf-8')
print('www listo:', sum(1 for _ in W.rglob('*') if _.is_file()), 'archivos')
print(app_id)
