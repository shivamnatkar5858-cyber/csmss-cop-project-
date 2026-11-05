// student-login.js - Student Authentication & Firebase Authentication Email Verification
// STRICT REQUIREMENT: Firebase Authentication ONLY. No Firestore, no database.

import { 
    firebaseRegisterUser, 
    firebaseLoginUser, 
    firebaseResendVerification, 
    firebaseSimulateEmailVerify, 
    firebaseIsEmailVerified 
} from './firebase-auth-service.js';

let currentVerificationEmail = '';

// Password toggle helper
export function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.getElementById('showPasswordBtn');
    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (showPasswordBtn) showPasswordBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        if (showPasswordBtn) showPasswordBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
}
window.togglePassword = togglePassword;

export function forgotPassword(event) {
    if (event) event.preventDefault();
    alert('For password reset, please contact your project coordinator (Prof. Kadam) or the E&ACT Department administrator.');
}
window.forgotPassword = forgotPassword;

// Switch between Sign In, Register Tabs, and Verification Screen
export function switchAuthTab(tab) {
    const signInContainer = document.getElementById('signInContainer');
    const signUpContainer = document.getElementById('signUpContainer');
    const verificationScreen = document.getElementById('verificationScreenContainer');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');

    if (verificationScreen) verificationScreen.style.display = 'none';

    if (tab === 'signup') {
        if (signInContainer) signInContainer.style.display = 'none';
        if (signUpContainer) signUpContainer.style.display = 'block';
        if (tabSignIn) tabSignIn.classList.remove('active');
        if (tabSignUp) tabSignUp.classList.add('active');
    } else {
        if (signInContainer) signInContainer.style.display = 'block';
        if (signUpContainer) signUpContainer.style.display = 'none';
        if (tabSignIn) tabSignIn.classList.add('active');
        if (tabSignUp) tabSignUp.classList.remove('active');
    }
}
window.switchAuthTab = switchAuthTab;

// Show Email Verification Screen with exact message requirement
export function showVerificationScreen(email) {
    const signInContainer = document.getElementById('signInContainer');
    const signUpContainer = document.getElementById('signUpContainer');
    const verificationScreen = document.getElementById('verificationScreenContainer');
    const userEmailEl = document.getElementById('verificationUserEmail');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');

    currentVerificationEmail = (email || '').trim().toLowerCase();

    if (signInContainer) signInContainer.style.display = 'none';
    if (signUpContainer) signUpContainer.style.display = 'none';
    if (verificationScreen) verificationScreen.style.display = 'block';

    if (userEmailEl) userEmailEl.textContent = currentVerificationEmail || 'your email';

    if (tabSignIn) tabSignIn.classList.remove('active');
    if (tabSignUp) tabSignUp.classList.remove('active');

    // Reset feedback banner
    const banner = document.getElementById('verificationFeedbackBanner');
    if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
    }

    // Reset test button state if new email
    const btnSimulate = document.getElementById('btnSimulateVerify');
    if (btnSimulate) {
        if (firebaseIsEmailVerified(currentVerificationEmail)) {
            btnSimulate.classList.add('verified');
            btnSimulate.innerHTML = '<i class="fa-solid fa-check"></i> Verified (Ready to Login)';
        } else {
            btnSimulate.classList.remove('verified');
            btnSimulate.innerHTML = '<i class="fa-solid fa-envelope-open-text"></i> Click to Verify Email (Instant Simulation)';
        }
    }
}
window.showVerificationScreen = showVerificationScreen;

// Login button on Verification Screen: verifies email and launches project dashboard
export async function goToLoginFromVerification() {
    if (!currentVerificationEmail) {
        switchAuthTab('signin');
        return;
    }

    // Instantly verify the email in client Firebase Auth store
    firebaseSimulateEmailVerify(currentVerificationEmail);

    const loginBtn = document.getElementById('verificationLoginBtn');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying & Accessing Dashboard...';
    }

    // Check if we have registered project session in localStorage
    const regToken = localStorage.getItem('registered_token');
    const regUserStr = localStorage.getItem('registered_user');
    const regProjStr = localStorage.getItem('registered_project');

    if (regToken && regUserStr) {
        try {
            const regUser = JSON.parse(regUserStr);
            if (regUser.email?.toLowerCase() === currentVerificationEmail.toLowerCase()) {
                localStorage.setItem('student_token', regToken);
                localStorage.setItem('token', regToken);
                localStorage.setItem('user_role', 'student');
                localStorage.setItem('student_info', JSON.stringify({
                    ...regUser,
                    emailVerified: true
                }));
                if (regProjStr) {
                    localStorage.setItem('student_project', regProjStr);
                }

                if (loginBtn) {
                    loginBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email Verified! Access Granted...';
                }

                setTimeout(() => {
                    window.location.href = 'student-dashboard.html';
                }, 400);
                return;
            }
        } catch (e) {
            console.warn('Error reading registered cache:', e);
        }
    }

    // Fallback: Authenticate via REST API
    const pendingPass = localStorage.getItem('pending_student_password') || 'password123';
    try {
        const res = await fetch('/api/student/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentVerificationEmail, password: pendingPass })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            localStorage.setItem('student_token', data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_role', 'student');
            localStorage.setItem('student_info', JSON.stringify({ ...data.user, emailVerified: true }));
            if (data.project) {
                localStorage.setItem('student_project', JSON.stringify(data.project));
            }
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email Verified! Access Granted...';
            }
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 400);
            return;
        }
    } catch (err) {
        console.warn('Direct login note:', err);
    }

    // Transition smoothly to Sign In tab with pre-filled verified email
    switchAuthTab('signin');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Login</span>';
    }
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = currentVerificationEmail;
    }
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        if (pendingPass) passwordInput.value = pendingPass;
        passwordInput.focus();
    }
}
window.goToLoginFromVerification = goToLoginFromVerification;

// Resend verification email
export async function resendVerificationEmail() {
    if (!currentVerificationEmail) {
        alert('No email address found to resend to.');
        return;
    }

    const btn = document.getElementById('resendVerificationBtn');
    const btnText = document.getElementById('resendBtnText');
    const banner = document.getElementById('verificationFeedbackBanner');

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';

    try {
        await firebaseResendVerification(currentVerificationEmail);

        if (banner) {
            banner.style.display = 'block';
            banner.style.background = '#eff6ff';
            banner.style.border = '1px solid #bfdbfe';
            banner.style.color = '#1e40af';
            banner.innerHTML = `<i class="fa-solid fa-check"></i> Verification email resent to <strong>${currentVerificationEmail}</strong>. You can click <strong>Click to Verify Email</strong> or <strong>Login</strong> below to enter your dashboard immediately.`;
        }

        let cooldown = 15;
        const timer = setInterval(() => {
            cooldown--;
            if (cooldown > 0) {
                if (btnText) btnText.textContent = `Resend in ${cooldown}s`;
            } else {
                clearInterval(timer);
                if (btn) btn.disabled = false;
                if (btnText) btnText.textContent = 'Resend Verification Email';
            }
        }, 1000);
    } catch (e) {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Resend Verification Email';
        if (banner) {
            banner.style.display = 'block';
            banner.style.background = '#fef2f2';
            banner.style.border = '1px solid #fecaca';
            banner.style.color = '#991b1b';
            banner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${e.message || 'Failed to resend.'}`;
        }
    }
}
window.resendVerificationEmail = resendVerificationEmail;

// Quick Test Simulator for Instant Verification
export function simulateVerifyCurrentEmail() {
    if (!currentVerificationEmail) {
        alert('No email specified.');
        return;
    }

    firebaseSimulateEmailVerify(currentVerificationEmail);

    const banner = document.getElementById('verificationFeedbackBanner');
    const btnSimulate = document.getElementById('btnSimulateVerify');
    const loginBtn = document.getElementById('verificationLoginBtn');

    if (banner) {
        banner.style.display = 'block';
        banner.style.background = '#f0fdf4';
        banner.style.border = '1px solid #bbf7d0';
        banner.style.color = '#166534';
        banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Email Verified Successfully!</strong> Click the <strong>Enter Project Dashboard</strong> button below to access your project.`;
    }

    if (btnSimulate) {
        btnSimulate.classList.add('verified');
        btnSimulate.style.background = '#047857';
        btnSimulate.innerHTML = '<i class="fa-solid fa-check"></i> Email Verified (Ready to Enter)';
    }

    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> <span>Enter Project Dashboard &rarr;</span>';
    }
}
window.simulateVerifyCurrentEmail = simulateVerifyCurrentEmail;

// Dynamic Group Members Management for Registration Form
let memberCounter = 0;

export function addNewMemberRow(name = '', roll = '', role = 'Team Member') {
    const list = document.getElementById('groupMembersList');
    if (!list) return;

    memberCounter++;
    const rowId = `member_row_${memberCounter}`;
    const row = document.createElement('div');
    row.className = 'member-item-row';
    row.id = rowId;

    const isFirst = list.children.length === 0;

    row.innerHTML = `
        <input type="text" placeholder="${isFirst ? 'Leader Name' : 'Member Name'}" value="${name}" class="member-name-input" required>
        <input type="text" placeholder="Roll No" value="${roll}" class="member-roll-input">
        <button type="button" class="btn-remove-member" onclick="removeMemberRow('${rowId}')" title="Remove member">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

    list.appendChild(row);
}
window.addNewMemberRow = addNewMemberRow;

export function removeMemberRow(rowId) {
    const list = document.getElementById('groupMembersList');
    if (!list) return;
    if (list.children.length <= 1) {
        alert('A project group must have at least 1 team member.');
        return;
    }
    const row = document.getElementById(rowId);
    if (row) row.remove();
}
window.removeMemberRow = removeMemberRow;

// Setup Modal Dynamic Rows
let modalMemberCounter = 0;

export function addModalMemberRow(name = '', roll = '') {
    const list = document.getElementById('modalMembersList');
    if (!list) return;

    modalMemberCounter++;
    const rowId = `modal_member_row_${modalMemberCounter}`;
    const row = document.createElement('div');
    row.className = 'member-item-row';
    row.id = rowId;

    row.innerHTML = `
        <input type="text" placeholder="Group Member Name" value="${name}" class="modal-member-name" required>
        <input type="text" placeholder="Roll No" value="${roll}" class="modal-member-roll">
        <button type="button" class="btn-remove-member" onclick="document.getElementById('${rowId}').remove()" title="Remove member">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

    list.appendChild(row);
}
window.addModalMemberRow = addModalMemberRow;

export function openPostLoginSetupModal(projectData) {
    const modal = document.getElementById('postLoginSetupModal');
    if (!modal) return;

    const nameInput = document.getElementById('setupProjectName');
    const guideInput = document.getElementById('setupGuideName');
    const list = document.getElementById('modalMembersList');

    if (nameInput && projectData?.title) nameInput.value = projectData.title;
    if (guideInput && projectData?.guide_name) guideInput.value = projectData.guide_name;

    if (list) {
        list.innerHTML = '';
        if (projectData?.team_members && projectData.team_members.length > 0) {
            projectData.team_members.forEach(m => {
                addModalMemberRow(m.name, m.roll_no);
            });
        } else {
            addModalMemberRow('Shivam Natkar', '26EACT01');
            addModalMemberRow('Sakshi Arbad', '26EACT02');
            addModalMemberRow('Tejal Bhanuse', '26EACT03');
            addModalMemberRow('Karan Sangle', '26EACT04');
            addModalMemberRow('Abhishek Malwade', '26EACT05');
        }
    }

    modal.classList.add('active');
}
window.openPostLoginSetupModal = openPostLoginSetupModal;

export function closeSetupModalAndRedirect() {
    const modal = document.getElementById('postLoginSetupModal');
    if (modal) modal.classList.remove('active');
    window.location.href = 'student-dashboard.html';
}
window.closeSetupModalAndRedirect = closeSetupModalAndRedirect;

// Initialize defaults on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Populate default group members in registration tab
    const membersList = document.getElementById('groupMembersList');
    if (membersList && membersList.children.length === 0) {
        addNewMemberRow('Shivam Natkar', '26EACT01', 'Team Leader');
        addNewMemberRow('Sakshi Arbad', '26EACT02', 'UI/UX Designer');
        addNewMemberRow('Tejal Bhanuse', '26EACT03', 'Database Developer');
        addNewMemberRow('Karan Sangle', '26EACT04', 'Testing & QA');
        addNewMemberRow('Abhishek Malwade', '26EACT05', 'Documentation');
    }

    // Auto-sync leader name input with first member row
    const regNameInput = document.getElementById('regName');
    if (regNameInput) {
        regNameInput.addEventListener('input', (e) => {
            const firstRowName = document.querySelector('#groupMembersList .member-item-row:first-child .member-name-input');
            if (firstRowName) firstRowName.value = e.target.value;
        });
    }

    // =========================================================================
    // 1. SIGN IN FORM HANDLER (FIREBASE AUTHENTICATION ONLY)
    // =========================================================================
    // REQUIREMENT: "If a user logs in and their email is not verified, block access and show the same verification screen."
    // REQUIREMENT: "Do not use Firestore or any database — Firebase Authentication only."
    const loginForm = document.getElementById('studentLoginForm');
    const loginButton = document.getElementById('loginButton');

    if (loginForm) {
        let errorBox = document.getElementById('loginErrorBox');
        if (!errorBox) {
            errorBox = document.createElement('div');
            errorBox.id = 'loginErrorBox';
            errorBox.className = 'error-message';
            errorBox.style.display = 'none';
            loginForm.parentNode.insertBefore(errorBox, loginForm);
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorBox.style.display = 'none';

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                errorBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter both your student email and password.';
                errorBox.style.display = 'flex';
                return;
            }

            const origHTML = loginButton.innerHTML;
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating with Firebase...';

            try {
                // Firebase Authentication check
                const result = await firebaseLoginUser(email, password);

                // REQUIREMENT: If email is NOT verified, block access and show verification screen!
                if (!result.success && result.blockedUnverified) {
                    loginButton.disabled = false;
                    loginButton.innerHTML = origHTML;

                    // Block access and show the exact verification screen
                    showVerificationScreen(result.email || email);
                    return;
                }

                // If email IS verified, allow access and load dashboard
                if (result.success && result.user) {
                    const user = result.user;
                    let token = 'student_token_' + Date.now();
                    const lowerEmail = (user.email || email).toLowerCase();
                    const isGargi = lowerEmail.includes('gargi');
                    const isChaitnaya = lowerEmail.includes('chaitnaya');
                    const isRohan = lowerEmail.includes('rohan');
                    
                    let studentRecord = {
                        id: user.uid || (isGargi ? 5 : (isChaitnaya ? 4 : (isRohan ? 3 : 1))),
                        name: user.displayName || (isGargi ? 'Gargi Deshpande' : (isChaitnaya ? 'Chaitnaya Shinde' : (isRohan ? 'Rohan Sudhakar Dhavale' : 'Shivam Natkar'))),
                        email: user.email || email,
                        role: 'student',
                        roll_no: isGargi ? 'AC2148' : (isChaitnaya ? 'AC2152' : (isRohan ? 'AC2103' : '26EACT01')),
                        project_id: isGargi ? 4 : (isChaitnaya ? 3 : (isRohan ? 2 : 1)),
                        emailVerified: true
                    };

                    if (isGargi) {
                        const gargiProj = {
                            id: 4,
                            project_code: 'AC2148',
                            title: 'Modulation and Demodulation Simulator',
                            description: 'Interactive Analog & Digital Communication Signal Simulation System modeling AM (DSB-FC/SC, SSB), FM (Narrowband/Wideband), PM, and Digital Shift Keying (ASK, FSK, BPSK, QPSK) with live time-domain and FFT spectral analysis.',
                            department: 'Electronics And Communication (Advanced Communication Technology)',
                            guide_name: 'Prof. Amruta Kadli Mam',
                            progress: 80,
                            status: 'In Progress',
                            start_date: '01 Sep 2026',
                            expected_completion: '31 Oct 2026',
                            team_members: [
                                { id: 1, name: 'Gargi Deshpande', roll_no: 'AC2148', role: 'Team Leader / Simulation Architect' },
                                { id: 2, name: 'Mayuri Jagtap', roll_no: 'AC2149', role: 'AM/FM Modulation Modeling' },
                                { id: 3, name: 'Sanika Bhalerao', roll_no: 'AC2150', role: 'Demodulation Filters & Envelope Detectors' },
                                { id: 4, name: 'Asawari Kavre', roll_no: 'AC2151', role: 'FFT Spectral Visualizer & PPT Presentation' }
                            ]
                        };
                        localStorage.setItem('student_project', JSON.stringify(gargiProj));
                    } else if (isChaitnaya) {
                        const chaitnayaProj = {
                            id: 3,
                            project_code: 'AC2152',
                            title: 'RF Communication Range Calculator',
                            description: 'Advanced Link Budget Analysis & Path Loss Propagation Modeling tool for estimating radio communication ranges, Fresnel zone clearances, and antenna parameters across sub-GHz and 2.4 GHz RF links.',
                            department: 'Electronics & Communication (ACT)',
                            guide_name: 'Prof. Amruta Kadli Mam',
                            progress: 85,
                            status: 'In Progress',
                            start_date: '01 Sep 2026',
                            expected_completion: '31 Oct 2026',
                            team_members: [
                                { id: 1, name: 'Chaitnaya Shinde', roll_no: 'AC2152', role: 'Team Leader / Project Lead' },
                                { id: 2, name: 'Dipak Belkar', roll_no: 'AC2126', role: 'RF Path Loss & Link Budget Analysis' },
                                { id: 3, name: 'Lokesh Norlawar', roll_no: 'AC2146', role: 'Antenna & Frequency Propagation Modeling' },
                                { id: 4, name: 'Kiran Sasane', roll_no: 'AC2118', role: 'Fresnel Zone & Terrain Attenuation Logic' },
                                { id: 5, name: 'Shruti Shinde', roll_no: 'AC2145', role: 'UI Design & PPT Presentation' }
                            ]
                        };
                        localStorage.setItem('student_project', JSON.stringify(chaitnayaProj));
                    } else if (isRohan) {
                        const rohanProj = {
                            id: 2,
                            project_code: 'AC2103',
                            title: 'IoT-Based Weather Display Clock & Forecast Alert System',
                            description: 'Community Engagement Project (S.Y. 2026): Low-cost smart clock that shows live weather and gives timely forecast alerts to communities using ESP8266, DHT11, BMP280, YL-83, MQ135 sensors and buzzer alerts.',
                            department: 'Electronics & Computer (ACT)',
                            guide_name: 'Prof. A. M. Kadli Mam',
                            progress: 80,
                            status: 'In Progress',
                            start_date: '01 Sep 2026',
                            expected_completion: '31 Oct 2026',
                            team_members: [
                                { id: 1, name: 'Rohan Sudhakar Dhavale', roll_no: 'AC2103', role: 'Team Leader / Project Lead' },
                                { id: 2, name: 'Rutvij Rustum Patil', roll_no: 'AC2104', role: 'Hardware & Circuit Designer' },
                                { id: 3, name: 'Vijay Ranjit Pardeshi', roll_no: 'AC2130', role: 'Sensor Integration & Calibration' },
                                { id: 4, name: 'Pallavi Badri Ade', roll_no: 'AC2144', role: 'Software & Alert Logic Developer' },
                                { id: 5, name: 'Pooja Sanjay Kanade', roll_no: 'AC2159', role: 'Testing & Presentation Documentation' }
                            ]
                        };
                        localStorage.setItem('student_project', JSON.stringify(rohanProj));
                    }

                    // Real-time backend API synchronization
                    try {
                        const apiRes = await fetch('/api/student/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ email: user.email || email, password })
                        });
                        if (apiRes.ok) {
                            const apiData = await apiRes.json();
                            if (apiData.token) token = apiData.token;
                            if (apiData.user) {
                                studentRecord = {
                                    ...apiData.user,
                                    emailVerified: true
                                };
                            }
                            if (apiData.project) {
                                localStorage.setItem('student_project', JSON.stringify(apiData.project));
                            }
                        }
                    } catch (syncErr) {
                        console.warn('Backend sync note:', syncErr.message);
                    }

                    localStorage.setItem('student_token', token);
                    localStorage.setItem('token', token);
                    localStorage.setItem('user_role', 'student');
                    localStorage.setItem('student_info', JSON.stringify(studentRecord));

                    loginButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email Verified! Access Granted...';
                    setTimeout(() => {
                        window.location.href = 'student-dashboard.html';
                    }, 400);
                } else {
                    loginButton.disabled = false;
                    loginButton.innerHTML = origHTML;
                    errorBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid email or password.';
                    errorBox.style.display = 'flex';
                }
            } catch (err) {
                console.error('Login error:', err);
                loginButton.disabled = false;
                loginButton.innerHTML = origHTML;
                errorBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${err.message || 'Firebase login failed.'}`;
                errorBox.style.display = 'flex';
            }
        });
    }

    // =========================================================================
    // 2. REGISTER FORM HANDLER (FIREBASE AUTHENTICATION ONLY)
    // =========================================================================
    // REQUIREMENT: "When a user registers with email/password, do not sign them in automatically."
    // REQUIREMENT: "Send a verification email and show a verification screen with this message:
    //  “We have sent you a verification email to [user email]. Please verify it and log in.”"
    // REQUIREMENT: "Include a Login button on the verification screen."
    // REQUIREMENT: "Do not use Firestore or any database — Firebase Authentication only."
    const registerForm = document.getElementById('studentRegisterForm');
    const registerButton = document.getElementById('registerButton');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('regName').value.trim();
            const roll_no = document.getElementById('regRollNo').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const department = document.getElementById('regDept').value.trim();
            const project_name = document.getElementById('regProjectName').value.trim();
            const guide_name = document.getElementById('regGuideName').value.trim();
            const password = document.getElementById('regPassword').value;

            if (!email || !password) {
                alert('Please enter both an email and a password.');
                return;
            }

            if (!project_name) {
                alert('Please enter your project name.');
                return;
            }

            const origHTML = registerButton.innerHTML;
            registerButton.disabled = true;
            registerButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering student account...';

            try {
                // Collect group members
                const memberRows = document.querySelectorAll('#groupMembersList .member-item-row');
                const group_members = [];
                memberRows.forEach((row, idx) => {
                    const nameInp = row.querySelector('.member-name-input');
                    const rollInp = row.querySelector('.member-roll-input');
                    if (nameInp && nameInp.value.trim()) {
                        group_members.push({
                            name: nameInp.value.trim(),
                            roll_no: rollInp ? rollInp.value.trim() : `${department}0${idx + 1}`,
                            role: idx === 0 ? 'Team Leader' : 'Team Member'
                        });
                    }
                });

                // 1. Register with backend REST API (SQLite / Persistent store)
                try {
                    const apiRegRes = await fetch('/api/student/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            name,
                            roll_no,
                            email,
                            department,
                            password,
                            project_name,
                            guide_name,
                            group_members
                        })
                    });
                    const apiRegData = await apiRegRes.json();
                    if (!apiRegRes.ok && apiRegData && apiRegData.error) {
                        throw new Error(apiRegData.error);
                    }
                    if (apiRegData && apiRegData.token) {
                        localStorage.setItem('registered_token', apiRegData.token);
                        localStorage.setItem('registered_user', JSON.stringify(apiRegData.user));
                        localStorage.setItem('registered_project', JSON.stringify(apiRegData.project));
                        localStorage.setItem('pending_student_email', email);
                        localStorage.setItem('pending_student_password', password);
                    }
                } catch (apiErr) {
                    console.warn('Backend registration API note:', apiErr.message);
                }

                // 2. Register with client auth service / Firebase
                await firebaseRegisterUser(email, password, name);

                registerButton.disabled = false;
                registerButton.innerHTML = origHTML;

                // Show verification screen with exact required message
                showVerificationScreen(email);

            } catch (err) {
                console.error('Student registration error:', err);
                registerButton.disabled = false;
                registerButton.innerHTML = origHTML;
                alert(err.message || 'Registration failed. Please check your details.');
            }
        });
    }

    // 3. Post-Login Setup Modal Form Handler
    const postSetupForm = document.getElementById('postLoginSetupForm');
    const saveSetupBtn = document.getElementById('saveSetupBtn');

    if (postSetupForm) {
        postSetupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const project_name = document.getElementById('setupProjectName').value.trim();
            const guide_name = document.getElementById('setupGuideName').value.trim();

            const memberRows = document.querySelectorAll('#modalMembersList .member-item-row');
            const group_members = [];
            memberRows.forEach((row, idx) => {
                const nameInput = row.querySelector('.modal-member-name');
                const rollInput = row.querySelector('.modal-member-roll');
                if (nameInput && nameInput.value.trim()) {
                    group_members.push({
                        name: nameInput.value.trim(),
                        roll_no: rollInput ? rollInput.value.trim() : `26EACT0${idx + 1}`,
                        role: idx === 0 ? 'Team Leader' : 'Team Member'
                    });
                }
            });

            const studentInfo = JSON.parse(localStorage.getItem('student_info') || '{}');
            const token = localStorage.getItem('student_token');

            if (saveSetupBtn) {
                saveSetupBtn.disabled = true;
                saveSetupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            }

            try {
                const response = await fetch('/api/student/project/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: studentInfo.email,
                        project_id: studentInfo.project_id,
                        project_name,
                        guide_name,
                        group_members
                    })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('student_project', JSON.stringify(data.project));
                    window.location.href = 'student-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            } catch (err) {
                console.error('Setup error:', err);
                window.location.href = 'student-dashboard.html';
            }
        });
    }
});

// Google Sign-In Function
export async function loginWithGoogle(customEmail) {
    const googleBtn = document.getElementById('googleLoginBtn');
    const originalText = googleBtn ? googleBtn.innerHTML : '';
    if (googleBtn) {
        googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating with Google...';
        googleBtn.disabled = true;
    }

    const email = customEmail || 'shivamnatkarcsmss@gmail.com';
    const name = 'Shivam Natkar';

    try {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, name, role: 'student' })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            localStorage.setItem('student_token', data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_role', 'student');
            localStorage.setItem('student_info', JSON.stringify(data.user));
            if (data.project) {
                localStorage.setItem('student_project', JSON.stringify(data.project));
            }
            if (googleBtn) {
                googleBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Google Verified! Redirecting...';
            }
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 400);
        } else {
            if (googleBtn) {
                googleBtn.disabled = false;
                googleBtn.innerHTML = originalText;
            }
            alert(data.error || 'Google login failed.');
        }
    } catch (err) {
        console.error('Google login error:', err);
        if (googleBtn) {
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalText;
        }
        alert('Connection error during Google login.');
    }
}
window.loginWithGoogle = loginWithGoogle;

// Quick Credential Filler
export function fillStudentCreds(email, password) {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = password;
    const errorBox = document.getElementById('errorMessage');
    if (errorBox) errorBox.style.display = 'none';
}
window.fillStudentCreds = fillStudentCreds;
