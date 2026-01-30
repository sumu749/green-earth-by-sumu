// API Base URL
const API_BASE = "https://openapi.programming-hero.com/api";

// Sample categories for fallback
const sampleCategories = [
    { id: 1, name: "Fruit Trees" },
    { id: 2, name: "Flowering Trees" },
    { id: 3, name: "Shade Trees" },
    { id: 4, name: "Medicinal Trees" },
    { id: 5, name: "Timber Trees" },
    { id: 6, name: "Evergreen Trees" },
    { id: 7, name: "Ornamental Plants" },
    { id: 8, name: "Bamboo" },
    { id: 9, name: "Climbers" },
    { id: 10, name: "Aquatic Plants" },
];

// State
let cart = [];
let currentCategory = null;
let categories = [];

// DOM Elements
const categoriesContainer = document.getElementById("categories");
const treesGrid = document.getElementById("treesGrid");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const loadingSpinner = document.getElementById("loadingSpinner");
const treeModal = document.getElementById("treeModal");

// Initialize App
const init = () => {
    if (!categoriesContainer) {
        console.error("DOM not ready. categories container missing.");
        return;
    }
    loadCategories();
    attachEventListeners();
};

// Load Categories from API
const loadCategories = () => {
    showSpinner(true);

    fetch(`${API_BASE}/categories`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            categories = data.data || data.categories || [];

            // Fallback to sample if empty
            if (!Array.isArray(categories) || categories.length === 0) {
                console.warn("Categories empty, using sample data");
                categories = sampleCategories;
            }

            renderCategories();
            // Load all plants by default
            loadAllPlants();
        })
        .catch((error) => {
            console.error("Error loading categories:", error);
            categories = sampleCategories;
            renderCategories();
            loadAllPlants();
        })
        .finally(() => {
            showSpinner(false);
        });
};

// Load all plants (All Trees)
const loadAllPlants = () => {
    showSpinner(true);

    fetch(`${API_BASE}/plants`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            // API may return different shapes
            const plantsRaw = data.data || data.plants || data || [];
            const plants = Array.isArray(plantsRaw)
                ? plantsRaw.map(normalizePlant)
                : [];

            currentCategory = "all";
            renderPlants(plants);
            updateCategoryButtons();
        })
        .catch((error) => {
            console.error("Error loading all plants:", error);
            showError("Failed to load all plants");
            renderPlants([]);
        })
        .finally(() => {
            showSpinner(false);
        });
};

// Render Categories
const renderCategories = () => {
    if (!categoriesContainer) {
        console.error("Categories container not found!");
        return;
    }

    categoriesContainer.innerHTML = "";

    // Add "All Trees" button first
    const allBtn = document.createElement("button");
    allBtn.textContent = "All Trees";
    allBtn.className =
        "w-full text-left px-3 py-2 rounded-md transition text-sm bg-[#15803d] text-white font-medium";
    allBtn.id = "category-all";
    allBtn.addEventListener("click", () => {
        currentCategory = "all";
        loadAllPlants();
        updateCategoryButtons();
    });
    categoriesContainer.appendChild(allBtn);

    categories.forEach((category) => {
        const btn = document.createElement("button");
        // normalize category object shapes
        const catName =
            category.name ||
            category.category_name ||
            category.title ||
            category.category ||
            String(category.id || category.category_id || category);
        const catId =
            category.id || category.category_id || category._id || catName;
        btn.textContent = catName;
        btn.className =
            "w-full text-left px-3 py-1.5 rounded transition text-sm text-[#065f46] hover:bg-[#e6f6ec]";
        btn.id = `category-${catId}`;

        btn.addEventListener("click", () => {
            currentCategory = catId;
            loadPlantsByCategory(catId);
            updateCategoryButtons();
        });

        categoriesContainer.appendChild(btn);
    });
};

// Load Plants by Category from API
const loadPlantsByCategory = (categoryId) => {
    showSpinner(true);

    fetch(`${API_BASE}/category/${categoryId}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const plantsRaw = data.data || data.plants || data || [];
            let plants = Array.isArray(plantsRaw)
                ? plantsRaw.map(normalizePlant)
                : [];

            // If category endpoint returned empty, try fetching all plants
            if (!plants.length) {
                return fetchAllPlantsAndFilter(categoryId);
            } else {
                renderPlants(plants);
                return null;
            }
        })
        .then((filteredPlants) => {
            if (filteredPlants) {
                renderPlants(filteredPlants);
            }
        })
        .catch((error) => {
            console.error("Error loading plants:", error);
            showError("Failed to load plants");
            renderPlants([]);
        })
        .finally(() => {
            showSpinner(false);
        });
};

// Helper function to fetch all plants and filter by category
const fetchAllPlantsAndFilter = (categoryId) => {
    return fetch(`${API_BASE}/plants`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const allRaw = data.data || data.plants || data || [];
            const allPlants = Array.isArray(allRaw)
                ? allRaw.map(normalizePlant)
                : [];

            const catIdStr = String(categoryId).toLowerCase();
            return allPlants.filter((p) => {
                if (!p.category) return false;
                return (
                    p.category.toLowerCase().includes(catIdStr) ||
                    String(p.id) === String(categoryId)
                );
            });
        })
        .catch((error) => {
            console.error("Error in fetchAllPlantsAndFilter:", error);
            return [];
        });
};

// Render Plants Grid
const renderPlants = (plants) => {
    treesGrid.innerHTML = "";

    if (plants.length === 0) {
        treesGrid.innerHTML =
            '<p class="col-span-full text-center text-[#6b7280]">No plants found</p>';
        return;
    }

    plants.forEach((plant) => {
        const card = document.createElement("div");
        card.className =
            "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer";

        const name = plant.name || plant.title || "Unnamed Plant";
        const image = plant.image || plant.img || plant.image_url || "";
        const description =
            plant.description || plant.detail || plant.about || "";
        const categoryLabel = plant.category || plant.category_name || "";
        const price =
            typeof plant.price !== "undefined"
                ? plant.price
                : plant.cost || plant.fee || 0;

        card.innerHTML = `
            <div style="height:180px; background:#eee; display:flex; align-items:center; justify-content:center;">
                <img src="${image}" alt="${name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}'">
            </div>
            <div class="p-4">
                <h4 class="text-lg font-semibold text-[#1f2937] mb-2">${name}</h4>
                <p class="text-sm text-[#6b7280] mb-3 line-clamp-2">${description}</p>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-medium text-[#15803d] bg-[#f0fdf4] px-3 py-1 rounded">${categoryLabel}</span>
                    <span class="text-lg font-bold text-[#1f2937]">৳${price}</span>
                </div>
                <button class="w-full btn bg-[#15803d] hover:bg-[#166534] text-white border-none rounded-full add-btn">
                    Add to Cart
                </button>
            </div>
        `;

        // Click card to open modal
        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains("add-btn")) {
                openPlantModal(plant);
            }
        });

        // Click add button
        card.querySelector(".add-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(plant);
        });

        treesGrid.appendChild(card);
    });
};

// Open Plant Modal
const openPlantModal = (plant) => {
    showSpinner(true);

    fetch(`${API_BASE}/plant/${plant.id}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const detailedPlant = data.data || plant;

            // Update modal content
            const modalContent = document.getElementById("modalContent");
            modalContent.innerHTML = `
                <h2 class="text-3xl font-bold text-[#1f2937] mb-4">${detailedPlant.name}</h2>
                <img src="${detailedPlant.image}" alt="${detailedPlant.name}"
                    class="w-full h-96 object-cover rounded-lg mb-6"
                    onerror="this.src='https://via.placeholder.com/600x400?text=${encodeURIComponent(detailedPlant.name)}'">
                <div class="space-y-4">
                    <div>
                        <h3 class="text-lg font-semibold text-[#1f2937] mb-2">Description</h3>
                        <p class="text-[#4b5563]">${detailedPlant.description}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-[#6b7280]">Category</p>
                            <p class="text-lg font-semibold text-[#1f2937]">${detailedPlant.category}</p>
                        </div>
                        <div>
                            <p class="text-sm text-[#6b7280]">Price</p>
                            <p class="text-lg font-semibold text-[#15803d]">৳${detailedPlant.price}</p>
                        </div>
                    </div>
                    ${
                        detailedPlant.rating
                            ? `
                    <div>
                        <p class="text-sm text-[#6b7280]">Rating</p>
                        <p class="text-lg font-semibold text-[#1f2937]">⭐ ${detailedPlant.rating}</p>
                    </div>
                    `
                            : ""
                    }
                    <button class="w-full btn bg-[#15803d] hover:bg-[#166534] text-white border-none rounded-full py-3 modal-add-btn">
                        Add to Cart
                    </button>
                </div>
            `;

            // Add to cart from modal
            modalContent
                .querySelector(".modal-add-btn")
                .addEventListener("click", () => {
                    addToCart(detailedPlant);
                    treeModal.close();
                });

            // Show modal
            treeModal.showModal();
        })
        .catch((error) => {
            console.error("Error loading plant details:", error);
            showError("Failed to load plant details");
        })
        .finally(() => {
            showSpinner(false);
        });
};

// Add to Cart
const addToCart = (plant) => {
    const existingItem = cart.find((item) => item.id === plant.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...plant,
            quantity: 1,
        });
    }

    updateCartDisplay();
    showNotification(`${plant.name} added to cart!`);
};

// Remove from Cart
const removeFromCart = (plantId) => {
    cart = cart.filter((item) => item.id !== plantId);
    updateCartDisplay();
};

// Update Cart Display
const updateCartDisplay = () => {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            '<p class="text-center text-[#6b7280]">Your cart is empty</p>';
    } else {
        cart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.className =
                "flex items-center justify-between bg-white p-3 rounded-lg";

            cartItem.innerHTML = `
                <div class="flex-1">
                    <p class="font-semibold text-[#1f2937] text-sm">${item.name}</p>
                    <p class="text-xs text-[#6b7280]">৳${item.price} x ${item.quantity}</p>
                </div>
                <button class="text-red-500 hover:text-red-700 font-bold remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;

            cartItem
                .querySelector(".remove-btn")
                .addEventListener("click", () => {
                    removeFromCart(item.id);
                });

            cartItemsContainer.appendChild(cartItem);
        });
    }

    updateCartTotal();
};

// Update Cart Total
const updateCartTotal = () => {
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    cartTotal.textContent = `৳${total}`;
};

// Update Category Buttons Active State
const updateCategoryButtons = () => {
    document.querySelectorAll("#categories button").forEach((btn) => {
        const categoryId = btn.id.replace("category-", "");
        if (categoryId == currentCategory) {
            btn.className =
                "w-full text-left px-3 py-2 rounded-md transition text-sm bg-[#15803d] text-white";
        } else {
            btn.className =
                "w-full text-left px-3 py-1 rounded transition text-sm text-[#065f46] hover:bg-[#e6f6ec]";
        }
    });
};

// Normalize plant object to a common shape
function normalizePlant(p) {
    if (!p) return {};
    return {
        id: p.id || p._id || p.plant_id || p.pid || null,
        name: p.name || p.title || p.plant_name || p.common_name || "",
        image: p.image || p.img || p.image_url || p.photo || "",
        description:
            p.description || p.detail || p.about || p.short_description || "",
        category: p.category || p.category_name || p.type || "",
        price:
            typeof p.price !== "undefined" && p.price !== null
                ? p.price
                : p.cost || p.fee || 0,
    };
}

// Show Loading Spinner
const showSpinner = (show) => {
    if (show) {
        loadingSpinner.classList.remove("hidden");
    } else {
        loadingSpinner.classList.add("hidden");
    }
};

// Show Notification
const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.className =
        "fixed top-4 right-4 bg-[#15803d] text-white px-6 py-3 rounded-lg shadow-lg z-50";
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// Show Error Message
const showError = (message) => {
    const error = document.createElement("div");
    error.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    error.textContent = message;

    document.body.appendChild(error);

    setTimeout(() => {
        error.remove();
    }, 5000);
};

// Attach Event Listeners
const attachEventListeners = () => {
    // Close modal on X button
    const closeBtn = treeModal.querySelector(".btn-circle");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            treeModal.close();
        });
    }

    // allow clicking outside the modal to close it
    treeModal.addEventListener("click", (e) => {
        if (e.target === treeModal) {
            treeModal.close();
        }
    });
};

// Start App when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
