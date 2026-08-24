# Guide Utilisateur - Gestion des Associations Hôpitaux

## 📖 Introduction

Ce guide vous explique comment gérer les associations entre les hôpitaux et les différents éléments (Maladies, Examens Médicaux, Plateaux Techniques).

---

## 🏥 Modules Disponibles

Trois modules sont disponibles dans le menu administration :

1. **Maladies** : Gérer les maladies prises en charge par chaque hôpital
2. **Examens médicaux** : Gérer les examens disponibles par hôpital
3. **Plateau technique** : Gérer les équipements techniques par hôpital

**Note** : Les trois modules fonctionnent exactement de la même manière.

---

## 🎯 Comment Ajouter des Associations

### Méthode 1 : Ajout Manuel (un par un)

#### Étape 1 : Accéder à la gestion
1. Cliquez sur le module souhaité (Maladies, Examens, ou Plateau Technique)
2. Trouvez l'hôpital dans la liste (utilisez la barre de recherche si nécessaire)
3. Cliquez sur le bouton **"Gérer"** à droite du nom de l'hôpital

#### Étape 2 : Ajouter des éléments
1. Vous voyez la liste des éléments déjà associés (si existants)
2. Cliquez sur **"+ Ajouter une maladie/examen/plateau"**
3. Un nouveau champ de texte apparaît
4. Tapez le nom de l'élément (exemple : "Diabète", "IRM", "Scanner")
5. Répétez pour ajouter plusieurs éléments

#### Étape 3 : Enregistrer
1. Vérifiez votre liste
2. Cliquez sur le bouton **"Enregistrer"**
3. Un message de succès apparaît : "Les associations ont été enregistrées avec succès."

**✨ Astuce** : Les éléments déjà associés apparaissent grisés et ne peuvent pas être modifiés directement.

---

### Méthode 2 : Import Excel (en masse)

#### Étape 1 : Préparer votre fichier Excel

Créez un fichier Excel avec cette structure :

| Hôpital         | Maladie       |
|-----------------|---------------|
| Hôpital Central | Diabète       |
| Hôpital Central | Hypertension  |
| Hôpital Central | Cancer        |
| Hôpital Central | Asthme        |

**Important** :
- Ligne 1 : En-têtes (ignorée par le système)
- Colonne 1 : Nom de l'hôpital (ignoré par le système)
- Colonne 2 : Noms des éléments à ajouter (c'est cette colonne qui est utilisée)

#### Étape 2 : Importer le fichier
1. Accédez à la vue "Gérer" de l'hôpital
2. Cliquez sur le bouton **"Importer Excel"**
3. Sélectionnez votre fichier Excel (.xlsx ou .xls)
4. Les éléments du fichier apparaissent dans la liste

#### Étape 3 : Vérifier et enregistrer
1. Vérifiez la liste importée
2. Ajoutez ou supprimez des éléments si nécessaire
3. Cliquez sur **"Enregistrer"**

**✨ Astuce** : Les doublons dans le fichier Excel sont automatiquement supprimés.

---

## 🗑️ Comment Supprimer des Associations

1. Accédez à la vue "Gérer" de l'hôpital
2. Trouvez l'élément à supprimer dans la liste
3. Cliquez sur l'icône **"X"** à droite de l'élément
4. L'élément disparaît de la liste
5. Cliquez sur **"Enregistrer"** pour confirmer

**⚠️ Important** : La suppression retire seulement l'association avec l'hôpital, l'élément reste disponible dans le système pour d'autres hôpitaux.

---

## 📥 Comment Exporter vers Excel

1. Accédez à la vue "Gérer" de l'hôpital
2. Cliquez sur le bouton **"Exporter Excel"**
3. Le fichier est téléchargé automatiquement
4. Nom du fichier : `maladies_Nom_Hopital.xlsx` (ou examens_, plateau_technique_)

**💡 Utilité** : Permet de sauvegarder une copie, partager la liste, ou réutiliser pour un autre hôpital.

---

## 👀 Comment Consulter les Associations

### Vue Détail (lecture seule)
1. Cliquez sur le module souhaité
2. Trouvez l'hôpital dans la liste
3. Cliquez sur le bouton **"Détail"**
4. Vous voyez la liste complète en lecture seule

Cette vue est utile pour une consultation rapide sans risque de modification.

---

## ⚠️ Messages d'Erreur et Solutions

### "Veuillez remplir tous les champs ou les supprimer."
**Cause** : Un ou plusieurs champs sont vides.  
**Solution** : 
- Remplissez tous les champs avec des noms valides
- OU supprimez les champs vides avec l'icône "X"

### "Certaines maladies/examens/plateaux sont en double."
**Cause** : Vous avez ajouté le même nom plusieurs fois.  
**Solution** : Supprimez les doublons en cliquant sur "X"

### "Erreur lors de l'import du fichier Excel."
**Cause** : Format du fichier non supporté ou fichier corrompu.  
**Solution** :
- Vérifiez que le fichier est au format .xlsx ou .xls
- Assurez-vous que la colonne 2 contient les noms
- Vérifiez qu'il n'y a pas de cellules fusionnées

---

## 💡 Conseils et Bonnes Pratiques

### 1. Nommage cohérent
- Utilisez toujours le même nom pour un même élément
- Exemple : "IRM" partout, pas "IRM" et "irm" et "I.R.M."
- Le système est insensible à la casse mais c'est mieux pour la lisibilité

### 2. Import Excel
- Gardez un template Excel pour faciliter les imports futurs
- Exportez d'abord un hôpital pour avoir le bon format
- Utilisez Excel pour nettoyer vos listes (doublons, espaces, etc.)

### 3. Organisation
- Utilisez la vue "Détail" pour vérifier rapidement
- Utilisez "Gérer" uniquement pour modifier
- Exportez régulièrement pour avoir des sauvegardes

### 4. Workflow efficace
Pour ajouter les mêmes éléments à plusieurs hôpitaux :
1. Gérez le premier hôpital
2. Exportez vers Excel
3. Importez ce fichier dans les autres hôpitaux
4. Ajustez si nécessaire

---

## 🔍 Recherche et Navigation

### Barre de recherche
- Tapez le nom (ou une partie) de l'hôpital
- La recherche se fait automatiquement pendant la frappe
- Résultats filtrés en temps réel

### Pagination
- Utilisez les boutons "Précédent" et "Suivant" en bas de la liste
- Le numéro de page actuelle est affiché : "Page 1 / 5"
- 20 hôpitaux par page

### Bouton Retour
- Cliquez sur "← Retour" pour revenir à la liste des hôpitaux
- Vos modifications non enregistrées seront perdues

---

## 📱 Interface

### Couleurs des boutons
- **Bleu** : Action principale (Gérer, Enregistrer)
- **Blanc/Gris** : Actions secondaires (Détail, Exporter, Importer)
- **Vert** : Message de succès
- **Rouge** : Message d'erreur
- **Icône X rouge** : Suppression

### États des champs
- **Fond blanc, éditable** : Nouveaux éléments à créer
- **Fond blanc, non éditable** : Éléments existants (associés)
- Les champs existants ne peuvent pas être modifiés, seulement supprimés

---

## 🎓 Exemples Pratiques

### Exemple 1 : Premier hôpital
Vous configurez un nouvel hôpital "Centre Médical Nord" :

1. Ouvrez le module "Maladies"
2. Trouvez "Centre Médical Nord"
3. Cliquez "Gérer"
4. Cliquez "+ Ajouter une maladie" plusieurs fois
5. Saisissez : Diabète, Hypertension, Cancer, Asthme
6. Cliquez "Enregistrer"
7. ✅ Succès !

### Exemple 2 : Copier depuis un autre hôpital
Vous voulez que "Clinique Sud" ait les mêmes maladies que "Centre Médical Nord" :

1. Ouvrez "Maladies" pour "Centre Médical Nord"
2. Cliquez "Gérer"
3. Cliquez "Exporter Excel"
4. Fermez et ouvrez "Clinique Sud"
5. Cliquez "Gérer"
6. Cliquez "Importer Excel"
7. Sélectionnez le fichier exporté
8. Cliquez "Enregistrer"
9. ✅ Copie effectuée !

### Exemple 3 : Mise à jour d'une liste
Vous devez retirer "Asthme" et ajouter "Pneumonie" pour un hôpital :

1. Ouvrez la vue "Gérer"
2. Cliquez sur "X" à côté de "Asthme"
3. Cliquez "+ Ajouter une maladie"
4. Saisissez "Pneumonie"
5. Cliquez "Enregistrer"
6. ✅ Mise à jour effectuée !

---

## ❓ Questions Fréquentes

### Q : Puis-je modifier le nom d'un élément existant ?
**R** : Non, les éléments déjà créés ne peuvent pas être modifiés directement. Vous devez supprimer l'ancien et ajouter le nouveau.

### Q : Que se passe-t-il si j'ajoute un nom qui existe déjà ?
**R** : Le système détecte automatiquement que l'élément existe et utilise l'élément existant au lieu d'en créer un nouveau. Aucune erreur n'est affichée.

### Q : Puis-je annuler après avoir cliqué sur "Enregistrer" ?
**R** : Non, une fois enregistré, les modifications sont permanentes. Vous devez refaire les modifications manuellement.

### Q : Le fichier Excel peut-il avoir plus de 2 colonnes ?
**R** : Oui, mais seule la colonne 2 est lue. Les autres colonnes sont ignorées.

### Q : Combien d'éléments puis-je ajouter à un hôpital ?
**R** : Il n'y a pas de limite technique, mais pour des raisons de performance, il est recommandé de rester raisonnable (< 100 éléments).

### Q : Puis-je importer un Excel avec des lignes vides ?
**R** : Oui, les lignes vides sont automatiquement ignorées.

---

## 🆘 Support

Si vous rencontrez un problème non documenté ici :

1. Vérifiez les messages d'erreur à l'écran
2. Essayez de rafraîchir la page (F5)
3. Vérifiez votre connexion Internet
4. Contactez l'administrateur système

---

## 📌 Résumé Rapide

| Action | Bouton | Où |
|--------|--------|-----|
| Voir les associations | **Détail** | Liste des hôpitaux |
| Modifier les associations | **Gérer** | Liste des hôpitaux |
| Ajouter un élément | **+ Ajouter** | Vue Gérer |
| Supprimer une association | **X** | Vue Gérer (à droite de l'élément) |
| Importer Excel | **Importer Excel** | Vue Gérer (en haut) |
| Exporter Excel | **Exporter Excel** | Vue Gérer (en bas) |
| Sauvegarder | **Enregistrer** | Vue Gérer (en bas) |
| Retourner | **← Retour** | Vues Gérer et Détail |

---

**Bonne utilisation ! 🎉**
