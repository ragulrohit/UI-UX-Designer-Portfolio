(function () {
    'use strict';

    function closeAll(except) {
        document.querySelectorAll('.custom-select.is-open').forEach(function (wrapper) {
            if (wrapper !== except) {
                wrapper.classList.remove('is-open');
                var menu = wrapper.querySelector('.custom-select-menu');
                if (menu) menu.classList.remove('is-visible');
            }
        });
    }

    function positionMenu(wrapper, menu, button) {
        var rect = button.getBoundingClientRect();
        var menuHeight = Math.min(menu.scrollHeight, 280);
        var spaceBelow = window.innerHeight - rect.bottom - 12;
        var openAbove = spaceBelow < Math.min(menuHeight, 220) && rect.top > menuHeight;
        menu.style.left = rect.left + 'px';
        menu.style.width = rect.width + 'px';
        menu.style.top = (openAbove ? rect.top - menuHeight - 6 : rect.bottom + 6) + 'px';
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
        document.body.appendChild(menu);

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
            item.addEventListener('click', function () {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync(option.value);
                wrapper.classList.remove('is-open');
                menu.classList.remove('is-visible');
                button.setAttribute('aria-expanded', 'false');
            });
            menu.appendChild(item);
        });

        button.addEventListener('click', function () {
            var willOpen = !wrapper.classList.contains('is-open');
            closeAll(wrapper);
            wrapper.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
            menu.classList.toggle('is-visible', willOpen);
            if (willOpen) positionMenu(wrapper, menu, button);
        });

        select.addEventListener('change', function () { sync(select.value); });
        wrapper.appendChild(button);
        sync(select.value);
    }

    function init() {
        document.querySelectorAll('select').forEach(enhance);
        window.addEventListener('resize', function () {
            document.querySelectorAll('.custom-select.is-open').forEach(function (wrapper) {
                positionMenu(wrapper, wrapper.querySelector('.custom-select-menu'), wrapper.querySelector('.custom-select-button'));
            });
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.custom-select')) closeAll();
        });
    }

    init();
}());
