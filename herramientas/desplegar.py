"""Despliega la web: GitHub Pages sirve la rama gh-pages. Se despliega por juego, con core siempre al día.

Protocolo:
  - Un juego sale cuando su ?v= de nucleo.js en main es distinto del de gh-pages (y su novedades.js tiene esa versión). Los demás se quedan como están en la web.
  - Core (y todo lo que no es un juego) siempre se publica tal como está en main. Si core ha cambiado desde el último despliegue, salen TODOS los juegos: cada uno con su versión subida y su nota
    (para el resto, la nota estándar «mejoras en los sistemas internos»). Si falta alguna subida, el script no despliega y dice cuáles.
  - main nunca se rompe: lo incompleto va parcial o tras un flag, porque lo que está en main de core y de los juegos que salen se publica tal cual.

Uso, desde la raíz del repositorio:
  python herramientas/desplegar.py             despliega lo que toca según lo anterior (sube main si hace falta, publica y comprueba la web)
  python herramientas/desplegar.py --juego rumble,td    solo esos juegos (error si core ha cambiado: entonces salen todos)
  python herramientas/desplegar.py --simular   muestra qué saldría sin subir nada
  python herramientas/desplegar.py --estado    compara main, gh-pages y la web viva, juego a juego
  python herramientas/desplegar.py --lista     las últimas versiones desplegables (commits que cambiaron un ?v=) y cuál está en la web
  python herramientas/desplegar.py --a <commit>   vuelve la web entera a ese commit de main (se mira en --lista); main no se toca

Hacer commit y subir a main se puede siempre (guarda el trabajo). Desplegar es esto, y solo cuando se decide. gh-pages no se toca a mano.
Los cambios del servidor (Supabase) no vuelven con la web: deben seguir siendo compatibles con versiones anteriores.
"""
import os, re, subprocess, sys, time, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = 'https://microblizz.github.io/FansOf/'
SIMULAR = '--simular' in sys.argv
JUEGOS = sorted(d for d in os.listdir(os.path.join(RAIZ, 'games')) if os.path.isfile(os.path.join(RAIZ, 'games', d, 'index.html')))


def git(*a, ok=False):
    r = subprocess.run(['git', *a], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    if r.returncode and not ok:
        sys.exit(f'FALLO: git {" ".join(a)}\n{(r.stderr or r.stdout).strip()}')
    return r.stdout.strip() if not r.returncode else ''


def versiones_de(ref):
    out = {}
    for j in JUEGOS:
        m = re.search(r'nucleo\.js\?v=([0-9.]+)', git('show', f'{ref}:games/{j}/index.html', ok=True))
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


texto = lambda v: ' · '.join(f'{j} {v[j]}' for j in JUEGOS)


def preparar_git():
    """Un `git push` a secas sube solo main (antes subía también gh-pages)."""
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
    print(f'AVISO: pasados 4 minutos la web sirve {texto(ultimo)} y se esperaba {texto(esperado)}. Mira Actions/Pages en GitHub y prueba --estado.')
    return False


def sin_permiso(r):
    sys.exit('FALLO: GitHub no deja a esta sesión mover gh-pages.\n'
             'Pide al dueño que ejecute en su ordenador:  git pull  y  python herramientas/desplegar.py\n' + (r.stderr or '').strip())


def cambia(a, b, *rutas):
    return subprocess.run(['git', 'diff', '--quiet', a, b, '--', *rutas], cwd=RAIZ).returncode != 0


def tiene_nota(ref, j, v):
    return f"v: '{v}'" in git('show', f'{ref}:games/{j}/js/novedades.js', ok=True)


def construir(publicar, cabeza, pages):
    """Commit para gh-pages: el árbol de main, salvo los juegos que no salen, que conservan el de gh-pages."""
    r = subprocess.run(['git', 'rev-parse', '--git-dir'], cwd=RAIZ, capture_output=True, text=True)
    env = {**os.environ, 'GIT_INDEX_FILE': os.path.join(RAIZ, r.stdout.strip(), 'desplegar.idx')}

    def g(*a):
        r = subprocess.run(['git', *a], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', env=env)
        if r.returncode:
            sys.exit(f'FALLO: git {" ".join(a)}\n{(r.stderr or r.stdout).strip()}')
        return r.stdout.strip()
    g('read-tree', cabeza)
    for j in JUEGOS:
        if j not in publicar and git('rev-parse', '--verify', '-q', f'{pages}:games/{j}', ok=True):
            g('rm', '-r', '--cached', '-q', f'games/{j}')
            g('read-tree', f'--prefix=games/{j}/', f'{pages}:games/{j}')
    # versiones/lista.json: todo lo publicado, para volver a jugarlo desde la librería (herramientas/versiones.py). No vive en main.
    try:
        from versiones import generar
        blob = subprocess.run(['git', 'hash-object', '-w', '--stdin'], cwd=RAIZ, input=generar(pages, cabeza, publicar), capture_output=True, text=True, encoding='utf-8').stdout.strip()
        g('update-index', '--add', '--cacheinfo', f'100644,{blob},versiones/lista.json')
    except Exception as e:
        print(f'  Aviso: no he podido preparar la lista de versiones anteriores ({e}); la web sale igual.')
    arbol = g('write-tree')
    os.remove(env['GIT_INDEX_FILE'])
    msg = 'Despliegue: ' + ', '.join(publicar) + f' (main {cabeza[:8]})'
    return git('commit-tree', arbol, '-p', pages, '-p', cabeza, '-m', msg)


def desplegar(solo=None):
    preparar_git()
    git('fetch', '-q', 'origin', ok=True)
    if git('branch', '--show-current') != 'main':
        sys.exit('FALLO: hay que estar en la rama main.')
    if git('status', '--porcelain', '--untracked-files=no'):
        sys.exit('FALLO: hay cambios sin guardar. Haz commit antes de desplegar.')
    if git('rev-list', '--count', 'HEAD..origin/main') != '0':
        sys.exit('FALLO: main de GitHub tiene commits que no tienes. Haz git pull --rebase origin main antes.')
    v = versiones_de('HEAD')
    if '?' in v.values():
        sys.exit('FALLO: no encuentro el ?v= de nucleo.js en algún index.html.')
    cabeza = git('rev-parse', 'HEAD')
    pages = git('rev-parse', 'origin/gh-pages')
    vp = versiones_de(pages)
    core = cambia(pages, cabeza, 'core')
    if solo:
        malos = [j for j in solo if j not in JUEGOS]
        if malos:
            sys.exit(f'FALLO: juego desconocido: {", ".join(malos)}. Hay: {", ".join(JUEGOS)}.')
    publicar = [j for j in JUEGOS if (j in solo if solo else v[j] != vp[j] or core)]
    if core:
        falta = [j for j in JUEGOS if v[j] == vp[j]]
        if falta or (solo and set(solo) != set(JUEGOS)):
            sys.exit('FALLO: core ha cambiado desde el último despliegue, así que salen TODOS los juegos y cada uno con su versión subida y su nota.\n'
                     f'  Sin subir versión: {", ".join(falta) or "(ninguno)"}. Sube el ?v= de nucleo.js y añade la entrada en games/<juego>/js/novedades.js (para los que solo reciben core: «mejoras en los sistemas internos»).')
    sin_nota = [j for j in publicar if v[j] != vp[j] and not tiene_nota(cabeza, j, v[j])]
    if sin_nota:
        sys.exit(f'FALLO: falta la entrada de novedades de la nueva versión en: {", ".join(f"{j} {v[j]}" for j in sin_nota)}.')
    quedan = [j for j in JUEGOS if j not in publicar and cambia(pages, cabeza, f'games/{j}')]
    nuevo = construir(publicar, cabeza, pages)
    if not cambia(pages, nuevo, '.'):
        web = versiones_web()
        if all(web[j] == versiones_de(pages)[j] for j in JUEGOS):
            print(f'Nada que desplegar: la web ya sirve lo que toca ({texto(web)}).')
            return
        print(f'gh-pages ya está al día pero la web sirve {texto(web)}: espero a que GitHub Pages la actualice.')
        sys.exit(0 if esperar_web(versiones_de(pages)) else 1)
    print(f'Desplegando main {cabeza[:8]}: ' + ', '.join(f'{j} {vp[j]}→{v[j]}' if v[j] != vp[j] else f'{j} {v[j]}' for j in publicar) + (' (core cambiado: salen todos)' if core else ''))
    if quedan:
        print(f'  Se quedan como están en la web (con cambios en main sin subir versión): {", ".join(quedan)}')
    print('  ' + (git('log', '--oneline', 'origin/gh-pages..HEAD', ok=True).replace('\n', '\n  ') or '(sin commits nuevos)'))
    if SIMULAR:
        print('  (simulación: no se sube nada) archivos que cambiarían en la web: ' + str(len(git('diff', '--name-only', pages, nuevo).splitlines())))
        return
    git('push', 'origin', 'main')
    r = subprocess.run(['git', 'push', 'origin', f'{nuevo}:refs/heads/gh-pages'], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sin_permiso(r)
    if not esperar_web(versiones_de(nuevo)):
        sys.exit(1)


def estado():
    git('fetch', '-q', 'origin', ok=True)
    main, pages = git('rev-parse', 'origin/main'), git('rev-parse', 'origin/gh-pages')
    vm, vp, vw = versiones_de(main), versiones_de(pages), versiones_web()
    print(f'main {main[:8]} · gh-pages {pages[:8]}')
    for j in JUEGOS:
        marca = 'al día' if not cambia(pages, main, f'games/{j}') else ('pendiente de desplegar' if vm[j] != vp[j] else 'cambios en main sin subir versión (no sale)')
        print(f'  {j:10} main {vm[j]:8} gh-pages {vp[j]:8} web {vw[j]:8} {marca}')
    print('core: ' + ('CAMBIADO desde el último despliegue: salen todos los juegos' if cambia(pages, main, 'core') else 'igual que en la web'))


def lista():
    git('fetch', '-q', 'origin', ok=True)
    pages = git('rev-parse', 'origin/gh-pages', ok=True)
    marcado = False
    print('Versiones desplegables de main (commits que cambiaron un ?v=); la de la web lleva «◀ en la web»:')
    out = git('log', 'origin/main', '--format=%h|%ad|%s', '--date=format:%Y-%m-%d %H:%M', '-G', r'nucleo\.js\?v=', '-n', '12', '--', 'games', ok=True)
    for l in out.splitlines():
        h, cuando, asunto = l.split('|', 2)
        sirve = not marcado and subprocess.run(['git', 'merge-base', '--is-ancestor', h, pages], cwd=RAIZ).returncode == 0
        marcado = marcado or sirve
        print(f'  {h}  {cuando}  {texto(versiones_de(h))}   {asunto[:60]}{"   ◀ en la web" if sirve else ""}')


def volver_a(commit):
    git('fetch', '-q', 'origin', ok=True)
    c = git('rev-parse', '--verify', commit + '^{commit}')
    if subprocess.run(['git', 'merge-base', '--is-ancestor', c, 'origin/main'], cwd=RAIZ).returncode:
        sys.exit('FALLO: ese commit no está en main.')
    v = versiones_de(c)
    print(f'Volviendo la web a {c[:8]} ({texto(v)})…')
    r = subprocess.run(['git', 'push', '--force', 'origin', f'{c}:refs/heads/gh-pages'], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sin_permiso(r)
    esperar_web(v)


a = sys.argv[1:]
if '--estado' in a:
    estado()
elif '--lista' in a:
    lista()
elif '--a' in a:
    if a.index('--a') + 1 >= len(a):
        sys.exit('Uso: --a <commit>')
    volver_a(a[a.index('--a') + 1])
else:
    solo = a[a.index('--juego') + 1].split(',') if '--juego' in a and a.index('--juego') + 1 < len(a) else None
    desplegar(solo)
