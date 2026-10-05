"""Pasa a core/css/menus.css los estilos de los menús del Rumble (games/rumble/css/estilos.css).

Uso, desde la raíz del repositorio:   python herramientas/sincronizar.py

Es lo único de core/ que todavía se copia del Rumble: el código (la serie, el sonido, las horas extra, los retos, las novedades)
ya tiene una sola copia en core/ y la usan todos los juegos.
"""
import subprocess, sys
r = subprocess.run([sys.executable, 'herramientas/estilos_menus.py'], capture_output=True, text=True, encoding='utf-8')
if r.returncode: sys.exit('FALLA estilos_menus.py: ' + r.stderr.strip().splitlines()[-1])
print(r.stdout.strip())
