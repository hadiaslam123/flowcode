document.addEventListener("DOMContentLoaded", function () {
    const recentItems = JSON.parse(localStorage.getItem("recentItems")) || [];

    // Select the first matching element with the attribute (it could be any element type)
    const itemElement = document.querySelector("[item=target]"); // Use the new attribute selector
    if (!itemElement) {
        console.error("Element with attribute item=target not found.");
        return;
    }

    const itemHtml = itemElement.outerHTML;
    const itemUrl = window.location.href;

    // Hide the element on the current page
    itemElement.style.display = "none";

    // Avoid adding duplicate items
    const itemExists = recentItems.some(item => item.url === itemUrl);
    if (!itemExists) {
        recentItems.unshift({ html: itemHtml, url: itemUrl });

        // Save to localStorage
        localStorage.setItem("recentItems", JSON.stringify(recentItems));

        // Notify the home page about the update
        const broadcastChannel = new BroadcastChannel("recentItemsChannel");
        broadcastChannel.postMessage({ html: itemHtml, url: itemUrl });
    }

    // Add delete functionality
    const trashIcon = itemElement.querySelector("[item=delete]"); // Use the attribute selector for trash icon
    if (trashIcon) {
        trashIcon.addEventListener("click", function () {
            // Remove the item from the recentItems array
            const updatedRecentItems = recentItems.filter(item => item.url !== itemUrl);
            
            // Update localStorage
            localStorage.setItem("recentItems", JSON.stringify(updatedRecentItems));

            // Notify the home page about the update (broadcasting the change)
            const broadcastChannel = new BroadcastChannel("recentItemsChannel");
            broadcastChannel.postMessage({ deleted: true, url: itemUrl });

            // Remove the item from the page
            itemElement.remove();
        });
    }
});
