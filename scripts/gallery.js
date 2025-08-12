async function loadGallery() {
    const gallery = document.getElementById('gallery');
    const videoElements = [];

    function createInteractiveElement(tag, srcOrText, description, type) {
        const el = document.createElement(tag);
        if (tag === 'img' || tag === 'video') {
            el.src = srcOrText;
            el.alt = type === 'image' ? (description || 'Gallery image') : undefined;
            el.title = description || '';
        } else {
            el.textContent = srcOrText;
            el.title = description || '';
        }

        el.className = tag === 'div' ? 'gallery-item text-item' : 'gallery-item';
        el.tabIndex = 0;
        el.setAttribute('role', 'button');

        const open = () => openModal(type, srcOrText, description);

        el.addEventListener('click', open);
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });

        return el;
    }

    const response = await fetch('manifest.json');
    if (!response.ok) throw new Error('Could not load manifest.json');
    const items = await response.json();

    for (const item of items) {
        if (item.type === 'image') {
            const img = createInteractiveElement('img', item.src, item.description, 'image');
            gallery.appendChild(img);

        } else if (item.type === 'text') {
            const textResponse = await fetch(item.src);
            if (!textResponse.ok) {
                console.warn(`Could not load text file: ${item.src}`);
                continue;
            }
            const text = await textResponse.text();
            const div = createInteractiveElement('div', text, item.description, 'text');
            gallery.appendChild(div);

        } else if (item.type === 'video') {
            const vid = createInteractiveElement('video', item.src, item.description, 'video');
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

            videoElements.push(vid);
            gallery.appendChild(vid);
        }
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;
            if (!entry.isIntersecting) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, { threshold: 0.1 });

    videoElements.forEach(video => observer.observe(video));
}

// Modal elements
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function openModal(type, content, description) {
    [...modalContent.children].forEach(el => {
        if (el !== modalClose) el.remove();
    });

    let mediaElement;
    if (type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = content;
        mediaElement.alt = description || 'Enlarged image';
    } else if (type === 'text') {
        mediaElement = document.createElement('div');
        mediaElement.id = 'modal-text';
        mediaElement.textContent = content;
    } else if (type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = content;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.playsInline = true;
        mediaElement.muted = false;
    }

    modalContent.appendChild(mediaElement);

    if (description) {
        const descEl = document.createElement('div');
        descEl.className = 'modal-description';
        descEl.textContent = description;
        modalContent.appendChild(descEl);
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
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
    document.body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});
window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

let lastFocusedElement = null;
document.addEventListener('click', e => {
    if (!modal.classList.contains('active')) {
        lastFocusedElement = e.target;
    }
});

function trapFocus(element) {
    const focusableSelectors = [
        'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
        'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object',
        'embed', '[tabindex="0"]', '[contenteditable]'
    ];
    const focusableElements = element.querySelectorAll(focusableSelectors.join(','));
    if (focusableElements.length === 0) return;

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

loadGallery().catch(e => {
    console.error('Failed to load gallery:', e);
    const gallery = document.getElementById('gallery');
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'Failed to load gallery content.';
    errorDiv.style.color = 'red';
    gallery.appendChild(errorDiv);
});
