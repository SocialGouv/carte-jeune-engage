# Obiz Data Importer

Script Python pour importer et traiter les données Obiz puis les envoyer à une API.

## Prérequis

1. Python 3.7 ou supérieur
2. Modules Python requis :
```bash
pip3 install requests
```
## Structure des fichiers

```
obiz/
│
├── config/
│   ├── genre_mapping.py
│   ├── sousgenres_whitelist.py
│   └── utils.py
│
├── finders/
│   └── sousgenre.py
│
├── inputs/
│   ├── reduccine.fr-preprod.json
│   ├── reduckdo.fr-preprod.json
│   └── reducparc.fr-preprod.json
│
├── parsers/
│   ├── articles.py
│   ├── genres.py
│   └── sousgenres.py
│
├── .gitignore
├── explorer.py
├── importer.py
├── integration.py
└── README.md
```

## Configuration

1. Placez vos fichiers JSON dans le dossier `inputs/`
2. Assurez-vous d'avoir une clé API valide (pour importer)

## Explorer les données

Le script `explorer.py` permet d'analyser interactivement le contenu des fichiers JSON :

```bash
python3 explorer.py
```

Un menu interactif vous proposera de :
- Voir la liste complète des articles
- Explorer les sous-genres disponibles
- Consulter tous les genres
- Analyser en détail un genre spécifique

Suivez les instructions à l'écran pour naviguer dans les différentes options d'exploration.

## Importer les données

### Prérequis
1. Assurez-vous que votre serveur local Payload CMS est en cours d'exécution
2. Générez une clé API depuis l'interface d'administration de Payload CMS

### Exécution
Lancez le script d'import avec votre clé API :

```bash
python3 importer.py --api-url "http://localhost:3000/api/obizIntegration" --api-key "your_api_key"
```

### Résultats
Le script affichera un rapport détaillé des opérations effectuées :
- Liste des offres créées (`created_offers`)
- Liste des offres mises à jour (`updated_offers`)
- Statut de l'intégration des partenaires