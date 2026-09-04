// =========================
// VARIABLES
// =========================

let clientEnModification = null;

let clientsCharges = [];


// =========================
// ÉLÉMENTS DE LA PAGE
// =========================

const clientsList =
    document.getElementById("clients-list");

const clientForm =
    document.getElementById("client-form");

const rechercheClient =
    document.getElementById("recherche-client");

const boutonSubmit =
    document.getElementById("client-submit-btn");

const annulerButton =
    document.getElementById("annuler-btn");


// =========================
// RÉINITIALISER LE FORMULAIRE
// =========================

function reinitialiserFormulaireClient() {

    clientForm.reset();

    clientEnModification = null;

    boutonSubmit.textContent =
        "Ajouter le client";

    annulerButton.style.display =
        "none";
}


// =========================
// CHARGER LES CLIENTS
// =========================

async function chargerClients() {

    const { data, error } =
        await supabaseClient
            .from("clients")
            .select("*");


    clientsList.innerHTML = "";


    if (error) {

        console.error(
            "Erreur lors du chargement des clients :",
            error
        );

        clientsList.textContent =
            "Impossible de charger les clients.";

        return;
    }


    clientsCharges = data;

    afficherClients(clientsCharges);
}


// =========================
// AFFICHER LES CLIENTS
// =========================

function afficherClients(clients) {

    clientsList.innerHTML = "";


    if (clients.length === 0) {

        clientsList.innerHTML = `
            <div class="recherche-vide">

                <i class="fa-solid fa-user-slash"></i>

                <p>
                    Aucun client trouvé.
                </p>

            </div>
        `;

        return;
    }


    clients.forEach(function(client) {

        const clientElement =
            document.createElement("div");

        clientElement.classList.add(
            "client-item"
        );


        clientElement.innerHTML = `
            <h3>
                ${client.prenom} ${client.nom}
            </h3>

            <p>
                <strong>Téléphone :</strong>
                ${client.telephone}
            </p>

            <p>
                <strong>Email :</strong>
                ${client.email}
            </p>

            <p>
                <strong>Adresse :</strong>
                ${client.adresse}
            </p>

            <div class="admin-card-actions">

                <button class="btn btn-secondary modifier-btn">
                    Modifier
                </button>

                <button class="btn btn-warning reserver-btn">
                    Réserver
                </button>

                <button class="btn btn-danger supprimer-btn">
                    Supprimer
                </button>

            </div>
        `;


        clientsList.appendChild(
            clientElement
        );


        // =========================
        // MODIFIER
        // =========================

        const modifierButton =
            clientElement.querySelector(
                ".modifier-btn"
            );


        modifierButton.addEventListener(
            "click",
            function() {

                clientEnModification =
                    client;


                document.getElementById("nom").value =
                    client.nom;

                document.getElementById("prenom").value =
                    client.prenom;

                document.getElementById("telephone").value =
                    client.telephone;

                document.getElementById("email").value =
                    client.email;

                document.getElementById("adresse").value =
                    client.adresse;


                boutonSubmit.textContent =
                    "Modifier le client";

                annulerButton.style.display =
                    "inline-block";
            }
        );


        // =========================
        // SUPPRIMER
        // =========================

        const supprimerButton =
            clientElement.querySelector(
                ".supprimer-btn"
            );


        supprimerButton.addEventListener(
            "click",
            async function() {

                const confirmation =
                    confirm(
                        `Voulez-vous vraiment supprimer ${client.prenom} ${client.nom} ?`
                    );


                if (!confirmation) {
                    return;
                }


                const { error } =
                    await supabaseClient
                        .from("clients")
                        .delete()
                        .eq("id", client.id);


                if (error) {

                    console.error(
                        "Erreur lors de la suppression du client :",
                        error
                    );

                    alert(
                        "Impossible de supprimer le client."
                    );

                    return;
                }


                alert(
                    "Client supprimé avec succès."
                );

                chargerClients();
            }
        );


        // =========================
        // RÉSERVER
        // =========================

        const reserverButton =
            clientElement.querySelector(
                ".reserver-btn"
            );


        reserverButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "reservations.html?client=" +
                    client.id;
            }
        );
    });
}


// =========================
// RECHERCHER UN CLIENT
// =========================

rechercheClient.addEventListener(
    "input",
    function() {

        const recherche =
            rechercheClient.value
                .trim()
                .toLowerCase();


        const clientsFiltres =
            clientsCharges.filter(
                function(client) {

                    const nom =
                        (client.nom || "")
                            .toLowerCase();

                    const prenom =
                        (client.prenom || "")
                            .toLowerCase();

                    const email =
                        (client.email || "")
                            .toLowerCase();


                    return (
                        nom.includes(recherche) ||
                        prenom.includes(recherche) ||
                        email.includes(recherche)
                    );
                }
            );


        afficherClients(
            clientsFiltres
        );
    }
);


// =========================
// AJOUTER / MODIFIER UN CLIENT
// =========================

clientForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const nom =
            document.getElementById("nom").value;

        const prenom =
            document.getElementById("prenom").value;

        const telephone =
            document.getElementById("telephone").value;

        const email =
            document.getElementById("email").value;

        const adresse =
            document.getElementById("adresse").value;


        const informationsClient = {
            nom: nom,
            prenom: prenom,
            telephone: telephone,
            email: email,
            adresse: adresse
        };


        // =========================
        // AJOUT
        // =========================

        if (clientEnModification === null) {

            const { error } =
                await supabaseClient
                    .from("clients")
                    .insert([
                        informationsClient
                    ]);


            if (error) {

                console.error(
                    "Erreur lors de l'ajout du client :",
                    error
                );

                return;
            }


            clientForm.reset();

            chargerClients();

            return;
        }


        // =========================
        // MODIFICATION
        // =========================

        const { error } =
            await supabaseClient
                .from("clients")
                .update(
                    informationsClient
                )
                .eq(
                    "id",
                    clientEnModification.id
                );


        if (error) {

            console.error(
                "Erreur lors de la modification du client :",
                error
            );

            return;
        }


        reinitialiserFormulaireClient();

        chargerClients();
    }
);


// =========================
// ANNULER LA MODIFICATION
// =========================

annulerButton.addEventListener(
    "click",
    function() {

        reinitialiserFormulaireClient();
    }
);


// =========================
// CHARGEMENT INITIAL
// =========================

chargerClients();