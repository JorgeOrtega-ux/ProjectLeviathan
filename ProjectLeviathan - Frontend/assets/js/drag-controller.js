function initDragController(closeCallback, isAnimatingCallback) {
    const draggableModules = document.querySelectorAll('[data-module="moduleOptions"]');

    draggableModules.forEach(module => {
        const menuContent = module.querySelector('.menu-content');
        const pillContainer = module.querySelector('.pill-container');

        if (!menuContent || !pillContainer) return;

        let isDragging = false;
        let startY;
        let initialTransformY = 0;

        const onDragStart = (e) => {
            if (window.innerWidth > 468 || (isAnimatingCallback && isAnimatingCallback()) || !module.classList.contains('active')) return;
            
            isDragging = true;
            startY = e.pageY || e.touches[0].pageY;
            
            const computedStyle = window.getComputedStyle(menuContent);
            const transform = new WebKitCSSMatrix(computedStyle.transform);
            initialTransformY = transform.m42;
            
            menuContent.style.transition = 'none';
        };

        const onDragMove = (e) => {
            if (!isDragging) return;
            const currentY = e.pageY || e.touches[0].pageY;
            let diffY = currentY - startY;

            if (initialTransformY + diffY < 0) {
                 diffY = -initialTransformY;
            }
            
            menuContent.style.transform = `translateY(${initialTransformY + diffY}px)`;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            const computedStyle = window.getComputedStyle(menuContent);
            const transform = new WebKitCSSMatrix(computedStyle.transform);
            const currentTransformY = transform.m42;

            const menuHeight = menuContent.offsetHeight;

            menuContent.style.transition = 'transform 0.3s ease-out';

            if (currentTransformY > menuHeight * 0.4) {
                if (typeof closeCallback === 'function') {
                    closeCallback(); 
                }
            } else {
                menuContent.style.transform = 'translateY(0)';
                
                menuContent.addEventListener('transitionend', () => {
                    if (module.classList.contains('active')) {
                       menuContent.style.transition = '';
                       menuContent.style.transform = '';
                    }
                }, { once: true });
            }
        };

        pillContainer.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        pillContainer.addEventListener('touchstart', onDragStart, { passive: true });
        document.addEventListener('touchmove', onDragMove);
        document.addEventListener('touchend', onDragEnd);
    });
}

export { initDragController };