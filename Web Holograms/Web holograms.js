(function() {
    if (document.getElementById('holo-panel-tv')) {
        document.getElementById('holo-panel-tv').remove();
    }

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes holoFlicker {
            0% { opacity: 0.9; box-shadow: 0 0 10px rgba(0, 255, 255, 0.4); }
            50% { opacity: 1; box-shadow: 0 0 20px rgba(0, 255, 255, 0.7); }
            100% { opacity: 0.9; box-shadow: 0 0 10px rgba(0, 255, 255, 0.4); }
        }
        .holo-btn {
            background: rgba(0, 255, 255, 0.1); color: #00ffff; border: 1px solid #00ffff; 
            padding: 8px 12px; cursor: pointer; text-transform: uppercase; 
            font-size: 11px; font-family: "Courier New", Courier, monospace;
            border-radius: 4px; margin-bottom: 8px; transition: 0.2s;
        }
        .holo-btn:hover { background: rgba(0, 255, 255, 0.4); }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'holo-panel-tv';
    panel.style.cssText = `
        position: fixed; top: 20px; right: 20px; width: 340px;
        background: linear-gradient(rgba(0, 20, 40, 0.8) 50%, rgba(0, 40, 80, 0.8) 50%);
        border: 2px solid #00ffff; border-radius: 8px; z-index: 2147483647;
        font-family: "Courier New", Courier, monospace; color: #00ffff; 
        backdrop-filter: blur(5px); resize: both; overflow: auto;
        animation: holoFlicker 3s infinite;
    `;

    const header = document.createElement('div');
    header.style.cssText = `padding: 10px; border-bottom: 1px solid #00ffff; cursor: grab; display: flex; justify-content: space-between;`;
    header.innerHTML = `<div><strong>Holograma de Sites</strong><br><span style="font-size:9px;">created by tv</span></div>`;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.style.cssText = `background: transparent; color: #00ffff; border: none; cursor: pointer; font-weight: bold;`;
    closeBtn.onclick = () => panel.remove();
    header.appendChild(closeBtn);
    panel.appendChild(header);

    let isDragging = false, startX, startY, initialX, initialY;
    header.addEventListener('mousedown', (e) => {
        isDragging = true; startX = e.clientX; startY = e.clientY;
        initialX = panel.offsetLeft; initialY = panel.offsetTop;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panel.style.left = initialX + (e.clientX - startX) + 'px';
        panel.style.top = initialY + (e.clientY - startY) + 'px';
        panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => isDragging = false);

    const content = document.createElement('div');
    content.style.padding = '15px';
    content.style.display = 'flex'; content.style.flexDirection = 'column';

    const createBtn = (text, onClick) => {
        const b = document.createElement('button');
        b.innerText = text; b.className = 'holo-btn'; b.onclick = onClick;
        return b;
    };

    const generateDeepClone = () => {
        // 1. Clona a estrutura atual do DOM inteira
        const clone = document.documentElement.cloneNode(true);

        // 2. Serializa os Canvas (gráficos/tabelas complexas) em imagens Base64
        const originalCanvases = document.querySelectorAll('canvas');
        const clonedCanvases = clone.querySelectorAll('canvas');
        originalCanvases.forEach((canvas, i) => {
            try {
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.cssText = canvas.style.cssText;
                img.className = canvas.className;
                clonedCanvases[i].parentNode.replaceChild(img, clonedCanvases[i]);
            } catch(e) {}
        });

        // 3. Captura os dados dinâmicos digitados em inputs e selects
        const originalInputs = document.querySelectorAll('input, textarea, select');
        const clonedInputs = clone.querySelectorAll('input, textarea, select');
        originalInputs.forEach((input, i) => {
            if (clonedInputs[i]) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) clonedInputs[i].setAttribute('checked', 'true');
                } else {
                    clonedInputs[i].setAttribute('value', input.value);
                    if(input.tagName === 'TEXTAREA') clonedInputs[i].innerHTML = input.value;
                }
            }
        });

        // 4. Remove o painel e limpa scripts para evitar conflitos na outra aba
        const panelInClone = clone.querySelector('#holo-panel-tv');
        if (panelInClone) panelInClone.remove();
        clone.querySelectorAll('script, iframe, noscript').forEach(el => el.remove());

        // 5. Adiciona Base Tag para não quebrar CSS de imagens externas
        const baseTag = document.createElement('base');
        baseTag.href = window.location.origin;
        clone.querySelector('head').prepend(baseTag);

        // 6. Injeta o CSS Holográfico para converter a ESTRUTURA reconstruída em fantasma
        const holoCss = document.createElement('style');
        holoCss.innerHTML = `
            html, body { background: rgba(0, 15, 30, 0.85) !important; color: #00ffff !important; }
            *, *::before, *::after {
                background-color: transparent !important;
                color: rgba(0, 255, 255, 0.7) !important;
                border-color: rgba(0, 255, 255, 0.2) !important;
                text-shadow: 0 0 3px rgba(0, 255, 255, 0.5) !important;
                box-shadow: none !important;
            }
            img, svg {
                opacity: 0.4 !important;
                filter: grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%) brightness(1.2) !important;
                mix-blend-mode: screen !important;
            }
            body::after {
                content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0, 255, 255, 0.08) 3px, rgba(0, 255, 255, 0.08) 4px);
                z-index: 999999999; pointer-events: none;
            }
        `;
        clone.querySelector('head').appendChild(holoCss);

        const htmlContent = encodeURIComponent(clone.outerHTML);

        // Retorna o script que vai injetar e reconstruir o DOM salvo
        return `
(function() {
    const existing = document.getElementById('holo-reconstruct');
    if (existing) existing.remove();
    const iframe = document.createElement('iframe');
    iframe.id = 'holo-reconstruct';
    iframe.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; border:none; z-index:2147483646; pointer-events:none; mix-blend-mode: screen;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(decodeURIComponent("${htmlContent}"));
    iframe.contentDocument.close();
})();
        `.trim();
    };

    const btnDeepClone = createBtn('Copiar Estrutura e Dados (Reconstrução)', () => {
        const code = generateDeepClone();
        navigator.clipboard.writeText(code).then(() => alert('Estrutura de dados e nós copiada! Cole na outra aba para reconstruir o holograma.'));
    });

    const btnClear = createBtn('Limpar', () => {
        panel.remove();
        style.remove();
        const ghost = document.getElementById('holo-reconstruct');
        if(ghost) ghost.remove();
    });

    content.appendChild(btnDeepClone);
    content.appendChild(btnClear);
    panel.appendChild(content);
    document.body.appendChild(panel);
})();
