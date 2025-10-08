// js/productSlider.js

window.addEventListener('load', () => {
    const sliders = document.querySelectorAll('.slider-container');

    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const prevButton = slider.querySelector('.slider-button.prev');
        const nextButton = slider.querySelector('.slider-button.next');
        const cards = slider.querySelectorAll('.slider-card');
        const wrapper = slider.querySelector('.slider-wrapper');

        if (!track || !prevButton || !nextButton || !wrapper || cards.length === 0) {
            return;
        }

        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap);
        const step = cardWidth + gap;
        let currentIndex = 0;

        const isServiceSlider = slider.id === 'service-slider';
        if (isServiceSlider) {
            const maxScroll = track.scrollWidth - wrapper.clientWidth;
            track.style.transform = `translateX(-${maxScroll}px)`;
            currentIndex = Math.round(maxScroll / step);
        }

        function moveTrack() {
            const maxScroll = track.scrollWidth - wrapper.clientWidth;
            const newPosition = Math.min(currentIndex * step, maxScroll);
            track.style.transform = `translateX(-${newPosition}px)`;
            updateButtons();
        }

        function updateButtons() {
            const maxScroll = track.scrollWidth - wrapper.clientWidth;
            prevButton.disabled = currentIndex === 0;

            const endReached = (currentIndex * step) >= (maxScroll - 1);
            nextButton.disabled = endReached;
        }

        nextButton.addEventListener('click', () => {
            const maxScroll = track.scrollWidth - wrapper.clientWidth;
            if ((currentIndex * step) < maxScroll) {
                currentIndex++;
                moveTrack();
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                moveTrack();
            }
        });

        updateButtons();
    });
});
