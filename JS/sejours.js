// =========================
// PARAMÈTRES DE LA PAGE
// =========================

const parametresPage =
    new URLSearchParams(
        window.location.search
    );

const reservationIdPage =
    parametresPage.get(
        "reservation"
    );


// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const boutonRetourSejours =
    document.getElementById(
        "bouton-retour-sejours"
    );

const texteRetourSejours =
    document.getElementById(
        "texte-retour-sejours"
    );

const sejoursList =
    document.getElementById(
        "sejours-list"
    );

const rechercheSejour =
    document.getElementById(
        "recherche-sejour"
    );


// =====================================================
// GÉRER LE BOUTON RETOUR
// =====================================================

if (reservationIdPage) {

    texteRetourSejours.textContent =
        "Retour aux réservations";

    boutonRetourSejours.href =
        "reservations.html";

}
else {

    texteRetourSejours.textContent =
        "Retour au tableau de bord";

    boutonRetourSejours.href =
        "index.html";
}


// =====================================================
// CHARGER LES SÉJOURS
// =====================================================

async function chargerReservations() {

    // =================================================
    // RÉCUPÉRER LES RÉSERVATIONS
    // =================================================

    const {
        data: reservations,
        error: erreurReservations
    } =
        await supabaseClient
            .from("reservations")
            .select(`
                id,
                client_id,
                chambre_id,
                date_arrivee,
                date_depart,
                nombre_personnes,
                statut,
                clients (
                    nom,
                    prenom
                ),
                chambres (
                    numero_chambre,
                    type
                )
            `)
            .in(
                "statut",
                [
                    "En attente",
                    "Confirmée",
                    "Terminée"
                ]
            )
            .order(
                "date_arrivee",
                { ascending: true }
            );


    // =================================================
    // ERREUR RÉSERVATIONS
    // =================================================

    if (erreurReservations) {

        console.error(
            "Erreur lors du chargement des réservations :",
            erreurReservations
        );

        alert(
            "Impossible de charger les réservations : " +
            erreurReservations.message
        );

        return;
    }


    // =================================================
    // FILTRER SELON L'ID PRÉSENT DANS L'URL
    // =================================================

    let reservationsAffichees =
        reservations;


    if (reservationIdPage) {

        reservationsAffichees =
            reservations.filter(
                function(reservation) {

                    return (
                        reservation.id ===
                        reservationIdPage
                    );
                }
            );
    }


    // =================================================
    // RÉCUPÉRER LES SÉJOURS
    // =================================================

    const {
        data: sejours,
        error: erreurSejours
    } =
        await supabaseClient
            .from("sejours")
            .select(`
                id,
                reservation_id,
                date_arrivee_reelle,
                date_depart_reelle,
                statut
            `);


    // =================================================
    // ERREUR SÉJOURS
    // =================================================

    if (erreurSejours) {

        console.error(
            "Erreur lors du chargement des séjours :",
            erreurSejours
        );

        alert(
            "Impossible de charger les séjours : " +
            erreurSejours.message
        );

        return;
    }


    // =================================================
    // RÉINITIALISER L'AFFICHAGE
    // =================================================

    sejoursList.innerHTML =
        "";


    // =================================================
    // AUCUN SÉJOUR
    // =================================================

    if (
        reservationsAffichees.length ===
        0
    ) {

        sejoursList.innerHTML = `
            <p>
                Aucun séjour à afficher.
            </p>
        `;

        return;
    }


    // =================================================
    // AFFICHER LES SÉJOURS
    // =================================================

    reservationsAffichees.forEach(
        function(reservation) {

            const sejourElement =
                document.createElement(
                    "div"
                );


            sejourElement.classList.add(
                "sejour-item"
            );


            // =============================================
            // TROUVER LE SÉJOUR CORRESPONDANT
            // =============================================

            const sejour =
                sejours.find(
                    function(sejour) {

                        return (
                            sejour.reservation_id ===
                            reservation.id
                        );
                    }
                );


            // =============================================
            // STATUT DU SÉJOUR
            // =============================================

            let statutSejour =
                sejour
                    ? sejour.statut
                    : "Aucun séjour associé";


            let classeStatut =
                "status-attente";


            if (
                statutSejour ===
                "En cours"
            ) {

                classeStatut =
                    "status-confirmee";

            }
            else if (
                statutSejour ===
                "Check-out en cours"
            ) {

                classeStatut =
                    "status-checkout";

            }
            else if (
                statutSejour ===
                "Terminé"
            ) {

                classeStatut =
                    "status-terminee";
            }


            // =============================================
            // BOUTONS
            // =============================================

            let action =
                "";


            if (
                sejour &&
                sejour.statut ===
                "En attente"
            ) {

                action = `
                    <button
                        class="btn btn-primary checkin-btn"
                        type="button"
                    >
                        Check-in
                    </button>
                `;

            }
            else if (
                sejour &&
                sejour.statut ===
                "En cours"
            ) {

                action = `
                    <button
                        class="btn btn-warning checkout-btn"
                        type="button"
                    >
                        Check-out
                    </button>
                `;
            }


            // =============================================
            // DATE D'ARRIVÉE RÉELLE
            // =============================================

            let dateArriveeReelle =
                "Non enregistrée";


            if (
                sejour &&
                sejour.date_arrivee_reelle
            ) {

                dateArriveeReelle =
                    new Date(
                        sejour.date_arrivee_reelle
                    ).toLocaleString(
                        "fr-FR"
                    );
            }


            // =============================================
            // DATE DE DÉPART RÉELLE
            // =============================================

            let dateDepartReelle =
                "Non enregistrée";


            if (
                sejour &&
                sejour.date_depart_reelle
            ) {

                dateDepartReelle =
                    new Date(
                        sejour.date_depart_reelle
                    ).toLocaleString(
                        "fr-FR"
                    );
            }


            // =============================================
            // AFFICHER LES INFORMATIONS
            // =============================================

            sejourElement.innerHTML = `

                <div class="sejour-client">

                    <div class="sejour-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <div>

                        <span class="reservation-card-label">
                            Séjour
                        </span>

                        <h3>
                            ${reservation.clients.nom}
                            ${reservation.clients.prenom}
                        </h3>

                        <p class="sejour-id">

                            <strong>ID séjour :</strong>

                            ${sejour.id}

                        </p>

                    </div>

                </div>


                <div class="sejour-chambre">

                    <p>

                        <i class="fa-solid fa-bed"></i>

                        <strong>
                            Chambre ${reservation.chambres.numero_chambre}
                        </strong>

                        - ${reservation.chambres.type}

                    </p>

                    <p>

                        <i class="fa-solid fa-users"></i>

                        ${reservation.nombre_personnes}

                        ${
                            reservation.nombre_personnes == 1
                                ? "personne"
                                : "personnes"
                        }

                    </p>

                </div>


                <div class="sejour-dates-prevues">

                    <p>

                        <i class="fa-solid fa-calendar-day"></i>

                        <strong>
                            Arrivée prévue :
                        </strong>

                        ${reservation.date_arrivee}

                    </p>

                    <p>

                        <i class="fa-solid fa-calendar-day"></i>

                        <strong>
                            Départ prévu :
                        </strong>

                        ${reservation.date_depart}

                    </p>

                </div>


                <div class="sejour-dates-reelles">

                    <p>

                        <i class="fa-solid fa-arrow-right-to-bracket"></i>

                        <strong>
                            Arrivée réelle :
                        </strong>

                        ${dateArriveeReelle}

                    </p>

                    <p>

                        <i class="fa-solid fa-arrow-right-from-bracket"></i>

                        <strong>
                            Départ réel :
                        </strong>

                        ${dateDepartReelle}

                    </p>

                </div>


                <div class="sejour-statut">

                    <span class="status-badge ${classeStatut}">
                        ${statutSejour}
                    </span>

                </div>


                <div class="admin-card-actions">

                    ${action}

                </div>
            `;


            sejoursList.appendChild(
                sejourElement
            );


            // =================================================
            // CHECK-IN
            // =================================================

            const checkinButton =
                sejourElement.querySelector(
                    ".checkin-btn"
                );


            if (checkinButton) {

                checkinButton.addEventListener(
                    "click",
                    async function() {

                        const confirmation =
                            confirm(
                                "Voulez-vous enregistrer l'arrivée de ce client ?"
                            );


                        if (!confirmation) {
                            return;
                        }


                        // -------------------------------------
                        // DATE ET HEURE ACTUELLES
                        // -------------------------------------

                        const maintenant =
                            new Date()
                                .toISOString();


                        // -------------------------------------
                        // METTRE À JOUR LE SÉJOUR
                        // -------------------------------------

                        const {
                            error: erreurSejour
                        } =
                            await supabaseClient
                                .from("sejours")
                                .update({
                                    date_arrivee_reelle:
                                        maintenant,

                                    statut:
                                        "En cours"
                                })
                                .eq(
                                    "id",
                                    sejour.id
                                );


                        if (erreurSejour) {

                            console.error(
                                "Erreur lors du check-in :",
                                erreurSejour
                            );

                            alert(
                                "Erreur lors du check-in : " +
                                erreurSejour.message
                            );

                            return;
                        }


                        // -------------------------------------
                        // CONFIRMER LA RÉSERVATION
                        // -------------------------------------

                        const {
                            error:
                                erreurReservation
                        } =
                            await supabaseClient
                                .from(
                                    "reservations"
                                )
                                .update({
                                    statut:
                                        "Confirmée"
                                })
                                .eq(
                                    "id",
                                    reservation.id
                                );


                        if (
                            erreurReservation
                        ) {

                            console.error(
                                "Erreur lors de la confirmation de la réservation :",
                                erreurReservation
                            );

                            alert(
                                "Le check-in a été enregistré, " +
                                "mais le statut de la réservation " +
                                "n'a pas pu être modifié : " +
                                erreurReservation.message
                            );

                            return;
                        }


                        // -------------------------------------
                        // MARQUER LA CHAMBRE OCCUPÉE
                        // -------------------------------------

                        const {
                            error: erreurChambre
                        } =
                            await supabaseClient
                                .from("chambres")
                                .update({
                                    statut:
                                        "Occupée"
                                })
                                .eq(
                                    "id",
                                    reservation.chambre_id
                                );


                        if (erreurChambre) {

                            console.error(
                                "Erreur lors de la mise à jour de la chambre :",
                                erreurChambre
                            );

                            alert(
                                "Le check-in et la réservation ont été mis à jour, " +
                                "mais le statut de la chambre n'a pas pu être modifié : " +
                                erreurChambre.message
                            );

                            return;
                        }


                        alert(
                            "Check-in enregistré avec succès !"
                        );


                        await chargerReservations();
                    }
                );
            }


            // =================================================
            // CHECK-OUT
            // =================================================

            const checkoutButton =
                sejourElement.querySelector(
                    ".checkout-btn"
                );


            if (checkoutButton) {

                checkoutButton.addEventListener(
                    "click",
                    async function() {

                        const confirmation =
                            confirm(
                                "Voulez-vous procéder au check-out de ce client ?"
                            );


                        if (!confirmation) {
                            return;
                        }


                        // -------------------------------------
                        // CHANGER LE STATUT DU SÉJOUR
                        // -------------------------------------

                        const {
                            error: erreurSejour
                        } =
                            await supabaseClient
                                .from("sejours")
                                .update({
                                    statut:
                                        "Check-out en cours"
                                })
                                .eq(
                                    "id",
                                    sejour.id
                                );


                        if (erreurSejour) {

                            console.error(
                                "Erreur lors du début du check-out :",
                                erreurSejour
                            );

                            alert(
                                "Impossible de commencer le check-out : " +
                                erreurSejour.message
                            );

                            return;
                        }


                        // -------------------------------------
                        // REDIRECTION VERS LA FACTURE
                        // -------------------------------------

                        window.location.href =
                            "facture.html?reservation=" +
                            reservation.id +
                            "&sejour=" +
                            sejour.id +
                            "&checkout=1";
                    }
                );
            }
        }
    );
}


// =====================================================
// RECHERCHER UN SÉJOUR
// =====================================================

rechercheSejour.addEventListener(
    "input",
    function() {

        const recherche =
            rechercheSejour.value
                .trim()
                .toLowerCase();


        const cartesSejours =
            document.querySelectorAll(
                "#sejours-list .sejour-item"
            );


        cartesSejours.forEach(
            function(carte) {

                const texteCarte =
                    carte.textContent
                        .toLowerCase();


                if (
                    texteCarte.includes(
                        recherche
                    )
                ) {

                    carte.style
                        .removeProperty(
                            "display"
                        );

                }
                else {

                    carte.style
                        .setProperty(
                            "display",
                            "none",
                            "important"
                        );
                }
            }
        );
    }
);


// =====================================================
// CHARGEMENT INITIAL
// =====================================================

chargerReservations();