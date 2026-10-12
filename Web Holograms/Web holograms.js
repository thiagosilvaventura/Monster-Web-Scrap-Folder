(function() {
    // Evita criar múltiplos painéis se o código rodar mais de uma vez
    if (document.getElementById('holo-panel-tv')) {
        document.getElementById('holo-panel-tv').remove();
    }

    // Injeção de CSS para a estética do Holograma
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

    // Criação do Painel Principal
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

    // Cabeçalho (Área de arrastar)
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

    // Lógica para arrastar a janela
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
        panel.style.right = 'auto'; // Remove o travamento na direita ao mover
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });

    // Container dos Botões
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

    // Função que gera o script JS para clonar o site em outra aba
    const generateInjectionScript = (includeBaseTag) => {
        let htmlContent = document.documentElement.outerHTML;
        
        if (includeBaseTag) {
            // Insere a tag <base> para que imagens e links funcionem mesmo em outro domínio
            const baseTag = `<base href="${window.location.origin}">`;
            if(htmlContent.includes('<head>')) {
                htmlContent = htmlContent.replace('<head>', '<head>' + baseTag);
            } else {
                htmlContent = baseTag + htmlContent;
            }
        }

        // Usamos encodeURIComponent para evitar quebras de aspas/strings no código injetado
        return `
// CÓDIGO CLONADO GERADO PELO HOLOGRAMA DE SITES
(function() {
    const encodedHTML = "${encodeURIComponent(htmlContent)}";
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;border:none;z-index:999999999;background:white;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(decodeURIComponent(encodedHTML));
    iframe.contentDocument.close();
})();
        `.trim();
    };

    // Botão 1: Copiar código HTML simples em JS
    const btnCopyHTML = createBtn('Copiar toda a tela (HTML)', () => {
        const code = generateInjectionScript(false);
        navigator.clipboard.writeText(code).then(() => {
            alert('Código copiado! Cole no Console (Inspect) de outra aba para sobrepor a tela.');
        });
    });

    // Botão 2: Exportar em .txt
    const btnExportTXT = createBtn('Exportar o código em um arquivo txt', () => {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'codigo-holograma-tv.txt';
        a.click();
    });

    // Botão 3: Copiar Código com Funcionalidades (Resolve caminhos de imagens e JS relativos)
    const btnCopyFunc = createBtn('Copiar códigos e funcionalidades', () => {
        const code = generateInjectionScript(true);
        navigator.clipboard.writeText(code).then(() => {
            alert('Código turbinado copiado! Suporta dependências, CSS e imagens cross-domain. Cole no Console de outra aba.');
        });
    });

    // Botão 4: Limpar (Fecha o painel)
    const btnClear = createBtn('Limpar', () => {
        panel.remove();
        style.remove(); // Remove o CSS injetado
    });

    content.appendChild(btnCopyHTML);
    content.appendChild(btnExportTXT);
    content.appendChild(btnCopyFunc);
    content.appendChild(btnClear);
    panel.appendChild(content);

    // Injeta o painel na tela
    document.body.appendChild(panel);
})();
