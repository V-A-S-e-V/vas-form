import { supabase } from "./supabaseClient.js";

const form = document.getElementById("registrationForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const payload = {
    first_name: data.first_name,
    last_name: data.last_name,
    birthday: data.birthday || null,
    gender: data.gender || null,
    nationality: data.nationality,
    country_of_origin: data.country_of_origin,
    email: data.email,
    phone_number: data.phone_number,
    status: data.status,
    field_of_study: data.field_of_study || null,
    work_location: data.work_location || null,
    data_consent: data.data_consent === "on" ? true : false,
  };

  if (!payload.data_consent) {
    alert("Veuillez accepter la protection des données.");
    return;
  }

  const { error } = await supabase.from("members").insert([payload]);

  if (error) {
    console.log(error);
    alert("Erreur lors de l'inscription.");
  } else {
    alert("Inscription réussie ✅");
    form.reset();
  }
});
