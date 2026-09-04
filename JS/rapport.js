// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const rapportContainer =
    document.getElementById(
        "rapport-container"
    );


// =========================
// DONNÉES DU RAPPORT
// =========================

let donneesRapport = null;


// =========================
// CHARGER LE RAPPORT
// =========================

async function chargerRapport() {

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

        rapportContainer.innerHTML = `
            <p>
                Impossible de charger les données des réservations.
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

        rapportContainer.innerHTML = `
            <p>
                Impossible de charger les données des séjours.
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

        rapportContainer.innerHTML = `
            <p>
                Impossible de charger les données des chambres.
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

        rapportContainer.innerHTML = `
            <p>
                Impossible de charger les données financières.
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

        rapportContainer.innerHTML = `
            <p>
                Impossible de charger les données des paiements.
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


    // =========================
    // TAUX DE CONFIRMATION
    // =========================

    let tauxConfirmation =
        0;


    if (nombreReservations > 0) {

        tauxConfirmation =
            (
                reservationsConfirmees /
                nombreReservations
            ) *
            100;
    }


    // ==========================================
    // STATISTIQUES DES SÉJOURS
    // ==========================================

    const nombreSejours =
        sejours.length;


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


    const sejoursEnAttente =
        sejours.filter(
            function(sejour) {

                return (
                    sejour.statut ===
                    "En attente"
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


    // ==========================================
    // STATISTIQUES DES CHAMBRES
    // ==========================================

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


    const chambresDisponiblesPourOccupation =
        nombreChambres -
        chambresHorsService;


    let tauxOccupation =
        0;


    if (
        chambresDisponiblesPourOccupation >
        0
    ) {

        tauxOccupation =
            (
                chambresOccupees /
                chambresDisponiblesPourOccupation
            ) *
            100;
    }


    // ==========================================
    // CHAMBRES LES PLUS RÉSERVÉES
    // ==========================================

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


    // ==========================================
    // STATISTIQUES FINANCIÈRES
    // ==========================================

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


    // ==========================================
    // TOP 3 DES CHAMBRES
    // ==========================================

    const topChambres =
        chambresClassees.slice(
            0,
            3
        );


    // ==========================================
    // RECOMMANDATIONS
    // ==========================================

    const recommandations =
        [];


    if (
        reservationsEnAttente > 0
    ) {

        recommandations.push(
            `Traiter en priorité les
            ${reservationsEnAttente}
            réservation(s) en attente
            afin d'améliorer le taux de
            confirmation.`
        );
    }


    if (
        montantEncaisse <
        chiffreAffaires
    ) {

        recommandations.push(
            `Effectuer un suivi des paiements
            afin de réduire le reste à payer
            de ${resteAPayer.toLocaleString("fr-FR")}
            FCFA.`
        );
    }


    if (
        tauxOccupation < 50
    ) {

        recommandations.push(
            `Mettre en place des offres
            promotionnelles afin
            d'améliorer le taux
            d'occupation actuel.`
        );
    }


    if (
        recommandations.length === 0
    ) {

        recommandations.push(
            `Les principaux indicateurs
            présentent une situation
            satisfaisante. Il est recommandé
            de poursuivre le suivi régulier
            des performances.`
        );
    }


    // =========================
    // STOCKER LES DONNÉES
    // =========================

    donneesRapport = {

        nombreReservations,
        reservationsConfirmees,
        reservationsEnAttente,
        reservationsAnnulees,

        tauxConfirmation,

        nombreSejours,
        sejoursEnCours,
        sejoursCheckoutEnCours,
        sejoursTermines,
        sejoursEnAttente,
        sejoursAnnules,

        nombreChambres,
        chambresOccupees,
        chambresHorsService,
        tauxOccupation,

        topChambres,

        chiffreAffaires,
        montantEncaisse,
        resteAPayer,

        nombreFactures,
        facturesPayees,
        facturesAvecAcompte,

        recommandations
    };


    // ==========================================
    // AFFICHER LE RAPPORT
    // ==========================================

    rapportContainer.innerHTML = `

        <div id="rapport-a-imprimer">


            <!-- =========================
                 EN-TÊTE DU RAPPORT
            ========================== -->

            <div class="rapport-document-header">

                <div>

                    <span class="rapport-document-label">
                        TERANGA PALACE
                    </span>

                    <h1>
                        Rapport d'activité
                    </h1>

                    <p>
                        Synthèse statistique et financière
                    </p>

                </div>


                <div class="rapport-date">

                    <i class="fa-solid fa-calendar-days"></i>

                    <div>

                        <span>
                            Date du rapport
                        </span>

                        <strong>
                            ${new Date().toLocaleDateString("fr-FR")}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- =========================
                 INFORMATIONS
            ========================== -->

            <div class="rapport-informations">

                <div>

                    <span>
                        Établissement
                    </span>

                    <strong>
                        Hôtel Teranga Palace
                    </strong>

                </div>


                <div>

                    <span>
                        Objet
                    </span>

                    <strong>
                        État des réservations, de l'occupation
                        et de la situation financière
                    </strong>

                </div>

            </div>


            <!-- =========================
                 INDICATEURS PRINCIPAUX
            ========================== -->

            <div class="rapport-kpis">

                <div class="rapport-kpi">

                    <div class="rapport-kpi-icon">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>

                    <div>

                        <span>
                            Réservations
                        </span>

                        <strong>
                            ${nombreReservations}
                        </strong>

                    </div>

                </div>


                <div class="rapport-kpi">

                    <div class="rapport-kpi-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                    <div>

                        <span>
                            Taux de confirmation
                        </span>

                        <strong>
                            ${tauxConfirmation.toFixed(1)} %
                        </strong>

                    </div>

                </div>


                <div class="rapport-kpi">

                    <div class="rapport-kpi-icon">
                        <i class="fa-solid fa-bed"></i>
                    </div>

                    <div>

                        <span>
                            Taux d'occupation
                        </span>

                        <strong>
                            ${tauxOccupation.toFixed(2)} %
                        </strong>

                    </div>

                </div>


                <div class="rapport-kpi">

                    <div class="rapport-kpi-icon">
                        <i class="fa-solid fa-coins"></i>
                    </div>

                    <div>

                        <span>
                            Chiffre d'affaires
                        </span>

                        <strong class="rapport-kpi-money">
                            ${chiffreAffaires.toLocaleString("fr-FR")}
                            FCFA
                        </strong>

                    </div>

                </div>

            </div>


            <!-- =========================
                 1. VUE D'ENSEMBLE
            ========================== -->

            <section class="rapport-section">

                <div class="rapport-section-heading">

                    <span>
                        01
                    </span>

                    <div>

                        <h2>
                            Vue d'ensemble de l'activité
                        </h2>

                        <p>
                            Synthèse générale des indicateurs principaux.
                        </p>

                    </div>

                </div>


                <p>
                    L'analyse des données actuelles
                    de l'Hôtel Teranga Palace permet
                    d'établir l'état des réservations,
                    des séjours, de l'occupation
                    et de la situation financière
                    de l'établissement.
                </p>


                <div class="rapport-summary-grid">

                    <div>

                        <span>
                            Nombre total de réservations
                        </span>

                        <strong>
                            ${nombreReservations}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Réservations confirmées
                        </span>

                        <strong>
                            ${reservationsConfirmees}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Taux de confirmation
                        </span>

                        <strong>
                            ${tauxConfirmation.toFixed(1)} %
                        </strong>

                    </div>


                    <div>

                        <span>
                            Chiffre d'affaires
                        </span>

                        <strong>
                            ${chiffreAffaires.toLocaleString("fr-FR")}
                            FCFA
                        </strong>

                    </div>

                </div>

            </section>


            <!-- =========================
                 2. RÉSERVATIONS ET SÉJOURS
            ========================== -->

            <section class="rapport-section">

                <div class="rapport-section-heading">

                    <span>
                        02
                    </span>

                    <div>

                        <h2>
                            Réservations et séjours
                        </h2>

                        <p>
                            Analyse du cycle de réservation
                            et du suivi des séjours.
                        </p>

                    </div>

                </div>


                <div class="rapport-two-columns">


                    <div class="rapport-subsection">

                        <h3>
                            <i class="fa-solid fa-calendar-days"></i>
                            État des réservations
                        </h3>


                        <div class="rapport-line">

                            <span>
                                Confirmées
                            </span>

                            <strong>

                                ${reservationsConfirmees}

                                <small>

                                    ${
                                        nombreReservations > 0

                                            ? (
                                                (
                                                    reservationsConfirmees /
                                                    nombreReservations
                                                ) *
                                                100
                                            ).toFixed(1)

                                            : "0.0"
                                    } %

                                </small>

                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                En attente
                            </span>

                            <strong>

                                ${reservationsEnAttente}

                                <small>

                                    ${
                                        nombreReservations > 0

                                            ? (
                                                (
                                                    reservationsEnAttente /
                                                    nombreReservations
                                                ) *
                                                100
                                            ).toFixed(1)

                                            : "0.0"
                                    } %

                                </small>

                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Annulées
                            </span>

                            <strong>

                                ${reservationsAnnulees}

                                <small>

                                    ${
                                        nombreReservations > 0

                                            ? (
                                                (
                                                    reservationsAnnulees /
                                                    nombreReservations
                                                ) *
                                                100
                                            ).toFixed(1)

                                            : "0.0"
                                    } %

                                </small>

                            </strong>

                        </div>

                    </div>


                    <div class="rapport-subsection">

                        <h3>
                            <i class="fa-solid fa-suitcase"></i>
                            Suivi des séjours
                        </h3>


                        <div class="rapport-line">

                            <span>
                                En cours
                            </span>

                            <strong>
                                ${sejoursEnCours}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Check-out en cours
                            </span>

                            <strong>
                                ${sejoursCheckoutEnCours}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Terminés
                            </span>

                            <strong>
                                ${sejoursTermines}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                En attente
                            </span>

                            <strong>
                                ${sejoursEnAttente}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Annulés
                            </span>

                            <strong>
                                ${sejoursAnnules}
                            </strong>

                        </div>


                        <div class="rapport-line rapport-line-total">

                            <span>
                                Total des séjours
                            </span>

                            <strong>
                                ${nombreSejours}
                            </strong>

                        </div>

                    </div>


                </div>

            </section>


            <!-- =========================
                 3. HÉBERGEMENT
            ========================== -->

            <section class="rapport-section">

                <div class="rapport-section-heading">

                    <span>
                        03
                    </span>

                    <div>

                        <h2>
                            Performance des hébergements
                        </h2>

                        <p>
                            État des chambres et niveau d'occupation.
                        </p>

                    </div>

                </div>


                <div class="rapport-summary-grid">

                    <div>

                        <span>
                            Total des chambres
                        </span>

                        <strong>
                            ${nombreChambres}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Chambres occupées
                        </span>

                        <strong>
                            ${chambresOccupees}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Hors service
                        </span>

                        <strong>
                            ${chambresHorsService}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Taux d'occupation
                        </span>

                        <strong>
                            ${tauxOccupation.toFixed(2)} %
                        </strong>

                    </div>

                </div>


                <div class="rapport-ranking">

                    <h3>
                        <i class="fa-solid fa-ranking-star"></i>
                        Chambres les plus sollicitées
                    </h3>


                    ${
                        topChambres.length === 0

                            ? `
                                <p>
                                    Aucune réservation enregistrée.
                                </p>
                            `

                            : topChambres
                                .map(
                                    function(
                                        chambre,
                                        index
                                    ) {

                                        return `

                                            <div class="rapport-ranking-item">

                                                <span class="rapport-ranking-number">
                                                    ${index + 1}
                                                </span>

                                                <div>

                                                    <strong>
                                                        Chambre ${chambre.numero}
                                                    </strong>

                                                    <span>
                                                        ${chambre.type}
                                                    </span>

                                                </div>

                                                <strong>
                                                    ${chambre.nombreReservations}
                                                    réservation(s)
                                                </strong>

                                            </div>
                                        `;
                                    }
                                )
                                .join("")
                    }

                </div>

            </section>


            <!-- =========================
                 4. FINANCES
            ========================== -->

            <section class="rapport-section">

                <div class="rapport-section-heading">

                    <span>
                        04
                    </span>

                    <div>

                        <h2>
                            Situation financière
                        </h2>

                        <p>
                            Suivi du chiffre d'affaires,
                            des encaissements et de la facturation.
                        </p>

                    </div>

                </div>


                <div class="rapport-finance-grid">

                    <div class="rapport-finance-card">

                        <span>
                            Chiffre d'affaires total
                        </span>

                        <strong>
                            ${chiffreAffaires.toLocaleString("fr-FR")}
                            FCFA
                        </strong>

                    </div>


                    <div class="rapport-finance-card">

                        <span>
                            Montant encaissé
                        </span>

                        <strong>
                            ${montantEncaisse.toLocaleString("fr-FR")}
                            FCFA
                        </strong>

                    </div>


                    <div class="rapport-finance-card">

                        <span>
                            Reste à payer
                        </span>

                        <strong>
                            ${resteAPayer.toLocaleString("fr-FR")}
                            FCFA
                        </strong>

                    </div>

                </div>


                <div class="rapport-two-columns">

                    <div class="rapport-subsection">

                        <h3>
                            <i class="fa-solid fa-file-invoice"></i>
                            Facturation
                        </h3>


                        <div class="rapport-line">

                            <span>
                                Nombre de factures
                            </span>

                            <strong>
                                ${nombreFactures}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Factures payées
                            </span>

                            <strong>
                                ${facturesPayees}
                            </strong>

                        </div>


                        <div class="rapport-line">

                            <span>
                                Factures avec acompte
                            </span>

                            <strong>
                                ${facturesAvecAcompte}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            <!-- =========================
                 5. RECOMMANDATIONS
            ========================== -->

            <section class="rapport-section">

                <div class="rapport-section-heading">

                    <span>
                        05
                    </span>

                    <div>

                        <h2>
                            Recommandations
                        </h2>

                        <p>
                            Axes d'amélioration identifiés
                            à partir des données actuelles.
                        </p>

                    </div>

                </div>


                <div class="rapport-recommandations">

                    ${
                        recommandations
                            .map(
                                function(
                                    recommandation,
                                    index
                                ) {

                                    return `

                                        <div class="rapport-recommandation">

                                            <span>
                                                ${index + 1}
                                            </span>

                                            <p>
                                                ${recommandation}
                                            </p>

                                        </div>
                                    `;
                                }
                            )
                            .join("")
                    }

                </div>

            </section>


            <!-- =========================
                 PIED DE PAGE
            ========================== -->

            <div class="rapport-footer">

                <i class="fa-solid fa-chart-simple"></i>

                <p>
                    Rapport généré automatiquement à partir
                    des données du système de gestion
                    de l'Hôtel Teranga Palace.
                </p>

            </div>


        </div>
    `;
}


// =========================
// TÉLÉCHARGER LE RAPPORT PDF
// =========================

async function telechargerRapportPDF() {

    if (!donneesRapport) {

        alert(
            "Le rapport n'est pas encore prêt."
        );

        return;
    }


    const { jsPDF } =
        window.jspdf;


    const pdf =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );


    // =========================
    // DIMENSIONS
    // =========================

    const margeGauche =
        20;

    const margeDroite =
        20;


    const largeurPage =
        pdf.internal.pageSize
            .getWidth();


    const hauteurPage =
        pdf.internal.pageSize
            .getHeight();


    const largeurTexte =
        largeurPage -
        margeGauche -
        margeDroite;


    let y =
        20;


    // =========================
    // VÉRIFIER L'ESPACE
    // =========================

    function verifierEspace(
        hauteurNecessaire = 10
    ) {

        if (
            y + hauteurNecessaire >
            hauteurPage - 20
        ) {

            pdf.addPage();

            y = 20;
        }
    }


    // =========================
    // ÉCRIRE DU TEXTE
    // =========================

    function ecrireTexte(
        texte,
        taille = 11,
        gras = false
    ) {

        verifierEspace(10);


        pdf.setFont(
            "helvetica",
            gras
                ? "bold"
                : "normal"
        );


        pdf.setFontSize(
            taille
        );


        const lignes =
            pdf.splitTextToSize(
                texte,
                largeurTexte
            );


        pdf.text(
            lignes,
            margeGauche,
            y
        );


        y +=
            (
                lignes.length *
                6
            ) +
            3;
    }


    // =========================
    // TITRE PRINCIPAL
    // =========================

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        16
    );


    const titre =
        "RAPPORT D'ACTIVITE ET DE SYNTHESE STATISTIQUE";


    const lignesTitre =
        pdf.splitTextToSize(
            titre,
            largeurTexte
        );


    pdf.text(
        lignesTitre,
        margeGauche,
        y
    );


    y +=
        (
            lignesTitre.length *
            8
        ) +
        5;


    // =========================
    // INFORMATIONS
    // =========================

    ecrireTexte(
        "Etablissement : Hotel Teranga Palace",
        11,
        true
    );


    ecrireTexte(
        "Objet : Etat des lieux des reservations, de l'occupation et du chiffre d'affaires",
        11
    );


    ecrireTexte(
        "Date du rapport : " +
        new Date()
            .toLocaleDateString(
                "fr-FR"
            ),
        11
    );


    y += 5;


    // =========================
    // 1. VUE D'ENSEMBLE
    // =========================

    ecrireTexte(
        "1. VUE D'ENSEMBLE DE L'ACTIVITE",
        14,
        true
    );


    ecrireTexte(
        "Nombre total de reservations : " +
        donneesRapport.nombreReservations
    );


    ecrireTexte(
        "Taux de confirmation : " +
        donneesRapport.tauxConfirmation.toFixed(1) +
        " % (" +
        donneesRapport.reservationsConfirmees +
        " confirmee(s))"
    );


    ecrireTexte(
        "Chiffre d'affaires total : " +
        donneesRapport.chiffreAffaires.toLocaleString("fr-FR") +
        " FCFA"
    );


    y += 5;


    // =========================
    // 2. RÉSERVATIONS ET SÉJOURS
    // =========================

    ecrireTexte(
        "2. ANALYSE DETAILLEE DES RESERVATIONS ET SEJOURS",
        14,
        true
    );


    ecrireTexte(
        "A. Etat des reservations",
        12,
        true
    );


    ecrireTexte(
        "Reservations confirmees : " +
        donneesRapport.reservationsConfirmees +
        " (" +
        (
            donneesRapport.nombreReservations > 0

                ? (
                    donneesRapport.reservationsConfirmees /
                    donneesRapport.nombreReservations *
                    100
                ).toFixed(1)

                : "0.0"
        ) +
        " %)"
    );


    ecrireTexte(
        "Reservations en attente : " +
        donneesRapport.reservationsEnAttente +
        " (" +
        (
            donneesRapport.nombreReservations > 0

                ? (
                    donneesRapport.reservationsEnAttente /
                    donneesRapport.nombreReservations *
                    100
                ).toFixed(1)

                : "0.0"
        ) +
        " %)"
    );


    ecrireTexte(
        "Reservations annulees : " +
        donneesRapport.reservationsAnnulees +
        " (" +
        (
            donneesRapport.nombreReservations > 0

                ? (
                    donneesRapport.reservationsAnnulees /
                    donneesRapport.nombreReservations *
                    100
                ).toFixed(1)

                : "0.0"
        ) +
        " %)"
    );


    ecrireTexte(
        "B. Suivi des sejours",
        12,
        true
    );


    ecrireTexte(
        "Sejours en cours : " +
        donneesRapport.sejoursEnCours
    );


    ecrireTexte(
        "Check-out en cours : " +
        donneesRapport.sejoursCheckoutEnCours
    );


    ecrireTexte(
        "Sejours termines : " +
        donneesRapport.sejoursTermines
    );


    ecrireTexte(
        "Sejours en attente : " +
        donneesRapport.sejoursEnAttente
    );


    ecrireTexte(
        "Sejours annules : " +
        donneesRapport.sejoursAnnules
    );


    ecrireTexte(
        "Nombre total de sejours : " +
        donneesRapport.nombreSejours
    );


    y += 5;


    // =========================
    // 3. HÉBERGEMENT
    // =========================

    ecrireTexte(
        "3. TAUX D'OCCUPATION ET PERFORMANCE DES HEBERGEMENTS",
        14,
        true
    );


    ecrireTexte(
        "Nombre total de chambres : " +
        donneesRapport.nombreChambres
    );


    ecrireTexte(
        "Chambres hors service : " +
        donneesRapport.chambresHorsService
    );


    ecrireTexte(
        "Chambres actuellement occupees : " +
        donneesRapport.chambresOccupees
    );


    ecrireTexte(
        "Taux d'occupation : " +
        donneesRapport.tauxOccupation.toFixed(2) +
        " %"
    );


    ecrireTexte(
        "Chambres les plus sollicitees",
        12,
        true
    );


    if (
        donneesRapport.topChambres.length === 0
    ) {

        ecrireTexte(
            "Aucune reservation enregistree."
        );

    }
    else {

        donneesRapport.topChambres
            .forEach(
                function(
                    chambre,
                    index
                ) {

                    ecrireTexte(
                        (
                            index + 1
                        ) +
                        ". Chambre " +
                        chambre.numero +
                        " (" +
                        chambre.type +
                        ") : " +
                        chambre.nombreReservations +
                        " reservation(s)"
                    );
                }
            );
    }


    y += 5;


    // =========================
    // 4. FINANCES
    // =========================

    ecrireTexte(
        "4. SITUATION FINANCIERE ET FACTURATION",
        14,
        true
    );


    ecrireTexte(
        "Chiffre d'affaires total : " +
        donneesRapport.chiffreAffaires.toLocaleString("fr-FR") +
        " FCFA"
    );


    ecrireTexte(
        "Montant encaisse : " +
        donneesRapport.montantEncaisse.toLocaleString("fr-FR") +
        " FCFA"
    );


    ecrireTexte(
        "Reste a payer : " +
        donneesRapport.resteAPayer.toLocaleString("fr-FR") +
        " FCFA"
    );


    ecrireTexte(
        "Nombre de factures : " +
        donneesRapport.nombreFactures
    );


    ecrireTexte(
        "Factures payees : " +
        donneesRapport.facturesPayees
    );


    ecrireTexte(
        "Factures avec acompte : " +
        donneesRapport.facturesAvecAcompte
    );


    y += 5;


    // =========================
    // 5. RECOMMANDATIONS
    // =========================

    ecrireTexte(
        "5. RECOMMANDATIONS ET AXES D'AMELIORATION",
        14,
        true
    );


    donneesRapport.recommandations
        .forEach(
            function(
                recommandation,
                index
            ) {

                ecrireTexte(
                    (
                        index + 1
                    ) +
                    ". " +
                    recommandation
                );
            }
        );


    // =========================
    // PIED DE PAGE
    // =========================

    verifierEspace(15);

    y += 5;


    ecrireTexte(
        "Rapport genere automatiquement a partir des donnees du systeme de gestion de l'Hotel Teranga Palace.",
        9
    );


    // =========================
    // NUMÉROS DE PAGES
    // =========================

    const nombrePages =
        pdf.internal
            .getNumberOfPages();


    for (
        let page = 1;
        page <= nombrePages;
        page++
    ) {

        pdf.setPage(
            page
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            9
        );


        pdf.text(
            "Teranga Palace - Rapport d'activite",
            margeGauche,
            hauteurPage - 10
        );


        pdf.text(
            "Page " +
            page +
            " / " +
            nombrePages,
            largeurPage - 45,
            hauteurPage - 10
        );
    }


    // =========================
    // TÉLÉCHARGEMENT
    // =========================

    pdf.save(
        "Rapport_Teranga_Palace.pdf"
    );
}


// =========================
// CHARGEMENT INITIAL
// =========================

chargerRapport();