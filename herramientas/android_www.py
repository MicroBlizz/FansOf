"""Prepara la app Android de UN juego: copia core/ y games/<juego>/ a android-app/www/
(conservando rutas ../../core/...) y fija nombre e id de la app.
Uso: python herramientas/android_www.py [rumble|td|survivors|skate|tacticas]   (por defecto rumble)
Luego: cd android-app && npm ci && npx cap sync android && cd android && ./gradlew assembleDebug -PappId=<id>
Imprime el id de la app y, en la última línea, la versión (la ?v= de nucleo.js del juego: la app lleva el mismo número que la web). CI: .github/workflows/android.yml"""
import shutil, pathlib, sys, re
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
# Aviso en pantalla de los errores de arranque (solo en la copia de la app): sin él una pantalla en blanco no dice nada
DIAG = '<script>(function(){function m(t){var d=document.getElementById("fo-diag");if(!d){d=document.createElement("pre");d.id="fo-diag";d.style.cssText="position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;margin:0;padding:8px;background:#400;color:#fff;font:11px monospace;z-index:99999;white-space:pre-wrap";(document.body||document.documentElement).appendChild(d)}d.textContent+=t+"\\n"}window.addEventListener("error",function(e){m((e.filename||"").split("/").slice(-2).join("/")+":"+e.lineno+" "+e.message)},true);window.addEventListener("unhandledrejection",function(e){m("promesa: "+(e.reason&&e.reason.message||e.reason))})})()</script>'
gi = W / 'games' / j / 'index.html'
gi.write_text(gi.read_text(encoding='utf-8').replace('<head>', '<head>' + DIAG, 1), encoding='utf-8')
(A / 'capacitor.config.json').write_text('{\n  "appId": "%s",\n  "appName": "%s",\n  "webDir": "www",\n  "android": { "allowMixedContent": false },\n  "server": { "androidScheme": "https" }\n}\n' % (app_id, nombre), encoding='utf-8')
(A / 'android/app/src/main/res/values/strings.xml').write_text(
    "<?xml version='1.0' encoding='utf-8'?>\n<resources>\n    <string name=\"app_name\">%s</string>\n    <string name=\"title_activity_main\">%s</string>\n    <string name=\"package_name\">%s</string>\n    <string name=\"custom_url_scheme\">%s</string>\n</resources>\n" % ((nombre, nombre, app_id, app_id)), encoding='utf-8')
print('www listo:', sum(1 for _ in W.rglob('*') if _.is_file()), 'archivos')
m = re.search(r'nucleo\.js\?v=(\d+\.\d+\.\d+)', (R / 'games' / j / 'index.html').read_text(encoding='utf-8'))
print(app_id)
print(m.group(1) if m else '0.0.1')
