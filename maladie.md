Spécification fonctionnelle — Module Maladies
1. Objectif

Le module Maladies permet à l'administrateur de gérer le catalogue des maladies disponibles sur la plateforme.

Les maladies enregistrées dans ce module pourront ensuite être associées aux hôpitaux par l'intermédiaire du module Prises en charge.

Le module repose exclusivement sur la classe :

Maladie
-------
id
nom

Aucune autre propriété n'est actuellement définie.

2. Acteur

Le seul acteur autorisé est :

ADMINISTRATEUR

Les autres utilisateurs ne disposent d'aucun accès à ce module.

Visiteur       → accès refusé
Utilisateur    → accès refusé
Administrateur → accès autorisé
3. Accès au module

Depuis le dashboard :

Dashboard
   ↓
Maladies

L'administrateur arrive sur la page de gestion des maladies.

Cette page affiche la liste des maladies actuellement enregistrées.

4. Liste des maladies

La liste doit permettre à l'administrateur de consulter les maladies existantes.

Pour chaque maladie, l'information métier principale affichée est :

Nom

L'identifiant id est une donnée technique et n'a pas besoin d'être présenté comme information principale dans l'interface.

Chaque maladie doit disposer des actions permettant sa gestion.

5. Ajouter une maladie

L'administrateur doit pouvoir ajouter une nouvelle maladie.

Action :

Ajouter une maladie

Le formulaire contient uniquement :

Nom

Aucun autre champ ne doit être ajouté.

Workflow
Ajouter une maladie
        ↓
Formulaire
        ↓
Saisie du nom
        ↓
Validation
        ↓
Création de la maladie
        ↓
Retour à la liste

L'identifiant id est généré automatiquement par le système.

6. Validation du nom

Le nom est obligatoire.

Une valeur vide doit être refusée.

Le système doit également empêcher la création d'un doublon correspondant au même nom de maladie.

Exemple :

Maladie existante :
Paludisme


Nouvelle saisie :
Paludisme


→ Création refusée

L'objectif est d'empêcher plusieurs entrées représentant la même maladie dans le référentiel.

Aucune autre règle de classification ou de normalisation n'est ajoutée.

7. Modification d'une maladie

L'administrateur doit pouvoir modifier le nom d'une maladie existante.

Workflow :

Liste des maladies
       ↓
Modifier
       ↓
Formulaire prérempli
       ↓
Modification du nom
       ↓
Validation
       ↓
Enregistrement

Le système doit appliquer les mêmes règles que lors de la création :

le nom est obligatoire ;
le nouveau nom ne doit pas déjà correspondre à une autre maladie.
8. Suppression d'une maladie

Une maladie peut être associée à un ou plusieurs hôpitaux par l'intermédiaire de PriseEnCharge.

La relation est :

Hôpital 1 ─── 0..* PriseEnCharge
Maladie 1 ─── 0..* PriseEnCharge

Par conséquent, une maladie utilisée dans une prise en charge ne doit pas pouvoir être supprimée directement.

Maladie non utilisée
Maladie
   ↓
Aucune prise en charge
   ↓
Suppression autorisée
Maladie utilisée
Maladie
   ↓
Une ou plusieurs prises en charge
   ↓
Suppression refusée

Le système ne doit pas supprimer automatiquement les prises en charge associées.

9. Confirmation de suppression

Lorsqu'une maladie n'est associée à aucune prise en charge et que l'administrateur demande sa suppression :

Supprimer
    ↓
Demande de confirmation
    │
    ├── Annuler
    │      ↓
    │   Aucune modification
    │
    └── Confirmer
           ↓
       Suppression
           ↓
       Liste actualisée
10. Modification d'une maladie utilisée

Une maladie peut être modifiée même si elle est déjà utilisée dans des prises en charge.

Exemple :

Maladie
   ↓
"Nom actuel"
   ↓
Modification
   ↓
"Nouveau nom"

Les prises en charge existantes continuent de référencer la même maladie.

Seul son nom est modifié.

Il ne faut donc pas créer une nouvelle maladie à chaque modification du nom.

11. Interaction avec le module Prises en charge

Le module Maladies fournit le catalogue utilisé par PriseEnCharge.

Maladie
   │
   │
   ▼
PriseEnCharge
   ▲
   │
   │
Hôpital

Lorsqu'une prise en charge sera créée, le système devra sélectionner une maladie existante.

Le module Maladies ne doit pas créer directement une prise en charge.

12. Interaction avec les hôpitaux

Le module Maladies ne doit pas directement modifier les associations :

Maladie ↔ Hôpital

Ces associations appartiennent au module Prises en charge.

Cela permet de séparer clairement :

Module Maladies
    ↓
Gestion du catalogue


Module Prises en charge
    ↓
Gestion des associations
13. Impact futur sur le moteur de recherche

Le moteur de recherche utilisera ultérieurement le catalogue des maladies.

Lorsqu'un utilisateur recherchera une maladie, le moteur devra pouvoir identifier les hôpitaux qui la prennent réellement en charge.

La logique sera :

Recherche maladie
       ↓
Maladie
       ↓
PriseEnCharge
       ↓
Hôpitaux correspondants

Le module Maladies ne réalise cependant aucune recherche publique.

Il fournit uniquement les données de référence.

14. Gestion des erreurs
Création

Le système doit gérer :

nom vide ;
maladie déjà existante ;
erreur lors de l'enregistrement.
Modification

Le système doit gérer :

maladie inexistante ;
nom vide ;
nom déjà utilisé par une autre maladie ;
erreur lors de l'enregistrement.
Suppression

Le système doit gérer :

maladie inexistante ;
maladie utilisée dans une prise en charge ;
erreur lors de la suppression.

Dans chaque cas, l'administrateur doit recevoir un message explicite indiquant le problème.

15. Permissions et sécurité

Les opérations doivent être protégées côté serveur/API.

Visiteur
   → refus


Utilisateur
   → refus


Administrateur
   → autorisé

Un utilisateur non autorisé ne doit pas pouvoir contourner l'interface et manipuler directement les données via l'API.

16. Données hors périmètre

La classe Maladie ne doit pas recevoir automatiquement des champs tels que :

description ;
symptômes ;
causes ;
gravité ;
catégorie ;
code médical ;
spécialité ;
statut ;
date de création ;
date de modification ;
image ;
traitement.

Ces informations n'ont pas été définies dans notre modèle.

L'IA d'implémentation ne doit donc pas les créer.

17. Critères d'acceptation
Consultation
 L'administrateur peut accéder au module Maladies.
 La liste des maladies existantes est affichée.
 Le nom de chaque maladie est visible.
Création
 L'administrateur peut ajouter une maladie.
 Le nom est obligatoire.
 Une maladie déjà existante ne peut pas être créée une seconde fois.
 La maladie créée apparaît dans la liste.
Modification
 L'administrateur peut modifier une maladie.
 Le formulaire contient le nom existant.
 Le nom ne peut pas être vide.
 Un doublon est refusé.
 La modification est enregistrée.
Suppression
 L'administrateur peut demander la suppression d'une maladie.
 Une confirmation est demandée.
 Une maladie non utilisée peut être supprimée.
 Une maladie utilisée dans une prise en charge ne peut pas être supprimée.
 Les prises en charge existantes ne sont jamais supprimées automatiquement.
Sécurité
 Un visiteur ne peut pas accéder au module.
 Un utilisateur ne peut pas accéder au module.
 Seul l'administrateur peut gérer les maladies.
18. Périmètre final du module

Le module Maladies se limite donc à :

┌─────────────────────────────┐
│          MALADIES           │
├─────────────────────────────┤
│                             │
│  Consulter                  │
│  Ajouter                    │
│  Modifier                   │
│  Supprimer*                 │
│                             │
└─────────────────────────────┘


* uniquement si la maladie
  n'est utilisée dans aucune
  prise en charge

Il ne gère pas les associations avec les hôpitaux.