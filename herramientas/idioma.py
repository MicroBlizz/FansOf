"""Pasa el guion del comparador por cada juego con otro idioma y lista lo que sigue en español (para completar los diccionarios).

Uso, desde la raíz del repositorio:   python herramientas/idioma.py [rumble] [td] [--lang=en] [--todo]
Sale con código 0 si no queda nada con pinta de español y no hay errores, y con 1 si queda algo. Con --todo escribe además todos los textos
pendientes, tal cual, en el archivo que sale en pantalla (uno por línea), para ir traduciéndolos.

Arranca un servidor temporal y abre el comparador en Chrome o Edge sin ventana (como comprobar.py). Solo ve lo que el guion visita.
"""
import functools, glob, http.server, json, os, re, shutil, subprocess, sys, tempfile, threading
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
# con --lang=es se busca lo contrario: inglés que se ha colado en el juego en español
INGLES = re.compile(r'\b(the|and|you|your|of|to|is|are|with|for|from|this|that|it|on|in|at|by|not|have|will|can|get|first|time|loading|click|tap|press)\b', re.I)
IGNORA = re.compile('^(AUTO|SinSueño_Dev|Español|ESPAÑOL|ENGLISH|Idioma / Language|.*(Microblizz|Phony).*)$')


class Textos(HTMLParser):
    VACIAS = ('br', 'img', 'input', 'hr', 'meta', 'link')

    def __init__(s):
        super().__init__()
        s.out = []
        s.skip = 0
        s.pila = []   # (etiqueta, es la historia de versiones): lo de dentro de #news-body no se mira

    def mirar(s):
        return not s.skip and not any(n for _, n in s.pila)

    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            s.skip += 1
        if tag not in s.VACIAS:
            s.pila.append((tag, a.get('id') == 'news-body'))
        if not s.mirar():
            return
        for k, v in attrs:
            if k in ('title', 'aria-label', 'placeholder', 'alt') and v and LETRA.search(v):
                s.out.append(' '.join(v.split()))

    def handle_endtag(s, tag):
        if tag in ('script', 'style') and s.skip:
            s.skip -= 1
        for i in range(len(s.pila) - 1, -1, -1):
            if s.pila[i][0] == tag:
                del s.pila[i:]
                break

    def handle_data(s, d):
        if s.mirar() and d.strip() and LETRA.search(d):
            s.out.append(' '.join(d.split()))


def novedades(juego):
    """Texto de las entradas ANTIGUAS de novedades (la historia no se traduce; incluye la última, que se comprueba aparte) y las frases de la entrada más nueva (esas sí)."""
    ruta = os.path.join(RAIZ, 'games', juego, 'js', 'novedades.js')
    if not os.path.isfile(ruta):
        return '', []
    t = open(ruta, encoding='utf-8').read()
    trozos = re.split(r"\n  \{ v: '", t)
    frases = re.findall(r"'((?:[^'\\]|\\.)*)'", "'" + trozos[1]) [1:] if len(trozos) > 1 else []
    return '\n'.join(trozos[1:]), [f.replace("\\'", "'") for f in frases if LETRA.search(f) and ' ' in f]


def diccionario(juego):
    t = ''
    for d in (os.path.join(RAIZ, 'core', 'idioma'), os.path.join(RAIZ, 'games', juego, 'idioma')):
        if os.path.isdir(d):
            for f in os.listdir(d):
                t += open(os.path.join(d, f), encoding='utf-8').read()
    return t


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
    for p in sorted(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome')):
        return p
    return shutil.which('chrome') or shutil.which('msedge') or shutil.which('chromium')


sys.stdout.reconfigure(encoding='utf-8')
limpio = True
if shutil.which('node'):   # un diccionario con un error de sintaxis (una coma olvidada) no se carga y el navegador no avisa: sus frases salen en español
    for d in [os.path.join(RAIZ, 'core', 'idioma')] + [os.path.join(RAIZ, 'games', j, 'idioma') for j in JUEGOS]:
        for f in sorted(os.listdir(d)) if os.path.isdir(d) else []:
            r = subprocess.run(['node', '--check', os.path.join(d, f)], capture_output=True, text=True)
            if r.returncode:
                print('DICCIONARIO CON ERROR:', os.path.relpath(os.path.join(d, f), RAIZ), '\n ', (r.stderr.strip().splitlines() or [''])[0:5])
                limpio = False
exe = navegador()
if not exe:
    print('FALLO: no encuentro Chrome ni Edge')
    sys.exit(1)
servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Peticion, directory=RAIZ))
threading.Thread(target=servidor.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{servidor.server_port}/herramientas/pruebas/index.html?auto={",".join(JUEGOS)}&lang={LANG}'
perfil = tempfile.mkdtemp(prefix='idioma-')
proceso = subprocess.Popen([exe, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--mute-audio', f'--user-data-dir={perfil}', '--lang=es-ES',
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

pendientes = []
for R in json.loads(RESULTADO['json']):
    if 'fallo' in R:
        print(f'{R["juego"]}: el comparador falló\n{R["fallo"]}')
        limpio = False
        continue
    vistos = []   # solo cuenta lo que ha quedado de verdad en pantalla (R['pendientes'] trae trozos sueltos que luego sí se traducen)
    for h in R.get('htmls', []):   # lo que ha quedado de verdad en pantalla, ya traducido
        t = Textos()
        t.feed(h)
        vistos += [x for x in t.out if (INGLES if LANG == 'es' else ESPANOL).search(x) and not IGNORA.match(x)]
    vistos = list(dict.fromkeys(vistos))
    antiguas, nuevas = novedades(R['juego'])
    vistos = [x for x in vistos if not x.startswith(': ') and x.lstrip(': ·')[:25] not in antiguas]   # la historia de versiones no se traduce
    dic = diccionario(R['juego'])
    for f in nuevas:   # la entrada de novedades más nueva sí: la ve todo el mundo al actualizar
        if re.search(r'[a-z]{3}', f) and f.replace('\\', '\\\\').replace('"', '\\"') not in dic and f not in dic:
            vistos.append('NOVEDADES (última versión) sin inglés: ' + f[:110])
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
