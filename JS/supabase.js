const supabaseURL =
    "https://ljvwkuljfwwwqwyruofr.supabase.co";

const supabasePublishedKey =
    "sb_publishable_SO7N5d_3OcrUJ_sirP8OMg_Xk6htOjf";


const supabaseClient =
    window.supabase.createClient(
        supabaseURL,
        supabasePublishedKey
    );


console.log(
    "Connexion à Supabase réussie :",
    supabaseClient
);