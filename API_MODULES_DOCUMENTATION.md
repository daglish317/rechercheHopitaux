# Documentation API - Modules Maladies, Examens et Plateau Technique

## Vue d'ensemble

Cette documentation décrit l'implémentation complète des modules Maladies, Examens Médicaux et Plateau Technique conformément aux spécifications fonctionnelles définies dans `forme.md`.

Tous les modules suivent le même pattern architectural et fonctionnel pour garantir la cohérence de l'application.

## Architecture commune

Chaque module suit le même workflow :

```
Module (Maladies/Examens/Plateau)
      │
      ▼
Liste des hôpitaux (paginée avec recherche)
      │
      ├── Gérer (modification)
      │     └── Liste des éléments associés
      │     └── Ajouter plusieurs éléments
      │     └── Supprimer des éléments
      │     └── Enregistrer
      │     └── Exporter Excel
      │
      └── Détail (consultation uniquement)
            └── Liste des éléments associés
```

## Authentification

**Toutes les routes nécessitent une authentification administrateur.**

- Header requis : `Authorization: Bearer <token>`
- Permission : `IsAdministrateur`
- Seuls les utilisateurs avec `role="ADMINISTRATEUR"` ou `is_staff=True` peuvent accéder

---

## 1. MODULE MALADIES

### 1.1. Gestion du référentiel des maladies

#### GET /api/maladies/
Récupère la liste de toutes les maladies du référentiel.

**Réponse :**
```json
[
  {
    "id": 1,
    "nom": "Paludisme"
  },
  {
    "id": 2,
    "nom": "Diabète"
  }
]
```

#### POST /api/maladies/
Crée une nouvelle maladie dans le référentiel.

**Requête :**
```json
{
  "nom": "Hypertension"
}
```

**Validations :**
- Le nom est obligatoire
- Le nom doit être unique (insensible à la casse)

#### GET /api/maladies/{id}/
Récupère les détails d'une maladie.

#### PUT /api/maladies/{id}/
Modifie une maladie existante.

#### DELETE /api/maladies/{id}/
Supprime une maladie du référentiel.

**Note :** La suppression échoue si la maladie est associée à au moins un hôpital.

---

### 1.2. Liste des hôpitaux pour le module Maladies

#### GET /api/maladies/hopitaux/
Liste paginée des hôpitaux avec recherche côté serveur.

**Paramètres de requête :**
- `search` (optionnel) : Recherche par nom, adresse ou type d'hôpital
- `page` (optionnel, défaut=1) : Numéro de page
- `page_size` (optionnel, défaut=20) : Nombre d'éléments par page

**Exemple :**
```
GET /api/maladies/hopitaux/?search=Yaoundé&page=1&page_size=20
```

**Réponse :**
```json
{
  "count": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3,
  "results": [
    {
      "id": 5,
      "nom": "Hôpital Central de Yaoundé",
      "type_hopital_nom": "Centre Hospitalier Universitaire"
    },
    {
      "id": 3,
      "nom": "Hôpital Général de Yaoundé",
      "type_hopital_nom": "Hôpital Général"
    }
  ]
}
```

**Ordre :** Les hôpitaux sont triés par `-id` (plus récent en premier). Quand un nouvel hôpital est créé, il apparaît en première position.

---

### 1.3. Gestion des associations hôpital-maladies

#### GET /api/maladies/associations/{hopital_id}/
Récupère toutes les maladies associées à un hôpital spécifique (Vue Gérer/Détail).

**Réponse :**
```json
{
  "hopital": {
    "id": 1,
    "nom": "Hôpital Central de Yaoundé",
    "type_hopital": 2,
    "type_hopital_nom": "Centre Hospitalier",
    "adresse": "Avenue Kennedy, Yaoundé",
    "telephone": "+237 222 23 40 20",
    "latitude": "3.866700",
    "longitude": "11.516700",
    "statut": "ACTIF"
  },
  "maladies": [
    {
      "id": 10,
      "hopital": 1,
      "hopital_nom": "Hôpital Central de Yaoundé",
      "maladie": 1,
      "maladie_nom": "Paludisme"
    },
    {
      "id": 11,
      "hopital": 1,
      "hopital_nom": "Hôpital Central de Yaoundé",
      "maladie": 2,
      "maladie_nom": "Diabète"
    }
  ]
}
```

#### POST /api/maladies/associations/{hopital_id}/bulk/
Enregistrement en masse des associations (remplace toutes les associations existantes).

**Requête :**
```json
{
  "maladies": [1, 2, 5, 8]
}
```

**Comportement :**
- Supprime les associations qui ne sont plus dans la liste
- Ajoute les nouvelles associations
- Conserve les associations existantes

**Validations :**
- Pas de doublons dans la liste
- Tous les IDs doivent exister dans le référentiel
- Liste vide autorisée (supprime toutes les associations)

**Réponse :**
```json
{
  "message": "Associations enregistrées avec succès."
}
```

#### DELETE /api/maladies/associations/{hopital_id}/{maladie_id}/
Supprime une association spécifique entre un hôpital et une maladie.

**Important :** Cela ne supprime PAS la maladie du référentiel, uniquement l'association.

**Réponse :**
```json
{
  "message": "Association supprimée avec succès."
}
```

---

### 1.4. Export Excel

#### GET /api/maladies/export/{hopital_id}/
Exporte les maladies d'un hôpital spécifique au format Excel.

**Format du fichier Excel :**

| Hôpital | Maladie |
|---------|---------|
| Hôpital Central de Yaoundé | Paludisme |
| Hôpital Central de Yaoundé | Diabète |
| Hôpital Central de Yaoundé | Hypertension |

**Nom du fichier :** `maladies_Hopital_Central_de_Yaounde.xlsx`

**Headers de la réponse :**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="maladies_Hopital_Central_de_Yaounde.xlsx"
```

---

## 2. MODULE EXAMENS MÉDICAUX

Le module Examens suit exactement le même pattern que le module Maladies.

### 2.1. Gestion du référentiel des examens

#### GET /api/examens/
Liste tous les examens médicaux.

#### POST /api/examens/
Crée un nouvel examen médical.

**Requête :**
```json
{
  "nom": "Scanner"
}
```

#### GET /api/examens/{id}/
Détails d'un examen.

#### PUT /api/examens/{id}/
Modifie un examen.

#### DELETE /api/examens/{id}/
Supprime un examen (échoue si associé à des hôpitaux).

---

### 2.2. Liste des hôpitaux pour le module Examens

#### GET /api/examens/hopitaux/
Liste paginée avec recherche (identique au module Maladies).

**Paramètres :**
- `search` (optionnel)
- `page` (optionnel, défaut=1)
- `page_size` (optionnel, défaut=20)

---

### 2.3. Gestion des associations hôpital-examens

#### GET /api/examens/associations/{hopital_id}/
Récupère tous les examens associés à un hôpital.

**Réponse :**
```json
{
  "hopital": {
    "id": 1,
    "nom": "Hôpital Central de Yaoundé",
    ...
  },
  "examens": [
    {
      "id": 5,
      "hopital": 1,
      "hopital_nom": "Hôpital Central de Yaoundé",
      "examen": 3,
      "examen_nom": "IRM"
    }
  ]
}
```

#### POST /api/examens/associations/{hopital_id}/bulk/
Enregistrement en masse.

**Requête :**
```json
{
  "examens": [1, 3, 5, 7]
}
```

#### DELETE /api/examens/associations/{hopital_id}/{examen_id}/
Supprime une association spécifique.

---

### 2.4. Export Excel

#### GET /api/examens/export/{hopital_id}/
Exporte les examens d'un hôpital au format Excel.

**Format du fichier :**

| Hôpital | Examen |
|---------|--------|
| Hôpital Central de Yaoundé | Scanner |
| Hôpital Central de Yaoundé | IRM |

**Nom du fichier :** `examens_Hopital_Central_de_Yaounde.xlsx`

---

## 3. MODULE PLATEAU TECHNIQUE

Le module Plateau Technique suit le même pattern.

### 3.1. Gestion du référentiel du plateau technique

#### GET /api/plateau-technique/
Liste tous les éléments du plateau technique.

#### POST /api/plateau-technique/
Crée un nouvel élément de plateau technique.

**Requête :**
```json
{
  "nom": "Bloc opératoire"
}
```

#### GET /api/plateau-technique/{id}/
Détails d'un élément.

#### PUT /api/plateau-technique/{id}/
Modifie un élément.

#### DELETE /api/plateau-technique/{id}/
Supprime un élément (échoue si associé à des hôpitaux).

---

### 3.2. Liste des hôpitaux pour le module Plateau

#### GET /api/plateau-technique/hopitaux/
Liste paginée avec recherche.

**Paramètres :**
- `search` (optionnel)
- `page` (optionnel, défaut=1)
- `page_size` (optionnel, défaut=20)

---

### 3.3. Gestion des associations hôpital-plateau

#### GET /api/plateau-technique/associations/{hopital_id}/
Récupère tous les éléments de plateau associés à un hôpital.

**Réponse :**
```json
{
  "hopital": {
    "id": 1,
    "nom": "Hôpital Central de Yaoundé",
    ...
  },
  "plateaux": [
    {
      "id": 8,
      "hopital": 1,
      "hopital_nom": "Hôpital Central de Yaoundé",
      "plateau_technique": 2,
      "plateau_technique_nom": "Bloc opératoire"
    }
  ]
}
```

#### POST /api/plateau-technique/associations/{hopital_id}/bulk/
Enregistrement en masse.

**Requête :**
```json
{
  "plateaux": [1, 2, 4, 6]
}
```

#### DELETE /api/plateau-technique/associations/{hopital_id}/{plateau_id}/
Supprime une association spécifique.

---

### 3.4. Export Excel

#### GET /api/plateau-technique/export/{hopital_id}/
Exporte le plateau technique d'un hôpital au format Excel.

**Format du fichier :**

| Hôpital | Plateau Technique |
|---------|-------------------|
| Hôpital Central de Yaoundé | Bloc opératoire |
| Hôpital Central de Yaoundé | Laboratoire d'analyses |

**Nom du fichier :** `plateau_technique_Hopital_Central_de_Yaounde.xlsx`

---

## 4. RÈGLES COMMUNES

### 4.1. Sécurité

- ✅ Toutes les routes nécessitent une authentification administrateur
- ✅ Permissions vérifiées avec `IsAdministrateur`
- ✅ L'interface publique n'a AUCUN accès en écriture
- ✅ Les tokens JWT sont requis pour toutes les opérations

### 4.2. Validation des données

- ✅ Noms obligatoires et uniques (insensible à la casse)
- ✅ Pas de doublons dans les associations
- ✅ IDs validés côté backend
- ✅ Protection contre la suppression d'éléments utilisés

### 4.3. Ordre d'affichage

- ✅ Les hôpitaux sont triés par `-id` (plus récent en premier)
- ✅ Un nouvel hôpital apparaît immédiatement en première position
- ✅ Le backend fournit l'ordre, le frontend ne doit pas le modifier

### 4.4. Pagination et recherche

- ✅ Recherche effectuée côté serveur
- ✅ Pagination pour gérer un grand nombre d'hôpitaux
- ✅ Pas de chargement massif côté client
- ✅ Performances optimisées avec `select_related`

### 4.5. Opérations en masse

- ✅ Ajout de plusieurs éléments en une seule opération
- ✅ Enregistrement unique pour toutes les modifications
- ✅ Gestion atomique des ajouts/suppressions

### 4.6. Export Excel

- ✅ Export disponible uniquement dans la vue Gérer
- ✅ Export par hôpital (jamais global)
- ✅ Nom de l'hôpital présent sur chaque ligne
- ✅ Format standardisé et lisible

---

## 5. CODES DE STATUT HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| 200 | OK | Requête réussie (GET, PUT, POST bulk) |
| 201 | Created | Ressource créée (POST) |
| 204 | No Content | Suppression réussie (DELETE) |
| 400 | Bad Request | Données invalides, doublons, validation échouée |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource introuvable |
| 500 | Server Error | Erreur serveur interne |

---

## 6. GESTION DES ERREURS

### Exemples de réponses d'erreur :

**Validation échouée :**
```json
{
  "nom": ["Un élément avec ce nom existe déjà."]
}
```

**Doublons détectés :**
```json
{
  "maladies": ["Une maladie ne peut être associée qu'une seule fois au même hôpital."]
}
```

**IDs introuvables :**
```json
{
  "maladies": ["Maladies introuvables : 12, 45, 78"]
}
```

**Suppression impossible :**
```json
{
  "error": "Cette maladie ne peut pas être supprimée car elle est utilisée dans une ou plusieurs prises en charge."
}
```

**Association introuvable :**
```json
{
  "error": "Association introuvable."
}
```

---

## 7. MODÈLE DE DONNÉES

### Maladie
```python
class Maladie(models.Model):
    nom = models.CharField(max_length=255, unique=True)
```

### PriseEnCharge (Association hôpital-maladie)
```python
class PriseEnCharge(models.Model):
    hopital = models.ForeignKey(Hopital, on_delete=models.CASCADE)
    maladie = models.ForeignKey(Maladie, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ["hopital", "maladie"]
```

### ExamenMedical
```python
class ExamenMedical(models.Model):
    nom = models.CharField(max_length=255, unique=True)
```

### HopitalExamen (Association hôpital-examen)
```python
class HopitalExamen(models.Model):
    hopital = models.ForeignKey(Hopital, on_delete=models.CASCADE)
    examen = models.ForeignKey(ExamenMedical, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ["hopital", "examen"]
```

### PlateauTechnique
```python
class PlateauTechnique(models.Model):
    nom = models.CharField(max_length=255, unique=True)
```

### HopitalPlateauTechnique (Association hôpital-plateau)
```python
class HopitalPlateauTechnique(models.Model):
    hopital = models.ForeignKey(Hopital, on_delete=models.CASCADE)
    plateau_technique = models.ForeignKey(PlateauTechnique, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ["hopital", "plateau_technique"]
```

---

## 8. CONFORMITÉ AVEC LES SPÉCIFICATIONS

Cette implémentation respecte **intégralement** les spécifications du fichier `forme.md` :

✅ **Liste des hôpitaux** : Paginée, avec recherche côté serveur, ordre `-id`  
✅ **Vue Gérer** : Ajout multiple, suppression, enregistrement en masse, export Excel  
✅ **Vue Détail** : Consultation uniquement, pas de modification  
✅ **Navigation interne** : Le module ne redirige pas vers d'autres modules  
✅ **Référentiel distinct** : Les maladies/examens/plateaux existent indépendamment  
✅ **Associations** : Gestion claire de la relation hôpital ↔ élément  
✅ **Export Excel** : Par hôpital uniquement, format standardisé  
✅ **Sécurité** : Toutes les opérations réservées aux administrateurs  
✅ **Gestion des erreurs** : Messages explicites, pas de réussite fictive  
✅ **Performance** : Pagination, select_related, pas de chargement massif  
✅ **Pattern reproductible** : Les 3 modules suivent exactement la même logique  

---

## 9. EXEMPLE D'UTILISATION FRONTEND

### Scénario complet : Gérer les maladies d'un hôpital

**Étape 1 : Récupérer la liste des hôpitaux**
```javascript
GET /api/maladies/hopitaux/?page=1&page_size=20
```

**Étape 2 : Utilisateur clique sur "Gérer" pour l'hôpital ID=5**
```javascript
GET /api/maladies/associations/5/
```

**Étape 3 : Afficher les maladies déjà associées + formulaire d'ajout**
- Frontend affiche les maladies existantes
- Permet d'ajouter plusieurs nouvelles maladies
- Permet de supprimer des maladies existantes

**Étape 4 : Récupérer le référentiel des maladies pour la sélection**
```javascript
GET /api/maladies/
```

**Étape 5 : Utilisateur ajoute 3 nouvelles maladies et supprime 1 existante**
- Maladies actuelles : [1, 2, 3, 4]
- Utilisateur ajoute : [5, 6, 7]
- Utilisateur supprime : [2]
- Nouvelle liste : [1, 3, 4, 5, 6, 7]

**Étape 6 : Enregistrement**
```javascript
POST /api/maladies/associations/5/bulk/
{
  "maladies": [1, 3, 4, 5, 6, 7]
}
```

**Étape 7 : Export Excel (optionnel)**
```javascript
GET /api/maladies/export/5/
```

---

## 10. INSTALLATION ET DÉPENDANCES

### Requirements
```
Django>=5.1,<6.2
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
django-cors-headers>=4.3.0
Pillow>=10.0.0
openpyxl>=3.1.0
```

### Installation
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 11. TESTS RECOMMANDÉS

### Tests unitaires à effectuer :

**Pour chaque module (Maladies, Examens, Plateau) :**

1. ✅ Création d'un élément du référentiel
2. ✅ Tentative de création d'un doublon (doit échouer)
3. ✅ Modification d'un élément
4. ✅ Suppression d'un élément non utilisé (doit réussir)
5. ✅ Suppression d'un élément utilisé (doit échouer)
6. ✅ Liste paginée des hôpitaux
7. ✅ Recherche d'hôpitaux
8. ✅ Récupération des associations pour un hôpital
9. ✅ Ajout en masse d'associations
10. ✅ Suppression d'une association spécifique
11. ✅ Tentative d'association avec des IDs inexistants (doit échouer)
12. ✅ Tentative d'ajout de doublons (doit échouer)
13. ✅ Export Excel d'un hôpital avec associations
14. ✅ Export Excel d'un hôpital sans associations
15. ✅ Permissions : accès refusé sans authentification
16. ✅ Permissions : accès refusé pour utilisateur non-admin

---

## Conclusion

Cette implémentation fournit une API backend complète, robuste et conforme aux spécifications fonctionnelles définies dans `forme.md`. Les trois modules (Maladies, Examens, Plateau Technique) suivent le même pattern architectural, ce qui garantit la maintenabilité et l'évolutivité du code.

Tous les endpoints sont sécurisés, validés et optimisés pour les performances. L'export Excel est fonctionnel pour chaque module.

**Le système est prêt pour l'intégration frontend.**
