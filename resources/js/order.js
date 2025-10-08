document.addEventListener('DOMContentLoaded', () => {
    const placeOrderBtn = document.querySelector('#place-order-btn');
    const modal = document.querySelector('#thank-you-modal');
    const closeBtn = document.querySelector('.close-button');

    closeBtn.addEventListener('click', () => {
        window.location.href = './index.html';
    });

    if (placeOrderBtn && modal) {
        placeOrderBtn.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            modal.classList.add('visible');

            setTimeout(() => {
                modal.classList.remove('visible');
            }, 3000); 
        });
    }
});
