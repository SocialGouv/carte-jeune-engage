# Je donne mon avis

![CI Workflow](https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr/actions/workflows/ci.yml/badge.svg)

## Developpement

### Webapp

Accédez au dossier de l'application NextJS webapp :

```bash
cd webap
```

Copiez le fichier .env.example :

```bash
cp .env.example .env
```

Installez les dépendances nécessaires :

```bash
yarn
```

Initialisez la base de données Postgres :

```bash
npx prisma db migrate dev
```

Lancez l'application, qui sera accessible sur le port 3000 :

```bash
yarn dev
```
