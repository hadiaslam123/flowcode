document.addEventListener("DOMContentLoaded", function () {
    const recentItems = JSON.parse(localStorage.getItem("recentItems")) || [];

    // Select the first element with the attribute item="target"
    const itemElement = document.querySelector("[item=target]");
    if (!itemElement) {
        console.error("Element with attribute item=target not found.");
        return;
    }

    // Read the expiry time in days from the attribute and convert to milliseconds
    const expiryValue = parseFloat(itemElement.getAttribute("expiry"));
    const EXPIRY_TIME = isNaN(expiryValue) ? Infinity : expiryValue * 24 * 60 * 60 * 1000; // Use Infinity if expiry is not valid
    console.log(`Expiry time for this item: ${expiryValue === undefined || isNaN(expiryValue) ? 'Infinite' : expiryValue + ' days'}`);

    const itemHtml = itemElement.outerHTML;
    const itemUrl = window.location.href;
    const timestamp = Date.now(); // Current timestamp

    // Hide the target element on the current page
    itemElement.style.display = "none";

    // Avoid adding duplicate items
    const itemExists = recentItems.some(item => item.url === itemUrl);
    if (!itemExists) {
        recentItems.unshift({ html: itemHtml, url: itemUrl, timestamp, expiry: EXPIRY_TIME });

        // Save to localStorage
        localStorage.setItem("recentItems", JSON.stringify(recentItems));

        // Notify the home page about the update
        const broadcastChannel = new BroadcastChannel("recentItemsChannel");
        broadcastChannel.postMessage({ html: itemHtml, url: itemUrl });
    }

    // Add delete functionality
    const trashIcon = itemElement.querySelector("[item=delete]");
    if (trashIcon) {
        trashIcon.addEventListener("click", function () {
            const updatedRecentItems = recentItems.filter(item => item.url !== itemUrl);

            // Update localStorage
            localStorage.setItem("recentItems", JSON.stringify(updatedRecentItems));

            // Notify the home page about the update
            const broadcastChannel = new BroadcastChannel("recentItemsChannel");
            broadcastChannel.postMessage({ deleted: true, url: itemUrl });

            // Remove the item from the page
            itemElement.remove();
        });
    }
});
