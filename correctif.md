SPÉCIFICATION FONCTIONNELLE GLOBALE
1. Architecture fonctionnelle générale
                    PLATEFORME
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
    Connexion       Création de       Interface
                    compte            publique
                                        │
                                        ▼
                                  Moteur de recherche
                                        │
                                        ▼
                                    Hôpitaux
                                        │
                                        ├── Maladies
                                        ├── Examens
                                        └── Plateau technique


                        │
                        ▼
                Dashboard Administrateur
                        │
       ┌────────────────┼──────────────────┐
       │                │                  │
       ▼                ▼                  ▼
   Hôpitaux          Maladies           Examens
       │                │                  │
       │                │                  │
       └────────────────┼──────────────────┘
                        │
                        ▼
                Plateau technique
2. Module Hôpitaux
Objectif

Le module Hôpitaux constitue le point de départ de la gestion des structures.

Il permet à l'administrateur de créer et gérer les hôpitaux présents dans la plateforme.

Fonctionnalités

L'administrateur peut :

consulter les hôpitaux ;
créer un hôpital ;
modifier les informations d'un hôpital ;
consulter les informations d'un hôpital ;
supprimer un hôpital selon les règles définies par le backend.
Informations de l'hôpital

Nous devons utiliser uniquement les champs définis dans notre modèle, sans en inventer.

Nous avons notamment établi que :

le téléphone est optionnel ;
latitude est optionnelle ;
longitude est optionnelle.

Cela signifie qu'un hôpital peut exister dans le système sans être localisable sur la carte.

Création

Une fois l'hôpital enregistré :

Création Hôpital
      ↓
Enregistrement réussi
      ↓
Hôpital disponible
      ↓
Maladies
Examens
Plateau technique

Le nouvel hôpital apparaît en tête des listes concernées.

3. Relation Hôpital ↔ Maladie

Il n'existe plus de classe métier PriseEnCharge.

Nous utilisons une relation :

Hôpital N ───────── N Maladie

Un hôpital peut être associé à plusieurs maladies.

Une maladie peut être associée à plusieurs hôpitaux.

La table de liaison est une implémentation technique de cette relation et n'est pas un module fonctionnel indépendant.

4. Module Maladies

Le module possède deux responsabilités distinctes.

A. Gestion du référentiel des maladies

L'administrateur peut :

consulter les maladies ;
créer une maladie ;
modifier une maladie ;
supprimer une maladie lorsque cela est autorisé.

Exemple :

Maladies


Paludisme
Diabète
AVC
Hypertension

Cette partie concerne les maladies elles-mêmes, indépendamment des hôpitaux.

B. Association des maladies aux hôpitaux

C'est ici que nous déterminons ce qu'un hôpital prend en charge.

La liste principale affiche uniquement :

Hôpital	Actions
Hôpital Central de Yaoundé	Gérer · Détail
Hôpital Général de Yaoundé	Gérer · Détail

Aucune maladie n'est affichée dans cette liste.

Gérer
Hôpital Central de Yaoundé


Maladies prises en charge


[ Paludisme ]
[ Diabète ]
[ AVC ]


[ + Ajouter une maladie ]


[ Enregistrer ]
[ Exporter Excel ]

L'administrateur peut ajouter plusieurs maladies avant d'enregistrer.

Détail
Hôpital Central de Yaoundé


Maladies prises en charge


• Paludisme
• Diabète
• AVC

Cette vue est uniquement consultative.

5. Module Examens médicaux

Le principe est identique au module Maladies.

Référentiel

L'administrateur peut gérer les examens disponibles dans le système.

Exemple :

Scanner
Radiographie
IRM
Échographie
Association

Relation :

Hôpital N ───────── N Examen

La liste affiche :

Hôpital	Actions
Hôpital Central	Gérer · Détail
Hôpital Général	Gérer · Détail
Gérer
Hôpital Central


Examens réalisés


[ Scanner ]
[ Radiographie ]
[ Échographie ]


[ + Ajouter un examen ]


[ Enregistrer ]
[ Exporter Excel ]
Détail
Hôpital Central


Examens réalisés


• Scanner
• Radiographie
• Échographie
6. Module Plateau technique

Même principe.

Référentiel

Le système possède les éléments du plateau technique.

Exemple :

Laboratoire
Bloc opératoire
Réanimation
Relation
Hôpital N ───────── N ÉlémentPlateauTechnique
Liste
Hôpital	Actions
Hôpital Central	Gérer · Détail
Hôpital Général	Gérer · Détail
Gérer
Hôpital Central


Plateau technique


[ Laboratoire ]
[ Bloc opératoire ]
[ Réanimation ]


[ + Ajouter un élément ]


[ Enregistrer ]
[ Exporter Excel ]
Détail

Consultation uniquement.

7. Principe commun aux trois modules

Nous devons absolument conserver le même fonctionnement.

              MODULE
                 │
                 ▼
        Liste des hôpitaux
                 │
          ┌──────┴──────┐
          ▼             ▼
       Gérer          Détail
          │             │
          ▼             ▼
      Modifier       Consulter
          │
          ├── Ajouter plusieurs
          ├── Supprimer
          ├── Enregistrer
          └── Exporter Excel

Cela permet à l'administrateur de comprendre immédiatement les trois modules.

8. Export Excel

L'export est individuel à l'hôpital.

Il n'existe pas d'export global depuis la liste.

Exemple depuis Maladies :

Gérer
Hôpital Central
     │
     └── Exporter Excel

Le fichier contient :

Hôpital	Maladie
Hôpital Central	Paludisme
Hôpital Central	Diabète
Hôpital Central	AVC

Même principe pour les examens et le plateau technique.

9. Navigation interne des modules

Lorsque l'administrateur clique sur Gérer ou Détail, il reste dans le même module.

Exemple :

Maladies
   │
   ├── Liste
   │
   ├── Gérer
   │
   └── Détail

Le contenu est dynamique.

Chaque vue possède un bouton :

← Retour

permettant de revenir à la liste.

10. Module Profil

Le profil permet à l'administrateur de gérer ses propres informations.

Nous avons également décidé que l'utilisateur possède une photo de profil.

Le module doit donc permettre :

consulter son profil ;
modifier les informations autorisées ;
ajouter/modifier la photo ;
enregistrer les modifications.

Les champs doivent correspondre exactement au modèle utilisateur du backend.

11. Module Paramètres

Le module Paramètres regroupe les paramètres administratifs prévus pour la plateforme.

Il ne doit pas devenir un espace permettant de modifier arbitrairement la configuration technique du système.

Les fonctionnalités exactes doivent rester limitées aux paramètres que nous avons validés dans le projet.

12. Interface publique

L'interface publique est destinée aux utilisateurs qui recherchent un hôpital.

Elle possède un header minimal :

Logo
Barre de recherche
Thème
Connexion
S'inscrire

Pas de système multilingue.

Pas de footer.

13. Recherche publique

Le moteur de recherche est dynamique.

Il n'y a pas de bouton :

[ Rechercher ]

L'utilisateur écrit directement dans la barre.

La recherche :

n'est pas sensible à la casse ;
interroge les données disponibles ;
retourne les hôpitaux correspondants ;
utilise les relations configurées dans le dashboard.

Exemple :

AVC
 ↓
Maladie AVC
 ↓
Hôpitaux associés
 ↓
Résultats

Pour un examen :

Scanner
 ↓
Examen Scanner
 ↓
Hôpitaux associés
 ↓
Résultats
14. Résultats publics

La page publique est divisée en deux zones :

┌──────────────────┬───────────────────────────┐
│                  │                           │
│    SIDEBAR       │           CARTE           │
│      1/3         │            2/3            │
│                  │                           │
│  Résultats       │      Localisations        │
│                  │                           │
└──────────────────┴───────────────────────────┘

La sidebar contient uniquement les résultats correspondant à la recherche.

La carte affiche les hôpitaux qui disposent de coordonnées géographiques.

15. Gestion des coordonnées optionnelles

Latitude et longitude sont optionnelles.

Donc :

Hôpital A
latitude ✓
longitude ✓
       ↓
affiché sur carte

mais :

Hôpital B
latitude ✗
longitude ✗
       ↓
pas de position cartographique

Un hôpital sans coordonnées reste néanmoins un résultat de recherche.

Il ne doit simplement pas être positionné sur la carte.

16. Carte et itinéraire

La carte affiche les points correspondant aux hôpitaux localisables.

Lorsqu'un utilisateur sélectionne un hôpital dans les résultats :

Résultat sélectionné
       ↓
Point correspondant sur carte
       ↓
Calcul du trajet
       ↓
Itinéraire vers l'hôpital

Le trajet ne peut être calculé que lorsque la localisation nécessaire est disponible.

17. Page détail publique

Chaque résultat peut ouvrir une page de détail.

Cette page affiche les informations supplémentaires concernant l'hôpital.

Elle peut notamment présenter les données configurées dans le dashboard :

Hôpital
│
├── Informations générales
├── Maladies prises en charge
├── Examens
└── Plateau technique

Aucune donnée ne doit être inventée si elle n'existe pas dans le backend.

18. Connexion

L'utilisateur possède une interface de connexion.

Le système doit :

permettre la saisie des identifiants requis par le backend ;
valider les informations via l'API ;
gérer les erreurs ;
établir la session ;
rediriger l'utilisateur selon son rôle.
19. Création de compte

L'utilisateur public peut créer son compte.

Après authentification, il reste un utilisateur de l'interface publique.

Il ne doit pas être redirigé vers le dashboard administrateur simplement parce qu'il vient de se connecter.

Le parcours est :

Connexion
   ↓
Authentification réussie
   ↓
Interface publique

Le dashboard reste réservé à l'administrateur autorisé.

20. Relation entre le dashboard et le moteur de recherche

C'est le point fondamental du projet.

Le dashboard alimente les données utilisées par le moteur de recherche.

ADMIN
 │
 ├── Hôpitaux
 │
 ├── Maladies ──────┐
 │                  │
 ├── Examens ───────┼──→ DONNÉES DE RECHERCHE
 │                  │
 └── Plateau ───────┘
                         │
                         ▼
                  MOTEUR DE RECHERCHE
                         │
                         ▼
                    UTILISATEUR

Donc le moteur de recherche ne doit pas avoir sa propre base de données parallèle.

Il exploite les données administrées dans le dashboard.

21. Relation fondamentale des objets

Le modèle simplifié devient :

                         ┌─────────────┐
                         │   Hôpital   │
                         └──────┬──────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             │ N:N              │ N:N              │ N:N
             ▼                  ▼                  ▼
      ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
      │   Maladie   │    │   Examen    │    │ Plateau technique│
      └─────────────┘    └─────────────┘    └──────────────────┘

Et :

Hôpital
   │
   └── coordonnées optionnelles
              │
              ▼
             Carte
22. Principe architectural important

Nous ne devons pas créer :

PriseEnCharge
Search
HopitalMaladie
HopitalExamen
HopitalPlateau

comme des classes métier indépendantes simplement pour représenter les relations.

Les relations plusieurs-à-plusieurs seront gérées techniquement par le modèle de données.

Search n'est pas une donnée persistante : c'est une fonctionnalité/service du moteur de recherche, pas une classe métier persistée.

Modèle fonctionnel final

En résumé :

                         UTILISATEUR
                              │
              ┌───────────────┴──────────────┐
              │                              │
              ▼                              ▼
        Authentification               Interface publique
                                             │
                                             ▼
                                      Moteur de recherche
                                             │
                                             ▼
                                           Hôpital
                                             │
                         ┌───────────────────┼───────────────────┐
                         ▼                   ▼                   ▼
                      Maladie             Examen          Plateau technique
                         ▲                   ▲                   ▲
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             │
                                      Dashboard Admin
                                             │
                ┌────────────────────────────┼───────────────────────┐
                ▼                            ▼                       ▼
             Hôpitaux                     Profil                Paramètres


NB donc prise en charge n'est plus un module(une classe)