export function performAccessibilityChecks() {
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

// Function to replace * with (Required)
function replaceRequiredText() {
    const requiredSpans = document.querySelectorAll(".jotform-form .form-line.jf-required .form-required");
    requiredSpans.forEach(span => {
        if (span.textContent.trim() === "*") {
            span.textContent = "(Required)";
            span.setAttribute('aria-hidden', 'true'); // Added aria-hidden attribute
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Call the function to replace required text
    replaceRequiredText();
    // Select all required form lines
    const elements = document.querySelectorAll(".jotform-form .form-line.jf-required");
    let submitClicked = false;
    let hasFormLineError = false;
    let errorMessageUpdated = false;

    // Configuration for the MutationObserver
    const config = { attributes: true, attributeFilter: ['class'] };
    const errorObserver = new MutationObserver(handleMutations);

    // Observe each required form line for class attribute changes
    elements.forEach(element => {
        errorObserver.observe(element, config);
        console.log("Observing element for changes:", element);
    });

    // Add click event listener to the submit button
    const submitButton = document.querySelector("button[type='submit']");
    if (submitButton) {
        submitButton.addEventListener("click", handleSubmitClick);
    }

    // Handle mutations observed by the MutationObserver
    function handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                const target = mutation.target;
                if (target.classList.contains('form-line-error')) {
                    handleClassMutation(mutation);
                }
            }
        });
    }

    // Handle class attribute mutations
    function handleClassMutation(mutation) {
        const target = mutation.target;
        const errorMessageContainer = target.querySelector(".form-error-message");
        if (errorMessageContainer) {
            handleErrorMessage(target, errorMessageContainer);
        }

        if (target.classList.contains('form-line-error') && !submitClicked) {
            handleFormLineError(target);
        }
    }

    // Handle form line errors
    function handleFormLineError(target) {
        hasFormLineError = true;
        const errorMessage = target.querySelector(".form-error-message");
        if (errorMessage) {
            errorMessage.style.display = 'none';
            console.log("Hiding error message due to form submission.");
        }
        const validationError = target.querySelector(".form-validation-error");
        if (validationError) {
            validationError.classList.remove("form-validation-error");
            console.log("Removing form validation error class.");
        }
    }

    // Handle error message updates
    function handleErrorMessage(target, errorMessageContainer) {
        const label = target.querySelector(".form-label");
        if (label) {
            const errorMessage = errorMessageContainer.querySelector(".error-navigation-message");
            if (!errorMessage.dataset.updated || !errorMessageUpdated) {
                // Remove the (Required) text from the label
                const labelText = label.textContent.replace("*", "").replace("(Required)", "").trim();
                console.log("Original error message:", errorMessage.textContent);

                if (shouldUpdateErrorMessage(errorMessage.textContent)) {
                    console.log("Updating error message to:", `${labelText} is required.`);
                    errorMessage.textContent = `${labelText} is required.`;
                    errorMessage.dataset.updated = 'true';
                    errorMessageUpdated = true;
                } else {
                    console.log("Error message does not require an update.");
                }
            }
        }
    }

    // Handle form line errors
    function handleFormLineError(target) {
        hasFormLineError = true;
        const errorMessage = target.querySelector(".form-error-message");
        if (errorMessage) {
            errorMessage.style.display = 'none';
            console.log("Hiding error message due to form submission.");
        }
        const validationError = target.querySelector(".form-validation-error");
        if (validationError) {
            validationError.classList.remove("form-validation-error");
            console.log("Removing form validation error class.");
        }
    }

    // Handle submit button click
    function handleSubmitClick() {
        submitClicked = true;
        console.log("Submit button clicked.");
        elements.forEach(element => {
            const validationError = element.querySelector(".form-validation-error");
            if (validationError) {
                validationError.classList.add("form-validation-error");
                console.log("Re-adding form validation error class.");
            }
        });

        if (hasFormLineError) {
            const firstInvalidField = document.querySelector(".form-line-error input");
            if (firstInvalidField) {
                firstInvalidField.focus();
                errorMessageContainer.setAttribute('aria-live', 'polite');
                console.log("Focusing on the first invalid field.");
            }
        }
    }

    // Determine if the error message should be updated
    function shouldUpdateErrorMessage(errorMessageContent) {
        return errorMessageContent.startsWith("This field is required.");
    }
});