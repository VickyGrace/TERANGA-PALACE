// =========================
// VARIABLES
// =========================

let reservationsChargees = [];

let reservationEnModification = null;


// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const reservationForm =
    document.getElementById("reservation-form");

const clientSelect =
    document.getElementById("client_id");

const chambreSelect =
    document.getElementById("chambre_id");

const dateArriveeInput =
    document.getElementById("date_arrivee");

const dateDepartInput =
    document.getElementById("date_depart");

const nombrePersonnesSelect =
    document.getElementById("nombre_personnes");

const montantTotalInput =
    document.getElementById("montant_total");

const acompteMinimumInput =
    document.getElementById("acompte_minimum");

const rechercheReservation =
    document.getElementById("recherche-reservation");

const reservationsList =
    document.getElementById("reservations-list");


// =========================
// CALENDRIERS
// =========================

const calendrierArrivee =
    flatpickr(
        "#date_arrivee",
        {
            dateFormat: "Y-m-d",
            locale: "fr",
            disable: []
        }
    );


const calendrierDepart =
    flatpickr(
        "#date_depart",
        {
            dateFormat: "Y-m-d",
            locale: "fr",
            disable: []
        }
    );


// =========================
// CHARGER LES CLIENTS
// =========================

async function chargerClients() {

    const { data, error } =
        await supabaseClient
            .from("clients")
            .select("*")
            .order(
                "nom",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Erreur lors du chargement des clients :",
            error
        );

        return;
    }


    data.forEach(
        function(client) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                client.id;

            option.textContent =
                client.nom +
                " " +
                client.prenom;

            clientSelect.appendChild(
                option
            );
        }
    );


    // =========================
    // CLIENT TRANSMIS PAR L'URL
    // =========================

    const parametres =
        new URLSearchParams(
            window.location.search
        );


    const clientId =
        parametres.get("client");


    if (clientId) {

        clientSelect.value =
            clientId;
    }
}


// =========================
// CHARGER LES CHAMBRES
// =========================

async function chargerChambres() {

    const { data, error } =
        await supabaseClient
            .from("chambres")
            .select("*")
            .neq(
                "statut",
                "Hors service"
            )
            .order(
                "numero_chambre",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Erreur lors du chargement des chambres :",
            error
        );

        return;
    }


    data.forEach(
        function(chambre) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                chambre.id;

            option.textContent =
                "Chambre " +
                chambre.numero_chambre +
                " - " +
                chambre.type +
                " - " +
                chambre.prix_par_nuit +
                " FCFA";

            chambreSelect.appendChild(
                option
            );
        }
    );
}


// =========================
// CHARGER LES RÉSERVATIONS
// =========================

async function chargerReservations() {

    const { data, error } =
        await supabaseClient
            .from("reservations")
            .select(`
                id,
                client_id,
                chambre_id,
                date_reservation,
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
            .order(
                "date_reservation",
                { ascending: false }
            );


    if (error) {

        console.error(
            "Erreur lors du chargement des réservations :",
            error
        );

        return;
    }


    reservationsChargees =
        data;


    reservationsList.innerHTML =
        "";


    data.forEach(
        function(reservation) {

            const reservationElement =
                document.createElement(
                    "div"
                );


            reservationElement.classList.add(
                "reservation-item"
            );


            const nomClient =
                reservation.clients
                    ? reservation.clients.nom +
                      " " +
                      reservation.clients.prenom
                    : "Client introuvable";


            const chambreAffichee =
                reservation.chambres
                    ? "Chambre " +
                      reservation.chambres.numero_chambre +
                      " - " +
                      reservation.chambres.type
                    : "Chambre introuvable";


            // =========================
            // STATUT
            // =========================

            let classeStatut =
                "status-attente";


            if (
                reservation.statut ===
                "Confirmée"
            ) {

                classeStatut =
                    "status-confirmee";

            }
            else if (
                reservation.statut ===
                "Terminée"
            ) {

                classeStatut =
                    "status-terminee";

            }
            else if (
                reservation.statut ===
                "Annulée"
            ) {

                classeStatut =
                    "status-annulee";
            }


            // =========================
            // BOUTONS
            // =========================

            let boutons = `
                <button class="btn btn-secondary modifier-reservation-btn">
                    Modifier
                </button>

                <button class="btn btn-warning voir-sejour-btn">
                    Voir séjour
                </button>
            `;


            if (
                reservation.statut !==
                "Annulée"
            ) {

                boutons += `
                    <button class="btn btn-danger annuler-reservation-btn">
                        Annuler
                    </button>
                `;
            }


            // =========================
            // AFFICHAGE
            // =========================

            reservationElement.innerHTML = `
                <div class="reservation-card-header">

                    <div>

                        <span class="reservation-card-label">
                            Réservation
                        </span>

                        <h3>
                            ${nomClient}
                        </h3>

                        <p class="reservation-id">
                            <strong>ID :</strong>
                            ${reservation.id}
                        </p>

                    </div>

                    <span class="status-badge ${classeStatut}">
                        ${reservation.statut}
                    </span>

                </div>


                <div class="reservation-card-info">

                    <p>
                        <strong>Chambre :</strong>
                        ${chambreAffichee}
                    </p>

                    <p>
                        <strong>Date de réservation :</strong>
                        ${reservation.date_reservation}
                    </p>

                    <p>
                        <strong>Arrivée :</strong>
                        ${reservation.date_arrivee}
                    </p>

                    <p>
                        <strong>Départ :</strong>
                        ${reservation.date_depart}
                    </p>

                    <p>
                        <strong>Nombre de personnes :</strong>
                        ${reservation.nombre_personnes}
                    </p>

                </div>


                <div class="admin-card-actions">
                    ${boutons}
                </div>
            `;


            reservationsList.appendChild(
                reservationElement
            );


            // =========================
            // BOUTON VOIR SÉJOUR
            // =========================

            const voirSejourButton =
                reservationElement.querySelector(
                    ".voir-sejour-btn"
                );


            voirSejourButton.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "sejours.html?reservation=" +
                        reservation.id;
                }
            );


            // =========================
            // BOUTON ANNULER
            // =========================

            const annulerButton =
                reservationElement.querySelector(
                    ".annuler-reservation-btn"
                );


            if (annulerButton) {

                annulerButton.addEventListener(
                    "click",
                    async function() {

                        // =========================
                        // RECHERCHER LA FACTURE
                        // =========================

                        const {
                            data: facture,
                            error: erreurFacture
                        } =
                            await supabaseClient
                                .from("factures")
                                .select(
                                    "id, numero_facture, montant_total, statut"
                                )
                                .eq(
                                    "reservation_id",
                                    reservation.id
                                )
                                .maybeSingle();


                        if (erreurFacture) {

                            console.error(
                                "Erreur lors de la récupération de la facture :",
                                erreurFacture
                            );

                            alert(
                                "Impossible de vérifier la facture : " +
                                erreurFacture.message
                            );

                            return;
                        }


                        // =========================
                        // CALCULER LE MONTANT PAYÉ
                        // =========================

                        let montantPaye =
                            0;


                        if (facture) {

                            const {
                                data: paiements,
                                error: erreurPaiements
                            } =
                                await supabaseClient
                                    .from("paiements")
                                    .select("montant")
                                    .eq(
                                        "facture_id",
                                        facture.id
                                    );


                            if (erreurPaiements) {

                                console.error(
                                    "Erreur lors de la récupération des paiements :",
                                    erreurPaiements
                                );

                                alert(
                                    "Impossible de vérifier les paiements : " +
                                    erreurPaiements.message
                                );

                                return;
                            }


                            montantPaye =
                                paiements.reduce(
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
                                );
                        }


                        // =========================
                        // CONFIRMATION
                        // =========================

                        let messageConfirmation =
                            "Voulez-vous vraiment annuler cette réservation ?";


                        if (montantPaye > 0) {

                            messageConfirmation +=
                                "\n\nUn montant de " +
                                montantPaye.toLocaleString(
                                    "fr-FR"
                                ) +
                                " FCFA a déjà été payé." +
                                "\n\nLe paiement et la facture seront conservés dans l'historique financier.";
                        }


                        const confirmation =
                            confirm(
                                messageConfirmation
                            );


                        if (!confirmation) {
                            return;
                        }


                        // =========================
                        // ANNULER LA RÉSERVATION
                        // =========================

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
                                        "Annulée"
                                })
                                .eq(
                                    "id",
                                    reservation.id
                                );


                        if (
                            erreurReservation
                        ) {

                            console.error(
                                "Erreur lors de l'annulation de la réservation :",
                                erreurReservation
                            );

                            alert(
                                "Erreur lors de l'annulation : " +
                                erreurReservation.message
                            );

                            return;
                        }


                        // =========================
                        // ANNULER LE SÉJOUR
                        // =========================

                        const {
                            error:
                                erreurSejour
                        } =
                            await supabaseClient
                                .from("sejours")
                                .update({
                                    statut:
                                        "Annulé"
                                })
                                .eq(
                                    "reservation_id",
                                    reservation.id
                                );


                        if (erreurSejour) {

                            console.error(
                                "Erreur lors de l'annulation du séjour :",
                                erreurSejour
                            );

                            alert(
                                "La réservation a été annulée, " +
                                "mais le séjour n'a pas pu être annulé : " +
                                erreurSejour.message
                            );

                            return;
                        }


                        // =========================
                        // MESSAGE FINAL
                        // =========================

                        if (montantPaye > 0) {

                            alert(
                                "La réservation et le séjour ont été annulés.\n\n" +
                                "Montant déjà encaissé : " +
                                montantPaye.toLocaleString(
                                    "fr-FR"
                                ) +
                                " FCFA\n\n" +
                                "La facture et le paiement ont été conservés."
                            );

                        }
                        else {

                            alert(
                                "La réservation et le séjour ont été annulés avec succès !"
                            );
                        }


                        chargerReservations();
                    }
                );
            }


            // =========================
            // BOUTON MODIFIER
            // =========================

            const modifierButton =
                reservationElement.querySelector(
                    ".modifier-reservation-btn"
                );


            modifierButton.addEventListener(
                "click",
                async function() {

                    reservationEnModification =
                        reservation.id;


                    clientSelect.value =
                        reservation.client_id;

                    chambreSelect.value =
                        reservation.chambre_id;

                    dateArriveeInput.value =
                        reservation.date_arrivee;

                    dateDepartInput.value =
                        reservation.date_depart;


                    // =========================
                    // CAPACITÉ DE LA CHAMBRE
                    // =========================

                    const {
                        data: chambre,
                        error: erreurChambre
                    } =
                        await supabaseClient
                            .from("chambres")
                            .select("capacite")
                            .eq(
                                "id",
                                reservation.chambre_id
                            )
                            .single();


                    if (erreurChambre) {

                        console.error(
                            "Erreur lors de la récupération de la capacité :",
                            erreurChambre
                        );

                        alert(
                            "Impossible de récupérer la capacité de la chambre : " +
                            erreurChambre.message
                        );

                        return;
                    }


                    // =========================
                    // NOMBRE DE PERSONNES
                    // =========================

                    nombrePersonnesSelect.innerHTML =
                        '<option value="">-- Choisir le nombre de personnes --</option>';


                    for (
                        let i = 1;
                        i <= chambre.capacite;
                        i++
                    ) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            i;

                        option.textContent =
                            i +
                            (
                                i === 1
                                    ? " personne"
                                    : " personnes"
                            );


                        nombrePersonnesSelect.appendChild(
                            option
                        );
                    }


                    nombrePersonnesSelect.value =
                        reservation.nombre_personnes;


                    // =========================
                    // RECALCULER LES MONTANTS
                    // =========================

                    await calculerMontants();


                    // =========================
                    // TEXTE DU BOUTON
                    // =========================

                    reservationForm
                        .querySelector(
                            "button[type='submit']"
                        )
                        .textContent =
                        "Enregistrer les modifications";
                }
            );
        }
    );
}


// =========================
// CALCULER LES MONTANTS
// =========================

async function calculerMontants() {

    const chambreId =
        chambreSelect.value;

    const dateArrivee =
        dateArriveeInput.value;

    const dateDepart =
        dateDepartInput.value;


    if (
        !chambreId ||
        !dateArrivee ||
        !dateDepart
    ) {

        montantTotalInput.value =
            "";

        acompteMinimumInput.value =
            "";

        return;
    }


    if (
        dateDepart <= dateArrivee
    ) {

        montantTotalInput.value =
            "";

        acompteMinimumInput.value =
            "";

        return;
    }


    const { data: chambre, error } =
        await supabaseClient
            .from("chambres")
            .select("prix_par_nuit")
            .eq(
                "id",
                chambreId
            )
            .single();


    if (error) {

        console.error(
            "Erreur lors de la récupération du prix de la chambre :",
            error
        );

        return;
    }


    const arrivee =
        new Date(
            dateArrivee +
            "T00:00:00"
        );

    const depart =
        new Date(
            dateDepart +
            "T00:00:00"
        );


    const differenceTemps =
        depart.getTime() -
        arrivee.getTime();


    const nombreNuits =
        differenceTemps /
        (1000 * 60 * 60 * 24);


    const montantTotal =
        nombreNuits *
        Number(
            chambre.prix_par_nuit
        );


    // Acompte minimum actuel : 30 %
    const acompteMinimum =
        montantTotal * 0.30;


    montantTotalInput.value =
        montantTotal.toLocaleString(
            "fr-FR"
        ) +
        " FCFA";


    acompteMinimumInput.value =
        acompteMinimum.toLocaleString(
            "fr-FR"
        ) +
        " FCFA";
}


// =========================
// CHANGEMENT DE CHAMBRE
// =========================

chambreSelect.addEventListener(
    "change",
    calculerMontants
);


chambreSelect.addEventListener(
    "change",
    async function() {

        const chambreId =
            chambreSelect.value;


        if (!chambreId) {

            nombrePersonnesSelect.innerHTML =
                '<option value="">-- Choisir le nombre de personnes --</option>';


            calendrierArrivee.set(
                "disable",
                []
            );

            calendrierDepart.set(
                "disable",
                []
            );

            return;
        }


        // =========================
        // CAPACITÉ DE LA CHAMBRE
        // =========================

        const {
            data: chambre,
            error: erreurChambre
        } =
            await supabaseClient
                .from("chambres")
                .select(
                    "capacite, type"
                )
                .eq(
                    "id",
                    chambreId
                )
                .single();


        if (erreurChambre) {

            console.error(
                "Erreur lors de la récupération de la chambre :",
                erreurChambre
            );

            return;
        }


        nombrePersonnesSelect.innerHTML =
            '<option value="">-- Choisir le nombre de personnes --</option>';


        for (
            let i = 1;
            i <= chambre.capacite;
            i++
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                i;

            option.textContent =
                i +
                (
                    i === 1
                        ? " personne"
                        : " personnes"
                );


            nombrePersonnesSelect.appendChild(
                option
            );
        }


        if (
            chambre.type ===
            "Simple"
        ) {

            nombrePersonnesSelect.value =
                "1";
        }


        // =========================
        // DATES DÉJÀ RÉSERVÉES
        // =========================

        const { data, error } =
            await supabaseClient
                .from("reservations")
                .select(
                    "date_arrivee, date_depart, statut"
                )
                .eq(
                    "chambre_id",
                    chambreId
                )
                .neq(
                    "statut",
                    "Annulée"
                );


        if (error) {

            console.error(
                "Erreur lors de la récupération des dates réservées :",
                error
            );

            return;
        }


        const datesBloquees =
            data.map(
                function(reservation) {

                    const dateFin =
                        new Date(
                            reservation.date_depart +
                            "T00:00:00"
                        );


                    dateFin.setDate(
                        dateFin.getDate() - 1
                    );


                    return {
                        from:
                            reservation.date_arrivee,

                        to:
                            dateFin
                    };
                }
            );


        calendrierArrivee.set(
            "disable",
            datesBloquees
        );


        calendrierDepart.set(
            "disable",
            datesBloquees
        );
    }
);


// =========================
// RECALCULER SELON LES DATES
// =========================

dateArriveeInput.addEventListener(
    "change",
    calculerMontants
);


dateDepartInput.addEventListener(
    "change",
    calculerMontants
);


// =========================
// CRÉER / MODIFIER
// =========================

reservationForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const clientId =
            clientSelect.value;

        const chambreId =
            chambreSelect.value;

        const dateArrivee =
            dateArriveeInput.value;

        const dateDepart =
            dateDepartInput.value;

        const nombrePersonnes =
            nombrePersonnesSelect.value;

        const montantPaye =
            Number(
                document.getElementById(
                    "montant_paye"
                ).value
            );

        const modePaiement =
            document.getElementById(
                "mode_paiement"
            ).value;


        // =========================
        // VÉRIFIER LES DATES
        // =========================

        if (
            dateDepart <=
            dateArrivee
        ) {

            alert(
                "La date de départ doit être après la date d'arrivée."
            );

            return;
        }


        // =========================
        // VÉRIFIER LA DISPONIBILITÉ
        // =========================

        let requeteDisponibilite =
            supabaseClient
                .from("reservations")
                .select(
                    "id, date_arrivee, date_depart, statut"
                )
                .eq(
                    "chambre_id",
                    chambreId
                )
                .neq(
                    "statut",
                    "Annulée"
                )
                .lt(
                    "date_arrivee",
                    dateDepart
                )
                .gt(
                    "date_depart",
                    dateArrivee
                );


        if (
            reservationEnModification
        ) {

            requeteDisponibilite =
                requeteDisponibilite
                    .neq(
                        "id",
                        reservationEnModification
                    );
        }


        const { data, error } =
            await requeteDisponibilite;


        if (error) {

            console.error(
                "Erreur lors de la vérification de la disponibilité :",
                error
            );

            alert(
                "Erreur lors de la vérification de la disponibilité. " +
                error.message
            );

            return;
        }


        if (data.length > 0) {

            alert(
                "Cette chambre est déjà réservée pour ces dates."
            );

            return;
        }


        // =====================================================
        // MODIFIER UNE RÉSERVATION
        // =====================================================

        if (
            reservationEnModification
        ) {

            const {
                data: chambreModification,
                error:
                    erreurChambreModification
            } =
                await supabaseClient
                    .from("chambres")
                    .select(
                        "prix_par_nuit"
                    )
                    .eq(
                        "id",
                        chambreId
                    )
                    .single();


            if (
                erreurChambreModification
            ) {

                console.error(
                    "Erreur lors de la récupération du prix de la chambre :",
                    erreurChambreModification
                );

                alert(
                    "Impossible de récupérer le prix de la chambre : " +
                    erreurChambreModification.message
                );

                return;
            }


            // =========================
            // NOUVEAU MONTANT TOTAL
            // =========================

            const arriveeModification =
                new Date(
                    dateArrivee +
                    "T00:00:00"
                );


            const departModification =
                new Date(
                    dateDepart +
                    "T00:00:00"
                );


            const differenceModification =
                departModification.getTime() -
                arriveeModification.getTime();


            const nombreNuitsModification =
                differenceModification /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );


            const nouveauMontantTotal =
                nombreNuitsModification *
                Number(
                    chambreModification
                        .prix_par_nuit
                );


            // =========================
            // RECHERCHER LA FACTURE
            // =========================

            const {
                data: factureModification,
                error:
                    erreurFactureModification
            } =
                await supabaseClient
                    .from("factures")
                    .select(
                        "id, montant_total, statut"
                    )
                    .eq(
                        "reservation_id",
                        reservationEnModification
                    )
                    .maybeSingle();


            if (
                erreurFactureModification
            ) {

                console.error(
                    "Erreur lors de la récupération de la facture :",
                    erreurFactureModification
                );

                alert(
                    "Impossible de récupérer la facture : " +
                    erreurFactureModification.message
                );

                return;
            }


            // =========================
            // MONTANT DÉJÀ PAYÉ
            // =========================

            let totalDejaPaye =
                0;


            if (
                factureModification
            ) {

                const {
                    data:
                        paiementsModification,

                    error:
                        erreurPaiementsModification
                } =
                    await supabaseClient
                        .from(
                            "paiements"
                        )
                        .select("montant")
                        .eq(
                            "facture_id",
                            factureModification.id
                        );


                if (
                    erreurPaiementsModification
                ) {

                    console.error(
                        "Erreur lors de la récupération des paiements :",
                        erreurPaiementsModification
                    );

                    alert(
                        "Impossible de récupérer les paiements : " +
                        erreurPaiementsModification.message
                    );

                    return;
                }


                totalDejaPaye =
                    paiementsModification.reduce(
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
                    );
            }


            // =========================
            // ÉVITER UN TROP-PERÇU
            // =========================

            if (
                totalDejaPaye >
                nouveauMontantTotal
            ) {

                alert(
                    "Cette modification est impossible.\n\n" +
                    "Nouveau montant de la réservation : " +
                    nouveauMontantTotal.toLocaleString(
                        "fr-FR"
                    ) +
                    " FCFA\n" +
                    "Montant déjà payé : " +
                    totalDejaPaye.toLocaleString(
                        "fr-FR"
                    ) +
                    " FCFA\n\n" +
                    "Le montant déjà payé ne peut pas être supérieur au nouveau montant total."
                );

                return;
            }


            // =========================
            // MODIFIER LA RÉSERVATION
            // =========================

            const {
                error:
                    erreurModificationReservation
            } =
                await supabaseClient
                    .from("reservations")
                    .update({
                        client_id:
                            clientId,

                        chambre_id:
                            chambreId,

                        date_arrivee:
                            dateArrivee,

                        date_depart:
                            dateDepart,

                        nombre_personnes:
                            nombrePersonnes
                    })
                    .eq(
                        "id",
                        reservationEnModification
                    );


            if (
                erreurModificationReservation
            ) {

                console.error(
                    "Erreur lors de la modification de la réservation :",
                    erreurModificationReservation
                );

                alert(
                    "Erreur lors de la modification : " +
                    erreurModificationReservation.message
                );

                return;
            }


            // =========================
            // METTRE À JOUR LA FACTURE
            // =========================

            if (
                factureModification
            ) {

                let nouveauStatutFacture =
                    "En attente";


                if (
                    totalDejaPaye >=
                    nouveauMontantTotal
                ) {

                    nouveauStatutFacture =
                        "Payée";

                }
                else if (
                    totalDejaPaye > 0
                ) {

                    nouveauStatutFacture =
                        "Acompte payé";
                }


                const {
                    error:
                        erreurMajFacture
                } =
                    await supabaseClient
                        .from("factures")
                        .update({
                            montant_total:
                                nouveauMontantTotal,

                            statut:
                                nouveauStatutFacture
                        })
                        .eq(
                            "id",
                            factureModification.id
                        );


                if (
                    erreurMajFacture
                ) {

                    console.error(
                        "Erreur lors de la mise à jour de la facture :",
                        erreurMajFacture
                    );

                    alert(
                        "La réservation a été modifiée, " +
                        "mais la facture n'a pas pu être mise à jour : " +
                        erreurMajFacture.message
                    );

                    return;
                }
            }


            alert(
                "La réservation a été modifiée avec succès !\n\n" +
                "Nouveau montant total : " +
                nouveauMontantTotal.toLocaleString(
                    "fr-FR"
                ) +
                " FCFA"
            );


            reservationEnModification =
                null;


            reservationForm
                .querySelector(
                    "button[type='submit']"
                )
                .textContent =
                "Créer la réservation";


            chargerReservations();

            return;
        }


        // =====================================================
        // CRÉER UNE NOUVELLE RÉSERVATION
        // =====================================================

        const {
            data: chambre,
            error: erreurChambre
        } =
            await supabaseClient
                .from("chambres")
                .select("prix_par_nuit")
                .eq(
                    "id",
                    chambreId
                )
                .single();


        if (erreurChambre) {

            console.error(
                "Erreur lors de la récupération du prix de la chambre :",
                erreurChambre
            );

            alert(
                "Erreur lors de la récupération du prix de la chambre : " +
                erreurChambre.message
            );

            return;
        }


        // =========================
        // CALCULER LE MONTANT
        // =========================

        const arrivee =
            new Date(
                dateArrivee +
                "T00:00:00"
            );


        const depart =
            new Date(
                dateDepart +
                "T00:00:00"
            );


        const differenceTemps =
            depart.getTime() -
            arrivee.getTime();


        const nombreNuits =
            differenceTemps /
            (
                1000 *
                60 *
                60 *
                24
            );


        const montantTotal =
            nombreNuits *
            Number(
                chambre.prix_par_nuit
            );


        // Acompte minimum actuel : 30 %
        const acompteMinimum =
            montantTotal * 0.30;


        if (
            montantPaye <
            acompteMinimum
        ) {

            alert(
                "Le montant payé est insuffisant.\n\n" +
                "Montant total : " +
                montantTotal.toLocaleString(
                    "fr-FR"
                ) +
                " FCFA\n" +
                "Acompte minimum (30 %) : " +
                acompteMinimum.toLocaleString(
                    "fr-FR"
                ) +
                " FCFA\n" +
                "Montant payé : " +
                montantPaye.toLocaleString(
                    "fr-FR"
                ) +
                " FCFA"
            );

            return;
        }


        // =========================
        // CRÉER LA RÉSERVATION
        // =========================

        const {
            data:
                nouvelleReservation,

            error:
                erreurReservation
        } =
            await supabaseClient
                .from("reservations")
                .insert({
                    client_id:
                        clientId,

                    chambre_id:
                        chambreId,

                    date_arrivee:
                        dateArrivee,

                    date_depart:
                        dateDepart,

                    nombre_personnes:
                        nombrePersonnes,

                    statut:
                        "En attente"
                })
                .select()
                .single();


        if (erreurReservation) {

            console.error(
                "Erreur lors de la création de la réservation :",
                erreurReservation
            );

            alert(
                "Erreur lors de la création de la réservation : " +
                erreurReservation.message
            );

            return;
        }


        // =========================
        // CRÉER LE SÉJOUR
        // =========================

        const {
            data: nouveauSejour,
            error: erreurSejour
        } =
            await supabaseClient
                .from("sejours")
                .insert({
                    reservation_id:
                        nouvelleReservation.id,

                    statut:
                        "En attente"
                })
                .select()
                .single();


        if (erreurSejour) {

            console.error(
                "Erreur lors de la création du séjour :",
                erreurSejour
            );

            alert(
                "La réservation a été créée, mais une erreur est survenue lors de la création du séjour : " +
                erreurSejour.message
            );

            return;
        }


        // =========================
        // NUMÉRO DE FACTURE
        // =========================

        const annee =
            new Date().getFullYear();


        const {
            data: derniereFacture,
            error: erreurNumero
        } =
            await supabaseClient
                .from("factures")
                .select(
                    "numero_facture"
                )
                .like(
                    "numero_facture",
                    `FAC-${annee}-%`
                )
                .order(
                    "numero_facture",
                    { ascending: false }
                )
                .limit(1);


        if (erreurNumero) {

            console.error(
                "Erreur lors de la génération du numéro de facture :",
                erreurNumero
            );

            alert(
                "La réservation a été créée, mais impossible de générer le numéro de facture : " +
                erreurNumero.message
            );

            return;
        }


        let prochainNumero =
            1;


        if (
            derniereFacture &&
            derniereFacture.length > 0
        ) {

            const dernierNumero =
                parseInt(
                    derniereFacture[0]
                        .numero_facture
                        .split("-")[2]
                );


            prochainNumero =
                dernierNumero + 1;
        }


        const numeroFacture =
            "FAC-" +
            annee +
            "-" +
            String(
                prochainNumero
            ).padStart(
                4,
                "0"
            );


        // =========================
        // CRÉER LA FACTURE
        // =========================

        const {
            data:
                nouvelleFacture,

            error:
                erreurFacture
        } =
            await supabaseClient
                .from("factures")
                .insert({
                    numero_facture:
                        numeroFacture,

                    reservation_id:
                        nouvelleReservation.id,

                    sejour_id:
                        nouveauSejour.id,

                    montant_total:
                        montantTotal,

                    statut:
                        montantPaye >=
                        montantTotal
                            ? "Payée"
                            : "Acompte payé"
                })
                .select()
                .single();


        if (erreurFacture) {

            console.error(
                "Erreur lors de la création de la facture :",
                erreurFacture
            );

            alert(
                "La réservation a été créée, mais une erreur est survenue lors de la création de la facture : " +
                erreurFacture.message
            );

            return;
        }


        // =========================
        // CRÉER LE PAIEMENT
        // =========================

        const {
            error:
                erreurPaiement
        } =
            await supabaseClient
                .from("paiements")
                .insert({
                    facture_id:
                        nouvelleFacture.id,

                    montant:
                        montantPaye,

                    mode_Paiement:
                        modePaiement
                });


        if (erreurPaiement) {

            console.error(
                "Erreur lors de l'enregistrement du paiement :",
                erreurPaiement
            );

            alert(
                "Erreur lors de l'enregistrement du paiement : " +
                erreurPaiement.message
            );

            return;
        }


        // =========================
        // REDIRECTION
        // =========================

        window.location.href =
            "sejours.html?reservation=" +
            nouvelleReservation.id;
    }
);


// =========================
// RECHERCHER UNE RÉSERVATION
// =========================

rechercheReservation.addEventListener(
    "input",
    function() {

        const recherche =
            rechercheReservation.value
                .trim()
                .toLowerCase();


        const cartesReservations =
            document.querySelectorAll(
                "#reservations-list .reservation-item"
            );


        cartesReservations.forEach(
            function(carte) {

                const nomPrenom =
                    carte
                        .querySelector("h3")
                        ?.textContent
                        .trim()
                        .toLowerCase() ||
                    "";


                const idReservation =
                    carte
                        .querySelector(
                            ".reservation-id"
                        )
                        ?.textContent
                        .replace(
                            "ID :",
                            ""
                        )
                        .trim()
                        .toLowerCase() ||
                    "";


                const correspond =
                    nomPrenom.includes(
                        recherche
                    ) ||
                    idReservation.includes(
                        recherche
                    );


                if (correspond) {

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


// =========================
// CHARGEMENT INITIAL
// =========================

chargerClients();

chargerChambres();

chargerReservations();


if (chambreSelect.value) {

    chambreSelect.dispatchEvent(
        new Event("change")
    );
}