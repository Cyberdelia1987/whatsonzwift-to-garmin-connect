chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ 'ftp': 275 });
})