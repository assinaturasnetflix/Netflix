document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scroll for Buttons ---
    const scrollButtons = document.querySelectorAll('.smooth-scroll');

    scrollButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Previne o comportamento padrão do link/botão

            const targetId = button.getAttribute('data-target'); // Pega o ID do alvo do atributo data-target
            const targetElement = document.querySelector(targetId); // Seleciona o elemento alvo

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth', // Animação suave
                    block: 'start'     // Alinha o topo do elemento com o topo da viewport
                });
            } else {
                console.warn(`Smooth scroll target not found: ${targetId}`);
            }
        });
    });

    // --- Animation Delay Handling ---
    // Aplica o delay definido no atributo data-delay ao estilo inline
    // Isso garante que o delay funcione corretamente com a animação CSS
    const animatedElements = document.querySelectorAll('[data-delay]');
    animatedElements.forEach(el => {
        const delay = el.getAttribute('data-delay');
        if (delay) {
            el.style.animationDelay = delay;
        }
    });

    // --- Opcional: Interação extra para os Proof Items (Ex: Pausar vídeo no hover) ---
    // Adicione interações se desejar. Exemplo:
    /*
    const proofVideos = document.querySelectorAll('.proof-item--video video');
    proofVideos.forEach(video => {
        const proofItem = video.closest('.proof-item');
        if (proofItem) {
            proofItem.addEventListener('mouseenter', () => {
                // Poderia mostrar controles, diminuir overlay, etc.
                // video.play(); // Cuidado com autoplay em interações
            });
            proofItem.addEventListener('mouseleave', () => {
                // Reverter estado
            });
        }
    });
    */

    console.log("Landing page scripts loaded.");

});