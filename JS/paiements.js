// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const facturesList =
    document.getElementById(
        "factures-list"
    );


// =========================
// CHARGER LES FACTURES
// =========================

async function chargerFactures() {

    facturesList.innerHTML =
        "Chargement des factures...";


    // =========================
    // RÉCUPÉRER LES FACTURES
    // =========================

    const {
        data: factures,
        error
    } =
        await supabaseClient
            .from("factures")
            .select(`
                id,
                numero_facture,
                date_facture,
                montant_total,
                statut,
                reservation_id,
                sejour_id
            `)
            .order(
                "date_facture",
                {
                    ascending: false
                }
            );


    // =========================
    // ERREUR FACTURES
    // =========================

    if (error) {

        console.error(
            "Erreur lors du chargement des factures :",
            error
        );

        facturesList.innerHTML =
            "<p>Impossible de charger les factures.</p>";

        return;
    }


    // =========================
    // AUCUNE FACTURE
    // =========================

    if (
        !factures ||
        factures.length === 0
    ) {

        facturesList.innerHTML =
            "<p>Aucune facture disponible.</p>";

        return;
    }


    // =========================
    // VIDER LA LISTE
    // =========================

    facturesList.innerHTML =
        "";


    // =========================
    // AFFICHER CHAQUE FACTURE
    // =========================

    for (const facture of factures) {

        // =========================
        // RÉCUPÉRER LA RÉSERVATION
        // =========================

        const {
            data: reservation,
            error: erreurReservation
        } =
            await supabaseClient
                .from("reservations")
                .select(`
                    date_arrivee,
                    date_depart,
                    clients (
                        nom,
                        prenom
                    ),
                    chambres (
                        numero_chambre,
                        type
                    )
                `)
                .eq(
                    "id",
                    facture.reservation_id
                )
                .single();


        if (erreurReservation) {

            console.error(
                "Erreur réservation pour la facture " +
                facture.numero_facture +
                " :",
                erreurReservation
            );
        }


        // =========================
        // RÉCUPÉRER LES PAIEMENTS
        // =========================

        const {
            data: paiements,
            error: erreurPaiements
        } =
            await supabaseClient
                .from("paiements")
                .select(`
                    montant,
                    mode_Paiement,
                    date_Paiement
                `)
                .eq(
                    "facture_id",
                    facture.id
                )
                .order(
                    "date_Paiement",
                    {
                        ascending: false
                    }
                );


        // =========================
        // ERREUR PAIEMENTS
        // =========================

        if (erreurPaiements) {

            console.error(
                "Erreur paiements pour la facture " +
                facture.numero_facture +
                " :",
                erreurPaiements
            );

            continue;
        }


        // =========================
        // CALCUL DU TOTAL PAYÉ
        // =========================

        const montantPaye =
            paiements
                ? paiements.reduce(
                    function(
                        total,
                        paiement
                    ) {

                        return (
                            total +
                            Number(
                                paiement.montant
                            )
                        );
                    },
                    0
                )
                : 0;


        // =========================
        // CALCUL DU RESTE
        // =========================

        const montantTotal =
            Number(
                facture.montant_total
            );


        const resteAPayer =
            montantTotal -
            montantPaye;


        // =========================
        // INFORMATIONS CLIENT
        // =========================

        let clientNom =
            "Inconnu";


        if (
            reservation &&
            reservation.clients
        ) {

            clientNom =
                reservation.clients.nom +
                " " +
                reservation.clients.prenom;
        }


        // =========================
        // INFORMATIONS CHAMBRE
        // =========================

        let chambreInfo =
            "Inconnue";


        if (
            reservation &&
            reservation.chambres
        ) {

            chambreInfo =
                reservation.chambres.numero_chambre +
                " - " +
                reservation.chambres.type;
        }


        // =========================
        // DATE D'ARRIVÉE
        // =========================

        let dateArrivee =
            "Inconnue";


        if (
            reservation &&
            reservation.date_arrivee
        ) {

            dateArrivee =
                new Date(
                    reservation.date_arrivee
                ).toLocaleDateString(
                    "fr-FR"
                );
        }


        // =========================
        // DATE DE DÉPART
        // =========================

        let dateDepart =
            "Inconnue";


        if (
            reservation &&
            reservation.date_depart
        ) {

            dateDepart =
                new Date(
                    reservation.date_depart
                ).toLocaleDateString(
                    "fr-FR"
                );
        }


        // =========================
        // DATE DE FACTURE
        // =========================

        let dateFactureFormatee =
            "Inconnue";


        if (facture.date_facture) {

            dateFactureFormatee =
                new Date(
                    facture.date_facture
                ).toLocaleDateString(
                    "fr-FR"
                );
        }


        // =========================
        // STATUT DE LA FACTURE
        // =========================

        let classeStatut =
            "status-attente";


        if (
            facture.statut ===
            "Acompte payé"
        ) {

            classeStatut =
                "status-checkout";

        }
        else if (
            facture.statut ===
            "Payée"
        ) {

            classeStatut =
                "status-terminee";
        }


        // =========================
        // CRÉER LA FACTURE
        // =========================

        const factureElement =
            document.createElement(
                "div"
            );


        factureElement.classList.add(
            "reservation-item"
        );


        factureElement.innerHTML = `

            <div class="facture-card-header">

                <div>

                    <span class="reservation-card-label">
                        Facture
                    </span>

                    <h3>
                        ${facture.numero_facture}
                    </h3>

                    <p class="facture-id">

                        <strong>
                            ID facture :
                        </strong>

                        ${facture.id}

                    </p>

                    <p class="sejour-id">

                        <strong>
                            ID séjour :
                        </strong>

                        ${facture.sejour_id || "Non disponible"}

                    </p>

                </div>


                <span class="status-badge ${classeStatut}">
                    ${facture.statut}
                </span>

            </div>


            <div class="facture-card-info">

                <p>
                    <strong>Date de facture :</strong>
                    ${dateFactureFormatee}
                </p>

                <p>
                    <strong>Client :</strong>
                    ${clientNom}
                </p>

                <p>
                    <strong>Chambre :</strong>
                    ${chambreInfo}
                </p>

                <p>
                    <strong>Date d'arrivée :</strong>
                    ${dateArrivee}
                </p>

                <p>
                    <strong>Date de départ :</strong>
                    ${dateDepart}
                </p>

            </div>


            <div class="facture-finance">

                <div class="facture-montant">

                    <span>
                        Montant total
                    </span>

                    <strong>
                        ${montantTotal.toLocaleString("fr-FR")}
                        FCFA
                    </strong>

                </div>


                <div class="facture-montant">

                    <span>
                        Montant payé
                    </span>

                    <strong>
                        ${montantPaye.toLocaleString("fr-FR")}
                        FCFA
                    </strong>

                </div>


                <div class="facture-montant">

                    <span>
                        Reste à payer
                    </span>

                    <strong>
                        ${Math.max(
                            resteAPayer,
                            0
                        ).toLocaleString("fr-FR")}
                        FCFA
                    </strong>

                </div>

            </div>


            <div class="paiements-history">

                <h4>

                    <i class="fa-solid fa-clock-rotate-left"></i>

                    Paiements effectués

                </h4>

            </div>
        `;


        // =========================
        // AFFICHER LES PAIEMENTS
        // =========================

        if (
            !paiements ||
            paiements.length === 0
        ) {

            const aucunPaiement =
                document.createElement(
                    "p"
                );


            aucunPaiement.innerHTML =
                "<em>Aucun paiement effectué pour cette facture.</em>";


            factureElement.appendChild(
                aucunPaiement
            );

        }
        else {

            for (
                const paiement
                of paiements
            ) {

                let datePaiementFormatee =
                    "Inconnue";


                if (
                    paiement.date_Paiement
                ) {

                    datePaiementFormatee =
                        new Date(
                            paiement.date_Paiement
                        ).toLocaleDateString(
                            "fr-FR"
                        );
                }


                const paiementElement =
                    document.createElement(
                        "div"
                    );


                paiementElement.classList.add(
                    "paiement-item"
                );


                paiementElement.innerHTML = `

                    <div class="paiement-item-icon">

                        <i class="fa-solid fa-money-bill-wave"></i>

                    </div>


                    <div class="paiement-item-info">

                        <p>

                            <strong>

                                ${Number(
                                    paiement.montant
                                ).toLocaleString("fr-FR")}
                                FCFA

                            </strong>

                        </p>

                        <span>

                            ${paiement.mode_Paiement || "Non renseigné"}

                            •

                            ${datePaiementFormatee}

                        </span>

                    </div>
                `;


                factureElement.appendChild(
                    paiementElement
                );
            }
        }


        // =========================
        // AJOUTER À LA LISTE
        // =========================

        facturesList.appendChild(
            factureElement
        );
    }
}


// =========================
// CHARGEMENT INITIAL
// =========================

chargerFactures();