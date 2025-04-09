// Add this at the beginning of the file
// Add this debounce function at the beginning
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    // Add debounced validation
    const debouncedValidation = debounce((e) => validateField(e), 500);

    // Update event listeners for required fields
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('input', debouncedValidation);
        input.addEventListener('blur', validateField);
        input.addEventListener('input', checkFormValidity);
    });

    // Add password toggle functionality
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = '🔒';
            } else {
                passwordInput.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // Add terms checkbox listener
    const termsCheckbox = document.getElementById('terms');
    termsCheckbox.addEventListener('change', checkFormValidity);
});

// Update password validation in validateField function
function validateField(event) {
    const input = event.target;
    clearErrorForInput(input);
    
    switch(input.id) {
        case 'fullname':
            if (input.value.trim().length < 2) {
                showError(input, 'Name must be at least 2 characters long');
            }
            break;
            
        case 'email':
            if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(input.value)) {
                showError(input, 'Please enter a valid email address');
            }
            break;
            
        case 'password':
            const password = input.value;
            if (password.length < 8) {
                showError(input, 'Password must be at least 8 characters long');
            } else if (!/[A-Z]/.test(password)) {
                showError(input, 'Password must contain at least one uppercase letter');
            } else if (!/[a-z]/.test(password)) {
                showError(input, 'Password must contain at least one lowercase letter');
            } else if (!/\d/.test(password)) {
                showError(input, 'Password must contain at least one number');
            } else if (!/[@$!%*?&]/.test(password)) {
                showError(input, 'Password must contain at least one special character (@$!%*?&)');
            }
            
            // Also validate confirm password if it has a value
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword.value) {
                validateField({ target: confirmPassword });
            }
            break;
            
        case 'confirmPassword':
            const originalPassword = document.getElementById('password').value;
            if (input.value && input.value !== originalPassword) {
                showError(input, 'Passwords do not match');
            }
            break;
            
        case 'phone':
            if (input.value && !input.value.match(/^\d{10}$/)) {
                showError(input, 'Please enter a valid 10-digit phone number');
            }
            break;
            
        case 'dob':
            const age = new Date().getFullYear() - new Date(input.value).getFullYear();
            if (age < 18) {
                showError(input, 'You must be at least 18 years old');
            }
            break;
    }
    
    checkFormValidity();
}

function clearErrorForInput(input) {
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.classList.remove('error');
}

function checkFormValidity() {
    const form = document.getElementById('registrationForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const dob = document.getElementById('dob');
    const terms = document.getElementById('terms');

    // Check all required fields are filled
    const isValidName = fullname.value.trim().length >= 2;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    const isValidPassword = password.value.length >= 8 && 
                          /[A-Z]/.test(password.value) && 
                          /[a-z]/.test(password.value) && 
                          /\d/.test(password.value) && 
                          /[@$!%*?&]/.test(password.value);
    const isValidConfirmPassword = password.value === confirmPassword.value && confirmPassword.value !== '';
    const isValidDob = dob.value && (new Date().getFullYear() - new Date(dob.value).getFullYear() >= 18);
    const isTermsAccepted = terms.checked;

    // Enable submit button only if all validations pass
    submitButton.disabled = !(isValidName && 
                            isValidEmail && 
                            isValidPassword && 
                            isValidConfirmPassword && 
                            isValidDob && 
                            isTermsAccepted);
}

// Fix validateForm function
function validateForm(event) {
    event.preventDefault();
    
    // Reset error states
    clearErrors();
    
    let isValid = true;
    
    // Get form elements
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const phone = document.getElementById('phone');
    const dob = document.getElementById('dob');

    // Validate full name
    if (fullname.value.trim().length < 2) {
        showError(fullname, 'Name must be at least 2 characters long');
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password.value)) {
        showError(password, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
        isValid = false;
    }

    // Validate password confirmation
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }

    // Validate phone (if provided)
    if (phone.value && !phone.value.match(/^\d{10}$/)) {
        showError(phone, 'Please enter a valid 10-digit phone number');
        isValid = false;
    }

    // Validate date of birth
    const today = new Date();
    const birthDate = new Date(dob.value);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
        showError(dob, 'You must be at least 18 years old');
        isValid = false;
    }

    if (isValid) {
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        alert('Registration successful!');
        document.getElementById('registrationForm').reset();
        checkFormValidity(); // Add this to reset button state after form reset
    }

    return false;
}

function showError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerText = message;
    
    // If input is inside password-container, append error after the container
    const passwordContainer = input.closest('.password-container');
    if (passwordContainer) {
        passwordContainer.parentNode.appendChild(errorDiv);
    } else {
        input.parentNode.appendChild(errorDiv);
    }
}

function clearErrorForInput(input) {
    // If input is inside password-container, look for error in parent's parent
    const container = input.closest('.password-container');
    const searchElement = container ? container.parentNode : input.parentNode;
    
    const errorMessage = searchElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.classList.remove('error');
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
    
    const inputs = document.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
}