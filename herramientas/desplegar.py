"""Despliega la web: GitHub Pages sirve la rama gh-pages, que es siempre una copia de main. Con este script se copia main a gh-pages y se comprueba la web real.

Uso, desde la raíz del repositorio:
  python herramientas/desplegar.py             despliega main (sube main si hace falta, copia main a gh-pages y comprueba la web)
  python herramientas/desplegar.py --estado    compara main, gh-pages y lo que sirve la web ahora mismo
  python herramientas/desplegar.py --lista     las últimas versiones desplegables (commits que cambiaron un ?v=) y cuál está en la web
  python herramientas/desplegar.py --a <commit>   vuelve la web a ese commit de main (se mira en --lista); main no se toca

Hacer commit y subir a main se puede siempre (guarda el trabajo). Desplegar es esto, y solo cuando se decide. gh-pages no se toca a mano.
Los cambios del servidor (Supabase) no vuelven con la web: deben seguir siendo compatibles con versiones anteriores.
"""
import os, re, subprocess, sys, time, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = 'https://microblizz.github.io/FansOf/'
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


def desplegar():
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
    if git('rev-parse', 'origin/gh-pages', ok=True) == cabeza:
        web = versiones_web()
        if all(web[j] == v[j] for j in JUEGOS):
            print(f'Nada que desplegar: la web ya sirve main ({texto(web)}).')
            return
        print(f'gh-pages ya está al día pero la web sirve {texto(web)}: espero a que GitHub Pages la actualice.')
        sys.exit(0 if esperar_web(v) else 1)
    print(f'Desplegando {git("rev-parse", "--short", "HEAD")}: {texto(v)}')
    print('  ' + (git('log', '--oneline', 'origin/gh-pages..HEAD', ok=True).replace('\n', '\n  ') or '(sin commits nuevos)'))
    git('push', 'origin', 'main')
    r = subprocess.run(['git', 'push', 'origin', 'HEAD:refs/heads/gh-pages'], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sin_permiso(r)
    if not esperar_web(v):
        sys.exit(1)


def estado():
    git('fetch', '-q', 'origin', ok=True)
    main, pages = git('rev-parse', 'origin/main'), git('rev-parse', 'origin/gh-pages')
    print(f'main:      {main[:8]}  {texto(versiones_de(main))}')
    print(f'gh-pages:  {pages[:8]}  {texto(versiones_de(pages))}')
    print(f'web viva:  {texto(versiones_web())}')
    print('Pendiente de desplegar: ' + (git('rev-list', '--count', 'origin/gh-pages..origin/main') or '0') + ' commits')


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
    desplegar()
