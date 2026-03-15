import { supabase } from "./supabaseClient.js";

const form = document.getElementById("registrationForm");
const msg = document.getElementById("messagePlaceholder");

const ERROR_GUIDANCE = {
  fr: {
    // Doublon (email ou autre champ unique déjà enregistré)
    "23505": "Cette adresse e-mail est déjà enregistrée. Si vous avez déjà un compte, contactez-nous à info.vas.worms@gmail.com.",
    // Champ obligatoire manquant côté base
    "23502": "Un champ obligatoire est manquant. Vérifiez que tous les champs du formulaire sont bien remplis.",
    // Violation de contrainte CHECK
    "23514": "Une valeur saisie est invalide. Vérifiez le format de vos informations (ex. date, e-mail).",
    // Droits insuffisants (RLS)
    "42501": "Vous n'avez pas les droits nécessaires pour cette action. Contactez l'administrateur.",
    // Connexion réseau / fetch
    "network":  "Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.",
    // Délai dépassé
    "timeout":  "La requête a pris trop de temps. Vérifiez votre connexion et réessayez.",
    // Erreur générique
    "default":  "Fermez ce message et réessayez. Si le problème persiste, contactez info.vas.worms@gmail.com.",
  },
  en: {
    "23505": "This email address is already registered. If you already have an account, contact us at info.vas.worms@gmail.com.",
    "23502": "A required field is missing. Please make sure all form fields are filled in.",
    "23514": "An entered value is invalid. Check the format of your information (e.g. date, email).",
    "42501": "You do not have permission for this action. Please contact the administrator.",
    "network":  "Unable to reach the server. Check your internet connection and try again.",
    "timeout":  "The request took too long. Check your connection and try again.",
    "default":  "Close this message and try again. If the problem persists, contact info.vas.worms@gmail.com.",
  },
  de: {
    "23505": "Diese E-Mail-Adresse ist bereits registriert. Falls Sie bereits ein Konto haben, kontaktieren Sie uns unter info.vas.worms@gmail.com.",
    "23502": "Ein Pflichtfeld fehlt. Bitte stellen Sie sicher, dass alle Felder ausgefüllt sind.",
    "23514": "Ein eingegebener Wert ist ungültig. Überprüfen Sie das Format Ihrer Angaben (z. B. Datum, E-Mail).",
    "42501": "Sie haben keine Berechtigung für diese Aktion. Bitte kontaktieren Sie den Administrator.",
    "network":  "Der Server ist nicht erreichbar. Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
    "timeout":  "Die Anfrage hat zu lange gedauert. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    "default":  "Schließen Sie diese Meldung und versuchen Sie es erneut. Bei anhaltenden Problemen wenden Sie sich an info.vas.worms@gmail.com.",
  },
};

function getErrorGuidance(error, lang) {
  const guide = ERROR_GUIDANCE[lang] || ERROR_GUIDANCE.en;
  const code = error?.code || "";
  const msg  = (error?.message || "").toLowerCase();

  if (guide[code]) return guide[code];
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("load failed"))
    return guide["network"];
  if (msg.includes("timeout") || msg.includes("timed out"))
    return guide["timeout"];
  return guide["default"];
}

const MODAL_LABELS = {
  fr: { error: "❌ Erreur", success: "✅ Succès" },
  en: { error: "❌ Error",  success: "✅ Success" },
  de: { error: "❌ Fehler", success: "✅ Erfolg" },
};

function showModal(type, message, detail, guidance) {
  const lang    = document.getElementById("languageSelect")?.value || "en";
  const labels  = MODAL_LABELS[lang] || MODAL_LABELS.en;
  const overlay = document.getElementById("errorModal");
  const header  = document.getElementById("errorModalHeader");
  const titleEl = document.getElementById("errorModalTitle");
  const closeEl = document.getElementById("errorModalClose");

  // Title & colours
  titleEl.textContent = type === "success" ? labels.success : labels.error;
  header.className = type === "success"
    ? "error-modal-header error-modal-header--success"
    : "error-modal-header";
  closeEl.className = type === "success"
    ? "error-modal-close error-modal-close--success"
    : "error-modal-close";

  document.getElementById("errorModalMessage").textContent = message;

  const detailEl = document.getElementById("errorModalDetail");
  detailEl.textContent = detail || "";
  detailEl.style.display = detail ? "block" : "none";

  const guidanceEl = document.getElementById("errorModalGuidance");
  if (guidanceEl) {
    guidanceEl.textContent = guidance || "";
    guidanceEl.style.display = guidance ? "block" : "none";
  }

  overlay.hidden = false;

  const close = () => { overlay.hidden = true; };
  closeEl.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  // Auto-close success after 6 s
  if (type === "success") setTimeout(close, 6000);
}

const SUCCESS_MESSAGES = {
  fr: "Votre inscription a bien été enregistrée. Bienvenue au VAS Worms !",
  en: "Your registration has been saved. Welcome to VAS Worms!",
  de: "Ihre Anmeldung wurde gespeichert. Willkommen beim VAS Worms!",
};

function showSuccess() {
  const lang = document.getElementById("languageSelect")?.value || "en";
  const text = SUCCESS_MESSAGES[lang] || SUCCESS_MESSAGES.en;
  showModal("success", text);
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
    const lang = document.getElementById("languageSelect")?.value || "en";
    const genericMsg = {
      fr: "L'envoi a échoué. Veuillez réessayer.",
      en: "Submission failed. Please try again.",
      de: "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.",
    };
    const errorDetail  = error.message || error.details || JSON.stringify(error);
    const guidance     = getErrorGuidance(error, lang);
    showModal("error", genericMsg[lang] || genericMsg.en, errorDetail, guidance);
    console.error(error);
    return;
  }
  
    showSuccess();
    form.reset();
  
});
