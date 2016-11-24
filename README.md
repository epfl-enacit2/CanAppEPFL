# CanAppEPFL

Projet d'extraction des informations des candidatures online pour les places d'apprentissage à l'EPFL.


## Introduction

Suivant la structure de fichiers suivantes
```
.
├── Electroniciens
├── EmployesCommerce
├── GardiensAnimaux
├── Informaticiens
│   ├── G25203--13-10-2016--05-49-15--email
│   └── G25471--15-11-2016--04-46-25--email
│       ├── annexes
│       │   ├── 241-Rapport-de-stage.pdf
│       │   ├── 370-LM.pdf
│       │   ├── 506-Document-identity.pdf
│       │   ├── 531-CV.pdf
│       │   ├── 645-Bulletins-scolaires.pdf
│       │   ├── 658-Certificat-scolaire.pdf
│       │   ├── 911-Rapport-de-stage2.pdf
│       │   ├── 962-Document-identity2.pdf
│       │   └── 965-Rapport-de-stage3.pdf
│       └── informations
│           └── informations.json
├── Logisticiens
└── Polymecaniciens
```

Où, par niveau :
  * Niv1 : Type d'apprentissage; Electroniciens, EmployesCommerce, etc...
  * Niv2 : Dossier par candidature (note: le même candidat peux avoir plusieurs dossiers)
  * Niv3a : `annexes`; une liste de documents soumis par le candidat
  * Niv3b : `informations`: contient le fichier `informations.json` avec les données de la candidature


## Description du système

Le but est de faire un script qui permet de récolter les informations contenues dans les différents fichiers `informations.json` de la structure ci-dessus.

1. Fournir une liste d'objets JSON par profession concaténant tous les fichiers informations.json
    * un fichier JSON par profession contenant toutes les candidatures
    * un fichier JSON au plus haut niveau contenant toutes les candidatures de toutes les profession

2. Manipuler le fichier JSON (général ou par profession) pour ne garder que les informations utiles (voir informations utiles pour les Informaticiens) dans le but de créer un fichier tableur facilement manipulable pour tout un chacun (e.g. csv, html ou excel).


## Améliorations optionnelles

Pour améliorer le système, les éléments suivants pourraient être prit en considération:

  * automatisation de la génération du fichier (idéalement après chaque création de nouvelles candidatures)
  * création de différents fichiers
    * JSON
    * Excel
    * google spreadsheet
    * HTML
  * création d'un site de visualisation des résultats avec accès limité en fonction des groupes

## Informations diverses

### Informations utiles pour les Informaticiens
```
 - "datePostulation": "12-11-2016--07:59:37"
 - "filiere":
 - "maturite":
 - "genreApprenti":
 - "nomApprenti":
 - "prenomApprenti":
 - "addresseApprentiComplete":  CONCAT RUE + NPA + VILLE
 - "telFixeApprenti":
 - "telMobileApprenti":
 - "mailApprenti": "xxx@gmail.com",
 - "dateNaissanceApprenti": "JJ\/MM\/YYYY",
 - "origineApprenti":
 - "nationaliteApprenti":
 - "permisEtranger":
 - "langueMaternelleApprenti":
 - "connaissancesLinguistiques": CONCAT avec ,
 - "majeur": "false",
 - "anneeFinScolarite": "YYYY",
 - "activitesProfessionnelles": CONCAT employeur
 - "stages": CONCAT employeur
 - "dejaCandidat":  avec "anneeCandidature": si true
```
