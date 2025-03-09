document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const userModeRadio = document.getElementById('userMode');
    const adminModeRadio = document.getElementById('adminMode');

    // Hardcoded credentials matching the project's structure
    const credentials = {
        admin: { 
            username: 'admin', 
            password: 'admin123', 
            redirect: 'admin_dashboard.html' 
        },
        user: { 
            username: 'user', 
            password: 'user123', 
            redirect: 'films.html' 
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Determine login type based on selected radio button
        const loginType = userModeRadio.checked ? 'user' : 'admin';

        // Validate input
        if (!username || !password) {
            errorMessage.textContent = 'Veuillez remplir tous les champs';
            errorMessage.style.color = 'var(--primary-red)';
            return;
        }

        // Check credentials
        const userCredentials = credentials[loginType];
        if (userCredentials && 
            userCredentials.username === username && 
            userCredentials.password === password) {
            
            // Successful login - redirect to appropriate page
            window.location.href = userCredentials.redirect;
        } else {
            errorMessage.textContent = 'Identifiants incorrects';
            errorMessage.style.color = 'var(--primary-red)';
        }
    });

    // Optional: Add visual feedback for toggle
    function updateToggleStyle() {
        const labels = document.querySelectorAll('.toggle-label');
        labels.forEach(label => {
            label.style.fontWeight = label.previousElementSibling.checked ? 'bold' : 'normal';
        });
    }

    userModeRadio.addEventListener('change', updateToggleStyle);
    adminModeRadio.addEventListener('change', updateToggleStyle);
});
