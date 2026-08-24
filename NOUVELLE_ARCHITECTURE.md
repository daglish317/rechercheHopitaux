# Documentation de la Nouvelle Architecture - Création Inline avec Import Excel

## Vue d'ensemble

La nouvelle architecture permet maintenant de créer des items (Maladies, Examens Médicaux, Plateaux Techniques) directement dans la vue "Gérer" au lieu de sélectionner depuis un catalogue pré-existant.

## Changements Majeurs

### 1. Nouvelle Interface PendingItem

```typescript
interface PendingItem {
  id?: number;          // ID si c'est un item existant
  nom: string;          // Nom de l'item (nouveau ou existant)
  isNew: boolean;       // true = à créer, false = existant
  tempId: string;       // ID temporaire pour la gestion de la liste
}
```

### 2. Fonctionnalités Ajoutées

#### A. Création Inline
- Les utilisateurs peuvent maintenant taper directement le nom d'un item dans un champ texte
- Possibilité d'ajouter plusieurs items avant d'enregistrer
- Les items existants sont affichés en lecture seule (readOnly)
- Les nouveaux items sont éditables

#### B. Import Excel
- Bouton "Importer Excel" disponible dans la vue "Gérer"
- Format attendu : fichier Excel (.xlsx, .xls) avec :
  - Ligne 1 : En-têtes (ignorée)
  - Colonne 1 : Nom de l'hôpital (ignoré)
  - Colonne 2 : Nom de l'item (Maladie/Examen/Plateau)
- Les doublons sont automatiquement retirés
- Les items importés remplacent la liste actuelle

#### C. Export Excel (déjà existant)
- Bouton "Exporter Excel" pour télécharger les associations actuelles
- Format : Nom de l'hôpital + Liste des items associés

### 3. Flux de Travail

#### Scénario 1 : Ajouter de nouveaux items
1. L'utilisateur clique sur "Gérer" pour un hôpital
2. Les items existants sont chargés (en lecture seule)
3. L'utilisateur clique sur "+ Ajouter une maladie/examen/plateau"
4. Un nouveau champ texte vide apparaît
5. L'utilisateur saisit le nom de l'item
6. L'utilisateur peut ajouter autant d'items qu'il veut
7. Au clic sur "Enregistrer" :
   - Les nouveaux items sont créés dans le référentiel
   - Les associations sont établies avec l'hôpital
   - La liste est rechargée avec tous les items

#### Scénario 2 : Import Excel
1. L'utilisateur clique sur "Gérer" pour un hôpital
2. L'utilisateur clique sur "Importer Excel"
3. Sélection d'un fichier Excel avec la liste des items
4. Les items du fichier remplacent la liste actuelle
5. L'utilisateur peut encore ajouter/supprimer des items
6. Au clic sur "Enregistrer", les items sont créés et associés

#### Scénario 3 : Supprimer des associations
1. L'utilisateur clique sur l'icône "X" à côté d'un item
2. L'item est retiré de la liste (pas supprimé du référentiel)
3. Au clic sur "Enregistrer", l'association est retirée

### 4. Validations Implémentées

#### A. Champs vides
- Message d'erreur : "Veuillez remplir tous les champs ou les supprimer."
- Bloque l'enregistrement si un champ est vide

#### B. Doublons
- Message d'erreur : "Certaines maladies/examens/plateaux sont en double. Veuillez les supprimer."
- Comparaison insensible à la casse (case-insensitive)
- Bloque l'enregistrement si des doublons sont détectés

#### C. Items existants
- Si un item avec le même nom existe déjà dans le référentiel lors de la création
- Le système récupère l'ID de l'item existant
- Aucune erreur n'est affichée (comportement transparent)

### 5. Composants Modifiés

#### A. Icônes (frontend/src/components/Icons.tsx)
```typescript
// Nouvelles icônes ajoutées
export function UploadIcon() // Pour import Excel
export function DownloadIcon() // Pour export Excel
```

#### B. Package.json (frontend/package.json)
```json
{
  "dependencies": {
    ...
    "xlsx": "^0.18.5"  // Nouvelle dépendance
  }
}
```

#### C. Pages des Modules
- `frontend/src/app/admin/maladies/page.tsx` - Complètement réécrit
- `frontend/src/app/admin/examens-medicaux/page.tsx` - Complètement réécrit
- `frontend/src/app/admin/plateau-technique/page.tsx` - Complètement réécrit

### 6. Structure des Modules

Les trois modules suivent exactement la même architecture :

```
Module (Maladie/Examen/Plateau)
├── Vue Liste
│   ├── Recherche paginée des hôpitaux
│   └── Boutons "Gérer" et "Détail"
├── Vue Gérer
│   ├── Liste des items associés (lecture seule)
│   ├── Champs pour nouveaux items (éditables)
│   ├── Bouton "Importer Excel"
│   ├── Bouton "+ Ajouter un item"
│   ├── Bouton "Enregistrer"
│   └── Bouton "Exporter Excel"
└── Vue Détail
    └── Liste en lecture seule des associations
```

### 7. API Backend (Inchangée)

Les endpoints backend restent identiques :

```
GET /api/{module}/hopitaux/                    # Liste paginée des hôpitaux
GET /api/{module}/associations/{hopital_id}/   # Récupérer les associations
POST /api/{module}/associations/{hopital_id}/bulk/  # Sauvegarder en masse
GET /api/{module}/export/{hopital_id}/         # Export Excel
POST /api/{module}/                            # Créer un item
```

### 8. Avantages de la Nouvelle Architecture

1. **Simplicité** : Plus besoin de gérer un référentiel séparé
2. **Rapidité** : Ajout direct sans changement de contexte
3. **Import en masse** : Possibilité d'importer des listes complètes via Excel
4. **Flexibilité** : Ajout de nouveaux items + modification des existants en une seule opération
5. **Cohérence** : Les trois modules suivent exactement le même pattern

### 9. Format du Fichier Excel pour Import

#### Exemple de structure :
```
| Hôpital         | Maladie/Examen/Plateau |
|-----------------|------------------------|
| Hôpital Central | Diabète                |
| Hôpital Central | Hypertension           |
| Hôpital Central | Cancer                 |
```

**Note** : 
- La colonne 1 (Hôpital) est ignorée
- Seule la colonne 2 est utilisée pour extraire les noms
- Les doublons sont automatiquement supprimés
- Les lignes vides sont ignorées

### 10. Messages Utilisateur

#### Messages de succès
- "Les associations ont été enregistrées avec succès."

#### Messages d'erreur
- "Veuillez remplir tous les champs ou les supprimer."
- "Certaines maladies/examens/plateaux sont en double. Veuillez les supprimer."
- "Erreur lors du chargement des hôpitaux."
- "Erreur lors du chargement des associations."
- "Erreur lors de l'enregistrement."
- "Erreur lors de l'export Excel."
- "Erreur lors de l'import du fichier Excel."
- "Erreur lors de la lecture du fichier Excel. Vérifiez le format."

### 11. États de l'Interface

#### Champs de texte
- **Nouveaux items** : Fond blanc, éditable, placeholder visible
- **Items existants** : Fond blanc, lecture seule (readOnly), texte pré-rempli

#### Boutons
- **"+ Ajouter"** : Toujours actif (plus de message "Aucun élément disponible")
- **"Enregistrer"** : Désactivé pendant l'enregistrement, affiche "Enregistrement..."
- **"Exporter Excel"** : Désactivé si aucun item dans la liste

### 12. Déploiement

#### Étapes à suivre :
1. ✅ Installer les dépendances : `npm install` (déjà fait)
2. ✅ Vérifier que les trois modules sont implémentés
3. Démarrer le serveur frontend : `npm run dev`
4. Tester chaque module individuellement
5. Tester l'import/export Excel
6. Vérifier la création de nouveaux items
7. Vérifier la gestion des erreurs

## Conclusion

La nouvelle architecture offre une expérience utilisateur beaucoup plus fluide et intuitive, éliminant la confusion précédente liée au message "Aucun élément disponible dans le référentiel". Les utilisateurs peuvent maintenant créer et associer des items en une seule opération, avec la possibilité d'importer des listes complètes via Excel.
