document.addEventListener('DOMContentLoaded', () => {
    const seancesContainer = document.getElementById('seances-container');
    const currentDateElement = document.getElementById('current-date');
    const prevDateButton = document.getElementById('prev-date');
    const nextDateButton = document.getElementById('next-date');

    console.log('Page de séances chargée');

    let currentDate = new Date();

    // Fonction pour formater la date
    function formatDate(date) {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Fonction pour récupérer les séances depuis seances.html
    function getSeances() {
        const seancesScript = document.querySelector('script[data-type="seances"]');
        
        if (!seancesScript) {
            console.error('Aucun script de séances trouvé');
            return [];
        }

        try {
            const seances = JSON.parse(seancesScript.textContent);
            console.log('Séances récupérées :', seances);
            return seances;
        } catch (error) {
            console.error('Erreur de parsing des séances :', error);
            return [];
        }
    }

    // Fonction pour récupérer les films depuis localStorage
    function getFilms() {
        const filmsJson = localStorage.getItem('films');
        console.log('Films enregistrés en localStorage :', filmsJson);
        
        if (!filmsJson) {
            console.error('Aucun film enregistré en localStorage');
            return [];
        }

        try {
            const films = JSON.parse(filmsJson);
            console.log('Films récupérés :', films);
            return films;
        } catch (error) {
            console.error('Erreur de parsing des films :', error);
            return [];
        }
    }

    // Fonction pour filtrer les séances par date
    function filterSeancesByDate(seances, date) {
        return seances.filter(seance => {
            const seanceDate = new Date(seance.date);
            return seanceDate.toDateString() === date.toDateString();
        });
    }

    // Fonction pour afficher les séances
    function displaySeances(date) {
        const seances = getSeances();
        const films = getFilms();
        
        console.log('Date courante :', date);
        const filteredSeances = filterSeancesByDate(seances, date);
        console.log('Séances filtrées :', filteredSeances);
        
        // Regrouper les séances par film
        const seancesByFilm = {};
        filteredSeances.forEach(seance => {
            const film = films.find(f => f.id == seance.filmId);
            
            if (film) {
                if (!seancesByFilm[film.id]) {
                    seancesByFilm[film.id] = {
                        film: film,
                        seances: []
                    };
                }
                seancesByFilm[film.id].seances.push(seance);
            }
        });

        console.log('Séances par film :', seancesByFilm);

        // Générer le HTML des séances
        const filmCardsHtml = Object.values(seancesByFilm)
            .map(filmData => `
                <div class="film-card" data-film-id="${filmData.film.id}">
                    <div class="film-card-header">
                        <div class="d-flex align-items-center">
                            <img src="${filmData.film.posterUrl || 'path/to/default/poster.jpg'}" 
                                 alt="${filmData.film.titre}" 
                                 class="film-poster me-3" 
                                 style="width: 80px; height: 120px; object-fit: cover; border-radius: 5px;">
                            <div>
                                <h3>${filmData.film.titre}</h3>
                                <small>${Math.floor(filmData.film.duree / 60)}h${filmData.film.duree % 60}min</small>
                            </div>
                        </div>
                    </div>
                    <div class="film-card-body">
                        <div class="seances-list">
                            ${filmData.seances.map(seance => `
                                <div class="seance-time" 
                                     data-film-id="${filmData.film.id}" 
                                     data-seance-id="${seance.id}"
                                     data-date="${formatDate(date)}"
                                     data-time="${seance.heure}"
                                     data-salle="${seance.salle}"
                                     data-film-titre="${filmData.film.titre}"
                                     data-version="${filmData.film.version}"
                                     data-salle-id="${seance.salleId}">
                                    ${seance.heure} 
                                    (${seance.salle})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');

        // Afficher les séances ou un message si aucune séance
        seancesContainer.innerHTML = filmCardsHtml || `
            <div class="alert alert-info text-center">
                <i class="bi bi-calendar-x"></i>
                <p>Aucune séance disponible pour cette date</p>
            </div>
        `;

        // Ajouter des écouteurs pour les séances
        document.querySelectorAll('.seance-time').forEach(seanceEl => {
            seanceEl.addEventListener('click', () => {
                const seanceDetails = {
                    date: seanceEl.dataset.date,
                    time: seanceEl.dataset.time,
                    salle: seanceEl.dataset.salle,
                    filmTitre: seanceEl.dataset.filmTitre,
                    version: seanceEl.dataset.version,
                    filmId: seanceEl.dataset.filmId,
                    salleId: seanceEl.dataset.salleId
                };

                console.log('Seance details:', seanceDetails);

                // Store details in both localStorage and sessionStorage
                localStorage.setItem('selectedSeance', JSON.stringify(seanceDetails));
                sessionStorage.setItem('selectedSeance', JSON.stringify(seanceDetails));

                // Redirect to the next reservation step (seats selection)
                window.location.href = `user-reservation.html?${new URLSearchParams(seanceDetails).toString()}`;
            });
        });
    }

    // Mettre à jour la date affichée
    function updateDateDisplay() {
        currentDateElement.textContent = formatDate(currentDate);
        displaySeances(currentDate);
    }

    // Navigation entre les dates
    nextDateButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });

    prevDateButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });

    // Initialisation
    updateDateDisplay();
});
