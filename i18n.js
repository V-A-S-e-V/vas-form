// i18n.js - Simplified version with always visible messages
class I18n {
    constructor() {
        this.defaultLocale = 'de';
        this.locale = this.defaultLocale;
        this.translations = {};
        this.supportedLocales = ['de', 'en', 'fr'];

        this.init();
    }

    async init() {
        // Force English on first load, ignore saved preference
        const isFirstVisit = !localStorage.getItem('hasVisitedBefore');

        if (isFirstVisit) {
            // First time visitor - force English
            localStorage.setItem('hasVisitedBefore', 'true');
            await this.setLocale('en');
        } else {
            // Returning visitor - use saved preference or default to English
            const savedLocale = localStorage.getItem('preferred-locale');
            const initialLocale = savedLocale && this.supportedLocales.includes(savedLocale)
                ? savedLocale
                : 'en'; // Default to English if no valid saved preference

            await this.setLocale(initialLocale);
        }

        this.setupEventListeners();
        this.setDefaultMessage();
    }

    async setLocale(newLocale) {
        if (newLocale === this.locale) return;

        if (!this.supportedLocales.includes(newLocale)) {
            newLocale = this.defaultLocale;
        }

        try {
            this.translations = await this.fetchTranslations(newLocale);
            this.locale = newLocale;

            // Update HTML lang attribute
            document.documentElement.lang = this.locale;

            // Translate the page
            this.translatePage();

            // Update language selector
            this.updateLanguageSelector();

            // Save preference
            localStorage.setItem('preferred-locale', this.locale);
        } catch (error) {
            console.error(`Failed to set locale to ${newLocale}:`, error);
        }
    }

    async fetchTranslations(locale) {
        try {
            const response = await fetch(`locales/${locale}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading translations for ${locale}:`, error);
            if (locale !== 'de') {
                return await this.fetchTranslations('de');
            }
            return {};
        }
    }

    // Set default VAS Worms message
    setDefaultMessage() {
        const placeholder = document.getElementById('messagePlaceholder');
        if (placeholder && !placeholder.textContent) {
            placeholder.textContent = 'VAS Worms';
            placeholder.className = 'message-placeholder';
        }
    }

    // Helper method to show messages
    showMessage(type) {
        const messages = {
            'de': {
                'success': '✅ Registrierung erfolgreich! Vielen Dank für Ihre Anmeldung.',
                'age_error': '❌ Sie müssen mindestens 18 Jahre alt sein, um sich zu registrieren.',
                'datenschutz_error': '❌ Sie müssen den Datenschutzbestimmungen zustimmen.',
                'fields_error': '❌ Bitte füllen Sie alle erforderlichen Felder aus.',
                'status_error': '❌ Bitte wählen Sie Ihren Status aus.',
                'student_fields_error': '❌ Bitte füllen Sie Hochschule und Studiengang aus.',
                'worker_fields_error': '❌ Bitte geben Sie Ihren Beruf an.',
                'photo_consent_error': '❌ Sie müssen der Veröffentlichung von Fotos und Videos zustimmen.',
                'status_mismatch': '❌ Bitte überprüfen Sie Ihre Statusinformationen.'
            },
            'en': {
                'success': '✅ Registration successful! Thank you for signing up.',
                'age_error': '❌ You must be at least 18 years old to register.',
                'datenschutz_error': '❌ You must agree to the data protection terms.',
                'fields_error': '❌ Please fill in all required fields.',
                'status_error': '❌ Please select your status.',
                'student_fields_error': '❌ Please fill in university and field of study.',
                'worker_fields_error': '❌ Please enter your profession.',
                'photo_consent_error': '❌ You must agree to the publication of photos and videos.',
                'status_mismatch': '❌ Please check your status information.'
            },
            'fr': {
                'success': '✅ Inscription réussie ! Merci de vous être inscrit.',
                'age_error': '❌ Vous devez avoir au moins 18 ans pour vous inscrire.',
                'datenschutz_error': '❌ Vous devez accepter les conditions de protection des données.',
                'fields_error': '❌ Veuillez remplir tous les champs obligatoires.',
                'status_error': '❌ Veuillez sélectionner votre statut.',
                'student_fields_error': '❌ Veuillez remplir l\'université et la filière.',
                'worker_fields_error': '❌ Veuillez indiquer votre profession.',
                'photo_consent_error': '❌ Vous devez accepter la publication de photos et vidéos.',
                'status_mismatch': '❌ Veuillez vérifier vos informations de statut.'
            }
        };

        const message = messages[this.locale]?.[type] || messages['en'][type];
        if (message) {
            this.displayMessage(message, type === 'success' ? 'success' : 'error');
        }
    }

    // Display messages in placeholder
    displayMessage(text, type) {
        const placeholder = document.getElementById('messagePlaceholder');
        if (!placeholder) return;

        // Set message text and class
        placeholder.textContent = text;
        placeholder.className = 'message-placeholder'; // Reset class

        // Add appropriate class based on type
        if (type === 'success') {
            placeholder.classList.add('message-success');
        } else {
            placeholder.classList.add('message-error');
        }

        // For success messages, reset to default after 8 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.setDefaultMessage();
            }, 8000);
        }
    }

    // Helper method to get form data
    getFormData() {
        const form = document.getElementById('registrationForm');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    resetFieldBorders() {
        const allInputs = document.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.style.borderColor = '';
        });
    }

    translatePage() {
        // Translate all elements with data-i18n-key
        document.querySelectorAll("[data-i18n-key]").forEach(element => {
            const key = element.getAttribute("data-i18n-key");
            const translation = this.translations[key];

            if (translation !== undefined) {
                if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                    element.value = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    updateLanguageSelector() {
        const selector = document.getElementById('languageSelect');
        if (selector && this.locale) {
            selector.value = this.locale;
        }
    }

    setupEventListeners() {
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.setLocale(e.target.value);
            });
        }

        // Date of birth validation
        const dobInput = document.querySelector('input[name="date_of_birth"]');
        if (dobInput) {
            const today = new Date();
            const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            dobInput.max = maxDate.toISOString().split('T')[0];
        }

        // Status change handler - FIXED VERSION
        const statusRadios = document.querySelectorAll('input[name="status"]');
        const studentFields = document.getElementById('studentFields');
        const workerFields = document.getElementById('workerFields');

        statusRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('Status changed to:', e.target.value);

                // Clear status error when user selects an option
                this.clearRadioError('status');

                // Remove show class from both fields first
                studentFields.classList.remove('show');
                workerFields.classList.remove('show');

                if (e.target.value === 'student') {
                    studentFields.classList.add('show');
                    workerFields.classList.remove('show');

                    // Make student fields required
                    const universityInput = document.querySelector('input[name="university"]');
                    const fieldOfStudyInput = document.querySelector('input[name="field_of_study"]');
                    const professionInput = document.querySelector('input[name="profession"]');

                    if (universityInput) universityInput.required = true;
                    if (fieldOfStudyInput) fieldOfStudyInput.required = true;
                    if (professionInput) professionInput.required = false;

                } else if (e.target.value === 'worker') {
                    studentFields.classList.remove('show');
                    workerFields.classList.add('show');

                    // Make worker field required
                    const universityInput = document.querySelector('input[name="university"]');
                    const fieldOfStudyInput = document.querySelector('input[name="field_of_study"]');
                    const professionInput = document.querySelector('input[name="profession"]');

                    if (universityInput) universityInput.required = false;
                    if (fieldOfStudyInput) fieldOfStudyInput.required = false;
                    if (professionInput) professionInput.required = true;
                }
            });
        });


        // Gender change handler - clear error when user selects
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.clearRadioError('gender');
            });
        });

        // Form submission
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Reset all errors and field borders
                this.resetFieldBorders();
                this.clearAllRadioErrors();

                let isValid = true;

                // Check basic required fields including new ones
                const requiredFields = registrationForm.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#ff4444';
                    }
                });

                // Check gender selection (now with 3 options)
                const selectedGender = registrationForm.querySelector('input[name="gender"]:checked');
                if (!selectedGender) {
                    isValid = false;
                    this.showRadioError('gender', this.getRadioErrorMessage('gender_error'));
                }

                // Check status selection
                const selectedStatus = registrationForm.querySelector('input[name="status"]:checked');
                if (!selectedStatus) {
                    isValid = false;
                    this.showRadioError('status', this.getRadioErrorMessage('status_error'));
                }

                // Check both consent checkboxes
                if (!registrationForm.querySelector('input[name="datenschutz"]').checked) {
                    isValid = false;
                    this.showMessage('datenschutz_error');
                }

                if (!registrationForm.querySelector('input[name="photo_consent"]').checked) {
                    isValid = false;
                    this.showMessage('photo_consent_error');
                }

                if (!isValid) {
                    this.showMessage('fields_error');
                    return false;
                }

                // Check age
                const dateOfBirth = new Date(registrationForm.querySelector('input[name="date_of_birth"]').value);
                const today = new Date();
                const age = today.getFullYear() - dateOfBirth.getFullYear();
                const monthDiff = today.getMonth() - dateOfBirth.getMonth();
                const isExactly18 = age === 18 && monthDiff < 0;

                if (age < 18 || isExactly18) {
                    this.showMessage('age_error');
                    return false;
                }

                // Check data protection
                if (!registrationForm.querySelector('input[name="datenschutz"]').checked) {
                    this.showMessage('datenschutz_error');
                    return false;
                }

                // Validate status-specific fields
                const status = selectedStatus.value;
                let statusValid = true;

                if (status === 'student') {
                    const university = registrationForm.querySelector('input[name="university"]').value.trim();
                    const fieldOfStudy = registrationForm.querySelector('input[name="field_of_study"]').value.trim();

                    if (!university || !fieldOfStudy) {
                        statusValid = false;
                        if (!university) registrationForm.querySelector('input[name="university"]').style.borderColor = '#ff4444';
                        if (!fieldOfStudy) registrationForm.querySelector('input[name="field_of_study"]').style.borderColor = '#ff4444';
                        this.showMessage('student_fields_error');
                    }

                    // Additional validation: if worker fields have data but status is student
                    const profession = registrationForm.querySelector('input[name="profession"]').value.trim();
                    if (profession) {
                        this.showMessage('status_mismatch');
                        statusValid = false;
                    }

                } else if (status === 'worker') {
                    const profession = registrationForm.querySelector('input[name="profession"]').value.trim();

                    if (!profession) {
                        statusValid = false;
                        registrationForm.querySelector('input[name="profession"]').style.borderColor = '#ff4444';
                        this.showMessage('worker_fields_error');
                    }

                    // Additional validation: if student fields have data but status is worker
                    const university = registrationForm.querySelector('input[name="university"]').value.trim();
                    const fieldOfStudy = registrationForm.querySelector('input[name="field_of_study"]').value.trim();
                    if (university || fieldOfStudy) {
                        this.showMessage('status_mismatch');
                        statusValid = false;
                    }
                }

                if (!statusValid) {
                    return false;
                }

                // If everything is valid
                this.showMessage('success');
                console.log('Form submitted successfully with data:', this.getFormData());

                // Here you would typically send the data to your backend
                // registrationForm.submit(); // Uncomment when backend is ready

                return false;
            });
        }
    }

    // New helper methods for radio button validation
    showRadioError(type, message) {
        const errorElement = document.getElementById(`${type}Error`);
        const sectionElement = document.getElementById(`${type}Section`);

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        if (sectionElement) {
            sectionElement.classList.add('error');
        }
    }

    clearRadioError(type) {
        const errorElement = document.getElementById(`${type}Error`);
        const sectionElement = document.getElementById(`${type}Section`);

        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }

        if (sectionElement) {
            sectionElement.classList.remove('error');
        }
    }

    clearAllRadioErrors() {
        this.clearRadioError('gender');
        this.clearRadioError('status');
    }

    getRadioErrorMessage(type) {
        const messages = {
            'gender_error': {
                'de': 'Bitte wählen Sie ein Geschlecht aus',
                'en': 'Please select a gender',
                'fr': 'Veuillez sélectionner un genre'
            },
            'status_error': {
                'de': 'Bitte wählen Sie Ihren Status aus',
                'en': 'Please select your status',
                'fr': 'Veuillez sélectionner votre statut'
            }
        };

        return messages[type]?.[this.locale] || messages[type]?.['en'] || 'This field is required';
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});

// Make setLocale available globally
window.setLocale = (locale) => {
    if (window.i18n) {
        window.i18n.setLocale(locale);
    }
};