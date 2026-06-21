document.addEventListener("DOMContentLoaded", () => {
    const endingMsg = document.getElementById("ending-msg");
    if (!endingMsg) return;

    const originalText = endingMsg.textContent;
    const glyphs = "X01_█§#@$⚡<>[]{}%&+*";
    let isScrambling = false;

    function decodeText() {
        if (isScrambling) return;
        isScrambling = true;

        let iterations = 0;
        const interval = setInterval(() => {
            endingMsg.textContent = originalText
                .split("")
                .map((char, index) => {
                    if (char === " ") return " ";
                    
                    if (index < iterations) {
                        return originalText[index];
                    }
                    
                    return glyphs[Math.floor(Math.random() * glyphs.length)];
                })
                .join("");

            if (iterations >= originalText.length) {
                clearInterval(interval);
                isScrambling = false;
            }

            iterations += 1 / 3; 
        }, 30);
    }

    setTimeout(decodeText, 500);

    endingMsg.addEventListener("mouseenter", decodeText);
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll('#sidebar a');

    sidebarLinks.forEach(link => {
        const svg = link.querySelector('svg');
        if (svg && !link.querySelector('.icon-box')) {
            // Create the wrapper
            const wrapper = document.createElement('div');
            wrapper.classList.add('icon-box');
            
            link.insertBefore(wrapper, svg);
            wrapper.appendChild(svg);
        }
    });
});