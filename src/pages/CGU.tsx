import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft, FileText, Shield, User, Lock, AlertTriangle, Globe, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const CGU = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-[373px] min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(200,100%,50%)] flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black gradient-text-cyan tracking-wider">
                CONDITIONS GÉNÉRALES D'UTILISATION
              </h1>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl space-y-8">
          {/* Introduction */}
          <div className="panel-3d p-6">
            <p className="text-muted-foreground leading-relaxed">
              Bienvenue sur <span className="text-[hsl(320,100%,60%)] font-bold">AIONE</span>, votre portail d'accès aux technologies d'intelligence artificielle génératives. 
              En utilisant ce service, vous acceptez les présentes Conditions Générales d'Utilisation (CGU). 
              Veuillez les lire attentivement avant toute utilisation.
            </p>
          </div>

          {/* Article 1 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(174,100%,50%)]/20 flex items-center justify-center">
                <span className="font-display font-bold text-[hsl(174,100%,50%)]">1</span>
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">OBJET</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">1.1</strong> AIONE est un agrégateur de modèles d'intelligence artificielle permettant la génération de contenus multimédias (images, vidéos, audio, textes, code).
              </p>
              <p>
                <strong className="text-foreground">1.2</strong> Les présentes CGU définissent les conditions d'accès et d'utilisation de la plateforme AIONE et de l'ensemble de ses services.
              </p>
              <p>
                <strong className="text-foreground">1.3</strong> L'utilisation du service implique l'acceptation pleine et entière des présentes CGU.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(280,100%,65%)]/20 flex items-center justify-center">
                <User className="h-4 w-4 text-[hsl(280,100%,65%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">ACCÈS AU SERVICE</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">2.1 Inscription</strong> : L'accès à certaines fonctionnalités nécessite la création d'un compte utilisateur avec un identifiant unique.
              </p>
              <p>
                <strong className="text-foreground">2.2 Authentification</strong> : L'utilisateur est responsable de la confidentialité de ses identifiants et mots de passe.
              </p>
              <p>
                <strong className="text-foreground">2.3 Âge minimum</strong> : L'utilisation du service est réservée aux personnes majeures (18 ans minimum) ou aux mineurs disposant d'une autorisation parentale.
              </p>
              <p>
                <strong className="text-foreground">2.4 Mode visiteur</strong> : La consultation du site est possible sans inscription, mais l'utilisation des générateurs IA nécessite une identification.
              </p>
            </div>
          </section>

          {/* Article 3 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                <Globe className="h-4 w-4 text-[hsl(320,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">DESCRIPTION DES SERVICES</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">3.1</strong> AIONE propose l'accès à de multiples modèles d'IA provenant de fournisseurs tiers (Replicate, OpenAI, Stability AI, etc.).
              </p>
              <p>
                <strong className="text-foreground">3.2 Types de génération</strong> : Images, vidéos, audio, musique, voix, textes, code informatique.
              </p>
              <p>
                <strong className="text-foreground">3.3</strong> Certains modèles sont gratuits, d'autres nécessitent des crédits ou des clés API personnelles.
              </p>
              <p>
                <strong className="text-foreground">3.4</strong> La disponibilité des modèles dépend des fournisseurs tiers et peut varier sans préavis.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(45,100%,55%)]/20 flex items-center justify-center">
                <Lock className="h-4 w-4 text-[hsl(45,100%,55%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">UTILISATION DES CLÉS API</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">4.1</strong> L'utilisateur peut fournir ses propres clés API pour accéder à certains services.
              </p>
              <p>
                <strong className="text-foreground">4.2 Confidentialité</strong> : Les clés API sont stockées de manière sécurisée et chiffrée dans l'espace personnel de l'utilisateur.
              </p>
              <p>
                <strong className="text-foreground">4.3 Responsabilité</strong> : L'utilisateur est seul responsable de la gestion et de la sécurité de ses clés API.
              </p>
              <p>
                <strong className="text-foreground">4.4</strong> AIONE n'est pas responsable des coûts engendrés par l'utilisation des clés API personnelles.
              </p>
              <p>
                <strong className="text-foreground">4.5</strong> L'utilisateur s'engage à respecter les CGU des fournisseurs tiers dont il utilise les services.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(142,76%,50%)]/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[hsl(142,76%,50%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">CONTENUS GÉNÉRÉS</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">5.1 Propriété</strong> : Les contenus générés appartiennent à l'utilisateur, sous réserve des conditions des fournisseurs d'IA.
              </p>
              <p>
                <strong className="text-foreground">5.2 Licence</strong> : L'utilisateur accorde à AIONE une licence limitée pour afficher les contenus dans son historique personnel.
              </p>
              <p>
                <strong className="text-foreground">5.3 Contenus interdits</strong> : Il est strictement interdit de générer des contenus illégaux, haineux, diffamatoires, violents, ou portant atteinte aux droits d'autrui.
              </p>
              <p>
                <strong className="text-foreground">5.4</strong> AIONE se réserve le droit de supprimer tout contenu contraire aux présentes CGU.
              </p>
            </div>
          </section>

          {/* Article 6 - NSFW */}
          <section className="panel-3d p-6 space-y-4 border-l-4 border-[hsl(25,100%,55%)]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(25,100%,55%)]/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[hsl(25,100%,55%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">CONTENUS NSFW (18+)</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">6.1 Définition</strong> : Le contenu NSFW (Not Safe For Work) désigne tout contenu à caractère adulte, érotique ou explicite.
              </p>
              <p>
                <strong className="text-foreground">6.2 Accès restreint</strong> : L'accès aux fonctionnalités NSFW est strictement réservé aux personnes majeures (18 ans et plus).
              </p>
              <p>
                <strong className="text-foreground">6.3</strong> L'utilisateur certifie sur l'honneur être majeur lors de l'activation de ces fonctionnalités.
              </p>
              <p>
                <strong className="text-foreground">6.4 Interdictions</strong> : Est strictement interdit tout contenu représentant des mineurs, des actes non consentis, ou tout contenu illégal.
              </p>
              <p>
                <strong className="text-foreground">6.5</strong> L'utilisateur assume l'entière responsabilité des contenus NSFW qu'il génère.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(210,100%,60%)]/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[hsl(210,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">RESPONSABILITÉS</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">7.1 AIONE</strong> : Le service est fourni "tel quel" sans garantie de disponibilité permanente.
              </p>
              <p>
                <strong className="text-foreground">7.2</strong> AIONE n'est pas responsable des contenus générés par les modèles IA tiers.
              </p>
              <p>
                <strong className="text-foreground">7.3 Utilisateur</strong> : L'utilisateur est seul responsable de l'utilisation qu'il fait du service et des contenus qu'il génère.
              </p>
              <p>
                <strong className="text-foreground">7.4</strong> En cas de force majeure, AIONE ne pourra être tenu responsable d'une interruption de service.
              </p>
            </div>
          </section>

          {/* Article 8 - RGPD */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(174,100%,50%)]/20 flex items-center justify-center">
                <Lock className="h-4 w-4 text-[hsl(174,100%,50%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">DONNÉES PERSONNELLES (RGPD)</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">8.1 Collecte</strong> : AIONE collecte uniquement les données nécessaires au fonctionnement du service (identifiant, historique de génération).
              </p>
              <p>
                <strong className="text-foreground">8.2 Utilisation</strong> : Les données sont utilisées exclusivement pour le fonctionnement du service et ne sont pas vendues à des tiers.
              </p>
              <p>
                <strong className="text-foreground">8.3 Conservation</strong> : Les données sont conservées pour la durée d'utilisation du service et peuvent être supprimées sur demande.
              </p>
              <p>
                <strong className="text-foreground">8.4 Droits</strong> : Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
              </p>
              <p>
                <strong className="text-foreground">8.5 Cookies</strong> : Le site utilise des cookies techniques nécessaires au fonctionnement du service.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(280,100%,65%)]/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[hsl(280,100%,65%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">PROPRIÉTÉ INTELLECTUELLE</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">9.1</strong> L'interface, le design et le code source d'AIONE sont protégés par le droit d'auteur.
              </p>
              <p>
                <strong className="text-foreground">9.2</strong> Les modèles IA appartiennent à leurs créateurs respectifs (OpenAI, Stability AI, Replicate, etc.).
              </p>
              <p>
                <strong className="text-foreground">9.3</strong> Toute reproduction ou copie du site sans autorisation est interdite.
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                <Globe className="h-4 w-4 text-[hsl(320,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">SERVICES TIERS</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">10.1</strong> AIONE intègre des services de partenaires (G2A, G2G, Kinguin) pour les offres promotionnelles.
              </p>
              <p>
                <strong className="text-foreground">10.2</strong> Les liens vers des sites tiers sont fournis à titre informatif. AIONE n'est pas responsable du contenu de ces sites.
              </p>
              <p>
                <strong className="text-foreground">10.3</strong> Les transactions effectuées sur les sites partenaires sont régies par leurs propres CGU.
              </p>
            </div>
          </section>

          {/* Article 11 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(45,100%,55%)]/20 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-[hsl(45,100%,55%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">TARIFICATION</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">11.1</strong> De nombreux modèles IA sont accessibles gratuitement.
              </p>
              <p>
                <strong className="text-foreground">11.2</strong> Certains modèles nécessitent des crédits ou des clés API personnelles dont le coût est à la charge de l'utilisateur.
              </p>
              <p>
                <strong className="text-foreground">11.3</strong> Les crédits consommés ne sont pas remboursables.
              </p>
              <p>
                <strong className="text-foreground">11.4</strong> Les offres promotionnelles des partenaires sont soumises à leurs conditions spécifiques.
              </p>
            </div>
          </section>

          {/* Article 12 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(0,100%,60%)]/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[hsl(0,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">SUSPENSION ET RÉSILIATION</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">12.1</strong> AIONE se réserve le droit de suspendre ou résilier tout compte en cas de violation des CGU.
              </p>
              <p>
                <strong className="text-foreground">12.2 Comportements interdits</strong> : Tentative de piratage, abus du service, génération de contenu illégal, usurpation d'identité.
              </p>
              <p>
                <strong className="text-foreground">12.3</strong> L'utilisateur peut demander la suppression de son compte à tout moment.
              </p>
              <p>
                <strong className="text-foreground">12.4</strong> La résiliation entraîne la perte des crédits non utilisés et de l'historique de génération.
              </p>
            </div>
          </section>

          {/* Article 13 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(174,100%,50%)]/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[hsl(174,100%,50%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">MODIFICATION DES CGU</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">13.1</strong> AIONE se réserve le droit de modifier les présentes CGU à tout moment.
              </p>
              <p>
                <strong className="text-foreground">13.2</strong> Les utilisateurs seront informés des modifications significatives.
              </p>
              <p>
                <strong className="text-foreground">13.3</strong> La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles CGU.
              </p>
            </div>
          </section>

          {/* Article 14 */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(210,100%,60%)]/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[hsl(210,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">DROIT APPLICABLE</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">14.1</strong> Les présentes CGU sont régies par le droit français.
              </p>
              <p>
                <strong className="text-foreground">14.2</strong> En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
              </p>
              <p>
                <strong className="text-foreground">14.3</strong> À défaut d'accord amiable, les tribunaux français seront compétents.
              </p>
            </div>
          </section>

          {/* Article 15 - Contact */}
          <section className="panel-3d p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                <Mail className="h-4 w-4 text-[hsl(320,100%,60%)]" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">CONTACT</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-11">
              <p>
                <strong className="text-foreground">Administrateur</strong> : Mik
              </p>
              <p>
                <strong className="text-foreground">Plateforme</strong> : AIONE - AI Gateway
              </p>
              <p>
                Pour toute question concernant ces CGU, veuillez utiliser le formulaire de contact disponible dans la section "Compte".
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="panel-3d p-6 text-center">
            <p className="text-sm text-muted-foreground">
              En utilisant AIONE, vous reconnaissez avoir lu, compris et accepté les présentes Conditions Générales d'Utilisation.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © {new Date().getFullYear()} AIONE - Tous droits réservés
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CGU;
