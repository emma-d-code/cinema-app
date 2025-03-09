document.addEventListener('DOMContentLoaded', function() {
    // Simulated admin user data
    const adminUser = {
        nom: 'Mekkaoui',
        prenom: 'Imane',
        matricule: 'IM123',
        role: 'Gerente',
        email: 'Imane.Mekkaoui@cine-Univers.ma',
        telephone: '+212 (0) 6 XX XX XX XX',
        profileImage: 'https://bootdey.com/img/Content/avatar/avatar3.png',
        derniereConnexion: new Date().toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Populate profile fields
    document.getElementById('nomAdmin').value = adminUser.nom;
    document.getElementById('prenomAdmin').value = adminUser.prenom;
    document.getElementById('matriculeAdmin').value = adminUser.matricule;
    document.getElementById('roleAdmin').value = adminUser.role;
    document.getElementById('emailAdmin').value = adminUser.email;
    document.getElementById('telephoneAdmin').value = adminUser.telephone;
    document.getElementById('derniereConnexion').textContent = adminUser.derniereConnexion;

    // Set initial profile image
    const profileImage = document.querySelector('.profile-image');
    profileImage.src = adminUser.profileImage;

    // Photo upload functionality
    const editProfileIcon = document.querySelector('.edit-profile-icon');
    editProfileIcon.addEventListener('click', function() {
        // Create file input dynamically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Update profile image
                    profileImage.src = e.target.result;
                    adminUser.profileImage = e.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Trigger file selection
        fileInput.click();
    });

    // Profile Edit Modal Functionality
    const editProfileModal = document.getElementById('editProfileModal');
    const saveProfileChanges = document.getElementById('saveProfileChanges');

    // Populate edit modal fields when opened
    editProfileModal.addEventListener('show.bs.modal', function () {
        document.getElementById('editNom').value = adminUser.nom;
        document.getElementById('editPrenom').value = adminUser.prenom;
        document.getElementById('editMatricule').value = adminUser.matricule;
        document.getElementById('editRole').value = adminUser.role;
        document.getElementById('editEmail').value = adminUser.email;
        document.getElementById('editTelephone').value = adminUser.telephone;
    });

    // Save profile changes
    saveProfileChanges.addEventListener('click', function() {
        // Update admin user object with new values
        adminUser.nom = document.getElementById('editNom').value;
        adminUser.prenom = document.getElementById('editPrenom').value;
        adminUser.matricule = document.getElementById('editMatricule').value;
        adminUser.role = document.getElementById('editRole').value;
        adminUser.email = document.getElementById('editEmail').value;
        adminUser.telephone = document.getElementById('editTelephone').value;

        // Update profile fields
        document.getElementById('nomAdmin').value = adminUser.nom;
        document.getElementById('prenomAdmin').value = adminUser.prenom;
        document.getElementById('matriculeAdmin').value = adminUser.matricule;
        document.getElementById('roleAdmin').value = adminUser.role;
        document.getElementById('emailAdmin').value = adminUser.email;
        document.getElementById('telephoneAdmin').value = adminUser.telephone;

        // Close modal
        const modalInstance = bootstrap.Modal.getInstance(editProfileModal);
        modalInstance.hide();
    });

    // Password Reset Modal Functionality
    const passwordResetModal = document.getElementById('passwordResetModal');
    const savePasswordChanges = document.getElementById('savePasswordChanges');

    savePasswordChanges.addEventListener('click', function() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Simple password validation
        if (newPassword !== confirmNewPassword) {
            alert('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 8) {
            alert('Le nouveau mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        // In a real application, you would verify the current password and update it securely
        alert('Mot de passe réinitialisé avec succès.');

        // Close modal
        const modalInstance = bootstrap.Modal.getInstance(passwordResetModal);
        modalInstance.hide();
    });

    // Fonction de déconnexion
    function logout() {
        // Logique de déconnexion à implémenter
        alert('Déconnexion en cours...');
        // Exemple : redirection vers la page de login
        // window.location.href = 'login.html';
    }
});