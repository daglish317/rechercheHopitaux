Spécification fonctionnelle — Module Hôpitaux
1. Objectif

Le module Hôpitaux permet à l'administrateur de gérer le référentiel des hôpitaux présents sur la plateforme.

L'administrateur doit pouvoir :

consulter les hôpitaux ;
créer un hôpital ;
modifier un hôpital ;
consulter les informations détaillées d'un hôpital ;
activer un hôpital ;
désactiver un hôpital.

Le module ne gère pas directement les maladies prises en charge, les examens médicaux ou le plateau technique. Ces éléments seront administrés dans leurs modules respectifs.

2. Acteur

Le seul acteur autorisé à utiliser ce module est :

ADMINISTRATEUR

Les autres utilisateurs n'ont aucun accès aux fonctionnalités d'administration.

Visiteur       → aucun accès
Utilisateur    → aucun accès
Administrateur → accès complet

Le contrôle d'autorisation doit être effectué côté serveur/API et côté interface.

3. Données utilisées

Le module manipule la classe :

Hôpital

avec exactement les attributs suivants :

id
nom
adresse
telephone
latitude
longitude
statut

Le téléphone est optionnel.

Le statut possède uniquement deux valeurs :

ACTIF
INACTIF

L'hôpital possède également un TypeHopital.

La relation est :

TypeHopital 1 ───── 0..* Hôpital

Un hôpital doit donc être associé à un type d'hôpital existant.

4. Accès au module

L'administrateur accède au module depuis le dashboard :

Dashboard
   ↓
Hôpitaux

La page principale du module affiche la liste des hôpitaux enregistrés.

5. Liste des hôpitaux

La liste doit permettre à l'administrateur de consulter les hôpitaux existants.

Pour chaque hôpital, les informations suivantes doivent être disponibles :

nom ;
type d'hôpital ;
adresse ;
téléphone lorsqu'il est renseigné ;
statut.

Les coordonnées GPS ne sont pas obligatoires à afficher dans la liste.

Elles doivent néanmoins être conservées dans les données de l'hôpital.

6. Création d'un hôpital

L'administrateur doit pouvoir créer un nouvel hôpital à partir d'une action :

Ajouter un hôpital

Le formulaire contient :

Nom
Type d'hôpital
Adresse
Téléphone
Latitude
Longitude
Statut

Aucun autre champ ne doit être ajouté.

7. Règles de validation
Nom

Le nom est obligatoire.

Une valeur vide doit être refusée.

Type d'hôpital

Le type est obligatoire.

Il doit être sélectionné parmi les types existants dans le module Types d'hôpitaux.

L'administrateur ne doit pas pouvoir créer directement un nouveau type depuis ce formulaire.

Adresse

L'adresse est obligatoire.

Téléphone

Le téléphone est optionnel.

Un hôpital peut donc être créé sans numéro de téléphone.

Latitude

La latitude est obligatoire.

Elle doit être une valeur numérique correspondant à une latitude géographique valide.

Longitude

La longitude est obligatoire.

Elle doit être une valeur numérique correspondant à une longitude géographique valide.

Statut

Le statut est obligatoire et doit être l'une des deux valeurs :

ACTIF
INACTIF
8. Statut lors de la création

L'administrateur doit pouvoir définir le statut du nouvel hôpital lors de sa création :

ACTIF

ou :

INACTIF

Le système ne doit pas imposer automatiquement un statut différent de celui sélectionné par l'administrateur.

9. Création réussie

Lorsque toutes les données sont valides :

Formulaire
    ↓
Validation
    ↓
Création de l'hôpital
    ↓
Enregistrement
    ↓
Retour à la liste

Le système génère automatiquement l'identifiant id.

L'hôpital nouvellement créé doit apparaître dans la liste avec les informations enregistrées.

10. Modification d'un hôpital

L'administrateur doit pouvoir modifier un hôpital existant.

Workflow :

Liste des hôpitaux
       ↓
Sélection d'un hôpital
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

Tous les champs modifiables de l'hôpital doivent être préremplis avec les valeurs actuelles.

Les mêmes règles de validation que lors de la création doivent être appliquées.

11. Modification du type d'hôpital

L'administrateur peut modifier le type d'un hôpital.

Le nouveau type doit obligatoirement appartenir au catalogue TypeHopital.

Exemple :

Hôpital A
Type actuel : Type 1


Modification :
Type 2


→ Association avec Type 2

Le système ne doit pas créer automatiquement un nouveau type.

12. Consultation détaillée

L'administrateur doit pouvoir ouvrir la fiche détaillée d'un hôpital.

La fiche doit afficher les informations enregistrées :

Nom
Type d'hôpital
Adresse
Téléphone
Latitude
Longitude
Statut

Les relations avec les autres entités pourront également être affichées lorsque leurs modules seront disponibles :

Hôpital
│
├── Prises en charge
├── Examens médicaux
└── Plateau technique

Cependant, leur gestion ne doit pas être effectuée directement depuis le module Hôpitaux si elle appartient aux modules correspondants.

13. Activation d'un hôpital

Un hôpital INACTIF peut être activé par l'administrateur.

Workflow :

Hôpital INACTIF
       ↓
Activer
       ↓
Confirmation de l'action
       ↓
Hôpital ACTIF

Une fois actif, l'hôpital devient éligible aux fonctionnalités publiques qui utilisent les hôpitaux actifs, notamment le futur moteur de recherche.

14. Désactivation d'un hôpital

Un hôpital ACTIF peut être désactivé.

Workflow :

Hôpital ACTIF
       ↓
Désactiver
       ↓
Confirmation de l'action
       ↓
Hôpital INACTIF

La désactivation ne supprime pas l'hôpital.

Toutes ses données restent conservées.

Un hôpital inactif ne doit pas être présenté comme un hôpital disponible dans la future recherche publique.

15. Suppression définitive

La suppression définitive d'un hôpital ne fait pas partie du module.

L'administrateur utilise le statut pour rendre un hôpital inactif.

Il n'y a donc pas d'action :

Supprimer définitivement

dans le périmètre actuel.

Cette décision est particulièrement importante parce qu'un hôpital pourra être associé à plusieurs données :

Hôpital
 ├── TypeHopital
 ├── PriseEnCharge
 ├── ExamenMedical
 └── PlateauTechnique
16. Localisation

L'hôpital possède :

latitude
longitude

Ces informations servent à enregistrer sa position géographique.

Dans ce module, l'administrateur doit pouvoir renseigner et modifier ces coordonnées.

Le module ne doit pas encore implémenter :

calcul de distance ;
calcul de trajet ;
position de l'utilisateur ;
recherche de proximité ;
itinéraire.

Ces fonctionnalités seront spécifiées avec l'interface publique, la carte et le moteur de recherche.

17. Gestion des erreurs

Le système doit gérer les erreurs suivantes.

Création
nom manquant ;
type d'hôpital manquant ;
type inexistant ;
adresse manquante ;
latitude manquante ;
longitude manquante ;
latitude invalide ;
longitude invalide ;
statut invalide ;
erreur d'enregistrement.

Le téléphone vide ne constitue pas une erreur.

Modification
hôpital inexistant ;
type inexistant ;
données obligatoires invalides ;
coordonnées invalides ;
statut invalide ;
erreur d'enregistrement.
18. Sécurité

Toutes les opérations administratives doivent être protégées.

Utilisateur non authentifié
        ↓
       REFUS


Utilisateur role = UTILISATEUR
        ↓
       REFUS


Utilisateur role = ADMINISTRATEUR
        ↓
       AUTORISÉ

La protection ne doit pas reposer uniquement sur l'interface graphique.

Un utilisateur non autorisé qui tente directement d'appeler l'API d'administration doit également être refusé.

19. Interaction avec les autres modules
Types d'hôpitaux

Le module Hôpitaux dépend du catalogue TypeHopital.

TypeHopital
     │
     │
     ▼
  Hôpital

Un type doit donc exister avant de pouvoir être associé à un hôpital.

Maladies

Les maladies ne sont pas gérées dans ce module.

La relation sera gérée par :

PriseEnCharge
Examens médicaux

Les examens seront gérés dans leur propre module.

Plateau technique

Le plateau technique sera géré dans son propre module.

20. Impact futur sur la recherche

Le module Hôpitaux constitue l'une des principales sources de données du moteur de recherche.

Le moteur utilisera notamment :

Hôpital
├── statut
├── type
├── localisation
├── maladies prises en charge
├── examens médicaux
└── plateau technique

Mais le moteur de recherche ne doit ni créer ni modifier ces informations.

Il les utilisera uniquement pour produire les résultats.

21. Critères d'acceptation
Consultation
 L'administrateur peut ouvrir le module Hôpitaux.
 La liste des hôpitaux est affichée.
 Le nom est visible.
 Le type est visible.
 L'adresse est visible.
 Le téléphone est affiché lorsqu'il existe.
 Le statut est visible.
Création
 L'administrateur peut créer un hôpital.
 Le nom est obligatoire.
 Le type est obligatoire.
 Le type provient du catalogue existant.
 L'adresse est obligatoire.
 Le téléphone est optionnel.
 La latitude est obligatoire.
 La longitude est obligatoire.
 Le statut peut être ACTIF ou INACTIF.
 Les données sont enregistrées correctement.
Modification
 L'administrateur peut modifier un hôpital.
 Le formulaire contient les données existantes.
 Le type peut être modifié.
 Les validations sont appliquées.
 Les modifications sont enregistrées.
Statut
 L'administrateur peut activer un hôpital.
 L'administrateur peut désactiver un hôpital.
 La désactivation conserve toutes les données.
 Un hôpital inactif n'est pas disponible dans la future recherche publique.
Sécurité
 Un visiteur ne peut pas accéder au module.
 Un utilisateur ne peut pas accéder au module.
 Seul un administrateur peut effectuer les opérations du module.
Hors périmètre
 Aucune suppression définitive.
 Aucun calcul de distance.
 Aucun itinéraire.
 Aucun moteur de recherche dans ce module.
 Aucune gestion directe des maladies.
 Aucune gestion directe des examens.
 Aucune gestion directe du plateau technique.