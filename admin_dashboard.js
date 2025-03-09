// Logout Function
function logout() {
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');

    // Redirect to login page
    window.location.href = 'login.html';
}

// Fonction globale de toggle de la sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        // Basculer la classe sidebar-hidden
        sidebar.classList.toggle('sidebar-hidden');
        
        // Ajuster la largeur du contenu principal
        if (sidebar.classList.contains('sidebar-hidden')) {
            mainContent.style.width = '100%';
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.width = 'calc(100% - 250px)';
            mainContent.style.marginLeft = '250px';
        }
    }
}

// Toggle Notifications
function toggleNotifications() {
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationContainer = document.querySelector('.notification-container');
    if (notificationContainer.contains(event.target)) {
        notificationsDropdown.classList.toggle('show-notifications');
    } else {
        notificationsDropdown.classList.remove('show-notifications');
    }
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const notificationContainer = document.querySelector('.notification-container');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    
    if (notificationContainer && !notificationContainer.contains(event.target)) {
        notificationsDropdown.classList.remove('show-notifications');
    }
});

// Fonction de débogage pour vérifier l'état du DOM
function debugDOMElements() {
    console.log('Débogage des éléments du DOM :');
    const elementsToCheck = [
        'total-clients', 
        'total-tickets', 
        'total-reservations', 
        'revenu-mensuel'
    ];

    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Élément trouvé : ${id}`, element);
        } else {
            console.error(`ERREUR : Élément non trouvé : ${id}`);
        }
    });
}

// Fonction pour basculer la barre latérale
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Fonction pour générer des statistiques dynamiques
function genererStatistiquesCinema() {
    // Définition des statistiques de base avec des paramètres de génération
    const statistiques = [
        {
            id: 'nombre-clients',
            base: 1500,      // Nombre de base de clients
            volatilite: 0.05,// Volatilité de 5%
            unite: ''        // Pas d'unité spéciale
        },
        {
            id: 'nombre-reservations',
            base: 450,       // Nombre de base de réservations
            volatilite: 0.07,// Volatilité de 7%
            unite: ''        // Pas d'unité spéciale
        },
        {
            id: 'nombre-tickets',
            base: 750,       // Nombre de base de tickets vendus
            volatilite: 0.06,// Volatilité de 6%
            unite: ''        // Pas d'unité spéciale
        },
        {
            id: 'revenu-mensuel',
            base: 95000,     // Revenu mensuel de base
            volatilite: 0.08,// Volatilité de 8%
            unite: ' DH'     // Unité en dirhams
        }
    ];

    // Fonction pour calculer une nouvelle valeur avec volatilité
    function calculerValeur(stat) {
        // Génération d'un facteur aléatoire basé sur la volatilité
        const facteurAleatoire = (Math.random() * 2 - 1) * stat.volatilite;
        
        // Calcul de la nouvelle valeur
        const nouvelleValeur = stat.base * (1 + facteurAleatoire);
        
        // Arrondir et s'assurer que la valeur n'est pas négative
        return Math.max(Math.floor(nouvelleValeur), 0);
    }

    // Mettre à jour chaque statistique
    statistiques.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            const valeur = calculerValeur(stat);
            // Formater la valeur avec séparateur de milliers et unité
            element.textContent = valeur.toLocaleString() + stat.unite;
        }
    });
}

// Événement de chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les boutons de toggle potentiels
    const toggleButtons = document.querySelectorAll('.sidebar-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Empêcher le comportement par défaut
            toggleSidebar(); // Appeler la fonction de toggle
        });
    });

    // Générer les statistiques initiales
    genererStatistiquesCinema();

    // Mettre à jour les statistiques périodiquement
    setInterval(genererStatistiquesCinema, 3000);

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        const chart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [{
                    label: 'Revenus Mensuels',
                    data: [12000, 19000, 15000, 22000, 17000, 23000],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenus (DH)'
                        }
                    }
                }
            }
        });
    }

    // Films Chart
    const filmsCtx = document.getElementById('filmsChart');
    if (filmsCtx) {
        const donneesPartition = {
            labels: [
                'Action', 
                'Comédie', 
                'Drame', 
                'Science-Fiction', 
                'Animation', 
                'Thriller', 
                'Romance', 
                'Fantastique'
            ],
            data: [
                Math.floor(Math.random() * 20) + 10,  // Action
                Math.floor(Math.random() * 15) + 8,   // Comédie
                Math.floor(Math.random() * 12) + 6,   // Drame
                Math.floor(Math.random() * 10) + 5,   // Science-Fiction
                Math.floor(Math.random() * 8) + 4,    // Animation
                Math.floor(Math.random() * 7) + 3,    // Thriller
                Math.floor(Math.random() * 6) + 2,    // Romance
                Math.floor(Math.random() * 5) + 1     // Fantastique
            ]
        };

        new Chart(filmsCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: donneesPartition.labels,
                datasets: [{
                    data: donneesPartition.data,
                    backgroundColor: [
                        '#FF3131', '#8B0000', '#FF4500', '#B22222', 
                        '#DC143C', '#8B0000', '#FF6347', '#CD5C5C'
                    ],
                    hoverBackgroundColor: [
                        '#FF6347', '#A52A2A', '#FF7F50', '#CD5C5C', 
                        '#FF1493', '#A52A2A', '#FF4500', '#B22222'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#8B0000',
                            boxWidth: 20,
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: 'Répartition Détaillée des Films par Genre',
                        color: '#8B0000',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} films (${percentage}%)`;
                            }
                        }
                    }
                },
                layout: {
                    padding: 10
                }
            }
        });
    }
});
