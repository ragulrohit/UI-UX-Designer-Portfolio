(function () {
    const footerSocial = document.querySelectorAll('.footer-social');
    if (!footerSocial.length) return;

    const icons = [
        ['LinkedIn', 'https://linkedin.com/in/arjunmehta', '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" stroke-width="2"/><rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2"/>'],
        ['Behance', 'https://behance.net/arjunmehta', '<path d="M1 12.5h6.5c2.5 0 4-1.5 4-3.5s-1.5-3.5-4-3.5H1v10.5h7c2.5 0 4.5-1.5 4.5-4s-2-4-4.5-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 13h7.5c1.5 0 2.5-1 2.5-2.5S24 8 22.5 8H15v5zm0 0v5.5h7c1.5 0 2.5-1 2.5-2.5S23.5 13 22 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="6" x2="23" y2="6" stroke="currentColor" stroke-width="2"/>'],
        ['Dribbble', 'https://dribbble.com/arjunmehta', '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72" stroke="currentColor" stroke-width="2"/><path d="M19.13 5.09c-3.61 2.46-7.26 3.54-12.13 3.21" stroke="currentColor" stroke-width="2"/><path d="M2.34 14.6c5.39-.34 9.39-.56 14.66-3.72" stroke="currentColor" stroke-width="2"/>'],
        ['Twitter', 'https://twitter.com/arjunmehta', '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'],
        ['Instagram', '404.html', '<rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'],
        ['YouTube', '404.html', '<path d="M22 12s0-3.5-.45-5.1a2.8 2.8 0 0 0-2-2C17.95 4.5 12 4.5 12 4.5s-5.95 0-7.55.4a2.8 2.8 0 0 0-2 2C2 8.5 2 12 2 12s0 3.5.45 5.1a2.8 2.8 0 0 0 2 2c1.6.4 7.55.4 7.55.4s5.95 0 7.55-.4a2.8 2.8 0 0 0 2-2C22 15.5 22 12 22 12z" stroke="currentColor" stroke-width="2"/><path d="m10 9 5 3-5 3V9z" fill="currentColor"/>']
    ];

    footerSocial.forEach(function (container) {
        container.innerHTML = icons.map(function (icon) {
            return '<a href="' + icon[1] + '" class="social-link" aria-label="' + icon[0] + '" target="_blank" rel="noopener noreferrer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + icon[2] + '</svg></a>';
        }).join('');
    });
})();
