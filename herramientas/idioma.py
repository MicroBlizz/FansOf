"""Pasa el guion del comparador por cada juego con otro idioma y lista lo que sigue en español (para completar los diccionarios).

Uso, desde la raíz del repositorio:   python herramientas/idioma.py [rumble] [td] [--lang=en] [--todo]
Sale con código 0 si no queda nada con pinta de español y no hay errores, y con 1 si queda algo. Con --todo escribe además todos los textos
pendientes, tal cual, en el archivo que sale en pantalla (uno por línea), para ir traduciéndolos.

Arranca un servidor temporal y abre el comparador en Chrome o Edge sin ventana (como comprobar.py). Solo ve lo que el guion visita.
"""
import functools, http.server, json, os, re, shutil, subprocess, sys, tempfile, threading
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JUEGOS = [a for a in sys.argv[1:] if not a.startswith('--')] or ['rumble', 'td']
LANG = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--lang=')), 'en')
TODO = '--todo' in sys.argv
NAVEGADORES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]
LETRA = re.compile('[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]')
# lo que delata un texto en español: letras propias o palabras muy comunes (en inglés no existen)
ESPANOL = re.compile('[áíóúñ¡¿]|\\b(el|la|los|las|del|que|con|para|por|tu|tus|una|más|solo|cada|todos|sin|nivel|oro|gemas|de|en|y)\\b', re.I)
IGNORA = re.compile('^(AUTO|Español|ESPAÑOL|ENGLISH|Idioma / Language|.*(Microblizz|Phony).*)$')


class Textos(HTMLParser):
    def __init__(s):
        super().__init__()
        s.out = []
        s.skip = 0

    def handle_starttag(s, tag, attrs):
        if tag in ('script', 'style'):
            s.skip += 1
        for k, v in attrs:
            if k in ('title', 'aria-label', 'placeholder', 'alt') and v and LETRA.search(v):
                s.out.append(' '.join(v.split()))

    def handle_endtag(s, tag):
        if tag in ('script', 'style') and s.skip:
            s.skip -= 1

    def handle_data(s, d):
        if not s.skip and d.strip() and LETRA.search(d):
            s.out.append(' '.join(d.split()))


RESULTADO = {}
LISTO = threading.Event()


class Peticion(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        RESULTADO['json'] = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode('utf-8')
        self.send_response(204)
        self.end_headers()
        LISTO.set()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0].endswith('/sw.js'):
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


sys.stdout.reconfigure(encoding='utf-8')
exe = navegador()
if not exe:
    print('FALLO: no encuentro Chrome ni Edge')
    sys.exit(1)
servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Peticion, directory=RAIZ))
threading.Thread(target=servidor.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{servidor.server_port}/herramientas/pruebas/index.html?auto={",".join(JUEGOS)}&lang={LANG}'
perfil = tempfile.mkdtemp(prefix='idioma-')
proceso = subprocess.Popen([exe, '--headless=new', '--disable-gpu', '--no-first-run', '--mute-audio', f'--user-data-dir={perfil}', '--lang=es-ES',
                           '--autoplay-policy=no-user-gesture-required', url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    terminado = LISTO.wait(600)
finally:
    proceso.kill()
    servidor.shutdown()
    shutil.rmtree(perfil, ignore_errors=True)
if not terminado:
    print('FALLO: el comparador no terminó en 10 minutos')
    sys.exit(1)

limpio = True
pendientes = []
for R in json.loads(RESULTADO['json']):
    if 'fallo' in R:
        print(f'{R["juego"]}: el comparador falló\n{R["fallo"]}')
        limpio = False
        continue
    vistos = [x for x in dict.fromkeys(' '.join(x.split()) for x in R['pendientes']) if not IGNORA.match(x)]   # los textos originales, tal como los escribe el juego
    print(f'{R["juego"]} ({LANG}): {len(vistos)} textos con pinta de español, {len(R["errores"])} errores')
    for x in vistos[:60]:
        print('  ·', x[:150])
    if len(vistos) > 60:
        print(f'  … y {len(vistos) - 60} más')
    for e in R['errores'][:5]:
        print('  !', e[:200])
    pendientes += vistos
    limpio &= not vistos and not R['errores']
if TODO:
    ruta = os.path.join(tempfile.gettempdir(), 'idioma-pendiente.txt')
    open(ruta, 'w', encoding='utf-8').write('\n'.join(dict.fromkeys(pendientes)) + '\n')
    print('Pendientes escritos en', ruta)
print('TODO TRADUCIDO' if limpio else 'QUEDA POR TRADUCIR')
sys.exit(0 if limpio else 1)
