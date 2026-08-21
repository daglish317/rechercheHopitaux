Spécification fonctionnelle — Module Examens médicaux
1. Objectif

Le module Examens médicaux permet à l'administrateur de gérer le catalogue des examens médicaux disponibles sur la plateforme et leurs associations avec les hôpitaux.

Il doit permettre de répondre à deux besoins :

gérer les examens médicaux ;
associer les examens aux hôpitaux qui les réalisent.

Le modèle validé contient :

ExamenMedical
--------------
id
nom

et la relation :

Hôpital 0..* ─── 0..* ExamenMedical
2. Acteur

Le module est exclusivement accessible à :

ADMINISTRATEUR

Les autres utilisateurs n'ont pas accès à l'administration.

Visiteur       → accès refusé
Utilisateur    → accès refusé
Administrateur → accès autorisé
3. Accès au module

Depuis le dashboard :

Dashboard
   ↓
Examens médicaux

La page principale du module doit permettre à l'administrateur de gérer les examens médicaux.

4. Organisation fonctionnelle

Le module comporte deux niveaux de gestion :

Examens médicaux
│
├── Catalogue des examens
│
└── Associations avec les hôpitaux

Cette séparation est importante.

Le catalogue définit ce qu'est un examen médical.

L'association définit quels hôpitaux réalisent cet examen.

5. Catalogue des examens médicaux

L'administrateur doit pouvoir consulter les examens existants.

Pour chaque examen, l'information métier principale est :

Nom

Le modèle ne contient actuellement aucun autre champ.

6. Ajouter un examen médical

L'administrateur doit pouvoir créer un examen.

Action :

Ajouter un examen

Le formulaire contient uniquement :

Nom
Workflow
Ajouter
   ↓
Formulaire
   ↓
Saisie du nom
   ↓
Validation
   ↓
Création
   ↓
Retour à la liste

L'identifiant id est généré automatiquement.

7. Validation du nom

Le nom est obligatoire.

Une valeur vide doit être refusée.

Le système doit empêcher la création de doublons.

Exemple :

Examen existant :
IRM


Nouvelle saisie :
IRM


→ Création refusée

Un examen ne doit donc apparaître qu'une seule fois dans le catalogue.

Aucune autre règle de classification ou de normalisation ne doit être ajoutée.

8. Modification d'un examen

L'administrateur peut modifier le nom d'un examen existant.

Workflow :

Liste
   ↓
Modifier
   ↓
Formulaire prérempli
   ↓
Modification
   ↓
Validation
   ↓
Enregistrement

Les règles de validation sont identiques à celles de la création :

nom obligatoire ;
pas de doublon.
9. Suppression d'un examen

Un examen peut être associé à plusieurs hôpitaux.

La relation est :

Hôpital 0..* ─── 0..* ExamenMedical

Un examen utilisé par un ou plusieurs hôpitaux ne doit donc pas être supprimé directement.

Examen non utilisé
Examen
   ↓
Aucun hôpital associé
   ↓
Suppression autorisée
Examen utilisé
Examen
   ↓
Un ou plusieurs hôpitaux associés
   ↓
Suppression refusée

Le système ne doit pas supprimer automatiquement les associations avec les hôpitaux.

10. Confirmation de suppression

Pour un examen qui n'est associé à aucun hôpital :

Supprimer
   ↓
Confirmation
   ├── Annuler
   │      ↓
   │   Aucune modification
   │
   └── Confirmer
          ↓
      Suppression
          ↓
      Liste actualisée
11. Association d'un examen à un hôpital

L'administrateur doit pouvoir indiquer qu'un hôpital réalise un examen.

Action :

Associer un examen à un hôpital

Le système doit permettre de sélectionner :

Hôpital
Examen médical

Les deux éléments doivent provenir des données existantes.

Workflow
Ajouter une association
          ↓
Sélectionner l'hôpital
          ↓
Sélectionner l'examen
          ↓
Validation
          ↓
Association créée
12. Prévention des doublons d'association

Une même association ne doit pas être créée plusieurs fois.

Exemple :

Hôpital Central
      +
IRM

Si cette association existe déjà, le système doit refuser la création d'une seconde association identique.

Il ne doit exister qu'une seule association :

Hôpital Central ↔ IRM
13. Liste des associations

L'administrateur doit pouvoir consulter les associations existantes.

Chaque association doit permettre d'identifier :

Hôpital
Examen médical

Exemple :

┌──────────────────────┬─────────────────────┐
│ Hôpital              │ Examen              │
├──────────────────────┼─────────────────────┤
│ Hôpital Central      │ IRM                  │
│ Hôpital Central      │ Scanner              │
│ Hôpital Général      │ Radiographie         │
└──────────────────────┴─────────────────────┘
14. Consultation dans les deux sens

Le module doit permettre à l'administrateur de connaître :

Les examens réalisés par un hôpital
Hôpital
   ↓
Examens médicaux
Les hôpitaux qui réalisent un examen
Examen médical
   ↓
Hôpitaux

Cette relation sera également exploitée plus tard par le moteur de recherche.

15. Suppression d'une association

L'administrateur doit pouvoir supprimer une association existante.

Exemple :

Hôpital Central ↔ IRM

L'administrateur demande la suppression.

Une confirmation doit être demandée.

Après confirmation :

Association supprimée

La suppression de l'association ne supprime :

ni l'hôpital ;
ni l'examen médical.
16. Modification d'une association

Une association ne possède aucun attribut propre.

Il n'est donc pas nécessaire d'avoir un formulaire de modification.

Pour changer :

Hôpital A ↔ IRM

en :

Hôpital A ↔ Scanner

l'administrateur doit :

supprimer l'association existante ;
créer la nouvelle association.
17. Hôpital inactif

Un hôpital peut devenir INACTIF.

Ses associations avec les examens médicaux doivent être conservées.

Exemple :

Hôpital A
statut = INACTIF


Hôpital A ↔ IRM
Hôpital A ↔ Scanner

La désactivation de l'hôpital ne supprime donc aucune association.

La future recherche publique pourra exclure cet hôpital en fonction de son statut.

18. Gestion des erreurs
Catalogue

Le système doit gérer :

nom manquant ;
examen déjà existant ;
examen inexistant ;
erreur d'enregistrement.
Association

Le système doit gérer :

hôpital non sélectionné ;
examen non sélectionné ;
hôpital inexistant ;
examen inexistant ;
association déjà existante ;
erreur de création.
Suppression

Le système doit gérer :

examen inexistant ;
examen utilisé par un hôpital ;
association inexistante ;
erreur de suppression.

Les messages doivent être explicites pour l'administrateur.

19. Permissions

Toutes les opérations sont réservées à l'administrateur.

Visiteur
   → aucun accès


Utilisateur
   → aucun accès


Administrateur
   → consulter
   → créer un examen
   → modifier un examen
   → supprimer un examen non utilisé
   → associer un examen à un hôpital
   → supprimer une association

Les permissions doivent être vérifiées côté serveur/API.

20. Impact sur le moteur de recherche

Ce module fournira une donnée utilisée par le futur moteur de recherche.

Lorsqu'un utilisateur recherchera un examen :

Recherche
   ↓
ExamenMedical
   ↓
Associations Hôpital ↔ ExamenMedical
   ↓
Hôpitaux correspondants

Le moteur devra retourner uniquement les hôpitaux qui possèdent réellement cette association et qui sont éligibles à la recherche publique.

Le module Examens médicaux ne doit toutefois pas contenir de logique de recherche publique.

21. Données hors périmètre

La classe ExamenMedical reste :

ExamenMedical
--------------
id
nom

Il ne faut pas ajouter automatiquement :

description ;
prix ;
durée ;
spécialité ;
préparation ;
résultat ;
équipement ;
médecin ;
disponibilité ;
urgence ;
statut.

Ces informations n'ont pas été décidées.

De même, l'association avec un hôpital ne reçoit pas de champ supplémentaire.

22. Critères d'acceptation
Catalogue
 L'administrateur peut consulter les examens.
 L'administrateur peut ajouter un examen.
 Le nom est obligatoire.
 Un doublon est refusé.
 L'administrateur peut modifier un examen.
 Un examen utilisé ne peut pas être supprimé.
 Un examen non utilisé peut être supprimé.
 Une confirmation est demandée avant suppression.
Associations
 L'administrateur peut associer un examen à un hôpital.
 L'hôpital doit exister.
 L'examen doit exister.
 Une association identique ne peut pas être créée deux fois.
 L'administrateur peut consulter les associations.
 L'administrateur peut supprimer une association.
 La suppression d'une association ne supprime ni l'hôpital ni l'examen.
Intégrité
 Les associations sont conservées lorsqu'un hôpital devient inactif.
 Aucun champ supplémentaire n'est ajouté à ExamenMedical.
 Aucun statut n'est ajouté à l'association.
 Aucune logique de recherche publique n'est implémentée dans ce module.
Sécurité
 Un visiteur ne peut pas accéder au module.
 Un utilisateur ne peut pas accéder au module.
 Seul un administrateur peut gérer les examens et leurs associations.
État du référentiel après ce module

Nous avons maintenant :

TypeHopital
     │
     ▼
  Hôpital
   │    │
   │    └──────────────┐
   ▼                   ▼
PriseEnCharge      ExamenMedical
   ▲                   ▲
   │                   │
Maladie            Association