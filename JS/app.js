
let clientEnModification = null;

async function chargerClients()
{
    const { data, error } = await supabaseClient
        .from("clients")
        .select("*");

    console.log("Clients récupérés :", data);
    console.log("Erreur :", error);

    const clientsList = document.getElementById("clients-list");

    clientsList.innerHTML = "";

    if (error) 
    {
        clientsList.textContent = "Impossible de charger les clients.";
        return;
    }

    data.forEach(function(client) 
    {
        const clientElement = document.createElement("div");

        clientElement.innerHTML = `
            <h3>${client.prenom} ${client.nom}</h3>
            <p>Téléphone : ${client.telephone}</p>
            <p>Email : ${client.email}</p>
            <p>Adresse : ${client.adresse}</p>
            <button class="modifier-btn">Modifier</button>
            <button class="supprimer-btn">Supprimer</button>
        `;

        clientsList.appendChild(clientElement);


        const modifierButton = clientElement.querySelector(".modifier-btn");
        modifierButton.addEventListener("click", function() 
        {
            console.log("Client à modifier :", client);

            clientEnModification = client;

            document.getElementById("nom").value = client.nom;
            document.getElementById("prenom").value = client.prenom;
            document.getElementById("telephone").value = client.telephone;
            document.getElementById("email").value = client.email;
            document.getElementById("adresse").value = client.adresse;
            document.getElementById("client-submit-btn").textContent = "Modifier le client";
            document.getElementById("annuler-btn").style.display = "inline-block";
        });

        

        const supprimerButton = clientElement.querySelector(".supprimer-btn");
        supprimerButton.addEventListener("click", async function() 
        {
            const confirmation = confirm(`Voulez-vous vraiment supprimer ${client.prenom} ${client.nom} ?`);

            if (!confirmation) 
            {
                return;
            }

            const { error } = await supabaseClient
            .from("clients")
            .delete()
            .eq("id", client.id);

            console.log("Erreur suppression :", error);

            if (error)
            {
                alert("Impossible de supprimer le client.");
                return;
            }

            alert("Client supprimé avec succès.");

            chargerClients();
        });


    });
}

chargerClients();


const clientForm = document.getElementById("client-form");

clientForm.addEventListener("submit", async function(event) 
{
    event.preventDefault();

    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const telephone = document.getElementById("telephone").value;
    const email = document.getElementById("email").value;
    const adresse = document.getElementById("adresse").value;

    const informationsClient = 
    {
        nom: nom,
        prenom: prenom,
        telephone: telephone,
        email: email,
        adresse: adresse
    };

    if (clientEnModification === null)
    {
        const { data, error } = await supabaseClient
        .from("clients")
        .insert([informationsClient])
        .select();
            
        console.log("Client ajouté :", data);
        console.log("Erreur :", error);
            
        if (!error)
        {
            clientForm.reset();
            chargerClients();
        }

    }else
    {
        const { data, error } = await supabaseClient
        .from("clients")
        .update(informationsClient)
        .eq("id", clientEnModification.id)
        .select();
            
        console.log("Client modifié :", data);
        console.log("Erreur :", error);

        if (!error) 
        {
            clientForm.reset();

            clientEnModification = null;

            document.getElementById("client-submit-btn").textContent = "Ajouter le client";
            document.getElementById("annuler-btn").style.display = "none";

            chargerClients();
        }

    }



});


const annulerButton = document.getElementById("annuler-btn");

annulerButton.addEventListener("click", function()
{
    clientForm.reset();

    clientEnModification = null;

    document.getElementById("client-submit-btn").textContent = "Ajouter le client";
    annulerButton.style.display = "none";
});


