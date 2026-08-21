Spécification fonctionnelle — Interface publique
1. Objectif

L'interface publique constitue le point d'accès principal à la plateforme.

Elle permet à un visiteur ou à un utilisateur connecté de :

rechercher des hôpitaux ;
visualiser les résultats dans une sidebar ;
visualiser sur une carte les hôpitaux disposant de coordonnées géographiques ;
sélectionner un hôpital ;
consulter la page détaillée de cet hôpital ;
demander l'affichage du trajet le plus court vers un hôpital géolocalisé.

La recherche et la consultation des hôpitaux sont accessibles sans obligation de créer un compte.

2. Utilisateurs concernés

Deux catégories d'utilisateurs peuvent accéder à cette interface.

Visiteur

Utilisateur non authentifié.

Il peut :

accéder à la page publique ;
effectuer des recherches ;
consulter les résultats ;
consulter les détails d'un hôpital ;
utiliser la carte ;
demander un itinéraire si la géolocalisation est autorisée.
Utilisateur connecté

Il possède les mêmes possibilités sur la page publique.

La connexion ne redirige pas vers un dashboard utilisateur.

Connexion
    ↓
Retour à l'interface publique
3. Structure de l'interface

La page publique possède deux grandes zones.

┌──────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├───────────────────────┬──────────────────────────────────────┤
│                       │                                      │
│                       │                                      │
│      SIDEBAR          │                CARTE                 │
│       ≈ 1/3           │                ≈ 2/3                 │
│                       │                                      │
│      Résultats        │          Hôpitaux géolocalisés       │
│                       │                                      │
│      Card 1           │                                      │
│      Card 2           │                                      │
│      Card 3           │                                      │
│                       │                                      │
└───────────────────────┴──────────────────────────────────────┘
4. Header

Le header contient exactement :

Logo
Barre de recherche
Thème
Connexion
S'inscrire

Il n'y a pas :

de sélecteur de langue ;
de bouton « Rechercher » ;
de footer ;
de bouton d'avis ;
de filtre séparé dans le header.
5. Barre de recherche

La recherche doit être dynamique.

L'utilisateur saisit directement sa requête dans la barre.

Exemple :

[ cardiologie ]

Aucun bouton de recherche n'est nécessaire.

Le système déclenche automatiquement la recherche après la saisie.

6. Recherche sans sensibilité à la casse

Le moteur de recherche doit être insensible à la casse.

Les recherches suivantes doivent produire un comportement équivalent :

cardiologie
Cardiologie
CARDIOLOGIE
CaRdIoLoGiE

La casse utilisée dans les données enregistrées ne doit pas être modifiée.

La comparaison doit être effectuée de manière insensible à la casse.

7. Recherche dynamique et debounce

La saisie ne doit pas provoquer une requête réseau à chaque caractère.

Le système utilise un mécanisme de debounce.

Exemple :

c
ca
car
card
cardiologie

Le frontend attend que l'utilisateur cesse momentanément de saisir avant d'envoyer la requête.

Le délai exact sera défini dans la spécification technique.

8. Contenu recherchable

Le moteur de recherche doit exploiter les données administrées dans le dashboard.

Les éléments concernés sont ceux définis dans notre modèle :

hôpital ;
type d'hôpital ;
maladie ;
prise en charge ;
examen médical ;
plateau technique.

Le moteur doit retourner des hôpitaux, et non une liste séparée de maladies, examens ou équipements.

Exemple :

Recherche : cardiologie


        ↓


Hôpital A
Hôpital B
Hôpital C

et non :

Cardiologie
Hôpital A
Examen X
9. Résultats de recherche

Les résultats sont affichés dans la sidebar gauche.

La sidebar représente environ un tiers de l'espace disponible.

Chaque résultat est présenté sous forme de card.

Exemple :

┌────────────────────────────┐
│ Hôpital Central            │
│ Hôpital général            │
│ Yaoundé                    │
│                            │
│ Voir les détails           │
└────────────────────────────┘

Les informations affichées doivent provenir du backend.

10. Téléphone optionnel

Le téléphone étant optionnel dans notre modèle, il ne doit être affiché que lorsqu'il est renseigné.

Téléphone renseigné
→ afficher


Téléphone absent
→ ne rien afficher

Il ne faut pas afficher :

Téléphone : N/A

sauf si cette convention est explicitement décidée plus tard.

11. Aucun résultat

Si aucun hôpital ne correspond à la requête :

Aucun hôpital ne correspond à votre recherche.

La sidebar ne doit afficher aucune card.

La carte ne doit afficher aucun résultat provenant de la recherche.

12. État initial

Avant toute recherche, la page ne doit pas charger arbitrairement tous les hôpitaux.

La sidebar affiche un état initial.

La carte peut rester affichée sans marqueur de recherche.

13. Carte

La carte occupe environ deux tiers de la zone principale.

Elle affiche les hôpitaux correspondant à la recherche uniquement lorsque leurs coordonnées sont disponibles.

Les coordonnées nécessaires sont :

latitude
longitude
14. Coordonnées optionnelles

Les champs latitude et longitude sont optionnels.

Trois situations doivent être correctement gérées.

Latitude et longitude présentes
latitude ✓
longitude ✓

→ hôpital affichable sur la carte.

Latitude absente
latitude ✗
longitude ✓

→ hôpital non affichable sur la carte.

Longitude absente
latitude ✓
longitude ✗

→ hôpital non affichable sur la carte.

L'absence d'une seule des deux coordonnées suffit à empêcher le positionnement.

15. Règle fondamentale de la carte

Un hôpital sans coordonnées reste un résultat valide.

Exemple :

Recherche
   ↓
┌────────────────────────────┐
│ Hôpital A  📍              │
│ Hôpital B                  │
│ Hôpital C  📍              │
└────────────────────────────┘

La sidebar affiche A, B et C.

La carte affiche uniquement A et C.

16. Sélection d'une card

Lorsqu'un utilisateur sélectionne une card :

Card
 ↓
Hôpital sélectionné

Si l'hôpital possède des coordonnées :

Hôpital sélectionné
        ↓
Carte centrée sur l'hôpital
        ↓
Marqueur correspondant mis en évidence

Si l'hôpital n'a pas de coordonnées :

Hôpital sélectionné
        ↓
Pas de centrage possible
        ↓
Pas de marqueur
17. Sélection d'un marqueur

Lorsqu'un utilisateur sélectionne un marqueur :

Marqueur
   ↓
Hôpital correspondant
   ↓
Card correspondante sélectionnée

La card correspondante doit être identifiable dans la sidebar.

La carte et la sidebar doivent donc partager le même état de sélection.

18. Page détail

Chaque card permet d'accéder à la page détail de l'hôpital.

Card
  ↓
Détails
  ↓
Page détail

La page détail n'est pas une interface d'administration.

Elle est uniquement consultative.

19. Informations de la page détail

La page détail présente les informations disponibles pour l'hôpital.

Elle doit notamment permettre de consulter :

Informations générales
nom ;
type d'hôpital ;
adresse ;
téléphone lorsqu'il existe.
Maladies prises en charge

Les maladies associées à l'hôpital.

Examens médicaux

Les types d'examens médicaux que l'hôpital prend en charge.

Plateau technique

Les éléments du plateau technique associés à l'hôpital.

Toutes ces informations doivent provenir des relations définies dans le backend.

20. Aucune donnée inventée

La page détail ne doit jamais afficher une information qui n'existe pas dans le backend.

Par exemple, si aucun téléphone n'est enregistré :

Téléphone

ne doit pas être artificiellement complété.

Même règle pour :

coordonnées ;
examens ;
maladies ;
plateau technique ;
adresse ;
type d'hôpital.
21. Retour à la recherche

Depuis la page détail, l'utilisateur doit pouvoir revenir à l'interface de recherche.

Le retour ne doit pas nécessiter de nouvelle authentification.

22. Géolocalisation de l'utilisateur

Le calcul d'itinéraire nécessite la position de l'utilisateur.

Le navigateur demande donc l'autorisation d'utiliser la géolocalisation.

Utilisateur
    ↓
Autorisation GPS
    ↓
Latitude + longitude

La recherche elle-même ne dépend pas de cette autorisation.

23. Refus de géolocalisation

Si l'utilisateur refuse :

Recherche → disponible
Carte → disponible
Marqueurs → disponibles
Page détail → disponible
Itinéraire → indisponible

Le reste de l'application continue normalement.

24. Calcul du trajet

Lorsqu'un hôpital géolocalisé est sélectionné et que la position de l'utilisateur est disponible :

Position utilisateur
        ↓
Hôpital sélectionné
        ↓
Calcul du trajet
        ↓
Itinéraire routier
        ↓
Affichage sur la carte

Le trajet doit suivre le réseau routier.

Il ne s'agit pas d'une simple ligne entre deux coordonnées.

25. Trajet vers un hôpital sans coordonnées

Impossible de calculer un trajet si l'hôpital n'a pas de coordonnées.

Hôpital
latitude = null
ou
longitude = null


        ↓


Pas d'itinéraire

La card reste néanmoins consultable.

26. Bibliothèque cartographique

Pour l'implémentation frontend, le socle retenu peut être :

Leaflet
React-Leaflet

Leaflet assure l'affichage et les interactions avec la carte.

React-Leaflet permet son intégration dans l'application React.

Le fond cartographique sera fourni séparément.

27. Routage

Le calcul du trajet doit être réalisé par un moteur de routage.

Architecture :

Carte
 ↓
routingService
 ↓
Moteur de routage
 ↓
Itinéraire
 ↓
Carte Leaflet

Le composant de carte ne doit pas contenir directement toute la logique de calcul du trajet.

Cela permet de changer ultérieurement de fournisseur de routage sans reconstruire la carte.

28. États de la page

L'interface doit gérer au minimum :

État initial
      ↓
Recherche en cours
      ↓
Résultats
      ↓
Aucun résultat
      ↓
Erreur

Pour la carte :

Carte sans résultats
Carte avec marqueurs
Carte avec hôpital sélectionné
Carte avec itinéraire
29. Architecture fonctionnelle globale
                         PAGE PUBLIQUE
                              │
                              ▼
                         RECHERCHE
                              │
                     saisie dynamique
                              │
                           debounce
                              │
                              ▼
                       API DE RECHERCHE
                              │
                              ▼
                    Résultats d'hôpitaux
                         /          \
                        /            \
                       ▼              ▼
                  SIDEBAR           CARTE
                    1/3              2/3
                     │                │
                  Cards          coordonnées ?
                     │             /      \
                     │           oui       non
                     │            │         │
                     │            ▼         X
                     │         marqueur
                     │
                     ▼
                Page détail
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    Maladies      Examens      Plateau
                                  technique


Carte
  │
  ▼
Hôpital sélectionné
  │
  ▼
Position utilisateur disponible ?
  │
  ├── Non → pas de trajet
  │
  └── Oui
       │
       ▼
   Moteur routage
       │
       ▼
   Trajet affiché
30. Périmètre définitivement retenu

La page publique fait donc six choses :

Rechercher un hôpital dynamiquement.
Afficher les résultats dans une sidebar.
Afficher sur la carte les hôpitaux qui ont des coordonnées.
Synchroniser la sélection sidebar ↔ carte.
Afficher les détails d'un hôpital dans une page dédiée.
Tracer le trajet routier le plus court vers un hôpital géolocalisé lorsque la position de l'utilisateur est disponible.