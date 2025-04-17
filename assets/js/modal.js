const navButtons = document.querySelectorAll('.nav-btn-modal');
const modals = document.querySelectorAll('.modal-overlay');
const closeButtons = document.querySelectorAll('.close-btn');



// Modal functionality
navButtons.forEach(button => {
button.addEventListener('click', () => {
    const modalId = button.getAttribute('data-modal') + 'Modal';
    const modal = document.getElementById(modalId);
    
    // Update active state for nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show the modal
    modal.style.display = 'flex';
});
});

// Close modals
closeButtons.forEach(button => {
button.addEventListener('click', () => {
    const modal = button.closest('.modal-overlay');
    modal.style.display = 'none';
    
    // Remove active state from nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
});
});

// Close modal when clicking outside
modals.forEach(modal => {
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
    modal.style.display = 'none';
    
    // Remove active state from nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    }
});
});