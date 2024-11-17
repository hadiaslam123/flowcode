document.addEventListener("DOMContentLoaded", function () {
    const recentContainer = document.querySelector("[item=destination]");
    const recentWrapper = document.querySelector("[item=parent]");

    if (!recentContainer) {
        console.error("Container for recent items not found on the home page.");
        return;
    }

    function renderItems(items) {
        recentContainer.innerHTML = ""; // Clear container before rendering

        const currentTime = Date.now();

        // Filter valid items that are not expired (handle 'null' expiry as 'Infinity')
        const validItems = items.filter(item => {
            const expiry = item.expiry === null ? Infinity : item.expiry; // Treat null expiry as Infinity
            return expiry === Infinity || currentTime - item.timestamp <= expiry;
        });

        // Update localStorage with only valid items
        localStorage.setItem("recentItems", JSON.stringify(validItems));

        // Render up to 3 valid items
        validItems.slice(0, 3).forEach(item => {
            if (item.html && item.url) {
                const itemElement = document.createElement("div");
                itemElement.classList.add("recent-item");
                itemElement.innerHTML = item.html;

                // Add delete button functionality
                const trashIcon = itemElement.querySelector("[item=delete]");
                if (trashIcon) {
                    trashIcon.addEventListener("click", function (e) {
                        e.preventDefault();

                        const updatedRecentItems = validItems.filter(i => i.url !== item.url);
                        localStorage.setItem("recentItems", JSON.stringify(updatedRecentItems));
                        itemElement.remove();

                        renderItems(updatedRecentItems);
                    });
                }

                recentContainer.appendChild(itemElement);
            } else {
                console.warn("Missing HTML or URL for a recent item:", item);
            }
        });

        // Show or hide the wrapper based on content
        recentWrapper.style.display = recentContainer.children.length > 0 ? "flex" : "none";
    }

    const recentItems = JSON.parse(localStorage.getItem("recentItems")) || [];
    renderItems(recentItems);

    const broadcastChannel = new BroadcastChannel("recentItemsChannel");
    broadcastChannel.onmessage = function (event) {
        if (event.data.deleted) {
            const deletedUrl = event.data.url;
            const itemElements = recentContainer.querySelectorAll(".recent-item");

            itemElements.forEach(itemElement => {
                const itemUrl = itemElement.querySelector("a").href;
                if (itemUrl === deletedUrl) {
                    itemElement.remove();
                }
            });
        } else {
            console.log("New recent item received:", event.data);
            const updatedRecentItems = JSON.parse(localStorage.getItem("recentItems")) || [];
            renderItems(updatedRecentItems);
        }
    };
});
