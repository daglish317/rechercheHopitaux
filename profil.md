Spécification fonctionnelle — Module Profil administrateur
1. Objectif

Le module Profil permet à l'administrateur connecté de consulter et de gérer ses propres informations personnelles.

Il ne permet pas de gérer les comptes des autres utilisateurs.

La gestion des autres utilisateurs, si elle est nécessaire, constitue un autre périmètre fonctionnel et ne doit pas être ajoutée au module Profil.

2. Acteur

Le module est accessible uniquement à l'administrateur authentifié.

Administrateur connecté
        ↓
       Profil

Un utilisateur non authentifié ne peut pas accéder au profil administrateur.

3. Accès au module

Depuis le dashboard administrateur :

Dashboard
   ↓
Profil

Le profil peut également être accessible depuis l'élément correspondant au compte de l'administrateur dans l'interface du dashboard.

4. Données du profil

Le profil utilise les informations de la classe Utilisateur déjà définie.

Utilisateur
-----------
id
nom
email
mot_de_passe
photo
role

Le champ photo est optionnel.

Le champ role identifie le rôle de l'utilisateur et ne doit pas être modifiable depuis son propre profil.

5. Consultation du profil

Lorsqu'il ouvre son profil, l'administrateur doit pouvoir consulter :

Nom
Email
Photo
Rôle

Le mot de passe ne doit jamais être affiché.

Le système ne doit jamais retourner le mot de passe en clair dans les données affichées à l'utilisateur.

6. Photo de profil

La photo est facultative.

Aucun fichier

Si l'administrateur n'a pas de photo :

photo = null
       ↓
Avatar par défaut

L'interface doit donc toujours afficher une représentation visuelle du profil, même lorsqu'aucune photo n'est enregistrée.

Photo existante

Si une photo existe :

photo
  ↓
affichage de la photo de profil
7. Ajouter ou modifier la photo

L'administrateur doit pouvoir ajouter une photo s'il n'en possède pas.

Il doit également pouvoir remplacer sa photo actuelle.

Workflow :

Profil
  ↓
Modifier la photo
  ↓
Sélectionner une image
  ↓
Validation
  ↓
Envoi au backend
  ↓
Photo mise à jour

La nouvelle photo doit remplacer l'ancienne.

8. Supprimer la photo

L'administrateur doit pouvoir supprimer sa photo actuelle.

Workflow :

Photo existante
      ↓
Supprimer la photo
      ↓
Confirmation
      ↓
Photo supprimée
      ↓
Avatar par défaut

La suppression de la photo ne supprime pas le compte utilisateur.

9. Modification du nom

L'administrateur doit pouvoir modifier son nom depuis son profil.

Workflow :

Profil
  ↓
Modifier
  ↓
Nom
  ↓
Validation
  ↓
Enregistrement

Le nouveau nom doit être validé avant l'enregistrement.

Le nom ne doit pas être vide.

10. Modification de l'adresse email

L'administrateur peut modifier son adresse email si cette fonctionnalité est exposée par le backend.

Une adresse email doit respecter le format attendu par le système.

Le système doit également vérifier les contraintes d'unicité définies par le backend.

Important

La modification de l'email peut avoir un impact sur l'authentification.

Si le backend impose une confirmation de la nouvelle adresse, le frontend doit suivre exactement ce workflow.

Il ne faut pas inventer un mécanisme de confirmation côté frontend si celui-ci n'existe pas dans l'API backend.

11. Mot de passe

Le mot de passe ne doit jamais être affiché.

L'administrateur doit pouvoir accéder à une fonctionnalité de changement de mot de passe si celle-ci est prévue par le système d'authentification.

Le workflow général est :

Profil
   ↓
Modifier le mot de passe
   ↓
Ancien mot de passe
Nouveau mot de passe
Confirmation
   ↓
Validation
   ↓
Modification

Le système doit appliquer les règles de sécurité définies par le backend.

Le frontend ne doit pas implémenter ses propres règles de stockage du mot de passe.

12. Rôle de l'utilisateur

Le rôle est affiché afin que l'administrateur puisse identifier son niveau d'accès.

Exemple :

Rôle : Administrateur

Le rôle ne peut pas être modifié depuis le profil.

Il ne doit pas exister de bouton :

Modifier le rôle

Un utilisateur ne doit jamais pouvoir augmenter lui-même ses privilèges.

13. Identifiant utilisateur

L'identifiant technique id peut être utilisé par le système pour identifier le compte.

Il n'est pas nécessaire de l'afficher dans l'interface du profil.

L'administrateur ne doit pas pouvoir modifier cet identifiant.

14. Enregistrement des modifications

Lorsqu'une information est modifiée :

Modification
     ↓
Validation
     ↓
API
     ↓
Mise à jour backend
     ↓
Profil actualisé

En cas de succès, l'interface doit afficher les nouvelles informations.

En cas d'erreur, les données actuellement affichées ne doivent pas être remplacées par des données non enregistrées.

15. Gestion des erreurs

Le module doit gérer notamment :

Nom
nom vide ;
erreur lors de l'enregistrement.
Email
format invalide ;
email déjà utilisé ;
erreur retournée par le backend.
Photo
fichier non accepté par le backend ;
échec de l'envoi ;
erreur de suppression ;
erreur de mise à jour.
Mot de passe
ancien mot de passe incorrect ;
nouveau mot de passe invalide ;
confirmation incorrecte ;
erreur retournée par le backend.

Les messages d'erreur doivent être clairement présentés à l'administrateur.

16. Sécurité

Le profil concerne uniquement le compte de l'administrateur actuellement connecté.

L'administrateur ne doit pas pouvoir modifier le profil d'un autre utilisateur via ce module.

Le backend doit vérifier l'identité de l'utilisateur authentifié.

Le frontend ne doit pas considérer l'identifiant envoyé par le client comme une preuve d'identité.

17. Données qui ne doivent pas être modifiables

Depuis le profil, l'administrateur ne peut pas modifier :

id
role

Le mot de passe n'est pas modifié comme un champ classique du formulaire de profil. Il doit passer par le mécanisme spécifique de changement de mot de passe.

18. Données hors périmètre

Nous n'ajoutons pas au profil :

adresse personnelle ;
numéro de téléphone personnel ;
date de naissance ;
sexe ;
biographie ;
fonction personnalisée ;
réseaux sociaux ;
photo de couverture ;
préférences personnelles.

Ces informations n'ont pas été définies dans notre modèle.

19. Critères d'acceptation
Consultation
 L'administrateur peut accéder à son profil.
 Son nom est affiché.
 Son email est affiché.
 Sa photo est affichée lorsqu'elle existe.
 Un avatar par défaut est affiché lorsqu'il n'a pas de photo.
 Son rôle est affiché.
 Son mot de passe n'est jamais affiché.
Informations personnelles
 L'administrateur peut modifier son nom.
 L'administrateur peut modifier son email si l'API le permet.
 Les validations backend sont respectées.
 Les modifications réussies sont immédiatement reflétées dans l'interface.
Photo
 L'administrateur peut ajouter une photo.
 L'administrateur peut remplacer sa photo.
 L'administrateur peut supprimer sa photo.
 L'avatar par défaut apparaît après suppression.
Mot de passe
 Le mot de passe n'est jamais affiché.
 Le changement de mot de passe utilise le mécanisme d'authentification prévu par le backend.
 Le nouveau mot de passe n'est jamais stocké côté frontend en clair de manière persistante.
Sécurité
 Un utilisateur non authentifié ne peut pas accéder au profil administrateur.
 L'administrateur ne peut pas modifier le profil d'un autre utilisateur depuis ce module.
 Le rôle ne peut pas être modifié depuis le profil.
 L'identifiant ne peut pas être modifié depuis le profil.
Modèle Utilisateur après modification

Notre modèle devient donc :

┌─────────────────────────┐
│       Utilisateur       │
├─────────────────────────┤
│ id                      │
│ nom                     │
│ email                   │
│ mot_de_passe            │
│ photo                   │
│ role                    │
└─────────────────────────┘

Avec :

photo = optionnelle

Le prochain module est maintenant Paramètres. Il faudra bien le séparer du Profil : Profil = informations du compte administrateur, tandis que Paramètres = configuration de la plateforme.