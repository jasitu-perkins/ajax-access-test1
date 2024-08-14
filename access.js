document.addEventListener("DOMContentLoaded", function () {
    var elements = document.querySelectorAll(".form-line");
    var submitClicked = false;
    var hasFormLineError = false;
    var errorMessageUpdated = false; // Flag to track if the error message has been updated
  
    var config = { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] };
  
    var errorObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          var errorMessageContainer = mutation.target.querySelector(".form-error-message");
          if (errorMessageContainer) {
            var label = mutation.target.querySelector(".form-label");
            if (label) {
              var errorMessage = errorMessageContainer.querySelector(".error-navigation-message");
              if (!errorMessage.dataset.updated ||!errorMessageUpdated) {
                var labelText = label.textContent.trim().replace("*", "");
                // Log the original error message
                console.log("Original error message:", errorMessage.textContent.trim());
  
                // Dynamically decide whether to update the error message
                if (shouldUpdateErrorMessage(errorMessage.textContent.trim())) {
                  // Log the action of updating the error message
                  console.log("Updating error message to:", labelText + " is required.");
                  // Update the error message
                  errorMessage.textContent = labelText + " is required.";
                  // Mark the error message as updated
                  errorMessage.dataset.updated = 'true';
                  errorMessageUpdated = true; // Set the flag indicating the error message was updated
                } else {
                  // Log if the error message does not require an update
                  console.log("Error message does not require an update.");
                }
              }
              label.appendChild(errorMessageContainer);
              errorMessageContainer.setAttribute('aria-live', 'polite');
            }
          }
  
          if (mutation.target.classList.contains('form-line-error') &&!submitClicked) {
            hasFormLineError = true;
            var errorMessage = mutation.target.querySelector(".form-error-message");
            if (errorMessage) {
              errorMessage.style.display = 'none';
              console.log("Hiding error message due to form submission.");
            }
            var validationError = mutation.target.querySelector(".form-validation-error");
            if (validationError) {
              validationError.classList.remove("form-validation-error");
              console.log("Removing form validation error class.");
            }
          }
        }
      });
    });
  
    elements.forEach(function(element) {
      errorObserver.observe(element, config);
      console.log("Observing element for changes:", element);
    });
  
    var submitButton = document.querySelector("button[type='submit']");
  
    if (submitButton) {
      submitButton.addEventListener("click", function(event) {
        submitClicked = true;
        console.log("Submit button clicked.");
        elements.forEach(function(element) {
          var validationError = element.querySelector(".form-validation-error");
          if (validationError) {
            validationError.classList.add("form-validation-error");
            console.log("Re-adding form validation error class.");
          }
        });
  
        if (hasFormLineError) {
          var firstInvalidField = document.querySelector(".form-line-error input");
          if (firstInvalidField) {
            firstInvalidField.focus();
            console.log("Focusing on the first invalid field.");
          }
        }
      });
    }
  
    // Function to determine if the error message should be updated
    function shouldUpdateErrorMessage(errorMessageContent) {
      // Implement your logic here to decide whether to update the error message
      // For example, you could check if the message starts with "This field is required."
      // or if it matches a regex pattern for common validation errors.
      // Return true if the message should be updated, false otherwise.
      return errorMessageContent.startsWith("This field is required.");
    }
});

export function performAccessibilityChecks() {
    console.log("Performing accessibility checks...");
    const elements = document.querySelectorAll(".form-line");
    let hasFormLineError = false;

    elements.forEach(element => {
        if (element.classList.contains('form-line-error')) {
            hasFormLineError = true;
        }
    });

    return !hasFormLineError;
}