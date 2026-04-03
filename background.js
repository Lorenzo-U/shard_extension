chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // SaveShard
    if (request.action === "saveShard") {
        chrome.storage.local.get(['shards'], (result) => {
            const shards = result.shards || [];
            shards.push({
                id: Date.now(),
                url: request.data.url,
                selector: request.data.selector,
                text: request.data.text,
                x: 200, y: 200, w: 250, h: 150
            });
            chrome.storage.local.set({ shards: shards });
        });
    }

    if (request.action === "savePortal") {
        chrome.storage.local.get(['portals'], (result) => {
            const portals = result.portals || [];
            portals.push({
                id: Date.now(),
                url: request.data.url,
                x: 100, y: 100, w: 500, h: 400
            });
            chrome.storage.local.set({ portals: portals });
        });
    }

    //Dati live
    if (request.action === "fetchUrl") {
        
        const timestamp = new Date().getTime();
        const urlSeparator = request.url.includes('?') ? '&' : '?';
        const urlNoCache = request.url + urlSeparator + "t=" + timestamp;

        console.log("Fetching (No Cache):", urlNoCache); 

        fetch(urlNoCache, {
            method: 'GET',
            cache: 'no-store', 
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Network err: ' + response.status);
                return response.text();
            })
            .then(data => {
                sendResponse({ success: true, html: data });
            })
            .catch(error => {
                console.error("Fetch background err:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});