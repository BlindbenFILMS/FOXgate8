"""Turn the 2D game's world files into 3D world data (one JSON per world).

    python3 tools/gen_worlds.py <2D repo dir> <out dir>

Reads <repo>/worlds/<world>/world.json (the same data the 2D game runs on) and
<repo>/media/map.json (bare media names -> folder paths), and writes
<out>/<world>.json with everything the 3D world kit needs:

  * zones   — the outdoor maps that join through their exits, laid out on ONE
              big exterior map (Design's rule: path screens become zones)
  * areas   — interiors and set pieces entered through a door (quick fade)
  * every map's walk mask, anchors, doors, exits and arrival note
  * NPCs placed where the 2D game places them, with their lines and topics
  * music per room, resolved to the real files in the site folders

Nothing is invented: names, lines, labels and notes are copied as they are.
The map art itself (base64) is never copied.
"""
import json, os, re, sys, math
from urllib.parse import quote

REPO = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/merge/repo'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'worlds', 'data')
os.makedirs(OUT, exist_ok=True)
MEDIA = json.load(open(os.path.join(REPO, 'media', 'map.json'))).get('map', {})

WORLDS = ['gaya', 'jidda', 'kufa', 'luxor', 'nebo', 'ur', 'zion', 'player', 'earth', 'station']
NAMES = {'gaya': 'Gaya', 'jidda': 'Jidda', 'kufa': 'Kufa', 'luxor': 'Luxor', 'nebo': 'Nebo', 'ur': 'Ur',
         'zion': 'Zion', 'player': 'Home', 'earth': 'Earth', 'station': 'Deep Space Fox'}
# the space map's own tint for each planet, and a palette for the 3D look
STYLE = {
    'gaya':    {'tint': '#a97bdd', 'ground': '#7d9a5e', 'path': '#cbb894', 'wall': '#e9e1d2', 'roof': '#6b4f8f', 'trim': '#c2963f', 'accent': '#a97bdd', 'wild': '#5f8048', 'crest': 'G'},
    'jidda':   {'tint': '#5ec97e', 'ground': '#d9c48e', 'path': '#c9a978', 'wall': '#efe6cf', 'roof': '#2f8fa8', 'trim': '#38bdf8', 'accent': '#5ec97e', 'wild': '#8fb36a', 'crest': 'J', 'water': '#2bb6c8'},
    'kufa':    {'tint': '#b08355', 'ground': '#d8b57a', 'path': '#c49a63', 'wall': '#e3c79a', 'roof': '#8a5a34', 'trim': '#d6a547', 'accent': '#b08355', 'wild': '#c9a36b', 'crest': 'K'},
    'luxor':   {'tint': '#e0574a', 'ground': '#7a3a2c', 'path': '#a65a43', 'wall': '#8e3a2c', 'roof': '#3a1d18', 'trim': '#e0574a', 'accent': '#ff7a3a', 'wild': '#5a2a22', 'crest': 'L'},
    'nebo':    {'tint': '#5aa6e8', 'ground': '#4f8a45', 'path': '#a68a5c', 'wall': '#8a6a46', 'roof': '#3f6a3a', 'trim': '#d4b25a', 'accent': '#5aa6e8', 'wild': '#2f6a35', 'crest': 'N'},
    'ur':      {'tint': '#e8963a', 'ground': '#c98a52', 'path': '#d8a66a', 'wall': '#d07a3a', 'roof': '#8a4a22', 'trim': '#f0c060', 'accent': '#e8963a', 'wild': '#8a9a4a', 'crest': 'U'},
    'zion':    {'tint': '#e8cf4a', 'ground': '#b8a457', 'path': '#a08a5a', 'wall': '#b48a52', 'roof': '#6a4a2a', 'trim': '#e8cf4a', 'accent': '#e8cf4a', 'wild': '#8a8a3a', 'crest': 'Z'},
    'player':  {'tint': '#e8eef7', 'ground': '#7ea866', 'path': '#d8cdb8', 'wall': '#f0ece2', 'roof': '#6b5a9a', 'trim': '#c2963f', 'accent': '#ec3013', 'wild': '#5f8a52', 'crest': '8'},
    'earth':   {'tint': '#5aa6e8', 'ground': '#3a3540', 'path': '#4a4652', 'wall': '#2a2a3a', 'roof': '#1a1a26', 'trim': '#ff4fa8', 'accent': '#ffd23a', 'wild': '#b8955a', 'crest': 'E', 'night': True},
    'station': {'tint': '#9aa4b5', 'ground': '#5a6170', 'path': '#7a8292', 'wall': '#8a93a6', 'roof': '#3a4050', 'trim': '#38bdf8', 'accent': '#ffb347', 'wild': '#2a2f3a', 'crest': '8', 'indoorWorld': True},
}
# rooms that do NOT get an arrival intro (shops, bars and small rooms: Ben, 1 Oct)
NO_INTRO = re.compile(r'tavern|shop|armou?ry|bar\b|bakery|noodle|smoothie|deli|creamery|casino|pinball|burger|item|merchant|sushi|tailor|quirk|teahouse|apartment|quarters|cabin|hut|shed|farmhouse|lodge|booth|pawn|captain|floor|room over|chapel|showroom|import|crew for hire|maps|exchange|infirmary|office|college|warehouse|storage|museum|comics|pizza|clubhouse|onsen|bathhouse|library', re.I)


def media_path(name):
    if not name:
        return None
    p = MEDIA.get(name)
    return quote(p, safe='/') if p else None


def rect_center(a):
    if not isinstance(a, dict):
        return None
    if 'x' in a and 'y' in a and isinstance(a['x'], (int, float)):
        return [a['x'], a['y']]
    if all(isinstance(a.get(k), (int, float)) for k in ('x0', 'x1', 'y0', 'y1')):
        return [(a['x0'] + a['x1']) / 2, (a['y0'] + a['y1']) / 2]
    return None


def anchor(anchors, path):
    """'counter.shopkeeper' / 'kingStand' / 'doors.tavern' -> [x, y]"""
    if not path or not isinstance(path, str):
        return None
    cur = anchors
    for part in path.split('.'):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        elif isinstance(cur, list) and part.isdigit() and int(part) < len(cur):
            cur = cur[int(part)]
        else:
            return None
    c = rect_center(cur)
    if c:
        return c
    if isinstance(cur, list) and cur and isinstance(cur[0], (int, float)) and len(cur) >= 2:
        return [cur[0], cur[1]]
    if isinstance(cur, list) and cur and isinstance(cur[0], dict):
        return rect_center(cur[0])
    return None


def walk_rows(m):
    rows = []
    for r in m.get('walk') or []:
        segs = r.get('s', r.get('segs')) or []
        rows.append([round(r['y'], 1), [[round(a, 1), round(b, 1)] for a, b in segs]])
    return rows


def edge_of(m, a):
    """Which edge of the map an exit rectangle sits on."""
    c = rect_center(a)
    if not c:
        return None
    x, y = c
    W, H = m['w'], m['h']
    d = {'N': y, 'S': H - y, 'W': x, 'E': W - x}
    return min(d, key=d.get)


def lines_of(o):
    out = []
    for l in o.get('lines') or []:
        if isinstance(l, dict) and l.get('text'):
            out.append({'who': 'player' if l.get('who') == 'player' else 'npc', 'text': l['text']})
        elif isinstance(l, str):
            out.append({'who': 'npc', 'text': l})
    return out


def topics_of(o):
    out = []
    for t in o.get('topics') or []:
        if isinstance(t, dict) and t.get('label'):
            reps = [r for r in (t.get('replies') or []) if isinstance(r, str)]
            if reps:
                o2 = {'label': t['label'], 'replies': reps}
                if t.get('if') is not None:
                    o2['if'] = t['if']
                acts = acts_of(t.get('do'))
                if acts:
                    o2['do'] = acts
                out.append(o2)
    return out


def acts_of(do):
    out = []
    for a in (do if isinstance(do, list) else [do] if isinstance(do, dict) else []):
        if not isinstance(a, dict):
            continue
        for k in ('set', 'clear', 'xp', 'gold'):
            if k in a and isinstance(a[k], (str, int, float, list)):
                out.append({k: a[k]})
        if isinstance(a.get('note'), list) and a['note']:
            out.append({'note': [str(x) for x in a['note'][:2]]})
        if isinstance(a.get('call'), str):
            out.append({'call': a['call']})
    return out


def colours(o):
    t = o.get('torso')
    return t if isinstance(t, list) and len(t) == 3 else None


def gen(w):
    j = json.load(open(os.path.join(REPO, 'worlds', w, 'world.json')))
    maps = {k: v for k, v in j['maps'].items() if not k.endswith('Spacedock')}
    interior = set(j.get('interiorKeys') or [])
    start = j.get('startScene') if j.get('startScene') in maps else next(iter(maps))
    notes = j.get('arrivalNotes') or {}
    portals = j.get('portals') or []

    def battle(k):
        m = maps[k]
        return bool(m.get('arsenal') or m.get('battleTo'))

    # ---------- the one big exterior map ----------
    # BFS over exits (seams) between OUTDOOR maps; doors lead to areas (fade).
    seams = {}
    for k, m in maps.items():
        for s in m.get('seams') or []:
            if s.get('to') in maps:
                seams.setdefault(k, []).append(s)
    for k in ((j.get('kyoto') or {}).get('open') or []):
        interior.discard(k)
    placed = {start: [0.0, 0.0]}           # map-unit offset of each zone's (0,0)
    cluster = {start: 0}
    order = [start]
    links = []
    q = [start]
    outdoor_ok = lambda k: k not in interior and not battle(k)
    if not outdoor_ok(start):
        interior.discard(start)

    def overlaps(k, ox, oy):
        m = maps[k]
        for o, (px, py) in placed.items():
            mo = maps[o]
            if ox < px + mo['w'] + 200 and ox + m['w'] + 200 > px and oy < py + mo['h'] + 200 and oy + m['h'] + 200 > py:
                return True
        return False

    while q:
        k = q.pop(0)
        m = maps[k]
        for s in seams.get(k, []):
            t = s['to']
            if t in placed or not outdoor_ok(t):
                continue
            a = (m.get('anchors') or {}).get(s.get('anchor'))
            mt = maps[t]
            b = (mt.get('anchors') or {}).get(s.get('arriveAt'))
            e = edge_of(m, a)
            ca, cb = rect_center(a), rect_center(b)
            if not e or not ca:
                continue
            if not cb:
                opp = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}[e]
                cb = {'N': [mt['w'] / 2, 0], 'S': [mt['w'] / 2, mt['h']], 'W': [0, mt['h'] / 2], 'E': [mt['w'], mt['h'] / 2]}[opp]
            px, py = placed[k]
            GAP = 520.0       # a road between the two screens
            if e == 'N':
                ox, oy = px + ca[0] - cb[0], py - GAP - mt['h']
            elif e == 'S':
                ox, oy = px + ca[0] - cb[0], py + m['h'] + GAP
            elif e == 'W':
                ox, oy = px - GAP - mt['w'], py + ca[1] - cb[1]
            else:
                ox, oy = px + m['w'] + GAP, py + ca[1] - cb[1]
            tries = 0
            while overlaps(t, ox, oy) and tries < 12:
                tries += 1
                if e in 'NS':
                    oy += (-1 if e == 'N' else 1) * 900
                else:
                    ox += (-1 if e == 'W' else 1) * 900
            placed[t] = [ox, oy]
            order.append(t)
            q.append(t)
            # the road: from the exit's centre to the arrival point
            links.append({'from': k, 'to': t, 'a': [px + ca[0], py + ca[1]], 'b': [ox + cb[0], oy + cb[1]],
                          'label': s.get('label') or mt.get('label'), 'edge': e,
                          'wa': (a.get('x1', 0) - a.get('x0', 0)) if 'x0' in a else 300,
                          'ha': (a.get('y1', 0) - a.get('y0', 0)) if 'y0' in a else 300})

    # ---------- more clusters: outdoor places the main map does not reach (Kyoto behind the wood, ...) ----------
    def bbox():
        xs0 = min(placed[k][0] for k in placed); xs1 = max(placed[k][0] + maps[k]['w'] for k in placed)
        ys0 = min(placed[k][1] for k in placed); ys1 = max(placed[k][1] + maps[k]['h'] for k in placed)
        return xs0, xs1, ys0, ys1
    pref = [r for r in ((j.get('kyoto') or {}).get('first'),) if r]
    roots = pref + [k for k in maps if k not in pref]
    cid = 0
    for root in roots:
        if root in placed or not outdoor_ok(root) or root not in maps:
            continue
        cid += 1
        xs0, xs1, ys0, ys1 = bbox()
        placed[root] = [xs1 + 6000.0, (ys0 + ys1) / 2 - maps[root]['h'] / 2]
        cluster[root] = cid
        order.append(root)
        q = [root]
        while q:
            k = q.pop(0)
            m = maps[k]
            for s2 in seams.get(k, []):
                t = s2['to']
                if t in placed or not outdoor_ok(t):
                    continue
                a2 = (m.get('anchors') or {}).get(s2.get('anchor'))
                mt = maps[t]
                b2 = (mt.get('anchors') or {}).get(s2.get('arriveAt'))
                e = edge_of(m, a2)
                ca, cb = rect_center(a2), rect_center(b2)
                if not e or not ca:
                    continue
                if not cb:
                    opp = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}[e]
                    cb = {'N': [mt['w'] / 2, 0], 'S': [mt['w'] / 2, mt['h']], 'W': [0, mt['h'] / 2], 'E': [mt['w'], mt['h'] / 2]}[opp]
                px, py = placed[k]
                GAP = 520.0
                if e == 'N':
                    ox, oy = px + ca[0] - cb[0], py - GAP - mt['h']
                elif e == 'S':
                    ox, oy = px + ca[0] - cb[0], py + m['h'] + GAP
                elif e == 'W':
                    ox, oy = px - GAP - mt['w'], py + ca[1] - cb[1]
                else:
                    ox, oy = px + m['w'] + GAP, py + ca[1] - cb[1]
                tries = 0
                while overlaps(t, ox, oy) and tries < 12:
                    tries += 1
                    if e in 'NS':
                        oy += (-1 if e == 'N' else 1) * 900
                    else:
                        ox += (-1 if e == 'W' else 1) * 900
                placed[t] = [ox, oy]
                cluster[t] = cid
                order.append(t)
                q.append(t)
                links.append({'from': k, 'to': t, 'a': [px + ca[0], py + ca[1]], 'b': [ox + cb[0], oy + cb[1]],
                              'label': s2.get('label') or mt.get('label'), 'edge': e,
                              'wa': (a2.get('x1', 0) - a2.get('x0', 0)) if 'x0' in a2 else 300,
                              'ha': (a2.get('y1', 0) - a2.get('y0', 0)) if 'y0' in a2 else 300})

    # ---------- per map ----------
    music_tracks = ((j.get('music') or {}).get('tracks')) or []
    root = (j.get('music') or {}).get('root') or ''
    def music_for(k):
        for t in music_tracks:
            rooms = t.get('rooms') or []
            plain = [r for r in rooms if isinstance(r, str)]
            if k in plain and not t.get('when') and not t.get('shop'):
                return media_path(root + t['src']) or media_path(t['src'])
        return None
    default_music = None
    for t in music_tracks:
        if not t.get('rooms') and not t.get('when') and not t.get('shop') and not t.get('blocks'):
            default_music = media_path(root + t['src']) or media_path(t['src'])

    out_maps = {}
    for k, m in maps.items():
        an = m.get('anchors') or {}
        doors = []
        for p in portals:
            if p.get('scene') != k or p.get('to') not in maps:
                continue
            doors.append({'key': p.get('key'), 'to': p['to'], 'at': p.get('at'), 'label': p.get('label') or maps[p['to']].get('label'),
                          'x': p.get('x'), 'y': p.get('y'), 'x2': p.get('x2', p.get('x')), 'y2': p.get('y2', p.get('y')),
                          'kind': p.get('kind') or 'door',
                          'mark': ((an.get('doors') or {}).get(p.get('key')) or {}).get('mark')})
        # doors the 2D game keeps in the map's own anchors (doorTarget names where they lead)
        dt, dl = j.get('doorTarget') or {}, j.get('doorLabels') or {}
        for dk, dv in (an.get('doors') or {}).items():
            t = dt.get(dk)
            if not isinstance(dv, dict) or t not in maps or any(d['key'] == dk or d['to'] == t for d in doors):
                continue
            c = [dv['x'], dv['y']] if isinstance(dv.get('x'), (int, float)) else rect_center(dv)
            if not c:
                continue
            doors.append({'key': dk, 'to': t, 'at': None, 'label': dl.get(dk) or maps[t].get('label'), 'x': c[0], 'y': c[1], 'x2': c[0], 'y2': c[1], 'kind': 'door', 'mark': dv.get('mark')})
        exits = []
        for s in m.get('seams') or []:
            a = an.get(s.get('anchor'))
            if s.get('to') in maps and isinstance(a, dict) and all(isinstance(a.get(q), (int, float)) for q in ('x0', 'y0', 'x1', 'y1')):
                exits.append({'to': s['to'], 'arriveAt': s.get('arriveAt'), 'label': s.get('label') or maps[s['to']].get('label'),
                              'rect': [a['x0'], a['y0'], a['x1'], a['y1']], 'edge': edge_of(m, a)})
        # named spots inside a room (furniture, stands) — for the room kit
        spots = {}
        for name, v in an.items():
            if name in ('doors', 'size', 'name') or name.startswith('exit'):
                continue
            if isinstance(v, dict):   # {rect:[..]} and {cx, cy, rx, ry} shapes
                v2 = dict(v)
                if isinstance(v.get('rect'), list) and len(v['rect']) == 4 and all(isinstance(q, (int, float)) for q in v['rect']):
                    v2.update(x0=v['rect'][0], y0=v['rect'][1], x1=v['rect'][2], y1=v['rect'][3]); v2.pop('x', None); v2.pop('y', None)
                if isinstance(v.get('cx'), (int, float)) and isinstance(v.get('cy'), (int, float)):
                    v2.update(x=v['cx'], y=v['cy'])
                v = v2
            c = rect_center(v)
            if c:
                r = [v['x0'], v['y0'], v['x1'], v['y1']] if isinstance(v, dict) and all(isinstance(v.get(q), (int, float)) for q in ('x0', 'y0', 'x1', 'y1')) else None
                spots[name] = {'p': c, 'r': r}
                for q in ('rx', 'ry', 'braziers', 'role'):
                    if q in v and isinstance(v[q], (int, float, str, list)):
                        spots[name][q] = v[q]
            elif isinstance(v, list):
                pts, items = [], []
                for it in v[:60]:
                    if isinstance(it, dict) and isinstance(it.get('rect'), dict):
                        it = {**{q: w for q, w in it.items() if q != 'rect'}, **it['rect']}
                    c2 = rect_center(it) if isinstance(it, dict) else (it[:2] if isinstance(it, list) and len(it) >= 2 and isinstance(it[0], (int, float)) else None)
                    if c2:
                        pts.append(c2)
                        if isinstance(it, dict):
                            o = {'x': c2[0], 'y': c2[1]}
                            if all(isinstance(it.get(q), (int, float)) for q in ('x0', 'y0', 'x1', 'y1')):
                                o['rect'] = [it['x0'], it['y0'], it['x1'], it['y1']]
                            for q in ('r', 'label', 'id', 'kind', 'w', 'h', 'rot', 'face', 'animal', 'side'):
                                if isinstance(it.get(q), (int, float, str)):
                                    o[q] = it[q]
                            items.append(o)
                if pts:
                    spots[name] = {'pts': pts}
                    if items and any(len(o) > 2 for o in items):
                        spots[name]['items'] = items
            elif isinstance(v, dict):
                for sub, vv in v.items():
                    c3 = rect_center(vv)
                    if c3:
                        spots[name + '.' + sub] = {'p': c3}
        spawn = anchor(an, 'spawn') or anchor(an, 'entrance') or anchor(an, 'transportPad') or [m['w'] / 2, m['h'] / 2]
        label = m.get('label') or k
        intro = None
        if k in placed or not NO_INTRO.search(label + ' ' + k):
            intro = notes.get(k)
        out_maps[k] = {
            'key': k, 'label': label, 'w': m['w'], 'h': m['h'], 'trim': m.get('trim'),
            'kind': 'zone' if k in placed else ('battle' if battle(k) else 'area'),
            'interior': k in interior, 'walk': walk_rows(m), 'water': m.get('water'),
            'doors': doors, 'exits': exits, 'spots': spots, 'spawn': spawn,
            'entrance': anchor(an, 'entrance') or spawn,
            'note': notes.get(k), 'intro': intro, 'music': music_for(k),
            'name': (an.get('name') if isinstance(an.get('name'), str) else None),
        }
        if battle(k):
            out_maps[k]['core'] = m.get('core'); out_maps[k]['cover'] = m.get('cover') or []; out_maps[k]['turrets'] = m.get('turrets') or []; out_maps[k]['battleTo'] = m.get('battleTo')
            out_maps[k]['intro'] = 'BATTLE. Machines and raiders are coming for the core. Hold it through three waves: fight them off, use the cover, and take out the turrets.'
        if k in placed:
            out_maps[k]['at'] = placed[k]
            out_maps[k]['cluster'] = cluster.get(k, 0)

    # ---------- people ----------
    npcs = []
    seen = set()
    def add(o, role, scene=None, kind='stand'):
        name = o.get('name')
        if not name:
            return
        sc = scene or o.get('scene') or start
        if sc not in out_maps:
            return
        key = o.get('key') or (role + ':' + name)
        if (key, sc) in seen:
            return
        seen.add((key, sc))
        an = maps[sc].get('anchors') or {}
        at = anchor(an, o.get('at')) if isinstance(o.get('at'), str) else None
        if not at and isinstance(o.get('x'), (int, float)):
            at = [o['x'], o['y']]
        n = {'key': key, 'name': name, 'role': o.get('title') or o.get('role') or role, 'scene': sc,
             'at': at, 'colors': colours(o), 'crest': o.get('crest'), 'pelt': o.get('pelt'),
             'lines': lines_of(o), 'topics': topics_of(o), 'greeting': o.get('greeting'),
             'bio': o.get('bio'), 'kind': kind}
        if o.get('axis') and isinstance(o.get('lane'), (int, float)):
            n['lane'] = {'axis': o['axis'], 'lane': o['lane'], 'a': o.get('a'), 'b': o.get('b')}
        if o.get('stock'):
            n['stock'] = [{'label': s.get('label'), 'price': s.get('price')} for s in o['stock'] if isinstance(s, dict)]
        npcs.append(n)
    for o in j.get('keepers') or []:
        add(o, 'Keeper')
    for o in j.get('clerics') or []:
        add(o, 'Cleric')
    for o in j.get('guests') or []:
        add(o, 'Guest')
    for o in j.get('townsfolk') or []:
        add(o, 'Townsfolk', kind='walk')
    # greeters speak from a spot as you arrive; attach their first lines to the NPC if named
    greet = []
    for g in j.get('greeters') or []:
        st = (g.get('states') or [{}])[-1]
        greet.append({'scene': g.get('scene'), 'npc': g.get('npc'), 'name': g.get('name'),
                      'at': anchor((maps.get(g.get('scene')) or {}).get('anchors') or {}, g.get('at')) if g.get('scene') in maps else None,
                      'lines': lines_of(st)})
    # creatures: the 2D enemies, so the wilds are not empty (they stay off the paths)
    foes = []
    for g in j.get('golems') or []:
        if g.get('scene') in out_maps and isinstance(g.get('x'), (int, float)):
            foes.append({'name': g.get('name'), 'scene': g['scene'], 'at': [g['x'], g['y']], 'hp': g.get('hp'),
                         'big': bool(g.get('big')), 'ranged': bool(g.get('ranged'))})

    # ---------- the space dock (every world but Earth and the station; Ben, 30 Sep) ----------
    # In orbit above the planet: your ship at one end of a long gantry, the teleporter at the other,
    # which beams you down to the crest pad in the start zone. Built by the engine (kind 'dock').
    if w not in ('earth', 'station'):
        dk = w + 'Spacedock'
        DW, DH = 2160, 1080
        rects = [[300, 396, 1980, 684], [860, 216, 1300, 864]]    # the gantry (8 m wide) and the landing
        rows = []
        for y in range(0, DH, 8):
            segs = []
            for x0, y0, x1, y1 in rects:
                if y0 <= y <= y1:
                    segs.append([x0, x1])
            segs.sort()
            merged = []
            for a, b in segs:
                if merged and a <= merged[-1][1]:
                    merged[-1][1] = max(merged[-1][1], b)
                else:
                    merged.append([a, b])
            if merged:
                rows.append([y, merged])
        nm = NAMES[w]
        out_maps[dk] = {
            'key': dk, 'label': nm + ' Spacedock', 'w': DW, 'h': DH, 'trim': None, 'kind': 'dock', 'interior': False,
            'walk': rows, 'water': None, 'deck': rects,
            'doors': [{'key': 'teleporter', 'to': start, 'at': None, 'label': 'Teleport down to ' + nm, 'x': 1900, 'y': 540, 'x2': 1900, 'y2': 540, 'kind': 'pad', 'mark': None}],
            'exits': [], 'spots': {'ship': {'p': [170, 540]}, 'teleporter': {'p': [1900, 540]}},
            'spawn': [560, 540], 'entrance': [560, 540], 'orbit': [340, 540],
            'note': 'High above ' + nm + '. Your ship is berthed at the end of the gantry. Walk to the teleporter at the far end and it beams you down to the crest pad.',
            'intro': 'High above ' + nm + '. Your ship is berthed at the end of the gantry. Walk to the teleporter at the far end and it beams you down to the crest pad.',
            'music': 'MERU/MUSIC/MERU-spacedock.mp3', 'name': nm + ' Spacedock',
        }
        sm = out_maps[start]
        tp = (sm['spots'].get('transportPad') or {}).get('p') or sm['spawn']
        sm['doors'].append({'key': 'toSpacedock', 'to': dk, 'at': None, 'label': 'Teleport up to the Spacedock',
                            'x': tp[0], 'y': tp[1], 'x2': tp[0], 'y2': tp[1], 'kind': 'pad', 'mark': None})
        sm['spawn'] = tp
        bk = next((k2 for k2, m2 in out_maps.items() if m2['kind'] == 'battle'), None)
        if bk:
            out_maps[dk]['doors'].append({'key': 'toBattle', 'to': bk, 'at': None, 'label': 'Drop into battle: ' + out_maps[bk]['label'], 'x': 1080, 'y': 760, 'x2': 1080, 'y2': 760, 'kind': 'pad', 'mark': None})
            out_maps[dk]['spots']['battlePad'] = {'p': [1080, 760]}
        npcs.append({'key': w + 'DockOfficer', 'name': 'Dock Officer', 'role': 'Spacedock crew', 'scene': dk, 'at': [1080, 300],
                     'colors': ['#e8eef7', '#9aa4b5', '#33405a'], 'crest': '8', 'pelt': 'grey',
                     'lines': [{'who': 'npc', 'text': 'Welcome to ' + nm + ', Steward.'}, {'who': 'npc', 'text': 'Your ship is fuelled and berthed behind you. The teleporter at the end of the gantry puts you down on the crest pad in town.'}],
                     'topics': [{'label': 'How do I get back to space?', 'replies': ['Walk back to your ship and board her. She will take you up to orbit.']}]})

    # ---------- Gaya: the dream (canyon meditation -> the Vegas vision -> the wood -> Kyoto) ----------
    def pad_door(mk, spot, to, label):
        m = out_maps.get(mk)
        if not m or to not in out_maps:
            return
        p = (m['spots'].get(spot) or {}).get('p') or m['spawn']
        m['doors'].append({'key': mk + '_' + to, 'to': to, 'at': None, 'label': label, 'x': p[0], 'y': p[1], 'x2': p[0], 'y2': p[1], 'kind': 'pad', 'mark': None})
    if w == 'gaya':
        pad_door('gayaCanyon', 'meditationPad', 'earthCasino', 'Sit on the pad and listen: the dream')
        pad_door('earthCasino', 'door', 'earthKitsune', 'The way out (the lit door)')
        pad_door('earthKitsune', 'spawn', 'gayaCanyon', 'Wake up, back in the gorge')
        for k2, m2 in out_maps.items():
            if k2 == 'earthCasino':
                m2['vision'] = True
                m2['label'] = 'Las Vegas'
                m2['intro'] = m2['intro'] or 'A dream. A room full of people who cannot see you, every one of them playing a game. Find the stage at the back and hear the announcer; the lit door in the corner lets you out.'
            if k2 == 'earthKitsune':
                m2['intro'] = m2['intro'] or 'A wood on Earth, by the water, three nights before a wedding. The road north out of the trees runs to a human city.'

    if w == 'earth':
        bk = next((k2 for k2, m2 in out_maps.items() if m2['kind'] == 'battle'), None)
        if bk:
            sm = out_maps[start]; tp = sm['spawn']
            sm['doors'].append({'key': 'toBattle', 'to': bk, 'at': None, 'label': 'Drop into battle: ' + out_maps[bk]['label'], 'x': tp[0] + 320, 'y': tp[1], 'x2': tp[0] + 320, 'y2': tp[1], 'kind': 'pad', 'mark': None})
    for k2, m2 in out_maps.items():
        if m2['kind'] == 'battle':
            sp2 = m2['spawn']; dest = (m2.get('battleTo') or {}).get('scene') or start
            if dest not in out_maps: dest = start
            m2['doors'] = [{'key': 'battleHome', 'to': dest, 'at': None, 'label': 'Teleport home to ' + NAMES[w], 'x': sp2[0] - 260, 'y': sp2[1] + 160, 'x2': sp2[0], 'y2': sp2[1], 'kind': 'pad', 'mark': None}]
    # ---------- quests: the guide (linear) and the quest log, plus world triggers ----------
    qs = []
    g = j.get('guide')
    if isinstance(g, dict) and isinstance(g.get('steps'), list):
        qs.append({'id': 'guide', 'title': g.get('title') or NAMES[w], 'mode': 'guide', 'allDone': g.get('allDone'),
                   'steps': [{'text': st.get('text'), 'done': st.get('done'), 'at': st.get('at'), 'why': st.get('why')} for st in g['steps'] if isinstance(st, dict) and st.get('text')]})
    for q in j.get('quests') or []:
        if not isinstance(q, dict):
            continue
        title = q.get('title') or q.get('name')
        if isinstance(q.get('stages'), list):   # Luxor: stages that complete on a flag
            qs.append({'id': q.get('key'), 'title': title, 'mode': 'guide', 'start': q.get('start'), 'steps': [{'text': (st.get('title') or '') + (' — ' + st['note'] if st.get('note') else ''), 'done': (st.get('when') or {}).get('flag'), 'at': st.get('at'), 'why': st.get('hint')} for st in q['stages'] if isinstance(st, dict)]})
        elif isinstance(q.get('steps'), list) and any(isinstance(st, dict) and isinstance(st.get('done'), str) for st in q['steps']):   # Ur: a guide
            qs.append({'id': q.get('key') or q.get('id'), 'title': title, 'mode': 'guide', 'allDone': q.get('closeNote'), 'steps': [{'text': st.get('text'), 'done': st.get('done'), 'at': st.get('at'), 'why': st.get('why')} for st in q['steps'] if isinstance(st, dict) and st.get('text')]})
        elif isinstance(q.get('steps'), list):   # Kufa: a log, each line unlocked by a flag
            qs.append({'id': q.get('id'), 'title': title, 'mode': 'log', 'steps': [{'if': st.get('if'), 'text': st.get('text'), 'done': bool(st.get('done'))} for st in q['steps'] if isinstance(st, dict) and st.get('text')]})
    trig = []
    for tr in j.get('triggers') or []:
        if not isinstance(tr, dict) or tr.get('scene') not in out_maps:
            continue
        an = (maps[tr['scene']].get('anchors') or {})
        p0 = anchor(an, tr.get('at')) if isinstance(tr.get('at'), str) else None
        acts = acts_of(tr.get('do'))
        if acts:
            trig.append({'id': tr.get('id'), 'scene': tr['scene'], 'at': p0, 'r': tr.get('r') or 300, 'if': tr.get('if'), 'do': acts})
    data = {'world': w, 'name': NAMES[w], 'style': STYLE[w], 'start': start, 'order': order, 'quests': qs, 'triggers': trig,
            'links': links, 'maps': out_maps, 'npcs': npcs, 'greeters': greet, 'foes': foes,
            'music': {'default': default_music}}
    p = os.path.join(OUT, w + '.json')
    json.dump(data, open(p, 'w'), separators=(',', ':'))
    zones = len(order)
    areas = sum(1 for m in out_maps.values() if m['kind'] == 'area')
    print('%-8s zones %2d  areas %2d  npcs %3d  foes %3d  %5d KB' % (w, zones, areas, len(npcs), len(foes), os.path.getsize(p) // 1024))


for w in WORLDS:
    gen(w)
