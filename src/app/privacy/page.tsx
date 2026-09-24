export const metadata = {
  title: "Confidentialité — Phoenix Races CRM",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-4 px-4 py-10 text-noir-nuit">
      <h1 className="font-display text-2xl">Politique de confidentialité</h1>
      <p>
        Phoenix Races CRM est un outil interne à usage strictement personnel, utilisé uniquement
        par Benjamin Cuningham (Phoenix Races) pour suivre les relances avec les partenaires,
        organisateurs et contacts de l&rsquo;association. Il n&rsquo;est pas destiné au grand
        public et ne collecte aucune donnée de visiteurs.
      </p>
      <h2 className="font-display text-lg">Données utilisées</h2>
      <p>
        L&rsquo;application accède à la boîte Gmail de son seul utilisateur (lecture et envoi, via
        l&rsquo;API Gmail) pour déterminer la date des derniers échanges avec chaque contact et
        générer des brouillons de relance. Les contacts eux-mêmes sont gérés dans une base Notion
        privée et mis en cache dans une base Supabase privée, accessibles uniquement par
        l&rsquo;utilisateur.
      </p>
      <h2 className="font-display text-lg">Partage</h2>
      <p>
        Aucune donnée n&rsquo;est partagée avec un tiers. Les données Gmail ne sont utilisées que
        pour l&rsquo;usage décrit ci-dessus et ne sont pas revendues, publiées ni utilisées à des
        fins publicitaires.
      </p>
      <h2 className="font-display text-lg">Révocation de l&rsquo;accès</h2>
      <p>
        L&rsquo;accès de l&rsquo;application au compte Gmail peut être révoqué à tout moment depuis{" "}
        <a
          href="https://myaccount.google.com/permissions"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          myaccount.google.com/permissions
        </a>
        .
      </p>
      <h2 className="font-display text-lg">Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href="mailto:cuninghambenjamin@gmail.com" className="underline">
          cuninghambenjamin@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
