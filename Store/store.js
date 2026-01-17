// --- DATA & STATE ---
const grid = document.getElementById('productGrid');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const toast = document.getElementById('toast');
const cartCountEl = document.getElementById('cartCount');
const dashboard = document.getElementById('dashboard');
const cartView = document.getElementById('cartView');
const logoutLoader = document.getElementById('logoutLoader');

let cart = [];
let products = [];

const categories = ["All", "Shirts", "Pants", "T-Shirts", "Shoes", "Underwear"];

// --- 1. THEME INIT ---
if (localStorage.theme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    document.documentElement.classList.add('dark');
}

function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        html.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// --- SECURITY: LOGOUT FUNCTION (INTEGRATED HERE) ---
function handleLogout() {
    // 1. Loader দেখাবে
    logoutLoader.classList.remove('hidden');

    // 2. Smoothly fade in করবে
    requestAnimationFrame(() => {
        logoutLoader.classList.remove('opacity-0');
    });

    // 3. ১ সেকেন্ড অপেক্ষা করে ডাটা ক্লিয়ার করবে এবং রিডাইরেক্ট করবে
    setTimeout(() => {
        // লগইন ফ্ল্যাগ মুছে ফেলবে
        localStorage.removeItem('isLoggedIn');

        // Index পেজে নিয়ে যাবে (Back বাটন কাজ করবে না)
        window.location.replace('../index.html');
    }, 1000);
}

// --- 2. DATA GENERATION ---
function generateProducts() {
    products = [];

    const variants = {
        "Shirts": [
            { name: "Mens Royal Oxford", tags: "Formal, Premium" },
            { name: "Urban Checkered Shirt", tags: "Casual, Street" },
            { name: "Executive Silk Blouse", tags: "Female, Luxury" },
            { name: "Summer Linen Fit", tags: "Breathable, Soft" }
        ],
        "Pants": [
            { name: "Slim Fit Chinos", tags: "Office, Smart" },
            { name: "Classic Blue Denim", tags: "Rugged, Daily" },
            { name: "Formal Trousers", tags: "Black, Sharp" },
            { name: "Flex Cargo Pants", tags: "Utility, Street" }
        ],
        "T-Shirts": [
            { name: "Essential White Tee", tags: "Basic, Cotton" },
            { name: "Graphic Street Tee", tags: "Trendy, Art" },
            { name: "Polo Classic", tags: "Sport, Casual" },
            { name: "V-Neck Slim", tags: "Modern, Fit" }
        ],
        "Shoes": [
            { name: "Oxford Elite Leather", tags: "Male Shoes, Formal" },
            { name: "Velocity Air Runner", tags: "Running, Sport" },
            { name: "Summer Breeze Sandals", tags: "Sandals, Casual" },
            { name: "Urban Loafers", tags: "Male Shoes, Casual" },
            { name: "Classic Derby", tags: "Formal, Black" }
        ],
        "Underwear": [
            { name: "Cotton Classic Boxers", tags: "Male, Pack of 3" },
            { name: "Performance Briefs", tags: "Male, Sport" },
            { name: "Lace Trim Hipster", tags: "Female, Elegant" },
            { name: "Seamless Bikini Set", tags: "Female, Soft" },
            { name: "Silk Nightwear", tags: "Female, Luxury" }
        ]
    };

    const descriptions = [
        "Experience unmatched comfort with premium breathable fabric, designed perfectly for the modern lifestyle.",
        "Elevate your daily look with this masterpiece, blending timeless elegance with contemporary fashion trends.",
        "Crafted from the finest materials to ensure durability while maintaining a sophisticated and sharp appearance.",
        "Designed for those who value luxury, this item offers superior fit and exceptional finish.",
        "Step out in style with this versatile piece, perfect for both casual outings and formal events."
    ];

    let globalIndex = 0;
    for (let i = 1; i <= 60; i++) {
        const cat = categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
        const variant = variants[cat][Math.floor(Math.random() * variants[cat].length)];

        const initialRating = (Math.random() * 1.5 + 3.5);
        const initialVotes = Math.floor(Math.random() * 50) + 5;

        products.push({
            id: i,
            name: variant.name,
            category: cat,
            tags: variant.tags,
            price: Math.floor(Math.random() * 4000) + 800,
            desc: descriptions[Math.floor(Math.random() * descriptions.length)],
            ratingScore: initialRating * initialVotes,
            ratingVotes: initialVotes,
            get averageRating() {
                return (this.ratingScore / this.ratingVotes).toFixed(1);
            }
        });
    }
}

// --- 3. UI RENDERING ---
function setupNav() {
    const deskNav = document.getElementById('desktopCategories');
    const mobileNav = document.getElementById('mobileCategories');
    deskNav.innerHTML = ''; mobileNav.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-cyan-400 ${cat === 'All' ? 'text-cyan-400' : 'text-gray-500 dark:text-gray-300'}`;
        btn.innerText = cat;
        btn.onclick = () => { backToShop(); filterProducts(cat); };
        deskNav.appendChild(btn);

        const mBtn = document.createElement('button');
        mBtn.className = `cat-btn whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium ${cat === 'All' ? 'bg-cyan-500 text-white border-none' : 'text-gray-600 dark:text-gray-300'}`;
        mBtn.innerText = cat;
        mBtn.onclick = () => { backToShop(); filterProducts(cat); };
        mobileNav.appendChild(mBtn);
    });
}

function filterProducts(category) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.innerText === category) {
            btn.classList.add('text-cyan-400', 'bg-cyan-500/10');
            if (btn.classList.contains('rounded-full')) {
                btn.classList.add('bg-cyan-500', 'text-white');
                btn.classList.remove('bg-cyan-500/10', 'text-cyan-400');
            }
        } else {
            btn.classList.remove('text-cyan-400', 'bg-cyan-500/10', 'bg-cyan-500', 'text-white');
        }
    });

    document.getElementById('currentCategory').innerText = category === 'All' ? "All Collections" : category;
    const filtered = category === 'All' ? products : products.filter(p => p.category === category);
    document.getElementById('totalProducts').innerText = filtered.length;
    renderGrid(filtered);
}

function renderGrid(items) {
    grid.innerHTML = '';
    if (items.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-500">No products found</div>';
        return;
    }

    items.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = "product-card group relative bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 animate-scaleIn flex flex-col";
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
                    <div class="h-52 overflow-hidden relative flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <div class="text-center opacity-30">
                            <i class="fas fa-camera text-4xl mb-2"></i>
                            <p class="text-[10px] uppercase tracking-widest">Premium Item</p>
                        </div>

                        <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md" id="rating-badge-${product.id}">
                            <i class="fas fa-star text-yellow-400 text-[10px]"></i> ${product.averageRating}
                        </div>
                        <div class="absolute bottom-2 left-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] px-2 py-1 rounded-full">
                            ${product.tags}
                        </div>
                    </div>
                    
                    <div class="p-4 flex flex-col flex-grow">
                        <div class="text-xs text-cyan-500 font-semibold mb-1 uppercase tracking-wider">${product.category}</div>
                        <h3 class="text-sm font-semibold mb-1 truncate group-hover:text-cyan-400 transition-colors" title="${product.name}">${product.name}</h3>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed opacity-90">${product.desc}</p>
                        
                        <div class="flex items-center gap-1 mb-3 text-gray-300 text-xs">
                            <span class="text-[10px] mr-1 text-gray-500">Rate:</span>
                            ${[1, 2, 3, 4, 5].map(star => `
                                <i class="fas fa-star rating-star" onclick="submitRating(${product.id}, ${star})" onmouseover="highlightStars(this, ${star})" onmouseout="resetStars(this)"></i>
                            `).join('')}
                            <span class="text-[9px] text-gray-500 ml-1">(${product.ratingVotes})</span>
                        </div>

                        <div class="mt-auto flex items-center justify-between gap-2">
                            <span class="text-lg font-bold text-gray-800 dark:text-white">৳${product.price}</span>
                            
                            <button onclick="addToCart(${product.id})" 
                                class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                `;
        grid.appendChild(card);
    });
}

// --- 4. RATING LOGIC ---
function submitRating(productId, userRating) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.ratingScore += userRating;
        product.ratingVotes += 1;

        const newAvg = product.averageRating;

        const badge = document.getElementById(`rating-badge-${productId}`);
        if (badge) {
            badge.innerHTML = `<i class="fas fa-star text-yellow-400 text-[10px]"></i> ${newAvg}`;
            badge.classList.add('animate-pulse');
            setTimeout(() => badge.classList.remove('animate-pulse'), 500);
        }

        showToast(`You rated ${userRating} stars!`);
        filterProducts(product.category === document.getElementById('currentCategory').innerText ? product.category : 'All');
    }
}

function highlightStars(element, index) {
    const parent = element.parentElement;
    const stars = parent.querySelectorAll('.rating-star');
    stars.forEach((star, i) => {
        if (i < index) {
            star.classList.add('text-yellow-400');
            star.classList.remove('text-gray-300');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

function resetStars(element) {
    const parent = element.parentElement;
    const stars = parent.querySelectorAll('.rating-star');
    stars.forEach(star => {
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-300');
    });
}

// --- 5. CART LOGIC ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCartCount();
    showToast(`${product.name} added`);
}

function updateCartCount() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCountEl.innerText = totalQty;
    cartCountEl.classList.add('animate-bounce');
    setTimeout(() => cartCountEl.classList.remove('animate-bounce'), 1000);
}

function showToast(msg) {
    // Reset icon
    const toastIcon = document.querySelector('#toast i');
    toastIcon.className = 'fas fa-check-circle text-green-400';

    document.getElementById('toastMsg').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

// --- 6. NAVIGATION ---
function goToCartPage() {
    dashboard.classList.add('hidden');
    document.getElementById('desktopCategories').classList.add('hidden');
    document.getElementById('mobileCategories').classList.add('hidden');

    cartView.classList.remove('hidden');
    renderCartPage();
}

function backToShop() {
    cartView.classList.add('hidden');
    dashboard.classList.remove('hidden');
    document.getElementById('desktopCategories').classList.remove('hidden');
    document.getElementById('mobileCategories').classList.remove('hidden');
}

// --- 7. RENDER CART PAGE ---
function renderCartPage() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
                    <div class="glass-panel p-10 text-center rounded-2xl">
                        <i class="fas fa-shopping-basket text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">Your cart is empty.</p>
                    </div>`;
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            const row = document.createElement('div');
            row.className = "glass-panel p-4 rounded-xl flex items-center gap-4 animate-slideRight";
            row.innerHTML = `
                        <div class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                             <i class="fas fa-cube"></i>
                        </div>
                        <div class="flex-grow">
                            <h4 class="font-bold text-sm md:text-base">${item.name}</h4>
                            <p class="text-xs text-gray-400 mb-1">${item.tags}</p>
                            <p class="text-cyan-400 font-bold">৳${item.price}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition">-</button>
                            <span class="text-sm font-semibold w-4 text-center">${item.qty}</span>
                            <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition">+</button>
                        </div>
                        <div class="text-right ml-2">
                            <p class="font-bold text-sm">৳${itemTotal}</p>
                            <button onclick="removeItem(${item.id})" class="text-xs text-red-400 hover:text-red-300 mt-1"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
            cartItemsContainer.appendChild(row);
        });
    }

    // Update Summary
    const tax = Math.round(subtotal * 0.05);
    const shipping = cart.length > 0 ? 100 : 0;
    const total = subtotal + tax + shipping;

    document.getElementById('summarySubtotal').innerText = `৳${subtotal}`;
    document.getElementById('summaryTax').innerText = `৳${tax}`;
    document.getElementById('summaryTotal').innerText = `৳${total}`;
}

function changeQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeItem(id);
        } else {
            renderCartPage();
            updateCartCount();
        }
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCartPage();
    updateCartCount();
    showToast("Item removed");
}

// --- INIT ---
(function initStore() {
    generateProducts();
    setupNav();
    filterProducts('All');
})();