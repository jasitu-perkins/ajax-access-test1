// Ensure performAccessibilityChecks is defined in the global scope
function performAccessibilityChecks() {
    const elements = document.querySelectorAll(".jotform-form .form-line.jf-required");
    let hasFormLineError = false;

    elements.forEach(element => {
        if (element.classList.contains('form-line-error')) {
            hasFormLineError = true;
        }
    });

    return !hasFormLineError;
}

// Function to replace * with (Required)
function replaceRequiredText() {
    const requiredSpans = document.querySelectorAll(".jotform-form .form-line.jf-required .form-required");
    requiredSpans.forEach(span => {
        if (span.textContent.trim() === "*") {
            span.textContent = "(Required)";
            span.setAttribute('aria-hidden', 'true');
        }
    });
}

function onDocumentReady() {
    console.log("Document is ready. Initializing form handlers...");
    const forms = document.querySelectorAll('.jotform-form');

    if (forms.length > 0) {
        forms.forEach(handleFormSubmit);
    }

    function handleFormSubmit(form) {
        console.log("Attaching submit handler to form:", form);
        form.addEventListener('submit', handleSubmit.bind(null, form));
    }

    async function handleSubmit(form, event) {
        event.preventDefault();
        console.log("Form submit intercepted. Performing accessibility checks...");

        const hasRequiredErrors = !performAccessibilityChecks();
        if (hasRequiredErrors) {
            console.error("Accessibility checks failed. Form submission halted.");
            return;
        }

        console.log("Accessibility checks passed. Submitting form via AJAX...");
        const formData = new FormData(form);
        const submissionUrl = form.action;

        console.log("Submission URL:", submissionUrl);
        console.log("Form Data:", Array.from(formData.entries()));

        try {
            const response = await fetch(submissionUrl, {
                method: 'POST',
                body: formData
            });

            console.log("Fetch response status:", response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const html = await response.text();
            console.log("Response HTML:", html);
            parseHtmlAndReplaceForm(html, form);
        } catch (error) {
            console.error("Error during fetch:", error.message);
            handleError(form, error.message);
        }
    }

    function handleError(form, message) {
        console.error(message);
        form.innerHTML = `<p>${message}</p>`;
    }

    function parseHtmlAndReplaceForm(html, form) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const divElement = document.createElement('div');

        Array.from(doc.body.attributes).forEach(attr => {
            divElement.setAttribute(attr.name, attr.value);
        });

        divElement.innerHTML = doc.body.innerHTML;
        form.parentNode.replaceChild(divElement, form);
    }

    // Call the function to replace required text
    replaceRequiredText();
}

// Initialize the document ready function
document.addEventListener('DOMContentLoaded', onDocumentReady);