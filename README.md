# NG Hair — e-commerce

Application React/Vite avec Supabase et paiement Moneroo. PayDunya est configuré comme moyen de paiement dans le tableau de bord Moneroo : aucune clé PayDunya ne doit être placée dans le navigateur.

## Déploiement en production

### 1. Configurer les secrets Supabase

Dans Moneroo, récupérer la clé secrète **Live** et créer un secret distinct pour signer les webhooks. Ne jamais ajouter ces valeurs dans un fichier `.env` du frontend.

```bash
npx supabase link --project-ref edodtfhqpjfhnhdyyobn
npx supabase secrets set MONEROO_SECRET_KEY="votre_cle_live_moneroo"
npx supabase secrets set MONEROO_WEBHOOK_SECRET="votre_secret_webhook"
npx supabase secrets set PAYMENT_SITE_URL="https://votre-domaine.com"
```

`PAYMENT_SITE_URL` doit contenir l'origine publique exacte du site, sans chemin ni slash final. Cette restriction empêche qu'un visiteur fournisse une URL de retour externe.

### 2. Appliquer les migrations et déployer les fonctions

```bash
npx supabase db push
npx supabase functions deploy create-payment
npx supabase functions deploy payment-status
npx supabase functions deploy moneroo-webhook
```

La migration `20260902170000_secure_moneroo_payment_flow.sql` ajoute les champs de suivi du paiement et interdit au navigateur de créer ou de modifier directement une commande.

### 3. Configurer le webhook Moneroo

Dans le tableau de bord Moneroo, utiliser cette URL :

```text
https://edodtfhqpjfhnhdyyobn.supabase.co/functions/v1/moneroo-webhook
```

Activer au minimum les événements de paiement réussi, échoué et annulé. Le secret configuré dans Moneroo doit être exactement le même que `MONEROO_WEBHOOK_SECRET`.

### 4. Configurer PayDunya dans Moneroo

Dans Moneroo, passer l'intégration PayDunya en production avec les identifiants PayDunya Live, puis vérifier que la devise XOF et les moyens de paiement souhaités sont activés. Le frontend ne communique qu'avec Moneroo.

### 5. Déployer le frontend

Conserver uniquement les variables publiques Supabase dans Vercel :

```text
VITE_SUPABASE_URL=https://edodtfhqpjfhnhdyyobn.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Puis lancer un nouveau déploiement Vercel. La page de retour utilisée est `/paiement/confirmation`.

## Contrôles avant ouverture

- effectuer un paiement réel de faible montant ;
- confirmer que la commande passe à `paid` dans Supabase ;
- confirmer que le panier est vidé après le retour sur le site ;
- tester aussi un paiement annulé ;
- ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY`, `MONEROO_SECRET_KEY` ou `MONEROO_WEBHOOK_SECRET` dans Vercel côté frontend.

Le montant du dépôt, le prix et les variantes sont tous revérifiés côté serveur avant l'initialisation du paiement.
