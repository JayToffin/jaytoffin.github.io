(function () {
    const mobileMenuRoot = document.getElementById('mobile-nav-menu');
    const mainView = document.getElementById('mobile-nav-main-view');
    const categoryView = document.getElementById('mobile-category-browser');
    const promotionView = document.getElementById('mobile-promotion-browser');
    const accountView = document.getElementById('mobile-account-browser');

    if (!mobileMenuRoot || !mainView || !categoryView || !promotionView || !accountView) return;

    const views = {
        'category': { 
            view: categoryView, 
            chips: document.getElementById('mobile-category-chips'), 
            content: document.getElementById('mobile-category-content'), 
            backBtn: document.getElementById('mobile-category-back') 
        },
        'promotion': { 
            view: promotionView, 
            chips: document.getElementById('mobile-promotion-chips'), 
            content: document.getElementById('mobile-promotion-content'), 
            backBtn: document.getElementById('mobile-promotion-back') 
        },
        'account': { 
            view: accountView, 
            backBtn: document.getElementById('mobile-account-back') 
        },
        'search': {
            view: document.getElementById('mobile-search-browser'),
            backBtn: document.getElementById('mobile-search-back')
        }
    };

    const TOFFIN_MENU_DATA = [
        { label: 'Home', href: 'index.html' },
        { label: 'Category', action: 'open-category-browser' },
        { label: 'Brand', href: 'brand.html' },
        { label: 'Promotion', action: 'open-promotion-browser' }
    ];

    const MOBILE_PROMOTION_BROWSER_DATA = [
        {
            key: 'product-bundle', label: 'Product Bundle', sectionTitle: 'Product Bundle',
            items: [
                { label: 'Toffin for Home', href: 'product-bundle.html', image: 'images/product1.png' },
                { label: 'Toffin for Cafe', href: 'product-bundle.html', image: 'images/product1.png' },
                { label: 'Toffin for Office', href: 'product-bundle.html', image: 'images/product1.png' },
                { label: 'Toffin for Ingredients', href: 'product-bundle.html', image: 'images/product1.png' },
                { label: 'Toffin for Kitchen', href: 'product-bundle.html', image: 'images/product1.png' },
                { label: 'Toffin for Gelateria', href: 'product-bundle.html', image: 'images/product1.png' }
            ]
        },
        {
            key: 'promotion-program', label: 'Promo Program', sectionTitle: 'Promotion Program',
            items: [
                { label: 'Promotion', href: 'promotion.html', image: 'images/product1.png' }
            ]
        }
    ];

    const MOBILE_CATEGORY_BROWSER_DATA = [
        {
            key: 'coffee', label: 'Coffee', sectionTitle: 'Coffee', viewAllHref: '#',
            items: [
                { label: 'Home Espresso Machine', href: '#', image: 'images/product1.png' },
                { label: 'Capsules', href: '#', image: 'images/product1.png' },
                { label: 'Drip Coffee', href: '#', image: 'images/product1.png' },
                { label: 'Cold Brew', href: '#', image: 'images/product1.png' },
                { label: 'Ready to Drink', href: '#', image: 'images/product1.png' },
                { label: 'Kopi Luwak', href: '#', image: 'images/product1.png' },
                { label: 'Green Bean', href: '#', image: 'images/product1.png' }
            ]
        },
        {
            key: 'tea-beverages', label: 'Tea & Beverages', sectionTitle: 'Tea & Beverages', viewAllHref: '#',
            items: [
                { label: 'Syrups', href: 'category/ingredients/syrup.html', image: 'images/product1.png' },
                { label: 'Powder', href: 'category/ingredients/powder.html', image: 'images/product1.png' },
                { label: 'Tea', href: '#', image: 'images/product1.png' },
                { label: 'Milk and Dairy', href: '#', image: 'images/product1.png' }
            ]
        },
        {
            key: 'grinders', label: 'Grinders', sectionTitle: 'Grinders', viewAllHref: '#',
            items: [
                { label: 'Electric Grinder', href: '#', image: 'images/product1.png' },
                { label: 'Manual Grinder', href: '#', image: 'images/product1.png' }
            ]
        },
        {
            key: 'coffee-machines', label: 'Coffee Machines', sectionTitle: 'Coffee Machines', viewAllHref: '#',
            items: [
                { label: 'Home Espresso Machine', href: 'product-list.html', image: 'images/product1.png' },
                { label: 'Commercial Espresso Machine', href: 'category/coffee-machine/commercial-espresso-machine.html', image: 'images/product1.png' },
                { label: 'Fully Automatic Machine', href: 'category/coffee-machine/fully-automatic-machine.html', image: 'images/product1.png' },
                { label: 'Automatic Brewers', href: 'category/coffee-machine/automatic-coffee-brewers.html', image: 'images/product1.png' }
            ]
        },
        {
            key: 'manual-brew', label: 'Manual Brew', sectionTitle: 'Manual Brew', viewAllHref: '#',
            items: [
                { label: 'Dripper', href: '#', image: 'images/product1.png' },
                { label: 'Server', href: '#', image: 'images/product1.png' },
                { label: 'Kettle', href: '#', image: 'images/product1.png' }
            ]
        }
    ];

    // Generic show view
    function showMobileView(viewKey) {
        mainView.classList.remove('is-active');
        Object.keys(views).forEach(key => {
            if (key === viewKey) {
                views[key].view.hidden = false;
                views[key].view.classList.add('is-active');
            } else {
                views[key].view.hidden = true;
                views[key].view.classList.remove('is-active');
            }
        });
    }

    function hideMobileView(viewKey) {
        if (typeof closeAllBottomSheets === 'function') closeAllBottomSheets();
        setTimeout(function () {
            views[viewKey].view.classList.remove('is-active');
            views[viewKey].view.hidden = true;
            mainView.classList.add('is-active');
        }, 400);
    }

    // Generic render browser
    function renderBrowserData(data, containerPrefix) {
        const chipsContainer = views[containerPrefix].chips;
        const contentContainer = views[containerPrefix].content;
        
        chipsContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        data.forEach(function (section, index) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'mobile-category-chip' + (index === 0 ? ' is-active' : '');
            chip.textContent = section.label;
            chip.setAttribute('data-target', section.key);
            chipsContainer.appendChild(chip);

            const sectionEl = document.createElement('section');
            sectionEl.className = 'mobile-category-browser__section';
            sectionEl.id = `mobile-${containerPrefix}-section-${section.key}`;
            sectionEl.hidden = index !== 0;

            const header = document.createElement('div');
            header.className = 'mobile-category-browser__section-header';

            const title = document.createElement('h3');
            title.className = 'mobile-category-browser__section-title';
            title.textContent = section.sectionTitle;
            header.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'mobile-category-browser__grid';

            section.items.forEach(function (item) {
                const card = document.createElement('a');
                card.className = 'mobile-category-card';
                card.href = item.href || '#';

                const imageWrap = document.createElement('span');
                imageWrap.className = 'mobile-category-card__image';

                const image = document.createElement('img');
                image.src = item.image;
                image.alt = item.label;
                imageWrap.appendChild(image);

                const label = document.createElement('span');
                label.className = 'mobile-category-card__label';
                label.textContent = item.label;

                card.appendChild(imageWrap);
                card.appendChild(label);
                grid.appendChild(card);
            });

            sectionEl.appendChild(header);
            sectionEl.appendChild(grid);
            contentContainer.appendChild(sectionEl);
        });

        views[containerPrefix].backBtn.addEventListener('click', () => hideMobileView(containerPrefix));

        chipsContainer.addEventListener('click', function (event) {
            const chip = event.target.closest('.mobile-category-chip');
            if (!chip) return;

            const targetKey = chip.getAttribute('data-target');

            chipsContainer.querySelectorAll('.mobile-category-chip').forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });

            contentContainer.querySelectorAll('.mobile-category-browser__section').forEach(function (section) {
                section.hidden = section.id !== `mobile-${containerPrefix}-section-${targetKey}`;
            });
        });
    }

    function createMainMenuList(items, level) {
        const list = document.createElement('ul');
        list.className = 'mobile-menu-sublist level-' + level;

        items.forEach(function (item) {
            const li = document.createElement('li');
            li.className = 'mobile-menu-item' + (item.children && item.children.length ? ' has-children' : '');
            li.setAttribute('data-level', String(level));

            if (item.action) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'mobile-menu-link';
                button.setAttribute('data-mobile-action', item.action);
                button.textContent = item.label;
                li.appendChild(button);
            } else if (item.children && item.children.length) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'mobile-menu-toggle';
                button.setAttribute('aria-expanded', 'false');

                const labelSpan = document.createElement('span');
                labelSpan.textContent = item.label;
                button.appendChild(labelSpan);

                const icon = document.createElement('i');
                icon.className = 'fas fa-chevron-down';
                icon.setAttribute('aria-hidden', 'true');
                button.appendChild(icon);

                const panel = document.createElement('div');
                panel.className = 'mobile-menu-panel';
                panel.style.display = 'none';
                panel.appendChild(createMainMenuList(item.children, level + 1));

                li.appendChild(button);
                li.appendChild(panel);
            } else {
                const link = document.createElement('a');
                link.className = 'mobile-menu-link';
                link.href = item.href || '#';
                if (item.isLogout) {
                    link.classList.add('mobile-menu-logout');
                    link.innerHTML = '<i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i> ' + item.label;
                } else {
                    link.textContent = item.label;
                }
                li.appendChild(link);
            }

            list.appendChild(li);
        });

        return list;
    }

    function renderMobileMenu() {
        mobileMenuRoot.innerHTML = '';
        const topLevelList = createMainMenuList(TOFFIN_MENU_DATA, 0);
        while (topLevelList.firstChild) {
            mobileMenuRoot.appendChild(topLevelList.firstChild);
        }
    }

    function closeDescendants(item) {
        item.querySelectorAll('.mobile-menu-item.is-open').forEach(function (childItem) {
            childItem.classList.remove('is-open');
            const childButton = childItem.querySelector(':scope > .mobile-menu-toggle');
            const childPanel = childItem.querySelector(':scope > .mobile-menu-panel');
            if (childButton) childButton.setAttribute('aria-expanded', 'false');
            if (childPanel) childPanel.style.display = 'none';
        });
    }

    function closeSiblingItems(item) {
        const siblings = item.parentElement ? item.parentElement.children : [];
        Array.prototype.forEach.call(siblings, function (sibling) {
            if (sibling !== item) {
                sibling.classList.remove('is-open');
                const siblingButton = sibling.querySelector(':scope > .mobile-menu-toggle');
                const siblingPanel = sibling.querySelector(':scope > .mobile-menu-panel');
                if (siblingButton) siblingButton.setAttribute('aria-expanded', 'false');
                if (siblingPanel) siblingPanel.style.display = 'none';
                closeDescendants(sibling);
            }
        });
    }

    mobileMenuRoot.addEventListener('click', function (event) {
        const categoryTrigger = event.target.closest('[data-mobile-action="open-category-browser"]');
        if (categoryTrigger) {
            event.preventDefault();
            event.stopPropagation();
            showMobileView('category');
            return;
        }

        const promotionTrigger = event.target.closest('[data-mobile-action="open-promotion-browser"]');
        if (promotionTrigger) {
            event.preventDefault();
            event.stopPropagation();
            showMobileView('promotion');
            return;
        }

        const button = event.target.closest('.mobile-menu-toggle');
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const item = button.closest('.mobile-menu-item');
        const panel = item ? button.nextElementSibling : null;
        if (!item || !panel) return;

        const isOpen = item.classList.contains('is-open');
        closeSiblingItems(item);

        if (isOpen) {
            item.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');
            panel.style.display = 'none';
            closeDescendants(item);
        } else {
            item.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
            panel.style.display = 'block';
        }
    });

    document.addEventListener('click', function (e) {
        const triggers = [
            { id: '#btn-bottom-nav-category', view: 'category' },
            { id: '#btn-bottom-nav-promo', view: 'promotion' },
            { id: '#btn-bottom-nav-account', view: 'account' },
            { id: '#btn-open-mobile-search', view: 'search' }
        ];

        for (let trigger of triggers) {
            const btn = e.target.closest(trigger.id);
            if (btn) {
                e.preventDefault();
                if (typeof openBottomSheet === 'function' && typeof menuSheet !== 'undefined') {
                    openBottomSheet(menuSheet);
                }
                showMobileView(trigger.view);
                return;
            }
        }
    });

    if (views.account.backBtn) {
        views.account.backBtn.addEventListener('click', () => hideMobileView('account'));
    }
    if (views.search.backBtn) {
        views.search.backBtn.addEventListener('click', () => hideMobileView('search'));
    }

    // Initialize
    renderMobileMenu();
    renderBrowserData(MOBILE_CATEGORY_BROWSER_DATA, 'category');
    renderBrowserData(MOBILE_PROMOTION_BROWSER_DATA, 'promotion');

})();
