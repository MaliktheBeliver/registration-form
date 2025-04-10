// Debounce utility to limit how often a function runs
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const termsCheckbox = document.getElementById('terms');
    const toggleButtons = document.querySelectorAll('.toggle-password');

    submitButton.disabled = true;

    // Show/hide password toggle
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = document.getElementById(button.dataset.target);
            const isHidden = target.type === 'password';
            target.type = isHidden ? 'text' : 'password';
            button.textContent = isHidden ? '🔒' : '👁️';
        });
    });

    // Debounced input validation
    const debouncedValidate = debounce(validateField, 500);

    requiredFields.forEach(field => {
        field.addEventListener('input', debouncedValidate);
        field.addEventListener('blur', validateField);
        field.addEventListener('input', checkFormValidity);
    });

    termsCheckbox.addEventListener('change', checkFormValidity);

    // Handle form submission
    form.addEventListener('submit', validateForm);
});

// Validate individual fields
function validateField(e) {
    const input = e.target;
    clearError(input);

    const value = input.value.trim();
    const id = input.id;
    const show = (msg) => showError(input, msg);

    switch (id) {
        case 'fullname':
            if (value.length < 2) show('Name must be at least 2 characters');
            break;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) show('Enter a valid email');
            break;
        case 'password':
            if (value.length < 8) show('Password must be at least 8 characters');
            else if (!/[A-Z]/.test(value)) show('Add an uppercase letter');
            else if (!/[a-z]/.test(value)) show('Add a lowercase letter');
            else if (!/\d/.test(value)) show('Add a number');
            else if (!/[@$!%*?&]/.test(value)) show('Add a special character (@$!%*?&)');

            const confirm = document.getElementById('confirmPassword');
            if (confirm.value) validateField({ target: confirm });
            break;
        case 'confirmPassword':
            const pwd = document.getElementById('password').value;
            if (value && value !== pwd) show('Passwords do not match');
            break;
        case 'phone':
            if (value && !/^\d{10}$/.test(value)) show('Enter a 10-digit phone number');
            break;
        case 'dob':
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) show('You must be at least 18 years old');
            break;
    }

    checkFormValidity();
}

// Check overall form validity and toggle submit button
function checkFormValidity() {
    const get = id => document.getElementById(id);

    const fullname = get('fullname').value.trim().length >= 2;
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email').value);
    const password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(get('password').value);
    const confirmPassword = get('confirmPassword').value === get('password').value && get('confirmPassword').value !== '';
    const dob = get('dob').value && (new Date().getFullYear() - new Date(get('dob').value).getFullYear() >= 18);
    const terms = get('terms').checked;

    const allValid = fullname && email && password && confirmPassword && dob && terms;

    document.querySelector('button[type="submit"]').disabled = !allValid;
}

// Final form validation on submit
function validateForm(e) {
    e.preventDefault();
    clearErrors();

    let valid = true;
    const get = id => document.getElementById(id);
    const show = (input, msg) => {
        showError(input, msg);
        valid = false;
    };

    const fullname = get('fullname');
    if (fullname.value.trim().length < 2) show(fullname, 'Name must be at least 2 characters');

    const email = get('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) show(email, 'Invalid email address');

    const password = get('password');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password.value)) {
        show(password, 'Password must be 8+ chars, with uppercase, lowercase, number & special char');
    }

    const confirmPassword = get('confirmPassword');
    if (password.value !== confirmPassword.value) show(confirmPassword, 'Passwords do not match');

    const phone = get('phone');
    if (phone.value && !/^\d{10}$/.test(phone.value)) show(phone, 'Enter valid 10-digit phone number');

    const dob = get('dob');
    const age = new Date().getFullYear() - new Date(dob.value).getFullYear();
    if (age < 18) show(dob, 'You must be 18+');

    if (valid) {
        alert('✅ Registration successful!');
        document.getElementById('registrationForm').reset();
        checkFormValidity();
    }

    return false;
}

// Show error message
function showError(input, message) {
    input.classList.add('error');
    const error = document.createElement('div');
    error.className = 'error-message';
    error.innerText = message;

    const container = input.closest('.password-container')?.parentNode || input.parentNode;
    container.appendChild(error);
}

// Clear error for a single input
function clearError(input) {
    const container = input.closest('.password-container')?.parentNode || input.parentNode;
    const error = container.querySelector('.error-message');
    if (error) error.remove();
    input.classList.remove('error');
}

// Clear all error messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    document.querySelectorAll('.error').forEach(i => i.classList.remove('error'));
}
