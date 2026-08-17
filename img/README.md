# Photos des catégories

Chaque carte de catégorie de l'écran « Mes recettes » cherche une image à
`img/cat-<id>.jpg`. Tant que le fichier est absent, la carte affiche une
vignette dessinée en CSS : bichromie propre à la catégorie (définie dans
`style.css`, sélecteur `.cat-photo[data-cat="…"]`), trame fine et emoji de la
catégorie. C'est un rendu volontaire, pas une image manquante.

Déposez simplement les fichiers ici, sans rien modifier dans le code :

| Fichier attendu      | Catégorie      |
|----------------------|----------------|
| `cat-viande.jpg`     | Viande         |
| `cat-volaille.jpg`   | Volaille       |
| `cat-poisson.jpg`    | Poisson        |
| `cat-vege.jpg`       | Végétarien     |
| `cat-mijote.jpg`     | Mijotés        |
| `cat-rapide.jpg`     | Plats rapides  |
| `cat-eco.jpg`        | Plats économiques |
| `cat-famille.jpg`    | Plats familiaux |
| `cat-monde.jpg`      | Plats du monde |
| `cat-four.jpg`       | Plats au four  |
| `cat-sauce.jpg`      | Plats en sauce |
| `cat-dessert.jpg`    | Desserts       |
| `cat-encas.jpg`      | En-cas         |
| `cat-apero.jpg`      | Apéro          |
| `cat-petitdej.jpg`   | Petits déj.    |
| `cat-autres.jpg`     | Autres         |

Format conseillé : JPEG, ratio 4/3, environ 600 × 450 px, moins de 120 Ko par
image afin de garder l'application légère hors ligne.

Après ajout, incrémentez `CACHE` dans `sw.js` pour que le service worker
distribue bien les nouvelles images.
