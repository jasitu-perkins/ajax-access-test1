// Ensure performAccessibilityChecks is defined in the global scope
// If it's in access-new.js, make sure to include that script in your HTML before this one

function performAccessibilityChecks() {
    // Select all required form lines
    const elements = document.querySelectorAll(".jotform-form .form-line.jf-required");
    let hasFormLineError = false;

    // Check if any form line has an error
    elements.forEach(element => {
        if (element.classList.contains('form-line-error')) {
            hasFormLineError = true;
        }
    });

    // Return true if no form line errors are found
    return !hasFormLineError;
}

export function onDocumentReady() {
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

        // Check for required errors before proceeding
        const hasRequiredErrors = !performAccessibilityChecks(); // Call the function from access-new.js
        if (hasRequiredErrors) {
            console.error("Accessibility checks failed. Form submission halted.");
            return;
        }

        console.log("Accessibility checks passed. Submitting form via AJAX...");
        const formData = new FormData(form);
        const submissionUrl = form.action;

        console.log("Submission URL:", submissionUrl);
        console.log("Form Data:", Array.from(formData.entries())); // Log form data entries

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
            console.log("Response HTML:", html); // Log the response HTML
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

    function addCssFromInlineString(css) {
        const head = document.getElementsByTagName('head')[0];
        const s = document.createElement('style');
        s.setAttribute('type', 'text/css');
        if (s.styleSheet) {
            s.styleSheet.cssText = css;
        } else {
            s.appendChild(document.createTextNode(css));
        }
        head.appendChild(s);
    }
}

document.addEventListener('DOMContentLoaded', onDocumentReady);