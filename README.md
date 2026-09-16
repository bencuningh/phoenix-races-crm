# Phoenix Races — Outil de relance partenaires

Outil interne de suivi des relances pour Phoenix Races (course ultra backyard, Épieds, Eure — Pentecôte 2027).

Croise la base de contacts Notion avec Gmail pour identifier qui relancer en priorité, avec un dashboard mobile-friendly hébergé sur Vercel et un cache Supabase.

## Stack

- Next.js (App Router) — dashboard + routes API, hébergé sur Vercel
- Supabase — cache des contacts (`contacts_cache`), tokens OAuth (`oauth_tokens`), historique de sync (`sync_log`)
- Notion API — source de vérité des contacts
- Gmail API (OAuth2, lecture seule) — détection des derniers échanges

## Développement

Voir la documentation dans le dossier du projet une fois l'app Next.js initialisée.
