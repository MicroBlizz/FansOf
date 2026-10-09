"""Mide el balance de las habilidades y los objetos de Rumble con partidas «espejo» jugadas por la IA, sin abrir el navegador a mano. Ver PLAN-BALANCE.md.

Uso, desde la raíz del repositorio:
    python herramientas/balance.py [habilidades|objetos|todo|id1,id2…] [--semillas=12] [--procesos=2] [--valor=dlc:0.5]

  habilidades (por defecto), objetos, todo, o una lista de ids (por ejemplo dlc,piel,gafas_pixel).
  --semillas   partidas por facción y lado (12 = 216 partidas por habilidad u objeto: unos ±0,1 de margen).
  --procesos   cuántos Chrome a la vez (uno por núcleo del procesador va bien).
  --valor      prueba otro valor central de UNA habilidad sin tocar el juego (dlc:0.5 = el DLC devuelve 0,5).
  Chrome o Edge se buscan solos; si no, pon su ruta en la variable CHROME.

Arranca un servidor temporal, abre herramientas/pruebas/balance.html en varios Chrome sin ventana (cada uno juega una parte),
junta las partidas, enseña el resumen y lo guarda en _balance/ (ultimo.json con todas las partidas y resumen.txt).
"""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading, time

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUE = next((a for a in sys.argv[1:] if not a.startswith('--')), 'habilidades')
opc = lambda n, d: next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith(f'--{n}=')), d)
SEMILLAS, PROCESOS, VALOR = int(opc('semillas', '12')), max(1, int(opc('procesos', '2'))), opc('valor', '')
NAVEGADORES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]
RESULTADOS, PROGRESO, LOCK = [], {}, threading.Lock()


class Peticion(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):   # la página manda aquí su progreso y, al acabar, sus partidas
        cuerpo = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode('utf-8'))
        with LOCK:
            if self.path.startswith('/__progreso'):
                PROGRESO[cuerpo['parte']] = (cuerpo['hechas'], cuerpo['total'])
            else:
                RESULTADOS.append(cuerpo)
        self.send_response(204)
        self.end_headers()

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
    if os.environ.get('CHROME') and os.path.isfile(os.environ['CHROME']):
        return os.environ['CHROME']
    for p in NAVEGADORES:
        if os.path.isfile(p):
            return p
    return shutil.which('chrome') or shutil.which('msedge') or shutil.which('chromium') or shutil.which('google-chrome')


def resumen(partidas):   # lo mismo que resume() en balance-pagina.js
    g = {}
    for r in partidas:
        x = g.setdefault(r['id'], {'n': 0, 'gana': 0, 'margen': 0, 'seg': 0})
        x['n'] += 1
        x['gana'] += 1 if r['w'] == r['lado'] else 0.5 if r['w'] == '-' else 0
        x['margen'] += (r['vp'] - r['ve']) if r['lado'] == 'p' else (r['ve'] - r['vp'])
        x['seg'] += r['s']
    filas = [(k, v['margen'] / v['n'], 100 * v['gana'] / v['n'], v['n'], v['seg'] / v['n']) for k, v in g.items()]
    return sorted(filas, key=lambda f: -f[1])


exe = navegador()
if not exe:
    print('FALLO: no encuentro Chrome ni Edge (pon su ruta en la variable CHROME)')
    sys.exit(1)
servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Peticion, directory=RAIZ))
threading.Thread(target=servidor.serve_forever, daemon=True).start()
procesos, perfiles, t0 = [], [], time.time()
print(f'Midiendo «{QUE}» con {SEMILLAS} semillas en {PROCESOS} procesos{" · valor " + VALOR if VALOR else ""}…')
try:
    for k in range(1, PROCESOS + 1):
        perfil = tempfile.mkdtemp(prefix='balance-')
        perfiles.append(perfil)
        url = f'http://127.0.0.1:{servidor.server_port}/herramientas/pruebas/balance.html?auto=1&que={QUE}&semillas={SEMILLAS}&parte={k}/{PROCESOS}&valor={VALOR}'
        procesos.append(subprocess.Popen([exe, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--mute-audio', '--lang=es-ES', f'--user-data-dir={perfil}',
                                          '--disable-background-timer-throttling', '--disable-renderer-backgrounding', url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
    ultimo = ''
    while len(RESULTADOS) < PROCESOS and time.time() - t0 < 6 * 3600:
        time.sleep(5)
        with LOCK:
            h, t = sum(v[0] for v in PROGRESO.values()), sum(v[1] for v in PROGRESO.values())
        txt = f'  {h} de {t} partidas ({int(time.time() - t0)} s)' if t else ''
        if txt and txt != ultimo:
            print(txt, flush=True)
            ultimo = txt
finally:
    for p in procesos:
        p.kill()
    servidor.shutdown()
    for p in perfiles:
        shutil.rmtree(p, ignore_errors=True)

fallos = [r['fallo'] for r in RESULTADOS if 'fallo' in r]
if fallos or len(RESULTADOS) < PROCESOS:
    print('FALLO:', fallos[0][:600] if fallos else 'la medición no terminó')
    sys.exit(1)
partidas = [p for r in RESULTADOS for p in r['partidas']]
version = RESULTADOS[0].get('version', '')
lineas = [f'Balance de Rumble {version} · «{QUE}» · {len(partidas)} partidas · {SEMILLAS} semillas{" · valor " + VALOR if VALOR else ""} · {time.strftime("%Y-%m-%d %H:%M")}',
          'Margen = torres de ventaja al final de quien lo lleva (0 = nada; más de 1,9 = demasiado fuerte; menos de 0,5 = casi no hace nada).', '',
          f'{"Qué":<24}{"Margen":>8}{"Gana":>9}{"Partidas":>10}{"Dura":>7}']
for k, m, g, n, s in resumen(partidas):
    aviso = '  ← demasiado fuerte' if m > 1.9 else '  ← casi no hace nada' if m < 0.5 else ''
    lineas.append(f'{k:<24}{m:>8.2f}{g:>8.1f}%{n:>10}{s:>6.0f}s{aviso}')
print('\n'.join(lineas))
os.makedirs(os.path.join(RAIZ, '_balance'), exist_ok=True)
with open(os.path.join(RAIZ, '_balance', 'ultimo.json'), 'w', encoding='utf-8') as f:
    json.dump(partidas, f)
with open(os.path.join(RAIZ, '_balance', 'resumen.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lineas) + '\n')
print(f'\nGuardado en _balance/ ({int(time.time() - t0)} s).')
