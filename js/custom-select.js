(function () {
    'use strict';

    function closeAll(except) {
        document.querySelectorAll('.custom-select.is-open').forEach(function (wrapper) {
            if (wrapper !== except) {
                wrapper.classList.remove('is-open');
                var menu = wrapper.querySelector('.custom-select-menu');
                var button = wrapper.querySelector('.custom-select-button');
                if (menu) menu.classList.remove('is-visible');
                if (button) button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function positionMenu(menu) {
        menu.style.width = '100%';
    }

    function enhance(select) {
        if (select.closest('.custom-select')) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'custom-select';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        select.classList.add('custom-select-native');

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-select-button';
        button.setAttribute('aria-haspopup', 'listbox');
        button.setAttribute('aria-expanded', 'false');

        var menu = document.createElement('div');
        menu.className = 'custom-select-menu';
        menu.setAttribute('role', 'listbox');
        menu.id = select.id + 'Menu';
        button.setAttribute('aria-controls', menu.id);
        wrapper.appendChild(menu);

        function sync(value) {
            var option = Array.from(select.options).find(function (item) { return item.value === value; }) || select.options[select.selectedIndex];
            button.textContent = option ? option.textContent : '';
            menu.querySelectorAll('[role="option"]').forEach(function (item) {
                item.classList.toggle('is-selected', item.dataset.value === select.value);
                item.setAttribute('aria-selected', item.dataset.value === select.value ? 'true' : 'false');
            });
        }

        Array.from(select.options).forEach(function (option) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'custom-select-option';
            item.textContent = option.textContent;
            item.dataset.value = option.value;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-disabled', option.disabled ? 'true' : 'false');
            item.addEventListener('click', function () {
                if (option.disabled) return;
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync(option.value);
                wrapper.classList.remove('is-open');
                menu.classList.remove('is-visible');
                button.setAttribute('aria-expanded', 'false');
            });
            menu.appendChild(item);
        });

        button.addEventListener('click', function (event) {
            event.stopPropagation();
            var willOpen = !wrapper.classList.contains('is-open');
            closeAll(wrapper);
            wrapper.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
            menu.classList.toggle('is-visible', willOpen);
            if (willOpen) positionMenu(menu);
        });

        select.addEventListener('change', function () { sync(select.value); });
        wrapper.appendChild(button);
        sync(select.value);
    }

    function init() {
        document.querySelectorAll('select').forEach(enhance);
        window.addEventListener('resize', function () {
            document.querySelectorAll('.custom-select.is-open').forEach(function (wrapper) {
                positionMenu(wrapper.querySelector('.custom-select-menu'));
            });
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.custom-select')) closeAll();
        });
    }

    init();
}());
