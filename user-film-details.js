document.addEventListener('DOMContentLoaded', function() {
    // Retrieve film ID from URL and convert to number
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = parseInt(urlParams.get('id'), 10);

    // Fetch film details from localStorage
    let films = JSON.parse(localStorage.getItem('films')) || [];
    const film = films.find(f => f.id === filmId);

    if (film) {
        // Populate film details
        const titleElement = document.getElementById('filmTitle');
        const genreElement = document.getElementById('filmGenre');
        const yearElement = document.getElementById('filmYear');
        const directorElement = document.getElementById('filmDirector');
        const synopsisElement = document.getElementById('filmSynopsis');
        const dureeElement = document.getElementById('filmDuree');
        const statutElement = document.getElementById('filmStatut');
        const posterImg = document.getElementById('filmPoster');

        // Display current details
        titleElement.textContent = film.titre;
        genreElement.textContent = film.genre;
        yearElement.textContent = new Date(film.annee).getFullYear();
        directorElement.textContent = film.realisateur;
        synopsisElement.textContent = film.synopsis;
        const dureeHeures = Math.floor(film.duree / 60);
        const dureeMinutes = film.duree % 60;
        dureeElement.textContent = `${dureeHeures}h ${dureeMinutes}min`;
        statutElement.textContent = film.statut ? film.statut.charAt(0).toUpperCase() + film.statut.slice(1) : 'Non spécifié';
        
        // Set poster image (use a default if not available)
        posterImg.src = film.posterUrl || 'placeholder-poster.jpg';
        posterImg.alt = `Affiche de ${film.titre}`;

        // Add trailer button if trailer is available
        const trailerBtn = document.getElementById('trailerButton');
        const trailerModal = new bootstrap.Modal(document.getElementById('trailerModal'));
        const trailerVideo = document.getElementById('trailer-video');

        if (film.trailerUrl) {
            trailerBtn.style.display = 'inline-block';
            trailerBtn.addEventListener('click', () => {
                // Extract YouTube ID 
                const youtubeId = extractYouTubeId(film.trailerUrl);
                trailerVideo.src = `https://www.youtube.com/embed/${youtubeId}`;
                trailerModal.show();
            });
        } else {
            trailerBtn.style.display = 'none';
        }

        // Add edit functionality
        const editModal = new bootstrap.Modal(document.getElementById('editFilmModal'));
        const editBtn = document.getElementById('edit-film-btn');
        const saveEditBtn = document.getElementById('save-edit-film-btn');

        // Populate edit modal with current film details
        editBtn.addEventListener('click', () => {
            document.getElementById('edit-film-titre').value = film.titre;
            document.getElementById('edit-film-genre').value = film.genre;
            document.getElementById('edit-film-annee').value = new Date(film.annee).getFullYear();
            document.getElementById('edit-film-realisateur').value = film.realisateur;
            document.getElementById('edit-film-synopsis').value = film.synopsis;
            document.getElementById('edit-film-duree').value = film.duree;
            document.getElementById('edit-film-statut').value = film.statut;
            document.getElementById('edit-film-trailer').value = film.trailerUrl || '';
            
            // Store film ID in a hidden field
            const hiddenIdField = document.getElementById('edit-film-id');
            if (hiddenIdField) {
                hiddenIdField.value = film.id;
            }

            editModal.show();
        });

        // Save edited film details
        saveEditBtn.addEventListener('click', () => {
            // Retrieve updated values
            const updatedTitre = document.getElementById('edit-film-titre').value.trim();
            const updatedGenre = document.getElementById('edit-film-genre').value.trim();
            const updatedAnnee = document.getElementById('edit-film-annee').value.trim();
            const updatedRealisateur = document.getElementById('edit-film-realisateur').value.trim();
            const updatedSynopsis = document.getElementById('edit-film-synopsis').value.trim();
            const updatedDuree = document.getElementById('edit-film-duree').value.trim();
            const updatedStatut = document.getElementById('edit-film-statut').value.trim();
            const updatedTrailerUrl = document.getElementById('edit-film-trailer').value.trim();

            // Validate inputs
            if (!updatedTitre || !updatedGenre || !updatedAnnee || !updatedRealisateur) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Update film object
            const updatedFilm = {
                ...film,
                titre: updatedTitre,
                genre: updatedGenre,
                annee: new Date(updatedAnnee, 0, 1).getTime(), // Convert year to timestamp
                realisateur: updatedRealisateur,
                synopsis: updatedSynopsis,
                duree: parseInt(updatedDuree),
                statut: updatedStatut,
                trailerUrl: updatedTrailerUrl
            };

            // Find and update the film in the films array
            const filmIndex = films.findIndex(f => f.id === film.id);
            if (filmIndex !== -1) {
                films[filmIndex] = updatedFilm;

                // Save updated films to localStorage
                localStorage.setItem('films', JSON.stringify(films));

                // Update displayed details
                titleElement.textContent = updatedFilm.titre;
                genreElement.textContent = updatedFilm.genre;
                yearElement.textContent = new Date(updatedFilm.annee).getFullYear();
                directorElement.textContent = updatedFilm.realisateur;
                synopsisElement.textContent = updatedFilm.synopsis;
                const updatedDureeHeures = Math.floor(updatedFilm.duree / 60);
                const updatedDureeMinutes = updatedFilm.duree % 60;
                dureeElement.textContent = `${updatedDureeHeures}h ${updatedDureeMinutes}min`;
                statutElement.textContent = updatedFilm.statut ? updatedFilm.statut.charAt(0).toUpperCase() + updatedFilm.statut.slice(1) : 'Non spécifié';

                // Close the modal
                editModal.hide();

                // Optional: Show success notification
                alert('Film mis à jour avec succès !');
            }
        });

    } else {
        // Handle case where film is not found
        document.querySelector('.film-details-container').innerHTML = `
            <p class="text-center text-danger">
                Film non trouvé. ID recherché: ${filmId} 
                (Total films: ${films.length}, 
                First film ID: ${films[0]?.id})
            </p>`;
        
        // Log details for debugging
        console.error('Film not found', {
            searchId: filmId,
            filmIds: films.map(f => f.id),
            films: films
        });
    }

    // Helper function to extract YouTube ID
    function extractYouTubeId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : '';
    }
});
