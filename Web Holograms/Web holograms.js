(function() {
    if (document.getElementById('holo-panel-tv')) {
        document.getElementById('holo-panel-tv').remove();
    }

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes holoFlicker {
            0% { opacity: 0.9; box-shadow: 0 0 10px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2); }
            50% { opacity: 1; box-shadow: 0 0 20px rgba(0, 255, 255, 0.7), inset 0 0 15px rgba(0, 255, 255, 0.4); }
            100% { opacity: 0.9; box-shadow: 0 0 10px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2); }
        }
        .holo-btn {
            background: rgba(0, 255, 255, 0.1); 
            color: #00ffff;
            border: 1px solid #00ffff; 
            padding: 8px 12px; 
            cursor: pointer;
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); 
            transition: 0.2s;
            text-transform: uppercase; 
            font-size: 11px;
            font-family: "Courier New", Courier, monospace;
            text-shadow: 0 0 3px #00ffff;
            border-radius: 4px;
        }
        .holo-btn:hover {
            background: rgba(0, 255, 255, 0.4);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'holo-panel-tv';
    panel.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        width: 340px;
        background: linear-gradient(rgba(0, 20, 40, 0.8) 50%, rgba(0, 40, 80, 0.8) 50%);
        background-size: 100% 4px;
        border: 2px solid #00ffff;
        border-radius: 8px; 
        z-index: 2147483647;
        font-family: "Courier New", Courier, monospace;
        color: #00ffff; 
        backdrop-filter: blur(5px);
        resize: both; 
        overflow: auto;
        animation: holoFlicker 3s infinite;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        padding: 10px 15px; 
        border-bottom: 1px solid #00ffff;
        cursor: grab; 
        display: flex; 
        justify-content: space-between;
        align-items: center; 
        background: rgba(0, 255, 255, 0.15);
    `;

    const titleWrap = document.createElement('div');
    titleWrap.innerHTML = `
        <strong style="font-size: 16px; text-shadow: 0 0 5px #00ffff; letter-spacing: 1px;">Holograma de Sites</strong><br>
        <span style="font-size: 9px; opacity: 0.8; letter-spacing: 2px;">created by tv</span>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.style.cssText = `
        background: transparent; color: #00ffff; border: none;
        cursor: pointer; font-size: 16px; font-weight: bold; text-shadow: 0 0 5px #00ffff;
    `;
    closeBtn.onclick = () => panel.remove();

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    let isDragging = false, startX, startY, initialX, initialY;
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        initialX = panel.offsetLeft; initialY = panel.offsetTop;
        header.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panel.style.left = initialX + (e.clientX - startX) + 'px';
        panel.style.top = initialY + (e.clientY - startY) + 'px';
        panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });

    const content = document.createElement('div');
    content.style.padding = '15px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '12px';

    const createBtn = (text, onClick) => {
        const b = document.createElement('button');
        b.innerText = text;
        b.className = 'holo-btn';
        b.onclick = onClick;
        return b;
    };

    const generateInjectionScript = (includeBaseTag) => {
        const clone = document.documentElement.cloneNode(true);
        
        // Remove scripts e o próprio painel holográfico da cópia
        clone.querySelectorAll('script, iframe, noscript').forEach(el => el.remove());
        const panelInClone = clone.querySelector('#holo-panel-tv');
        if (panelInClone) panelInClone.remove();

        // Injeta CSS para criar a aparência fantasma
        const ghostCSS = document.createElement('style');
        ghostCSS.innerHTML = `
            * {
                color: rgba(0, 255, 255, 0.7) !important;
                background-color: transparent !important;
                border-color: rgba(0, 255, 255, 0.3) !important;
                text-shadow: 0 0 5px rgba(0, 255, 255, 0.8) !important;
                box-shadow: 0 0 5px rgba(0, 255, 255, 0.2) !important;
            }
            img, svg, canvas, video {
                opacity: 0.3 !important;
                filter: sepia(100%) hue-rotate(180deg) saturate(300%) brightness(120%) !important;
                mix-blend-mode: screen !important;
            }
            body {
                background: rgba(0, 20, 30, 0.65) !important;
                margin: 0;
            }
            body::after {
                content: "";
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0, 255, 255, 0.1) 3px, rgba(0, 255, 255, 0.1) 4px);
                z-index: 9999999;
                pointer-events: none;
            }
        `;
        
        if (clone.querySelector('head')) {
            clone.querySelector('head').appendChild(ghostCSS);
        } else {
            clone.insertBefore(ghostCSS, clone.firstChild);
        }

        let htmlContent = clone.outerHTML;
        
        if (includeBaseTag) {
            const baseTag = `<base href="${window.location.origin}">`;
            if(htmlContent.includes('<head>')) {
                htmlContent = htmlContent.replace('<head>', '<head>' + baseTag);
            } else {
                htmlContent = baseTag + htmlContent;
            }
        }

        return `
// CÓDIGO FANTASMA 
(function() {
    const existingGhost = document.getElementById('holo-ghost-iframe');
    if (existingGhost) existingGhost.remove();

    const encodedHTML = "${encodeURIComponent(htmlContent)}";
    const iframe = document.createElement('iframe');
    iframe.id = 'holo-ghost-iframe';
    
    // Configura o iframe para ser transparente, levemente opaco e ignorar cliques do mouse
    iframe.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; border:none; z-index:999999998; background:transparent; pointer-events:none; opacity:0.85; mix-blend-mode:screen;';
    
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(decodeURIComponent(encodedHTML));
    iframe.contentDocument.close();
})();
        `.trim();
    };

    const btnCopyHTML = createBtn('Copiar toda a tela (HTML)', () => {
        const code = generateInjectionScript(false);
        navigator.clipboard.writeText(code).then(() => {
            alert('Fantasma copiado! Cole no Console da mesma aba para sobrepor.');
        });
    });

    const btnExportTXT = createBtn('Exportar o código em um arquivo txt', () => {
        const clone = document.documentElement.cloneNode(true);
        clone.querySelectorAll('script, iframe, noscript').forEach(el => el.remove());
        const panelInClone = clone.querySelector('#holo-panel-tv');
        if (panelInClone) panelInClone.remove();
        
        const blob = new Blob([clone.outerHTML], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'codigo-holograma-tv.txt';
        a.click();
    });

    const btnCopyFunc = createBtn('Copiar códigos visuais (Fantasma)', () => {
        const code = generateInjectionScript(true);
        navigator.clipboard.writeText(code).then(() => {
            alert('Fantasma estético com CSS base copiado!');
        });
    });

    const btnClear = createBtn('Limpar', () => {
        panel.remove();
        style.remove();
        const ghost = document.getElementById('holo-ghost-iframe');
        if(ghost) ghost.remove();
    });

    content.appendChild(btnCopyHTML);
    content.appendChild(btnExportTXT);
    content.appendChild(btnCopyFunc);
    content.appendChild(btnClear);
    panel.appendChild(content);

    document.body.appendChild(panel);
})();
