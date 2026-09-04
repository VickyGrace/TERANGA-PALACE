// =========================
// PARAMÈTRES DE LA PAGE
// =========================

const parametres =
    new URLSearchParams(
        window.location.search
    );

const factureId =
    parametres.get("id");

const reservationId =
    parametres.get("reservation");

const sejourId =
    parametres.get("sejour");

const modeCheckout =
    parametres.get("checkout") === "1";

let idFacture =
    factureId;


// =========================
// ÉLÉMENTS HTML
// =========================

const factureDetails =
    document.getElementById(
        "facture-details"
    );

const paiementSoldeSection =
    document.getElementById(
        "paiement-solde-section"
    );

const resteAPayerElement =
    document.getElementById(
        "reste-a-payer"
    );

const paiementSoldeForm =
    document.getElementById(
        "paiement-solde-form"
    );

const montantSoldeInput =
    document.getElementById(
        "montant-solde"
    );

const modePaiementSoldeSelect =
    document.getElementById(
        "mode-paiement-solde"
    );

const pdfButton =
    document.getElementById(
        "pdf-btn"
    );

const retourButton =
    document.getElementById(
        "retour-btn"
    );


// =========================
// DONNÉES POUR LE PDF
// =========================

let facturePDF = null;

let paiementsPDF = [];

let clientPDF = null;

let chambrePDF = null;

let reservationPDF = null;

let montantTotalPDF = 0;

let montantPayePDF = 0;

let resteAPayerPDF = 0;

let nombreNuitsPDF = 0;


// =========================
// FINALISER LE CHECK-OUT
// =========================

async function finaliserCheckout(
    reservation,
    sejourId
) {

    // =========================
    // VÉRIFIER LE SÉJOUR
    // =========================

    const {
        data: sejour,
        error: erreurLectureSejour
    } =
        await supabaseClient
            .from("sejours")
            .select("statut")
            .eq(
                "id",
                sejourId
            )
            .single();


    if (erreurLectureSejour) {

        console.error(
            "Erreur lors de la vérification du séjour :",
            erreurLectureSejour
        );

        alert(
            "Impossible de vérifier le séjour : " +
            erreurLectureSejour.message
        );

        return false;
    }


    // =========================
    // CHECK-OUT DÉJÀ TERMINÉ
    // =========================

    if (
        sejour.statut ===
        "Terminé"
    ) {

        return true;
    }


    // =========================
    // TERMINER LE SÉJOUR
    // =========================

    const {
        error: erreurSejour
    } =
        await supabaseClient
            .from("sejours")
            .update({
                date_depart_reelle:
                    new Date()
                        .toISOString(),

                statut:
                    "Terminé"
            })
            .eq(
                "id",
                sejourId
            );


    if (erreurSejour) {

        console.error(
            "Erreur lors de la fin du séjour :",
            erreurSejour
        );

        alert(
            "Impossible de terminer le séjour : " +
            erreurSejour.message
        );

        return false;
    }


    // =========================
    // TERMINER LA RÉSERVATION
    // =========================

    const {
        error:
            erreurReservation
    } =
        await supabaseClient
            .from("reservations")
            .update({
                statut:
                    "Terminée"
            })
            .eq(
                "id",
                reservation.id
            );


    if (erreurReservation) {

        console.error(
            "Erreur lors de la mise à jour de la réservation :",
            erreurReservation
        );

        alert(
            "Le séjour est terminé, mais la réservation n'a pas pu être mise à jour : " +
            erreurReservation.message
        );

        return false;
    }


    // =========================
    // LIBÉRER LA CHAMBRE
    // =========================

    const {
        error: erreurChambre
    } =
        await supabaseClient
            .from("chambres")
            .update({
                statut:
                    "Disponible"
            })
            .eq(
                "id",
                reservation.chambre_id
            );


    if (erreurChambre) {

        console.error(
            "Erreur lors de la libération de la chambre :",
            erreurChambre
        );

        alert(
            "Le séjour est terminé, mais la chambre n'a pas pu être libérée : " +
            erreurChambre.message
        );

        return false;
    }


    return true;
}


// =========================
// CHARGER LA FACTURE
// =========================

async function chargerFacture() {

    // =========================
    // RECHERCHER PAR RÉSERVATION
    // =========================

    if (
        !idFacture &&
        reservationId
    ) {

        const {
            data: factureReservation,
            error:
                erreurRechercheFacture
        } =
            await supabaseClient
                .from("factures")
                .select("id")
                .eq(
                    "reservation_id",
                    reservationId
                )
                .single();


        if (
            erreurRechercheFacture
        ) {

            console.error(
                "Erreur lors de la recherche de la facture :",
                erreurRechercheFacture
            );

            factureDetails.innerHTML =
                "<p>Aucune facture trouvée pour cette réservation.</p>";

            return;
        }


        idFacture =
            factureReservation.id;
    }


    // =========================
    // AUCUNE FACTURE
    // =========================

    if (!idFacture) {

        factureDetails.innerHTML = `
            <p>
                Aucune facture sélectionnée.
            </p>
        `;

        return;
    }


    // =========================
    // RÉCUPÉRER LA FACTURE
    // =========================

    const {
        data: facture,
        error: erreurFacture
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
                sejour_id,
                reservations (
                    id,
                    chambre_id,
                    date_arrivee,
                    date_depart,
                    nombre_personnes,
                    clients (
                        nom,
                        prenom
                    ),
                    chambres (
                        numero_chambre,
                        type,
                        prix_par_nuit
                    )
                )
            `)
            .eq(
                "id",
                idFacture
            )
            .single();


    if (erreurFacture) {

        console.error(
            "Erreur lors du chargement de la facture :",
            erreurFacture
        );

        factureDetails.innerHTML = `
            <p>
                Impossible de récupérer la facture.
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
            .select(`
                id,
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
                    ascending: true
                }
            );


    if (erreurPaiements) {

        console.error(
            "Erreur lors du chargement des paiements :",
            erreurPaiements
        );

        factureDetails.innerHTML = `
            <p>
                Impossible de récupérer les paiements.
            </p>
        `;

        return;
    }


    // =========================
    // INFORMATIONS
    // =========================

    const reservation =
        facture.reservations;

    const client =
        reservation.clients;

    const chambre =
        reservation.chambres;

    const montantTotal =
        Number(
            facture.montant_total
        );


    // =========================
    // TOTAL PAYÉ
    // =========================

    const montantPaye =
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


    // =========================
    // RESTE À PAYER
    // =========================

    const resteAPayer =
        Math.max(
            montantTotal -
            montantPaye,
            0
        );


    // =========================
    // NOMBRE DE NUITS
    // =========================

    const dateArrivee =
        new Date(
            reservation.date_arrivee +
            "T00:00:00"
        );


    const dateDepart =
        new Date(
            reservation.date_depart +
            "T00:00:00"
        );


    const differenceTemps =
        dateDepart.getTime() -
        dateArrivee.getTime();


    const nombreNuits =
        differenceTemps /
        (
            1000 *
            60 *
            60 *
            24
        );


    // =========================
    // DONNÉES POUR LE PDF
    // =========================

    facturePDF =
        facture;

    paiementsPDF =
        paiements;

    clientPDF =
        client;

    chambrePDF =
        chambre;

    reservationPDF =
        reservation;

    montantTotalPDF =
        montantTotal;

    montantPayePDF =
        montantPaye;

    resteAPayerPDF =
        resteAPayer;

    nombreNuitsPDF =
        nombreNuits;


    // =========================
    // AFFICHER LA FACTURE
    // =========================

    factureDetails.innerHTML = `

        <h2>
            Facture ${facture.numero_facture}
        </h2>


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


        <p>

            <strong>
                Date de facture :
            </strong>

            ${new Date(
                facture.date_facture
            ).toLocaleDateString(
                "fr-FR"
            )}

        </p>


        <hr>


        <h3>
            Informations du client
        </h3>


        <p>

            <strong>
                Client :
            </strong>

            ${client.nom}
            ${client.prenom}

        </p>


        <h3>
            Informations du séjour
        </h3>


        <p>

            <strong>
                Chambre :
            </strong>

            ${chambre.numero_chambre}
            -
            ${chambre.type}

        </p>


        <p>

            <strong>
                Arrivée :
            </strong>

            ${reservation.date_arrivee}

        </p>


        <p>

            <strong>
                Départ :
            </strong>

            ${reservation.date_depart}

        </p>


        <p>

            <strong>
                Nombre de personnes :
            </strong>

            ${reservation.nombre_personnes}

        </p>


        <p>

            <strong>
                Nombre de nuits :
            </strong>

            ${nombreNuits}

        </p>


        <p>

            <strong>
                Prix par nuit :
            </strong>

            ${Number(
                chambre.prix_par_nuit
            ).toLocaleString(
                "fr-FR"
            )}

            FCFA

        </p>


        <hr>


        <h3>
            Informations financières
        </h3>


        <p>

            <strong>
                Montant total :
            </strong>

            ${montantTotal.toLocaleString(
                "fr-FR"
            )}

            FCFA

        </p>


        <p>

            <strong>
                Montant déjà payé :
            </strong>

            ${montantPaye.toLocaleString(
                "fr-FR"
            )}

            FCFA

        </p>


        <p>

            <strong>
                Reste à payer :
            </strong>

            ${resteAPayer.toLocaleString(
                "fr-FR"
            )}

            FCFA

        </p>


        <p>

            <strong>
                Statut :
            </strong>

            ${facture.statut}

        </p>


        <h3>
            Historique des paiements
        </h3>


        ${
            paiements.length === 0

                ? `
                    <p>
                        Aucun paiement enregistré.
                    </p>
                `

                : paiements
                    .map(
                        function(paiement) {

                            return `
                                <p>

                                    ${new Date(
                                        paiement.date_Paiement
                                    ).toLocaleDateString(
                                        "fr-FR"
                                    )}

                                    -

                                    ${Number(
                                        paiement.montant
                                    ).toLocaleString(
                                        "fr-FR"
                                    )}

                                    FCFA

                                    -

                                    ${paiement.mode_Paiement}

                                </p>
                            `;
                        }
                    )
                    .join("")
        }
    `;


    // =========================
    // PAIEMENT DU SOLDE
    // =========================

    if (
        resteAPayer > 0
    ) {

        paiementSoldeSection.style.display =
            "block";


        resteAPayerElement.textContent =
            resteAPayer.toLocaleString(
                "fr-FR"
            );


        montantSoldeInput.value =
            resteAPayer;


        montantSoldeInput.max =
            resteAPayer;

    }
    else {

        paiementSoldeSection.style.display =
            "none";
    }


    // =========================
    // CHECK-OUT SI DÉJÀ PAYÉ
    // =========================

    if (
        resteAPayer === 0 &&
        modeCheckout &&
        sejourId
    ) {

        const checkoutTermine =
            await finaliserCheckout(
                reservation,
                sejourId
            );


        if (!checkoutTermine) {
            return;
        }
    }
}


// =========================
// ENREGISTRER LE SOLDE
// =========================

paiementSoldeForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const montant =
            Number(
                montantSoldeInput.value
            );


        const modePaiement =
            modePaiementSoldeSelect.value;


        // =========================
        // VÉRIFICATIONS
        // =========================

        if (
            !montant ||
            montant <= 0
        ) {

            alert(
                "Veuillez saisir un montant valide."
            );

            return;
        }


        if (!modePaiement) {

            alert(
                "Veuillez choisir un mode de paiement."
            );

            return;
        }


        if (!idFacture) {

            alert(
                "Aucune facture sélectionnée."
            );

            return;
        }


        // =========================
        // RÉCUPÉRER LA FACTURE
        // =========================

        const {
            data: facture,
            error: erreurFacture
        } =
            await supabaseClient
                .from("factures")
                .select(`
                    id,
                    montant_total
                `)
                .eq(
                    "id",
                    idFacture
                )
                .single();


        if (erreurFacture) {

            console.error(
                "Erreur lors de la récupération de la facture :",
                erreurFacture
            );

            alert(
                "Impossible de récupérer la facture."
            );

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
                .select("montant")
                .eq(
                    "facture_id",
                    idFacture
                );


        if (erreurPaiements) {

            console.error(
                "Erreur lors de la récupération des paiements :",
                erreurPaiements
            );

            alert(
                "Impossible de récupérer les paiements."
            );

            return;
        }


        // =========================
        // MONTANT DÉJÀ PAYÉ
        // =========================

        const montantDejaPaye =
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


        const reste =
            Number(
                facture.montant_total
            ) -
            montantDejaPaye;


        // =========================
        // VÉRIFIER LE MONTANT
        // =========================

        if (
            montant > reste
        ) {

            alert(
                "Le montant saisi est supérieur au reste à payer."
            );

            return;
        }


        // =========================
        // ENREGISTRER LE PAIEMENT
        // =========================

        const {
            error: erreurPaiement
        } =
            await supabaseClient
                .from("paiements")
                .insert({
                    facture_id:
                        idFacture,

                    montant:
                        montant,

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
        // NOUVEAU TOTAL PAYÉ
        // =========================

        const nouveauMontantPaye =
            montantDejaPaye +
            montant;


        let nouveauStatut =
            "Acompte payé";


        if (
            nouveauMontantPaye >=
            Number(
                facture.montant_total
            )
        ) {

            nouveauStatut =
                "Payée";
        }


        // =========================
        // METTRE À JOUR LA FACTURE
        // =========================

        const {
            error: erreurMiseAJour
        } =
            await supabaseClient
                .from("factures")
                .update({
                    statut:
                        nouveauStatut
                })
                .eq(
                    "id",
                    idFacture
                );


        if (erreurMiseAJour) {

            console.error(
                "Erreur lors de la mise à jour de la facture :",
                erreurMiseAJour
            );

            alert(
                "Le paiement a été enregistré, " +
                "mais le statut de la facture n'a pas pu être mis à jour."
            );

            return;
        }


        alert(
            "Paiement enregistré avec succès !"
        );


        // =========================
        // TERMINER LE CHECK-OUT
        // =========================

        if (
            modeCheckout &&
            sejourId &&
            nouveauMontantPaye >=
                Number(
                    facture.montant_total
                )
        ) {

            const checkoutTermine =
                await finaliserCheckout(
                    reservationPDF,
                    sejourId
                );


            if (!checkoutTermine) {
                return;
            }


            alert(
                "Check-out enregistré avec succès !"
            );
        }


        // =========================
        // RECHARGER LA FACTURE
        // =========================

        chargerFacture();
    }
);


// =========================
// GÉNÉRER LA FACTURE PDF
// =========================

pdfButton.addEventListener(
    "click",
    function() {

        if (!facturePDF) {

            alert(
                "La facture n'est pas encore chargée."
            );

            return;
        }


        const { jsPDF } =
            window.jspdf;


        const doc =
            new jsPDF();


        // =========================
        // EN-TÊTE
        // =========================

        doc.setFontSize(20);

        doc.text(
            "TERANGA PALACE",
            20,
            20
        );


        doc.setFontSize(16);

        doc.text(
            "FACTURE",
            20,
            32
        );


        // =========================
        // INFORMATIONS FACTURE
        // =========================

        doc.setFontSize(11);


        doc.text(
            "N° Facture : " +
            facturePDF.numero_facture,
            20,
            48
        );


        doc.text(
            "Date : " +
            new Date(
                facturePDF.date_facture
            ).toLocaleDateString(
                "fr-FR"
            ),
            20,
            56
        );


        // =========================
        // CLIENT
        // =========================

        doc.setFontSize(13);


        doc.text(
            "Informations du client",
            20,
            72
        );


        doc.setFontSize(11);


        doc.text(
            "Nom : " +
            clientPDF.nom +
            " " +
            clientPDF.prenom,
            20,
            82
        );


        // =========================
        // SÉJOUR
        // =========================

        doc.setFontSize(13);


        doc.text(
            "Informations du séjour",
            20,
            100
        );


        doc.setFontSize(11);


        doc.text(
            "Chambre : " +
            chambrePDF.numero_chambre +
            " - " +
            chambrePDF.type,
            20,
            110
        );


        doc.text(
            "Arrivée : " +
            reservationPDF.date_arrivee,
            20,
            118
        );


        doc.text(
            "Départ : " +
            reservationPDF.date_depart,
            20,
            126
        );


        doc.text(
            "Nombre de personnes : " +
            reservationPDF.nombre_personnes,
            20,
            134
        );


        doc.text(
            "Nombre de nuits : " +
            nombreNuitsPDF,
            20,
            142
        );


        doc.text(
            "Prix par nuit : " +
            Number(
                chambrePDF.prix_par_nuit
            ).toLocaleString(
                "fr-FR"
            ) +
            " FCFA",
            20,
            150
        );


        // =========================
        // FINANCES
        // =========================

        doc.setFontSize(13);


        doc.text(
            "Informations financières",
            20,
            170
        );


        doc.setFontSize(11);


        doc.text(
            "Montant total : " +
            montantTotalPDF
                .toLocaleString(
                    "fr-FR"
                ) +
            " FCFA",
            20,
            180
        );


        doc.text(
            "Montant payé : " +
            montantPayePDF
                .toLocaleString(
                    "fr-FR"
                ) +
            " FCFA",
            20,
            188
        );


        doc.text(
            "Reste à payer : " +
            resteAPayerPDF
                .toLocaleString(
                    "fr-FR"
                ) +
            " FCFA",
            20,
            196
        );


        doc.text(
            "Statut : " +
            facturePDF.statut,
            20,
            204
        );


        // =========================
        // PAIEMENTS
        // =========================

        doc.setFontSize(13);


        doc.text(
            "Historique des paiements",
            20,
            222
        );


        doc.setFontSize(10);


        let positionY =
            232;


        if (
            paiementsPDF.length === 0
        ) {

            doc.text(
                "Aucun paiement enregistré.",
                20,
                positionY
            );

        }
        else {

            paiementsPDF.forEach(
                function(paiement) {

                    const datePaiement =
                        new Date(
                            paiement.date_Paiement
                        ).toLocaleDateString(
                            "fr-FR"
                        );


                    const ligne =
                        datePaiement +
                        " - " +
                        Number(
                            paiement.montant
                        ).toLocaleString(
                            "fr-FR"
                        ) +
                        " FCFA - " +
                        paiement.mode_Paiement;


                    doc.text(
                        ligne,
                        20,
                        positionY
                    );


                    positionY +=
                        8;
                }
            );
        }


        // =========================
        // PIED DE PAGE
        // =========================

        doc.setFontSize(10);


        doc.text(
            "Merci pour votre confiance.",
            20,
            280
        );


        // =========================
        // TÉLÉCHARGER LE PDF
        // =========================

        doc.save(
            facturePDF.numero_facture +
            ".pdf"
        );
    }
);


// =========================
// BOUTON RETOUR
// =========================

retourButton.addEventListener(
    "click",
    function() {

        window.history.back();
    }
);


// =========================
// CHARGEMENT INITIAL
// =========================

chargerFacture();