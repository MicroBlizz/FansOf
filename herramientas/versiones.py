"""VERSIONES ANTERIORES: la lista de todo lo publicado, juego a juego, para poder volver a jugarlo (versiones/lista.json).

Sale de la historia de gh-pages: cada despliegue apunta al commit de main que publicó, y ese commit de main es exactamente
lo que salió de ese juego (su carpeta y core). La librería (index.html de la raíz) lee la lista y abre cada versión aparte,
en rawcdn.githack.com, que sirve los archivos de un commit concreto del repositorio. Así la web no cambia y la partida
guardada del jugador no se toca (otra dirección, otra partida). Se abre con ?nube=0: nada va al servidor.

  · Juegos de games/: una entrada por cada ?v= de nucleo.js que se publicó, con los títulos en negrita de su nota.
  · Demos de demos/: una entrada por cada vez que su carpeta cambió en la web (con su versión si tiene js/novedades.js).

No se guarda en main: desplegar.py la escribe dentro de cada despliegue (con lo que sale en ese mismo despliegue).
Para verla en local: python herramientas/versiones.py (escribe versiones/lista.json, que git ignora) y abre la librería.
"""
import json, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIGLAS = {'pvp': 'PvP', 'ceo': 'CEO', 'caos': 'CAOS', 'ia': 'IA', 'td': 'TD', '3d': '3D', 'ps1': 'PS1', 'vs': 'VS', 'cpu': 'CPU'}


def _git(*a):
    r = subprocess.run(['git', *a], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8')
    return r.stdout.strip() if not r.returncode else ''


def _carpetas(ref):
    """{'games/rumble': hash de su árbol, 'demos/roguelite': …} en ese commit."""
    out = {}
    for base in ('games', 'demos'):
        for l in _git('ls-tree', ref, base + '/').splitlines():
            meta, ruta = l.split('\t', 1)
            if meta.split()[1] == 'tree':
                out[ruta] = meta.split()[2]
    return out


def _version(ref, carpeta):
    if carpeta.startswith('games/'):
        m = re.search(r'nucleo\.js\?v=([0-9.]+)', _git('show', f'{ref}:{carpeta}/index.html'))
    else:
        m = re.search(r"v: '([^']+)'", _git('show', f'{ref}:{carpeta}/js/novedades.js'))
    return m.group(1) if m else ''


def _suave(t):
    t = re.sub(r'[\wáéíóúñü]+', lambda w: SIGLAS.get(w.group(0), w.group(0)), t.lower())
    return t[:1].upper() + t[1:]


def _titulo(ref, carpeta, v):
    """Los títulos en negrita de la nota de esa versión; si no hay nota, el asunto del último commit que tocó la carpeta."""
    if v:
        notas = _git('show', f'{ref}:{carpeta}/js/novedades.js')
        i = notas.find(f"v: '{v}'")
        if i >= 0:
            fin = notas.find("{ v: '", i + 5)
            tit = [b for b in re.findall(r'<b>([^<]+)</b>', notas[i:fin if fin > 0 else None]) if 'MEJORAS POR DENTRO' not in b.upper()]
            return ' · '.join(_suave(b) for b in tit[:2]) or 'Mejoras por dentro'
    asunto = _git('log', '-1', '--format=%s', ref, '--', carpeta)
    asunto = re.sub(r'^[^:]{0,40}:\s*', '', asunto)
    return (asunto[:1].upper() + asunto[1:])[:110] + ('…' if len(asunto) > 110 else '')


def _fecha(ref):
    return _git('log', '-1', '--format=%cd', '--date=format:%Y-%m-%d %H:%M', ref)


def generar(pages, nuevo_main=None, salen=None):
    """La lista como texto JSON: la historia de gh-pages (por su primer padre) y, si se da, el commit de main que se va a publicar ahora
    (`salen`: los juegos de games/ que salen en ese despliegue; las demos salen siempre tal como están en main)."""
    pasos = []
    for l in _git('log', '--first-parent', '--reverse', '--format=%H %P', pages).splitlines():
        h, *padres = l.split()
        pasos.append((h, padres[1] if len(padres) > 1 else h))   # un despliegue lleva el commit de main como segundo padre
    if nuevo_main:
        pasos.append((None, nuevo_main))
    lista, antes = {}, {}
    for h, origen in pasos:
        arbol = _carpetas(h or origen)
        if h is None and salen is not None:
            arbol = {c: a for c, a in arbol.items() if not c.startswith('games/') or c[6:] in salen}
        for carpeta, hash_arbol in arbol.items():
            prev = antes.get(carpeta)
            if prev and prev[0] == hash_arbol:
                continue
            v = _version(h or origen, carpeta)
            if carpeta.startswith('games/') and (not v or (prev and prev[1] == v)):
                antes[carpeta] = (hash_arbol, prev[1] if prev else v)
                continue   # un juego solo cuenta cuando sube su versión
            antes[carpeta] = (hash_arbol, v)
            lista.setdefault(carpeta, []).append({'v': v, 'fecha': _fecha(origen), 'commit': origen[:12], 'titulo': _titulo(origen, carpeta, v)})
    for carpeta in lista:
        lista[carpeta].reverse()   # la más nueva primero
    return json.dumps(lista, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    pages = _git('rev-parse', 'origin/gh-pages')
    if not pages:
        sys.exit('FALLO: no encuentro origin/gh-pages (git fetch origin gh-pages).')
    texto = generar(pages)
    os.makedirs(os.path.join(RAIZ, 'versiones'), exist_ok=True)
    with open(os.path.join(RAIZ, 'versiones', 'lista.json'), 'w', encoding='utf-8') as f:
        f.write(texto)
    datos = json.loads(texto)
    print('versiones/lista.json: ' + ' · '.join(f'{c.split("/")[1]} {len(v)}' for c, v in sorted(datos.items())))
