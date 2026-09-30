(function(w, d) {
    // 1. Remove previous instances if they exist
    if(d.getElementById('tmx-cluster-pnl')) d.getElementById('tmx-cluster-pnl').remove();
    if(d.getElementById('tmx-pro-max-styles')) d.getElementById('tmx-pro-max-styles').remove();

    // 2. Inject Cyberpunk Styles & Highlight Animations
    const style = d.createElement('style');
    style.id = 'tmx-pro-max-styles';
    style.innerHTML = `
        #tmx-cluster-pnl * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
        
        #tmx-cluster-pnl ::-webkit-scrollbar { width: 6px; }
        #tmx-cluster-pnl ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 4px; }
        #tmx-cluster-pnl ::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.2); border-radius: 4px; transition: 0.3s; }
        #tmx-cluster-pnl ::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.5); }

        .tmx-btn-neon { background: linear-gradient(135deg, rgba(0,200,50,0.9) 0%, rgba(0,150,30,0.9) 100%); color: #000; border: 1px solid #00ff41; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 10px rgba(0,255,65,0.2); text-transform: uppercase; font-size: 11px;}
        .tmx-btn-neon:hover { background: linear-gradient(135deg, rgba(0,255,65,1) 0%, rgba(0,200,50,1) 100%); box-shadow: 0 0 15px rgba(0,255,65,0.4); transform: translateY(-1px); }
        
        .tmx-btn-dark { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-size: 11px;}
        .tmx-btn-dark:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); color: #fff; transform: translateY(-1px); }

        .tmx-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,255,65,0.3); color: #fff; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px; outline: none; transition: 0.3s;}
        .tmx-input:focus { border-color: #00ff41; box-shadow: 0 0 8px rgba(0,255,65,0.3); }

        /* Highlight Animations for Products */
        @keyframes tmx-blink-expensive {
            0% { box-shadow: 0 0 10px #ef4444; border-color: #ef4444; transform: scale(1); }
            50% { box-shadow: 0 0 30px #ef4444, inset 0 0 15px #ef4444; border-color: #ef4444; transform: scale(1.02); z-index: 999;}
            100% { box-shadow: 0 0 10px #ef4444; border-color: #ef4444; transform: scale(1); }
        }
        @keyframes tmx-blink-cheap {
            0% { box-shadow: 0 0 10px #00ffff; border-color: #00ffff; transform: scale(1); }
            50% { box-shadow: 0 0 30px #00ffff, inset 0 0 15px #00ffff; border-color: #00ffff; transform: scale(1.02); z-index: 999;}
            100% { box-shadow: 0 0 10px #00ffff; border-color: #00ffff; transform: scale(1); }
        }
        @keyframes tmx-highlight-search {
            0% { box-shadow: 0 0 10px #a855f7; border-color: #a855f7; }
            50% { box-shadow: 0 0 30px #a855f7, inset 0 0 15px #a855f7; border-color: #a855f7; }
            100% { box-shadow: 0 0 10px #a855f7; border-color: #a855f7; }
        }

        .tmx-expensive { animation: tmx-blink-expensive 1.5s infinite !important; border: 2px solid #ef4444 !important; border-radius: 8px;}
        .tmx-cheap { animation: tmx-blink-cheap 1.5s infinite !important; border: 2px solid #00ffff !important; border-radius: 8px;}
        .tmx-found { animation: tmx-highlight-search 1.5s infinite !important; border: 2px solid #a855f7 !important; border-radius: 8px;}
    `;
    d.head.appendChild(style);

    // 3. Build Panel HTML
    const pnl = d.createElement('div');
    pnl.id = 'tmx-cluster-pnl';
    pnl.style.cssText = 'position:fixed;top:20px;right:20px;width:400px;background:rgba(10, 15, 10, 0.75);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#e2e8f0;border:1px solid rgba(0, 255, 65, 0.3);border-radius:8px;z-index:999999;box-shadow:0 15px 35px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,255,65,0.02);display:flex;flex-direction:column;overflow:hidden;';
    
    pnl.innerHTML = `
        <div id="tmx-drag" style="cursor:grab;padding:15px 20px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.4);position:relative;">
            <span id="tmx-cls" style="position:absolute;top:15px;right:15px;cursor:pointer;color:rgba(255,255,255,0.4);font-size:14px;transition:0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">✖</span>
            <h2 style="margin:0;color:#00ff41;font-size:16px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;text-shadow:0 0 5px rgba(0,255,65,0.3);">E-Commerce Price Monitor</h2>
            <p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;font-weight:bold;">Target: AliExpress</p>
        </div>
        
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
            <!-- Actions -->
            <div style="display:flex;gap:10px;">
                <button id="tmx-btn-scrape" class="tmx-btn-neon" style="flex:1;padding:10px;">🔍 Run Scraper</button>
                <button id="tmx-btn-export" class="tmx-btn-dark" style="flex:1;padding:10px;">💾 Export CSV</button>
            </div>

            <!-- Highlights -->
            <div style="display:flex;gap:10px;">
                <button id="tmx-btn-blink" class="tmx-btn-dark" style="flex:1;padding:10px;border-color:rgba(0,255,255,0.3);color:#00ffff;">⚡ Blink Min/Max</button>
                <button id="tmx-btn-clear" class="tmx-btn-dark" style="flex:1;padding:10px;border-color:rgba(239,68,68,0.3);color:#ef4444;">🧹 Clear FX</button>
            </div>

            <hr style="border:0; border-bottom:1px dashed rgba(255,255,255,0.1); margin: 5px 0;">

            <!-- In-Page Search -->
            <div>
                <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Search on Page (Ctrl+F equivalent)</div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="tmx-search-input" class="tmx-input" placeholder="Type keyword..." style="flex:2; padding:8px;">
                    <button id="tmx-btn-search" class="tmx-btn-neon" style="flex:1;padding:8px;">Find</button>
                </div>
            </div>

            <!-- Terminal Log -->
            <textarea id="tmx-log" style="width:100%;height:80px;background:#0000aa;color:#ffffff;border:2px solid #ffffff;border-radius:4px;padding:8px;font-size:11px;font-family:'Lucida Console', Monaco, monospace;font-weight:bold;resize:none;outline:none;" readonly>> System Ready. Waiting for command...</textarea>
        </div>
    `;
    d.body.appendChild(pnl);

    // 4. Drag & Drop Logic for Panel
    let isDrag=0, ox, oy;
    const hndl = d.getElementById('tmx-drag');
    hndl.onmousedown = e => { isDrag=1; ox=e.clientX-pnl.offsetLeft; oy=e.clientY-pnl.offsetTop; hndl.style.cursor='grabbing'; };
    d.onmousemove = e => { if(isDrag){ pnl.style.left=(e.clientX-ox)+'px'; pnl.style.top=(e.clientY-oy)+'px'; pnl.style.right='auto'; } };
    d.onmouseup = () => { isDrag=0; hndl.style.cursor='grab'; };
    d.getElementById('tmx-cls').onclick = () => pnl.remove();

    // 5. Scraper Core State
    let scrapedProducts = [];
    const logTerminal = d.getElementById('tmx-log');

    function logMsg(msg) {
        logTerminal.value = `> ${msg}\n` + logTerminal.value;
    }

    // 6. Function: Run Scraper
    d.getElementById('tmx-btn-scrape').onclick = () => {
        scrapedProducts = [];
        const cards = d.querySelectorAll('.search-card-item'); // AliExpress card class
        
        if(cards.length === 0) {
            logMsg("ERROR: No products found on this page.");
            return;
        }

        cards.forEach(card => {
            const titleEl = card.querySelector('h3') || card.querySelector('.us--titleText--WpU1HVZ');
            const title = titleEl ? titleEl.innerText.trim() : 'No title';
            
            const priceEl = card.querySelector('[class*="price-sale"]');
            const priceStr = priceEl ? priceEl.innerText.replace(/\n/g, '').trim() : '0';
            
            const salesEl = card.querySelector('[class*="trade"]');
            const sales = salesEl ? salesEl.innerText.trim() : '0 sales';
            
            const link = card.href || '';

            if (title !== 'No title') {
                // Clean price to float for math comparisons
                let parsedPrice = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
                if (isNaN(parsedPrice)) parsedPrice = 0;

                scrapedProducts.push({
                    element: card,
                    title: title,
                    rawPrice: priceStr,
                    parsedPrice: parsedPrice,
                    sales: sales,
                    link: link
                });
            }
        });

        logMsg(`SUCCESS: Scraped ${scrapedProducts.length} products from DOM.`);
    };

    // 7. Function: Export CSV
    d.getElementById('tmx-btn-export').onclick = () => {
        if (scrapedProducts.length === 0) {
            logMsg("ERROR: Please run scraper first.");
            return;
        }

        let csvContent = "Title,Price,Parsed_Price_Float,Sales,Link\n";
        
        scrapedProducts.forEach(p => {
            // Escape quotes inside strings for standard CSV format
            let safeTitle = p.title.replace(/"/g, '""');
            csvContent += `"${safeTitle}","${p.rawPrice}",${p.parsedPrice},"${p.sales}","${p.link}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = d.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "aliexpress_scraped_data.csv");
        d.body.appendChild(link);
        link.click();
        d.body.removeChild(link);

        logMsg("SUCCESS: CSV Export downloaded.");
    };

    // 8. Function: Clear All FX
    function clearAllHighlights() {
        scrapedProducts.forEach(p => {
            p.element.classList.remove('tmx-expensive', 'tmx-cheap', 'tmx-found');
        });
    }

    d.getElementById('tmx-btn-clear').onclick = () => {
        clearAllHighlights();
        logMsg("CLEARED: All visual effects removed.");
    };

    // 9. Function: Blink Min/Max Prices
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
            // Find the lowest price that is greater than 0
            if (p.parsedPrice > 0) {
                if (!minItem || p.parsedPrice < minItem.parsedPrice) {
                    minItem = p;
                }
            }
        });

        if (maxItem) {
            maxItem.element.classList.add('tmx-expensive');
            logMsg(`MAX PRICE: ${maxItem.rawPrice}`);
        }
        
        if (minItem) {
            minItem.element.classList.add('tmx-cheap');
            logMsg(`MIN PRICE: ${minItem.rawPrice}`);
            // Smooth scroll to the cheapest item
            minItem.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // 10. Function: Search on Page (Ctrl+F)
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
