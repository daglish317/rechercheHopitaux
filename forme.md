Spécification fonctionnelle — Module Maladies
1. Objet du module

Le module Maladies du dashboard administrateur permet à l'administrateur de gérer les maladies prises en charge par chaque hôpital enregistré dans la plateforme.

Le module doit permettre de :

consulter la liste des hôpitaux ;
sélectionner un hôpital ;
consulter les maladies déjà associées à cet hôpital ;
ajouter plusieurs maladies à un hôpital dans une même opération ;
supprimer une maladie déjà associée ;
enregistrer les modifications ;
consulter le détail des maladies associées à un hôpital ;
exporter au format Excel les données concernant un seul hôpital à la fois.
Périmètre

Le module ne permet pas de créer ou modifier les informations générales d'un hôpital.

Il ne permet pas non plus de gérer les examens médicaux ou le plateau technique.

Ces responsabilités appartiennent respectivement aux modules concernés.

2. Principe général de fonctionnement

Le module fonctionne autour de l'hôpital.

Le parcours est :

Module Maladies
      │
      ▼
Liste des hôpitaux
      │
      ├── Gérer
      │     ↓
      │   Gestion des maladies
      │
      └── Détail
            ↓
          Consultation

L'administrateur reste toujours dans le module Maladies.

Les vues Liste, Gérer et Détail correspondent à des changements de contenu à l'intérieur du module.

3. Vue principale — Liste des hôpitaux

À l'ouverture du module Maladies, l'administrateur arrive sur la liste des hôpitaux.

La liste doit contenir uniquement les hôpitaux et les actions disponibles.

Structure
Hôpital	Actions
Hôpital Central de Yaoundé	Gérer · Détail
Hôpital Général de Yaoundé	Gérer · Détail
Hôpital Général de Douala	Gérer · Détail
Interdiction

La liste principale ne doit pas afficher :

les maladies ;
le nombre de maladies ;
les noms des maladies ;
les autres informations médicales associées.

Exemple de structure interdite :

Hôpital	Maladie
Hôpital Central	Paludisme
Hôpital Central	Diabète

Cette représentation ne fait pas partie de la vue principale.

4. Ordre des hôpitaux

Lorsqu'un nouvel hôpital est créé depuis le module Hôpitaux, il doit apparaître immédiatement en première position dans la liste du module Maladies.

Exemple :

Avant :

Hôpital B
Hôpital C
Hôpital D

Après création de Hôpital A :

Hôpital A
Hôpital B
Hôpital C
Hôpital D

Le module doit utiliser l'ordre fourni par les données du backend et ne doit pas créer une nouvelle logique locale de classement arbitraire.

5. Gestion d'un grand nombre d'hôpitaux

Le système doit pouvoir fonctionner avec un nombre important d'hôpitaux.

La liste ne doit pas charger inutilement tous les hôpitaux dans le navigateur.

Elle doit utiliser :

une récupération paginée des hôpitaux ;
une recherche permettant de retrouver rapidement un hôpital.

L'interface doit donc permettre à l'administrateur de retrouver un hôpital sans devoir parcourir manuellement une liste pouvant contenir plusieurs centaines ou milliers d'établissements.

La recherche doit être effectuée côté serveur si l'API backend le permet.

Aucun comportement de chargement de 1 000+ hôpitaux puis filtrage uniquement côté frontend ne doit être introduit.

6. Action « Gérer »

Chaque hôpital possède une action Gérer.

Exemple :

Hôpital Central de Yaoundé
[ Gérer ]
[ Détail ]

Lorsque l'administrateur clique sur Gérer, le contenu du module change.

Il ne doit pas être redirigé vers un autre module du dashboard.

Le contexte reste :

Dashboard → Maladies

La vue devient :

Dashboard → Maladies → Gestion de l'hôpital
7. Vue « Gérer »

La vue Gérer doit identifier clairement l'hôpital sélectionné.

Exemple :

← Retour


Gérer les maladies


Hôpital Central de Yaoundé

Puis la liste des maladies déjà associées à cet hôpital.

8. Affichage des maladies déjà associées

Lorsque la vue Gérer est ouverte, le système doit récupérer les associations existantes entre l'hôpital et les maladies.

Exemple :

Hôpital Central de Yaoundé


Maladies prises en charge


┌──────────────────────────────────────┐
│ Paludisme                         × │
├──────────────────────────────────────┤
│ Diabète                           × │
├──────────────────────────────────────┤
│ Hypertension                      × │
└──────────────────────────────────────┘

Les données affichées doivent provenir du backend.

Si aucune maladie n'est encore associée :

Hôpital Central de Yaoundé


Maladies prises en charge


Aucune maladie n'est actuellement associée à cet hôpital.


[ + Ajouter une maladie ]

Le système ne doit pas inventer de maladie par défaut.

9. Ajouter une maladie

L'administrateur doit pouvoir ajouter une maladie à l'hôpital.

Le bouton :

+ Ajouter une maladie

ajoute une nouvelle ligne au formulaire.

Exemple :

Maladie


[ Sélectionner une maladie ▼ ]

La maladie sélectionnée doit provenir du référentiel des maladies existant dans le système.

Le formulaire ne doit pas permettre de créer directement une nouvelle maladie depuis cette interface.

La création des maladies relève du module de gestion du référentiel correspondant.

10. Ajouter plusieurs maladies

C'est une fonctionnalité obligatoire.

L'administrateur doit pouvoir ajouter plusieurs maladies avant de procéder à l'enregistrement.

Exemple :

Maladies prises en charge


[ Paludisme                         × ]
[ Diabète                           × ]
[ AVC                               × ]


[ + Ajouter une maladie ]


[ Enregistrer ]

Le bouton + Ajouter une maladie ajoute une nouvelle ligne.

L'administrateur peut répéter cette opération autant de fois que nécessaire.

11. Suppression d'une ligne avant enregistrement

Chaque ligne nouvellement ajoutée doit pouvoir être supprimée avant l'enregistrement.

Exemple :

[ Paludisme                         × ]
[ Diabète                           × ]
[ AVC                               × ]

Si l'administrateur clique sur × sur la ligne AVC, cette ligne disparaît du formulaire.

Aucune modification définitive n'est envoyée au backend tant que l'administrateur n'a pas enregistré.

12. Gestion des doublons

Une même maladie ne doit pas pouvoir être associée plusieurs fois au même hôpital.

Exemple interdit :

Paludisme
Paludisme
Diabète

Le système doit empêcher ou signaler cette duplication avant l'enregistrement.

Le backend doit également rester la source de validation finale afin qu'une duplication ne puisse pas être créée par une autre requête ou par un problème côté frontend.

13. Enregistrement

Le bouton :

Enregistrer

permet de valider les associations définies dans le formulaire.

Exemple :

Paludisme
Diabète
AVC
Hypertension


[ Enregistrer ]

Une seule action d'enregistrement doit permettre de prendre en compte l'ensemble des modifications effectuées.

Le système doit gérer :

les nouvelles associations ;
les suppressions demandées ;
les associations conservées.

Le frontend ne doit pas considérer une modification comme enregistrée avant confirmation de la réussite de l'opération côté backend.

14. Gestion des erreurs d'enregistrement

Si l'enregistrement échoue :

les données saisies ne doivent pas être considérées comme définitivement enregistrées ;
l'utilisateur doit être informé de l'échec ;
le formulaire doit conserver autant que possible les données saisies afin d'éviter leur perte.

Le message d'erreur doit être explicite.

Aucune réussite fictive ne doit être affichée si l'API retourne une erreur.

15. Suppression d'une maladie déjà enregistrée

Lorsqu'une maladie déjà associée est supprimée depuis la vue Gérer, le système doit clairement distinguer :

Suppression de l'association
Hôpital Central
      │
      └── Paludisme

devient :

Hôpital Central
      │
      └── plus d'association avec Paludisme

Cela ne supprime pas la maladie du référentiel global.

La maladie continue d'exister dans le système et peut être associée à d'autres hôpitaux.

C'est l'association entre l'hôpital et la maladie qui est supprimée.

16. Bouton « Détail »

La liste principale possède également une action :

Détail

Elle ouvre une vue de consultation du même module.

Exemple :

← Retour


Détail des maladies


Hôpital Central de Yaoundé


Maladies prises en charge


• Paludisme
• Diabète
• Hypertension
• AVC
17. Différence entre Gérer et Détail

Cette distinction est obligatoire.

Gérer

Permet :

consulter les associations ;
ajouter ;
supprimer ;
enregistrer ;
exporter Excel.
Détail

Permet :

consulter uniquement les associations.

La vue Détail ne doit pas permettre de modifier les données.

18. Navigation interne du module

L'administrateur ne quitte pas le module Maladies lorsqu'il passe de la liste à Gérer ou Détail.

Le module possède donc plusieurs états de contenu :

Maladies
│
├── Liste
│
├── Gérer
│
└── Détail
Exemple
Liste
  ↓
[Gérer]
  ↓
Gérer Hôpital Central
  ↓
[← Retour]
  ↓
Liste

Même principe :

Liste
  ↓
[Détail]
  ↓
Détail Hôpital Central
  ↓
[← Retour]
  ↓
Liste

Le bouton Retour doit permettre de revenir à la liste des hôpitaux du module.

19. Export Excel

L'export Excel est disponible uniquement dans la vue Gérer.

Il concerne exclusivement l'hôpital actuellement sélectionné.

Exemple :

Gérer les maladies


Hôpital Central de Yaoundé


...


[ Enregistrer ]    [ Exporter Excel ]

Le bouton Exporter Excel ne doit pas apparaître dans la liste générale des hôpitaux.

Il ne doit pas non plus produire un export global de tous les hôpitaux.

20. Contenu de l'export Excel

L'export doit permettre d'identifier clairement l'hôpital concerné.

Le fichier doit donc contenir au minimum :

Hôpital	Maladie
Hôpital Central de Yaoundé	Paludisme
Hôpital Central de Yaoundé	Diabète
Hôpital Central de Yaoundé	Hypertension
Hôpital Central de Yaoundé	AVC

Le nom de l'hôpital doit être présent sur chaque ligne de données afin que le fichier reste compréhensible même lorsqu'il est ouvert ou traité indépendamment de l'interface.

21. Export d'un hôpital sans maladie

Si aucun élément n'est associé à l'hôpital, le comportement doit être défini explicitement.

Le bouton d'export peut rester disponible, mais le système doit produire un fichier représentant l'état actuel de l'hôpital sans inventer de données.

Une alternative consiste à désactiver le bouton tant qu'aucune maladie n'est associée.

Ce point devra être fixé avant l'implémentation finale, car il s'agit d'un choix UX et non d'une contrainte imposée par notre modèle.

22. Référentiel des maladies

Le module Maladies manipule deux notions distinctes :

Maladie

Élément du référentiel.

Exemple :

Paludisme
Diabète
AVC
Prise en charge

Association entre :

Hôpital
    ↕
Maladie

La prise en charge indique qu'un hôpital prend effectivement en charge une maladie.

Le module ne doit donc pas confondre :

Créer une maladie

et :

Associer une maladie à un hôpital
23. Règle fondamentale du module

Le module doit respecter cette logique :

                    MALADIE
                       │
                       │ référentiel
                       ▼
              ┌─────────────────┐
              │ Sélectionner    │
              │ une maladie     │
              └────────┬────────┘
                       │
                       ▼
                    HÔPITAL
                       │
                       ▼
                PriseEnCharge

Le résultat final est :

Hôpital A
 ├── Maladie 1
 ├── Maladie 2
 └── Maladie 3
24. États fonctionnels à gérer

La vue Liste doit gérer :

chargement des hôpitaux ;
liste vide ;
résultats disponibles ;
erreur de récupération ;
recherche d'un hôpital ;
pagination si nécessaire.

La vue Gérer doit gérer :

chargement des associations ;
aucune maladie associée ;
maladies existantes ;
ajout d'une maladie ;
ajout de plusieurs maladies ;
suppression ;
enregistrement en cours ;
enregistrement réussi ;
erreur d'enregistrement ;
export Excel.

La vue Détail doit gérer :

chargement ;
liste des maladies ;
absence de maladie ;
erreur de récupération.
25. Règles de sécurité fonctionnelles

L'interface publique n'a aucun droit de modification.

Toutes les opérations suivantes appartiennent au dashboard administrateur :

Créer une maladie
Modifier une maladie
Supprimer une maladie
Associer une maladie à un hôpital
Retirer une maladie d'un hôpital

Le frontend ne doit jamais considérer qu'un utilisateur public peut effectuer ces opérations simplement parce qu'il connaît l'URL ou l'endpoint.

Les permissions doivent également être contrôlées côté backend.

26. Résumé du parcours utilisateur

Le parcours complet est volontairement simple :

ADMINISTRATEUR
      │
      ▼
Dashboard
      │
      ▼
Module Maladies
      │
      ▼
Liste des hôpitaux
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
   [Gérer]                [Détail]
      │                      │
      ▼                      ▼
Formulaire              Consultation
      │
      ├── Maladies existantes
      │
      ├── + Ajouter une maladie
      │
      ├── Ajouter plusieurs
      │
      ├── Supprimer
      │
      ├── Enregistrer
      │
      └── Exporter Excel
27. Principe à reproduire

Ce module devient notre modèle de référence pour les deux autres modules.

Module Examens médicaux
Liste des hôpitaux
→ Gérer
→ Ajouter plusieurs examens
→ Supprimer
→ Enregistrer
→ Exporter Excel


Liste des hôpitaux
→ Détail
→ Consulter les examens
Module Plateau technique
Liste des hôpitaux
→ Gérer
→ Ajouter plusieurs éléments
→ Supprimer
→ Enregistrer
→ Exporter Excel


Liste des hôpitaux
→ Détail
→ Consulter les éléments

On ne doit pas réinventer un workflow différent pour chaque module. Seul le type de donnée associée change.

Cette spécification fixe donc le comportement fonctionnel du module Maladies sans ajouter de fonctionnalité qui n'a pas été décidée.