// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const statistiquesContainer =
    document.getElementById(
        "statistiques-container"
    );


// =========================
// CHARGER LES STATISTIQUES
// =========================

async function chargerStatistiques() {

    // =========================
    // RÉCUPÉRER LES RÉSERVATIONS
    // =========================

    const {
        data: reservations,
        error: erreurReservations
    } =
        await supabaseClient
            .from("reservations")
            .select(`
                id,
                statut,
                chambre_id,
                chambres (
                    numero_chambre,
                    type
                )
            `);


    if (erreurReservations) {

        console.error(
            "Erreur lors de la récupération des réservations :",
            erreurReservations
        );

        statistiquesContainer.innerHTML = `
            <p>
                Impossible de charger les statistiques.
            </p>
        `;

        return;
    }


    // =========================
    // RÉCUPÉRER LES SÉJOURS
    // =========================

    const {
        data: sejours,
        error: erreurSejours
    } =
        await supabaseClient
            .from("sejours")
            .select(`
                id,
                reservation_id,
                statut,
                reservations (
                    chambre_id
                )
            `);


    if (erreurSejours) {

        console.error(
            "Erreur lors de la récupération des séjours :",
            erreurSejours
        );

        statistiquesContainer.innerHTML = `
            <p>
                Impossible de charger les statistiques des séjours.
            </p>
        `;

        return;
    }


    // =========================
    // RÉCUPÉRER LES CHAMBRES
    // =========================

    const {
        data: chambres,
        error: erreurChambres
    } =
        await supabaseClient
            .from("chambres")
            .select(
                "id, numero_chambre, type, statut"
            );


    if (erreurChambres) {

        console.error(
            "Erreur lors de la récupération des chambres :",
            erreurChambres
        );

        statistiquesContainer.innerHTML = `
            <p>
                Impossible de charger les statistiques des chambres.
            </p>
        `;

        return;
    }


    // =========================
    // RÉCUPÉRER LES FACTURES
    // =========================

    const {
        data: factures,
        error: erreurFactures
    } =
        await supabaseClient
            .from("factures")
            .select(
                "id, montant_total, statut"
            );


    if (erreurFactures) {

        console.error(
            "Erreur lors de la récupération des factures :",
            erreurFactures
        );

        statistiquesContainer.innerHTML = `
            <p>
                Impossible de charger les statistiques financières.
            </p>
        `;

        return;
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
            .select(
                "id, montant"
            );


    if (erreurPaiements) {

        console.error(
            "Erreur lors de la récupération des paiements :",
            erreurPaiements
        );

        statistiquesContainer.innerHTML = `
            <p>
                Impossible de charger les paiements.
            </p>
        `;

        return;
    }


    // ==========================================
    // STATISTIQUES DES RÉSERVATIONS
    // ==========================================

    const nombreReservations =
        reservations.length;


    const reservationsConfirmees =
        reservations.filter(
            function(reservation) {

                return (
                    reservation.statut === "Confirmée" ||
                    reservation.statut === "Terminée"
                );
            }
        ).length;


    const reservationsEnAttente =
        reservations.filter(
            function(reservation) {

                return (
                    reservation.statut ===
                    "En attente"
                );
            }
        ).length;


    const reservationsAnnulees =
        reservations.filter(
            function(reservation) {

                return (
                    reservation.statut ===
                    "Annulée"
                );
            }
        ).length;


    // =====================================
    // STATISTIQUES DES SÉJOURS
    // =====================================

    const nombreSejours =
        sejours.length;


    const sejoursEnAttente =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "En attente"
                );
            }
        ).length;


    const sejoursEnCours =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "En cours"
                );
            }
        ).length;


    const sejoursCheckoutEnCours =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "Check-out en cours"
                );
            }
        ).length;


    const sejoursTermines =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "Terminé"
                );
            }
        ).length;


    const sejoursAnnules =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "Annulé"
                );
            }
        ).length;


    // =====================================
    // STATISTIQUES DES CHAMBRES
    // =====================================

    const nombreChambres =
        chambres.length;


    const chambresOccupees =
        chambres.filter(
            function(chambre) {

                return (
                    chambre.statut ===
                    "Occupée"
                );
            }
        ).length;


    const chambresHorsService =
        chambres.filter(
            function(chambre) {

                return (
                    chambre.statut ===
                    "Hors service"
                );
            }
        ).length;


    const chambresExploitables =
        nombreChambres -
        chambresHorsService;


    let tauxOccupation =
        0;


    if (
        chambresExploitables > 0
    ) {

        tauxOccupation =
            (
                chambresOccupees /
                chambresExploitables
            ) *
            100;
    }


    // =====================================
    // CHAMBRES LES PLUS RÉSERVÉES
    // =====================================

    const reservationsParChambre =
        {};


    reservations.forEach(
        function(reservation) {

            if (
                reservation.statut ===
                    "Annulée" ||
                !reservation.chambre_id
            ) {

                return;
            }


            if (
                !reservationsParChambre[
                    reservation.chambre_id
                ]
            ) {

                reservationsParChambre[
                    reservation.chambre_id
                ] = 0;
            }


            reservationsParChambre[
                reservation.chambre_id
            ]++;
        }
    );


    const chambresClassees =
        chambres
            .map(
                function(chambre) {

                    return {
                        id:
                            chambre.id,

                        numero:
                            chambre.numero_chambre,

                        type:
                            chambre.type,

                        nombreReservations:
                            reservationsParChambre[
                                chambre.id
                            ] || 0
                    };
                }
            )
            .sort(
                function(a, b) {

                    return (
                        b.nombreReservations -
                        a.nombreReservations
                    );
                }
            );


    // =========================
    // STATISTIQUES FINANCIÈRES
    // =========================

    const chiffreAffaires =
        factures.reduce(
            function(total, facture) {

                return (
                    total +
                    Number(
                        facture.montant_total
                    )
                );
            },
            0
        );


    const montantEncaisse =
        paiements.reduce(
            function(total, paiement) {

                return (
                    total +
                    Number(
                        paiement.montant
                    )
                );
            },
            0
        );


    const resteAPayer =
        Math.max(
            chiffreAffaires -
            montantEncaisse,
            0
        );


    const nombreFactures =
        factures.length;


    const facturesPayees =
        factures.filter(
            function(facture) {

                return (
                    facture.statut ===
                    "Payée"
                );
            }
        ).length;


    const facturesAvecAcompte =
        factures.filter(
            function(facture) {

                return (
                    facture.statut ===
                    "Acompte payé"
                );
            }
        ).length;


    const facturesEnAttente =
        factures.filter(
            function(facture) {

                return (
                    facture.statut ===
                    "En attente"
                );
            }
        ).length;


// =========================
// AFFICHER
// =========================

statistiquesContainer.innerHTML = `


    <!-- =====================================
         INDICATEURS PRINCIPAUX
    ====================================== -->

    <section class="stats-kpi-grid">


        <!-- TOTAL RÉSERVATIONS -->

        <article class="stats-kpi-card">

            <div class="stats-kpi-icon">

                <i class="fa-solid fa-calendar-days"></i>

            </div>


            <div class="stats-kpi-content">

                <span>
                    Total des réservations
                </span>

                <strong>
                    ${nombreReservations}
                </strong>

            </div>

        </article>


        <!-- TAUX D'OCCUPATION -->

        <article class="stats-kpi-card">

            <div class="stats-kpi-icon">

                <i class="fa-solid fa-chart-pie"></i>

            </div>


            <div class="stats-kpi-content">

                <span>
                    Taux d'occupation
                </span>

                <strong>
                    ${tauxOccupation.toFixed(2)} %
                </strong>

            </div>

        </article>


        <!-- MONTANT ENCAISSÉ -->

        <article class="stats-kpi-card">

            <div class="stats-kpi-icon">

                <i class="fa-solid fa-coins"></i>

            </div>


            <div class="stats-kpi-content">

                <span>
                    Montant encaissé
                </span>

                <strong class="stats-kpi-money">

                    ${montantEncaisse.toLocaleString("fr-FR")}

                    <small>
                        FCFA
                    </small>

                </strong>

            </div>

        </article>


        <!-- RESTE À PAYER -->

        <article class="stats-kpi-card">

            <div class="stats-kpi-icon">

                <i class="fa-solid fa-wallet"></i>

            </div>


            <div class="stats-kpi-content">

                <span>
                    Reste à payer
                </span>

                <strong class="stats-kpi-money">

                    ${resteAPayer.toLocaleString("fr-FR")}

                    <small>
                        FCFA
                    </small>

                </strong>

            </div>

        </article>


    </section>


    <!-- =====================================
         RÉSERVATIONS / SÉJOURS / CHAMBRES
    ====================================== -->

    <section class="stats-main-grid">


        <!-- =========================
             RÉSERVATIONS
        ========================== -->

        <article class="stats-dashboard-card">


            <div class="stats-card-header">

                <div class="stats-card-title">

                    <i class="fa-solid fa-calendar-check"></i>

                    <h2>
                        Réservations
                    </h2>

                </div>


                <span class="stats-total-badge">

                    Total :

                    <strong>
                        ${nombreReservations}
                    </strong>

                </span>

            </div>


            <div class="stats-card-list">


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-success"></span>

                        Réservations confirmées

                    </div>

                    <strong>
                        ${reservationsConfirmees}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-warning"></span>

                        En attente

                    </div>

                    <strong>
                        ${reservationsEnAttente}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-danger"></span>

                        Annulées

                    </div>

                    <strong>
                        ${reservationsAnnulees}
                    </strong>

                </div>


            </div>


            <i class="fa-regular fa-calendar stats-card-watermark"></i>


        </article>


        <!-- =========================
             SÉJOURS
        ========================== -->

        <article class="stats-dashboard-card">


            <div class="stats-card-header">

                <div class="stats-card-title">

                    <i class="fa-solid fa-bed"></i>

                    <h2>
                        Séjours
                    </h2>

                </div>


                <span class="stats-total-badge">

                    Total :

                    <strong>
                        ${nombreSejours}
                    </strong>

                </span>

            </div>


            <div class="stats-card-list">


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-warning"></span>

                        En attente

                    </div>

                    <strong>
                        ${sejoursEnAttente}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-info"></span>

                        En cours

                    </div>

                    <strong>
                        ${sejoursEnCours}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-success"></span>

                        Check-out en cours

                    </div>

                    <strong>
                        ${sejoursCheckoutEnCours}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-neutral"></span>

                        Terminés

                    </div>

                    <strong>
                        ${sejoursTermines}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-danger"></span>

                        Annulés

                    </div>

                    <strong>
                        ${sejoursAnnules}
                    </strong>

                </div>


            </div>


            <i class="fa-solid fa-bed stats-card-watermark"></i>


        </article>


        <!-- =========================
             CHAMBRES
        ========================== -->

        <article class="stats-dashboard-card">


            <div class="stats-card-header">

                <div class="stats-card-title">

                    <i class="fa-solid fa-door-open"></i>

                    <h2>
                        Chambres
                    </h2>

                </div>


                <span class="stats-total-badge">

                    Total :

                    <strong>
                        ${nombreChambres}
                    </strong>

                </span>

            </div>


            <div class="stats-card-list">


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-success"></span>

                        Chambres exploitables

                    </div>

                    <strong>
                        ${chambresExploitables}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-info"></span>

                        Chambres occupées

                    </div>

                    <strong>
                        ${chambresOccupees}
                    </strong>

                </div>


                <div class="stats-list-row">

                    <div>

                        <span class="stats-dot stats-dot-danger"></span>

                        Chambres hors service

                    </div>

                    <strong>
                        ${chambresHorsService}
                    </strong>

                </div>


                <div class="stats-occupation-row">

                    <div>

                        <i class="fa-solid fa-percent"></i>

                        Taux d'occupation

                    </div>

                    <strong>
                        ${tauxOccupation.toFixed(2)} %
                    </strong>

                </div>


            </div>


            <i class="fa-solid fa-door-open stats-card-watermark"></i>


        </article>


    </section>


    <!-- =====================================
         FINANCES + CLASSEMENT
    ====================================== -->

    <section class="stats-bottom-grid">


        <!-- =========================
             FINANCES
        ========================== -->

        <article class="stats-dashboard-card stats-finances-card">


            <div class="stats-card-header">

                <div class="stats-card-title">

                    <i class="fa-solid fa-coins"></i>

                    <h2>
                        Finances
                    </h2>

                </div>

            </div>


            <div class="stats-finances-grid">


                <!-- CA -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-chart-column"></i>

                    </div>

                    <div>

                        <span>
                            Chiffre d'affaires total
                        </span>

                        <strong>

                            ${chiffreAffaires.toLocaleString("fr-FR")}

                            <small>
                                FCFA
                            </small>

                        </strong>

                    </div>

                </div>


                <!-- ENCAISSÉ -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-money-bill-transfer"></i>

                    </div>

                    <div>

                        <span>
                            Montant encaissé
                        </span>

                        <strong>

                            ${montantEncaisse.toLocaleString("fr-FR")}

                            <small>
                                FCFA
                            </small>

                        </strong>

                    </div>

                </div>


                <!-- RESTE -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-wallet"></i>

                    </div>

                    <div>

                        <span>
                            Reste à payer
                        </span>

                        <strong>

                            ${resteAPayer.toLocaleString("fr-FR")}

                            <small>
                                FCFA
                            </small>

                        </strong>

                    </div>

                </div>


                <!-- FACTURES -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-file-invoice"></i>

                    </div>

                    <div>

                        <span>
                            Nombre de factures
                        </span>

                        <strong>
                            ${nombreFactures}
                        </strong>

                    </div>

                </div>


                <!-- PAYÉES -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-circle-check"></i>

                    </div>

                    <div>

                        <span>
                            Factures payées
                        </span>

                        <strong>
                            ${facturesPayees}
                        </strong>

                    </div>

                </div>


                <!-- ACOMPTE -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-solid fa-circle-half-stroke"></i>

                    </div>

                    <div>

                        <span>
                            Factures avec acompte
                        </span>

                        <strong>
                            ${facturesAvecAcompte}
                        </strong>

                    </div>

                </div>


                <!-- EN ATTENTE -->

                <div class="stats-finance-item">

                    <div class="stats-finance-icon">

                        <i class="fa-regular fa-clock"></i>

                    </div>

                    <div>

                        <span>
                            Factures en attente
                        </span>

                        <strong>
                            ${facturesEnAttente}
                        </strong>

                    </div>

                </div>


            </div>


        </article>


        <!-- =========================
             CHAMBRES LES PLUS RÉSERVÉES
        ========================== -->

        <article class="stats-dashboard-card stats-ranking-card">


            <div class="stats-card-header">

                <div class="stats-card-title">

                    <i class="fa-solid fa-chart-column"></i>

                    <h2>
                        Chambres les plus réservées
                    </h2>

                </div>

            </div>


            <div class="stats-ranking-list">


                ${
                    chambresClassees.length === 0

                        ? `

                            <div class="stats-ranking-empty">

                                <i class="fa-solid fa-bed"></i>

                                <span>
                                    Aucune réservation enregistrée.
                                </span>

                            </div>

                        `

                        : chambresClassees
                            .slice(
                                0,
                                3
                            )
                            .map(
                                function(
                                    chambre,
                                    index
                                ) {

                                    return `

                                        <div class="stats-ranking-row">

                                            <span class="stats-ranking-position">
                                                ${index + 1}
                                            </span>


                                            <div class="stats-ranking-room">

                                                <strong>
                                                    Chambre ${chambre.numero}
                                                </strong>

                                                <span>
                                                    ${chambre.type}
                                                </span>

                                            </div>


                                            <strong class="stats-ranking-value">

                                                ${chambre.nombreReservations}

                                                <small>
                                                    réservation${chambre.nombreReservations > 1 ? "s" : ""}
                                                </small>

                                            </strong>

                                        </div>

                                    `;
                                }
                            )
                            .join("")
                }


            </div>


            <div class="stats-ranking-quote">

                <i class="fa-solid fa-quote-left"></i>

                <span>
                    Ces chambres sont les plus demandées
                    par nos clients.
                </span>

            </div>


        </article>


    </section>

`;
}


// =========================
// CHARGEMENT INITIAL
// =========================

chargerStatistiques();