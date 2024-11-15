document.addEventListener("DOMContentLoaded", function () {
    const recentContainer = document.querySelector("[item=destination]"); // Select the destination container by attribute
    const recentWrapper = document.querySelector("[item=parent]"); // Select the wrapper by attribute
    
    if (!recentContainer) {
        console.error("Container for recent items not found on the home page.");
        return;
    }

    // Function to render up to 3 items from the array
    function renderItems(items) {
        // Clear the container before re-rendering
        recentContainer.innerHTML = "";

        // Slice the first 3 items from the array
        items.slice(0, 3).forEach(item => {
            if (item.html && item.url) {
                const itemElement = document.createElement("div");
                itemElement.classList.add("recent-item");
                itemElement.innerHTML = item.html;

                // Add delete button functionality
                const trashIcon = itemElement.querySelector("[item=delete]"); // Select the trash icon by attribute
                if (trashIcon) {
                    trashIcon.addEventListener("click", function (e) {
                        // Prevent the default behavior if the trash icon is clicked inside a link
                        e.preventDefault();

                        // Remove the item from localStorage
                        const updatedRecentItems = items.filter(i => i.url !== item.url);
                        localStorage.setItem("recentItems", JSON.stringify(updatedRecentItems));

                        // Remove the item from the page
                        itemElement.remove();

                        // Re-render the items after deletion
                        renderItems(updatedRecentItems);
                    });
                }

                recentContainer.appendChild(itemElement);
            } else {
                console.warn("Missing HTML or URL for a recent item:", item);
            }
        });

        // Show or hide the recent items wrapper based on the number of items
        if (recentContainer.children.length > 0) {
            recentWrapper.style.display = "flex"; // Show wrapper if there are items
        } else {
            recentWrapper.style.display = "none"; // Hide wrapper if no items
        }
    }

    // Load and render items on page load
    const recentItems = JSON.parse(localStorage.getItem("recentItems")) || [];
    renderItems(recentItems);

    // Listen for updates via Broadcast Channel (if necessary)
    const broadcastChannel = new BroadcastChannel("recentItemsChannel");
    broadcastChannel.onmessage = function (event) {
        if (event.data.deleted) {
            // Handle item deletion on the home page
            const deletedUrl = event.data.url;
            const itemElements = recentContainer.querySelectorAll(".recent-item");

            itemElements.forEach(itemElement => {
                const itemUrl = itemElement.querySelector("a").href; // Assuming the item's URL is inside a link
                if (itemUrl === deletedUrl) {
                    itemElement.remove();
                }
            });
        } else {
            console.log("New recent item received:", event.data);
            // Re-render the items after adding a new one
            const updatedRecentItems = JSON.parse(localStorage.getItem("recentItems")) || [];
            renderItems(updatedRecentItems); // Re-render items in correct order, limited to 3
        }
    };
});
