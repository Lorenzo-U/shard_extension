let shardUpdateInterval; // Variabile  timer

document.addEventListener('DOMContentLoaded', () => {
    initDesktop();
    
    //  IMPORT/EXPORT LOGICA
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const fileInput = document.getElementById('btn-import-file');

    // ESPORTAZIONE
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            chrome.storage.local.get(null, (items) => {
                const dataStr = JSON.stringify(items, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `shard_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        });
    }
    // IMPORTAZIONE
    if (btnImportTrigger && fileInput) {
        btnImportTrigger.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    chrome.storage.local.clear(() => {
                        chrome.storage.local.set(importedData, () => {
                            alert("✅Backup successfully imported! Shard OS will reboot.");
                            window.location.reload(); 
                        });
                    });
                } catch (error) {
                    console.error("Import Error:", error);
                    alert("❌Error: The file is not a valid Shard OS backup.");
                }
                fileInput.value = ""; // Resetta l'input
            };
            reader.readAsText(file);
        });
    }
    // Pulsante guide
    const btnGuide = document.getElementById('btn-guide');
    if (btnGuide) {
        btnGuide.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://lorenzo-u.github.io/shard_extension/' });
        });
    }
});

let zIndexCounter = 100; 

function formatSpotifyEmbedUrl(url) {

    // Fallback se vuoto
    if (!url || url.trim() === "") {
        return "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsnsoi";
    }

    url = url.trim();

    // Se è già embed
    if (url.includes("/embed/")) {
        return url;
    }

    // spotify:track:ID
    if (url.startsWith("spotify:")) {
        const parts = url.split(":");
        if (parts.length >= 3) {
            const type = parts[1];
            const id = parts[2];
            return `https://open.spotify.com/embed/${type}/${id}`;
        }
    }

    // ?si= ecc
    url = url.split("?")[0];

    // path con locale 
    url = url.replace("open.spotify.com/intl-it/", "open.spotify.com/");
    url = url.replace("open.spotify.com/intl-en/", "open.spotify.com/");


    const regex = /open\.spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);

    if (match) {
        const type = match[1];
        const id = match[2];
        return `https://open.spotify.com/embed/${type}/${id}`;
    }

    // spotify.link
    if (url.includes("spotify.link")) {
        return url;
    }

    // fallback
    return url;
}

// CONFIGURAZIONE WIDGET 
const WIDGET_VARIANTS = {
    search: [
        {val: 'classic', label: 'Classic'},
        {val: 'minimal', label: 'Minimal'},
        {val: 'glass', label: 'Glass'}
    ],
    clock: [
        {val: 'digital', label: 'Digital'},
        {val: 'analog', label: 'Analog'},
        {val: 'matrix', label: 'Matrix (Unix Time)'}
    ],
    weather: [
        {val: 'simple', label: 'Simple'},
        {val: 'detailed', label: 'Detailed'},
        {val: 'minimal', label: 'Minimal'}
    ],
    battery: [
        {val: 'bar', label: 'Bar'},
        {val: 'circle', label: 'Circle'},
        {val: 'perc', label: 'Percentage'}
    ],
    note: [
        {val: 'default', label: 'Default (OS theme)'},
        {val: 'yellow', label: 'Yellow Post-it'},
        {val: 'blue', label: 'Blue'},
        {val: 'pink', label: 'Pink'},
        {val: 'green', label: 'Green'}
    ],
    todo: [
        {val: 'standard', label: 'Classic'},
        {val: 'detailed', label: 'Progress'}
    ],
    spotify: [
        {val: 'compact', label: 'Minimal'},
        {val: 'normal', label: 'Simple'},
        {val: 'large', label: 'Detailed'}
    ]
};

//Motori di ricerca
const SEARCH_ENGINES = {
    google: { url: "https://www.google.com/search", name: "GOOGLE", logo: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" },
    bing: { url: "https://www.bing.com/search", name: "BING", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Bing_logo_%282016%29.svg" },
    duckduckgo: { url: "https://duckduckgo.com/", name: "DUCKDUCKGO", logo: "https://duckduckgo.com/assets/logo_header.v108.svg" },
    ecosia: { url: "https://www.ecosia.org/search", name: "ECOSIA", logo: "https://cdn.ecosia.org/assets/images/ico/favicon.ico" }
};

// wallpapers
const WALLPAPERS = {
    space: { url: "https://img.goodfon.com/original/1920x1080/3/88/ian-smith-by-ian-smith-planet-earth-earth-planet-space-art-1.jpg", credit: "Ian Smith" },
    sea: { url: "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=1920", credit: "Pexels" },
    mountain: { url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920", credit: "Pexels" }
};

//SETTINGS DEFAULT
const DEFAULT_SETTINGS = {
    engine: 'google', showTitles: false, snapGrid: true,
    interfaceTheme: 'dark', accentColor: '#00f3ff', winOpacity: 85,
    bgMode: 'space', bgSolidColor: '#000000', bgCustomUrl: '',
    weatherMode: 'auto', weatherCity: 'Rome',
    noteFont: 'inherit', noteSize: '1.1em', shardRefreshRate: 10 
};

function initDesktop() {
    loadSettings(); 
    
    chrome.storage.local.get(['portals', 'shards', 'widgets'], (res) => {
        (res.portals || []).forEach(p => createPortalWindow(p));
        (res.shards || []).forEach(s => createShardWindow(s));
        
        let widgets = res.widgets || [];
        
        if (widgets.length === 0 && (!res.portals && !res.shards)) {
            const defaultSearch = { 
                id: Date.now(), type: 'search', subtype: 'classic', 
                x: (window.innerWidth/2)-250, y: 150, w: 500, h: 120 
            };
            widgets.push(defaultSearch);
            chrome.storage.local.set({widgets: widgets});
        }
        
        widgets.forEach(w => createWidgetWindow(w));
    });

    setupSettingsLogic();
    setupEditMode();
    setupAddModal();
}

function setupEditMode() {
    const editBtn = document.getElementById('edit-btn');
    if(editBtn) editBtn.addEventListener('click', () => {
        document.body.classList.toggle('edit-mode');
        editBtn.classList.toggle('active');
    });
}

//Widget creation
function createWidgetWindow(data) {
    const win = document.createElement('div'); win.className = 'window';
    win.id = `widget-${data.id}`;
    win.style.left = (data.x||100)+'px'; win.style.top = (data.y||100)+'px';
    win.style.width = (data.w||250)+'px'; win.style.height = (data.h||200)+'px'; win.style.zIndex=zIndexCounter++;
    
    let title = "Widget";
    if(data.type==='search') title = "SEARCH BAR";
    if(data.type==='clock') title = "CLOCK";
    if(data.type==='weather') title = "WEATHER";
    if(data.type==='battery') title = "POWER";
    if(data.type==='todo') title = "TO-DO LIST";
    if(data.type==='spotify') title = "SPOTIFY";
    
    win.innerHTML = `
        <div class="title-bar"><span class="title-text">${title}</span><button class="close-btn" id="close-${data.id}"></button></div>
        <div class="content-area widget-content" id="content-${data.id}" data-type="${data.type}" data-sub="${data.subtype}" data-tz="${data.timezone||'local'}"></div>
        <div class="resize-handle"></div>
    `;
    document.getElementById('desktop').appendChild(win);
    
    win.querySelector(`#close-${data.id}`).addEventListener('mousedown',(e)=>{
        e.stopPropagation(); 
        if(confirm("Remove this widget?")) {
            deleteItem('widgets', data.id); win.remove();
        }
    });
    
    makeInteractive(win, data.id, 'widgets');
    updateSingleWidget(document.getElementById(`content-${data.id}`), true);
}

//FUNZIONE PORTALI (IFRAME)
function createPortalWindow(data) {
    const win = document.createElement('div'); win.className = 'window portal-window';
    win.id = `portal-${data.id}`;
    win.style.left = (data.x||100)+'px'; win.style.top = (data.y||100)+'px';
    win.style.width = (data.w||400)+'px'; win.style.height = (data.h||300)+'px'; 
    win.style.zIndex = zIndexCounter++;

    win.innerHTML = `
        <div class="title-bar"><span class="title-text">Website</span><button class="close-btn" id="close-p-${data.id}"></button></div>
        <div class="content-area" style="padding:0; overflow:hidden; position:relative;">
            <div class="iframe-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none;"></div>
            <iframe src="${data.url}" style="width:100%; height:100%; border:none;"></iframe>
        </div>
        <div class="resize-handle"></div>
    `;
    document.getElementById('desktop').appendChild(win);

    const overlay = win.querySelector('.iframe-overlay');
    const titleBar = win.querySelector('.title-bar');
    
    titleBar.addEventListener('mousedown', () => { overlay.style.display = 'block'; });
    document.addEventListener('mouseup', () => { overlay.style.display = 'none'; });

    win.querySelector(`#close-p-${data.id}`).addEventListener('mousedown',(e)=>{
        e.stopPropagation(); 
        if(confirm("Close Portal?")) { 
            deleteItem('portals', data.id); win.remove(); 
        }
    });

    makeInteractive(win, data.id, 'portals');
}

//Creare shard (DATI SALVATI)
function createShardWindow(data) {
    const win = document.createElement('div'); win.className = 'window shard-window';
    win.id = `shard-${data.id}`;
    win.style.left = (data.x||100)+'px'; win.style.top = (data.y||100)+'px';
    win.style.width = (data.w||250)+'px'; win.style.height = (data.h||150)+'px'; 
    win.style.zIndex = zIndexCounter++;

    win.innerHTML = `
        <div class="title-bar"><span class="title-text">SHARD</span><button class="close-btn" id="close-s-${data.id}"></button></div>
        <div class="content-area" id="shard-content-${data.id}" style="display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;">
            <div class="shard-value" style="font-size:1.5em; font-weight:bold;">loading...</div>
            <div class="shard-label" style="font-size:0.8em; opacity:0.7;">${data.url ? new URL(data.url).hostname : 'Data'}</div>
        </div>
        <div class="resize-handle"></div>
    `;
    document.getElementById('desktop').appendChild(win);

    win.querySelector(`#close-s-${data.id}`).addEventListener('mousedown',(e)=>{
        e.stopPropagation(); 
        if(confirm("Delete Shard?")) { 
            deleteItem('shards', data.id); win.remove(); 
        }
    });

    makeInteractive(win, data.id, 'shards');
    updateSingleShard(data);
}

function updateSingleShard(data) {
    const el = document.querySelector(`#shard-content-${data.id} .shard-value`);
    const label = document.querySelector(`#shard-content-${data.id} .shard-label`);
    if(!el) return;
    
    if(!data.url) {
         if(data.text) el.innerText = data.text;
         return;
    }

    chrome.runtime.sendMessage({ action: "fetchUrl", url: data.url }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Errore runtime:", chrome.runtime.lastError);
            return;
        }

        if (response && response.success) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.html, 'text/html');
            
            if(data.selector) {
                try {
                    const target = doc.querySelector(data.selector);
                    if(target) {
                        let text = target.innerText.replace(/\s+/g, ' ').trim();
                        if(text.length > 50) text = text.substring(0, 50) + '...';
                        el.innerText = text;
                        el.style.color = "var(--accent-color)";
                        el.title = "Updated: " + new Date().toLocaleTimeString();
                        if(label) label.innerText = new URL(data.url).hostname; 
                    } else {
                        el.innerText = "Not found";
                        el.title = "The element no longer exists on the page";
                        el.style.color = "orange";
                    }
                } catch (err) {
                    console.error("Invalid selector:", data.selector, err);
                    el.innerText = "Syntax err.";
                    el.title = "The saved selector contains prohibited characters";
                    el.style.color = "red";
                }
            } else {
                el.innerText = "No Sel.";
            }
        } else {
            el.innerText = "Network err.";
        }
    });
}

function updateAllShards() {
    chrome.storage.local.get(['shards'], (res) => {
        (res.shards || []).forEach(s => updateSingleShard(s));
    });
}

function updateDynamicWidgets() {
    document.querySelectorAll('.widget-content').forEach(el => {
        if(el.dataset.type !== 'search') updateSingleWidget(el, false);
    });
}

function updateSingleWidget(el, forceRender) {
    if(!el) return;
    const type = el.dataset.type;
    const sub = el.dataset.sub;
    const tz = el.dataset.tz || 'local';

    //Cerca widget
    if (type === 'search') {
        if (!forceRender && el.innerHTML !== "") return;
        chrome.storage.local.get(['settings'], res => {
            const s = res.settings || DEFAULT_SETTINGS;
            const eng = SEARCH_ENGINES[s.engine] || SEARCH_ENGINES['google'];
            let html = `<div class="search-widget-container search-${sub}">`;
            let form = `<form action="${eng.url}" method="get" style="width:100%;display:flex;justify-content:center;flex-direction:column;align-items:center;">
                        <input type="text" name="q" placeholder="Search on ${eng.name}..." autocomplete="off">
                        </form>`;

            if (sub === 'classic') html += `<img src="${eng.logo}" alt="Logo">` + form;
            else if (sub === 'minimal') html += form;
            else if (sub === 'glass') html += form;
            
            html += `</div>`;
            el.innerHTML = html;
        });
        return;
    }

    //clock
    const now = new Date();
    let dateObj = now;
    let tzLabel = "";
    
    if (tz !== 'local') {
        const strTime = now.toLocaleString("en-US", {timeZone: tz});
        dateObj = new Date(strTime);
        tzLabel = `<div class="timezone-label">${tz.split('/')[1] || tz}</div>`;
    }

    if (type === 'clock') {
        if (sub === 'digital') {
            const h = dateObj.getHours().toString().padStart(2,'0');
            const m = dateObj.getMinutes().toString().padStart(2,'0');
            el.innerHTML = `<div class="clock-digital">${h}:${m}</div>${tzLabel}`;
        } else if (sub === 'matrix') {
            el.innerHTML = `<div class="clock-matrix">${Date.now().toString().slice(-10)}</div><div class="data-label">UNIX TIMESTAMP</div>`;
        } else {
            const hDeg = (dateObj.getHours() % 12) * 30 + dateObj.getMinutes() * 0.5;
            const mDeg = dateObj.getMinutes() * 6;
            const sDeg = dateObj.getSeconds() * 6;
            el.innerHTML = `<div class="analog-face"><div class="hand hour" style="transform: rotate(${hDeg}deg)"></div><div class="hand min" style="transform: rotate(${mDeg}deg)"></div><div class="hand sec" style="transform: rotate(${sDeg}deg)"></div></div>${tzLabel}`;
        }
    } 
    //To do list
    else if (type === 'todo') {
        const widgetId = parseInt(el.id.replace('content-', ''));
        chrome.storage.local.get(['widgets', 'settings'], res => {
            const list = res.widgets || [];
            const userSettings = res.settings || {}; 
            const showDeleteBtn = userSettings.todoShowDelete !== false; 
            const showDateText = userSettings.todoShowDate !== false;

            const target = list.find(w => w.id === widgetId);
            let tasks = (target && target.tasks) ? target.tasks : [];

            const total = tasks.length;
            const doneCount = tasks.filter(t => t.done).length;
            const progressPerc = total === 0 ? 0 : Math.round((doneCount / total) * 100);

            let headerHtml = '';
            if (sub === 'standard') {
                headerHtml = `<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom: 8px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; color: var(--accent-color);"><span>Active: ${total - doneCount}</span><span>${doneCount}/${total} ✔️</span></div>`;
            } else if (sub === 'detailed') {
                headerHtml = `<div style="margin-bottom: 12px;"><div style="display:flex; justify-content:space-between; font-size: 0.85em; margin-bottom: 6px; color: #bbb;"><span>Progress: ${progressPerc}%</span><span>${doneCount} su ${total}</span></div><div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;"><div style="width: ${progressPerc}%; height: 100%; background: var(--accent-color); transition: width 0.4s ease-out;"></div></div></div>`;
            }

            let tasksHtml = tasks.map((t, index) => {
                const dateStr = (showDateText && t.date) ? `<div style="font-size: 0.7em; color: #888; margin-top: 3px;">Added: ${t.date}</div>` : '';
                const deleteBtnHtml = showDeleteBtn ? `<button class="delete-task-btn" data-index="${index}" title="Delete" style="background:transparent; border:none; color: #ff5555; cursor:pointer; font-weight:bold; font-size: 1.1em; opacity: 0.5; transition: opacity 0.2s;">✕</button>` : '';
                return `<div style="display: flex; align-items: flex-start; margin-bottom: 8px; gap: 10px; padding: 8px; background: rgba(0,0,0,0.25); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); transition: opacity 0.2s;"><input type="checkbox" class="todo-chk" data-index="${index}" ${t.done ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; margin-top: 2px; accent-color: var(--accent-color);"><div style="flex: 1; display:flex; flex-direction:column;"><span style="font-size: 0.95em; text-decoration: ${t.done ? 'line-through' : 'none'}; opacity: ${t.done ? '0.4' : '1'}; word-break: break-word; transition: all 0.2s;">${t.text}</span>${dateStr}</div>${deleteBtnHtml}</div>`;
            }).join('');
            
            if(tasks.length === 0) tasksHtml = `<div style="text-align:center; opacity:0.4; margin-top:30px; font-style:italic; font-size: 0.9em;">There's nothing yet...</div>`;

            el.innerHTML = `<div style="display: flex; flex-direction: column; width: 100%; height: 100%; color: var(--text-color); box-sizing: border-box; padding: 12px;">${headerHtml}<div class="task-list-container" style="flex: 1; overflow-y: auto; margin-bottom: 12px; padding-right: 5px;">${tasksHtml}</div><input type="text" class="new-task-input" placeholder="+ New Activity" style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: rgba(0,0,0,0.4); color: var(--text-color); font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.2s;"></div>`;

            el.addEventListener('mousedown', (e) => { if(!document.body.classList.contains('edit-mode')) e.stopPropagation(); });

            el.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('mouseover', () => btn.style.opacity = '1');
                btn.addEventListener('mouseout', () => btn.style.opacity = '0.5');
            });
            const inputEl = el.querySelector('.new-task-input');
            inputEl.addEventListener('focus', () => inputEl.style.borderColor = 'var(--accent-color)');
            inputEl.addEventListener('blur', () => inputEl.style.borderColor = 'rgba(255,255,255,0.15)');

            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && inputEl.value.trim() !== '') {
                    const now = new Date();
                    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    tasks.push({ text: inputEl.value.trim(), done: false, date: timeString });
                    target.tasks = tasks;
                    chrome.storage.local.set({ widgets: list }, () => updateSingleWidget(el, true));
                }
            });

            el.querySelectorAll('.todo-chk').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    tasks[idx].done = e.target.checked;
                    target.tasks = tasks;
                    chrome.storage.local.set({ widgets: list }, () => updateSingleWidget(el, true));
                });
            });

            el.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    tasks.splice(idx, 1);
                    target.tasks = tasks;
                    chrome.storage.local.set({ widgets: list }, () => updateSingleWidget(el, true));
                });
            });
        });
    }
    //Battery
    else if (type === 'battery') {
        if(navigator.getBattery) {
            navigator.getBattery().then(bat => {
                const level = Math.round(bat.level * 100);
                const isCharging = bat.charging;
                if (sub === 'bar') el.innerHTML = `<div class="icon-large">${isCharging?'⚡':'🔋'}</div><div class="battery-container"><div class="battery-level" style="width:${level}%"></div></div><div class="data-value" style="font-size:1.5em; margin-top:5px">${level}%</div>`;
                else if (sub === 'circle') {
                    const dash = 251 - (251 * level) / 100;
                    el.innerHTML = `<div class="battery-circle"><svg><circle cx="40" cy="40" r="35" style="stroke-dashoffset:${dash}"></circle></svg><span style="position:absolute; font-weight:bold; font-size:1.2em">${level}%</span></div><div class="data-label">${isCharging?'CHARGE':'DRAIN'}</div>`;
                } else el.innerHTML = `<div class="data-value" style="font-size:3em">${level}%</div><div class="data-label">${isCharging ? 'Charging' : 'Battery'}</div>`;
            });
        }
    }
    //note text
    else if (type === 'note') {
        if (!forceRender && el.innerHTML !== "") return; 
        const widgetId = parseInt(el.id.replace('content-', ''));
        
        let bg = 'transparent'; let color = 'var(--text-color)';
        if (sub === 'yellow') { bg = '#fdfd96'; color = '#000'; }
        if (sub === 'blue') { bg = '#aec6cf'; color = '#000'; }
        if (sub === 'pink') { bg = '#ffb7b2'; color = '#000'; }
        if (sub === 'green') { bg = '#c8e6c9'; color = '#000'; }
        
        const win = el.parentElement;
        const titleTextEl = win.querySelector('.title-text'); 
        
        if (sub !== 'default') {
            win.style.background = bg; win.style.borderColor = bg;
            const titleBar = win.querySelector('.title-bar');
            if(titleBar) { titleBar.style.background = 'rgba(0,0,0,0.1)'; titleBar.style.borderBottom = '1px solid rgba(0,0,0,0.1)'; if(titleTextEl) titleTextEl.style.color = '#333'; }
        }

        chrome.storage.local.get(['widgets', 'settings'], res => {
            const list = res.widgets || [];
            const wData = list.find(w => w.id === widgetId);
            const text = (wData && wData.text) ? wData.text : '';
            const s = res.settings || DEFAULT_SETTINGS;
            const nFont = s.noteFont || 'inherit'; const nSize = s.noteSize || '1.1em';

            const updateTitle = (htmlContent) => {
                if(!titleTextEl) return;
                let tmp = document.createElement('div'); tmp.innerHTML = htmlContent; 
                let firstLine = tmp.innerText.split('\n')[0].trim();
                let displayTitle = firstLine !== "" ? firstLine : "NOTE";
                if(displayTitle.length > 18) displayTitle = displayTitle.substring(0,18) + "...";
                titleTextEl.innerText = displayTitle.toUpperCase();
            };
            updateTitle(text);

            el.innerHTML = `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; background:transparent; border:none; color:${color}; outline:none; font-family:${nFont}; font-size:${nSize}; text-align:left; padding:5px; box-sizing:border-box; overflow-y:auto; word-break:break-word;">${text}</div>`;
            
            const editor = el.querySelector('div[contenteditable]');
            editor.addEventListener('input', (e) => {
                const newText = e.target.innerHTML;
                updateTitle(newText);
                chrome.storage.local.get(['widgets'], r => {
                    const wList = r.widgets || [];
                    const target = wList.find(w => w.id === widgetId);
                    if (target) { target.text = newText; chrome.storage.local.set({ widgets: wList }); }
                });
            });
            editor.addEventListener('mousedown', (e) => { if(!document.body.classList.contains('edit-mode')) { e.stopPropagation(); } });
        });
    }
    //weather
    else if (type === 'weather') {
        const lastUp = parseInt(el.dataset.lastUpdate || 0);
        if (Date.now() - lastUp > 60000) { 
            el.dataset.lastUpdate = Date.now();
            fetchWeather(el, sub);
        }
    }
    //SPOTIFY
    else if (type === 'spotify') {
        if (!forceRender && el.innerHTML !== "") return;
        const widgetId = parseInt(el.id.replace('content-', ''));
        
        chrome.storage.local.get(['widgets'], res => {
            const list = res.widgets || [];
            const wData = list.find(w => w.id === widgetId);
            const inputUrl = (wData && wData.spotifyUrl) ? wData.spotifyUrl : '';

            // Genera il vero URL Embed di Spotify (funzione helper)
            const embedUrl = formatSpotifyEmbedUrl(inputUrl);

            let iframeHeight = '152px'; 
            if (sub === 'normal') iframeHeight = '352px';
            if (sub === 'large') iframeHeight = '100%';

            el.style.alignItems = 'stretch';
            el.style.padding = '0';

            el.innerHTML = `
                 <iframe style="border-radius:12px; border:none; width:100%; height:${iframeHeight};" src="${embedUrl}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                 <div class="iframe-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none;z-index:10;"></div>
            `;
            
            const win = el.parentElement;
            const overlay = win.querySelector('.iframe-overlay');
            const titleBar = win.querySelector('.title-bar');
            if(titleBar && overlay) {
                titleBar.addEventListener('mousedown', () => { overlay.style.display = 'block'; });
                document.addEventListener('mouseup', () => { overlay.style.display = 'none'; });
            }
        });
    }
}

//Logica weather
function fetchWeather(el, sub) {
    chrome.storage.local.get(['settings'], (res) => {
        const s = res.settings || DEFAULT_SETTINGS;
        const doFetch = (lat, lon, cityLabel) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            fetch(url).then(r=>r.json()).then(d => {
                if(!d.current_weather) return;
                const w = d.current_weather; const temp = Math.round(w.temperature); const code = w.weathercode;
                let icon = '☀️'; if (code > 3) icon = '⛅'; if (code > 50) icon = '🌧️'; if (code > 70) icon = '❄️'; if (code > 95) icon = '⛈️';
                
                if (sub === 'minimal') el.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:3em">${icon}</span><span class="data-value">${temp}°</span></div><div class="data-label">${cityLabel}</div>`;
                else if (sub === 'detailed') el.innerHTML = `<div style="display:flex;justify-content:space-between;width:80%"><div><div class="icon-large">${icon}</div></div><div><div class="data-value">${temp}°</div></div></div><div class="data-label" style="text-align:left;width:80%;margin-top:10px">📍 ${cityLabel}<br>💨 Wind: ${w.windspeed}</div>`;
                else el.innerHTML = `<div class="icon-large">${icon}</div><div class="data-value">${temp}°</div><div class="data-label">${cityLabel}</div>`;
            }).catch(() => el.innerHTML = "Err Dati");
        };

        if (s.weatherMode === 'manual' && s.weatherCity) {
            fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${s.weatherCity}&count=1`).then(r=>r.json()).then(geo => {
                if(geo.results && geo.results.length > 0) doFetch(geo.results[0].latitude, geo.results[0].longitude, geo.results[0].name);
                else el.innerHTML = "Unknown city";
            });
        } else {
            if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => doFetch(pos.coords.latitude, pos.coords.longitude, "Local"), () => el.innerHTML = "No GPS");
            else el.innerHTML = "No GPS";
        }
    });
}

//DRAG & DROP e resize
function makeInteractive(el, id, type) {
    const h = el.querySelector('.title-bar');
    const r = el.querySelector('.resize-handle');
    
    el.onmousedown=()=>el.style.zIndex=++zIndexCounter;
    
    if(h) {
        h.onmousedown = (e) => {
            if(!document.body.classList.contains('edit-mode') || e.target.tagName==='BUTTON') return;
            e.preventDefault();
            const rect=el.getBoundingClientRect(), sX=e.clientX-rect.left, sY=e.clientY-rect.top;
            const snap = document.getElementById('set-snap-grid') && document.getElementById('set-snap-grid').checked;
            
            const onMove=(ev)=>{
                let l = ev.pageX-sX, t = ev.pageY-sY;
                if(snap) { l=Math.round(l/20)*20; t=Math.round(t/20)*20; }
                el.style.left=l+'px'; el.style.top=t+'px';
            };
            document.addEventListener('mousemove',onMove);
            document.onmouseup=()=>{ document.removeEventListener('mousemove',onMove); document.onmouseup=null; saveState(id,type,el); };
        };
    }
    if(r) {
        r.onmousedown = (e) => {
            if(!document.body.classList.contains('edit-mode')) return;
            e.stopPropagation(); e.preventDefault();
            const sX=e.clientX, sY=e.clientY, sW=el.offsetWidth, sH=el.offsetHeight;
            const onMove=(ev)=>{ el.style.width=(sW+ev.clientX-sX)+'px'; el.style.height=(sH+ev.clientY-sY)+'px'; };
            document.documentElement.addEventListener('mousemove',onMove);
            document.documentElement.addEventListener('mouseup',()=>{
                document.documentElement.removeEventListener('mousemove',onMove); saveState(id,type,el);
            }, {once:true});
        };
    }
}
function saveState(id,type,el){
    const st={x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight};
    chrome.storage.local.get([type],r=>{
        const list=r[type]||[]; const i=list.find(x=>x.id===id);
        if(i){ Object.assign(i,st); chrome.storage.local.set({[type]:list}); }
    });
}
function deleteItem(t,id){ chrome.storage.local.get([t],r=>{ chrome.storage.local.set({[t]:(r[t]||[]).filter(i=>i.id!==id)}); }); }

//SETTINGS
function loadSettings() {
    chrome.storage.local.get(['settings'], (res) => { applySettings({ ...DEFAULT_SETTINGS, ...(res.settings || {}) }); });
}

function applySettings(s) {
    const root = document.documentElement;
    const body = document.body;
    
    const eng = SEARCH_ENGINES[s.engine] || SEARCH_ENGINES['google'];
    document.querySelectorAll('[data-type="search"] input').forEach(i => i.placeholder = `Search on ${eng.name}...`);
    document.querySelectorAll('[data-type="search"] form').forEach(f => f.action = eng.url);
    document.querySelectorAll('[data-type="search"] img').forEach(img => img.src = eng.logo);

    body.classList.remove('theme-dark', 'theme-light', 'theme-transparent');
    body.classList.add('theme-' + s.interfaceTheme);

    root.style.setProperty('--accent-color', s.accentColor);
    root.style.setProperty('--win-bg', s.interfaceTheme==='transparent' ? 'rgba(0,0,0,0.01)' : (s.interfaceTheme==='light' ? `rgba(255,255,255,${s.winOpacity/100})` : `rgba(21,21,21,${s.winOpacity/100})`));
    root.style.setProperty('--text-color', s.interfaceTheme==='light' ? '#000' : '#e0e0e0');
    root.style.setProperty('--title-bg', s.interfaceTheme==='light' ? '#e0e0e0' : (s.interfaceTheme==='transparent'?'transparent':'#1a1a1a'));
    
    if (s.bgMode === 'color') { body.style.backgroundImage = 'none'; body.style.backgroundColor = s.bgSolidColor; }
    else if (s.bgMode === 'custom') body.style.backgroundImage = `url('${s.bgCustomUrl}')`;
    else if (WALLPAPERS[s.bgMode]) body.style.backgroundImage = `url('${WALLPAPERS[s.bgMode].url}')`;

    if (!s.showTitles) body.classList.add('clean-view'); else body.classList.remove('clean-view');
    //TIMER SHARD
    let ms = parseInt(s.shardRefreshRate, 10) * 1000;
    
    if (isNaN(ms) || ms < 1000) ms = 10000; 
    
    if (shardUpdateInterval) { clearInterval(shardUpdateInterval); }
    //Nuovo ciclo
    shardUpdateInterval = setInterval(() => { updateAllShards(); }, ms);
    console.log("⏱️ Timer Shard impostato a:", ms / 1000, "secondi");
}

function setupSettingsLogic() {
    const modal = document.getElementById('settings-modal');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active'); document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
    document.getElementById('settings-btn').addEventListener('click', () => { modal.style.display='flex'; populateSettings(); });
    document.getElementById('close-settings').addEventListener('click', () => { modal.style.display='none'; saveSettings(); });
    
    const inputs = ['set-engine','set-show-titles','set-snap-grid','set-interface-theme','set-accent-color','set-win-opacity','set-bg-mode','set-solid-color','set-bg-url','set-weather-mode','set-weather-city', 'set-note-font', 'set-note-size','shard-refresh-rate'];
    inputs.forEach(id=>{ if(document.getElementById(id)) document.getElementById(id).addEventListener('input', saveSettings); });
    
    document.getElementById('btn-reset').addEventListener('click', () => { if(confirm("Start over? This action will delete all your widgets and layouts. Make sure you have made a backup from the settings.")) chrome.storage.local.clear(() => location.reload()); });

    const applyWidgetBtn = document.getElementById('apply-widget-settings');
    if (applyWidgetBtn) { applyWidgetBtn.addEventListener('click', () => { saveSettings(); window.location.reload(); }); }
}

function getSettings() {
    return {
        engine: document.getElementById('set-engine').value, 
        showTitles: document.getElementById('set-show-titles').checked,
        snapGrid: document.getElementById('set-snap-grid').checked, 
        interfaceTheme: document.getElementById('set-interface-theme').value,
        accentColor: document.getElementById('set-accent-color').value, 
        winOpacity: document.getElementById('set-win-opacity').value,
        bgMode: document.getElementById('set-bg-mode').value, 
        bgSolidColor: document.getElementById('set-solid-color').value, 
        bgCustomUrl: document.getElementById('set-bg-url').value,
        weatherMode: document.getElementById('set-weather-mode').value, 
        weatherCity: document.getElementById('set-weather-city').value,
        noteFont: document.getElementById('set-note-font') ? document.getElementById('set-note-font').value : 'inherit',
        noteSize: document.getElementById('set-note-size') ? document.getElementById('set-note-size').value : '1.1em',
        todoShowDelete: document.getElementById('setting-todo-delete') ? document.getElementById('setting-todo-delete').value === "true" : true,
        todoShowDate: document.getElementById('setting-todo-date') ? document.getElementById('setting-todo-date').value === "true" : true,
        shardRefreshRate: document.getElementById('shard-refresh-rate') ? parseInt(document.getElementById('shard-refresh-rate').value, 10) : 10
    };
}

function saveSettings() { 
    const s = getSettings(); 
    chrome.storage.local.set({settings: s}); 
    applySettings(s); 
    handleUiVis(s); 
}
function populateSettings() {
    chrome.storage.local.get(['settings'], res => {
        const s = { ...DEFAULT_SETTINGS, ...(res.settings || {}) };
        if(document.getElementById('setting-todo-delete')) document.getElementById('setting-todo-delete').value = s.todoShowDelete !== false ? "true" : "false";
        if(document.getElementById('setting-todo-date')) document.getElementById('setting-todo-date').value = s.todoShowDate !== false ? "true" : "false";
        if(document.getElementById('set-engine')) document.getElementById('set-engine').value = s.engine; 
        if(document.getElementById('set-show-titles')) document.getElementById('set-show-titles').checked = s.showTitles;
        if(document.getElementById('set-snap-grid')) document.getElementById('set-snap-grid').checked = s.snapGrid; 
        if(document.getElementById('set-interface-theme')) document.getElementById('set-interface-theme').value = s.interfaceTheme;
        if(document.getElementById('set-accent-color')) document.getElementById('set-accent-color').value = s.accentColor; 
        if(document.getElementById('set-win-opacity')) document.getElementById('set-win-opacity').value = s.winOpacity;
        if(document.getElementById('set-bg-mode')) document.getElementById('set-bg-mode').value = s.bgMode; 
        if(document.getElementById('set-solid-color')) document.getElementById('set-solid-color').value = s.bgSolidColor;
        if(document.getElementById('set-bg-url')) document.getElementById('set-bg-url').value = s.bgCustomUrl; 
        if(document.getElementById('set-weather-mode')) document.getElementById('set-weather-mode').value = s.weatherMode;
        if(document.getElementById('set-weather-city')) document.getElementById('set-weather-city').value = s.weatherCity || '';
        if(document.getElementById('set-note-font')) document.getElementById('set-note-font').value = s.noteFont || 'inherit';
        if(document.getElementById('set-note-size')) document.getElementById('set-note-size').value = s.noteSize || '1.1em';
        handleUiVis(s);
        if(document.getElementById('shard-refresh-rate')) document.getElementById('shard-refresh-rate').value = s.shardRefreshRate || 10;
        handleUiVis(s);
    });
}

function handleUiVis(s) {
    if(document.getElementById('solid-color-row')) document.getElementById('solid-color-row').style.display = (s.bgMode==='color')?'flex':'none';
    if(document.getElementById('custom-bg-row')) document.getElementById('custom-bg-row').style.display = (s.bgMode==='custom')?'flex':'none';
    if(document.getElementById('weather-city-row')) document.getElementById('weather-city-row').style.display = (s.weatherMode==='manual')?'flex':'none';
    
    const opacRow = document.getElementById('opacity-control-row');
    const opacWarn = document.getElementById('opacity-warning-row');
    if (s.interfaceTheme === 'transparent') {
        if(opacRow) opacRow.style.display = 'none';
        if(opacWarn) opacWarn.style.display = 'block';
    } else {
        if(opacRow) opacRow.style.display = 'flex';
        if(opacWarn) opacWarn.style.display = 'none';
    }
}

// Icone
const WIDGET_TYPES_UI = [
    { id: 'search', label: 'Search bar', icon: 'fas fa-search' },
    { id: 'clock', label: 'Clock', icon: 'far fa-clock' },
    { id: 'weather', label: 'Weather', icon: 'fas fa-cloud-sun' },
    { id: 'battery', label: 'Battery', icon: 'fas fa-battery-half' },
    { id: 'note', label: 'Notes', icon: 'far fa-sticky-note' },
    { id: 'todo', label: 'To-Do List', icon: 'fas fa-tasks' },
    { id: 'spotify', label: 'Spotify', icon: 'fas fa-music' }
];

function setupAddModal() {
    const modal = document.getElementById('add-modal');
    const tabs = document.querySelectorAll('.add-opt-btn');
    const sections = document.querySelectorAll('.input-group');
    
    //Elementi Grid
    const typeGrid = document.getElementById('widget-type-grid');
    const styleGrid = document.getElementById('widget-style-grid');
    const styleSection = document.getElementById('widget-style-section');
    
    const wTzBox = document.getElementById('widget-timezone-box');
    const wTzSel = document.getElementById('widget-timezone-select');
    const spotBox = document.getElementById('widget-spotify-box');

    let currentType = null;
    let currentSubtype = null;

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('selected')); sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('selected'); document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    //Grid dei Tipi di Widget
    if (typeGrid) {
        typeGrid.innerHTML = '';
        WIDGET_TYPES_UI.forEach(type => {
            const card = document.createElement('div');
            card.className = 'grid-card';
            card.dataset.value = type.id;
            card.innerHTML = `<i class="${type.icon}"></i><span>${type.label}</span>`;
            
            card.addEventListener('click', () => {
                typeGrid.querySelectorAll('.grid-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                currentType = type.id;
                renderSubtypes(type.id);
            });
            typeGrid.appendChild(card);
        });
        //Seleziona il primo widget di default
        setTimeout(() => { if(typeGrid.firstChild) typeGrid.firstChild.click(); }, 10);
    }

    //Genera Grid stili
    function renderSubtypes(typeId) {
        if (!styleGrid) return;
        styleGrid.innerHTML = '';
        const varianti = WIDGET_VARIANTS[typeId] || [];
        
        if (varianti.length > 0) {
            styleSection.style.display = 'block';
            varianti.forEach((opt, idx) => {
                const card = document.createElement('div');
                card.className = 'grid-card';
                card.dataset.value = opt.val;
                
                // Aggiunge colore 
                if(typeId === 'note' && opt.val !== 'default') card.dataset.color = opt.val;
                
                card.innerHTML = `<span>${opt.label}</span>`;
                
                if (idx === 0) { card.classList.add('selected'); currentSubtype = opt.val; }
                
                card.addEventListener('click', () => {
                    styleGrid.querySelectorAll('.grid-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    currentSubtype = opt.val;
                });
                styleGrid.appendChild(card);
            });
        } else {
            styleSection.style.display = 'none';
            currentSubtype = null;
        }

        // Mostra/Nascondi input 
        if(wTzBox) wTzBox.style.display = (typeId === 'clock') ? 'block' : 'none';
        if(spotBox) spotBox.style.display = (typeId === 'spotify') ? 'block' : 'none';
    }

    document.getElementById('add-btn').addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('cancel-add-btn').addEventListener('click', () => modal.style.display = 'none');

    //Conferma 

    const oldConfirmBtn = document.getElementById('confirm-add-btn');
    const newConfirmBtn = oldConfirmBtn.cloneNode(true);
    oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        const mode = document.querySelector('.add-opt-btn.selected').dataset.target;
        
        if (mode === 'opt-portal') {
            const raw = document.getElementById('new-url-input').value.trim();
            if(raw) createPortalWindow({ id: Date.now(), x: 150, y: 150, w: 400, h: 300, url: raw.startsWith('http')?raw:'https://'+raw });
        } 
        else if (mode === 'opt-shard') {
            const url = document.getElementById('new-shard-url').value.trim();
            const sel = document.getElementById('new-shard-sel').value.trim();
            if(url && sel) createShardWindow({ id: Date.now(), x: 150, y: 150, w: 250, h: 150, url: url.startsWith('http')?url:'https://'+url, selector: sel, text: '...' });
        } 
        else if (mode === 'opt-widget') {
            const type = currentType;
            const subtype = currentSubtype;
            if(!type) return;

            let w = 250, h = 200;
            if(type === 'search') { w=400; h=100; }
            if(type === 'clock') { w=200; h=200; }
            if(type === 'todo') { w=300; h=350; }
            
            let spotUrl = "";
            const spotInput = document.getElementById('widget-spotify-url');
            if(spotInput) spotUrl = spotInput.value.trim();

            if(type === 'spotify') { 
                w = 300; 
                h = (subtype === 'compact') ? 180 : (subtype === 'normal' ? 400 : 500); 
            }
            
            const newWidget = { 
                id: Date.now(), type: type, subtype: subtype, 
                timezone: wTzSel ? wTzSel.value : 'local', spotifyUrl: spotUrl,
                x: 150, y: 150, w: w, h: h 
            };
            
            chrome.storage.local.get(['widgets'], r => {
                const list = r.widgets || []; list.push(newWidget);
                chrome.storage.local.set({widgets: list}, () => createWidgetWindow(newWidget));
            });
        }
        modal.style.display = 'none';
        
        // Helper
        function createPortalWindow(d){ saveItem('portals',d); window.createPortalWindow?window.createPortalWindow(d):location.reload(); }
        function createShardWindow(d){ saveItem('shards',d); window.createShardWindow?window.createShardWindow(d):location.reload(); }
        function saveItem(k,d){ chrome.storage.local.get([k],r=>{ const l=r[k]||[]; l.push(d); chrome.storage.local.set({[k]:l}); }); }
    }); 
}
