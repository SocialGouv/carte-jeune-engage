# Widget CJE

## Générer un token

Endpoint

```
https://cje-preprod.ovh.fabrique.social.gouv.fr/api/widgetTokenGenerator
```

Headers (remplacer `your_api_key` par votre clé API)

```yaml
Content-Type: application/json
Authorization: Bearer your_api_key
```

Body (replacer `your_user_id` par l'identifiant de l'utilisateur)

```json
{ "user_id": "your_user_id" }
```

Exemple complet avec une requête curl

```bash
curl -X POST https://cje-preprod.ovh.fabrique.social.gouv.fr/api/widgetTokenGenerator -H "Content-Type: application/json" -H "Authorization: Bearer your_api_key" -d '{
    "user_id": "your_user_id"
}'
```

Format de la réponse

```json
{
  "data": {
    "widgetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTBhOTQ4ZGE3NGM5ZjYxNzVkZjQzN2E2ZTNhODI3MzI6NTcxNjgwZWNhMDA5ZDQ2NzU0ZmJkNjM2YWM5ZWJjNGMiMDJpYXQiOjE3Mjk1MTIyMTAsImV4cCI6MTcyOTU5ODYxMH0.u7a6lM2Lgfnq_1e3x11lKJG5oZ5Hz6U24KK8K0XwWHk"
  }
}
```

## Charger la vue widget

URL à appeler (remplacer le token par celui généré dynamiquement)

```
https://cje-preprod.ovh.fabrique.social.gouv.fr/widget?widgetToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTBhOTQ4ZGE3NGM5ZjYxNzVkZjQzN2E2ZTNhODI3MzI6NTcxNjgwZWNhMDA5ZDQ2NzU0ZmJkNjM2YWM5ZWJjNGMiMDJpYXQiOjE3Mjk1MTIyMTAsImV4cCI6MTcyOTU5ODYxMH0.u7a6lM2Lgfnq_1e3x11lKJG5oZ5Hz6U24KK8K0XwWHk
```
