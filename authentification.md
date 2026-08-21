Spécification fonctionnelle — Module Authentification
1. Objectif

Le module Authentification permet à un utilisateur de :

créer un compte ;
se connecter à son compte ;
se déconnecter ;
accéder à l'interface correspondant à son rôle.

Le système possède deux rôles :

UTILISATEUR
ADMINISTRATEUR
2. Acteurs
Utilisateur public

Un utilisateur non authentifié peut :

accéder à la page publique ;
effectuer des recherches ;
accéder à la page de création de compte ;
accéder à la page de connexion.
Utilisateur authentifié

Un utilisateur ayant le rôle UTILISATEUR peut :

accéder à son compte ;
effectuer les recherches publiques ;
rester sur l'interface publique après connexion.
Administrateur

Un utilisateur ayant le rôle ADMINISTRATEUR peut :

se connecter ;
accéder au dashboard administrateur ;
accéder aux fonctionnalités d'administration prévues par son rôle.
3. Données du compte

Le modèle Utilisateur validé contient :

Utilisateur
-----------
id
nom
email
motDePasse
role
dateCreation

Le système doit respecter exactement ces données.

Rôle

Deux valeurs uniquement :

UTILISATEUR
ADMINISTRATEUR

Le rôle détermine l'espace auquel l'utilisateur peut accéder.

4. Page de création de compte
4.1 Accès

La page est accessible depuis l'interface publique.

Un utilisateur non authentifié peut accéder à :

Créer un compte
4.2 Informations demandées

Le formulaire de création de compte doit permettre de renseigner :

Nom
Email
Mot de passe

Le role ne doit pas être choisi par l'utilisateur.

Lorsqu'une personne crée un compte public, son rôle est :

UTILISATEUR

Le système renseigne automatiquement :

dateCreation

et génère l'identifiant id.

5. Validation de création de compte

Avant de créer le compte, le système doit vérifier :

Nom

Le nom doit être renseigné.

Email

L'email doit être renseigné et respecter le format attendu d'une adresse email.

L'email doit également respecter la contrainte d'unicité du compte.

Mot de passe

Le mot de passe doit être renseigné.

Les règles précises de complexité du mot de passe ne sont pas encore définies dans nos décisions.

Donc l'IA d'implémentation ne doit pas inventer une politique particulière du type :

minimum 8 caractères, une majuscule, un chiffre, etc.

Si nous voulons une politique de complexité, nous la définirons séparément.

6. Création réussie

Lorsque toutes les validations sont satisfaites :

Utilisateur
     ↓
Création du compte
     ↓
role = UTILISATEUR
     ↓
Compte créé

Après la création du compte, le comportement de navigation doit rester cohérent avec le fonctionnement public.

L'utilisateur peut ensuite se connecter avec ses identifiants.

7. Erreurs de création

Le système doit afficher une erreur explicite lorsque :

un champ obligatoire n'est pas renseigné ;
l'adresse email est invalide ;
l'adresse email est déjà utilisée ;
le mot de passe n'est pas renseigné ;
la création du compte échoue côté serveur.

Le formulaire ne doit pas être considéré comme valide tant que les erreurs bloquantes ne sont pas corrigées.

8. Page de connexion

La page de connexion permet à un utilisateur existant de s'authentifier.

Le formulaire contient :

Email
Mot de passe

L'utilisateur soumet ensuite le formulaire.

9. Authentification réussie

Après validation des identifiants, le système récupère le rôle du compte.

Si :
role = UTILISATEUR

alors :

Connexion
   ↓
Interface publique

L'utilisateur public ne doit jamais être redirigé vers le dashboard administrateur.

Si :
role = ADMINISTRATEUR

alors :

Connexion
   ↓
Dashboard administrateur
10. Authentification échouée

Si les identifiants sont incorrects :

Connexion refusée
       ↓
Message d'erreur
       ↓
Utilisateur reste sur la page de connexion

Le système ne doit pas révéler inutilement si l'erreur vient précisément de l'email ou du mot de passe.

11. Déconnexion

Un utilisateur authentifié doit pouvoir se déconnecter.

Après déconnexion :

Utilisateur
     ↓
Déconnexion
     ↓
Session supprimée
     ↓
Interface publique

L'utilisateur ne doit plus être considéré comme authentifié.

12. Protection des accès

Le rôle doit être contrôlé avant l'accès aux espaces protégés.

Utilisateur
UTILISATEUR
    │
    ├── Interface publique ✓
    │
    └── Dashboard administrateur ✗
Administrateur
ADMINISTRATEUR
    │
    ├── Interface publique ✓
    │
    └── Dashboard administrateur ✓

Il est important que cette restriction soit appliquée côté serveur, et pas uniquement en masquant des éléments dans l'interface.

13. Gestion d'une session existante

Lorsqu'un utilisateur possède déjà une session valide et tente d'accéder à la page de connexion ou de création de compte, le système doit déterminer son comportement.

Ce comportement n'a pas encore été décidé.

Je ne vais donc pas inventer une redirection automatique ici.

Nous devons décider ultérieurement si :

la page reste accessible ;
l'utilisateur est redirigé automatiquement ;
ou un autre comportement est souhaité.

15. Critères d'acceptation

Le module sera considéré comme fonctionnel lorsque :

Création
 Un visiteur peut accéder à la création de compte.
 Il peut renseigner son nom.
 Il peut renseigner son email.
 Il peut renseigner son mot de passe.
 Un compte est créé avec le rôle UTILISATEUR.
 dateCreation est enregistrée.
 Un email déjà utilisé est refusé.
Connexion utilisateur
 Un utilisateur peut se connecter avec son email et son mot de passe.
 Une authentification correcte est acceptée.
 L'utilisateur UTILISATEUR est redirigé vers l'interface publique.
 Il n'accède pas au dashboard administrateur.
Connexion administrateur
 Un administrateur peut se connecter.
 Le rôle ADMINISTRATEUR est reconnu.
 L'administrateur est redirigé vers le dashboard.
 Les routes d'administration sont protégées.
Déconnexion
 L'utilisateur peut se déconnecter.
 Sa session est invalidée.
 Il revient à l'interface publique.

 NB: *toutes les page dvrons etre protégé selon le role*