
(() => {
    'use strict';

    const PANEL_ID = 'saas-full-monitor';
    const MAX_LIVE_ITEMS = 15;
    const MAX_HISTORY = 500;
    const TOP_LIMIT = 5;

    document.getElementById(PANEL_ID)?.remove();

    const state = {
        resources: [],
        observer: null,
        dragging: false,
        offsetX: 0,
        offsetY: 0
    };

    const COLORS = {
        green: '#a6e3a1',
        yellow: '#f9e2af',
        orange: '#fab387',
        red: '#f38ba8',
        blue: '#89b4fa',
        purple: '#cba6f7',
        text: '#cdd6f4',
        muted: '#a6adc8',
        panel: '#1e1e2e',
        surface: '#313244',
        deep: '#181825',
        border: '#45475a'
    };

    const style = document.createElement('style');

    style.textContent = `
      #${PANEL_ID} {
        box-sizing: border-box;
        resize: both;
        overflow: auto;
        min-width: 340px;
        min-height: 360px;
        width: 540px;
        height: 720px;
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        padding: 14px;
        border: 1px solid ${COLORS.border};
        border-radius: 9px;
        background: ${COLORS.panel};
        color: ${COLORS.text};
        font: 12px Consolas, 'Courier New', monospace;
        box-shadow: 0 15px 35px #0009;
      }

      #${PANEL_ID} * {
        box-sizing: border-box;
      }

      #${PANEL_ID} button {
        cursor: pointer;
        font: inherit;
      }

      #${PANEL_ID} .sm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid ${COLORS.border};
        padding-bottom: 9px;
        margin-bottom: 10px;
        cursor: move;
        user-select: none;
      }

      #${PANEL_ID} .sm-btn {
        background: ${COLORS.surface};
        color: ${COLORS.text};
        border: 1px solid ${COLORS.border};
        border-radius: 4px;
        padding: 4px 8px;
      }

      #${PANEL_ID} .sm-section {
        margin: 10px 0 5px;
        font-weight: bold;
      }

      #${PANEL_ID} .sm-card {
        background: ${COLORS.deep};
        border: 1px solid ${COLORS.border};
        border-radius: 5px;
        padding: 8px;
      }

      #${PANEL_ID} .sm-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }

      #${PANEL_ID} .sm-muted {
        color: ${COLORS.muted};
      }

      #${PANEL_ID} .sm-small {
        font-size: 10px;
      }

      #${PANEL_ID} .sm-scroll {
        overflow: auto;
        min-height: 40px;
      }

      #${PANEL_ID} .sm-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }

      #${PANEL_ID} .sm-record {
        background: ${COLORS.surface};
        border-left: 3px solid ${COLORS.blue};
        padding: 7px;
        border-radius: 3px;
        margin-bottom: 5px;
        overflow-wrap: anywhere;
      }

      #${PANEL_ID} .sm-record strong {
        color: ${COLORS.blue};
      }

      #${PANEL_ID} .sm-pill {
        border-radius: 10px;
        padding: 2px 6px;
        white-space: nowrap;
      }

      #${PANEL_ID} .sm-dict {
        display: none;
        background: ${COLORS.deep};
        border: 1px solid ${COLORS.border};
        border-radius: 5px;
        padding: 9px;
        line-height: 1.45;
        margin-bottom: 8px;
      }

      #${PANEL_ID} .sm-dict p {
        margin: 5px 0;
      }

      #${PANEL_ID} .sm-footer {
        color: ${COLORS.muted};
        font-size: 10px;
        margin-top: 8px;
      }
    `;

    document.head.appendChild(style);

    const panel = document.createElement('section');
    panel.id = PANEL_ID;

    panel.innerHTML = `
      <div class="sm-header" id="sm-drag-handle">

        <div>
          <strong style="color:${COLORS.blue};font-size:14px">
            Monitor de SaaS
          </strong>

          <span class="sm-muted sm-small">
            · diagnóstico de performance
          </span>
        </div>

        <div style="display:flex;gap:5px">

          <button class="sm-btn" id="sm-dict-btn">
            Dicionário
          </button>

          <button class="sm-btn" id="sm-reset-btn">
            Limpar
          </button>

          <button class="sm-btn" id="sm-close-btn"
            style="background:${COLORS.red};color:#11111b">
            X
          </button>

        </div>
      </div>

      <div class="sm-dict" id="sm-dictionary">

        <p>
          <b style="color:${COLORS.green}">API / Fetch / XHR:</b>
          chamadas assíncronas feitas pela aplicação.
          Podem representar consultas, gravações, autenticação
          ou integração com serviços. A duração inclui etapas
          de rede e resposta; não equivale isoladamente ao
          tempo de execução do backend.
        </p>

        <p>
          <b style="color:${COLORS.blue}">DNS:</b>
          resolução do nome do domínio para um endereço IP.
          Valores altos podem indicar lentidão no resolvedor,
          cache frio ou problemas de rede.
        </p>

        <p>
          <b style="color:${COLORS.yellow}">Connection / TLS:</b>
          abertura da conexão e negociação HTTPS.
          Custos recorrentes podem sugerir ausência de
          reutilização de conexão, distância de rede
          ou negociação lenta.
        </p>

        <p>
          <b style="color:${COLORS.orange}">TTFB:</b>
          intervalo entre o início da requisição e o primeiro
          byte recebido. Pode refletir latência de rede,
          filas, processamento do servidor ou dependências
          do backend; não isola nenhuma dessas causas.
        </p>

        <p>
          <b style="color:${COLORS.orange}">Download:</b>
          intervalo de recebimento do corpo da resposta.
          Pode aumentar com payloads grandes, banda limitada
          ou servidor transmitindo lentamente.
        </p>

        <p>
          <b style="color:${COLORS.purple}">Tracker / Beacon:</b>
          telemetria, analytics, publicidade ou monitoramento.
          A classificação é heurística e não significa,
          por si só, que o recurso seja dispensável.
        </p>

        <p>
          <b style="color:${COLORS.text}">Transfer Size:</b>
          bytes transferidos pela rede quando o navegador
          disponibiliza essa informação. Zero pode significar
          cache, restrição de timing ou dado indisponível.
        </p>

        <p>
          <b style="color:${COLORS.text}">Severidade:</b>
          faixas operacionais de duração para priorização.
          Não são limites universais nem prova de falha funcional.
        </p>

        <p>
          <b style="color:${COLORS.text}">Limitações:</b>
          o navegador pode ocultar detalhes por política
          de mesma origem (Timing-Allow-Origin), cache,
          service worker ou restrições do próprio navegador.
        </p>

      </div>

      <div class="sm-card sm-grid" id="sm-summary">

        <div>
          <span class="sm-muted">Recursos observados</span>
          <div id="sm-count">0</div>
        </div>

        <div>
          <span class="sm-muted">Duração média</span>
          <div id="sm-average">—</div>
        </div>

        <div>
          <span class="sm-muted">Transferência conhecida</span>
          <div id="sm-transfer">—</div>
        </div>

        <div>
          <span class="sm-muted">Recursos críticos</span>
          <div id="sm-critical">0</div>
        </div>

        <div>
          <span class="sm-muted">Percentil 95 (P95)</span>
          <div id="sm-p95">—</div>
        </div>

      </div>

      <div class="sm-card" style="margin-top:7px">

        <div class="sm-row">
          <span><b>Cookies acessíveis via JavaScript</b></span>
          <span id="sm-cookie-status">—</span>
        </div>

        <div class="sm-muted sm-small"
          id="sm-cookie-note" style="margin-top:4px">
        </div>

      </div>

      <div class="sm-section" style="color:${COLORS.red}">
        Ranking de gargalos · Top 5
      </div>

      <div class="sm-scroll" id="sm-ranking">
        <span class="sm-muted">Aguardando tráfego...</span>
      </div>

      <div class="sm-section" style="color:${COLORS.green}">
        Diagnóstico por categoria
      </div>

      <div class="sm-scroll" id="sm-categories"></div>

      <div class="sm-section" style="color:${COLORS.yellow}">
        Distribuição por domínio
      </div>

      <div class="sm-scroll" id="sm-domains"></div>

      <div class="sm-section" style="color:${COLORS.blue}">
        Live Feed · últimas atividades
      </div>

      <div class="sm-scroll" id="sm-feed" style="flex:1"></div>

      <div class="sm-footer">
        Arraste pelo cabeçalho para mover · use a alça inferior
        direita para redimensionar.
      </div>
    `;

    document.body.appendChild(panel);

    const $ = id => panel.querySelector(`#${id}`);

    const cookieBytes = new Blob([document.cookie]).size;

    const cookieState =
        cookieBytes > 4096
            ? ['Elevado', COLORS.red]
            : cookieBytes > 1024
                ? ['Atenção', COLORS.orange]
                : ['Dentro da faixa observada', COLORS.green];

    $('sm-cookie-status').textContent =
        `${(cookieBytes / 1024).toFixed(2)} KB · ${cookieState[0]}`;

    $('sm-cookie-status').style.color = cookieState[1];

    $('sm-cookie-note').textContent =
        'Estimativa apenas dos cookies legíveis por JavaScript. ' +
        'Cookies HttpOnly não aparecem aqui; este valor não representa ' +
        'o tamanho total do header HTTP Cookie nem confirma erro de requisição.';

    function safeUrl(raw) {
        try {
            return new URL(raw, location.href);
        } catch {
            return null;
        }
    }

    function classify(entry) {

        const url = safeUrl(entry.name);

        const host = url?.hostname || 'domínio desconhecido';

        const path = url
            ? url.pathname.split('/').filter(Boolean).pop() || 'raiz'
            : 'recurso desconhecido';

        const initiator = (entry.initiatorType || 'other').toLowerCase();

        const raw = (entry.name || '').toLowerCase();

        const thirdParty =
            !!url && url.hostname !== location.hostname;

        let type = 'Outro';
        let color = COLORS.text;
        let description = `Recurso iniciado por: ${initiator}`;

        if (
            /analytics|fullstory|hotjar|segment|amplitude|mixpanel|datadog|newrelic|sentry|clarity|google-analytics|gtm\.js/.test(raw) ||
            ['ping', 'beacon'].includes(initiator)
        ) {

            type = 'Tracker / Beacon';
            color = COLORS.purple;
            description = `Telemetria ou monitoramento · ${host}`;

        } else if (
            raw.startsWith('chrome-extension://') ||
            raw.startsWith('moz-extension://')
        ) {

            type = 'Extensão';
            color = COLORS.purple;
            description = 'Recurso associado a uma extensão do navegador';

        } else if (
            initiator === 'fetch' ||
            initiator === 'xmlhttprequest'
        ) {

            type = thirdParty ? 'API externa' : 'API / Fetch';
            color = COLORS.green;

            description =
                `${thirdParty
                    ? 'Integração com domínio externo'
                    : 'Requisição ao domínio da aplicação'} · ${host}`;

        } else if (
            initiator === 'css' ||
            initiator === 'link' ||
            /\.css(?:$|\?)/.test(raw)
        ) {

            type = 'CSS';
            color = COLORS.blue;
            description = `Folha de estilos · ${path}`;

        } else if (
            initiator === 'script' ||
            /\.m?js(?:$|\?)/.test(raw)
        ) {

            type = 'Script';
            color = COLORS.yellow;
            description = `Código JavaScript · ${path}`;

        } else if (
            initiator === 'img' ||
            /\.(png|jpe?g|gif|svg|webp|avif)(?:$|\?)/.test(raw)
        ) {

            type = 'Imagem';
            color = COLORS.orange;
            description = `Arquivo de imagem · ${path}`;

        } else if (
            initiator === 'font' ||
            /\.(woff2?|ttf|otf)(?:$|\?)/.test(raw)
        ) {

            type = 'Fonte';
            color = COLORS.orange;
            description = `Fonte tipográfica · ${path}`;

        } else if (
            initiator === 'video' ||
            initiator === 'audio'
        ) {

            type = 'Mídia';
            color = COLORS.orange;
            description = `Conteúdo de áudio/vídeo · ${path}`;
        }

        return {
            type,
            color,
            description,
            host,
            path,
            thirdParty
        };
    }

    function severity(ms) {

        if (ms < 150) {
            return {
                label: 'Rápido',
                color: COLORS.green
            };
        }

        if (ms < 500) {
            return {
                label: 'Moderado',
                color: COLORS.yellow
            };
        }

        if (ms < 1500) {
            return {
                label: 'Lento',
                color: COLORS.orange
            };
        }

        return {
            label: 'Crítico',
            color: COLORS.red
        };
    }

    function phase(entry, start, end) {

        const a = Number(entry[start]) || 0;
        const b = Number(entry[end]) || 0;

        return a > 0 && b >= a
            ? b - a
            : null;
    }

    const fmt = n =>
        n == null || !Number.isFinite(n)
            ? 'N/D'
            : `${n.toFixed(1)} ms`;

    const fmtBytes = n =>
        n == null
            ? 'N/D'
            : n < 1024
                ? `${n} B`
                : n < 1048576
                    ? `${(n / 1024).toFixed(1)} KB`
                    : `${(n / 1048576).toFixed(2)} MB`;

    function enrich(entry) {

        const cat = classify(entry);

        const phases = {

            dns: phase(
                entry,
                'domainLookupStart',
                'domainLookupEnd'
            ),

            connection: phase(
                entry,
                'connectStart',
                'connectEnd'
            ),

            tls: phase(
                entry,
                'secureConnectionStart',
                'connectEnd'
            ),

            requestToFirstByte: phase(
                entry,
                'requestStart',
                'responseStart'
            ),

            download: phase(
                entry,
                'responseStart',
                'responseEnd'
            )
        };

        // secureConnectionStart é zero quando TLS
        // não se aplica ou não é exposto.

        if (!(Number(entry.secureConnectionStart) > 0)) {
            phases.tls = null;
        }

        const transfer =
            Number.isFinite(entry.transferSize) &&
            entry.transferSize > 0
                ? entry.transferSize
                : null;

        return {
            entry,
            ...cat,
            phases,
            transfer,
            duration: Number(entry.duration) || 0,
            severity: severity(Number(entry.duration) || 0)
        };
    }

    function diagnosis(item) {

        const p = item.phases;

        const notes = [];

        if (item.duration >= 1500) {

            notes.push(
                'A duração total está na faixa crítica definida pelo monitor. ' +
                'Investigue primeiro as etapas com maior tempo, sem presumir ' +
                'que o servidor seja a causa.'
            );
        }

        if (p.dns != null && p.dns >= 100) {

            notes.push(
                'Resolução DNS elevada: compare com outras requisições ' +
                'ao mesmo domínio e verifique cache/resolvedor.'
            );
        }

        if (p.connection != null && p.connection >= 200) {

            notes.push(
                'Estabelecimento de conexão elevado: avalie reutilização ' +
                'de conexão, rede e distância até o host.'
            );
        }

        if (
            p.requestToFirstByte != null &&
            p.requestToFirstByte >= 500
        ) {

            notes.push(
                'TTFB elevado: pode envolver latência, filas, backend ' +
                'ou dependências. Correlacione com logs do servidor.'
            );
        }

        if (p.download != null && p.download >= 500) {

            notes.push(
                'Transferência demorada: examine tamanho da resposta, ' +
                'compressão, banda e velocidade de envio do servidor.'
            );
        }

        if (item.thirdParty) {

            notes.push(
                'Domínio externo: avalie impacto, necessidade, frequência ' +
                'e possibilidade de carregamento assíncrono.'
            );
        }

        if (
            item.transfer != null &&
            item.transfer > 1024 * 1024
        ) {

            notes.push(
                'Payload acima de 1 MB: considere compressão, formatos ' +
                'mais eficientes, paginação ou carregamento sob demanda.'
            );
        }

        if (!notes.length) {

            notes.push(
                'Nenhum sinal isolado ultrapassou os critérios de atenção. ' +
                'Compare recorrência, volume e impacto na experiência do usuário.'
            );
        }

        return notes;
    }

    function addText(parent, tag, text, className) {

        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        node.textContent = text;

        parent.appendChild(node);

        return node;
    }

    function renderRanking() {

        const root = $('sm-ranking');

        root.replaceChildren();

        const top = [...state.resources]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, TOP_LIMIT);

        if (!top.length) {

            return addText(
                root,
                'span',
                'Aguardando tráfego...',
                'sm-muted'
            );
        }

        top.forEach((item, index) => {

            const card = addText(
                root,
                'div',
                '',
                'sm-record'
            );

            card.style.borderLeftColor =
                item.severity.color;

            const head = addText(
                card,
                'div',
                '',
                'sm-row'
            );

            const label = addText(
                head,
                'b',
                `#${index + 1} ${item.type} · ${item.severity.label}`
            );

            label.style.color = item.color;

            const time = addText(
                head,
                'b',
                `${Math.round(item.duration)} ms`
            );

            time.style.color = item.severity.color;

            addText(
                card,
                'div',
                item.description,
                'sm-muted sm-small'
            );

            addText(
                card,
                'div',
                item.entry.name,
                'sm-small'
            );

            const detail = addText(
                card,
                'div',
                `DNS ${fmt(item.phases.dns)} | ` +
                `Conexão ${fmt(item.phases.connection)} | ` +
                `TTFB ${fmt(item.phases.requestToFirstByte)} | ` +
                `Download ${fmt(item.phases.download)}`,
                'sm-muted sm-small'
            );

            detail.style.marginTop = '4px';

            diagnosis(item).forEach(note => {

                addText(
                    card,
                    'div',
                    `• ${note}`,
                    'sm-small'
                );
            });
        });
    }

    function renderDomains() {

        const root = $('sm-domains');

        root.replaceChildren();

        if (!state.resources.length) return;

        const groups = new Map();

        state.resources.forEach(item => {

            const g = groups.get(item.host) || {
                count: 0,
                total: 0,
                thirdParty: item.thirdParty
            };

            g.count++;
            g.total += item.duration;

            groups.set(item.host, g);
        });

        [...groups.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 8)
            .forEach(([host, g]) => {

                const row = addText(
                    root,
                    'div',
                    '',
                    'sm-card'
                );

                row.style.marginBottom = '5px';

                addText(
                    row,
                    'div',
                    `${host} · ${g.thirdParty ? 'terceiro' : 'mesma origem'}`
                );

                addText(
                    row,
                    'div',
                    `${g.count} requisição(ões) · ` +
                    `média ${(g.total / g.count).toFixed(1)} ms · ` +
                    `acumulado ${g.total.toFixed(1)} ms`,
                    'sm-muted sm-small'
                );
            });
    }

    function renderCategories() {

        const root = $('sm-categories');

        root.replaceChildren();

        if (!state.resources.length) return;

        const groups = new Map();

        state.resources.forEach(item => {

            const g = groups.get(item.type) || {
                count: 0,
                total: 0,
                max: 0,
                slow: 0
            };

            g.count++;
            g.total += item.duration;
            g.max = Math.max(g.max, item.duration);

            if (item.duration >= 500) {
                g.slow++;
            }

            groups.set(item.type, g);
        });

        [...groups.entries()]
            .sort((a, b) => b[1].total - a[1].total)
            .forEach(([name, g]) => {

                const row = addText(
                    root,
                    'div',
                    '',
                    'sm-card'
                );

                row.style.marginBottom = '5px';

                addText(
                    row,
                    'div',
                    `${name}: ${g.count} recurso(s) · ` +
                    `média ${(g.total / g.count).toFixed(1)} ms · ` +
                    `máximo ${g.max.toFixed(1)} ms`
                );

                addText(
                    row,
                    'div',
                    `${g.slow} ocorrência(s) com duração ≥ 500 ms · ` +
                    `tempo acumulado observado ${g.total.toFixed(1)} ms`,
                    'sm-muted sm-small'
                );
            });
    }

    function renderSummary() {

        const list = state.resources;

        $('sm-count').textContent = list.length;

        $('sm-average').textContent = list.length
            ? `${(
                list.reduce((s, x) => s + x.duration, 0) /
                list.length
            ).toFixed(1)} ms`
            : '—';

        const known = list.reduce(
            (s, x) => s + (x.transfer || 0),
            0
        );

        $('sm-transfer').textContent =
            list.some(x => x.transfer != null)
                ? fmtBytes(known)
                : 'N/D';

        $('sm-critical').textContent =
            list.filter(x => x.duration >= 1500).length;

        const sorted = list
            .map(x => x.duration)
            .sort((a, b) => a - b);

        const p95 = sorted.length
            ? sorted[
                Math.min(
                    sorted.length - 1,
                    Math.ceil(sorted.length * 0.95) - 1
                )
            ]
            : null;

        $('sm-p95').textContent =
            p95 == null
                ? '—'
                : `${p95.toFixed(1)} ms`;
    }

    function renderFeed(item) {

        const root = $('sm-feed');

        const card = addText(
            root,
            'div',
            '',
            'sm-record'
        );

        card.style.borderLeftColor = item.color;

        const head = addText(
            card,
            'div',
            '',
            'sm-row'
        );

        const title = addText(
            head,
            'b',
            item.type
        );

        title.style.color = item.color;

        const time = addText(
            head,
            'b',
            `${Math.round(item.duration)} ms`
        );

        time.style.color = item.severity.color;

        addText(
            card,
            'div',
            item.description,
            'sm-muted sm-small'
        );

        addText(
            card,
            'div',
            item.entry.name,
            'sm-small'
        );

        while (root.children.length > MAX_LIVE_ITEMS) {
            root.lastElementChild.remove();
        }
    }

    function process(entries) {

        for (const entry of entries) {

            if (entry.entryType !== 'resource') {
                continue;
            }

            // Ignora entradas sem URL/duração útil
            // e limita o histórico em memória.

            if (
                !entry.name ||
                !Number.isFinite(entry.duration)
            ) {
                continue;
            }

            const item = enrich(entry);

            state.resources.push(item);

            renderFeed(item);

            if (state.resources.length > MAX_HISTORY) {

                state.resources.splice(
                    0,
                    state.resources.length - MAX_HISTORY
                );
            }
        }

        renderSummary();
        renderRanking();
        renderCategories();
        renderDomains();
    }

    state.observer = new PerformanceObserver(list => {
        process(list.getEntries());
    });

    try {

        state.observer.observe({
            type: 'resource',
            buffered: true
        });

    } catch (error) {

        console.warn(
            '[Monitor de SaaS] PerformanceObserver indisponível:',
            error
        );
    }

    // Navegação principal é analisada separadamente:
    // não é um Resource Timing entry.

    const navigation =
        performance.getEntriesByType('navigation')[0];

    if (navigation) {

        const nav = enrich(navigation);

        renderFeed({
            ...nav,
            type: 'Navegação',
            color: COLORS.blue,
            description: 'Carregamento do documento principal'
        });
    }

    $('sm-dict-btn').addEventListener('click', () => {

        const dict = $('sm-dictionary');

        dict.style.display =
            dict.style.display === 'block'
                ? 'none'
                : 'block';
    });

    $('sm-reset-btn').addEventListener('click', () => {

        state.resources = [];

        $('sm-feed').replaceChildren();

        renderSummary();
        renderRanking();
        renderCategories();
        renderDomains();
    });

    $('sm-close-btn').addEventListener('click', () => {

        state.observer?.disconnect();

        panel.remove();
        style.remove();
    });

    // Arraste pelo cabeçalho;
    // os botões continuam clicáveis.

    const handle = $('sm-drag-handle');

    handle.addEventListener('pointerdown', event => {

        if (event.target.closest('button')) {
            return;
        }

        const rect = panel.getBoundingClientRect();

        state.dragging = true;

        state.offsetX = event.clientX - rect.left;
        state.offsetY = event.clientY - rect.top;

        handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', event => {

        if (!state.dragging) {
            return;
        }

        const maxLeft = Math.max(
            0,
            window.innerWidth - panel.offsetWidth
        );

        const maxTop = Math.max(
            0,
            window.innerHeight - panel.offsetHeight
        );

        const left = Math.min(
            maxLeft,
            Math.max(0, event.clientX - state.offsetX)
        );

        const top = Math.min(
            maxTop,
            Math.max(0, event.clientY - state.offsetY)
        );

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = 'auto';
    });

    const stopDrag = () => {
        state.dragging = false;
    };

    handle.addEventListener('pointerup', stopDrag);

    handle.addEventListener('pointercancel', stopDrag);

    console.info(
        '[Monitor de SaaS] Ativo. Histórico limitado a',
        MAX_HISTORY,
        'recursos.'
    );

})();
