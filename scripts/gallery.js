async function loadGallery() {
    const gallery = document.getElementById('gallery');
    const videoElements = [];

    const response = await fetch('manifest.json');
    if (!response.ok) throw new Error('Could not load manifest.json');
    const items = await response.json();

    for (const item of items) {
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.description ? item.description : 'Gallery image';
            img.title = item.description || '';
            img.className = 'gallery-item';
            img.tabIndex = 0;
            img.setAttribute('role', 'button');
            img.addEventListener('click', () => openModal('image', item.src, item.description));
            img.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal('image', item.src, item.description);
                }
            });
            gallery.appendChild(img);

        } else if (item.type === 'text') {
            const textResponse = await fetch(item.src);
            if (!textResponse.ok) {
                console.warn(`Could not load text file: ${item.src}`);
                continue;
            }
            const text = await textResponse.text();
            const div = document.createElement('div');
            div.className = 'gallery-item text-item';
            div.textContent = text;
            div.title = item.description || '';
            div.tabIndex = 0;
            div.setAttribute('role', 'button');
            div.addEventListener('click', () => openModal('text', text, item.description));
            div.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal('text', text, item.description);
                }
            });
            gallery.appendChild(div);

        } else if (item.type === 'video') {
            const vid = document.createElement('video');
            vid.src = item.src;
            vid.className = 'gallery-item';
            vid.tabIndex = 0;
            vid.setAttribute('role', 'button');
            vid.muted = true;
            vid.loop = true;
            vid.preload = 'metadata';
            vid.title = item.description || '';

            vid.addEventListener('mouseenter', () => {
                vid.currentTime = 0;
                vid.play();
            });
            vid.addEventListener('mouseleave', () => {
                vid.pause();
                vid.currentTime = 0;
            });

            vid.addEventListener('click', () => openModal('video', item.src, item.description));
            vid.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal('video', item.src, item.description);
                }
            });

            videoElements.push(vid);
            gallery.appendChild(vid);
        }
    }

    // Auto-pause videos when scrolled out of view
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;
            if (!entry.isIntersecting) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, {threshold: 0.1});
    videoElements.forEach(video => observer.observe(video));
}


// Modal functionality
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function openModal(type, content, description) {
    [...modalContent.querySelectorAll(':not(#modal-close)')].forEach(el => el.remove());

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = content;
        img.alt = description || 'Enlarged image';
        modalContent.appendChild(img);

    } else if (type === 'text') {
        const textDiv = document.createElement('div');
        textDiv.id = 'modal-text';
        textDiv.textContent = content;
        modalContent.appendChild(textDiv);

    } else if (type === 'video') {
        const vid = document.createElement('video');
        vid.src = content;
        vid.controls = true;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.muted = false;
        modalContent.appendChild(vid);
    }

    if (description) {
        const descEl = document.createElement('div');
        descEl.style.marginTop = '10px';
        descEl.style.color = '#00ffff';
        descEl.style.fontStyle = 'italic';
        descEl.textContent = description;
        modalContent.appendChild(descEl);
    }

    modal.classList.add('active');
    modalClose.focus();
    trapFocus(modalContent);
}

function closeModal() {
    const vid = modalContent.querySelector('video');
    if (vid) {
        vid.pause();
        vid.currentTime = 0;
    }
    modal.classList.remove('active');
    if (lastFocusedElement) lastFocusedElement.focus();
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});
window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

let lastFocusedElement = null;
document.addEventListener('click', e => {
    if (!modal.classList.contains('active')) {
        lastFocusedElement = e.target;
    }
});

function trapFocus(element) {
    const focusableElements = element.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function trap(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}

loadGallery();
