// ==================== NAVIGATION ====================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('nav-open');
        }
    });
});

// ==================== DESTINATION SEARCH ====================
const searchInput = document.querySelector('#destinationSearch');
const destinationCards = document.querySelectorAll('.destination-card');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        destinationCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(query) || description.includes(query);
            card.style.display = isVisible ? 'block' : 'none';
        });
    });
}

// ==================== BOOKING MODAL ====================
const bookingModal = document.querySelector('#bookingModal');
const bookingModalClose = document.querySelector('#bookingModalClose');
const bookingForm = document.querySelector('#bookingForm');
const bookingDestinationInput = document.querySelector('#bookingDestination');
const bookButtons = document.querySelectorAll('.book-btn');

const openBookingModal = (destinationName) => {
    if (!bookingModal) return;
    bookingDestinationInput.value = destinationName;
    bookingModal.classList.remove('hidden');
    bookingModal.setAttribute('aria-hidden', 'false');
};

const closeBookingModal = () => {
    if (!bookingModal) return;
    bookingModal.classList.add('hidden');
    bookingModal.setAttribute('aria-hidden', 'true');
    bookingForm.reset();
};

bookButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const card = event.target.closest('.destination-card');
        const destinationName = card ? card.querySelector('h3').textContent : 'Luxury Destination';
        openBookingModal(destinationName);
    });
});

if (bookingModalClose) {
    bookingModalClose.addEventListener('click', closeBookingModal);
}

if (bookingModal) {
    bookingModal.addEventListener('click', (event) => {
        if (event.target === bookingModal) {
            closeBookingModal();
        }
    });
}

if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = bookingForm.querySelector('#bookingName').value;
        const email = bookingForm.querySelector('#bookingEmail').value;
        const destination = bookingDestinationInput.value;
        if (name && email && destination) {
            alert(`Thank you, ${name}! Your booking request for ${destination} has been sent.`);
            closeBookingModal();
        }
    });
}

// ==================== CONTACT FORM ====================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        if (name && email && message) {
            alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon.`);
            contactForm.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// ==================== SMOOTH SCROLL ENHANCEMENT ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        document.querySelector('#destinations').scrollIntoView({ behavior: 'smooth' });
    });
}

console.log('Luxury Travel Website - JavaScript Loaded!');
