document.addEventListener('DOMContentLoaded', () => {
    const seancesManager = new SeancesManager();
    seancesManager.init();
});

class SeancesManager {
    constructor() {
        this.STORAGE_KEYS = {
            FILMS: 'films',
            SALLES: 'salles',
            SEANCES: 'seances'
        };

        this.films = [];
        this.salles = [];
        this.seances = [];
    }

    init() {
        this.loadDataFromLocalStorage();
        this.populateFilmSelectors();
        this.populateSalleSelectors();
        this.renderSeancesTable();
        this.bindEvents();
    }

    loadDataFromLocalStorage() {
        this.films = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FILMS) || '[]');
        this.salles = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SALLES) || '[]');
        this.seances = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SEANCES) || '[]');
    }

    saveToLocalStorage() {
        localStorage.setItem(this.STORAGE_KEYS.SEANCES, JSON.stringify(this.seances));
    }

    populateFilmSelectors() {
        const filmSelectors = [
            document.getElementById('seance-film'),
            document.getElementById('modifier-seance-film')
        ];

        filmSelectors.forEach(selector => {
            if (selector) {
                selector.innerHTML = '<option value="">Sélectionner un film</option>';
                this.films.forEach(film => {
                    const option = document.createElement('option');
                    option.value = film.id;
                    // Afficher le titre et le statut du film
                    option.textContent = `${film.titre} (${film.statut || 'Statut non défini'})`;
                    
                    // Ajouter une classe basée sur le statut pour un style potentiel
                    const statutNormalise = film.statut ? 
                        film.statut.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '') : 
                        'non-defini';
                    
                    option.className = `film-statut-${statutNormalise}`;
                    
                    selector.appendChild(option);
                });
            }
        });
    }

    populateSalleSelectors() {
        const salleSelectors = [
            document.getElementById('seance-salle'),
            document.getElementById('modifier-seance-salle')
        ];

        salleSelectors.forEach(selector => {
            if (selector) {
                selector.innerHTML = '<option value="">Sélectionner une salle</option>';
                this.salles.forEach(salle => {
                    const option = document.createElement('option');
                    option.value = salle.id;
                    // Afficher le nom et le type de la salle
                    option.textContent = `${salle.nom} (${salle.type || 'Type non défini'})`;
                    
                    // Ajouter une classe basée sur le type pour un style potentiel
                    const typeNormalise = salle.type ? 
                        salle.type.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '') : 
                        'non-defini';
                    
                    option.className = `salle-type-${typeNormalise}`;
                    
                    selector.appendChild(option);
                });
            }
        });
    }

    renderSeancesTable() {
        console.log('DEBUG - Début de renderSeancesTable');
        console.log('DEBUG - Nombre de films:', this.films.length);
        console.log('DEBUG - Films:', JSON.stringify(this.films));
        console.log('DEBUG - Nombre de séances:', this.seances.length);
        console.log('DEBUG - Séances:', JSON.stringify(this.seances));

        const tableBody = document.getElementById('seances-table-body');
        if (!tableBody) {
            console.error('DEBUG - Impossible de trouver le corps du tableau des séances');
            return;
        }

        tableBody.innerHTML = '';

        if (this.seances.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="7" class="text-center">
                    Aucune séance n'a été ajoutée
                </td>
            `;
            tableBody.appendChild(noDataRow);
            return;
        }

        this.seances.forEach((seance, index) => {
            // Vérifications de sécurité
            if (!seance) {
                console.warn(`DEBUG - Séance à l'index ${index} est undefined`);
                return;
            }

            console.log(`DEBUG - Séance ${index}:`, JSON.stringify(seance));

            // Vérification du film
            let film = null;
            if (seance.film) {
                film = this.films.find(f => {
                    // Conversion sécurisée en chaîne
                    const filmId = f.id ? f.id.toString() : null;
                    const seanceFilmId = seance.film ? seance.film.toString() : null;
                    return filmId === seanceFilmId;
                });
            }

            // Vérification de la salle
            let salle = null;
            if (seance.salle) {
                salle = this.salles.find(s => {
                    // Conversion sécurisée en chaîne
                    const salleId = s.id ? s.id.toString() : null;
                    const seanceSalleId = seance.salle ? seance.salle.toString() : null;
                    return salleId === seanceSalleId;
                });
            }

            // Création de la ligne du tableau
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${film ? film.titre : 'Film inconnu'}</td>
                <td>
                    ${salle ? `${salle.nom} (${salle.type || 'Type non défini'})` : 'Salle inconnue'}
                </td>
                <td>${seance.date || 'Date non définie'}</td>
                <td>${seance.heure || 'Heure non définie'}</td>
                <td>${seance.version || 'Version non définie'}</td>
                <td>
                    <button class="action-btn btn-editer btn-modifier-seance" data-index="${index}">Editer</button>
                    <button class="action-btn btn-supprimer btn-supprimer-seance" data-index="${index}">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        console.log('DEBUG - Fin de renderSeancesTable');
    }

    bindEvents() {
        // Événement pour ajouter une séance
        const btnAjouterSeance = document.getElementById('save-seance-ajouter-btn');
        if (btnAjouterSeance) {
            btnAjouterSeance.addEventListener('click', () => this.createSeance());
        }

        // Événement pour modifier une séance
        const btnModifierSeance = document.getElementById('save-seance-modifier-btn');
        if (btnModifierSeance) {
            btnModifierSeance.addEventListener('click', () => this.updateSeance());
        }

        // Événements pour les boutons de modification et suppression dans le tableau
        const tableBody = document.querySelector('#seances-table tbody');
        if (tableBody) {
            tableBody.addEventListener('click', (event) => {
                const btnModifier = event.target.closest('.btn-modifier-seance');
                const btnSupprimer = event.target.closest('.btn-supprimer-seance');

                if (btnModifier) {
                    const index = parseInt(btnModifier.getAttribute('data-index'), 10);
                    this.prepareEditSeance(index);
                }

                if (btnSupprimer) {
                    const index = parseInt(btnSupprimer.getAttribute('data-index'), 10);
                    this.prepareDeleteSeance(index);
                }
            });
        }

        // Événement pour confirmer la suppression
        const btnConfirmerSuppression = document.getElementById('btn-confirmer-suppression-seance');
        if (btnConfirmerSuppression) {
            btnConfirmerSuppression.addEventListener('click', () => this.confirmDeleteSeance());
        }
    }

    createSeance() {
        const film = document.getElementById('seance-film').value;
        const salle = document.getElementById('seance-salle').value;
        const date = document.getElementById('seance-date').value;
        const heure = document.getElementById('seance-heure').value;
        const version = document.getElementById('seance-version').value;

        if (!film || !salle || !date || !heure || !version) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const nouvelleSeance = {
            id: `seance_${Date.now()}`,
            film,
            salle,
            date,
            heure,
            version
        };

        this.seances.push(nouvelleSeance);
        this.saveToLocalStorage();
        this.renderSeancesTable();

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-ajouter-seance'));
        if (modal) modal.hide();

        // Réinitialiser le formulaire
        document.getElementById('form-ajouter-seance').reset();
    }

    prepareEditSeance(index) {
        const seance = this.seances[index];
        if (!seance) return;

        console.log('Preparing to edit seance:', seance);
        console.log('Available films:', this.films);
        console.log('Available salles:', this.salles);

        // Trouver le film correspondant
        const film = this.films.find(f => f.id.toString() === seance.film.toString());
        console.log('Found film:', film);

        // Trouver la salle correspondante
        const salle = this.salles.find(s => s.id.toString() === seance.salle.toString());
        console.log('Found salle:', salle);

        // Remplir les sélecteurs de film
        const filmSelect = document.getElementById('modifier-seance-film');
        if (filmSelect) {
            filmSelect.value = seance.film;
            console.log('Film select value set to:', seance.film);
        }

        // Remplir les sélecteurs de salle
        const salleSelect = document.getElementById('modifier-seance-salle');
        if (salleSelect) {
            salleSelect.value = seance.salle;
            console.log('Salle select value set to:', seance.salle);
        }

        // Remplir les autres champs
        const dateInput = document.getElementById('modifier-seance-date');
        if (dateInput) {
            dateInput.value = seance.date;
            console.log('Date input set to:', seance.date);
        }

        const heureInput = document.getElementById('modifier-seance-heure');
        if (heureInput) {
            heureInput.value = seance.heure;
            console.log('Heure input set to:', seance.heure);
        }

        const versionSelect = document.getElementById('modifier-seance-version');
        if (versionSelect) {
            versionSelect.value = seance.version;
            console.log('Version select set to:', seance.version);
        }

        // Stocker l'index de la séance à modifier
        const modalModifier = document.getElementById('modal-modifier-seance');
        if (modalModifier) {
            modalModifier.setAttribute('data-index', index);
            console.log('Modal index set to:', index);

            // Afficher explicitement le modal
            const modalInstance = new bootstrap.Modal(modalModifier);
            modalInstance.show();
        }
    }

    updateSeance() {
        const index = document.getElementById('modal-modifier-seance').getAttribute('data-index');
        if (index === null) return;

        const film = document.getElementById('modifier-seance-film').value;
        const salle = document.getElementById('modifier-seance-salle').value;
        const date = document.getElementById('modifier-seance-date').value;
        const heure = document.getElementById('modifier-seance-heure').value;
        const version = document.getElementById('modifier-seance-version').value;

        if (!film || !salle || !date || !heure || !version) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        // Conserver l'ID original de la séance
        this.seances[index] = {
            id: this.seances[index].id,
            film,
            salle,
            date,
            heure,
            version
        };

        this.saveToLocalStorage();
        this.renderSeancesTable();

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-modifier-seance'));
        if (modal) modal.hide();
    }

    prepareDeleteSeance(index) {
        // Stocker l'index de la séance à supprimer
        const modalConfirmation = document.getElementById('modal-confirmer-suppression-seance');
        if (modalConfirmation) {
            modalConfirmation.setAttribute('data-index', index);

            // Afficher explicitement le modal de confirmation
            const modalInstance = new bootstrap.Modal(modalConfirmation);
            modalInstance.show();
        }
    }

    confirmDeleteSeance() {
        const modalConfirmation = document.getElementById('modal-confirmer-suppression-seance');
        if (!modalConfirmation) return;

        const index = modalConfirmation.getAttribute('data-index');
        if (index !== null) {
            // Supprimer la séance
            this.seances.splice(index, 1);
            
            // Mettre à jour localStorage
            this.saveToLocalStorage();
            
            // Réafficher les séances
            this.renderSeancesTable();

            // Fermer le modal de confirmation
            const modalInstance = bootstrap.Modal.getInstance(modalConfirmation);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    }
}
