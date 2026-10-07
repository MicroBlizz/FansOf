"""Publica la web (GitHub Pages sirve la rama gh-pages) de forma controlada, y permite volver atrás.

Idea: se puede hacer commit y subir a main siempre (TODO, planes, trabajo a medias) sin generar versión ni desplegar nada.
La versión nueva y las novedades salen JUNTAS al publicar, y solo para los juegos que han cambiado desde la última publicación.

Uso, desde la raíz del repositorio:
  python herramientas/publicar.py                  publica: sube la versión de los juegos que han cambiado, estrena sus novedades pendientes, etiqueta,
                                                   sube main y la etiqueta, mueve gh-pages y comprueba la web real
  python herramientas/publicar.py --desplegar      despliega main tal como está, sin subir versiones (para terminar una publicación que se quedó a medias,
                                                   por ejemplo si una sesión sin permiso de etiquetas ya subió el commit «Versión: …» a main)
  python herramientas/publicar.py --version rumble=0.10.0   fija la versión de un juego en vez de subir el último número (puede repetirse)
  python herramientas/publicar.py --ver            enseña qué se publicaría (juegos que cambian y su versión nueva) sin hacer nada
  python herramientas/publicar.py --lista          las últimas publicaciones (etiqueta, fecha, versiones) y cuál está en la web
  python herramientas/publicar.py --estado         compara main, gh-pages y lo que sirve la web ahora mismo
  python herramientas/publicar.py --a <etiqueta>   vuelve la web a una publicación anterior (sin tocar main)

Novedades pendientes: mientras se trabaja, la entrada nueva de games/<juego>/js/novedades.js lleva `v: 'proxima'`. Al publicar, el script la
convierte en la versión que toca. Si un juego cambia y no tiene entrada pendiente, se publica sin novedades (el script lo avisa).
Qué cuenta como cambio de un juego: lo que cambie en games/<juego>/ (solo ese juego) o en core/ y raíz (todos). Documentos, TODO, planes, SQL y
herramientas no generan versión ni se publican.
Reglas: gh-pages NO se toca a mano, solo es un puntero a una etiqueta `web-AAAAMMDD-HHMM` de main. Nunca se usa `git push` a secas: este script
deja la configuración local para que un push normal suba solo main. Los cambios del servidor (Supabase) no vuelven con la web: deben seguir
siendo compatibles con versiones anteriores. Detalles en README.md (Publicar).
"""
import datetime, os, re, subprocess, sys, time, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = 'https://microblizz.github.io/FansOf/'
JUEGOS = sorted(d for d in os.listdir(os.path.join(RAIZ, 'games')) if os.path.isfile(os.path.join(RAIZ, 'games', d, 'index.html')))   # todos los juegos de games/


def git(*a, ok=False):
    r = subprocess.run(['git', *a], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    if r.returncode and not ok:
        sys.exit(f'FALLO: git {" ".join(a)}\n{(r.stderr or r.stdout).strip()}')
    return r.stdout.strip() if not r.returncode else ''


def versiones_de(ref):
    """Las versiones (?v= de nucleo.js) que lleva cada juego en un commit o etiqueta."""
    out = {}
    for j in JUEGOS:
        html = git('show', f'{ref}:games/{j}/index.html', ok=True)
        m = re.search(r'nucleo\.js\?v=([0-9.]+)', html)
        out[j] = m.group(1) if m else '?'
    return out


def versiones_web():
    out = {}
    for j in JUEGOS:
        try:
            html = urllib.request.urlopen(urllib.request.Request(f'{WEB}games/{j}/?x={int(time.time())}', headers={'Cache-Control': 'no-cache'}), timeout=15).read().decode('utf-8', 'replace')
            m = re.search(r'nucleo\.js\?v=([0-9.]+)', html)
            out[j] = m.group(1) if m else '?'
        except Exception:
            out[j] = 'sin respuesta'
    return out


def texto(v):
    return ' · '.join(f'{j} {v[j]}' for j in JUEGOS)


def cambios_desde_web():
    """Qué juegos cambian respecto a lo que está en la web (gh-pages): (juegos que suben de versión, ¿hay algo de la web sin juego?)."""
    base = git('rev-parse', 'origin/gh-pages', ok=True)
    rango = f'{base}..HEAD' if base else 'HEAD'
    ficheros = git('diff', '--name-only', rango, '--', 'core', 'games', 'gestion', 'index.html', 'sw.js', ok=True).splitlines() if base else ['core/x']
    juegos, resto = set(), False
    for fch in ficheros:
        p = fch.split('/')
        if p[0] == 'games' and len(p) > 2 and p[1] in JUEGOS:
            juegos.add(p[1])
        elif p[0] in ('core', 'index.html', 'sw.js'):
            juegos.update(JUEGOS)
        else:
            resto = True
    return sorted(juegos), resto


def siguiente(v):
    p = v.split('.')
    p[-1] = str(int(p[-1]) + 1)
    return '.'.join(p)


def subir_versiones(juegos, fijas):
    """Escribe la versión nueva en el index.html de cada juego y estrena su entrada de novedades pendiente (v: 'proxima')."""
    nuevas, sin_novedades = {}, []
    for j in juegos:
        ruta = os.path.join(RAIZ, 'games', j, 'index.html')
        html = open(ruta, encoding='utf-8', newline='').read()
        m = re.search(r'nucleo\.js\?v=([0-9.]+)', html)
        v = fijas.get(j) or siguiente(m.group(1))
        open(ruta, 'w', encoding='utf-8', newline='').write(html.replace(m.group(0), f'nucleo.js?v={v}', 1))
        nov = os.path.join(RAIZ, 'games', j, 'js', 'novedades.js')
        if os.path.isfile(nov):
            t = open(nov, encoding='utf-8', newline='').read()
            if "v: 'proxima'" in t:
                open(nov, 'w', encoding='utf-8', newline='').write(t.replace("v: 'proxima'", f"v: '{v}'", 1))
            else:
                sin_novedades.append(j)
        nuevas[j] = v
    return nuevas, sin_novedades


def pendientes_sin_publicar():
    """Juegos con una entrada 'proxima' que no se va a publicar (porque el juego no ha cambiado)."""
    out = []
    for j in JUEGOS:
        nov = os.path.join(RAIZ, 'games', j, 'js', 'novedades.js')
        if os.path.isfile(nov) and "v: 'proxima'" in open(nov, encoding='utf-8').read():
            out.append(j)
    return out


def preparar_git():
    """Un `git push` a secas sube solo main (antes subía también gh-pages y se olvidaba de la etiqueta)."""
    git('config', '--unset-all', 'remote.origin.push', ok=True)
    git('config', '--add', 'remote.origin.push', 'refs/heads/main:refs/heads/main')


def esperar_web(esperado):
    print('Esperando a que GitHub Pages sirva esa versión (puede tardar un par de minutos)…')
    ultimo = {}
    for _ in range(24):
        ultimo = versiones_web()
        if all(ultimo[j] == esperado[j] for j in JUEGOS):
            print(f'OK: la web sirve {texto(ultimo)}')
            return True
        time.sleep(10)
    print(f'AVISO: pasados 4 minutos la web sirve {texto(ultimo)} y se esperaba {texto(esperado)}. Mira Actions/Pages en GitHub y vuelve a ejecutar --estado.')
    return False


def etiquetas():
    out = git('for-each-ref', '--sort=-creatordate', '--format=%(refname:short)|%(creatordate:format:%Y-%m-%d %H:%M)|%(objectname)', 'refs/tags/web-*', ok=True)
    return [l.split('|') for l in out.splitlines() if l]


def lista():
    git('fetch', '-q', 'origin', '--tags', ok=True)
    pages = git('rev-parse', 'origin/gh-pages', ok=True)
    print('Publicaciones recientes (la que sirve la web lleva «◀ en la web»):')
    for nombre, cuando, _ in etiquetas()[:12]:
        c = git('rev-list', '-n1', nombre)
        print(f'  {nombre}   {cuando}   {texto(versiones_de(c))}{"   ◀ en la web" if c == pages else ""}')
    if not etiquetas():
        print('  (todavía no hay ninguna etiqueta web-*)')


def estado():
    git('fetch', '-q', 'origin', ok=True)
    main, pages = git('rev-parse', 'origin/main'), git('rev-parse', 'origin/gh-pages')
    print(f'main:      {main[:8]}  {texto(versiones_de(main))}')
    print(f'gh-pages:  {pages[:8]}  {texto(versiones_de(pages))}')
    print(f'web viva:  {texto(versiones_web())}')
    print('Pendiente de publicar: ' + (git('rev-list', '--count', 'origin/gh-pages..origin/main') or '0') + ' commits')


def volver_a(etiqueta):
    git('fetch', '-q', 'origin', '--tags', ok=True)
    if not git('tag', '--list', etiqueta):
        sys.exit(f'FALLO: no existe la etiqueta {etiqueta}. Mira --lista.')
    c = git('rev-list', '-n1', etiqueta)
    v = versiones_de(c)
    print(f'Volviendo la web a {etiqueta} ({texto(v)})…')
    git('push', '--force', 'origin', f'{c}:refs/heads/gh-pages')
    esperar_web(v)


def publicar(solo_ver, fijas):
    preparar_git()
    git('fetch', '-q', 'origin', '--tags', ok=True)
    if git('branch', '--show-current') != 'main':
        sys.exit('FALLO: hay que estar en la rama main.')
    if git('status', '--porcelain', '--untracked-files=no'):
        sys.exit('FALLO: hay cambios sin guardar. Haz commit antes de publicar.')
    if git('rev-list', '--count', 'HEAD..origin/main') != '0':
        sys.exit('FALLO: main de GitHub tiene commits que no tienes. Haz git pull --rebase origin main antes.')
    juegos, resto = cambios_desde_web()
    for j in fijas:
        if j not in JUEGOS:
            sys.exit(f'FALLO: no existe el juego {j} en games/.')
        if j not in juegos:
            juegos.append(j)
    if not juegos and not resto:
        print('Nada que publicar: ningún juego ni archivo de la web ha cambiado desde la última publicación.')
        sin = pendientes_sin_publicar()
        if sin:
            print('Aviso: hay novedades pendientes de ' + ', '.join(sin) + ' pero su juego no ha cambiado.')
        return
    actuales = versiones_de('HEAD')
    previstas = {j: fijas.get(j) or siguiente(actuales[j]) for j in juegos}
    print('Se publicaría: ' + (' · '.join(f'{j} {actuales[j]} → {previstas[j]}' for j in juegos) if juegos else 'solo archivos de la web (sin versión nueva)'))
    cambiados = ', '.join(juegos)
    sin = [j for j in pendientes_sin_publicar() if j not in juegos]
    if sin:
        print('Aviso: ' + ', '.join(sin) + ' tiene novedades pendientes pero no cambia, así que no se publican todavía.')
    if solo_ver:
        return
    if juegos:
        nuevas, sin_nov = subir_versiones(juegos, fijas)
        if sin_nov:
            print('Aviso: sin entrada de novedades pendiente para ' + ', '.join(sin_nov) + ': se publica sin novedades.')
        git('add', '-A', 'games')
        git('commit', '-q', '-m', 'Versión: ' + ' · '.join(f'{j} {v}' for j, v in nuevas.items()))
    desplegar()


def desplegar():
    preparar_git()
    git('fetch', '-q', 'origin', '--tags', ok=True)
    if git('branch', '--show-current') != 'main':
        sys.exit('FALLO: hay que estar en la rama main.')
    if git('status', '--porcelain', '--untracked-files=no'):
        sys.exit('FALLO: hay cambios sin guardar. Haz commit antes de publicar.')
    if git('rev-parse', 'origin/gh-pages', ok=True) == git('rev-parse', 'HEAD'):
        print(f'Nada que desplegar: la web ya apunta a main ({texto(versiones_web())}).')
        return
    v = versiones_de('HEAD')
    nombre = 'web-' + datetime.datetime.now().strftime('%Y%m%d-%H%M')
    print(f'Publicando {git("rev-parse", "--short", "HEAD")} como {nombre}: {texto(v)}')
    print('  ' + (git('log', '--oneline', 'origin/gh-pages..HEAD', ok=True).replace('\n', '\n  ') or '(sin commits nuevos)'))
    git('tag', '-a', nombre, '-m', f'Publicación: {texto(v)}')
    git('push', 'origin', 'main')
    git('push', 'origin', nombre)
    git('push', 'origin', f'{nombre}^{{commit}}:refs/heads/gh-pages')
    if not esperar_web(v):
        sys.exit(1)


a = sys.argv[1:]
if '--lista' in a:
    lista()
elif '--estado' in a:
    estado()
elif '--desplegar' in a:
    desplegar()
elif '--a' in a:
    if a.index('--a') + 1 >= len(a):
        sys.exit('Uso: --a <etiqueta>')
    volver_a(a[a.index('--a') + 1])
else:
    fijas = {}
    for k, x in enumerate(a):
        if x == '--version' and k + 1 < len(a) and '=' in a[k + 1]:
            j, v = a[k + 1].split('=', 1)
            fijas[j] = v
    publicar('--ver' in a, fijas)
