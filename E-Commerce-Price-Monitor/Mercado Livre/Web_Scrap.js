(function(w, d) {
    // 1. Limpa instâncias anteriores
    if(d.getElementById('tmx-cluster-pnl')) d.getElementById('tmx-cluster-pnl').remove();
    if(d.getElementById('tmx-pro-max-styles')) d.getElementById('tmx-pro-max-styles').remove();

    // 2. Injeta estilos de forma segura (contornando o bloqueio CSP do Mercado Livre)
    const style = d.createElement('style');
    style.id = 'tmx-pro-max-styles';
    const secureTag = d.querySelector('[nonce]');
    if (secureTag && secureTag.nonce) style.setAttribute('nonce', secureTag.nonce);

    style.innerHTML = `
        #tmx-cluster-pnl * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
        #tmx-cluster-pnl ::-webkit-scrollbar { width: 6px; }
        #tmx-cluster-pnl ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 4px; }
        #tmx-cluster-pnl ::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.2); border-radius: 4px; transition: 0.3s; }
        #tmx-cluster-pnl ::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.5); }
        .tmx-btn-neon { background: linear-gradient(135deg, rgba(0,200,50,0.9) 0%, rgba(0,150,30,0.9) 100%); color: #000; border: 1px solid #00ff41; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-size: 11px;}
        .tmx-btn-neon:hover { background: linear-gradient(135deg, rgba(0,255,65,1) 0%, rgba(0,200,50,1) 100%); box-shadow: 0 0 15px rgba(0,255,65,0.4); transform: translateY(-1px); }
        .tmx-btn-dark { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-size: 11px;}
        .tmx-btn-dark:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); color: #fff; transform: translateY(-1px); }
        .tmx-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,255,65,0.3); color: #fff; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px; outline: none; transition: 0.3s;}
        .tmx-input:focus { border-color: #00ff41; box-shadow: 0 0 8px rgba(0,255,65,0.3); }
        .tmx-expensive { border: 4px solid #ef4444 !important; box-shadow: 0 0 20px #ef4444 !important; border-radius: 8px;}
        .tmx-cheap { border: 4px solid #00ffff !important; box-shadow: 0 0 20px #00ffff !important; border-radius: 8px;}
        .tmx-found { border: 4px solid #a855f7 !important; box-shadow: 0 0 20px #a855f7 !important; border-radius: 8px;}
    `;
    try { d.head.appendChild(style); } catch(e) {}

    // 3. Monta o Painel Flutuante
    const pnl = d.createElement('div');
    pnl.id = 'tmx-cluster-pnl';
    pnl.style.cssText = 'position:fixed;top:20px;right:20px;width:400px;background:rgba(10, 15, 10, 0.90);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#e2e8f0;border:1px solid rgba(0, 255, 65, 0.5);border-radius:8px;z-index:2147483647;box-shadow:0 15px 35px rgba(0,0,0,0.8);display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';
    
    pnl.innerHTML = `
        <div id="tmx-drag" style="cursor:grab;padding:15px 20px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.6);position:relative;">
            <span id="tmx-cls" style="position:absolute;top:15px;right:15px;cursor:pointer;color:rgba(255,255,255,0.4);font-size:14px;transition:0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">✖</span>
            <h2 style="margin:0;color:#00ff41;font-size:16px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Price Monitor</h2>
            <p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;font-weight:bold;">Target: Mercado Livre (Polycard Engine)</p>
        </div>
        
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
            <div style="display:flex;gap:10px;">
                <button id="tmx-btn-scrape" class="tmx-btn-neon" style="flex:1;padding:10px;background:#00ff41;color:#000;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">🔍 RUN SCRAPER</button>
                <button id="tmx-btn-export" class="tmx-btn-dark" style="flex:1;padding:10px;background:#333;color:#fff;border:1px solid #555;border-radius:4px;cursor:pointer;">💾 EXPORT CSV</button>
            </div>
            <div style="display:flex;gap:10px;">
                <button id="tmx-btn-blink" class="tmx-btn-dark" style="flex:1;padding:10px;background:#111;color:#00ffff;border:1px solid #00ffff;border-radius:4px;cursor:pointer;">⚡ BLINK MIN/MAX</button>
                <button id="tmx-btn-clear" class="tmx-btn-dark" style="flex:1;padding:10px;background:#111;color:#ef4444;border:1px solid #ef4444;border-radius:4px;cursor:pointer;">🧹 CLEAR FX</button>
            </div>
            <hr style="border:0; border-bottom:1px dashed rgba(255,255,255,0.1); margin: 5px 0;">
            <div>
                <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Search on Page (Ctrl+F)</div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="tmx-search-input" class="tmx-input" placeholder="Type keyword..." style="flex:2; padding:8px; background:#222; color:#fff; border:1px solid #444; border-radius:4px;">
                    <button id="tmx-btn-search" class="tmx-btn-neon" style="flex:1;padding:8px;background:#00ff41;color:#000;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">FIND</button>
                </div>
            </div>
            <textarea id="tmx-log" style="width:100%;height:80px;background:#0000aa;color:#ffffff;border:2px solid #ffffff;border-radius:4px;padding:8px;font-size:11px;font-family:'Lucida Console', Monaco, monospace;font-weight:bold;resize:none;outline:none;" readonly>> System Ready. Waiting for command...</textarea>
        </div>
    `;
    d.body.appendChild(pnl);

    // 4. Lógica de Drag & Drop
    let isDrag=0, ox, oy;
    const hndl = d.getElementById('tmx-drag');
    hndl.onmousedown = e => { isDrag=1; ox=e.clientX-pnl.offsetLeft; oy=e.clientY-pnl.offsetTop; hndl.style.cursor='grabbing'; };
    d.onmousemove = e => { if(isDrag){ pnl.style.left=(e.clientX-ox)+'px'; pnl.style.top=(e.clientY-oy)+'px'; pnl.style.right='auto'; } };
    d.onmouseup = () => { isDrag=0; hndl.style.cursor='grab'; };
    d.getElementById('tmx-cls').onclick = () => pnl.remove();

    let scrapedProducts = [];
    const logTerminal = d.getElementById('tmx-log');

    function logMsg(msg) {
        logTerminal.value = `> ${msg}\n` + logTerminal.value;
    }

    // 5. MOTOR DE EXTRAÇÃO RESILIENTE (Ignora classes antigas e foca na nova arquitetura)
    d.getElementById('tmx-btn-scrape').onclick = () => {
        scrapedProducts = [];
        const seenTitles = new Set();
        
        // Captura tanto a arquitetura nova (.poly-card) quanto a clássica (.ui-search-layout__item)
        const cards = d.querySelectorAll('.poly-card, .ui-search-layout__item, .andes-card');
        
        if(cards.length === 0) {
            logMsg("ERROR: No product cards detected. Scroll the page to load.");
            return;
        }

        cards.forEach(card => {
            // Procura o título (H2 ou H3) dentro do cartão
            const titleEl = card.querySelector('h2, h3, .poly-component__title, .ui-search-item__title');
            if (!titleEl) return;
            
            const title = titleEl.innerText.trim();
            if (!title || title.length < 3 || seenTitles.has(title)) return;

            // Busca os elementos de preço (O ML usa sempre a classe andes-money-amount__fraction para os números)
            const fractionEls = Array.from(card.querySelectorAll('.andes-money-amount__fraction'));
            if (fractionEls.length === 0) return;

            // Pega o primeiro preço que NÃO esteja riscado (Ignora o preço antigo em caso de desconto)
            let activeFractionEl = fractionEls.find(el => {
                const style = window.getComputedStyle(el);
                return style.textDecorationLine !== 'line-through' && !el.closest('s') && !el.closest('del');
            }) || fractionEls[0];

            let fraction = activeFractionEl.innerText.replace(/\D/g, ''); 
            if(!fraction) return;

            // Tenta capturar os cêntimos se existirem
            const centsEl = activeFractionEl.parentElement.querySelector('.andes-money-amount__cents');
            const cents = centsEl ? centsEl.innerText.replace(/\D/g, '') : '00';

            let parsedPrice = parseFloat(`${fraction}.${cents}`);
            let fullPrice = `R$ ${fraction},${cents}`;

            const linkEl = card.querySelector('a');
            const link = linkEl ? linkEl.href : '';

            seenTitles.add(title);
            scrapedProducts.push({
                element: card,
                title: title,
                rawPrice: fullPrice,
                parsedPrice: parsedPrice,
                link: link
            });
        });

        if(scrapedProducts.length > 0) {
            logMsg(`SUCCESS: Scraped ${scrapedProducts.length} products dynamically.`);
        } else {
            logMsg("ERROR: Could not parse product data inside cards.");
        }
    };

    // 6. Exportar CSV
    d.getElementById('tmx-btn-export').onclick = () => {
        if (scrapedProducts.length === 0) {
            logMsg("ERROR: Please run scraper first.");
            return;
        }

        let csvContent = "Title,Price,Parsed_Price_Float,Link\n";
        scrapedProducts.forEach(p => {
            let safeTitle = p.title.replace(/"/g, '""');
            csvContent += `"${safeTitle}","${p.rawPrice}",${p.parsedPrice},"${p.link}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = d.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "mercadolivre_scraped_data.csv");
        d.body.appendChild(link);
        link.click();
        d.body.removeChild(link);
        logMsg("SUCCESS: CSV Export downloaded.");
    };

    // 7. Limpar Efeitos
    function clearAllHighlights() {
        scrapedProducts.forEach(p => {
            p.element.style.border = '';
            p.element.style.boxShadow = '';
            p.element.classList.remove('tmx-expensive', 'tmx-cheap', 'tmx-found');
        });
    }

    d.getElementById('tmx-btn-clear').onclick = () => {
        clearAllHighlights();
        logMsg("CLEARED: All visual effects removed.");
    };

    // 8. Piscar Preço Mínimo e Máximo (Força aplicação via CSS Inline para ignorar bloqueio)
    d.getElementById('tmx-btn-blink').onclick = () => {
        if (scrapedProducts.length === 0) {
            logMsg("ERROR: Please run scraper first.");
            return;
        }

        clearAllHighlights();

        let maxItem = scrapedProducts[0];
        let minItem = null;

        scrapedProducts.forEach(p => {
            if (p.parsedPrice > maxItem.parsedPrice) {
                maxItem = p;
            }
            if (p.parsedPrice > 0) {
                if (!minItem || p.parsedPrice < minItem.parsedPrice) {
                    minItem = p;
                }
            }
        });

        if (maxItem) {
            maxItem.element.classList.add('tmx-expensive');
            maxItem.element.style.border = "4px solid #ef4444";
            maxItem.element.style.boxShadow = "0 0 20px #ef4444";
            logMsg(`MAX PRICE: ${maxItem.rawPrice}`);
        }
        
        if (minItem) {
            minItem.element.classList.add('tmx-cheap');
            minItem.element.style.border = "4px solid #00ffff";
            minItem.element.style.boxShadow = "0 0 20px #00ffff";
            logMsg(`MIN PRICE: ${minItem.rawPrice}`);
            minItem.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // 9. Procurar na Página
    d.getElementById('tmx-btn-search').onclick = () => {
        if (scrapedProducts.length === 0) {
            logMsg("ERROR: Please run scraper first.");
            return;
        }

        const keyword = d.getElementById('tmx-search-input').value.toLowerCase().trim();
        if (!keyword) return;

        clearAllHighlights();

        let matchCount = 0;
        let firstMatch = null;

        scrapedProducts.forEach(p => {
            if (p.title.toLowerCase().includes(keyword)) {
                p.element.classList.add('tmx-found');
                p.element.style.border = "4px solid #a855f7";
                p.element.style.boxShadow = "0 0 20px #a855f7";
                matchCount++;
                if (!firstMatch) firstMatch = p.element;
            }
        });

        if (matchCount > 0) {
            logMsg(`FOUND: ${matchCount} item(s) matching "${keyword}".`);
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            logMsg(`NOT FOUND: No items match "${keyword}".`);
        }
    };

})(window, document);
