# Exemples de requêtes API - Tests manuels

Ce document contient des exemples de requêtes pour tester manuellement l'API avec curl ou Postman.

## 🔐 Authentification

### 1. Créer un administrateur (première fois)
```bash
py manage.py createsuperuser
```

Ou via l'API :
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Admin",
    "email": "admin@hopital.cm",
    "password": "SecurePassword123!",
    "role": "ADMINISTRATEUR"
  }'
```

### 2. Se connecter et obtenir un token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hopital.cm",
    "password": "SecurePassword123!"
  }'
```

**Réponse :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Note :** Copiez le token `access` pour l'utiliser dans les requêtes suivantes.

---

## 📋 MODULE MALADIES

### 1. Créer des maladies dans le référentiel
```bash
# Créer "Paludisme"
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Paludisme"}'

# Créer "Diabète"
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Diabète"}'

# Créer "Hypertension"
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Hypertension"}'

# Créer "AVC"
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "AVC"}'
```

### 2. Lister toutes les maladies
```bash
curl -X GET http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Lister les hôpitaux (pour le module Maladies)
```bash
# Sans recherche
curl -X GET "http://localhost:8000/api/maladies/hopitaux/?page=1&page_size=20" \
  -H "Authorization: Bearer VOTRE_TOKEN"

# Avec recherche
curl -X GET "http://localhost:8000/api/maladies/hopitaux/?search=Yaoundé&page=1" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 4. Voir les maladies d'un hôpital spécifique
```bash
# Remplacer {hopital_id} par l'ID de l'hôpital
curl -X GET http://localhost:8000/api/maladies/associations/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 5. Associer plusieurs maladies à un hôpital
```bash
# Associer les maladies avec IDs 1, 2, 3 à l'hôpital 1
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maladies": [1, 2, 3]
  }'
```

### 6. Modifier les associations (ajouter + supprimer)
```bash
# Nouvelle liste : garder 1 et 3, ajouter 4, supprimer 2
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maladies": [1, 3, 4]
  }'
```

### 7. Supprimer une association spécifique
```bash
# Supprimer l'association entre l'hôpital 1 et la maladie 3
curl -X DELETE http://localhost:8000/api/maladies/associations/1/3/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 8. Exporter les maladies d'un hôpital en Excel
```bash
# Télécharger le fichier Excel
curl -X GET http://localhost:8000/api/maladies/export/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -o maladies_hopital_1.xlsx
```

**Ou dans le navigateur :**
```
http://localhost:8000/api/maladies/export/1/
(avec le token dans l'extension Authorization Bearer)
```

---

## 🔬 MODULE EXAMENS MÉDICAUX

### 1. Créer des examens dans le référentiel
```bash
# Créer "Scanner"
curl -X POST http://localhost:8000/api/examens/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Scanner"}'

# Créer "IRM"
curl -X POST http://localhost:8000/api/examens/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "IRM"}'

# Créer "Radiographie"
curl -X POST http://localhost:8000/api/examens/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Radiographie"}'

# Créer "Échographie"
curl -X POST http://localhost:8000/api/examens/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Échographie"}'
```

### 2. Lister tous les examens
```bash
curl -X GET http://localhost:8000/api/examens/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Lister les hôpitaux (pour le module Examens)
```bash
curl -X GET "http://localhost:8000/api/examens/hopitaux/?page=1&page_size=20" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 4. Voir les examens d'un hôpital spécifique
```bash
curl -X GET http://localhost:8000/api/examens/associations/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 5. Associer plusieurs examens à un hôpital
```bash
curl -X POST http://localhost:8000/api/examens/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examens": [1, 2, 3, 4]
  }'
```

### 6. Supprimer une association spécifique
```bash
curl -X DELETE http://localhost:8000/api/examens/associations/1/2/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 7. Exporter les examens d'un hôpital en Excel
```bash
curl -X GET http://localhost:8000/api/examens/export/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -o examens_hopital_1.xlsx
```

---

## 🏥 MODULE PLATEAU TECHNIQUE

### 1. Créer des éléments de plateau technique
```bash
# Créer "Bloc opératoire"
curl -X POST http://localhost:8000/api/plateau-technique/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Bloc opératoire"}'

# Créer "Laboratoire d'analyses"
curl -X POST http://localhost:8000/api/plateau-technique/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Laboratoire d'\''analyses"}'

# Créer "Service de réanimation"
curl -X POST http://localhost:8000/api/plateau-technique/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Service de réanimation"}'

# Créer "Pharmacie"
curl -X POST http://localhost:8000/api/plateau-technique/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Pharmacie"}'
```

### 2. Lister tous les plateaux techniques
```bash
curl -X GET http://localhost:8000/api/plateau-technique/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Lister les hôpitaux (pour le module Plateau)
```bash
curl -X GET "http://localhost:8000/api/plateau-technique/hopitaux/?page=1&page_size=20" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 4. Voir le plateau technique d'un hôpital spécifique
```bash
curl -X GET http://localhost:8000/api/plateau-technique/associations/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 5. Associer plusieurs éléments de plateau à un hôpital
```bash
curl -X POST http://localhost:8000/api/plateau-technique/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plateaux": [1, 2, 3]
  }'
```

### 6. Supprimer une association spécifique
```bash
curl -X DELETE http://localhost:8000/api/plateau-technique/associations/1/2/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 7. Exporter le plateau technique d'un hôpital en Excel
```bash
curl -X GET http://localhost:8000/api/plateau-technique/export/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -o plateau_hopital_1.xlsx
```

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Tentative de création d'un doublon
```bash
# Créer "Paludisme" deux fois (la deuxième doit échouer)
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Paludisme"}'
```

**Réponse attendue :**
```json
{
  "nom": ["Une maladie avec ce nom existe déjà."]
}
```

### Test 2 : Tentative d'association avec des IDs invalides
```bash
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maladies": [1, 999, 888]
  }'
```

**Réponse attendue :**
```json
{
  "maladies": ["Maladies introuvables : 888, 999"]
}
```

### Test 3 : Tentative d'ajout de doublons dans une association
```bash
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maladies": [1, 2, 2, 3]
  }'
```

**Réponse attendue :**
```json
{
  "maladies": ["Une maladie ne peut être associée qu'une seule fois au même hôpital."]
}
```

### Test 4 : Tentative d'accès sans authentification
```bash
curl -X GET http://localhost:8000/api/maladies/
```

**Réponse attendue :**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Test 5 : Suppression d'une maladie utilisée (doit échouer)
```bash
# D'abord, associer la maladie à un hôpital
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maladies": [1]}'

# Ensuite, tenter de supprimer la maladie
curl -X DELETE http://localhost:8000/api/maladies/1/ \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Réponse attendue :**
```json
{
  "error": "Cette maladie ne peut pas être supprimée car elle est utilisée dans une ou plusieurs prises en charge."
}
```

---

## 📝 SCÉNARIO COMPLET

### Scénario : Gérer les maladies de l'Hôpital Central de Yaoundé

```bash
# 1. Se connecter
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hopital.cm", "password": "SecurePassword123!"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# 2. Créer des maladies
curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Paludisme"}'

curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Diabète"}'

curl -X POST http://localhost:8000/api/maladies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom": "Hypertension"}'

# 3. Lister les hôpitaux
curl -X GET "http://localhost:8000/api/maladies/hopitaux/" \
  -H "Authorization: Bearer $TOKEN"

# 4. Voir les maladies actuelles de l'hôpital 1
curl -X GET http://localhost:8000/api/maladies/associations/1/ \
  -H "Authorization: Bearer $TOKEN"

# 5. Associer les maladies 1, 2, 3 à l'hôpital 1
curl -X POST http://localhost:8000/api/maladies/associations/1/bulk/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maladies": [1, 2, 3]}'

# 6. Vérifier les associations
curl -X GET http://localhost:8000/api/maladies/associations/1/ \
  -H "Authorization: Bearer $TOKEN"

# 7. Exporter en Excel
curl -X GET http://localhost:8000/api/maladies/export/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -o maladies_hopital_central.xlsx

echo "✅ Scénario terminé ! Fichier Excel téléchargé."
```

---

## 🔧 POSTMAN

### Import dans Postman

1. Créer une nouvelle collection "API Hopitaux"
2. Ajouter une variable d'environnement `base_url` = `http://localhost:8000`
3. Ajouter une variable d'environnement `token` (sera remplie automatiquement)
4. Créer les requêtes avec `{{base_url}}` et `Bearer {{token}}`

### Exemple de script Postman pour obtenir le token automatiquement

**Dans la requête Login, onglet "Tests" :**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.access);
    console.log("Token saved:", jsonData.access);
}
```

---

## 📊 CODES DE STATUT ATTENDUS

| Requête | Code attendu |
|---------|--------------|
| GET liste | 200 |
| POST création réussie | 201 |
| POST bulk réussi | 200 |
| PUT modification réussie | 200 |
| DELETE réussie | 204 |
| Validation échouée | 400 |
| Non authentifié | 401 |
| Non autorisé | 403 |
| Ressource introuvable | 404 |

---

## 💡 CONSEILS

1. **Utilisez des variables** : Stockez le token dans une variable pour éviter de le copier-coller
2. **Testez dans l'ordre** : Créez d'abord les référentiels, puis les associations
3. **Vérifiez les IDs** : Les IDs peuvent changer, adaptez vos requêtes en conséquence
4. **Consultez les logs** : En cas d'erreur, vérifiez les logs Django pour plus de détails
5. **Export Excel** : Testez l'export après avoir créé des associations

---

## 🐛 DÉBOGAGE

### Si une requête échoue :

1. Vérifiez que le serveur est démarré : `py manage.py runserver`
2. Vérifiez que le token est valide (durée de vie : 30 minutes)
3. Vérifiez les logs Django dans le terminal
4. Vérifiez que les IDs existent dans la base de données
5. Vérifiez le format JSON (guillemets, virgules, etc.)

### Commandes utiles :

```bash
# Voir les migrations
py manage.py showmigrations

# Appliquer les migrations
py manage.py migrate

# Créer un super utilisateur
py manage.py createsuperuser

# Vérifier la configuration
py manage.py check

# Shell Django pour tester les modèles
py manage.py shell
```

---

**Note :** Remplacez `VOTRE_TOKEN` par le token obtenu lors de la connexion.

**Astuce :** Pour Windows PowerShell, remplacez les `\` par `` ` `` (backtick) pour les retours à la ligne.
