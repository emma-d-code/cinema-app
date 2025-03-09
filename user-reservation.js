document.addEventListener('DOMContentLoaded', () => {
    const seatMap = document.getElementById('seat-map');
    const totalSeatsSpan = document.getElementById('total-seats');
    const totalPriceSpan = document.getElementById('total-price');
    const downloadTicketBtn = document.getElementById('download-ticket');
    const paymentForm = document.getElementById('payment-form');
    const movieDetailsDiv = document.getElementById('movie-details');

    // Sidebar elements
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const movieTitleSpan = document.getElementById('movie-title');
    const movieDateSpan = document.getElementById('movie-date');
    const movieRoomSpan = document.getElementById('movie-room');
    const movieDurationSpan = document.getElementById('movie-duration');

    // Ticket Prices
    const PRICES = {
        adult: 12,
        child: 8,
        senior: 10
    };

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const filmTitre = urlParams.get('film') || 'Film Non Spécifié';
    const filmDate = urlParams.get('date') || 'Date Non Spécifiée';
    const filmHeure = urlParams.get('heure') || 'Heure Non Spécifiée';
    const filmVersion = urlParams.get('version') || 'Version Non Spécifiée';
    const filmSalle = urlParams.get('salle') || 'Salle Non Spécifiée';

    // Populate movie details in main container
    movieDetailsDiv.innerHTML = `
        <div class="d-flex justify-content-between">
            <span>Film:</span>
            <span>${filmTitre}</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Date:</span>
            <span>${filmDate}</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Heure:</span>
            <span>${filmHeure}</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Version:</span>
            <span>${filmVersion}</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Salle:</span>
            <span>${filmSalle}</span>
        </div>
    `;

    // Populate sidebar details
    movieTitleSpan.textContent = filmTitre;
    movieDateSpan.textContent = `${filmDate} à ${filmHeure}`;
    movieRoomSpan.textContent = filmSalle;
    movieDurationSpan.textContent = '2h 15min'; // Hardcoded for now, could be dynamic in a real app

    // Create Seat Map
    function createSeatMap(rows = 8, seatsPerRow = 10) {
        seatMap.innerHTML = '';
        for (let row = 0; row < rows; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('d-flex', 'justify-content-center', 'mb-2');

            for (let seat = 0; seat < seatsPerRow; seat++) {
                const seatBtn = document.createElement('button');
                seatBtn.classList.add('seat');
                seatBtn.textContent = `${String.fromCharCode(65 + row)}${seat + 1}`;
                seatBtn.dataset.row = String.fromCharCode(65 + row);
                seatBtn.dataset.seat = seat + 1;

                seatBtn.addEventListener('click', () => toggleSeat(seatBtn));
                rowDiv.appendChild(seatBtn);
            }

            seatMap.appendChild(rowDiv);
        }
    }

    // Toggle Seat Selection
    function toggleSeat(seatBtn) {
        if (!seatBtn.classList.contains('occupied')) {
            seatBtn.classList.toggle('selected');
            updateTotalPrice();
        }
    }

    // Update Total Price
    function updateTotalPrice() {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        const adultTickets = parseInt(document.getElementById('adult-tickets').value) || 0;
        const childTickets = parseInt(document.getElementById('child-tickets').value) || 0;
        const seniorTickets = parseInt(document.getElementById('senior-tickets').value) || 0;

        const supplements = [];
        if (document.getElementById('popcorn').checked) supplements.push(3);
        if (document.getElementById('drink').checked) supplements.push(2);

        const supplementTotal = supplements.reduce((a, b) => a + b, 0);
        const totalSupplements = supplementTotal * selectedSeats.length;

        const adultTotal = adultTickets * PRICES.adult;
        const childTotal = childTickets * PRICES.child;
        const seniorTotal = seniorTickets * PRICES.senior;

        const totalPrice = adultTotal + childTotal + seniorTotal + totalSupplements;

        totalSeatsSpan.textContent = selectedSeats.length;
        totalPriceSpan.textContent = `${totalPrice}€`;

        // Enable/Disable download button based on selection
        downloadTicketBtn.disabled = selectedSeats.length === 0;
    }

    // Payment Form Submission
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation (you'd want more robust validation in a real app)
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;

        if (cardNumber && expiry && cvv) {
            alert('Paiement réussi! Vous pouvez maintenant télécharger votre billet.');
            downloadTicketBtn.disabled = false;
        } else {
            alert('Veuillez remplir tous les champs de paiement.');
        }
    });

    // Ticket Download
    downloadTicketBtn.addEventListener('click', () => {
        // In a real application, this would generate a PDF ticket
        alert('Billet téléchargé avec succès!');
    });

    // Event listeners for ticket categories and supplements
    ['adult-tickets', 'child-tickets', 'senior-tickets', 'popcorn', 'drink']
        .forEach(id => document.getElementById(id).addEventListener('change', updateTotalPrice));

    // Initialize seat map and other components
    createSeatMap();
});
