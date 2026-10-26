# Construit le site à mettre en ligne (à la racine du dépôt) à partir de apercu.html (la version de l'aperçu).
# Deux éditions sortent du même code : « Compte avec moi » (FR, avec synchronisation) à la racine,
# « Tel met mij » (NL, sans synchronisation) dans nl/.
import json, pathlib, re, time
from PIL import Image, ImageDraw, ImageFont
ici = pathlib.Path(__file__).parent
site = ici.parent
source = (ici / "apercu.html").read_text()
numero = re.search(r'const VERSION = "([0-9.]+)"', source).group(1)
version = time.strftime("%Y%m%d%H%M%S")

# le code de synchronisation affiché dans l'app vient toujours de synchro.gs
code = (ici / "synchro.gs").read_text()
source = re.sub(r'const CODE_SYNCHRO = "(?:[^"\\]|\\.)*";', lambda m: "const CODE_SYNCHRO = " + json.dumps(code, ensure_ascii=False) + ";", source)
(ici / "apercu.html").write_text(source)
(site / "synchro.gs.txt").write_text(code)

# icônes : un cadre blanc à bord violet sur fond menthe, avec « 123 »
def icone(taille):
    s = 4; T = taille * s
    im = Image.new("RGB", (T, T), "#d8f3ee"); d = ImageDraw.Draw(im)
    m = int(T * .14); b = int(T * .05)
    d.rounded_rectangle([m, int(T*.22), T-m, T-int(T*.22)], radius=int(T*.1), fill="#7176d6")
    d.rounded_rectangle([m+b, int(T*.22)+b, T-m-b, T-int(T*.22)-b], radius=int(T*.07), fill="#ffffff")
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(T*.27))
    d.text((T/2, T/2), "123", font=f, fill="#243057", anchor="mm")
    return im.resize((taille, taille), Image.LANCZOS)

def construire(dossier, src, nom, lang, cache, exclure=""):
    dossier.mkdir(exist_ok=True)
    tete, corps = src.split('<div id="app"></div>', 1)
    tete = tete.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    (dossier / "index.html").write_text(f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#d8f3ee">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icone-180.png">
<link rel="icon" href="icone-192.png">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}html{{box-sizing:border-box}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
{tete}</head>
<body>
<div id="app"></div>{corps}
<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {{}});</script>
</body>
</html>
""")
    (dossier / "version.json").write_text('{ "version": "' + numero + '" }\n')
    (dossier / "manifest.webmanifest").write_text(f"""{{
  "name": "{nom}",
  "short_name": "{nom}",
  "lang": "{lang}",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#d8f3ee",
  "theme_color": "#d8f3ee",
  "icons": [
    {{ "src": "icone-192.png", "sizes": "192x192", "type": "image/png" }},
    {{ "src": "icone-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }}
  ]
}}
""")
    (dossier / "sw.js").write_text(f"""// Fonctionnement hors ligne : l'app est gardée en cache, la synchronisation est toujours en direct.
const CACHE = "{cache}-{version}";
const BASE = ["./", "index.html", "manifest.webmanifest", "icone-180.png", "icone-192.png", "icone-512.png"];
self.addEventListener("install", e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("{cache}-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", e => {{
  const url = new URL(e.request.url);
  // seulement l'app elle-même et ses polices ; jamais Google Apps Script (synchronisation toujours en direct)
  const garder = url.origin === self.location.origin || ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname);
  if (e.request.method !== "GET" || !garder || url.pathname.endsWith("version.json")) return;{exclure}
  // la page : d'abord le réseau (pour les mises à jour), sinon le cache
  if (e.request.mode === "navigate") {{
    e.respondWith(fetch(e.request).then(r => {{ const c = r.clone(); caches.open(CACHE).then(k => k.put("index.html", c)); return r; }}).catch(() => caches.match("index.html")));
    return;
  }}
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {{
    if (r.ok || r.type === "opaque") {{ const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }}
    return r;
  }})));
}});
""")
    for t in (180, 192, 512): icone(t).save(dossier / f"icone-{t}.png")

# édition famille (FR) : le service worker laisse l'édition NL à son propre service worker
construire(site, source, "Compte avec moi", "fr", "compte-avec-moi",
           exclure='\n  if (url.origin === self.location.origin && url.pathname.includes("/nl/")) return;')

# édition partage (NL) « Tel met mij » : sans synchronisation
def remplacer(texte, avant, apres):
    assert texte.count(avant) == 1, avant
    return texte.replace(avant, apres)
nl = remplacer(source, 'const EDITION = "famille";', 'const EDITION = "partage";')
nl = remplacer(nl, "<title>Compte avec moi</title>", "<title>Tel met mij</title>")
nl = remplacer(nl, 'content="Compte avec moi"', 'content="Tel met mij"')
nl = re.sub(r'const CODE_SYNCHRO = "(?:[^"\\]|\\.)*";', 'const CODE_SYNCHRO = "";', nl)
assert "doPost" not in nl
construire(site / "nl", nl, "Tel met mij", "nl-BE", "tel-met-mij")
print("ok", version, "v" + numero)
