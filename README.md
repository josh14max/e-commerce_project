DÉVELOPPPEMENT D'UN SITE E-COMMERCE AVEC REACT, BOLT ET DÉPLOIEMENT AVEC VERCEL
# e-commerce_project

## Mise à jour du back-office (septembre 2026)

Cette version ajoute la gestion des variantes, des sections du site et du dépôt de paiement.

Pour l'activer sur le site déjà en ligne :

1. appliquer la migration Supabase `20260902090000_full_backoffice_management.sql` ;
2. redéployer la fonction Supabase `create-payment` ;
3. redéployer le projet sur Vercel.

Le montant du dépôt est relu côté serveur : la valeur envoyée par le navigateur n'est jamais considérée comme autoritaire.
