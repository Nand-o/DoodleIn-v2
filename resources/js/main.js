// js/main.js

const header = document.querySelector('header');
const aboutSection = document.querySelector('#about-section');
const homeBtn = document.querySelector('.logo');

const observerOptions = {
    root: null,
    threshold: 0.3 
};

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});

const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            header.classList.add('header-inverted');
        } else {
            header.classList.remove('header-inverted');
        }
    });
}, observerOptions);

observer.observe(aboutSection);

// --- Home gallery: render products from public/data/products.json ---
async function renderHomeGallery() {
    try {
        const track = document.querySelector('.gallery-track');
        if (!track) return;

        const maxAttr = track.getAttribute('data-max');
        const maxItems = maxAttr ? parseInt(maxAttr, 10) : Infinity;

        const res = await fetch('/data/products.json');
        if (!res.ok) return;

        const data = await res.json();
        const products = Array.isArray(data) ? data : (data.products || []);

        // Clear existing children
        track.innerHTML = '';

        const itemsToShow = products.slice(0, maxItems);

        itemsToShow.forEach(item => {
            // Normalize image path: resources/images/... -> /images/...
            let imgSrc = item.image || '';
            imgSrc = imgSrc.replace(/^resources\/images\//, '/images/');

            const div = document.createElement('div');
            div.className = 'product-item';

            div.innerHTML = `
                <img src="${imgSrc}" alt="${escapeHtml(item.name || '')}" />
                <div class="product-desc">
                    <h2>${escapeHtml(item.name || '')}</h2>
                    <p>${escapeHtml(item.price || '')}</p>
                </div>
                <a href="/orders" class="card-order-button">Order Now</a>
            `;

            track.appendChild(div);
        });
    } catch (err) {
        // fail silently in production-like setup
        console.error('Failed to render home gallery', err);
    }
}

// simple helper to avoid XSS when injecting text
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHomeGallery);
} else {
    renderHomeGallery();
}
