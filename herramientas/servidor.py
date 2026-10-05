"""Servidor local para probar los juegos mientras se trabaja en ellos.

Uso, desde la raíz del repositorio:   python herramientas/servidor.py [puerto]      (por defecto, el 8765)
Después abre http://localhost:8765/ en el navegador.

Se diferencia de `python -m http.server` en dos cosas:
  · Nunca deja que el navegador guarde copias: al recargar se ve siempre lo último que has escrito.
  · No sirve los sw.js (el modo sin conexión), para que una copia guardada no tape tus cambios.
    Para probar justo eso, añade --con-sw.
"""
import http.server, os, sys

args = [a for a in sys.argv[1:] if not a.startswith('--')]
PUERTO = int(args[0]) if args else 8765
CON_SW = '--con-sw' in sys.argv
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Peticion(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RAIZ, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if not CON_SW and self.path.split('?')[0].endswith('/sw.js'):
            self.send_error(404, 'El modo sin conexión está apagado en este servidor de pruebas')
            return
        super().do_GET()

    def log_message(self, fmt, *a):   # solo se avisa de lo que falla
        if len(a) > 1 and str(a[1]).startswith(('4', '5')):
            super().log_message(fmt, *a)


if __name__ == '__main__':
    print(f'Fans Of en http://localhost:{PUERTO}/  (Ctrl+C para parar)')
    http.server.ThreadingHTTPServer(('127.0.0.1', PUERTO), Peticion).serve_forever()
