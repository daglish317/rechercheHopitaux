1. Dashboard administrateur
Objectif

Le dashboard est l'espace réservé aux utilisateurs ayant :

role = ADMINISTRATEUR

Il permet à l'administrateur d'administrer les données utilisées par la plateforme.

L'administrateur doit pouvoir accéder depuis le dashboard aux différents domaines :

Dashboard
│
├── Hôpitaux
├── Types d'hôpitaux
├── Maladies
├── Prises en charge
├── Examens médicaux
├── Plateau technique
├── Profil
└── Paramètres

Le moteur de recherche ne sera pas administré depuis le dashboard.

Il exploitera ultérieurement les données produites par ces modules.

2. Accès au Dashboard

Un utilisateur ayant :

role = ADMINISTRATEUR

peut accéder au dashboard.

Un utilisateur ayant :

role = UTILISATEUR

ne peut pas accéder au dashboard.

Un utilisateur non authentifié ne peut pas accéder au dashboard.

Le contrôle doit être effectué au niveau de la protection des accès, et pas simplement en masquant le menu.

3. Structure générale

Le dashboard doit fournir une navigation permettant d'accéder aux différents modules.

Conceptuellement :

┌──────────────────────────────────────────────┐
│                 HEADER                       │
│ Logo                          Profil / ...   │
├───────────────┬──────────────────────────────┤
│               │                              │
│ Navigation    │                              │
│               │       CONTENU                │
│ Dashboard     │                              │
│ Hôpitaux      │       Module actif           │
│ Types         │                              │
│ Maladies      │                              │
│ Prises en     │                              │
│ charge        │                              │
│ Examens       │                              │
│ Plateau       │                              │
│ technique     │                              │
│               │                              │
│ Profil        │                              │
│ Paramètres    │                              │
│               │                              │
└───────────────┴──────────────────────────────┘

La structure graphique exacte sera définie lors de la conception UI. Pour l'instant, nous spécifions uniquement le comportement fonctionnel.

4. Page d'accueil du Dashboard

Lorsque l'administrateur se connecte, il est redirigé vers la page principale du dashboard.

Cette page doit servir de point d'entrée vers l'administration.

Nous ne devons pas encore inventer de statistiques, graphiques, indicateurs ou widgets.

Par exemple, nous ne décidons pas maintenant d'afficher :

nombre total d'hôpitaux ;
nombre de maladies ;
graphiques ;
statistiques de recherche ;
cartes ;
activité récente.

Ces éléments n'ont pas été décidés.

La page d'accueil du dashboard doit donc pour l'instant principalement permettre d'accéder aux modules administratifs.

5. Navigation entre les modules

Depuis le dashboard, l'administrateur doit pouvoir accéder à :

Gestion des hôpitaux

Permet de gérer les hôpitaux enregistrés.

Gestion des types d'hôpitaux

Permet de gérer le catalogue des types d'hôpitaux.

Gestion des maladies

Permet de gérer le catalogue des maladies.

Gestion des prises en charge

Permet de définir les maladies prises en charge par chaque hôpital.

Gestion des examens médicaux

Permet de gérer les examens médicaux et leurs associations avec les hôpitaux.

Gestion du plateau technique

Permet de gérer le catalogue du plateau technique et ses associations avec les hôpitaux.

Profil

Permet à l'administrateur de gérer les informations de son propre compte.

Paramètres

Permet d'accéder aux paramètres définis pour la plateforme.

6. Règle importante sur les dépendances

Les modules ne sont pas indépendants.

Il existe une dépendance logique :

TypeHopital
      ↓
   Hôpital
      ↓
 ┌────┼──────────┐
 ↓    ↓          ↓
Maladie      ExamenMedical
  ↓              ↓
PriseEnCharge    │
                 │
PlateauTechnique ┘

Plus précisément :

Pour créer une prise en charge

Il faut disposer :

d'un hôpital ;
d'une maladie.
Pour associer un examen

Il faut disposer :

d'un hôpital ;
d'un examen médical.
Pour associer un plateau technique

Il faut disposer :

d'un hôpital ;
d'un élément de plateau technique.

Cela signifie que l'ordre d'implémentation des modules administratifs est important.

7. Ordre d'implémentation du Dashboard

Je recommande donc cet ordre précis :

A. Dashboard de base
       ↓
B. Types d'hôpitaux
       ↓
C. Hôpitaux
       ↓
D. Maladies
       ↓
E. Prises en charge
       ↓
F. Examens médicaux
       ↓
G. Plateau technique
       ↓
H. Profil
       ↓
I. Paramètres

Pourquoi Types d'hôpitaux avant Hôpitaux ?

Parce qu'un hôpital possède un type et que le formulaire de gestion des hôpitaux devra pouvoir sélectionner un TypeHopital existant.

Pourquoi Maladies avant Prises en charge ?

Parce qu'une prise en charge associe un hôpital à une maladie existante.

Même logique pour les examens et le plateau technique.