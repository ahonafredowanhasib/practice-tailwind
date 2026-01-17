const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const authContainer = document.getElementById('authContainer');
const loader = document.getElementById('premiumLoader');
const dashboard = document.getElementById('dashboard');
const loaderText = document.getElementById('loaderText');

// OTP Store
let registerOtp = null;
let forgotOtp = null;

// --- LOADER HELPERS ---
function simulateLoading(callback, text = "PROCESSING") {
    loaderText.innerText = text;
    loader.classList.remove('hidden'); // Show Loader
    authContainer.classList.add('opacity-0'); // Fade out form

    setTimeout(() => {
        callback(); // Run the actual logic
    }, 1000);
}

// --- NEW LOGOUT FUNCTION ---
function handleLogout() {
    // 1. Show loader text
    loaderText.innerText = "LOGGING OUT PROFILE";
    loader.classList.remove('hidden');

    // 2. Hide Dashboard
    dashboard.classList.add('hidden');

    // 3. Wait 1 Second then Reset to Login
    setTimeout(() => {
        // Hide Loader
        loader.classList.add('hidden');

        // Show Auth Container again
        authContainer.style.display = 'block';

        // Allow display:block to apply before fading in
        requestAnimationFrame(() => {
            authContainer.classList.remove('opacity-0');
        });

        // Reset Login Form Inputs
        document.getElementById('loginId').value = '';
        document.getElementById('loginPass').value = '';
        document.getElementById('loginMsg').innerText = '';

        // Ensure Login View is active
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.add('hidden');

    }, 1000);
}

// --- TOGGLE VIEW ---
function toggleViewWithLoader(view) {
    simulateLoading(() => {
        document.querySelectorAll('#loginMsg, #regMsg, #forgotMsg').forEach(el => el.innerText = '');
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.add('hidden');

        if (view === 'register') {
            registerForm.classList.remove('hidden');
        } else if (view === 'forgot') {
            forgotForm.classList.remove('hidden');
        } else {
            loginForm.classList.remove('hidden');
        }

        authContainer.classList.remove('opacity-0');
        loader.classList.add('hidden');
    }, "LOADING VIEW");
}

// --- OTP LOGIC ---
function sendRegisterOtp() {
    const id = document.getElementById('regId').value.trim();
    const btn = document.getElementById('regOtpBtn');
    const msg = document.getElementById('regMsg');
    if (!id || id.length < 5) return showMsg(msg, "Enter valid Email/Phone first", 'red');
    if (id === localStorage.getItem('u_id')) return showMsg(msg, "Account already exists! Log in.", 'red');
    runOtpSequence(id, btn, msg, (otp) => { registerOtp = otp; });
}

function sendForgotOtp() {
    const id = document.getElementById('forgotId').value.trim();
    const btn = document.getElementById('forgotOtpBtn');
    const msg = document.getElementById('forgotMsg');
    if (!id) return showMsg(msg, "Enter registered Email/Phone", 'red');
    const storedId = localStorage.getItem('u_id');
    if (id !== storedId) return showMsg(msg, "User not found! Register first.", 'red');
    runOtpSequence(id, btn, msg, (otp) => { forgotOtp = otp; });
}

function runOtpSequence(id, btn, msgElement, saveOtpCallback) {
    btn.disabled = true;
    btn.innerText = "Sending...";
    setTimeout(() => {
        const otp = Math.floor(1000 + Math.random() * 9000);
        saveOtpCallback(otp);
        alert(`LuxeStore Verification Code: ${otp}`);
        showMsg(msgElement, `Code sent to ${id}`, 'text-green-400');
        let timeLeft = 30;
        const timer = setInterval(() => {
            btn.innerText = `Resend (${timeLeft}s)`;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timer);
                btn.innerText = "Send Code";
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }, 1000);
    }, 1000);
}

// --- AUTH HANDLERS ---
function handleRegister(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('regId').value.trim();
        const pass = document.getElementById('regPass').value;
        const userCode = document.getElementById('regCode').value;
        const msg = document.getElementById('regMsg');

        authContainer.classList.remove('opacity-0');
        loader.classList.add('hidden');

        if (!id.includes('@') && id.length < 10) return showMsg(msg, "Invalid Email/Phone", 'red');
        if (pass.length < 6) return showMsg(msg, "Password too weak", 'red');
        if (!registerOtp) return showMsg(msg, "Please send code first", 'red');
        if (parseInt(userCode) !== registerOtp) return showMsg(msg, "Wrong OTP Code!", 'red');

        localStorage.setItem('u_id', id);
        localStorage.setItem('u_pass', pass);

        showMsg(msg, "Account Created!", 'text-green-400');
        setTimeout(() => {
            toggleViewWithLoader('login');
            document.getElementById('loginId').value = id;
        }, 1000);
    }, "CREATING ACCOUNT");
}

function handleReset(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('forgotId').value.trim();
        const userCode = document.getElementById('forgotCode').value;
        const newPass = document.getElementById('newPass').value;
        const msg = document.getElementById('forgotMsg');

        authContainer.classList.remove('opacity-0');
        loader.classList.add('hidden');

        if (newPass.length < 6) return showMsg(msg, "New password too weak", 'red');
        if (!forgotOtp) return showMsg(msg, "Please send code first", 'red');
        if (parseInt(userCode) !== forgotOtp) return showMsg(msg, "Wrong OTP Code!", 'red');

        localStorage.setItem('u_pass', newPass);

        showMsg(msg, "Password Reset Success!", 'text-green-400');
        setTimeout(() => {
            toggleViewWithLoader('login');
            document.getElementById('loginId').value = id;
        }, 1000);
    }, "UPDATING PASS");
}

function handleLogin(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('loginId').value.trim();
        const pass = document.getElementById('loginPass').value;
        const msg = document.getElementById('loginMsg');
        const storedId = localStorage.getItem('u_id');
        const storedPass = localStorage.getItem('u_pass');

        if (id === storedId && pass === storedPass) {
            authContainer.style.display = 'none';
            loader.classList.add('hidden');
            dashboard.classList.remove('hidden');
        } else {
            authContainer.classList.remove('opacity-0');
            loader.classList.add('hidden');
            showMsg(msg, "Incorrect ID or Password", 'red');
        }
    }, "AUTHENTICATING");
}

function showMsg(el, text, colorClass) {
    el.className = `text-center text-xs h-5 font-medium ${colorClass === 'red' ? 'text-red-400' : colorClass}`;
    el.innerText = text;
}