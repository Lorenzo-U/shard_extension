document.addEventListener('click', function(e) {
    // Rileva Ctrl + Click (o Cmd)
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        const text = target.innerText || target.value || "Element";
        const url = window.location.href;
        const selector = getCssPath(target);

        // Mostra il Banner di Scelta
        showShardDialog(target, text, url, selector);
    }
});

function getCssPath(el) {
    if (!(el instanceof Element)) return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
        } else {
            var sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector) nth++;
            }
            if (nth != 1) selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
}

//banner
function showShardDialog(targetElement, text, url, selector) {
    // Rimuovi eventuali dialoghi vecchi
    const old = document.getElementById('shard-ui-overlay');
    if(old) old.remove();

    
    const originalOutline = targetElement.style.outline;
    targetElement.style.outline = "2px solid #00f3ff";

    //Container
    const overlay = document.createElement('div');
    overlay.id = 'shard-ui-overlay';
    
    // Stile
    overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; width: 320px;
        background: rgba(10, 10, 10, 0.95); color: #fff;
        border: 1px solid #00f3ff; border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        z-index: 2147483647; font-family: 'Segoe UI', sans-serif;
        padding: 20px; display: flex; flex-direction: column; gap: 10px;
        backdrop-filter: blur(10px); animation: shardFadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes shardFadeIn { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform:translateY(0); } }
            .shard-btn { flex: 1; padding: 10px; border: none; cursor: pointer; font-weight: bold; border-radius: 4px; transition: 0.2s; }
            .btn-shard { background: rgba(0, 243, 255, 0.1); color: #00f3ff; border: 1px solid #00f3ff; }
            .btn-shard:hover { background: #00f3ff; color: #000; }
            .btn-portal { background: transparent; color: #ccc; border: 1px solid #555; }
            .btn-portal:hover { background: #333; color: #fff; }
            .shard-close { position: absolute; top: 5px; right: 10px; background: none; border: none; color: #666; cursor: pointer; font-size: 16px; }
            .shard-preview { font-size: 12px; color: #888; background: #000; padding: 5px; border-radius: 4px; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            h3 { margin: 0 0 10px 0; font-size: 16px; color: #fff; letter-spacing: 1px; }
        </style>
        <button class="shard-close" id="shard-close-x">✕</button>
        <h3>SHARD DETECTED</h3>
        <div class="shard-preview">"${text.substring(0, 40)}..."</div>
        <div style="display:flex; gap:10px;">
            <button class="shard-btn btn-shard" id="btn-save-shard">DATA (Live)</button>
            <button class="shard-btn btn-portal" id="btn-save-portal">WEBSITE</button>
        </div>
    `;

    document.body.appendChild(overlay);

    
    document.getElementById('shard-close-x').onclick = () => closeDialog();
    
    document.getElementById('btn-save-shard').onclick = () => {
        chrome.runtime.sendMessage({
            action: "saveShard",
            data: { url: url, selector: selector, text: text }
        });
        closeDialog();
        alert("Shard saved to Dashboard!");
    };

    document.getElementById('btn-save-portal').onclick = () => {
        chrome.runtime.sendMessage({
            action: "savePortal",
            data: { url: url } 
        });
        closeDialog();
        alert("Saved in Dashboard!");
    };

    function closeDialog() {
        targetElement.style.outline = originalOutline;
        overlay.remove();
    }
}