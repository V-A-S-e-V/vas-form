import { supabase } from "./supabaseClient.js";

const form = document.getElementById("registrationForm");
const msg = document.getElementById("messagePlaceholder");

const MESSAGES = {
  fr: { success: "Inscription réussie ✅" },
  en: { success: "Registration successful ✅" },
  de: { success: "Erfolgreiche Anmeldung ✅" },
};

function showSuccess() {
  const langSelect = document.getElementById("languageSelect");
  const lang = langSelect ? langSelect.value : "en";

  const text =
    (MESSAGES[lang] && MESSAGES[lang].success) ||
    MESSAGES.en.success;

  if (!msg) return;

  msg.textContent = text;
  msg.style.marginTop = "12px";
  msg.style.fontSize = "14px";
  msg.style.padding = "10px";
  msg.style.borderRadius = "8px";
  msg.style.background = "#e8f5ee";
  msg.style.color = "#0a7a3b";
  msg.style.border = "1px solid #b9e2c8";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  const payload = {
    first_name: data.first_name?.trim(),
    last_name: data.last_name?.trim(),
    birthday: data.date_of_birth || null,
    gender: data.gender || null,
    nationality: data.nationality?.trim(),
    country_of_origin: data.country_of_origin?.trim(),
    email: data.email?.trim(),
    phone_number: data.phone_number?.trim(),
    status: data.status || null,

    field_of_study: data.field_of_study?.trim() || null,
    university: data.university?.trim() || null,

    profession: data.profession?.trim() || null,
    work_location: data.work_location?.trim() || null,

    data_consent: data.datenschutz === "on",
    photo_consent: data.photo_consent === "on",
  };

  const { error } = await supabase
    .from("members")
    .insert([payload], { returning: "minimal" });

  if (error) {
    window.i18n?.showMessage("submit_error");
    const errorDetail = error.message || error.details || JSON.stringify(error);
    const msgEl = document.getElementById("messagePlaceholder");
    if (msgEl && errorDetail) {
      const detail = document.createElement("div");
      detail.style.marginTop = "6px";
      detail.style.fontSize = "12px";
      detail.style.opacity = "0.75";
      detail.textContent = errorDetail;
      msgEl.appendChild(detail);
    }
    console.error(error);
    return;
  }
  
    showSuccess();
    form.reset();
  
});
