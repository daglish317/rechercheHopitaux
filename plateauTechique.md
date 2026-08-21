Spécification fonctionnelle — Module Plateau technique
1. Objectif

Le module Plateau technique permet à l'administrateur de gérer le catalogue des éléments du plateau technique et de définir les éléments disponibles dans chaque hôpital.

Il permet donc de gérer deux choses :

le catalogue des éléments du plateau technique ;
l'association entre un hôpital et un élément du plateau technique.

Le principe est :

Hôpital ↔ PlateauTechnique
2. Acteur

Le module est accessible uniquement à :

ADMINISTRATEUR

Les autres utilisateurs n'ont aucun accès aux fonctions d'administration.

Visiteur       → accès refusé
Utilisateur    → accès refusé
Administrateur → accès autorisé
3. Accès au module

Depuis le dashboard :

Dashboard
   ↓
Plateau technique

La page permet à l'administrateur de gérer les éléments du plateau technique.

4. Données du plateau technique

Le module utilise l'entité :

PlateauTechnique
----------------
id
nom

Le catalogue contient donc uniquement le nom de l'élément.

Aucun autre attribut n'est ajouté.

5. Organisation du module

Le module est organisé en deux parties :

Plateau technique
│
├── Catalogue des éléments
│
└── Associations avec les hôpitaux

Cette séparation permet de distinguer :

ce qu'est un élément technique

de

l'hôpital qui possède/utilise cet élément.

6. Liste des éléments du plateau technique

L'administrateur doit pouvoir consulter les éléments enregistrés.

Pour chaque élément, l'information métier affichée est :

Nom

Exemples possibles uniquement à titre d'illustration :

Scanner
IRM
Échographe

Ces exemples ne constituent pas une liste imposée par le système.

7. Ajouter un élément

L'administrateur doit pouvoir créer un nouvel élément.

Action :

Ajouter un élément

Le formulaire contient uniquement :

Nom

Workflow :

Ajouter
   ↓
Formulaire
   ↓
Nom
   ↓
Validation
   ↓
Création
   ↓
Liste actualisée

L'identifiant est généré automatiquement.

8. Validation du nom

Le nom est obligatoire.

Une valeur vide doit être refusée.

Le système doit également empêcher la création de doublons.

Exemple :

Élément existant :
Scanner


Nouvelle saisie :
Scanner


→ Création refusée

Une même entrée ne doit donc pas apparaître plusieurs fois dans le catalogue.

9. Modification d'un élément

L'administrateur doit pouvoir modifier le nom d'un élément existant.

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

Les règles de validation de création sont également appliquées lors de la modification.

Le nom :

est obligatoire ;
ne doit pas correspondre à un autre élément déjà existant.
10. Suppression d'un élément

Un élément du plateau technique peut être associé à plusieurs hôpitaux.

La relation est :

Hôpital 0..* ─── 0..* PlateauTechnique

Un élément utilisé par un ou plusieurs hôpitaux ne doit donc pas être supprimé directement.

Élément non utilisé
PlateauTechnique
       ↓
Aucun hôpital associé
       ↓
Suppression autorisée
Élément utilisé
PlateauTechnique
       ↓
Un ou plusieurs hôpitaux associés
       ↓
Suppression refusée

Le système ne doit pas supprimer automatiquement les associations existantes.

11. Confirmation de suppression

Pour un élément qui n'est associé à aucun hôpital :

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
12. Association avec un hôpital

L'administrateur doit pouvoir indiquer qu'un hôpital dispose d'un élément du plateau technique.

Action :

Associer à un hôpital

Le système doit permettre de sélectionner :

Hôpital
Élément du plateau technique

Les deux doivent provenir des données existantes.

Workflow :

Ajouter une association
          ↓
Sélectionner l'hôpital
          ↓
Sélectionner l'élément
          ↓
Validation
          ↓
Association créée
13. Prévention des doublons

Une même association ne doit pas être créée plusieurs fois.

Exemple :

Hôpital Central ↔ Scanner

Si cette association existe déjà, une seconde association identique doit être refusée.

Il ne doit exister qu'une seule relation :

Hôpital Central
      ↕
Scanner
14. Liste des associations

L'administrateur doit pouvoir consulter les associations existantes.

Chaque association doit permettre d'identifier :

Hôpital
Élément du plateau technique

Exemple conceptuel :

┌──────────────────────┬─────────────────────┐
│ Hôpital              │ Plateau technique   │
├──────────────────────┼─────────────────────┤
│ Hôpital Central      │ Scanner             │
│ Hôpital Central      │ IRM                 │
│ Hôpital Général      │ Échographe          │
└──────────────────────┴─────────────────────┘
15. Consultation dans les deux sens

Le système doit permettre d'identifier :

Les éléments techniques d'un hôpital
Hôpital
   ↓
Plateau technique
Les hôpitaux disposant d'un élément
Plateau technique
   ↓
Hôpitaux

Cette relation sera également exploitée par le futur moteur de recherche.

16. Suppression d'une association

L'administrateur doit pouvoir supprimer une association.

Exemple :

Hôpital Central ↔ Scanner

Workflow :

Supprimer
   ↓
Confirmation
   ↓
Suppression de l'association

La suppression de l'association ne supprime :

ni l'hôpital ;
ni l'élément du plateau technique.
17. Modification d'une association

Une association ne possède aucun attribut propre.

Il n'est donc pas nécessaire de prévoir une fonction de modification.

Pour remplacer :

Hôpital A ↔ Scanner

par :

Hôpital A ↔ IRM

l'administrateur doit :

supprimer l'association Scanner ;
créer l'association IRM.
18. Hôpital inactif

Lorsqu'un hôpital est INACTIF, ses associations avec le plateau technique restent conservées.

Exemple :

Hôpital A
statut = INACTIF


Hôpital A ↔ Scanner
Hôpital A ↔ IRM

La désactivation de l'hôpital ne supprime donc pas ses données.

La future recherche publique pourra simplement exclure cet hôpital en fonction de son statut.

19. Gestion des erreurs
Catalogue

Le système doit gérer :

nom vide ;
élément déjà existant ;
élément inexistant ;
erreur lors de la création ;
erreur lors de la modification.
Association

Le système doit gérer :

hôpital non sélectionné ;
élément non sélectionné ;
hôpital inexistant ;
élément inexistant ;
association déjà existante ;
erreur lors de la création.
Suppression

Le système doit gérer :

élément inexistant ;
élément utilisé par un hôpital ;
association inexistante ;
erreur lors de la suppression.

Les messages doivent être explicites pour l'administrateur.

20. Permissions

Les opérations sont réservées à l'administrateur.

Visiteur
   → aucun accès


Utilisateur
   → aucun accès


Administrateur
   → consulter
   → créer un élément
   → modifier un élément
   → supprimer un élément non utilisé
   → associer un élément à un hôpital
   → supprimer une association

Les permissions doivent également être contrôlées côté serveur/API.

21. Impact sur le moteur de recherche

Le plateau technique constitue une source de données importante pour la recherche.

Lorsqu'un utilisateur recherche un équipement ou une capacité technique :

Recherche
   ↓
PlateauTechnique
   ↓
Associations avec les hôpitaux
   ↓
Hôpitaux correspondants

Le moteur de recherche pourra donc identifier les hôpitaux possédant l'élément recherché.

Le module Plateau technique ne doit cependant pas implémenter lui-même le moteur de recherche.

22. Données hors périmètre

La classe PlateauTechnique reste :

PlateauTechnique
----------------
id
nom

Il ne faut pas ajouter :

quantité ;
marque ;
modèle ;
état ;
prix ;
date d'acquisition ;
date de maintenance ;
disponibilité ;
localisation dans l'hôpital ;
description ;
statut ;
personnel responsable.

Ces informations n'ont pas été définies.

De même, l'association entre un hôpital et un élément technique ne doit pas recevoir de champs supplémentaires.

23. Critères d'acceptation
Catalogue
 L'administrateur peut consulter les éléments.
 L'administrateur peut ajouter un élément.
 Le nom est obligatoire.
 Les doublons sont refusés.
 L'administrateur peut modifier un élément.
 Un élément utilisé ne peut pas être supprimé.
 Un élément non utilisé peut être supprimé.
 Une confirmation est demandée avant suppression.
Associations
 L'administrateur peut associer un élément à un hôpital.
 L'hôpital doit exister.
 L'élément doit exister.
 Une association identique ne peut pas être créée deux fois.
 Les associations existantes sont consultables.
 Une association peut être supprimée.
 La suppression d'une association ne supprime ni l'hôpital ni l'élément.
Intégrité
 Les associations sont conservées lorsqu'un hôpital devient inactif.
 Aucun champ supplémentaire n'est ajouté à PlateauTechnique.
 Aucun statut n'est ajouté à l'association.
 Aucune logique de recherche publique n'est implémentée dans ce module.
Sécurité
 Un visiteur ne peut pas accéder au module.
 Un utilisateur ne peut pas accéder au module.
 Seul l'administrateur peut gérer le plateau technique.
24. Position dans notre architecture

Nous avons maintenant terminé les quatre grands référentiels/données médicales du dashboard :

                 ┌──────────────────┐
                 │  TypeHopital     │
                 └────────┬─────────┘
                          │
                          ▼
                    ┌───────────┐
                    │  Hôpital  │
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
     PriseEnCharge   ExamenMedical  PlateauTechnique
            ▲             ▲             ▲
            │             │             │
        Maladie       Association    Association