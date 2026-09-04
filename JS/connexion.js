// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const formulaireConnexion =
    document.getElementById("connexion-form");

const messageErreur =
    document.getElementById("message-erreur");

const boutonConnexion =
    document.getElementById("bouton-connexion");


// =========================
// RÉINITIALISER LE BOUTON
// =========================

function reinitialiserBoutonConnexion() {

    boutonConnexion.disabled = false;

    boutonConnexion.innerHTML = `
        <i class="fa-solid fa-right-to-bracket"></i>

        <span>
            Se connecter
        </span>
    `;
}


// =========================
// CONNEXION UTILISATEUR
// =========================

formulaireConnexion.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // =========================
        // RÉCUPÉRER LES VALEURS
        // =========================

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        // =========================
        // RÉINITIALISER LE MESSAGE
        // =========================

        messageErreur.textContent = "";


        // =========================
        // DÉSACTIVER LE BOUTON
        // =========================

        boutonConnexion.disabled = true;

        boutonConnexion.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Connexion en cours...
            </span>
        `;


        // =========================
        // CONNEXION SUPABASE
        // =========================

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        // =========================
        // ERREUR DE CONNEXION
        // =========================

        if (error) {

            console.error(
                "Erreur de connexion :",
                error
            );

            messageErreur.textContent =
                "Email ou mot de passe incorrect.";

            reinitialiserBoutonConnexion();

            return;
        }


        // =========================
        // UTILISATEUR CONNECTÉ
        // =========================

        const utilisateurConnecte =
            data.user;


        // =========================
        // RÉCUPÉRER LE RÔLE
        // =========================

        const {
            data: utilisateur,
            error: erreurUtilisateur
        } = await supabaseClient
            .from("utilisateurs")
            .select("nom, prenom, email, role")
            .eq("id", utilisateurConnecte.id)
            .single();


        // =========================
        // ERREUR UTILISATEUR
        // =========================

        if (erreurUtilisateur) {

            console.error(
                "Erreur lors de la récupération du rôle :",
                erreurUtilisateur
            );

            messageErreur.textContent =
                "Impossible de récupérer votre rôle.";

            await supabaseClient.auth.signOut();

            reinitialiserBoutonConnexion();

            return;
        }


        // =========================
        // ENREGISTRER LE RÔLE
        // =========================

        localStorage.setItem(
            "role",
            utilisateur.role
        );


        // =========================
        // REDIRECTION SELON LE RÔLE
        // =========================

        if (
            utilisateur.role === "Gestionnaire" ||
            utilisateur.role === "Réceptionniste"
        ) {

            window.location.href =
                "index.html";

            return;
        }


        // =========================
        // RÔLE NON RECONNU
        // =========================

        messageErreur.textContent =
            "Votre rôle n'est pas reconnu.";

        localStorage.removeItem("role");

        await supabaseClient.auth.signOut();

        reinitialiserBoutonConnexion();

    }
);