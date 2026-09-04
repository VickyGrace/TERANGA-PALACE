// =========================
// OUTILS D'AFFICHAGE
// =========================

function afficherElement(element, afficher) {

    if (!element) {
        return;
    }

    element.style.display =
        afficher ? "block" : "none";
}


// =========================
// VÉRIFICATION DU RÔLE
// =========================

async function verifierRole() {

    // =========================
    // RÉCUPÉRER L'UTILISATEUR
    // =========================

    const {
        data: { user },
        error: erreurAuth
    } = await supabaseClient.auth.getUser();


    // =========================
    // UTILISATEUR NON CONNECTÉ
    // =========================

    if (erreurAuth || !user) {

        localStorage.removeItem("role");

        window.location.href =
            "connexion.html";

        return;
    }


    // =========================
    // RÉCUPÉRER LE RÔLE
    // =========================

    const {
        data: utilisateur,
        error: erreurUtilisateur
    } = await supabaseClient
        .from("utilisateurs")
        .select("role")
        .eq("id", user.id)
        .single();


    // =========================
    // ERREUR UTILISATEUR
    // =========================

    if (erreurUtilisateur) {

        console.error(
            "Erreur lors de la récupération du rôle :",
            erreurUtilisateur
        );

        localStorage.removeItem("role");

        await supabaseClient.auth.signOut();

        window.location.href =
            "connexion.html";

        return;
    }


    // =========================
    // LIENS
    // =========================

    const clientsLink =
        document.getElementById("clients-link");

    const chambresLink =
        document.getElementById("chambres-link");

    const reservationsLink =
        document.getElementById("reservations-link");

    const sejoursLink =
        document.getElementById("sejours-link");

    const paiementsLink =
        document.getElementById("paiements-link");

    const statistiquesLink =
        document.getElementById("statistiques-link");


    // =========================
    // CARTES
    // =========================

    const clientsCard =
        document.getElementById("clients-card");

    const chambresCard =
        document.getElementById("chambres-card");

    const reservationsCard =
        document.getElementById("reservations-card");

    const sejoursCard =
        document.getElementById("sejours-card");

    const paiementsCard =
        document.getElementById("paiements-card");

    const statistiquesCard =
        document.getElementById("statistiques-card");


    // =========================
    // GESTIONNAIRE
    // =========================

    if (utilisateur.role === "Gestionnaire") {

        afficherElement(clientsLink, false);
        afficherElement(chambresLink, false);
        afficherElement(reservationsLink, false);
        afficherElement(sejoursLink, false);
        afficherElement(paiementsLink, false);

        afficherElement(clientsCard, false);
        afficherElement(chambresCard, false);
        afficherElement(reservationsCard, false);
        afficherElement(sejoursCard, false);
        afficherElement(paiementsCard, false);

        afficherElement(statistiquesLink, true);
        afficherElement(statistiquesCard, true);

        return;
    }


    // =========================
    // RÉCEPTIONNISTE
    // =========================

    if (utilisateur.role === "Réceptionniste") {

        afficherElement(clientsLink, true);
        afficherElement(chambresLink, true);
        afficherElement(reservationsLink, true);
        afficherElement(sejoursLink, true);
        afficherElement(paiementsLink, true);

        afficherElement(clientsCard, true);
        afficherElement(chambresCard, true);
        afficherElement(reservationsCard, true);
        afficherElement(sejoursCard, true);
        afficherElement(paiementsCard, true);

        afficherElement(statistiquesLink, false);
        afficherElement(statistiquesCard, false);

        return;
    }


    // =========================
    // RÔLE INCONNU
    // =========================

    localStorage.removeItem("role");

    await supabaseClient.auth.signOut();

    window.location.href =
        "connexion.html";
}


// =========================
// DÉCONNEXION
// =========================

const boutonDeconnexion =
    document.getElementById("btn-deconnexion");


boutonDeconnexion.addEventListener(
    "click",
    async function() {

        const confirmation =
            confirm(
                "Voulez-vous vraiment vous déconnecter ?"
            );


        if (!confirmation) {
            return;
        }


        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Erreur lors de la déconnexion :",
                error
            );

            alert(
                "Impossible de se déconnecter."
            );

            return;
        }


        localStorage.removeItem("role");

        window.location.href =
            "connexion.html";
    }
);


// =========================
// LANCER LA VÉRIFICATION
// =========================

verifierRole();