const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Lucas de Carvalho/Documents/Sites/CRM-WHATSAPP/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. CSS Injection
const cssAnchor = '</style>';
const customCSS = `
        /* ─── COMPONENTES CUSTOMIZADOS ADICIONADOS ───────────────── */
        /* Busca Global */
        .search-lead-item, .search-msg-item {
            transition: var(--transition);
        }
        .search-lead-item:hover, .search-msg-item:hover {
            border-color: var(--green) !important;
            background: var(--surface) !important;
        }

        /* Abas do Modal de Lead */
        .lead-modal-tabs {
            display: flex;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 0 16px;
            gap: 12px;
            flex-shrink: 0;
        }
        .lead-modal-tab-btn {
            background: none;
            border: none;
            color: var(--muted2);
            padding: 12px 4px;
            font-size: 0.82rem;
            font-weight: 500;
            cursor: pointer;
            position: relative;
            font-family: var(--sans);
            transition: var(--transition);
        }
        .lead-modal-tab-btn:hover {
            color: var(--text);
        }
        .lead-modal-tab-btn.active {
            color: var(--green);
            font-weight: 600;
        }
        .lead-modal-tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--green);
        }

        /* Timeline de Histórico */
        .history-timeline {
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: relative;
            padding-left: 20px;
            padding-top: 8px;
        }
        .timeline-item {
            position: relative;
        }
</style>`;

const cssIndex = content.lastIndexOf(cssAnchor);
if (cssIndex !== -1) {
    content = content.substring(0, cssIndex) + customCSS + content.substring(cssIndex + cssAnchor.length);
} else {
    console.error('Could not find </style> tag');
}

// 2. Sidebar Search Icon
const sidebarAnchor = '<div class="nav-item" id="navConfig"';
const searchIcon = `        <div class="nav-item" id="navSearch" onclick="openGlobalSearch()"><span class="nav-icon">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        </span> Buscar (Ctrl+K)
        </div>\n`;

content = content.replace(sidebarAnchor, searchIcon + sidebarAnchor);

// 3. Lead Modal Abas
const leadModalAnchor = '<div class="lead-modal-chat" id="lmChat"></div>';
const leadModalTabs = `                <div class="lead-modal-tabs">
                    <button class="lead-modal-tab-btn active" id="lmTabChat" onclick="setLeadModalTab('chat')">Conversa</button>
                    <button class="lead-modal-tab-btn" id="lmTabHistory" onclick="setLeadModalTab('history')">Histórico</button>
                </div>
                <div class="lead-modal-chat" id="lmChat"></div>
                <div class="lead-modal-chat" id="lmHistory" style="display: none; background: var(--bg); overflow-y: auto;"></div>`;

content = content.replace(leadModalAnchor, leadModalTabs);

// 4. viewRelatorios Abas e Sub-telas
const viewRelatoriosAnchorStart = `<div id="viewRelatorios"
                style="display:none; flex-direction:column; gap:20px; width:100%; padding-bottom:60px;">
                <div class="filters-bar" style="flex-shrink:0">`;

const reportTabGeneralStart = `            <div id="viewRelatorios"
                style="display:none; flex-direction:column; gap:20px; width:100%; padding-bottom:60px;">
                <div class="status-tabs" style="margin-bottom: 5px; flex-shrink:0; display:flex; gap:10px;">
                    <div class="status-tab active" id="btnReportTabGeneral" onclick="setReportTab('general')" style="cursor:pointer; padding:8px 16px; border-bottom:2px solid transparent; font-weight:600;">Geral</div>
                    <div class="status-tab" id="btnReportTabVendors" onclick="setReportTab('vendors')" style="cursor:pointer; padding:8px 16px; border-bottom:2px solid transparent; font-weight:600;">Vendedores</div>
                </div>

                <div id="reportTabGeneral" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
                    <div class="filters-bar" style="flex-shrink:0">`;

content = content.replace(viewRelatoriosAnchorStart, reportTabGeneralStart);

// Close reportTabGeneral and add reportTabVendors before the end of viewRelatorios
const replacementEnd = `                    <!-- MAPA DE CALOR -->
                    <div class="panel" style="margin-bottom:20px">
                        <div class="panel-head">
                            <div class="panel-title">// mapa de calor: horários de pico (mensagens)</div>
                        </div>
                        <div class="heatmap-container" style="padding:20px">
                            <div class="heatmap-grid" id="reportHeatmap">
                                <!-- Labels Dias -->
                                <div></div>
                                <div class="heatmap-label">Seg</div>
                                <div class="heatmap-label">Ter</div>
                                <div class="heatmap-label">Qua</div>
                                <div class="heatmap-label">Qui</div>
                                <div class="heatmap-label">Sex</div>
                                <div class="heatmap-label">Sáb</div>
                                <div class="heatmap-label">Dom</div>
                                <!-- Dinâmico (Horas) -->
                            </div>
                        </div>
                    </div>
                </div>

                <div id="reportTabVendors" style="display: none; flex-direction: column; gap: 20px; width: 100%;">
                    <div class="filters-bar" style="flex-shrink:0; display: flex; gap: 10px; align-items: center;">
                        <select class="filter-select" id="vendorReportPeriod" onchange="loadVendorsReport()" style="width: 180px;">
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d" selected>Últimos 30 dias</option>
                            <option value="mes">Este mês</option>
                            <option value="tudo">Total</option>
                        </select>
                        <button class="action-btn secondary" style="margin-left:auto; padding:8px 16px"
                            onclick="exportVendorsReportExcel()">exportar excel ↓</button>
                    </div>
                    <div id="vendorCardsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                        <!-- Cards dinâmicos aqui -->
                    </div>
                </div>`;

const heatmapRegex = /<!-- MAPA DE CALOR -->[\s\S]*?<!-- Dinâmico \(Horas\) -->[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(heatmapRegex, replacementEnd + '\n            </div>');

// 5. Global Search Modal before </body>
const bodyAnchor = '</body>';
const globalSearchModal = `    <!-- GLOBAL SEARCH MODAL -->
    <div class="lead-modal-overlay" id="globalSearchModal" onclick="closeGlobalSearch()" style="align-items: flex-start; padding-top: 10vh;">
        <div class="lead-modal-content" onclick="event.stopPropagation()" style="max-width: 560px; height: auto; max-height: 75vh;">
            <div class="lead-modal-header" style="padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <span style="font-size: 1.1rem; color: var(--muted2); line-height: 1;">🔍</span>
                    <input type="text" id="globalSearchInput" placeholder="Buscar leads ou mensagens (Ctrl+K)..." oninput="handleGlobalSearchInput(event)" style="
                        width: 100%;
                        background: none;
                        border: none;
                        color: var(--text);
                        font-size: 0.95rem;
                        outline: none;
                        font-family: var(--sans);
                    ">
                </div>
                <button class="lead-modal-close" onclick="closeGlobalSearch()" style="margin-left: 10px;">×</button>
            </div>
            <div class="lead-modal-body" id="globalSearchResults" style="padding: 16px; overflow-y: auto; gap: 16px; display: none; background: var(--bg2);">
                <!-- Resultados renderizados via JavaScript -->
            </div>
        </div>
    </div>
</body>`;

content = content.replace(bodyAnchor, globalSearchModal);

// 6. JavaScript Logic
const scriptAnchor = '        }, 60000);';
const customJS = `        }, 60000);

        // ─── NOVO: LÓGICA DE BUSCA GLOBAL (FUNCIONALIDADE 1) ─────────────────
        let searchDebounceTimeout = null;

        function openGlobalSearch() {
            const modal = document.getElementById('globalSearchModal');
            if (modal) {
                modal.classList.add('open');
                const input = document.getElementById('globalSearchInput');
                if (input) {
                    input.value = '';
                    input.focus();
                }
                const results = document.getElementById('globalSearchResults');
                if (results) {
                    results.style.display = 'none';
                    results.innerHTML = '';
                }
            }
        }

        function closeGlobalSearch() {
            const modal = document.getElementById('globalSearchModal');
            if (modal) {
                modal.classList.remove('open');
            }
        }

        function handleGlobalSearchInput(e) {
            clearTimeout(searchDebounceTimeout);
            const query = e.target.value.trim();
            if (!query) {
                const results = document.getElementById('globalSearchResults');
                results.style.display = 'none';
                results.innerHTML = '';
                return;
            }
            searchDebounceTimeout = setTimeout(() => {
                performGlobalSearch(query);
            }, 300);
        }

        async function performGlobalSearch(query) {
            const resultsContainer = document.getElementById('globalSearchResults');
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = '<div class="state-msg"><span class="spinner"></span> Buscando...</div>';
            
            try {
                const encodedQuery = encodeURIComponent(query);
                const leadsPath = \`status_de_leads?or=(nome.ilike.*\${encodedQuery}*,telefone.ilike.*\${encodedQuery}*,interesse.ilike.*\${encodedQuery}*)\`;
                const msgsPath = \`conversas?or=(telefone.ilike.*\${encodedQuery}*,mensagem.ilike.*\${encodedQuery}*)&limit=10&order=created_at.desc\`;
                
                const [leads, msgs] = await Promise.all([
                    sbGet(leadsPath),
                    sbGet(msgsPath)
                ]);
                
                let html = '';
                
                if (leads && leads.length > 0) {
                    html += \`
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.72rem; font-weight: 700; color: var(--muted2); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Leads (\${leads.length})</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                    \`;
                    leads.forEach(lead => {
                        const statusLabel = lead.status === 'em_andamento' ? 'Em Andamento' : 
                                            lead.status === 'matriculado' ? 'Matriculado' : 
                                            lead.status === 'aluno' ? 'Aluno' : 
                                            lead.status === 'pausado' ? 'Pausado' : 
                                            lead.status === 'perdido' ? 'Perdido' : 'Novo';
                        const badgeClass = lead.status === 'matriculado' ? 'badge-green' : 
                                           lead.status === 'aluno' ? 'badge-blue' : 
                                           lead.status === 'em_andamento' ? 'badge-orange' : 'badge-muted';
                        
                        html += \`
                            <div class="search-lead-item" onclick="openLeadFromSearch('\${lead.telefone}')" style="
                                padding: 10px 12px;
                                border-radius: var(--radius-md);
                                border: 1px solid var(--border);
                                background: var(--bg);
                                cursor: pointer;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                transition: all 0.2s;
                            ">
                                <div>
                                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text);">\${escapeHtml(lead.nome || 'Sem Nome')} <span style="font-size: 0.75rem; color: var(--muted2); font-weight: 400; font-family: var(--mono); margin-left: 4px;">(\${fmtTel(lead.telefone)})</span></div>
                                    <div style="font-size: 0.7rem; color: var(--muted2); margin-top: 3px;">
                                        Interesse: \${escapeHtml(lead.interesse || '—')}
                                    </div>
                                </div>
                                <span class="badge \${badgeClass}" style="font-size: 0.65rem;">\${statusLabel}</span>
                            </div>
                        \`;
                    });
                    html += \`</div></div>\`;
                }
                
                if (msgs && msgs.length > 0) {
                    html += \`
                        <div>
                            <div style="font-size: 0.72rem; font-weight: 700; color: var(--muted2); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Mensagens (\${msgs.length})</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                    \`;
                    msgs.forEach(msg => {
                        const dateStr = new Date(msg.created_at).toLocaleDateString('pt-BR') + ' ' + fmtHora(msg.created_at);
                        const senderLabel = msg.de === 'bot' ? '🤖 Bot' : 
                                            msg.de === 'vendedor' ? \`👤 \${fmtVendedor(msg.vendedor)}\` : '👤 Cliente';
                        
                        html += \`
                            <div class="search-msg-item" onclick="selectConversationFromSearch('\${msg.telefone}', '\${escapeHtml(msg.vendedor || "")}', '\${escapeHtml(msg.tipo || "")}')" style="
                                padding: 10px 12px;
                                border-radius: var(--radius-md);
                                border: 1px solid var(--border);
                                background: var(--bg);
                                cursor: pointer;
                                transition: all 0.2s;
                            ">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <div style="font-size: 0.8rem; font-weight: 600; color: var(--text); font-family: var(--mono);">\${fmtTel(msg.telefone)}</div>
                                    <div style="font-size: 0.65rem; color: var(--muted2); font-family: var(--mono);">\${dateStr}</div>
                                </div>
                                <div style="font-size: 0.78rem; color: var(--text); line-height: 1.4; word-break: break-word; white-space: pre-wrap;">\${escapeHtml(msg.mensagem)}</div>
                                <div style="font-size: 0.68rem; color: var(--muted2); margin-top: 4px;">Enviado por: \${senderLabel}</div>
                            </div>
                        \`;
                    });
                    html += \`</div></div>\`;
                }
                
                if (html === '') {
                    resultsContainer.innerHTML = '<div class="state-msg">Nenhum resultado encontrado.</div>';
                } else {
                    resultsContainer.innerHTML = html;
                }
            } catch (e) {
                console.error('Erro na busca global:', e);
                resultsContainer.innerHTML = '<div class="state-msg">Erro ao realizar a busca.</div>';
            }
        }

        async function openLeadFromSearch(telefone) {
            let rResumo = await sbGet(\`leads_resumo?telefone=eq.\${telefone}\`);
            let rStatus = await sbGet(\`status_de_leads?telefone=eq.\${telefone}\`);
            
            const res = rResumo[0] || {};
            const st = rStatus[0] || {};
            
            const leadObj = {
                telefone:       telefone,
                primeiroContato: res.primeiro_contato || new Date().toISOString(),
                ultimoContato:  res.ultimo_contato || new Date().toISOString(),
                ultimaMensagem: res.ultima_mensagem || '',
                vendedor:       res.vendedor || 'desconhecido',
                tipo:           res.tipo    || 'desconhecido',
                totalMsgs:      res.total_msgs || 0,
                temMsgBot:      res.tem_msg_bot || false,
                status:         st.status      || 'novo',
                nota:           st.anotacao    || '',
                nome:           st.nome        || '',
                idade:          st.idade       || '',
                interesse:      st.interesse   || '',
                dataRetorno:    st.data_retorno || ''
            };
            
            const idx = fullLeadsData.findIndex(l => l.telefone === telefone);
            if (idx !== -1) {
                fullLeadsData[idx] = leadObj;
            } else {
                fullLeadsData.push(leadObj);
            }
            
            closeGlobalSearch();
            await openLeadModal(telefone, leadObj.vendedor, leadObj.primeiroContato);
        }

        async function selectConversationFromSearch(telefone, vendedor, tipo) {
            let conv = allConvsData[telefone];
            if (!conv) {
                conv = {
                    telefone: telefone,
                    vendedor: vendedor || 'desconhecido',
                    tipo: tipo || 'desconhecido',
                    lastTime: new Date().toISOString(),
                    msgs: []
                };
                allConvsData[telefone] = conv;
            }
            
            showView('dashboard');
            await showConv(conv, null);
            closeGlobalSearch();
        }

        // Listener de Atalhos do Teclado
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openGlobalSearch();
            }
            if (e.key === 'Escape') {
                const searchModal = document.getElementById('globalSearchModal');
                if (searchModal && searchModal.classList.contains('open')) {
                    closeGlobalSearch();
                }
            }
        });

        // ─── NOVO: LÓGICA DE HISTÓRICO DE LEADS (FUNCIONALIDADE 2) ───────────
        function setLeadModalTab(tab) {
            const btnChat = document.getElementById('lmTabChat');
            const btnHistory = document.getElementById('lmTabHistory');
            const chatEl = document.getElementById('lmChat');
            const historyEl = document.getElementById('lmHistory');
            
            if (tab === 'chat') {
                btnChat.classList.add('active');
                btnHistory.classList.remove('active');
                chatEl.style.setProperty('display', 'flex', 'important');
                historyEl.style.setProperty('display', 'none', 'important');
                setTimeout(() => chatEl.scrollTop = chatEl.scrollHeight, 50);
            } else {
                btnChat.classList.remove('active');
                btnHistory.classList.add('active');
                chatEl.style.setProperty('display', 'none', 'important');
                historyEl.style.setProperty('display', 'flex', 'important');
                
                if (currentModalLead) {
                    loadLeadHistory(currentModalLead);
                }
            }
        }

        function formatFieldName(campo) {
            const names = {
                status: 'Status',
                anotacao: 'Anotação',
                nome: 'Nome',
                idade: 'Idade',
                interesse: 'Interesse',
                data_retorno: 'Data de Retorno'
            };
            return names[campo] || campo;
        }

        function formatFieldValue(campo, val) {
            if (val === null || val === undefined || val === '') return '—';
            if (campo === 'status') {
                const statuses = {
                    novo: 'Novo',
                    em_andamento: 'Em Andamento',
                    matriculado: 'Matriculado',
                    aluno: 'Aluno',
                    pausado: 'Pausado',
                    perdido: 'Perdido'
                };
                return statuses[val] || val;
            }
            if (campo === 'anotacao') {
                return val.length > 80 ? val.substring(0, 80) + '...' : val;
            }
            if (campo === 'data_retorno') {
                const parts = val.split('-');
                if (parts.length === 3) {
                    return \`\${parts[2]}/\${parts[1]}/\${parts[0]}\`;
                }
            }
            return val;
        }

        async function loadLeadHistory(telefone) {
            const container = document.getElementById('lmHistory');
            container.innerHTML = '<div class="state-msg"><span class="spinner"></span></div>';
            try {
                const historyData = await sbGet(\`historico_leads?telefone=eq.\${telefone}&order=created_at.desc&limit=30\`);
                if (!historyData || historyData.length === 0) {
                    container.innerHTML = '<div class="state-msg">Sem histórico registrado</div>';
                    return;
                }
                
                let html = \`
                    <div class="history-timeline">
                        <div style="position: absolute; left: 6px; top: 12px; bottom: 12px; width: 2px; background: var(--border);"></div>
                \`;
                
                historyData.forEach(item => {
                    const dateStr = new Date(item.created_at).toLocaleString('pt-BR');
                    const campoLabel = formatFieldName(item.campo);
                    const valAntigo = formatFieldValue(item.campo, item.valor_anterior);
                    const valNovo = formatFieldValue(item.campo, item.valor_novo);
                    
                    html += \`
                        <div class="timeline-item" style="margin-bottom: 14px; padding-left: 6px;">
                            <div style="position: absolute; left: -18px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--green); border: 2px solid var(--bg);"></div>
                            <div style="font-size: 0.8rem; color: var(--text); line-height: 1.4;">
                                <strong>\${escapeHtml(campoLabel)}</strong>: 
                                <span style="color: var(--muted2); text-decoration: line-through;">\${escapeHtml(valAntigo)}</span> 
                                <span style="color: var(--muted2); margin: 0 4px;">→</span> 
                                <span style="color: var(--text); font-weight: 500;">\${escapeHtml(valNovo)}</span>
                            </div>
                            <div style="font-size: 0.68rem; color: var(--muted2); margin-top: 3px; font-family: var(--mono);">
                                \${dateStr}
                            </div>
                        </div>
                    \`;
                });
                
                html += \`</div>\`;
                container.innerHTML = html;
            } catch (e) {
                console.error('Erro ao carregar historico:', e);
                container.innerHTML = '<div class="state-msg">Erro ao carregar histórico</div>';
            }
        }

        // Monkey Patching: sbUpsert para capturar alterações em status_de_leads
        const originalSbUpsert = sbUpsert;
        sbUpsert = async function(table, data, onConflict = null) {
            if (table === 'status_de_leads' && data && data.length > 0) {
                const newRecord = data[0];
                const tel = newRecord.telefone;
                
                let previousState = null;
                try {
                    const prevArray = await sbGet(\`status_de_leads?telefone=eq.\${tel}&select=status,anotacao,nome,idade,interesse,data_retorno\`);
                    if (prevArray && prevArray.length > 0) {
                        previousState = prevArray[0];
                    }
                } catch (e) {
                    console.error('Erro ao buscar estado anterior para histórico:', e);
                }
                
                await originalSbUpsert(table, data, onConflict);
                
                const normalize = v => (v === null || v === undefined) ? '' : String(v).trim();
                const fieldsToCompare = [
                    { key: 'status', oldVal: previousState ? previousState.status : null, newVal: newRecord.status },
                    { key: 'anotacao', oldVal: previousState ? previousState.anotacao : null, newVal: newRecord.anotacao },
                    { key: 'nome', oldVal: previousState ? previousState.nome : null, newVal: newRecord.nome },
                    { key: 'idade', oldVal: previousState ? previousState.idade : null, newVal: newRecord.idade },
                    { key: 'interesse', oldVal: previousState ? previousState.interesse : null, newVal: newRecord.interesse },
                    { key: 'data_retorno', oldVal: previousState ? previousState.data_retorno : null, newVal: newRecord.data_retorno }
                ];

                const changes = [];
                for (const field of fieldsToCompare) {
                    if (normalize(field.oldVal) !== normalize(field.newVal)) {
                        changes.push({
                            telefone: tel,
                            campo: field.key,
                            valor_anterior: field.oldVal !== null ? String(field.oldVal) : null,
                            valor_novo: field.newVal !== null ? String(field.newVal) : null
                        });
                    }
                }
                
                if (changes.length > 0) {
                    try {
                        await originalSbUpsert('historico_leads', changes);
                    } catch (eHist) {
                        console.error('Erro ao salvar histórico do lead:', eHist);
                    }
                }
            } else {
                await originalSbUpsert(table, data, onConflict);
            }
        };

        // Monkey Patching: openLeadModal para resetar abas
        const originalOpenLeadModal = openLeadModal;
        openLeadModal = async function(telefone, vendedor, primeiroContato) {
            await originalOpenLeadModal(telefone, vendedor, primeiroContato);
            setLeadModalTab('chat');
        };

        // ─── NOVO: LÓGICA DE MÉTRICAS DE VENDEDOR (FUNCIONALIDADE 3) ─────────
        let currentReportTab = 'general';
        let lastVendorsReportData = null;

        function setReportTab(tab) {
            currentReportTab = tab;
            const btnGeneral = document.getElementById('btnReportTabGeneral');
            const btnVendors = document.getElementById('btnReportTabVendors');
            const tabGeneral = document.getElementById('reportTabGeneral');
            const tabVendors = document.getElementById('reportTabVendors');
            
            if (tab === 'general') {
                btnGeneral.classList.add('active');
                btnVendors.classList.remove('active');
                tabGeneral.style.display = 'flex';
                tabVendors.style.display = 'none';
                loadRelatorios();
            } else {
                btnGeneral.classList.remove('active');
                btnVendors.classList.add('active');
                tabGeneral.style.display = 'none';
                tabVendors.style.display = 'flex';
                loadVendorsReport();
            }
        }

        function getVendorReportDateRange(period) {
            const now = brNow();
            let start;
            let end = brISO(now, 23, 59, 59);

            if (period === '7d') {
                const d = new Date(now);
                d.setDate(now.getDate() - 7);
                start = brISO(d, 0, 0, 0);
            } else if (period === '30d') {
                const d = new Date(now);
                d.setDate(now.getDate() - 30);
                start = brISO(d, 0, 0, 0);
            } else if (period === 'mes') {
                start = brISO(new Date(now.getFullYear(), now.getMonth(), 1), 0, 0, 0);
            } else {
                start = '2000-01-01T00:00:00-03:00';
            }
            return { start, end };
        }

        function formatAvgTime(seconds) {
            if (seconds === null || seconds === undefined || isNaN(seconds)) return '—';
            const mins = Math.round(seconds / 60);
            if (mins < 1) return '< 1 min';
            if (mins < 60) return \`\${mins} min\`;
            const hrs = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            if (remainingMins === 0) return \`\${hrs}h\`;
            return \`\${hrs}h \${remainingMins}m\`;
        }

        async function loadVendorsReport() {
            const grid = document.getElementById('vendorCardsGrid');
            grid.innerHTML = '<div class="state-msg" style="grid-column: 1/-1;"><span class="spinner"></span> Carregando métricas dos vendedores...</div>';
            
            const period = document.getElementById('vendorReportPeriod').value;
            const { start, end } = getVendorReportDateRange(period);
            
            try {
                let leadsPath = 'leads_resumo?select=telefone,vendedor,ultimo_contato';
                if (period !== 'tudo') {
                    leadsPath += \`&ultimo_contato=gte.\${start}&ultimo_contato=lte.\${end}\`;
                }
                
                const statusPath = 'status_de_leads?select=telefone,status';
                
                let conversasPath = 'conversas?select=telefone,vendedor,de,created_at';
                if (period !== 'tudo') {
                    conversasPath += \`&created_at=gte.\${start}&created_at=lte.\${end}\`;
                }
                
                const [leadsResumo, statusRows, conversas] = await Promise.all([
                    sbGet(leadsPath),
                    sbGet(statusPath),
                    sbGet(conversasPath)
                ]);
                
                const filteredLeads = (leadsResumo || []).filter(l => !isExcluded(l.telefone));
                const filteredConversas = (conversas || []).filter(c => !isExcluded(c.telefone));
                
                // Agrupando conversas por telefone para calcular tempo de resposta
                const msgsByTel = {};
                filteredConversas.forEach(c => {
                    if (!msgsByTel[c.telefone]) msgsByTel[c.telefone] = [];
                    msgsByTel[c.telefone].push(c);
                });
                
                const responseTimesByVendor = {}; // displayGroup -> array de segundos
                
                Object.keys(msgsByTel).forEach(tel => {
                    const msgs = msgsByTel[tel].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    let clientTime = null;
                    msgs.forEach(m => {
                        if (m.de === 'cliente') {
                            if (!clientTime) {
                                clientTime = new Date(m.created_at);
                            }
                        } else if (m.de === 'vendedor') {
                            if (clientTime && m.vendedor) {
                                const diffMs = new Date(m.created_at) - clientTime;
                                const diffSec = diffMs / 1000;
                                if (diffSec > 0) {
                                    const displayGroup = fmtVendedor(m.vendedor).trim();
                                    if (!responseTimesByVendor[displayGroup]) {
                                        responseTimesByVendor[displayGroup] = [];
                                    }
                                    responseTimesByVendor[displayGroup].push(diffSec);
                                }
                                clientTime = null;
                            }
                        } else {
                            clientTime = null; // Bot encerra ou reseta a espera
                        }
                    });
                });

                // Obter nomes de exibição únicos dos vendedores da configuração
                const uniqueDisplayNames = [...new Set(crmConfig.vendedores.map(v => fmtVendedor(v.nome).trim()))].filter(Boolean);
                
                const statusMap = {};
                (statusRows || []).forEach(s => {
                    statusMap[s.telefone] = s.status;
                });
                
                const vendorsData = uniqueDisplayNames.map(displayName => {
                    const sellerLeads = filteredLeads.filter(l => fmtVendedor(l.vendedor).trim() === displayName);
                    const totalLeads = sellerLeads.length;
                    
                    const matriculados = sellerLeads.filter(l => {
                        const st = statusMap[l.telefone] || 'novo';
                        return st === 'matriculado' || st === 'aluno';
                    }).length;
                    
                    const conversionRate = totalLeads > 0 ? Math.round((matriculados / totalLeads) * 100) : 0;
                    
                    const sellerMsgs = filteredConversas.filter(c => 
                        c.de === 'vendedor' && 
                        fmtVendedor(c.vendedor).trim() === displayName
                    );
                    const msgCount = sellerMsgs.length;
                    
                    let lastServiceDate = '—';
                    if (sellerMsgs.length > 0) {
                        const dates = sellerMsgs.map(c => new Date(c.created_at));
                        const maxDate = new Date(Math.max(...dates));
                        lastServiceDate = maxDate.toLocaleString('pt-BR');
                    }
                    
                    // Cálculo da média de tempo de resposta
                    const times = responseTimesByVendor[displayName] || [];
                    const avgSeconds = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;
                    const avgResponseTime = formatAvgTime(avgSeconds);
                    
                    return {
                        vendedor: displayName,
                        totalLeads,
                        matriculados,
                        conversionRate,
                        msgCount,
                        lastServiceDate,
                        avgResponseTime
                    };
                });
                
                lastVendorsReportData = vendorsData;
                
                let maxConversion = -1;
                vendorsData.forEach(v => {
                    if (v.totalLeads > 0 && v.conversionRate > maxConversion) {
                        maxConversion = v.conversionRate;
                    }
                });
                
                let html = '';
                vendorsData.forEach(v => {
                    const isHighest = v.totalLeads > 0 && v.conversionRate === maxConversion;
                    
                    html += \`
                        <div class="metric-card" style="
                            background: var(--surface);
                            border: 1px solid \${isHighest ? "var(--green)" : "var(--border)"};
                            box-shadow: \${isHighest ? "0 0 12px var(--green-dim)" : "var(--shadow-sm)"};
                            padding: 20px;
                            border-radius: var(--radius-lg);
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            position: relative;
                            transition: var(--transition);
                        " onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
                             \${isHighest ? \`
                             <span style="
                                 position: absolute;
                                 top: 12px;
                                 right: 12px;
                                 background: var(--green-dim);
                                 color: var(--green);
                                 font-size: 0.62rem;
                                 font-weight: 700;
                                 padding: 3px 8px;
                                 border-radius: 10px;
                                 text-transform: uppercase;
                                 letter-spacing: 0.05em;
                                 border: 1px solid var(--green);
                             ">Melhor Conversão</span>\` : ''}
                             
                             <div style="font-size: 0.95rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px;">
                                  👤 \${escapeHtml(v.vendedor)}
                             </div>
                             
                             <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px;">
                                  <div>
                                       <div style="font-size: 0.65rem; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.02em;">Leads Atendidos</div>
                                       <div style="font-size: 1.15rem; font-weight: 700; color: var(--text); margin-top: 2px;">\${v.totalLeads}</div>
                                  </div>
                                  <div>
                                       <div style="font-size: 0.65rem; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.02em;">Matriculados</div>
                                       <div style="font-size: 1.15rem; font-weight: 700; color: var(--text); margin-top: 2px;">\${v.matriculados}</div>
                                  </div>
                                  <div>
                                       <div style="font-size: 0.65rem; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.02em;">Conversão</div>
                                       <div style="font-size: 1.15rem; font-weight: 700; color: \${isHighest ? "var(--green)" : "var(--text)"}; margin-top: 2px;">\${v.conversionRate}%</div>
                                  </div>
                                  <div>
                                       <div style="font-size: 0.65rem; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.02em;">Mensagens</div>
                                       <div style="font-size: 1.15rem; font-weight: 700; color: var(--text); margin-top: 2px;">\${v.msgCount}</div>
                                  </div>
                             </div>
                             
                             <div style="border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                                  <span style="font-size: 0.65rem; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.02em;">Tempo Médio Resposta</span>
                                  <span style="font-size: 0.85rem; font-weight: 700; color: var(--text);">\${v.avgResponseTime}</span>
                             </div>
                             
                             <div style="border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px; font-size: 0.68rem; color: var(--muted2); display: flex; justify-content: space-between; align-items: center;">
                                  <span>Último atendimento:</span>
                                  <span style="font-weight: 500; color: var(--text); font-family: var(--mono);">\${v.lastServiceDate}</span>
                             </div>
                        </div>
                    \`;
                });
                
                grid.innerHTML = html;
            } catch (e) {
                console.error('Erro ao carregar relatório de vendedores:', e);
                grid.innerHTML = '<div class="state-msg" style="grid-column: 1/-1;">Erro ao carregar relatório dos vendedores.</div>';
            }
        }

        function exportVendorsReportExcel() {
            if (!lastVendorsReportData) return;
            
            const headers = [
                "Vendedor", 
                "Leads Atendidos", 
                "Matriculados", 
                "Taxa de Conversão (%)", 
                "Mensagens Enviadas (Período)", 
                "Tempo Médio de Resposta",
                "Último Atendimento"
            ];
            
            const rows = lastVendorsReportData.map(v => [
                v.vendedor,
                v.totalLeads,
                v.matriculados,
                v.conversionRate + "%",
                v.msgCount,
                v.avgResponseTime,
                v.lastServiceDate
            ]);
            
            const data = [headers, ...rows];
            const period = document.getElementById('vendorReportPeriod').value;
            exportToExcel(data, \`Relatorio_Vendedores_\${period}\`, "Desempenho Vendedores");
        }

        // Listener de navegação para a aba Relatórios
        document.getElementById('navRelatorios').addEventListener('click', () => {
            if (currentReportTab === 'vendors') {
                loadVendorsReport();
            }
        });`;

// In the code string we used: \Double.toString(v.conversionRate === undefined ? 0 : v.conversionRate)
// Let's make sure the string template for conversion rate is simply \${v.conversionRate}%
// Let's edit content replacement to correctly handle script insertion.

content = content.replace(scriptAnchor, customJS);

fs.writeFileSync(filePath, content, 'utf8');
console.log('All features applied successfully and cleanly!');
