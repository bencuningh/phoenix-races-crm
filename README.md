# Phoenix Races — Outil de relance partenaires

Outil interne de suivi des relances pour Phoenix Races (course ultra backyard, Épieds, Eure — Pentecôte 2027).

Croise la base de contacts Notion avec Gmail pour identifier qui relancer en priorité, avec un dashboard mobile-friendly hébergé sur Vercel et un cache Supabase.

## Stack

- Next.js (App Router) — dashboard + routes API, hébergé sur Vercel
- Supabase — cache des contacts (`contacts_cache`), tokens OAuth (`oauth_tokens`), historique de sync (`sync_log`)
- Notion API — source de vérité des contacts
- Gmail API (OAuth2, lecture + envoi) — détection des derniers échanges et digest hebdomadaire
- Claude API (Anthropic) — génération de brouillons de relance à partir de l'historique email

## Développement

```bash
npm install
cp .env.example .env.local   # remplir les valeurs, voir "Configuration" ci-dessous
npm run dev
```

## Configuration

### 1. Notion

1. Crée une intégration interne sur [notion.so/my-integrations](https://www.notion.so/my-integrations), copie son secret dans `NOTION_API_KEY`.
2. Ouvre la base "Phoenix Races — Contacts", menu `•••` → `Connections` → ajoute l'intégration.
3. `NOTION_DATA_SOURCE_ID` est déjà renseigné dans `.env.example` (data source de la base contacts).

### 2. Google Cloud / Gmail

1. Crée un projet sur [console.cloud.google.com](https://console.cloud.google.com), active l'API Gmail.
2. Écran de consentement OAuth : type "External" (ou "Internal" si Workspace), scopes `gmail.readonly` **et** `gmail.send` (nécessaire pour le digest hebdomadaire), ajoute ton compte comme testeur si l'app reste en mode test.
3. Identifiants → Créer des identifiants → ID client OAuth → type "Application Web". URI de redirection autorisée :
   `https://<ton-domaine-vercel>/api/auth/google/callback` (et `http://localhost:3000/api/auth/google/callback` pour le dev local).
4. Renseigne `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
5. Une fois déployé, visite `/api/auth/google` pour lancer le consentement — le refresh token est stocké dans Supabase (`oauth_tokens`). Si Gmail était déjà connecté avant l'ajout du scope `gmail.send`, reconnecte-toi via `/api/auth/google` pour obtenir un nouveau refresh token qui inclut le droit d'envoi.

### 3. Supabase

Projet dédié `phoenix-races-crm` (org "Phoenix Races") déjà créé, schéma appliqué via `supabase/migrations/0001_init.sql`.
Récupère `SUPABASE_URL` et la **service role key** (Settings → API — jamais l'anon/publishable key, elle n'a pas accès à ces tables) dans le dashboard Supabase.

### 4. Anthropic (brouillons de relance)

Crée une clé API sur [console.anthropic.com](https://console.anthropic.com) → renseigne `ANTHROPIC_API_KEY`. Utilisée uniquement à la demande (bouton "Générer un brouillon" sur un contact à relancer), donc coût minime.

### 5. Vercel

À configurer dans les **Settings → Environment Variables** du projet Vercel une fois déployé :

- `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET` (chaîne aléatoire de ton choix — protège `/api/cron/sync` et `/api/cron/digest`)
- `FOLLOWUP_THRESHOLD_DAYS` (optionnel, défaut 12)

Active aussi la **Deployment Protection** (mot de passe) dans Settings → Deployment Protection, puisque l'outil contient des données de partenariat sensibles.

## Fonctionnalités du dashboard

- **À relancer / À qualifier / Toutes** — trois vues ; "Toutes" liste chaque contact avec un tri (nom, dernier contact, jours écoulés) et les filtres Catégorie/Type, comme une base Notion.
- **Catégorie éditable** — change directement depuis une carte, écrit dans Notion et Supabase.
- **Stand-by** — met un contact en pause indéfiniment (exclu de "à relancer" et du digest) jusqu'à ce qu'il soit repris.
- **Relancer le [date]** — reporte un contact à une date précise sans le mettre en stand-by permanent ; redevient actif automatiquement une fois la date passée.
- **Générer un brouillon** — rédige un email de relance via Claude, à partir de l'historique Gmail réel avec ce contact.
- **Digest hebdomadaire** — chaque vendredi 17h UTC (~18-19h Paris), un email récapitulatif des contacts à relancer (hors stand-by/reportés) est envoyé automatiquement à l'adresse Gmail connectée.

## Workflow git

`claude/great-bardeen-jla5e7` est la branche de développement de cette session ; `main` est la branche par défaut du repo et la branche de production sur Vercel — chaque push sur `main` déploie directement en production.
