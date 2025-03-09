class SalleManager {
    constructor() {
        // Initialiser les salles depuis localStorage
        this.salles = this.getSallesFromLocalStorage() || [];
        
        // Initialiser les variables de gestion
        this.currentEditSalleIndex = null;
        this.currentDeleteSalleIndex = null;

        // Initialiser les événements et les salles
        this.initEventListeners();
        this.initializeSalles();

        // Ajouter un débogage global
        this.debugFormElements();
    }

    debugFormElements() {
        console.log('DEBUG - Débogage global des éléments de formulaire');

        // Lister tous les formulaires
        const allForms = document.getElementsByTagName('form');
        console.log('DEBUG - Tous les formulaires:', Array.from(allForms).map(form => ({
            id: form.id,
            name: form.name,
            method: form.method,
            action: form.action
        })));

        // Lister tous les inputs
        const allInputs = document.getElementsByTagName('input');
        console.log('DEBUG - Tous les inputs:', Array.from(allInputs).map(input => ({
            id: input.id,
            name: input.name,
            type: input.type,
            value: input.value
        })));

        // Lister tous les selects
        const allSelects = document.getElementsByTagName('select');
        console.log('DEBUG - Tous les selects:', Array.from(allSelects).map(select => ({
            id: select.id,
            name: select.name,
            options: Array.from(select.options).map(opt => opt.value)
        })));

        // Vérification des éléments spécifiques
        const specificElements = [
            'form-ajouter-salle', 
            'form-modifier-salle', 
            'salle-nom-ajouter', 
            'salle-type-ajouter', 
            'salle-capacite-ajouter',
            'salle-nom-modifier', 
            'salle-type-modifier', 
            'salle-capacite-modifier'
        ];

        specificElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                console.log(`DEBUG - Élément #${elementId}:`, {
                    tagName: element.tagName,
                    type: element.type,
                    value: element.value
                });
            } else {
                console.warn(`ATTENTION : Élément #${elementId} non trouvé`);
            }
        });

        // Recherche par attribut name
        const elementsByName = {
            'salle-nom-ajouter': document.getElementsByName('salle-nom-ajouter'),
            'salle-type-ajouter': document.getElementsByName('salle-type-ajouter'),
            'salle-capacite-ajouter': document.getElementsByName('salle-capacite-ajouter'),
            'salle-nom-modifier': document.getElementsByName('salle-nom-modifier'),
            'salle-type-modifier': document.getElementsByName('salle-type-modifier'),
            'salle-capacite-modifier': document.getElementsByName('salle-capacite-modifier')
        };

        console.log('DEBUG - Éléments par attribut name:', Object.entries(elementsByName).map(([name, elements]) => ({
            name,
            count: elements.length,
            elements: Array.from(elements).map(el => ({
                id: el.id,
                tagName: el.tagName,
                type: el.type
            }))
        })));

        // Vérifier l'état du DOM
        console.log('DEBUG - État du document:', {
            readyState: document.readyState,
            location: window.location.href
        });
    }

    // Initialisation des salles
    async initializeSalles() {
        console.log('DEBUG - Initialisation des salles');
        
        // Configurer les événements
        //this.initEventListeners();
        
        // Afficher les salles
        this.renderSalles();
        
        // Peupler les filtres
        this.populateFilters();
    }

    // Récupérer les salles depuis localStorage
    getSallesFromLocalStorage() {
        const sallesJSON = localStorage.getItem('salles');
        try {
            return sallesJSON ? JSON.parse(sallesJSON) : [];
        } catch (error) {
            console.error('Erreur de parsing des salles:', error);
            return [];
        }
    }

    // Mettre à jour localStorage avec les salles actuelles
    updateLocalStorage() {
        localStorage.setItem('salles', JSON.stringify(this.salles));
    }

    // Charger les salles depuis localStorage
    loadSalles() {
        return this.getSallesFromLocalStorage();
    }

    // Sauvegarder les salles dans localStorage
    saveSalles() {
        this.updateLocalStorage();
    }

    // Initialiser les écouteurs d'événements
    initEventListeners() {
        console.log('DEBUG - Initialisation des écouteurs d\'événements');

        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.setupFormEventListeners.bind(this));
        } else {
            this.setupFormEventListeners();
        }
    }

    setupFormEventListeners() {
        console.log('DEBUG - Configuration des écouteurs d\'événements pour les formulaires');

        // Forcer un nouveau débogage des éléments
        this.debugFormElements();

        // Formulaire d'ajout de salle
        const formAjout = document.getElementById('form-ajouter-salle');
        if (formAjout) {
            formAjout.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log('DEBUG - Formulaire d\'ajout soumis');
                this.ajouterSalle(event);
            });
        } else {
            console.error('Formulaire d\'ajout de salle non trouvé');
        }

        // Formulaire de modification de salle
        const formModification = document.getElementById('form-modifier-salle');
        if (formModification) {
            formModification.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log('DEBUG - Formulaire de modification soumis');
                this.sauvegarderModification(event);
            });
        } else {
            console.error('Formulaire de modification de salle non trouvé');
        }

        // Bouton d'ajout de salle
        const addSalleBtn = document.getElementById('btn-add-salle');
        if (addSalleBtn) {
            addSalleBtn.addEventListener('click', () => {
                const ajouterSalleModal = new bootstrap.Modal(document.getElementById('ajouterSalleModal'));
                ajouterSalleModal.show();
            });
        } else {
            console.error('Bouton d\'ajout de salle non trouvé');
        }

        // Autres événements de filtrage et recherche
        this.setupFilterAndSearchEvents();
    }

    setupFilterAndSearchEvents() {
        // Filtres et recherche
        const searchInput = document.getElementById('search-salle');
        const typeFilter = document.getElementById('filter-type');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderSalles());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.renderSalles());
        }
    }

    // Méthode générique pour ajouter une salle
    addSalle(salle) {
        console.log('DEBUG - Ajout de salle:', salle);

        // Nettoyer et valider les données
        const salleNettoyee = {
            nom: salle.nom.trim(),
            type: salle.type.trim().toUpperCase(),
            capacite: Math.max(1, Math.floor(parseInt(salle.capacite)))
        };

        this.salles.push(salleNettoyee);
        this.saveSalles();
        this.renderSalles();
        
        console.log('DEBUG - Salles après ajout:', this.salles);
    }

    // Méthode pour ajouter une salle
    ajouterSalle(event) {
        event.preventDefault();
        console.log('DEBUG - Ajout de salle');

        const nomInput = document.getElementById('salle-nom-ajouter');
        const typeSelect = document.getElementById('salle-type-ajouter');
        const capaciteInput = document.getElementById('salle-capacite-ajouter');

        if (!nomInput || !typeSelect || !capaciteInput) {
            console.error('Un ou plusieurs éléments du formulaire sont manquants');
            return;
        }

        const nom = nomInput.value.trim();
        const type = typeSelect.value;
        const capacite = parseInt(capaciteInput.value, 10);

        if (!nom || !type || isNaN(capacite) || capacite <= 0) {
            console.error('Données de salle invalides');
            return;
        }

        // Générer un ID unique
        const id = `salle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const nouvelleSalle = { id, nom, type, capacite };
        this.addSalle(nouvelleSalle);

        // Réinitialiser le formulaire
        this.resetAddSalleForm();

        // Fermer la modale
        const ajouterSalleModal = bootstrap.Modal.getInstance(document.getElementById('ajouterSalleModal'));
        if (ajouterSalleModal) {
            ajouterSalleModal.hide();
        }
    }

    // Méthode pour sauvegarder une modification
    sauvegarderModification(event) {
        event.preventDefault();
        console.log('DEBUG - Sauvegarde de la modification');

        // Vérifier qu'un index de salle est sélectionné
        if (this.currentEditSalleIndex === null) {
            console.error('Aucune salle sélectionnée pour modification');
            return;
        }

        // Récupérer les valeurs du formulaire
        const nomInput = document.getElementById('salle-nom-modifier');
        const typeSelect = document.getElementById('salle-type-modifier');
        const capaciteInput = document.getElementById('salle-capacite-modifier');

        if (!nomInput || !typeSelect || !capaciteInput) {
            console.error('Un ou plusieurs éléments du formulaire sont manquants');
            return;
        }

        // Valider les données
        const nouveauNom = nomInput.value.trim();
        const nouveauType = typeSelect.value;
        const nouvelleCapacite = parseInt(capaciteInput.value, 10);

        if (!nouveauNom || !nouveauType || isNaN(nouvelleCapacite) || nouvelleCapacite <= 0) {
            console.error('Données de salle invalides');
            return;
        }

        // Récupérer l'ID de la salle originale
        const salleOriginale = this.salles[this.currentEditSalleIndex];
        const id = salleOriginale.id;

        // Mettre à jour la salle dans le tableau
        this.salles[this.currentEditSalleIndex] = {
            id,
            nom: nouveauNom,
            type: nouveauType,
            capacite: nouvelleCapacite
        };

        // Mettre à jour localStorage
        this.updateLocalStorage();

        // Réafficher les salles
        this.renderSalles();

        // Fermer la modale
        const modifierSalleModal = bootstrap.Modal.getInstance(document.getElementById('modifierSalleModal'));
        if (modifierSalleModal) {
            modifierSalleModal.hide();
        }

        // Réinitialiser l'index de modification
        this.currentEditSalleIndex = null;

        console.log('DEBUG - Modification de salle terminée');
    }

    // Éditer une salle
    editSalle(index) {
        console.log('DEBUG - Édition de la salle à l\'index:', index);
        
        // Vérifier que l'index est valide
        if (index < 0 || index >= this.salles.length) {
            console.error('Index de salle invalide');
            return;
        }

        // Récupérer la salle à éditer
        const salleAEditer = this.salles[index];
        
        // Utiliser une approche plus robuste pour trouver les éléments
        const nomInput = document.querySelector('#salle-nom-modifier') || 
                         document.querySelector('input[name="salle-nom-modifier"]');
        const typeSelect = document.querySelector('#salle-type-modifier') || 
                           document.querySelector('select[name="salle-type-modifier"]');
        const capaciteInput = document.querySelector('#salle-capacite-modifier') || 
                              document.querySelector('input[name="salle-capacite-modifier"]');

        console.log('DEBUG - Éléments trouvés par querySelector:');
        console.log('Nom input:', nomInput);
        console.log('Type select:', typeSelect);
        console.log('Capacité input:', capaciteInput);

        // Si les éléments ne sont pas trouvés, afficher tous les inputs et selects
        if (!nomInput || !typeSelect || !capaciteInput) {
            console.error('Un ou plusieurs éléments du formulaire sont manquants');
            
            const allInputs = document.getElementsByTagName('input');
            const allSelects = document.getElementsByTagName('select');
            
            console.log('DEBUG - Tous les inputs:', Array.from(allInputs).map(input => ({
                id: input.id,
                name: input.name,
                type: input.type
            })));
            
            console.log('DEBUG - Tous les selects:', Array.from(allSelects).map(select => ({
                id: select.id,
                name: select.name
            })));

            // Dernier recours : utiliser window.document
            console.log('DEBUG - window.document:', window.document);

            return;
        }

        // Pré-remplir le formulaire avec les données de la salle
        nomInput.value = salleAEditer.nom;
        typeSelect.value = salleAEditer.type;
        capaciteInput.value = salleAEditer.capacite;

        // Stocker l'index de la salle en cours d'édition
        this.currentEditSalleIndex = index;

        // Afficher la modale de modification
        const modifierSalleModal = new bootstrap.Modal(document.getElementById('modifierSalleModal'));
        modifierSalleModal.show();
    }

    // Préparer la suppression d'une salle
    preparerSuppression(index) {
        // Stocker l'index de la salle à supprimer
        this.currentDeleteSalleIndex = index;
        
        // Afficher le nom de la salle dans le modal de confirmation
        const salle = this.salles[index];
        document.getElementById('salle-nom-suppression').textContent = salle.nom;
        
        // Ouvrir le modal de suppression
        const deleteSalleModal = document.getElementById('deleteSalleModal');
        if (deleteSalleModal) {
            const modalInstance = new bootstrap.Modal(deleteSalleModal, {
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.show();
        }
    }

    // Confirmer la suppression d'une salle
    confirmerSuppression() {
        if (this.currentDeleteSalleIndex === null || this.currentDeleteSalleIndex === undefined) {
            this.showNotification('Aucune salle sélectionnée pour suppression', 'danger');
            return;
        }

        // Récupérer le nom de la salle à supprimer
        const salle = this.salles[this.currentDeleteSalleIndex];
        const nomSalle = salle.nom;
        const typeSalle = salle.type;

        // Supprimer la salle du tableau
        this.salles.splice(this.currentDeleteSalleIndex, 1);

        // Sauvegarder dans localStorage
        this.saveSalles();

        // Mettre à jour l'affichage
        this.renderSalles();

        // Réinitialiser l'index de la salle à supprimer
        this.currentDeleteSalleIndex = null;

        // Afficher un message de succès personnalisé
        this.showNotification(`La salle "${nomSalle}" de type ${typeSalle} a été supprimée avec succès !`, 'success');

        // Fermer le modal de suppression
        const deleteSalleModal = bootstrap.Modal.getInstance(document.getElementById('deleteSalleModal'));
        if (deleteSalleModal) {
            deleteSalleModal.hide();
        }
    }

    // Peupler les filtres
    populateFilters() {
        const typeFilter = document.getElementById('filter-type');

        if (typeFilter) {
            // Extraire les types uniques des salles
            const types = [...new Set(this.salles.map(s => s.type.toLowerCase()))];
            
            // Réinitialiser le filtre
            typeFilter.innerHTML = '<option value="">Tous les types</option>';
            
            // Ajouter les types uniques
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = this.formatTypeSalle(type);
                typeFilter.appendChild(option);
            });
        }
    }

    // Réinitialiser le formulaire d'ajout
    resetAddSalleForm() {
        document.getElementById('salle-nom-ajouter').value = '';
        document.getElementById('salle-type-ajouter').value = 'STANDARD';
        document.getElementById('salle-capacite-ajouter').value = '';
    }

    // Afficher les salles
    renderSalles() {
        console.log('DEBUG - Méthode renderSalles appelée');
        console.log('DEBUG - Salles à afficher:', this.salles);

        // Vérifier l'existence de l'élément du tableau
        const tableBody = document.getElementById('sallesTableBody');
        if (!tableBody) {
            console.error('DEBUG - Element #sallesTableBody non trouvé');
            return;
        }

        // Vider le tableau existant
        tableBody.innerHTML = '';

        // Vérifier s'il y a des salles à afficher
        if (!this.salles || this.salles.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" class="text-center text-muted">
                    Aucune salle n'a été ajoutée.
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        // Afficher chaque salle
        this.salles.forEach((salle, index) => {
            // Validation des données de la salle
            if (!salle || !salle.nom || !salle.type || salle.capacite === undefined) {
                console.warn('DEBUG - Salle invalide:', salle);
                return;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${salle.nom}</td>
                <td>${salle.type}</td>
                <td>${salle.capacite}</td>
                <td>
                    <div class="action-buttons gap-2 d-flex">
                        <button class="btn btn-sm btn-success" onclick="salleManager.editSalle(${index})">
                            Éditer
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="salleManager.preparerSuppression(${index})">
                            Supprimer
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        console.log(`DEBUG - ${this.salles.length} salles affichées`);
    }

    // Formater le type de salle pour l'affichage
    formatTypeSalle(type) {
        // Convertir en titre case et remplacer les underscores
        if (type === 'PREMIUM') return 'Premium';
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        notificationContainer.appendChild(notification);

        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialiser le gestionnaire de salles quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.salleManager = new SalleManager();
});
