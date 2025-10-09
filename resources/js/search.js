// resources/js/search.js
// Minimal header search wiring only. Actual renderSearchResults is provided by products.js

document.addEventListener('DOMContentLoaded', () => {
    const headerInput = document.getElementById('search')
    if (!headerInput) return

    headerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = headerInput.value.trim()
            if (q.length) window.location.href = '/search?q=' + encodeURIComponent(q)
        }
    })
})
