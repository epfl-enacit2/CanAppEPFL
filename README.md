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
│   ├── 2016-11-26_08-27-39_email
│   └── 2016-12-13_11-03-32_email
│   ├── annexes
│   │   ├── annexe1.pdf
│   │   ├── annexe2.pdf
│   │   ├── carte-identite.jpeg
│   │   ├── curriculum-vitae.pdf
│   │   ├── lettre-motivation.pdf
│   │   ├── photo-passeport.jpeg
│   │   └── Thumbs.db
│   └── informations
│       └── informations.json
├── Logisticiens
└── Polymecaniciens
```

Où, par niveau :
  * Niv1 : Type d'apprentissage; Electroniciens, EmployesCommerce, etc...
  * Niv2 : Dossier par candidature (note: le même candidat peux avoir plusieurs dossiers)
  * Niv3a : `annexes`; une liste de documents soumis par le candidat
  * Niv3b : `informations`: contient le fichier `informations.json` avec les données de la candidature


## Description du système

Le script permet de parser les informations contenue dans les fichiers `informations.json` de chaque candidatures.

  * Récupère les données `informations.json` pour les mettre dans `AllIn.json`
  * Crèe un fichier html par type de métier (jquery + datatable)
  * Pour les informaticiens, upload les données dans un google spreadsheet (`push_to_gs.js`)

## Images
Pour les fichiers HTML soient portables, utiliser:
`echo "data:image/jpeg;base64,$(base64 DSC_0251.JPG)"`
dans la balise src de l'imgage, e.g.
`<img src=""data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA4KCw0L[...]AFqLPzY" alt="mon image" />`

## Usage
  1. Copier le dossier `valides` pour - ou du moins s'assurer de - le rendre accessible au script `app.js`
  2. Lancer le script : `node app.js`
  3. Metter à jour `AllIn.json` puis les différents fichiers html générés dans `./results`
  4. Utiliser `push_to_gs.js` pour mettre à jour le google spreadsheet

## How to define secrets
  1. https://developers.google.com/identity/protocols/OAuth2
  1. https://console.developers.google.com/apis/library (Check that it's the user you want)
  1. Click sheets apis
  1. Créer un projet
  1. Activer le projet
  1. Créer les identifiants
    1. API: Google Sheets API
    1. Plate-forme: Autre plate-forme avec interface utilisateur
    1. Accès: Données utilisateur
  1. Créer un ID client (OAuth), e.g. CanAppClient
  1. Configurer l'écran d'autorisation OAuth (email@epfl + Nom de produit (i.e. Can APP))
  1. Télécharger les identifiants (fichier client_id.json, à placer dans le dossier de l'application)  
