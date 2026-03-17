import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Mentions légales & Politique de confidentialité
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique
          et Libertés
        </p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              1. Éditeur du site
            </h2>
            <p>
              Ce site est une application communautaire privée, éditée et
              administrée à titre personnel. L'accès est strictement réservé aux
              membres invités.
            </p>
            <p className="mt-2">
              <strong>Hébergeur :</strong> Vercel Inc., 340 Pine Street, Suite
              900, San Francisco, CA 94104, États-Unis.
              <br />
              <strong>Base de données :</strong> Supabase (région Europe —
              Frankfurt, Allemagne).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              2. Données personnelles collectées
            </h2>
            <p>
              Dans le cadre de l'utilisation de cette application, les données
              suivantes peuvent être collectées :
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Prénom ou pseudonyme (affiché publiquement dans l'app)</li>
              <li>Adresse e-mail (utilisée uniquement pour l'authentification)</li>
              <li>
                Bio courte (optionnel, visible par les membres de la communauté)
              </li>
              <li>
                Contenus publiés : podcasts partagés, commentaires, réactions
              </li>
              <li>Dates de connexion et d'activité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              3. Finalités du traitement
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Permettre la connexion et l'authentification des membres</li>
              <li>
                Afficher les contenus publiés au sein de la communauté privée
              </li>
              <li>Gérer les invitations et les accès</li>
            </ul>
            <p className="mt-2">
              Aucune donnée n'est utilisée à des fins publicitaires, de
              profilage commercial ou transmise à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              4. Base légale
            </h2>
            <p>
              Le traitement des données repose sur le <strong>consentement</strong>{" "}
              de la personne concernée, exprimé lors de l'acceptation de
              l'invitation et de la création du compte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              5. Durée de conservation
            </h2>
            <p>
              Les données sont conservées tant que le compte est actif. En cas
              de désactivation, les données sont <strong>pseudonymisées</strong>{" "}
              (le nom est remplacé par un identifiant anonyme). Les contenus
              publiés sont conservés de façon anonymisée pour préserver la
              cohérence de l'historique de la communauté.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              6. Vos droits
            </h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <strong>Droit d'accès :</strong> obtenir une copie de vos
                données
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos données
                (via la page Profil)
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> demander la suppression
                de votre compte
              </li>
              <li>
                <strong>Droit d'opposition :</strong> vous opposer au traitement
                de vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données
                dans un format structuré
              </li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez directement l'administrateur
              via la communauté.
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <strong>CNIL</strong> (Commission Nationale de l'Informatique et
              des Libertés) :{" "}
              <span className="text-indigo-600">www.cnil.fr</span>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              7. Sécurité
            </h2>
            <p>
              Les données sont protégées par les mesures suivantes :
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Connexion chiffrée HTTPS</li>
              <li>
                Authentification sécurisée via Supabase (mots de passe hachés,
                jamais stockés en clair)
              </li>
              <li>
                Row Level Security (RLS) : chaque utilisateur n'accède qu'à ses
                propres données via des politiques strictes
              </li>
              <li>Accès réservé aux membres invités, aucune inscription libre</li>
              <li>
                Protection contre le scraping automatique (robots.txt, headers
                HTTP)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              8. Cookies
            </h2>
            <p>
              Cette application utilise uniquement des cookies{" "}
              <strong>strictement nécessaires</strong> au fonctionnement de
              l'authentification (session utilisateur). Aucun cookie
              publicitaire ou de traçage tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              9. Transferts hors UE
            </h2>
            <p>
              Les données sont hébergées en Europe (Supabase — Frankfurt,
              Allemagne). Vercel peut traiter certaines données aux États-Unis,
              encadrés par les garanties appropriées (Standard Contractual
              Clauses).
            </p>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </>
  );
}
