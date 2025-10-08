document.addEventListener('DOMContentLoaded', () => {
    const productsDiv = document.querySelector('#cta-products');
    const orderDiv = document.querySelector('#cta-order');

    if (productsDiv) {
        productsDiv.addEventListener('click', () => {
            window.location.href = './product.html';
        });
    }

    if (orderDiv) {
        orderDiv.addEventListener('click', () => {
            window.location.href = './order.html'; 
        });
    }
});
