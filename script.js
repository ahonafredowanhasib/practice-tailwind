const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const authContainer = document.getElementById('authContainer');
const loader = document.getElementById('premiumLoader');
const dashboard = document.getElementById('dashboard');
const loaderText = document.getElementById('loaderText');

// --- THEME LOGIC ---
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

// OTP Store
let registerOtp = null;
let forgotOtp = null;

// --- HELPERS ---
function simulateLoading(callback, text = "PROCESSING") {
    loaderText.innerText = text;
    loader.classList.remove('hidden');
    authContainer.classList.add('opacity-0');

    setTimeout(() => {
        callback();
    }, 1000);
}

function showMsg(el, text, colorClass) {
    let finalColor = colorClass;
    if (colorClass === 'text-green-400' || colorClass === 'text-green-500') finalColor = 'text-green-600 dark:text-green-400';
    if (colorClass === 'red') finalColor = 'text-red-500';

    el.className = `text-center text-xs h-5 font-medium ${finalColor}`;
    el.innerText = text;
}

// --- NAVIGATION ---
function toggleViewWithLoader(view) {
    simulateLoading(() => {
        document.querySelectorAll('#loginMsg, #regMsg, #forgotMsg').forEach(el => el.innerText = '');
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.add('hidden');

        // Clear fields for security
        document.getElementById('newPass').value = '';
        document.getElementById('confirmNewPass').value = '';
        document.getElementById('regPass').value = '';
        document.getElementById('regConfirmPass').value = '';

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

function handleLogout() {
    loaderText.innerText = "LOGGING OUT PROFILE";
    loader.classList.remove('hidden');
    dashboard.classList.add('hidden');
    setTimeout(() => {
        loader.classList.add('hidden');
        authContainer.style.display = 'block';
        requestAnimationFrame(() => { authContainer.classList.remove('opacity-0'); });
        document.getElementById('loginId').value = '';
        document.getElementById('loginPass').value = '';
        toggleViewWithLoader('login');
    }, 1000);
}

// --- OTP ---
function sendRegisterOtp() {
    const id = document.getElementById('regId').value.trim();
    const btn = document.getElementById('regOtpBtn');
    const msg = document.getElementById('regMsg');
    if (!id || id.length < 5) return showMsg(msg, "Enter valid Email/Phone first", 'red');
    if (id === localStorage.getItem('u_id')) return showMsg(msg, "Account exists! Log in.", 'red');
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
        alert(`Verification Code: ${otp}`);
        showMsg(msgElement, `Code sent to ${id}`, 'text-green-500');
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

// 1. REGISTER LOGIC
function handleRegister(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('regId').value.trim();
        const pass = document.getElementById('regPass').value;
        const confirmPass = document.getElementById('regConfirmPass').value;
        const userCode = document.getElementById('regCode').value;
        const msg = document.getElementById('regMsg');

        authContainer.classList.remove('opacity-0');
        loader.classList.add('hidden');

        if (!id.includes('@') && id.length < 10) return showMsg(msg, "Invalid Email/Phone", 'red');
        if (pass.length < 6) return showMsg(msg, "Password too weak (min 6 chars)", 'red');

        if (pass !== confirmPass) return showMsg(msg, "Passwords do not match!", 'red');

        if (!registerOtp) return showMsg(msg, "Please send code first", 'red');
        if (parseInt(userCode) !== registerOtp) return showMsg(msg, "Wrong OTP Code!", 'red');

        localStorage.setItem('u_id', id);
        localStorage.setItem('u_pass', pass);

        showMsg(msg, "Account Created!", 'text-green-500');
        setTimeout(() => {
            toggleViewWithLoader('login');
            document.getElementById('loginId').value = id;
        }, 1000);
    }, "CREATING ACCOUNT");
}

// 2. RESET/UPDATE LOGIC
function handleReset(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('forgotId').value.trim();
        const userCode = document.getElementById('forgotCode').value;

        // Get only new password inputs
        const newPass = document.getElementById('newPass').value;
        const confirmNewPass = document.getElementById('confirmNewPass').value;

        const msg = document.getElementById('forgotMsg');
        const storedPass = localStorage.getItem('u_pass');

        authContainer.classList.remove('opacity-0');
        loader.classList.add('hidden');

        // Basic Checks
        if (!forgotOtp) return showMsg(msg, "Please send code first", 'red');
        if (parseInt(userCode) !== forgotOtp) return showMsg(msg, "Wrong OTP Code!", 'red');

        if (newPass === storedPass) return showMsg(msg, "New Password must be different from current!", 'red');
        if (newPass !== confirmNewPass) return showMsg(msg, "New Passwords do not match!", 'red');
        if (newPass.length < 6) return showMsg(msg, "New password too weak", 'red');

        // Success
        localStorage.setItem('u_pass', newPass);

        showMsg(msg, "Password Updated Successfully!", 'text-green-500');
        setTimeout(() => {
            toggleViewWithLoader('login');
            document.getElementById('loginId').value = id;
        }, 1500);
    }, "UPDATING PASS");
}

// 3. LOGIN LOGIC (MODIFIED FOR REDIRECT)
function handleLogin(e) {
    e.preventDefault();
    simulateLoading(() => {
        const id = document.getElementById('loginId').value.trim();
        const pass = document.getElementById('loginPass').value;
        const msg = document.getElementById('loginMsg');
        const storedId = localStorage.getItem('u_id');
        const storedPass = localStorage.getItem('u_pass');

        if (id === storedId && pass === storedPass) {
            // Update text to indicate redirection
            loaderText.innerText = "REDIRECTING...";
            // Do NOT hide the loader here.
            // Redirect to store.html immediately (the 1s delay already happened in simulateLoading)
            window.location.href = './Store/store.html';
        } else {
            // Failed login, hide loader and show error
            authContainer.classList.remove('opacity-0');
            loader.classList.add('hidden');
            showMsg(msg, "Incorrect ID or Password", 'red');
        }
    }, "AUTHENTICATING");
}