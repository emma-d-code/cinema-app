// Données de base pour la génération de clients
const nomsMarocains = [
    "El Amrani", "Benjelloun", "Cherkaoui", "Bouazzaoui", "Lahlou",
    "Zahir", "Bennis", "Idrissi", "Mourad", "Tazi",
    "Rhouzlane", "Saidi", "Baraka", "Kabbaj", "El Fassi"
];

const prenomsMarocains = [
    "Youssef", "Fatima", "Mehdi", "Amina", "Karim",
    "Leila", "Omar", "Sofia", "Hassan", "Noura",
    "Rachid", "Zineb", "Amine", "Samira", "Khalid"
];

const domaines = ["gmail.com", "yahoo.com", "hotmail.com"];
const statuts = ["Actif", "Inactif"];

class ClientManager {
    constructor() {
        this.clients = [];
        this.currentEditClientId = null;
        this.clientToDelete = null;
        this.initializeClients();
    }

    // Générer un email à partir d'un nom et prénom
    generateEmail(nom, prenom) {
        const domaine = domaines[Math.floor(Math.random() * domaines.length)];
        return `${prenom.toLowerCase()}.${nom.toLowerCase()}@${domaine}`;
    }

    // Générer un numéro de téléphone marocain
    generateTelephone() {
        const numero = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `06 ${numero.slice(0, 2)} ${numero.slice(2, 4)} ${numero.slice(4, 6)} ${numero.slice(6)}`;
    }

    // Initialiser les clients avec des données par défaut
    initializeClients() {
        const savedClients = localStorage.getItem('clients');
        
        // Si aucun client n'existe, générer des clients par défaut
        if (!savedClients || JSON.parse(savedClients).length === 0) {
            const clientsData = [];

            // Générer 20 clients
            for (let i = 0; i < 20; i++) {
                const nom = nomsMarocains[Math.floor(Math.random() * nomsMarocains.length)];
                const prenom = prenomsMarocains[Math.floor(Math.random() * prenomsMarocains.length)];
                
                const client = {
                    id: i + 1,
                    nom: `${prenom} ${nom}`,
                    email: this.generateEmail(nom, prenom),
                    telephone: this.generateTelephone(),
                    statut: statuts[Math.floor(Math.random() * statuts.length)]
                };

                clientsData.push(client);
            }

            // Sauvegarder les clients dans localStorage
            localStorage.setItem('clients', JSON.stringify(clientsData));
            this.clients = clientsData;
        } else {
            // Charger les clients existants
            this.clients = JSON.parse(savedClients);
        }

        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // Afficher les clients
        this.renderClients();
    }

    // Générer un ID unique
    generateUniqueId() {
        return this.clients.length + 1;
    }

    handleAddClient() {
        // Get form values
        const nom = document.getElementById('ajouter-client-nom').value.trim();
        const email = document.getElementById('ajouter-client-email').value.trim();
        const telephone = document.getElementById('ajouter-client-telephone').value.trim();
        const statut = document.getElementById('ajouter-client-statut').value.trim();

        // Validate inputs
        if (!nom || !email || !telephone || !statut) {
            this.showNotification('Veuillez remplir tous les champs', 'danger');
            return;
        }

        // Create new client object
        const newClient = {
            nom: nom,
            email: email,
            telephone: telephone,
            statut: statut
        };

        // Add client
        this.addClient(newClient);
    }

    addClient(client) {
        // Set ID based on current array length
        client.id = this.clients.length + 1;

        // Check for duplicate client
        const clientExists = this.clients.some(c => 
            c.nom && c.email && 
            c.nom.toLowerCase() === client.nom.toLowerCase() && 
            c.email.toLowerCase() === client.email.toLowerCase()
        );

        if (clientExists) {
            this.showNotification('Un client avec ce nom et email existe déjà', 'warning');
            return false;
        }

        // Add client to array
        this.clients.push(client);

        // Save to localStorage
        this.saveClients();

        // Render updated client list
        this.renderClients();

        // Show success notification
        this.showNotification('Client ajouté avec succès', 'success');

        // Reset form and close modal
        document.getElementById('ajouter-client-form').reset();
        const addModal = bootstrap.Modal.getInstance(document.getElementById('ajouterClientModal'));
        if (addModal) addModal.hide();

        return true;
    }

    addEventListeners() {
        // Add Client Button
        const addClientBtn = document.getElementById('save-ajouter-client-btn');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => this.handleAddClient());
        }

        // Edit Client Button
        const editClientBtn = document.getElementById('save-editer-client-btn');
        if (editClientBtn) {
            editClientBtn.addEventListener('click', () => this.saveEditedClient());
        }

        // Delete Client Confirmation
        const confirmDeleteBtn = document.getElementById('confirm-delete-client');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDeleteClient());
        }

        // Search and Filter
        const searchInput = document.getElementById('search-client');
        const filterSelect = document.getElementById('filter-type');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderClients());
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.renderClients());
        }
    }

    editClient(id) {
        // Find client to edit
        const client = this.clients.find(c => c.id === id);

        if (!client) {
            this.showNotification('Client non trouvé', 'danger');
            return;
        }

        // Populate edit form
        document.getElementById('editer-client-nom').value = client.nom;
        document.getElementById('editer-client-email').value = client.email;
        document.getElementById('editer-client-telephone').value = client.telephone;
        document.getElementById('editer-client-statut').value = client.statut;

        // Store current edit client ID
        this.currentEditClientId = id;

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editerClientModal'));
        editModal.show();
    }

    saveEditedClient() {
        // Ensure we have a client to edit
        if (!this.currentEditClientId) {
            this.showNotification('Aucun client sélectionné', 'danger');
            return;
        }

        // Get updated values
        const nom = document.getElementById('editer-client-nom').value.trim();
        const email = document.getElementById('editer-client-email').value.trim();
        const telephone = document.getElementById('editer-client-telephone').value.trim();
        const statut = document.getElementById('editer-client-statut').value.trim();

        // Validate inputs
        if (!nom || !email || !telephone || !statut) {
            this.showNotification('Veuillez remplir tous les champs', 'danger');
            return;
        }

        // Find client index
        const clientIndex = this.clients.findIndex(c => c.id === this.currentEditClientId);

        if (clientIndex === -1) {
            this.showNotification('Client non trouvé', 'danger');
            return;
        }

        // Update client
        this.clients[clientIndex] = {
            id: this.currentEditClientId,
            nom: nom,
            email: email,
            telephone: telephone,
            statut: statut
        };

        // Save to localStorage
        this.saveClients();

        // Render updated list
        this.renderClients();

        // Show success notification
        this.showNotification('Client modifié avec succès', 'success');

        // Close edit modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editerClientModal'));
        if (editModal) editModal.hide();
    }

    confirmDeleteClient() {
        if (this.clientToDelete) {
            this.deleteClient(this.clientToDelete);
            this.clientToDelete = null;
        }
    }

    preparerSuppression(id) {
        // Store client ID to delete
        this.clientToDelete = id;

        // Show delete confirmation modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteClientModal'));
        deleteModal.show();
    }

    deleteClient(id) {
        // Find client index
        const clientIndex = this.clients.findIndex(c => c.id === id);

        if (clientIndex === -1) {
            this.showNotification('Client non trouvé', 'danger');
            return false;
        }

        // Remove client from array
        this.clients.splice(clientIndex, 1);

        // Reassign IDs based on new array order
        this.clients.forEach((client, index) => {
            client.id = index + 1;
        });

        // Save to localStorage
        this.saveClients();

        // Render updated list
        this.renderClients();

        // Show success notification
        this.showNotification('Client supprimé avec succès', 'success');

        // Close delete modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteClientModal'));
        if (deleteModal) deleteModal.hide();

        return true;
    }

    saveClients() {
        // Save clients to localStorage
        localStorage.setItem('clients', JSON.stringify(this.clients));
    }

    renderClients() {
        const tableBody = document.getElementById('clientsTableBody');
        
        // Clear existing rows
        tableBody.innerHTML = '';

        // Get search and filter values
        const searchInput = document.getElementById('search-client');
        const filterSelect = document.getElementById('filter-type');

        // Filter clients
        const filteredClients = this.clients.filter(client => {
            // If no search input or filter, show all clients
            if ((!searchInput || !searchInput.value) && (!filterSelect || !filterSelect.value)) {
                return true;
            }

            const matchesSearch = !searchInput || !searchInput.value || 
                (client.nom && client.nom.toLowerCase().includes(searchInput.value.toLowerCase())) ||
                (client.email && client.email.toLowerCase().includes(searchInput.value.toLowerCase())) ||
                (client.telephone && client.telephone.toLowerCase().includes(searchInput.value.toLowerCase()));
            
            const matchesFilter = !filterSelect || !filterSelect.value || 
                (client.statut && client.statut.toLowerCase() === filterSelect.value.toLowerCase());
            
            return matchesSearch && matchesFilter;
        });

        // Render filtered clients
        if (filteredClients.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="6" class="text-center text-muted">
                    Aucun client trouvé.
                </td>
            `;
            tableBody.appendChild(noResultsRow);
            return;
        }

        filteredClients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${client.id || 'N/A'}</td>
                <td>${client.nom || 'N/A'}</td>
                <td>${client.email || 'N/A'}</td>
                <td>${client.telephone || 'N/A'}</td>
                <td>${client.statut ? client.statut.toUpperCase() : 'N/A'}</td>
                <td class="table-actions"></td>
            `;

            const actionsCell = row.cells[5];

            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-warning';
            editButton.textContent = 'Éditer';
            editButton.addEventListener('click', () => this.editClient(client.id));

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.textContent = 'Supprimer';
            deleteButton.addEventListener('click', () => this.preparerSuppression(client.id));

            // Add buttons to actions cell
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            // Add row to table
            tableBody.appendChild(row);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to container
        notificationContainer.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize ClientManager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.clientManager = new ClientManager();
});
