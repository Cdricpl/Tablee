Instructions pour tester Tablée sur smartphone

Fichiers fournis:
- Tablée.zip (archive contenant tout le répertoire `Tablée`)

Options pour tester sur mobile

1) Méthode recommandée — servir depuis votre PC (HTTP)
- Dézippez `Tablée.zip` sur votre PC dans un dossier accessible.
- Ouvrez un terminal dans ce dossier et lancez un serveur HTTP simple (Python 3):

```bash
python -m http.server 8000
```

- Notez l'adresse IP de votre PC (ex: 192.168.1.42). Sur le smartphone, ouvrez le navigateur et allez sur:

http://192.168.1.42:8000

- Avantages: `type=module` et le service worker fonctionneront correctement (nécessite HTTP).

2) Méthode directe — ouvrir localement (peut échouer)
- Transférez et dézippez l'archive sur le smartphone.
- Ouvrez `index.html` dans le navigateur.
- Limitation: certains navigateurs bloquent les modules ES et le service worker en `file://`.

3) Applications alternatives
- Utilisez une application Android qui sert un dossier via HTTP (par ex. "Simple HTTP Server", "Tiny Web Server").
- Sur iOS, utilisez des applications comme "Koder" ou "Working Copy" + serveur local, ou mieux: servez depuis le PC.

Conseils pour le test
- Dans DevTools (PC) ou dans les réglages du navigateur mobile, vérifiez que le service worker est enregistré (si vous utilisez la méthode HTTP).
- Si la liste de courses disparaît encore, ouvrez DevTools → Application → Local Storage et vérifiez la clé `tablee.v1` et `tablee.apiKey`.

Si vous voulez, je peux:
- Générer aussi un QR code pointant vers `http://<votre-ip>:8000` pour ouvrir plus facilement sur le téléphone.
- Créer une petite page d'installation PWA (manifest déjà inclus) et un paquet APK (plus complexe).
