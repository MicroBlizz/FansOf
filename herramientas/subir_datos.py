"""Saca de un juego las cifras que el servidor necesita (probabilidades, costes, calidades, qué sale de cada rareza) y escribe el SQL para subirlas.

Uso, desde la raíz del repositorio:   python herramientas/subir_datos.py [rumble] [td]      (por defecto, los dos)

Abre herramientas/datos.html en Chrome o Edge sin ventana, que carga el juego y lee sus datos. Así las cifras se escriben una sola vez, en el juego.
Deja el resultado en servidor/datos/<juego>.json y servidor/datos/<juego>.sql (un «insert … on conflict update» de la tabla tablas_juego).
La versión sube sola si los datos han cambiado respecto al .json anterior. PLAN-CUENTAS.md, punto 15.
"""
import functools, hashlib, http.server, json, os, shutil, subprocess, sys, tempfile, threading

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JUEGOS = [a for a in sys.argv[1:] if not a.startswith('--')] or ['rumble', 'td']
NAVEGADORES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]
RESULTADO, LISTO = {}, threading.Event()


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


exe = next((p for p in NAVEGADORES if os.path.isfile(p)), None) or shutil.which('chrome') or shutil.which('msedge') or shutil.which('chromium')
if not exe:
    sys.exit('FALLO: no encuentro Chrome ni Edge')
os.makedirs(os.path.join(RAIZ, 'servidor', 'datos'), exist_ok=True)
malo = False
for juego in JUEGOS:
    LISTO.clear()
    RESULTADO.clear()
    servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Peticion, directory=RAIZ))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    perfil = tempfile.mkdtemp(prefix='datos-')
    proceso = subprocess.Popen([exe, '--headless=new', '--disable-gpu', '--no-first-run', '--mute-audio', f'--user-data-dir={perfil}',
                               f'http://127.0.0.1:{servidor.server_port}/herramientas/datos.html?juego={juego}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ok = LISTO.wait(90)
    finally:
        proceso.kill()
        servidor.shutdown()
        shutil.rmtree(perfil, ignore_errors=True)
    if not ok:
        print(f'FALLO: {juego}: el navegador no devolvió los datos')
        malo = True
        continue
    datos = json.loads(RESULTADO['json'])
    if 'fallo' in datos or not datos.get('econ') or not datos.get('habilidades') or not datos.get('premios', {}).get('gift'):
        print(f'FALLO: {juego}: datos incompletos', str(datos)[:300])
        malo = True
        continue
    ruta = os.path.join(RAIZ, 'servidor', 'datos', juego + '.json')
    cuerpo = json.dumps(datos, ensure_ascii=False, sort_keys=True, indent=1)
    version = 1
    if os.path.isfile(ruta):
        antes = json.load(open(ruta, encoding='utf-8'))
        version = antes.get('version', 1)
        antes.pop('version', None)
        if hashlib.sha1(json.dumps(antes, sort_keys=True).encode()).hexdigest() != hashlib.sha1(json.dumps(datos, sort_keys=True).encode()).hexdigest():
            version += 1
    datos['version'] = version
    cuerpo = json.dumps(datos, ensure_ascii=False, sort_keys=True, indent=1)
    open(ruta, 'w', encoding='utf-8').write(cuerpo + '\n')
    plano = json.dumps(datos, ensure_ascii=False, sort_keys=True, separators=(',', ':')).replace("'", "''")
    sql = (f"insert into public.tablas_juego (juego, version, datos) values ('{juego}', {version}, '{plano}'::jsonb)\n"
           f"on conflict (juego) do update set version = excluded.version, datos = excluded.datos, cambiado = now();\n")
    open(os.path.join(RAIZ, 'servidor', 'datos', juego + '.sql'), 'w', encoding='utf-8').write(sql)
    print(f'{juego}: versión {version}, {len(datos["habilidades"])} habilidades, {len(datos["objetos"])} objetos, {len(datos["cartas"])} cartas -> servidor/datos/{juego}.sql')
sys.exit(1 if malo else 0)
