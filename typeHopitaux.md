Spécification fonctionnelle — Module « Types d'hôpitaux »
1. Objectif

Le module permet à l'administrateur de gérer le catalogue des types d'hôpitaux utilisés par la plateforme.

Ces types permettent ensuite de catégoriser les hôpitaux.

Le module repose sur la classe :

TypeHopital
-----------
id
nom

Aucune autre donnée n'est actuellement associée à cette classe.

2. Acteur
Administrateur

Seul l'utilisateur possédant le rôle :

ADMINISTRATEUR

peut gérer les types d'hôpitaux.

Les utilisateurs publics n'ont aucun accès à ce module.

3. Accès au module

Depuis le dashboard administrateur :

Dashboard
   ↓
Types d'hôpitaux

L'administrateur arrive sur la page de gestion des types d'hôpitaux.

La page doit afficher la liste des types actuellement enregistrés.

4. Liste des types d'hôpitaux

La page principale du module affiche les types enregistrés.

Pour chaque type, l'interface affiche au minimum :

Nom du type

L'identifiant id peut être utilisé techniquement, mais il n'est pas nécessairement destiné à être présenté à l'administrateur.

La liste doit permettre à l'administrateur d'identifier chaque type et d'effectuer les opérations disponibles.

5. Ajouter un type d'hôpital

L'administrateur doit pouvoir créer un nouveau type.

Action :

Ajouter un type

Le formulaire contient uniquement :

Nom

Puis l'administrateur valide la création.

Workflow
Ajouter
   ↓
Formulaire
   ↓
Saisie du nom
   ↓
Validation
   ↓
Création du TypeHopital
   ↓
Retour à la liste

Le système génère automatiquement id.

6. Validation du nom

Le nom est obligatoire.

Une valeur vide ne doit pas être acceptée.

Le système doit également empêcher la création d'un type ayant exactement le même nom qu'un type déjà enregistré.

Exemple :

Type existant : Hôpital public


Nouvelle saisie : Hôpital public


→ Création refusée

La comparaison doit être réalisée de manière cohérente afin d'éviter les doublons évidents.

Le système ne doit cependant pas inventer de règles supplémentaires de normalisation qui n'ont pas été décidées.

7. Modification d'un type

L'administrateur doit pouvoir modifier le nom d'un type existant.

Workflow :

Liste
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

Le système doit appliquer les mêmes règles de validation que lors de la création :

nom obligatoire ;
pas de doublon avec un autre type existant.
8. Suppression d'un type

L'administrateur doit pouvoir supprimer un type uniquement lorsqu'il n'est pas utilisé par un hôpital.

C'est une règle importante compte tenu de la relation :

TypeHopital 1 ─── 0..* Hopital

Si un type est associé à un ou plusieurs hôpitaux, sa suppression pourrait créer une incohérence dans les données.

Donc :

Type non utilisé
      ↓
Suppression autorisée

et :

Type utilisé par un hôpital
      ↓
Suppression refusée

Dans le second cas, l'interface doit informer clairement l'administrateur que le type ne peut pas être supprimé parce qu'il est actuellement utilisé.

Nous ne supprimons donc pas automatiquement les associations avec les hôpitaux.

9. Confirmation de suppression

Lorsqu'un administrateur demande la suppression d'un type qui peut être supprimé, le système doit demander une confirmation avant l'opération définitive.

Workflow :

Supprimer
    ↓
Confirmation
    ├── Annuler → aucune modification
    │
    └── Confirmer
            ↓
        Suppression
            ↓
        Liste actualisée
10. Impact sur le module Hôpitaux

Le module Types d'hôpitaux est une dépendance du module Hôpitaux.

Lors de la création ou de la modification d'un hôpital, le formulaire pourra utiliser les types enregistrés dans ce module.

Relation :

TypeHopital 1 ───── 0..* Hôpital

Un hôpital possède donc un type d'hôpital.

Le module Types d'hôpitaux ne doit cependant pas gérer directement les hôpitaux.

Il fournit uniquement le catalogue utilisé par le module Hôpitaux.

11. Impact sur le moteur de recherche

Le moteur de recherche sera développé ultérieurement.

Il pourra utiliser TypeHopital comme critère de recherche.

Par exemple :

Type d'hôpital = Hôpital privé
        ↓
Recherche
        ↓
Hôpitaux correspondant à ce type

Mais aucune fonctionnalité de recherche ne doit être implémentée dans ce module.

Le module se limite à gérer les données de référence.

12. Gestion des erreurs

L'interface doit gérer au minimum :

Création
nom vide ;
nom déjà existant ;
erreur lors de l'enregistrement.
Modification
nom vide ;
nom déjà utilisé par un autre type ;
type inexistant ;
erreur lors de l'enregistrement.
Suppression
type inexistant ;
type utilisé par un ou plusieurs hôpitaux ;
erreur lors de la suppression.

Dans tous les cas, l'administrateur doit recevoir un message indiquant clairement le résultat de son action.

13. Permissions

Le module est strictement réservé à l'administrateur.

Visiteur              → accès refusé
Utilisateur           → accès refusé
Administrateur        → accès autorisé

L'accès doit être protégé au niveau de l'application et du backend/API.

Masquer simplement le menu pour les utilisateurs non autorisés ne suffit pas.

14. Données manipulées

Le module ne manipule qu'une seule entité :

TypeHopital
-----------
id
nom

Il ne faut pas ajouter :

description ;
statut ;
icône ;
couleur ;
catégorie ;
ordre d'affichage ;
nombre d'hôpitaux ;
date de modification ;

car ces informations n'ont pas été décidées dans notre modèle.

15. Critères d'acceptation

Le module est considéré comme fonctionnel lorsque :

Consultation
 L'administrateur peut accéder au module.
 Les types existants sont affichés.
Création
 L'administrateur peut ajouter un type.
 Le nom est obligatoire.
 Un doublon est refusé.
 Le type créé apparaît dans la liste.
Modification
 L'administrateur peut modifier un type.
 Le formulaire est prérempli avec les données existantes.
 Un nom vide est refusé.
 Un doublon est refusé.
 La modification apparaît dans la liste.
Suppression
 L'administrateur peut demander la suppression d'un type.
 Une confirmation est demandée.
 Un type non utilisé peut être supprimé.
 Un type utilisé par un hôpital ne peut pas être supprimé.
 Aucune association avec un hôpital n'est supprimée automatiquement.
Sécurité
 Un utilisateur UTILISATEUR ne peut pas accéder au module.
 Un visiteur ne peut pas accéder au module.
 Seul ADMINISTRATEUR peut effectuer les opérations d'administration.