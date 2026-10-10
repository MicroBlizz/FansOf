"""Valida los diccionarios de traducción sin abrir el navegador (rápido): errores de sintaxis, claves repetidas con traducciones distintas,
huecos %1 que no cuadran entre la frase y su inglés, traducciones vacías o iguales al original, claves que ya no aparecen en el código (sobran)
y textos de tr('...') que no están en ningún diccionario (faltan).

Uso, desde la raíz del repositorio:   python herramientas/idioma_claves.py [--sobran] [--lang=en]
Sale con 1 si hay algún error de verdad (sintaxis, hueco que no cuadra, tr() sin traducción). «Sobran» solo se lista con --sobran: puede haber
falsos positivos (frases que el juego arma por trozos o que están en el servidor). Lo que de verdad sale en pantalla lo comprueba idioma.py.
"""
import glob, os, re, subprocess, shutil, sys, json

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--lang=')), 'en')
SOBRAN = '--sobran' in sys.argv
sys.stdout.reconfigure(encoding='utf-8')
HUECO = re.compile(r'%#?\d+')
errores, avisos = [], []

archivos = sorted(glob.glob(f'{RAIZ}/core/idioma/{LANG}-*.js') + glob.glob(f'{RAIZ}/games/*/idioma/{LANG}*.js'))
dic = {}   # clave -> [(valor, archivo)]
for f in archivos:
    rel = os.path.relpath(f, RAIZ)
    if shutil.which('node'):
        r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
        if r.returncode:
            errores.append(f'{rel}: error de sintaxis ({(r.stderr.strip().splitlines() or [""])[0]})')
            continue
    t = open(f, encoding='utf-8').read()
    for m in re.finditer(r'^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$', t, re.M):
        k, v = json.loads(m.group(1)), json.loads(m.group(2))
        dic.setdefault(k, []).append((v, rel))
        if not v.strip():
            errores.append(f'{rel}: «{k[:60]}» tiene la traducción vacía')
        elif v == k and re.search(r'[áéíóúñ¡¿]|\b(el|la|los|las|del|que|con|para|por|una)\b', k):
            avisos.append(f'{rel}: «{k[:60]}» está igual en los dos idiomas')
        a, b = sorted(m_.replace('#', '') for m_ in HUECO.findall(k)), sorted(m_.replace('#', '') for m_ in HUECO.findall(v))
        if a != b:
            errores.append(f'{rel}: «{k[:60]}» no cuadra con su traducción en los huecos ({a} / {b})')
def ambito(rel):
    return rel.split('/')[1] if rel.startswith('games/') else 'core'
for k, vs in dic.items():   # la misma clave con otra traducción dentro de lo común + un juego (entre juegos distintos es normal)
    for g in {ambito(a) for _, a in vs} - {'core'}:
        v2 = {v for v, a in vs if ambito(a) in (g, 'core')}
        if len(v2) > 1:
            avisos.append(f'clave repetida con traducciones distintas: «{k[:60]}» ({g})')

# código: todo menos diccionarios y herramientas
codigo = ''
for f in glob.glob(f'{RAIZ}/**/*', recursive=True):
    if not f.endswith(('.js', '.html')) or any(x in f for x in ('/idioma/', '/_base/', '/herramientas/', '/android-app/', '/node_modules/')):
        continue
    codigo += open(f, encoding='utf-8', errors='ignore').read() + '\n'
norm = codigo.replace("\\'", "'").replace('\\"', '"')

if SOBRAN:
    sobran = []
    for k in dic:
        trozos = [x.strip() for x in HUECO.split(k) if len(x.strip()) >= 4]
        if trozos and not any(x in norm for x in trozos):
            sobran.append(k)
    print(f'{len(sobran)} claves no aparecen en el código (puede que ya sobren):')
    for k in sobran[:80]:
        print('  ·', k[:110])

# tr('texto') con texto fijo que no está en el diccionario de su juego ni en el común
def claves_de(g):
    return {k for k, vs in dic.items() if any(ambito(a) in ('core', g) for _, a in vs)}
faltan = set()
for f in glob.glob(f'{RAIZ}/**/*.js', recursive=True):
    if any(x in f for x in ('/idioma/', '/_base/', '/herramientas/', '/android-app/', '/node_modules/')):
        continue
    rel = os.path.relpath(f, RAIZ)
    if not rel.startswith(('games/', 'core/')):
        continue   # demos y otras carpetas: sin diccionarios todavía
    g = rel.split('/')[1] if rel.startswith('games/') else None
    if g and not os.path.isdir(f'{RAIZ}/games/{g}/idioma'):
        continue   # un juego sin diccionarios todavía
    ks = claves_de(g) if g else {k for k in dic if any(ambito(a) == 'core' for _, a in dic[k])}
    hs = [re.compile('^' + HUECO.sub('.+?', re.escape(k)) + '$') for k in ks if HUECO.search(k)]
    txt = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r"\btr\(\s*'((?:[^'\\\n]|\\.)*)'", txt):
        if re.match(r"\s*\+", txt[m.end():]):
            continue   # un trozo de un texto que se arma sumando: lo que sale ya no es esta frase
        t = m.group(1).replace("\\'", "'").strip()
        if not re.search(r'[A-Za-zÁÉÍÓÚáéíóúñ]{3}', t) or t in ks or t == 'frase' or any(h.match(t) for h in hs):
            continue
        t2 = re.sub(r'\{\w+\}', '%1', t)
        if t2 in ks:
            continue
        faltan.add((rel, t))
for rel, t in sorted(faltan):
    errores.append(f"{rel}: tr('{t[:80]}') no está en el diccionario")

for a in avisos[:40]:
    print('AVISO', a)
for e in errores:
    print('ERROR', e)
print(f'{len(dic)} claves en {len(archivos)} diccionarios ({LANG}), {len(errores)} errores, {len(avisos)} avisos')
sys.exit(1 if errores else 0)
