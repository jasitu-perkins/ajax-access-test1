export function performAccessibilityChecks() {
    const elements = document.querySelectorAll(".form-line.jf-required");
    let hasFormLineError = false;

    elements.forEach(element => {
        if (element.classList.contains('form-line-error')) {
            hasFormLineError = true;
        }
    });

    return !hasFormLineError;
}

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".form-line.jf-required");
    let submitClicked = false;
    let hasFormLineError = false;
    let errorMessageUpdated = false;

    const config = { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] };
    const errorObserver = new MutationObserver(handleMutations);

    elements.forEach(element => {
        errorObserver.observe(element, config);
        console.log("Observing element for changes:", element);
    });

    const submitButton = document.querySelector("button[type='submit']");
    if (submitButton) {
        submitButton.addEventListener("click", handleSubmitClick);
    }

    function handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                handleClassMutation(mutation);
            }
        });
    }

    function handleClassMutation(mutation) {
        const errorMessageContainer = mutation.target.querySelector(".form-error-message");
        if (errorMessageContainer) {
            handleErrorMessage(mutation, errorMessageContainer);
        }

        if (mutation.target.classList.contains('form-line-error') && !submitClicked) {
            handleFormLineError(mutation);
        }
    }

    function handleErrorMessage(mutation, errorMessageContainer) {
        const label = mutation.target.querySelector(".form-label");
        if (label) {
            const errorMessage = errorMessageContainer.querySelector(".error-navigation-message");
            if (!errorMessage.dataset.updated || !errorMessageUpdated) {
                const labelText = label.textContent.trim().replace("*", "");
                console.log("Original error message:", errorMessage.textContent.trim());

                if (shouldUpdateErrorMessage(errorMessage.textContent.trim())) {
                    console.log("Updating error message to:", `${labelText} is required.`);
                    errorMessage.textContent = `${labelText} is required.`;
                    errorMessage.dataset.updated = 'true';
                    errorMessageUpdated = true;
                } else {
                    console.log("Error message does not require an update.");
                }
            }
            label.appendChild(errorMessageContainer);
            errorMessageContainer.setAttribute('aria-live', 'polite');
        }
    }

    function handleFormLineError(mutation) {
        hasFormLineError = true;
        const errorMessage = mutation.target.querySelector(".form-error-message");
        if (errorMessage) {
            errorMessage.style.display = 'none';
            console.log("Hiding error message due to form submission.");
        }
        const validationError = mutation.target.querySelector(".form-validation-error");
        if (validationError) {
            validationError.classList.remove("form-validation-error");
            console.log("Removing form validation error class.");
        }
    }

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
                console.log("Focusing on the first invalid field.");
            }
        }
    }

    function shouldUpdateErrorMessage(errorMessageContent) {
        return errorMessageContent.startsWith("This field is required.");
    }
});