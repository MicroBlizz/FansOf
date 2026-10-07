"""Publica la web (GitHub Pages sirve la rama gh-pages) de forma controlada, y permite volver atrás.

Uso, desde la raíz del repositorio:
  python herramientas/publicar.py                 publica lo que hay en main: etiqueta, sube main y la etiqueta, mueve gh-pages y comprueba la web real
  python herramientas/publicar.py --lista         las últimas publicaciones (etiqueta, fecha, versiones) y cuál está en la web
  python herramientas/publicar.py --estado        compara main, gh-pages y lo que sirve la web ahora mismo
  python herramientas/publicar.py --a <etiqueta>  vuelve la web a una publicación anterior (sin tocar main)

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


def publicar():
    preparar_git()
    git('fetch', '-q', 'origin', '--tags', ok=True)
    if git('branch', '--show-current') != 'main':
        sys.exit('FALLO: hay que estar en la rama main.')
    if git('status', '--porcelain', '--untracked-files=no'):
        sys.exit('FALLO: hay cambios sin guardar. Haz commit antes de publicar.')
    if git('rev-list', '--count', 'HEAD..origin/main') != '0':
        sys.exit('FALLO: main de GitHub tiene commits que no tienes. Haz git pull --rebase origin main antes.')
    cabeza = git('rev-parse', 'HEAD')
    v = versiones_de('HEAD')
    if '?' in v.values():
        sys.exit('FALLO: no encuentro el ?v= de nucleo.js en algún index.html.')
    if git('rev-parse', 'origin/gh-pages', ok=True) == cabeza and versiones_web() == v:
        print(f'Nada que publicar: la web ya sirve {texto(v)}.')
        return
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
elif '--a' in a:
    if a.index('--a') + 1 >= len(a):
        sys.exit('Uso: --a <etiqueta>')
    volver_a(a[a.index('--a') + 1])
else:
    publicar()
