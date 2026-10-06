"""Pasa el comparador (herramientas/pruebas/) sin abrir el navegador a mano y dice TODO IGUAL o FALLO.

Uso, desde la raíz del repositorio:   python herramientas/comprobar.py [rumble] [td] [--tam=normal|movil|pc]      (por defecto, los dos juegos)
Antes hay que haber ejecutado  python herramientas/base.py  (deja en _base/ la versión de antes).

Arranca un servidor temporal, abre el comparador en Chrome o Edge sin ventana y recibe el resultado cuando termina.
Sale con código 0 si todo es igual y 1 si hay diferencias, errores o el comparador no termina.
"""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JUEGOS = [a for a in sys.argv[1:] if not a.startswith('--')] or ['rumble', 'td']
TAM = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--tam=')), 'normal')
NAVEGADORES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]


RESULTADO = {}
LISTO = threading.Event()


class Peticion(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):   # el comparador manda aquí su resultado al terminar
        RESULTADO['json'] = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode('utf-8')
        self.send_response(204)
        self.end_headers()
        LISTO.set()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0].endswith('/sw.js'):   # sin modo sin conexión, igual que servidor.py
            self.send_error(404)
            return
        super().do_GET()

    def log_message(self, *a):
        pass


def navegador():
    for p in NAVEGADORES:
        if os.path.isfile(p):
            return p
    return shutil.which('chrome') or shutil.which('msedge') or shutil.which('chromium')


def fallo(msg):
    print('FALLO:', msg)
    sys.exit(1)


if not os.path.isfile(os.path.join(RAIZ, '_base', 'COMMIT.txt')):
    fallo('no hay _base/. Ejecuta primero: python herramientas/base.py')
exe = navegador()
if not exe:
    fallo('no encuentro Chrome ni Edge')

def pasada():
    LISTO.clear()
    servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Peticion, directory=RAIZ))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{servidor.server_port}/herramientas/pruebas/index.html?auto={",".join(JUEGOS)}&tam={TAM}'
    perfil = tempfile.mkdtemp(prefix='comprobar-')
    proceso = subprocess.Popen([exe, '--headless=new', '--disable-gpu', '--no-first-run', '--mute-audio', f'--user-data-dir={perfil}',
                               '--autoplay-policy=no-user-gesture-required', url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        terminado = LISTO.wait(600)
    finally:
        proceso.kill()
        servidor.shutdown()
        shutil.rmtree(perfil, ignore_errors=True)
    if not terminado:
        fallo('el comparador no terminó en 10 minutos')
    resultados = json.loads(RESULTADO['json'])


    bien = True
    for R in resultados:
        if 'fallo' in R:
            bien = False
            print(f'  {R["juego"]}: el comparador falló\n{R["fallo"]}')
            continue
        ruido = set(R['ruido'])
        reales = [d for d in R['difs'] if d['paso'] not in ruido]
        ok = not reales and not R['erroresAhora'] and R['pasos'] == R['pasosAhora']
        bien &= ok
        print(f'  {R["juego"]}: {R["pasos"]} comprobaciones, {len(reales)} distintas, {len(R["erroresAhora"])} errores ahora ({len(R["erroresAntes"])} antes), {len(ruido)} ignoradas por cambiar solas')
        for d in reales[:10]:
            print('    ✗', json.dumps(d, ensure_ascii=False)[:400])
        for e in R['erroresAhora'][:5]:
            print('    error:', e[:300])
    return bien


def archivos_grandes(limite=30 * 1024):   # el plan de refactor quiere ninguno por encima de ~25 KB: aquí solo se avisa
    out = []
    for ext in ('js', 'css'):
        for dir, dirs, files in os.walk(RAIZ):
            dirs[:] = [d for d in dirs if d not in ('_base', '.git', 'node_modules', 'herramientas')]
            out += [(os.path.getsize(os.path.join(dir, f)), os.path.relpath(os.path.join(dir, f), RAIZ).replace(os.sep, '/')) for f in files if f.endswith('.' + ext)]
    return sorted((t, r) for t, r in out if t > limite)[::-1]


print('Antes (_base/):', open(os.path.join(RAIZ, '_base', 'COMMIT.txt'), encoding='utf-8').read().strip())
for intento in range(1, 4):   # algunas animaciones cambian solas y pueden colarse como diferencia: una diferencia real sale en todos los intentos
    print(f'Comparando {", ".join(JUEGOS)} ({TAM}), intento {intento} de 3…')
    if pasada():
        resultado = 'TODO IGUAL'
        break
else:
    resultado = 'FALLO'
g = archivos_grandes()
print(f'ARCHIVOS > 30 KB: {len(g)}' + (f'  (los 5 mayores: {", ".join(f"{r} {t // 1024}KB" for t, r in g[:5])})' if g else ''))
print(resultado)
sys.exit(0 if resultado == 'TODO IGUAL' else 1)
