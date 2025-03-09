class FilmManager {
    constructor() {
        console.log('FilmManager constructor called');
        try {
            this.films = [];
            this.currentEditFilmId = null;
            this.filmToDelete = null;

            // Initialize modal instances
            this.filmModal = new bootstrap.Modal(document.getElementById('filmModal'));
            this.filmDetailsModal = new bootstrap.Modal(document.getElementById('filmDetailsModal'));
            this.editFilmModal = document.getElementById('editFilmModal');
            this.deleteFilmModal = new bootstrap.Modal(document.getElementById('deleteFilmModal'));

            this.initializeFilms();
        } catch (error) {
            console.error('Error in FilmManager constructor:', error);
        }
    }

    initializeFilms() {
        console.log('Initializing films...');

        try {
            // Charger les films depuis localStorage
            const loadedFilms = this.loadFilms();
            
            // Si des films sont chargés, les utiliser
            if (loadedFilms && loadedFilms.length > 0) {
                console.log(`Loaded ${loadedFilms.length} films from localStorage`);
                
                // Ensure each film has a valid ID
                this.films = loadedFilms.map(film => {
                    // If film doesn't have an ID, generate one
                    if (!film.id) {
                        console.warn('Generating missing ID for film:', film.titre);
                        film.id = this.generateUniqueId();
                    }
                    return film;
                });
            } else {
                // Si aucun film n'est chargé, utiliser les films par défaut
                console.warn('No films found in localStorage. Using default films.');
                this.films = this.getDefaultFilms();
            }

            // Sauvegarder les films mis à jour
            this.saveFilms();

            // Afficher les films
            this.renderFilms();

            // Initialiser les écouteurs d'événements
            this.initEventListeners();

            console.log('Films initialized successfully');
        } catch (error) {
            console.error('Error initializing films:', error);
            this.showNotification('Erreur lors de l\'initialisation des films', 'danger');
        }
    }

    getDefaultFilms() {
        return [
            {
                id: this.generateUniqueId(),
                titre: 'Film par défaut',
                realisateur: 'Réalisateur inconnu',
                genre: 'Divers',
                annee: Date.now(),
                duree: 120,
                synopsis: 'Un film par défaut pour commencer',
                posterUrl: '',
                trailerUrl: '',
                statut: 'prochainement'
            }
        ];
    }

    generateUniqueId() {
        // Utiliser un timestamp avec un nombre aléatoire pour plus d'unicité
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // Sauvegarder les films dans localStorage
    saveFilms() {
        try {
            // Vérifier si localStorage est disponible
            if (typeof(Storage) === "undefined") {
                throw new Error("localStorage n'est pas supporté");
            }

            // Vérifier si les films existent
            if (!this.films || this.films.length === 0) {
                console.warn('Aucun film à sauvegarder');
                return;
            }

            // Sauvegarder avec gestion des erreurs
            localStorage.setItem('films', JSON.stringify(this.films));
            console.log('Films sauvegardés avec succès:', this.films.length);

            // Vérifier que la sauvegarde a bien eu lieu
            const savedFilms = JSON.parse(localStorage.getItem('films') || '[]');
            if (savedFilms.length !== this.films.length) {
                throw new Error('La sauvegarde des films a échoué');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des films:', error);
            
            // Tentative de sauvegarde alternative
            try {
                // Utiliser sessionStorage comme alternative
                sessionStorage.setItem('films', JSON.stringify(this.films));
                console.warn('Films sauvegardés dans sessionStorage');
            } catch (fallbackError) {
                console.error('Impossible de sauvegarder les films', fallbackError);
                this.showNotification('Impossible de sauvegarder les modifications', 'danger');
            }
        }
    }

    // Charger les films depuis localStorage
    loadFilms() {
        try {
            const storedFilms = localStorage.getItem('films');
            console.log('DEBUG - Films stockés (loadFilms):', storedFilms);
            console.trace('DEBUG - Origine du chargement des films');
            
            if (storedFilms) {
                const parsedFilms = JSON.parse(storedFilms);
                console.log('DEBUG - Films parsés:', parsedFilms);
                
                // Vérification détaillée des films
                parsedFilms.forEach((film, index) => {
                    console.log(`DEBUG - Film ${index}:`, {
                        id: film.id,
                        titre: film.titre,
                        annee: film.annee,
                        realisateur: film.realisateur,
                        synopsis: film.synopsis
                    });
                });
                
                return parsedFilms;
            }
            
            return null;
        } catch (error) {
            console.error('Erreur de chargement des films:', error);
            return null;
        }
    }

    // Initialiser les écouteurs d'événements
    initEventListeners() {
        // Add Film Modal Trigger
        const addFilmButton = document.querySelector('#add-film-btn');
        if (addFilmButton) {
            addFilmButton.addEventListener('click', () => {
                this.resetAddFilmForm();
                this.filmModal.show();
            });
        }

        // Save Film Button
        const saveFilmBtn = document.getElementById('save-film-btn');
        if (saveFilmBtn) {
            saveFilmBtn.addEventListener('click', () => this.handleAddFilm());
        }

        // Save Edited Film Button
        const saveEditFilmBtn = document.getElementById('save-edit-film-btn');
        const editFilmModal = document.getElementById('editFilmModal');
        
        if (saveEditFilmBtn && editFilmModal) {
            saveEditFilmBtn.addEventListener('click', (event) => {
                event.preventDefault(); // Empêcher la soumission du formulaire par défaut
                
                // Désactiver le bouton pendant le traitement
                saveEditFilmBtn.disabled = true;
                saveEditFilmBtn.innerHTML = 'Sauvegarde en cours...';

                // Utiliser un micro-délai pour éviter de bloquer l'interface
                Promise.resolve().then(() => {
                    // Récupérer l'ID du film
                    const filmIdField = document.getElementById('edit-film-id');
                    const filmId = filmIdField ? 
                        (typeof filmIdField.value === 'string' 
                            ? parseInt(filmIdField.value, 10) 
                            : filmIdField.value) 
                        : this.currentEditFilmId;

                    // Appeler la méthode de sauvegarde
                    return this.saveEditedFilm(filmId)
                        .then(updatedFilm => {
                            console.log('Film successfully updated:', updatedFilm);
                            
                            // Fermer le modal manuellement
                            this.closeEditModal();
                            
                            // Réactiver le bouton
                            saveEditFilmBtn.disabled = false;
                            saveEditFilmBtn.innerHTML = 'Enregistrer';
                        })
                        .catch(error => {
                            console.error('Error updating film:', error);
                            
                            // Réactiver le bouton
                            saveEditFilmBtn.disabled = false;
                            saveEditFilmBtn.innerHTML = 'Enregistrer';
                        });
                });
            });
        }

        // Confirm Delete Film Button
        const confirmDeleteBtn = document.getElementById('confirm-delete-film');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (this.filmToDelete) {
                    this.deleteFilm(this.filmToDelete);
                    this.deleteFilmModal.hide();
                }
            });
        }

        // Filtres et recherche
        const searchInput = document.getElementById('search-film');
        const yearFilter = document.getElementById('filter-annee');
        const statutFilter = document.getElementById('filter-statut');
        const genreFilter = document.getElementById('filter-genre');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderFilms());
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', () => this.renderFilms());
        }

        if (statutFilter) {
            statutFilter.addEventListener('change', () => this.renderFilms());
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', () => this.renderFilms());
        }

        // Dynamically add event listeners for edit and delete buttons in the film list
        const filmsTableBody = document.querySelector('.films-table tbody');
        if (filmsTableBody) {
            filmsTableBody.addEventListener('click', (event) => {
                const editBtn = event.target.closest('.edit-film-btn');
                const deleteBtn = event.target.closest('.delete-film-btn');
                const detailsBtn = event.target.closest('.film-details-btn');

                if (editBtn) {
                    const filmId = editBtn.getAttribute('data-film-id');
                    this.editFilm(filmId);
                }

                if (deleteBtn) {
                    const filmId = deleteBtn.getAttribute('data-film-id');
                    this.prepareDeleteFilm(filmId);
                }

                if (detailsBtn) {
                    const filmId = detailsBtn.getAttribute('data-film-id');
                    console.log('Details button clicked for film ID:', filmId);
                    this.viewFilmDetails(filmId);
                }
            });
        }

        // Bouton de suppression de film
        const deleteFilmBtn = document.getElementById('confirm-delete-film-btn');
        const deleteFilmModal = document.getElementById('deleteFilmModal');
        
        if (deleteFilmBtn && deleteFilmModal) {
            deleteFilmBtn.addEventListener('click', (event) => {
                event.preventDefault(); // Empêcher la soumission du formulaire par défaut
                
                // Désactiver le bouton pendant le traitement
                deleteFilmBtn.disabled = true;
                deleteFilmBtn.innerHTML = 'Suppression en cours...';

                // Utiliser un micro-délai pour éviter de bloquer l'interface
                Promise.resolve().then(() => {
                    // Supprimer le film
                    return this.deleteFilm(this.currentDeleteFilmId)
                        .then(deletedFilm => {
                            console.log('Film successfully deleted:', deletedFilm);
                            
                            // Fermer le modal manuellement
                            this.closeDeleteModal();
                            
                            // Réactiver le bouton
                            deleteFilmBtn.disabled = false;
                            deleteFilmBtn.innerHTML = 'Supprimer';
                        })
                        .catch(error => {
                            console.error('Error deleting film:', error);
                            
                            // Réactiver le bouton
                            deleteFilmBtn.disabled = false;
                            deleteFilmBtn.innerHTML = 'Supprimer';
                        });
                });
            });
        }

        // Ajouter des écouteurs pour fermer manuellement les modals
        const editModalCloseButtons = document.querySelectorAll('#editFilmModal .btn-close, #editFilmModal [data-bs-dismiss="modal"]');
        editModalCloseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.closeEditModal();
            });
        });

        const deleteModalCloseButtons = document.querySelectorAll('#deleteFilmModal .btn-close, #deleteFilmModal [data-bs-dismiss="modal"]');
        deleteModalCloseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.closeDeleteModal();
            });
        });
    }

    // Méthode générique pour fermer tous les modals
    closeModal(modalId) {
        try {
            // Obtenir l'élément du modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.warn(`Modal with ID ${modalId} not found`);
                return;
            }

            // Fermeture via Bootstrap Modal instance
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Méthodes manuelles de fermeture
            modalElement.classList.remove('show');
            
            // Asynchronous cleanup
            Promise.resolve().then(() => {
                // Supprimer le backdrop
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }

                // Réinitialiser le body
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');

                // Réinitialiser tous les états liés aux modals
                this.currentEditFilmId = null;
                this.currentDeleteFilmId = null;

                console.log(`Modal ${modalId} closed successfully`);
            });
        } catch (error) {
            console.error(`Erreur lors de la fermeture du modal ${modalId}:`, error);
        }
    }

    // Méthode pour fermer le modal d'édition de film
    closeEditModal() {
        this.closeModal('editFilmModal');
    }

    // Méthode pour fermer le modal de suppression de film
    closeDeleteModal() {
        this.closeModal('deleteFilmModal');
    }

    // Ajouter un nouveau film
    handleAddFilm() {
        // Récupérer les valeurs du formulaire
        const titre = document.getElementById('film-titre').value.trim();
        const realisateur = document.getElementById('film-realisateur').value.trim();
        const genre = document.getElementById('film-genre').value.trim();
        const dateSortie = document.getElementById('film-date-sortie').value.trim();
        const dureeHeures = document.getElementById('film-duree-heures').value.trim();
        const dureeMinutes = document.getElementById('film-duree-minutes').value.trim();
        const synopsis = document.getElementById('film-synopsis').value.trim();
        const posterFile = document.getElementById('film-poster').files[0];
        const trailerUrl = document.getElementById('film-trailer').value.trim();
        const statut = document.getElementById('film-statut').value.trim().toLowerCase(); // Normalize status

        // Vérifier si un fichier a été sélectionné
        if (!posterFile) {
            this.showNotification('Veuillez sélectionner un poster', 'danger');
            return;
        }

        // Lire le fichier comme une URL de données
        const reader = new FileReader();
        reader.onload = (event) => {
            // Validation des champs
            const validationErrors = [];
            if (!titre) validationErrors.push('Titre');
            if (!realisateur) validationErrors.push('Réalisateur');
            if (!genre) validationErrors.push('Genre');
            if (!dateSortie) validationErrors.push('Date de Sortie');
            if (!dureeHeures && !dureeMinutes) validationErrors.push('Durée');

            if (validationErrors.length > 0) {
                this.showNotification(`Veuillez remplir les champs suivants : ${validationErrors.join(', ')}`, 'danger');
                return;
            }

            // Convertir les heures et minutes en minutes
            const dureeTotal = (parseInt(dureeHeures || '0') * 60) + parseInt(dureeMinutes || '0');

            // Créer l'objet film
            const nouveauFilm = {
                id: this.generateUniqueId(),
                titre: titre,
                realisateur: realisateur,
                genre: genre,
                annee: new Date(dateSortie).getTime(),
                duree: dureeTotal,
                synopsis: synopsis,
                posterUrl: event.target.result, // URL de données du fichier
                trailerUrl: trailerUrl || '',
                statut: statut // Normalized status
            };

            // Ajouter le film
            this.addFilm(nouveauFilm);
            this.filmModal.hide();
            this.resetAddFilmForm();
            this.renderFilms();
        };

        reader.readAsDataURL(posterFile);
    }

    // Méthode générique pour ajouter un film
    addFilm(film) {
        // Vérifier si un film avec le même titre existe déjà
        const filmExistant = this.films.find(f => f.titre.toLowerCase() === film.titre.toLowerCase());
        
        if (filmExistant) {
            this.showNotification('Un film avec ce titre existe déjà', 'warning');
            return false;
        }

        // Ajouter le film
        this.films.push(film);
        
        // Sauvegarder dans localStorage
        this.saveFilms();
        
        // Mettre à jour l'affichage
        this.renderFilms();
        
        // Afficher un message de succès
        this.showNotification('Film ajouté avec succès !', 'success');
        
        return true;
    }

    // Éditer un film
    editFilm(id) {
        // Convertir l'ID en nombre
        const filmId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        console.log('Starting edit process for film ID:', filmId);

        // Validate input
        if (!filmId) {
            console.error('Invalid film ID provided');
            this.showNotification('ID de film invalide', 'danger');
            return;
        }

        const film = this.getFilmById(filmId);
        if (!film) {
            console.error('Film not found with ID:', filmId);
            this.showNotification('Film non trouvé', 'danger');
            return;
        }

        // Validate form elements exist
        const formElements = [
            'edit-film-titre', 'edit-film-realisateur', 'edit-film-genre', 
            'edit-film-date-sortie', 'edit-film-duree-heures', 'edit-film-duree-minutes', 
            'edit-film-synopsis', 'edit-film-poster', 'edit-film-trailer', 'edit-film-statut'
        ];

        const missingElements = formElements.filter(elementId => {
            const element = document.getElementById(elementId);
            if (!element) {
                console.error(`Form element missing: ${elementId}`);
                return true;
            }
            return false;
        });

        if (missingElements.length > 0) {
            this.showNotification(`Éléments de formulaire manquants : ${missingElements.join(', ')}`, 'danger');
            return;
        }

        try {
            // Convertir les minutes en heures et minutes
            const heures = Math.floor(film.duree / 60);
            const minutes = film.duree % 60;

            // Remplir le formulaire de modification
            document.getElementById('edit-film-titre').value = film.titre || '';
            document.getElementById('edit-film-realisateur').value = film.realisateur || '';
            document.getElementById('edit-film-genre').value = film.genre || '';
            document.getElementById('edit-film-date-sortie').value = film.annee ? new Date(film.annee).toISOString().split('T')[0] : '';
            document.getElementById('edit-film-duree-heures').value = heures || 0;
            document.getElementById('edit-film-duree-minutes').value = minutes || 0;
            document.getElementById('edit-film-synopsis').value = film.synopsis || '';
            document.getElementById('edit-film-poster').value = ''; // Always reset poster file input
            document.getElementById('edit-film-trailer').value = film.trailerUrl || '';
            document.getElementById('edit-film-statut').value = film.statut || 'prochainement';

            // Ajouter un champ caché pour stocker l'ID du film
            let hiddenIdField = document.getElementById('edit-film-id');
            if (!hiddenIdField) {
                hiddenIdField = document.createElement('input');
                hiddenIdField.type = 'hidden';
                hiddenIdField.id = 'edit-film-id';
                document.getElementById('editFilmModal').querySelector('form').appendChild(hiddenIdField);
            }
            hiddenIdField.value = filmId;

            // Stocker l'ID du film en cours d'édition
            this.currentEditFilmId = filmId;
            console.log('Edit film ID set:', this.currentEditFilmId);

            // Ouvrir le modal d'édition
            const editFilmModal = new bootstrap.Modal(document.getElementById('editFilmModal'));
            editFilmModal.show();

            console.log('Edit modal opened successfully for film:', film.titre);
        } catch (error) {
            console.error('Error in editFilm method:', error);
            this.showNotification('Erreur lors de l\'ouverture du modal d\'édition', 'danger');
        }
    }

    // Sauvegarder les modifications d'un film
    saveEditedFilm(forcedFilmId = null) {
        return new Promise((resolve, reject) => {
            // Récupérer l'ID du film à partir du champ caché ou du contexte actuel
            const filmIdField = document.getElementById('edit-film-id');
            const editFilmId = forcedFilmId || 
                (filmIdField 
                    ? (typeof filmIdField.value === 'string' 
                        ? parseInt(filmIdField.value, 10) 
                        : filmIdField.value) 
                    : this.currentEditFilmId);
            
            console.log('Attempting to save edited film. Stored film ID:', editFilmId, 'Forced ID:', forcedFilmId);

            // Vérifier si un film est en cours d'édition
            if (!editFilmId) {
                console.error('No film selected for editing. Current state:', {
                    currentEditFilmId: this.currentEditFilmId,
                    forcedFilmId: forcedFilmId,
                    hiddenFieldValue: filmIdField ? filmIdField.value : 'No field',
                    films: this.films
                });
                this.showNotification('Aucun film sélectionné pour modification', 'danger');
                return reject(new Error('No film selected'));
            }

            // Récupérer le film original à modifier
            const originalFilm = this.getFilmById(editFilmId);
            if (!originalFilm) {
                console.error('Original film not found. Details:', {
                    editFilmId: editFilmId,
                    allFilms: this.films
                });
                this.showNotification('Film original non trouvé', 'danger');
                return reject(new Error('Original film not found'));
            }

            // Récupérer les valeurs du formulaire d'édition
            const titre = document.getElementById('edit-film-titre').value.trim();
            const realisateur = document.getElementById('edit-film-realisateur').value.trim();
            const genre = document.getElementById('edit-film-genre').value.trim();
            const dateSortie = document.getElementById('edit-film-date-sortie').value.trim();
            const dureeHeures = document.getElementById('edit-film-duree-heures').value.trim();
            const dureeMinutes = document.getElementById('edit-film-duree-minutes').value.trim();
            const synopsis = document.getElementById('edit-film-synopsis').value.trim();
            const posterFile = document.getElementById('edit-film-poster').files[0];
            const trailerUrl = document.getElementById('edit-film-trailer').value.trim();
            const statut = document.getElementById('edit-film-statut').value.trim().toLowerCase();

            // Validation des champs
            const validationErrors = [];
            if (!titre) validationErrors.push('Titre');
            if (!realisateur) validationErrors.push('Réalisateur');
            if (!genre) validationErrors.push('Genre');
            if (!dateSortie) validationErrors.push('Date de Sortie');
            
            // Validation de la durée
            const totalDuree = (parseInt(dureeHeures) || 0) * 60 + (parseInt(dureeMinutes) || 0);
            if (totalDuree <= 0) validationErrors.push('Durée');

            if (validationErrors.length > 0) {
                this.showNotification(`Veuillez remplir les champs suivants : ${validationErrors.join(', ')}`, 'danger');
                return reject(new Error('Validation failed'));
            }

            // Créer une promesse pour gérer le téléchargement de l'image
            const posterPromise = posterFile 
                ? this.handlePosterUpload(posterFile) 
                : Promise.resolve(originalFilm.posterUrl);

            posterPromise
                .then(posterUrl => {
                    // Créer l'objet film mis à jour
                    const updatedFilm = {
                        id: editFilmId, // Utiliser l'ID stocké localement
                        titre: titre,
                        realisateur: realisateur,
                        genre: genre,
                        annee: new Date(dateSortie).getTime(), // Convertir en timestamp
                        duree: totalDuree, // Durée totale en minutes
                        synopsis: synopsis,
                        posterUrl: posterUrl || originalFilm.posterUrl, // Utiliser la nouvelle URL ou l'ancienne
                        trailerUrl: trailerUrl || originalFilm.trailerUrl,
                        statut: statut || originalFilm.statut
                    };

                    console.log('Updated film details:', updatedFilm);

                    // Trouver et remplacer le film dans la liste
                    const filmIndex = this.films.findIndex(f => f.id === editFilmId);
                    console.log('Film index found:', filmIndex, 'for ID:', editFilmId);
                    console.log('Current films:', this.films);

                    if (filmIndex !== -1) {
                        // Mettre à jour le film dans la liste
                        this.films[filmIndex] = updatedFilm;
                        
                        // Sauvegarder les modifications
                        this.saveFilms();
                        
                        // Mettre à jour l'affichage
                        this.renderFilms();

                        // Afficher une notification de succès
                        this.showNotification(`Film "${titre}" mis à jour avec succès`, 'success');
                        
                        resolve(updatedFilm);
                    } else {
                        console.error('Film index not found during update. Details:', {
                            editFilmId: editFilmId,
                            films: this.films.map(f => f.id),
                            filmIndex: filmIndex
                        });
                        reject(new Error('Film index not found'));
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la mise à jour du film:', error);
                    this.showNotification('Erreur lors de la mise à jour du film', 'danger');
                    reject(error);
                })
                .finally(() => {
                    // Réinitialiser l'ID de film en cours d'édition
                    this.currentEditFilmId = null;
                    console.log('Edit film process completed');
                });
        });
    }

    // Préparer la suppression d'un film
    prepareDeleteFilm(id) {
        const film = this.getFilmById(id);
        if (!film) {
            this.showNotification('Film non trouvé', 'danger');
            return;
        }

        // Stocker l'ID du film à supprimer
        this.filmToDelete = id;

        // Mettre à jour le titre dans le modal de confirmation
        const filmTitreElement = document.getElementById('delete-film-titre');
        if (filmTitreElement) {
            filmTitreElement.textContent = film.titre;
        }

        // Ouvrir le modal de confirmation
        const deleteFilmModal = new bootstrap.Modal(document.getElementById('deleteFilmModal'));
        deleteFilmModal.show();
    }

    // Supprimer un film
    deleteFilm(id) {
        return new Promise((resolve, reject) => {
            // Vérifier si un ID de film est fourni
            if (!id) {
                console.error('Aucun film sélectionné pour suppression');
                this.showNotification('Aucun film sélectionné pour suppression', 'danger');
                return reject(new Error('No film selected'));
            }

            // Trouver l'index du film à supprimer
            const filmIndex = this.films.findIndex(f => f.id === id);
            
            if (filmIndex === -1) {
                console.error('Film non trouvé pour suppression', { filmId: id, films: this.films });
                this.showNotification('Film non trouvé', 'danger');
                return reject(new Error('Film not found'));
            }

            // Récupérer le film avant suppression (pour la notification)
            const deletedFilm = this.films[filmIndex];

            // Supprimer le film du tableau
            this.films.splice(filmIndex, 1);

            // Sauvegarder les modifications
            try {
                this.saveFilms();
                
                // Mettre à jour l'affichage
                this.renderFilms();

                // Afficher une notification de succès
                this.showNotification(`Film "${deletedFilm.titre}" supprimé avec succès`, 'success');

                // Réinitialiser l'ID de film en cours de suppression
                this.currentDeleteFilmId = null;

                resolve(deletedFilm);
            } catch (error) {
                console.error('Erreur lors de la suppression du film:', error);
                this.showNotification('Erreur lors de la suppression du film', 'danger');
                
                // Annuler la suppression en cas d'erreur
                this.films.splice(filmIndex, 0, deletedFilm);
                
                reject(error);
            }
        });
    }

    // Obtenir un film par son ID
    getFilmById(id) {
        // Convertir l'ID en nombre si nécessaire
        const filmId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        console.log('Searching for film. Input ID:', id, 'Parsed ID:', filmId);
        console.log('Total films:', this.films.length);
        
        const film = this.films.find(f => f.id === filmId);
        
        if (!film) {
            console.error('Film not found. Details:', {
                searchId: filmId,
                allFilms: this.films.map(f => f.id)
            });
        }
        
        return film;
    }

    // Voir les détails d'un film
    viewFilmDetails(id) {
        console.log('Viewing film details for ID:', id);
        console.log('Total films:', this.films.length);
        console.log('Films:', JSON.stringify(this.films));

        // Convert id to string and number to handle potential type mismatches
        const filmId = String(id);
        
        const film = this.films.find(f => String(f.id) === filmId);
        
        if (!film) {
            console.error('Film not found for ID:', filmId);
            console.error('Available film IDs:', this.films.map(f => f.id));
            this.showNotification('Film non trouvé', 'danger');
            return;
        }

        const modalBody = document.getElementById('film-details-modal-body');
        if (!modalBody) {
            console.error('Modal body element not found');
            this.showNotification('Erreur de modal', 'danger');
            return;
        }

        // Convertir la durée en heures et minutes
        const heures = Math.floor(film.duree / 60);
        const minutes = film.duree % 60;
        const dureeFormatted = `${heures}h ${minutes}min`;

        // Formater la date de sortie
        const dateSortie = new Date(film.annee).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Générer le contenu du modal
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${film.posterUrl}" 
                         style="max-width: 100px; max-height: 150px;" 
                         alt="Poster de ${film.titre}">
                </div>
                <div class="col-md-8">
                    <h2>${film.titre}</h2>
                    <p><strong>Réalisateur:</strong> ${film.realisateur}</p>
                    <p><strong>Genre:</strong> ${film.genre}</p>
                    <p><strong>Date de sortie:</strong> ${dateSortie}</p>
                    <p><strong>Durée:</strong> ${dureeFormatted}</p>
                    <p><strong>Synopsis:</strong> ${film.synopsis}</p>
                    ${film.trailerUrl ? `
                    <button onclick="filmManager.showTrailer('${this.extractYouTubeId(film.trailerUrl)}')" class="btn btn-primary">
                        Voir la bande-annonce
                    </button>` : ''}
                </div>
            </div>
        `;

        // Afficher le modal
        this.filmDetailsModal.show();
    }

    // Extraire l'ID YouTube
    extractYouTubeId(url) {
        if (!url) return null;
        const urlParams = new URL(url);
        const videoId = urlParams.searchParams.get('v') || 
                        urlParams.pathname.split('/').pop() || 
                        url.split('be/').pop();
        return videoId;
    }

    // Afficher la bande-annonce
    showTrailer(youtubeId) {
        console.log('Attempting to show trailer with ID:', youtubeId);

        if (!youtubeId) {
            this.showNotification('Aucune bande-annonce disponible', 'warning');
            return;
        }

        // Ensure trailer modal exists, create if not
        let trailerModal = document.getElementById('trailerModal');
        if (!trailerModal) {
            console.log('Creating trailer modal dynamically');
            trailerModal = this.createTrailerModal();
        }

        // Find or create trailer iframe
        let trailerIframe = document.getElementById('trailer-iframe');
        if (!trailerIframe) {
            console.log('Creating trailer iframe dynamically');
            trailerIframe = this.createTrailerIframe(trailerModal);
        }

        // Set iframe source
        trailerIframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`;

        // Show modal
        try {
            // Try Bootstrap modal method
            if (window.bootstrap && window.bootstrap.Modal) {
                const modalInstance = new bootstrap.Modal(trailerModal);
                modalInstance.show();
            } else {
                // Fallback to manual display
                trailerModal.classList.add('show');
                trailerModal.style.display = 'block';
                const backdrop = document.createElement('div');
                backdrop.classList.add('modal-backdrop', 'fade', 'show');
                document.body.appendChild(backdrop);
            }
        } catch (error) {
            console.error('Error showing trailer modal:', error);
            this.showNotification('Erreur lors de l\'ouverture de la bande-annonce', 'danger');
        }
    }

    // Méthode pour créer dynamiquement le modal de bande-annonce
    createTrailerModal() {
        const modal = document.createElement('div');
        modal.id = 'trailerModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'trailerModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="trailerModalLabel">Bande Annonce</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div id="trailer-container" class="ratio ratio-16x9">
                            <iframe 
                                id="trailer-iframe" 
                                src="" 
                                title="Bande Annonce" 
                                allowfullscreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                            </iframe>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Méthode pour créer dynamiquement l'iframe de bande-annonce
    createTrailerIframe(modal) {
        const container = modal.querySelector('#trailer-container');
        const iframe = document.createElement('iframe');
        iframe.id = 'trailer-iframe';
        iframe.title = 'Bande Annonce';
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        return iframe;
    }

    // Générer un ID unique
    generateUniqueId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // Réinitialiser le formulaire d'ajout de film
    resetAddFilmForm() {
        document.getElementById('film-titre').value = '';
        document.getElementById('film-realisateur').value = '';
        document.getElementById('film-genre').value = '';
        document.getElementById('film-date-sortie').value = '';
        document.getElementById('film-duree-heures').value = '0';
        document.getElementById('film-duree-minutes').value = '0';
        document.getElementById('film-synopsis').value = '';
        document.getElementById('film-poster').value = '';
        document.getElementById('film-trailer').value = '';
        document.getElementById('film-statut').value = 'prochainement';
    }

    // Afficher les films
    renderFilms() {
        console.log('Rendering Films:', this.films); // Diagnostic log
        const filmTableBody = document.getElementById('films-list');
        
        // Vérifier si le tableau existe
        if (!filmTableBody) {
            console.error('Films table body not found');
            return;
        }

        // Vider le tableau
        filmTableBody.innerHTML = '';

        // Filtrer les films
        const filteredFilms = this.filterFilms();

        console.log('Filtered Films:', filteredFilms); // Diagnostic log

        // Afficher les films filtrés
        filteredFilms.forEach(film => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${film.posterUrl}" 
                         style="max-width: 100px; max-height: 150px;" 
                         alt="Poster de ${film.titre}">
                </td>
                <td>${film.titre}</td>
                <td>${this.formatDateShort(film.annee)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm film-details-btn" data-film-id="${film.id}">
                            Voir
                        </button>
                        <button class="btn btn-warning btn-sm edit-film-btn" data-film-id="${film.id}">
                            Éditer
                        </button>
                        <button class="btn btn-danger btn-sm delete-film-btn" data-film-id="${film.id}">
                            Supprimer
                        </button>
                    </div>
                </td>
            `;
            filmTableBody.appendChild(row);
        });

        // Ajouter des écouteurs pour les boutons de détails
        document.querySelectorAll('.film-details-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const filmId = event.target.dataset.filmId;
                this.viewFilmDetails(filmId);
            });
        });

        // Si aucun film n'est trouvé
        if (filteredFilms.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="text-center">Aucun film trouvé</td>`;
            filmTableBody.appendChild(row);
            console.warn('No films found to render');
        }
    }

    // Extraire l'année à partir d'un timestamp
    extractYear(timestamp) {
        const date = new Date(timestamp);
        return date.getFullYear().toString();
    }

    // Méthode pour formater la date pour la table
    formatDateShort(timestamp) {
        const date = new Date(timestamp);
        return date.getFullYear().toString();
    }

    // Méthode pour formater la date complète
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Filtrer les films
    filterFilms() {
        const searchInput = document.getElementById('search-film').value.toLowerCase();
        const anneeSelect = document.getElementById('filter-annee').value;
        const statutSelect = document.getElementById('filter-statut').value;
        const genreSelect = document.getElementById('filter-genre').value;

        return this.films.filter(film => {
            // Filtrer par recherche
            const matchSearch = film.titre.toLowerCase().includes(searchInput) || 
                                film.realisateur.toLowerCase().includes(searchInput);

            // Filtrer par année
            const matchAnnee = anneeSelect === 'all' || 
                               new Date(film.annee).getFullYear().toString() === anneeSelect;

            // Filtrer par statut
            const matchStatut = statutSelect === 'all' || 
                                film.statut === statutSelect;

            // Filtrer par genre
            const matchGenre = genreSelect === 'all' || 
                               film.genre.toLowerCase() === genreSelect;

            return matchSearch && matchAnnee && matchStatut && matchGenre;
        }).sort((a, b) => a.titre.localeCompare(b.titre)); // Trier par titre
    }

    // Peupler les filtres d'année
    populateFilters() {
        const anneeSelect = document.getElementById('filter-annee');
        const statutSelect = document.getElementById('filter-statut');
        const genreSelect = document.getElementById('filter-genre');

        // Vérifier si les éléments existent
        if (!anneeSelect || !statutSelect || !genreSelect) {
            console.error('Un ou plusieurs éléments de filtre non trouvés');
            return;
        }

        // Années
        const annees = [...new Set(this.films.map(film => new Date(film.annee).getFullYear().toString()))];
        annees.sort((a, b) => b.localeCompare(a));

        // Supprimer les options existantes (sauf la première)
        while (anneeSelect.options.length > 1) {
            anneeSelect.removeChild(anneeSelect.lastChild);
        }

        // Ajouter les nouvelles années
        annees.forEach(annee => {
            const option = document.createElement('option');
            option.value = annee;
            option.textContent = annee;
            anneeSelect.appendChild(option);
        });

        // Statuts
        const statuts = [...new Set(this.films.map(film => film.statut))];
        statuts.sort((a, b) => a.localeCompare(b));

        // Supprimer les options existantes (sauf la première)
        while (statutSelect.options.length > 1) {
            statutSelect.removeChild(statutSelect.lastChild);
        }

        // Ajouter les nouveaux statuts
        statuts.forEach(statut => {
            const option = document.createElement('option');
            option.value = statut;
            option.textContent = statut === 'en_salle' ? 'En Salle' : 'Prochainement';
            statutSelect.appendChild(option);
        });

        // Genres
        const genres = [...new Set(this.films.map(film => film.genre))];
        genres.sort((a, b) => a.localeCompare(b));

        // Supprimer les options existantes (sauf la première)
        while (genreSelect.options.length > 1) {
            genreSelect.removeChild(genreSelect.lastChild);
        }

        // Ajouter les nouveaux genres
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    }

    // Convertir des minutes en heures et minutes
    formatDuration(minutes) {
        if (!minutes) return 'N/A';
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
            return `${minutes}min`;
        } else if (remainingMinutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h${remainingMinutes}min`;
        }
    }

    // Nettoyer les films de test et indésirables
    clearTestFilms() {
        try {
            const films = this.loadFilms() || [];
            
            console.log('DEBUG - Films avant nettoyage:', films);
            
            // Filtrer pour supprimer tous les films par défaut ou de test
            const cleanFilms = films.filter(film => {
                const isTestFilm = 
                    film.titre === 'Film par Défaut' ||
                    film.titre.includes('Film Test') ||
                    film.titre.includes('Film de Test') ||
                    film.synopsis?.includes('Un film par défaut') ||
                    film.synopsis?.includes('Un film de test') ||
                    film.annee === 1970 || // Année par défaut
                    film.realisateur === 'Réalisateur Inconnu' ||
                    film.realisateur === 'Réalisateur Test';
                
                if (isTestFilm) {
                    console.log('DEBUG - Film supprimé:', film);
                }
                
                return !isTestFilm;
            });

            // Sauvegarder les films nettoyés
            if (cleanFilms.length !== films.length) {
                console.log('DEBUG - Films après nettoyage:', cleanFilms);
                localStorage.setItem('films', JSON.stringify(cleanFilms));
                this.films = cleanFilms;
                this.renderFilms();
            }

            // Forcer la suppression complète si nécessaire
            if (cleanFilms.length === 0) {
                console.log('DEBUG - Aucun film valide, vidage complet de localStorage');
                localStorage.removeItem('films');
            }
        } catch (error) {
            console.error('Erreur lors du nettoyage des films:', error);
        }
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            // Create notification container if it doesn't exist
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container position-fixed top-0 end-0 p-3';
            notificationContainer.style.zIndex = '1050';
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        notificationContainer.appendChild(notification);

        // Automatically remove the notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode === notificationContainer) {
                notificationContainer.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialiser le gestionnaire de films quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.filmManager = new FilmManager();
        window.filmManager.initEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du gestionnaire de films:', error);
    }
});
