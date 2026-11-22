(function() {
    const oldPanel = document.getElementById('saas-full-monitor');
    if (oldPanel) oldPanel.remove();

    const resourcesLog = [];
    const MAX_LIVE_ITEMS = 10;
    
    const cookieBytes = new Blob([document.cookie]).size;
    const cookieKb = (cookieBytes / 1024).toFixed(2);
    let cookieStatus = { text: "Excelente", color: "#a6e3a1" };
    if (cookieBytes > 4096) cookieStatus = { text: "Crítico", color: "#f38ba8" };
    else if (cookieBytes > 1024) cookieStatus = { text: "Atenção", color: "#fab387" };

    const panel = document.createElement('div');
    panel.id = 'saas-full-monitor';
    Object.assign(panel.style, {
        position: 'fixed',
        top: '15px',
        right: '15px',
        width: '460px',
        backgroundColor: '#1e1e2e',
        color: '#cdd6f4',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '12px',
        padding: '15px',
        borderRadius: '8px',
        zIndex: '2147483647',
        boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
        border: '1px solid #45475a',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
    });

    const dictionaryHTML = `
        <div id="resource-dict" style="display: none; background: #181825; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 11px; border: 1px solid #45475a; line-height: 1.4;">
            <div style="margin-bottom: 6px;"><strong style="color:#a6e3a1;">API/Fetch:</strong> Mostra se a requisição é interna (Servidor -> Site) ou de uma API de terceiros. Gargalos aqui indicam banco de dados ou backend lentos.</div>
            <div style="margin-bottom: 6px;"><strong style="color:#89b4fa;">CSS / </strong><strong style="color:#f9e2af;">Script / </strong><strong style="color:#fab387;">Imagem:</strong> Agora exibe o nome exato do arquivo sendo processado. Lentidão neles atrasa o carregamento visual da página.</div>
            <div style="margin-bottom: 6px;"><strong style="color:#f38ba8;">Ping/Tracker:</strong> Captura ferramentas de monitoramento (Google, FullStory, etc). Geralmente atrasam o SaaS sem necessidade.</div>
            <div style="margin-bottom: 0px;"><strong style="color:#cba6f7;">Extensão:</strong> Adblockers e plugins do seu navegador injetando código no SaaS.</div>
        </div>
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #45475a; padding-bottom: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <strong style="color: #89b4fa; font-size: 14px;">Monitor de SaaS</strong>
                <button id="toggle-dict" style="background: #313244; color: #bac2de; border: 1px solid #45475a; border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 10px; font-weight: bold;">Dicionário 📖</button>
            </div>
            <button id="close-monitor" style="background: #f38ba8; color: #11111b; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-weight: bold;">X</button>
        </div>
        
        ${dictionaryHTML}

        <div style="background: #313244; padding: 8px; border-radius: 4px; margin-bottom: 10px; display: flex; justify-content: space-between;">
            <span><strong>Header (Cookies):</strong> ${cookieKb} KB</span>
            <span style="color: ${cookieStatus.color};">${cookieStatus.text}</span>
        </div>

        <strong style="color: #f38ba8; margin-bottom: 5px;">🔥 Ranking de Gargalos (Top 5 mais lentos)</strong>
        <div id="ranking-list" style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; min-height: 50px;">
            <span style="color: #6c7086; font-size: 11px;">Aguardando tráfego...</span>
        </div>

        <strong style="color: #a6e3a1; margin-bottom: 5px;">⚡ Live Feed (Últimas Atividades)</strong>
        <div id="live-feed" style="display: flex; flex-direction: column; gap: 5px; overflow-y: auto; padding-right: 5px; flex-grow: 1;"></div>
    `;

    document.body.appendChild(panel);

    document.getElementById('close-monitor').addEventListener('click', () => {
        panel.remove();
        observer.disconnect();
    });

    document.getElementById('toggle-dict').addEventListener('click', (e) => {
        const dict = document.getElementById('resource-dict');
        const isHidden = dict.style.display === 'none';
        dict.style.display = isHidden ? 'block' : 'none';
        e.target.style.backgroundColor = isHidden ? '#45475a' : '#313244';
        e.target.style.color = isHidden ? '#cdd6f4' : '#bac2de';
    });

    const rankingList = document.getElementById('ranking-list');
    const liveFeed = document.getElementById('live-feed');

    // Função inteligente para extrair detalhes dinâmicos da URL
    function getCategory(entry) {
        const urlStr = entry.name;
        const lowerName = urlStr.toLowerCase();
        let domain = "";
        let filename = "";
        let isThirdParty = false;

        try {
            const urlObj = new URL(urlStr, window.location.origin);
            domain = urlObj.hostname.replace('www.', '');
            isThirdParty = domain !== window.location.hostname.replace('www.', '');
            const pathParts = urlObj.pathname.split('/');
            filename = pathParts[pathParts.length - 1] || "raiz";
        } catch(e) {
            domain = "desconhecido";
            filename = "arquivo";
        }

        // Força a identificação de trackings conhecidos mesmo se vierem como 'fetch'
        if (lowerName.includes('analytics') || lowerName.includes('fullstory') || lowerName.includes('hotjar') || entry.initiatorType === 'ping' || entry.initiatorType === 'beacon') {
            return { type: 'Ping/Tracker', desc: `Monitoramento (${domain})`, color: '#f38ba8' };
        }

        if (lowerName.startsWith('chrome-extension://')) {
            return { type: 'Extensão', desc: 'Plugin do Navegador', color: '#cba6f7' };
        }

        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            const originDesc = isThirdParty ? `API Externa (${domain})` : 'Servidor -> Site';
            return { type: 'API/Fetch', desc: originDesc, color: '#a6e3a1' };
        }

        if (entry.initiatorType === 'css' || entry.initiatorType === 'link' || lowerName.endsWith('.css')) {
            return { type: 'CSS', desc: `Estilo: ${filename.split('?')[0]}`, color: '#89b4fa' };
        }

        if (entry.initiatorType === 'script' || lowerName.endsWith('.js')) {
            return { type: 'Script', desc: `Arquivo: ${filename.split('?')[0]}`, color: '#f9e2af' };
        }

        if (entry.initiatorType === 'img' || lowerName.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) {
            return { type: 'Imagem', desc: `Mídia: ${filename.split('?')[0]}`, color: '#fab387' };
        }

        return { type: entry.initiatorType || 'Outro', desc: `Destino: ${domain}`, color: '#bac2de' };
    }

    function getSeverity(ms) {
        if (ms < 150) return { text: "Rápido", color: "#a6e3a1" };
        if (ms < 500) return { text: "Moderado", color: "#f9e2af" };
        if (ms < 1500) return { text: "Lento", color: "#fab387" };
        return { text: "Gargalo Crítico", color: "#f38ba8" };
    }

    function updateRanking() {
        const topBottlenecks = [...resourcesLog].sort((a, b) => b.duration - a.duration).slice(0, 5);
        rankingList.innerHTML = '';
        topBottlenecks.forEach((res, index) => {
            const cat = getCategory(res);
            const sev = getSeverity(res.duration);
            const shortUrl = res.name.length > 35 ? res.name.substring(0, 15) + '...' + res.name.substring(res.name.length - 15) : res.name;
            
            rankingList.innerHTML += `
                <div style="background: #181825; padding: 6px; border-left: 3px solid ${sev.color}; border-radius: 3px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;">
                            <strong style="color: ${cat.color};">#${index + 1} ${cat.type}</strong>
                            <span style="color: #a6adc8; font-size: 10px; margin-left: 4px;" title="${cat.desc}">(${cat.desc})</span>
                        </span>
                        <span style="color: ${sev.color}; font-weight: bold; margin-left: 5px;">${Math.round(res.duration)}ms</span>
                    </div>
                    <div style="color: #9399b2; word-break: break-all;" title="${res.name}">${shortUrl}</div>
                </div>
            `;
        });
    }

    function addLiveRecord(entry) {
        const cat = getCategory(entry);
        const sev = getSeverity(entry.duration);
        const shortUrl = entry.name.length > 40 ? entry.name.substring(0, 20) + '...' + entry.name.substring(entry.name.length - 15) : entry.name;

        const item = document.createElement('div');
        Object.assign(item.style, {
            backgroundColor: '#313244',
            padding: '6px',
            borderRadius: '3px',
            borderLeft: `3px solid ${cat.color}`,
            fontSize: '11px'
        });

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">
                    <strong style="color: ${cat.color};">${cat.type}</strong>
                    <span style="color: #a6adc8; font-size: 10px; margin-left: 4px;" title="${cat.desc}">(${cat.desc})</span>
                </span>
                <span style="color: ${sev.color}; font-weight: bold; margin-left: 5px;">${Math.round(entry.duration)}ms</span>
            </div>
            <div style="color: #a6adc8; word-break: break-all;" title="${entry.name}">${shortUrl}</div>
        `;

        liveFeed.prepend(item);
        if (liveFeed.children.length > MAX_LIVE_ITEMS) liveFeed.lastChild.remove();
    }

    const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
            if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
                resourcesLog.push(entry);
                addLiveRecord(entry);
            }
        }
        updateRanking();
    });

    observer.observe({ type: 'resource', buffered: true });
})();
