// js/main.js

const header = document.querySelector('header');
const aboutSection = document.querySelector('#about-section');
const homeBtn = document.querySelector('.logo');

const observerOptions = {
    root: null,
    threshold: 0.3 
};

homeBtn.addEventListener('click', () => {
    window.location.href = './index.html';
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
