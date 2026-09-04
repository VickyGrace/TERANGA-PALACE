// =========================
// VARIABLES
// =========================

let chambreEnModification = null;

let chambresChargees = [];


// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const chambresList =
    document.getElementById("chambres-list");

const rechercheChambre =
    document.getElementById("recherche-chambre");

const chambreForm =
    document.getElementById("chambre-form");

const typeSelect =
    document.getElementById("type");

const prixInput =
    document.getElementById("prix_par_nuit");

const capaciteInput =
    document.getElementById("capacite");

const boutonSubmit =
    document.getElementById("chambre-submit-btn");

const annulerButton =
    document.getElementById("annuler-chambre-btn");


// =========================
// RÉINITIALISER LE FORMULAIRE
// =========================

function reinitialiserFormulaireChambre() {

    chambreEnModification = null;

    chambreForm.reset();

    boutonSubmit.textContent =
        "Ajouter la chambre";

    annulerButton.style.display =
        "none";

    capaciteInput.value = "";

    prixInput.value = "";
}


// =========================
// CHARGER LES CHAMBRES
// =========================

async function chargerChambres() {

    const { data, error } =
        await supabaseClient
            .from("chambres")
            .select("*")
            .order(
                "numero_chambre",
                { ascending: true }
            );


    chambresList.innerHTML = "";


    if (error) {

        console.error(
            "Erreur lors du chargement des chambres :",
            error
        );

        chambresList.textContent =
            "Impossible de charger les chambres.";

        return;
    }


    chambresChargees = data;

    afficherChambres(
        chambresChargees
    );
}


// =========================
// AFFICHER LES CHAMBRES
// =========================

function afficherChambres(chambres) {

    chambresList.innerHTML = "";


    if (chambres.length === 0) {

        chambresList.innerHTML = `
            <div class="recherche-vide">

                <i class="fa-solid fa-bed"></i>

                <p>
                    Aucune chambre trouvée.
                </p>

            </div>
        `;

        return;
    }


    chambres.forEach(function(chambre) {

        const chambreElement =
            document.createElement("div");


        let classeStatut = "";


        if (chambre.statut === "Disponible") {

            classeStatut =
                "statut-disponible";

        }
        else if (chambre.statut === "Occupée") {

            classeStatut =
                "statut-occupee";

        }
        else if (chambre.statut === "Hors service") {

            classeStatut =
                "statut-hors-service";

        }


        chambreElement.classList.add(
            "chambre-item"
        );


        chambreElement.innerHTML = `
            <h3>
                Chambre ${chambre.numero_chambre}
            </h3>

            <p>
                <strong>Type :</strong>
                ${chambre.type}
            </p>

            <p>
                <strong>Prix par nuit :</strong>
                ${Number(chambre.prix_par_nuit).toLocaleString("fr-FR")} FCFA
            </p>

            <p>
                <strong>Capacité :</strong>
                ${chambre.capacite} personne(s)
            </p>

            <p>
                <strong>Statut :</strong>

                <span class="${classeStatut}">
                    ${chambre.statut}
                </span>
            </p>

            <div class="admin-card-actions">

                <button class="btn btn-secondary modifier-chambre-btn">
                    Modifier
                </button>

                <button class="btn btn-danger supprimer-chambre-btn">
                    Supprimer
                </button>

            </div>
        `;


        chambresList.appendChild(
            chambreElement
        );


        // =========================
        // MODIFIER
        // =========================

        const modifierButton =
            chambreElement.querySelector(
                ".modifier-chambre-btn"
            );


        modifierButton.addEventListener(
            "click",
            function() {

                chambreEnModification =
                    chambre;


                document.getElementById(
                    "numero_chambre"
                ).value =
                    chambre.numero_chambre;

                typeSelect.value =
                    chambre.type;

                prixInput.value =
                    chambre.prix_par_nuit;

                capaciteInput.value =
                    chambre.capacite;

                document.getElementById(
                    "statut"
                ).value =
                    chambre.statut;


                boutonSubmit.textContent =
                    "Modifier la chambre";

                annulerButton.style.display =
                    "inline-block";
            }
        );


        // =========================
        // SUPPRIMER
        // =========================

        const supprimerButton =
            chambreElement.querySelector(
                ".supprimer-chambre-btn"
            );


        supprimerButton.addEventListener(
            "click",
            async function() {

                const confirmation =
                    confirm(
                        "Voulez-vous vraiment supprimer la chambre " +
                        chambre.numero_chambre +
                        " ?"
                    );


                if (!confirmation) {
                    return;
                }


                const { error } =
                    await supabaseClient
                        .from("chambres")
                        .delete()
                        .eq(
                            "id",
                            chambre.id
                        );


                if (error) {

                    console.error(
                        "Erreur lors de la suppression de la chambre :",
                        error
                    );

                    alert(
                        "Erreur lors de la suppression : " +
                        error.message
                    );

                    return;
                }


                alert(
                    "Chambre supprimée avec succès !"
                );


                chargerChambres();
            }
        );
    });
}


// =========================
// RECHERCHER UNE CHAMBRE
// =========================

rechercheChambre.addEventListener(
    "input",
    function() {

        const recherche =
            rechercheChambre.value
                .trim()
                .toLowerCase();


        const chambresFiltrees =
            chambresChargees.filter(
                function(chambre) {

                    const numero =
                        String(
                            chambre.numero_chambre || ""
                        ).toLowerCase();


                    const type =
                        (chambre.type || "")
                            .toLowerCase();


                    const statut =
                        (chambre.statut || "")
                            .toLowerCase();


                    return (
                        numero.includes(recherche) ||
                        type.includes(recherche) ||
                        statut.includes(recherche)
                    );
                }
            );


        afficherChambres(
            chambresFiltrees
        );
    }
);


// =========================
// TYPE DE CHAMBRE
// =========================

typeSelect.addEventListener(
    "change",
    function() {

        const typeChoisi =
            typeSelect.value;


        const optionSelectionnee =
            typeSelect.options[
                typeSelect.selectedIndex
            ];


        const prix =
            optionSelectionnee.dataset.prix;


        prixInput.value =
            prix || "";


        if (typeChoisi === "Simple") {

            capaciteInput.value = 1;

        }
        else if (typeChoisi === "Double") {

            capaciteInput.value = 3;

        }
        else if (typeChoisi === "Suite") {

            capaciteInput.value = 5;

        }
        else {

            capaciteInput.value = "";

        }
    }
);


// =========================
// AJOUTER / MODIFIER
// =========================

chambreForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const numero_chambre =
            document.getElementById(
                "numero_chambre"
            ).value;


        const type =
            typeSelect.value;


        const prix_par_nuit =
            prixInput.value;


        const capacite =
            capaciteInput.value;


        const statut =
            document.getElementById(
                "statut"
            ).value;


        const informationsChambre = {

            numero_chambre:
                numero_chambre,

            type:
                type,

            prix_par_nuit:
                prix_par_nuit,

            capacite:
                capacite,

            statut:
                statut
        };


        // =========================
        // AJOUT
        // =========================

        if (
            chambreEnModification === null
        ) {

            const { error } =
                await supabaseClient
                    .from("chambres")
                    .insert([
                        informationsChambre
                    ]);


            if (error) {

                console.error(
                    "Erreur lors de l'ajout de la chambre :",
                    error
                );

                alert(
                    "Erreur : " +
                    error.message
                );

                return;
            }


            alert(
                "Chambre ajoutée avec succès !"
            );


            reinitialiserFormulaireChambre();

            chargerChambres();

            return;
        }


        // =========================
        // MODIFICATION
        // =========================

        const { error } =
            await supabaseClient
                .from("chambres")
                .update(
                    informationsChambre
                )
                .eq(
                    "id",
                    chambreEnModification.id
                );


        if (error) {

            console.error(
                "Erreur lors de la modification de la chambre :",
                error
            );

            alert(
                "Erreur : " +
                error.message
            );

            return;
        }


        alert(
            "Chambre modifiée avec succès !"
        );


        reinitialiserFormulaireChambre();

        chargerChambres();
    }
);


// =========================
// ANNULER LA MODIFICATION
// =========================

annulerButton.addEventListener(
    "click",
    function() {

        reinitialiserFormulaireChambre();
    }
);


// =========================
// CHARGEMENT INITIAL
// =========================

chargerChambres();