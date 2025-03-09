document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les films depuis localStorage
    function getFilmsFromLocalStorage() {
        try {
            const filmsJson = localStorage.getItem('films');
            console.log('Films bruts dans localStorage:', filmsJson);
            
            if (!filmsJson) {
                console.error('Aucun film trouvé dans localStorage');
                return [];
            }
            
            const films = JSON.parse(filmsJson);
            console.log('Films parsés:', films);
            return films;
        } catch (error) {
            console.error('Erreur lors de la récupération des films:', error);
            return [];
        }
    }

    // Séparer les films par statut
    function categorizeMovies(films) {
        console.log('Tous les films:', films);

        const currentMovies = films.filter(film => 
            film.statut && film.statut.toLowerCase().includes('en salle')
        );

        const upcomingMovies = films.filter(film => 
            film.statut && film.statut.toLowerCase().includes('prochainement')
        );

        console.log('Films en salle:', currentMovies);
        console.log('Films prochainement:', upcomingMovies);

        return { currentMovies, upcomingMovies };
    }

    // Afficher les films dans leur section respective
    function displayMovies(movies, containerId) {
        const container = document.getElementById(containerId);
        
        // Vider le conteneur
        container.innerHTML = '';

        // Si aucun film
        if (movies.length === 0) {
            container.innerHTML = `<div class="col-12 text-center">Aucun film disponible</div>`;
            return;
        }

        // Créer les cartes de films
        movies.forEach(film => {
            const movieCard = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${film.image}" class="card-img-top" alt="${film.titre}">
                        <div class="card-body">
                            <h5 class="card-title">${film.titre}</h5>
                            <p class="card-text">${film.description}</p>
                            <p class="card-text">Genre: ${film.genre}</p>
                            <p class="card-text"><small class="text-muted">${film.statut}</small></p>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += movieCard;
        });
    }

    // Charger et afficher les films
    function loadMovies() {
        const films = getFilmsFromLocalStorage();
        const { currentMovies, upcomingMovies } = categorizeMovies(films);

        // Vérifier les conteneurs spécifiques à chaque page
        const currentMoviesContainer = document.getElementById('current-movies');
        const upcomingMoviesContainer = document.getElementById('upcoming-movies');
        const filmsEnSalleContainer = document.getElementById('films-en-salle');
        const filmsProchainementContainer = document.getElementById('films-prochainement');

        console.log('Conteneurs trouvés:', {
            currentMoviesContainer,
            upcomingMoviesContainer,
            filmsEnSalleContainer,
            filmsProchainementContainer
        });

        if (currentMoviesContainer) {
            displayMovies(currentMovies, 'current-movies');
        }

        if (upcomingMoviesContainer) {
            displayMovies(upcomingMovies, 'upcoming-movies');
        }

        if (filmsEnSalleContainer) {
            displayMovies(currentMovies, 'films-en-salle');
        }

        if (filmsProchainementContainer) {
            displayMovies(upcomingMovies, 'films-prochainement');
        }
    }

    // Charger les films au chargement de la page
    loadMovies();

    // Écouter les changements dans localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'films') {
            loadMovies();
        }
    });

    // Exposer loadMovies globalement pour pouvoir l'appeler depuis d'autres scripts
    window.loadMovies = loadMovies;
});
