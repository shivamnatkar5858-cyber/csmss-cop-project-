// teacher-dashboard.js - Teacher Portal with Live Flask REST API & Chart.js

let chartInstance = null;
let allProjectsData = [];
let selectedProjectId = null;

function getTeacherAuthHeader() {
    const token = localStorage.getItem('teacher_token') || localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 1. Initial Dashboard Fetch
async function loadTeacherDashboard() {
    try {
        const response = await fetch('/api/teacher/dashboard', {
            headers: {
                ...getTeacherAuthHeader(),
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.success) {
                allProjectsData = data.projects || [];

                // Update Teacher Profile Info
                if (data.teacher) {
                    const profileAvatar = document.querySelector('.sidebar-bottom .profile-avatar');
                    const profileName = document.querySelector('.teacher-mini-profile strong');
                    const topAvatar = document.querySelector('.topbar-right .profile-avatar');
                    const topName = document.querySelector('.topbar-right .profile-text strong');

                    if (profileAvatar) profileAvatar.textContent = data.teacher.initials || 'AK';
                    if (profileName) profileName.textContent = data.teacher.name || 'Prof. A. M. Kadli Mam';
                    if (topAvatar) topAvatar.textContent = data.teacher.initials || 'AK';
                    if (topName) topName.textContent = data.teacher.name || 'Prof. A. M. Kadli Mam';
                }

                // Update Stats Counters
                const stats = data.stats || data.statistics;
                if (stats) {
                    const tp = document.getElementById('totalProjects');
                    const ap = document.getElementById('activeProjects');
                    const cp = document.getElementById('completedProjects');
                    const rp = document.getElementById('riskProjects');

                    if (tp) tp.textContent = stats.totalProjects;
                    if (ap) ap.textContent = stats.activeProjects;
                    if (cp) cp.textContent = stats.completedProjects;
                    if (rp) rp.textContent = stats.riskProjects;
                }

                // Render Chart.js
                if (data.chart && data.chart.labels && data.chart.data) {
                    renderChart(data.chart.labels, data.chart.data);
                }

                // Render Deadlines
                renderDeadlines(data.deadlines || []);

                // Render Dashboard Projects Table
                renderProjectTable(allProjectsData);

                // Render Recent Reports
                renderRecentReports(data.recentReports || data.reports || []);

                // Render Recent Activity
                renderRecentActivity(data.recentActivity || data.activities || []);

                // Render Full Projects Section Cards
                renderProjectCards(allProjectsData);
                return;
            }
        }
    } catch (err) {
        console.warn('[Netlify Fallback] Live backend not reached, loading autonomous data for Prof. A. M. Kadli Mam:', err.message);
    }

    // Fallback: Populate complete presentation dashboard for Netlify & Offline mode
    applyFallbackTeacherDashboardData();
}

// Netlify Autonomous Teacher Dashboard Loader
function applyFallbackTeacherDashboardData() {
    console.log('[Netlify Autonomous Engine] Loading teacher dashboard data for Prof. A. M. Kadli Mam.');
    
    // Teacher profile
    const profileAvatar = document.querySelector('.sidebar-bottom .profile-avatar');
    const profileName = document.querySelector('.teacher-mini-profile strong');
    const topAvatar = document.querySelector('.topbar-right .profile-avatar');
    const topName = document.querySelector('.topbar-right .profile-text strong');

    if (profileAvatar) profileAvatar.textContent = 'AK';
    if (profileName) profileName.textContent = 'Prof. A. M. Kadli Mam';
    if (topAvatar) topAvatar.textContent = 'AK';
    if (topName) topName.textContent = 'Prof. A. M. Kadli Mam';

    // Stats
    const tp = document.getElementById('totalProjects');
    const ap = document.getElementById('activeProjects');
    const cp = document.getElementById('completedProjects');
    const rp = document.getElementById('riskProjects');

    if (tp) tp.textContent = '4';
    if (ap) ap.textContent = '4';
    if (cp) cp.textContent = '0';
    if (rp) rp.textContent = '0';

    // Projects list
    allProjectsData = [
        {
            id: 1,
            project_code: 'SIH26103',
            title: 'Web-Based Integrated Project Monitoring System',
            department: 'E&ACT',
            progress: 90,
            status: 'In Progress',
            team_leader: 'Shivam Natkar',
            team_count: '5 Students',
            deadline: '31 Oct 2026',
            description: 'Centralized integrated college project monitoring platform enabling students to submit progress reports, upload project documentation, track milestones, and receive real-time guide feedback.',
            team_members: [
                { id: 1, name: 'Shivam Natkar', roll_no: '26EACT01', role: 'Team Leader / Full-Stack Developer' },
                { id: 2, name: 'Sakshi Arbad', roll_no: '26EACT02', role: 'UI/UX & Frontend Designer' },
                { id: 3, name: 'Tejal Bhanuse', roll_no: '26EACT03', role: 'Backend & Database Developer' },
                { id: 4, name: 'Karan Sangle', roll_no: '26EACT04', role: 'Testing & Quality Assurance' },
                { id: 5, name: 'Abhishek Malwade', roll_no: '26EACT05', role: 'Documentation & Presentation' }
            ],
            milestones: [
                { id: 1, title: 'Project Topic Selection & Synopsis Submission', is_completed: true },
                { id: 2, title: 'Requirement Analysis & SRS Documentation', is_completed: true },
                { id: 3, title: 'System Architecture & Database Schema Design', is_completed: true },
                { id: 4, title: 'Frontend UI & Backend REST API Implementation', is_completed: true },
                { id: 5, title: 'Final Presentation, Testing & PPT Defense', is_completed: false }
            ]
        },
        {
            id: 2,
            project_code: 'AC2103',
            title: 'IoT-Based Weather Display Clock & Forecast Alert System',
            department: 'Electronics & Computer (ACT)',
            progress: 80,
            status: 'In Progress',
            team_leader: 'Rohan Sudhakar Dhavale',
            team_count: '5 Students',
            deadline: '31 Oct 2026',
            description: 'Community Engagement Project (S.Y. 2026). Low-cost IoT weather station clock displaying real-time temperature, humidity, atmospheric pressure, and rain forecast alerts using ESP8266, DHT11, BMP280, YL-83, MQ135, and 0.96" OLED display.',
            team_members: [
                { id: 1, name: 'Rohan Sudhakar Dhavale', roll_no: 'AC2103', role: 'Team Leader / Hardware & Embedded Lead' },
                { id: 2, name: 'Rutvij Rustum Patil', roll_no: 'AC2104', role: 'Hardware & Sensor Interfacing' },
                { id: 3, name: 'Vijay Ranjit Pardeshi', roll_no: 'AC2130', role: 'Circuit Design & Power Management' },
                { id: 4, name: 'Pallavi Badri Ade', roll_no: 'AC2144', role: 'Firmware & Forecast Alert Logic' },
                { id: 5, name: 'Pooja Sanjay Kanade', roll_no: 'AC2159', role: 'Documentation & PPT Presentation' }
            ],
            milestones: [
                { id: 1, title: 'Topic Selection & Sensor Calibration (DHT11/BMP280)', is_completed: true },
                { id: 2, title: 'Literature Survey & Circuit Prototyping', is_completed: true },
                { id: 3, title: 'OLED UI & Environmental Sensing Logic', is_completed: true },
                { id: 4, title: 'Buzzer Storm Warnings & Forecast Alerts', is_completed: true },
                { id: 5, title: 'Community Project Defense & PPT Presentation', is_completed: false }
            ]
        },
        {
            id: 3,
            project_code: 'AC2152',
            title: 'RF Communication Range Calculator',
            department: 'Electronics & Communication (ACT)',
            progress: 85,
            status: 'In Progress',
            team_leader: 'Chaitnaya Shinde',
            team_count: '5 Students',
            deadline: '31 Oct 2026',
            description: 'Advanced Link Budget Analysis & Path Loss Propagation Modeling tool for estimating radio communication ranges, Fresnel zone clearances, and antenna parameters across sub-GHz and 2.4 GHz RF links.',
            team_members: [
                { id: 1, name: 'Chaitnaya Shinde', roll_no: 'AC2152', role: 'Team Leader / Project Lead' },
                { id: 2, name: 'Dipak Belkar', roll_no: 'AC2126', role: 'RF Path Loss & Link Budget Analysis' },
                { id: 3, name: 'Lokesh Norlawar', roll_no: 'AC2146', role: 'Antenna & Frequency Propagation Modeling' },
                { id: 4, name: 'Kiran Sasane', roll_no: 'AC2118', role: 'Fresnel Zone & Terrain Attenuation Logic' },
                { id: 5, name: 'Shruti Shinde', roll_no: 'AC2145', role: 'UI Design & PPT Presentation' }
            ],
            milestones: [
                { id: 1, title: 'RF Link Budget & Path Loss Formulation', is_completed: true },
                { id: 2, title: 'Antenna Gain & Sensitivity Modeling', is_completed: true },
                { id: 3, title: 'Interactive Web-Based Calculator UI', is_completed: true },
                { id: 4, title: 'Multi-Frequency Terrain & Clutter Calibration', is_completed: true },
                { id: 5, title: 'Final Defense, Documentation & PPT Presentation', is_completed: false }
            ]
        },
        {
            id: 4,
            project_code: 'AC2148',
            title: 'Modulation and Demodulation Simulator',
            department: 'Electronics And Communication (Advanced Communication Technology)',
            progress: 80,
            status: 'In Progress',
            team_leader: 'Gargi Deshpande',
            team_count: '4 Students',
            deadline: '31 Oct 2026',
            description: 'Interactive Analog & Digital Communication Signal Simulation System modeling AM (DSB-FC/SC, SSB), FM (Narrowband/Wideband), PM, and Digital Shift Keying (ASK, FSK, BPSK, QPSK) with live time-domain and FFT spectral analysis.',
            team_members: [
                { id: 1, name: 'Gargi Deshpande', roll_no: 'AC2148', role: 'Team Leader / Simulation Architect' },
                { id: 2, name: 'Mayuri Jagtap', roll_no: 'AC2149', role: 'AM/FM Modulation Modeling' },
                { id: 3, name: 'Sanika Bhalerao', roll_no: 'AC2150', role: 'Demodulation Filters & Envelope Detectors' },
                { id: 4, name: 'Asawari Kavre', roll_no: 'AC2151', role: 'FFT Spectral Visualizer & PPT Presentation' }
            ],
            milestones: [
                { id: 1, title: 'Mathematical Waveform Equations Formulation', is_completed: true },
                { id: 2, title: 'Time-Domain Waveform & Live FFT Spectrum Visualizer', is_completed: true },
                { id: 3, title: 'Demodulation Filters & Noise Injection Module', is_completed: true },
                { id: 4, title: 'Interactive Web UI & Parameter Control Sliders', is_completed: true },
                { id: 5, title: 'Final Defense, Presentation & Faculty Evaluation', is_completed: false }
            ]
        }
    ];

    // Chart.js
    renderChart(['SIH26103', 'AC2103', 'AC2152', 'AC2148'], [90, 80, 85, 80]);

    // Deadlines
    renderDeadlines([
        {
            id: 1,
            project: 'Web-Based Integrated Project Monitoring System',
            code: 'SIH26103',
            project_code: 'SIH26103',
            title: 'Final Project Presentation & Defense',
            type: 'Presentation & Demo (90%)',
            status: 'Urgent',
            deadline: '31 Oct 2026',
            days_remaining: 'Final Presentation: 31st October 2026'
        },
        {
            id: 2,
            project: 'IoT-Based Weather Display Clock & Forecast Alert System',
            code: 'AC2103',
            project_code: 'AC2103',
            title: 'Community Project Defense & PPT Presentation',
            type: 'Presentation & Demo (80%)',
            status: 'Urgent',
            deadline: '31 Oct 2026',
            days_remaining: 'Final Presentation: 31st October 2026'
        },
        {
            id: 3,
            project: 'RF Communication Range Calculator',
            code: 'AC2152',
            project_code: 'AC2152',
            title: 'Final Defense & PPT Presentation',
            type: 'Presentation & Demo (85%)',
            status: 'Urgent',
            deadline: '31 Oct 2026',
            days_remaining: 'Final Presentation: 31st October 2026'
        },
        {
            id: 4,
            project: 'Modulation and Demodulation Simulator',
            code: 'AC2148',
            project_code: 'AC2148',
            title: 'Simulation Defense & PPT Presentation',
            type: 'Presentation & Demo (80%)',
            status: 'Urgent',
            deadline: '31 Oct 2026',
            days_remaining: 'Final Presentation: 31st October 2026'
        }
    ]);

    // Tables & cards
    renderProjectTable(allProjectsData);
    renderProjectCards(allProjectsData);

    // Reports
    renderRecentReports([
        {
            id: 5,
            project_id: 4,
            title: 'Modulation & Demodulation Simulator Presentation (PPT/PDF)',
            original_filename: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
            file_name: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
            file_path: '/assets/aistudio/Modulation_and_Demodulation_Simulator_Presentation.pdf',
            status: 'Approved',
            feedback: 'Waveform equations and FFT analysis approved at 80% progress by Prof. Amruta Kadli Mam.',
            submission_date: '30 Oct 2026',
            submitter_name: 'Gargi Deshpande'
        },
        {
            id: 4,
            project_id: 3,
            title: 'RF Communication Range Calculator Presentation (PPT/PDF)',
            original_filename: 'RF_Communication_Range_Calculator_Presentation.pdf',
            file_name: 'RF_Communication_Range_Calculator_Presentation.pdf',
            file_path: '/assets/aistudio/RF_Communication_Range_Calculator_Presentation.pdf',
            status: 'Approved',
            feedback: 'Link budget formulations and calculator UI approved at 85% progress by Prof. Amruta Kadli Mam.',
            submission_date: '30 Oct 2026',
            submitter_name: 'Chaitnaya Shinde'
        },
        {
            id: 3,
            project_id: 2,
            title: 'IoT Weather Clock CEP Presentation (PPT/PDF)',
            original_filename: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
            file_name: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
            file_path: '/assets/aistudio/IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
            status: 'Approved',
            feedback: 'Presentation slides reviewed. 80% progress approved by Prof. A. M. Kadli Mam.',
            submission_date: '29 Oct 2026',
            submitter_name: 'Rohan Sudhakar Dhavale'
        },
        {
            id: 2,
            project_id: 1,
            title: 'Final Presentation Slides (PPT)',
            original_filename: 'Web_Based_Project_Monitoring_Presentation.pptx',
            file_name: 'Web_Based_Project_Monitoring_Presentation.pptx',
            file_path: '/uploads/1791732756586_test_slide.pptx',
            status: 'Under Review',
            feedback: 'Slides submitted for final defense evaluation.',
            submission_date: '28 Oct 2026',
            submitter_name: 'Shivam Natkar'
        }
    ]);

    // Recent activity
    renderRecentActivity([
        {
            title: 'Modulation Simulator PPT Uploaded',
            project: 'AC2148',
            detail: 'Gargi Deshpande & team submitted Modulation Simulator PPT (Progress: 80%)',
            time: 'Just now',
            icon: 'file-powerpoint'
        },
        {
            title: 'RF Calculator PPT Submitted',
            project: 'AC2152',
            detail: 'Chaitnaya Shinde & team submitted RF Range Calculator PPT (Progress: 85%)',
            time: '15 mins ago',
            icon: 'file-powerpoint'
        },
        {
            title: 'CEP Weather Clock PPT Uploaded',
            project: 'AC2103',
            detail: 'Rohan Sudhakar Dhavale uploaded IoT Weather Clock PPT (Progress: 80%)',
            time: '30 mins ago',
            icon: 'file-powerpoint'
        },
        {
            title: 'Project Progress reaches 90%',
            project: 'SIH26103',
            detail: 'SIH26103 - Shivam Natkar & team reached 90% milestone progress',
            time: '2 hours ago',
            icon: 'chart-line'
        }
    ]);
}

// 2. Render Chart.js Progress Chart
function renderChart(labels, values) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Progress %',
                data: values,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(239, 68, 68, 0.85)'
                ],
                borderColor: [
                    '#4f46e5',
                    '#0ea5e9',
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 1.5,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (v) => v + '%'
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.6)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 3. Render Upcoming Deadlines
function renderDeadlines(deadlines) {
    const list = document.getElementById('deadlineList');
    if (!list) return;

    list.innerHTML = '';
    if (deadlines.length === 0) {
        list.innerHTML = '<p style="color: #64748b; font-size: 0.88rem;">No upcoming deadlines.</p>';
        return;
    }

    deadlines.forEach(d => {
        const item = document.createElement('div');
        const isUrgent = d.status === 'Urgent';
        item.className = `deadline-item ${isUrgent ? 'urgent' : 'upcoming'}`;
        const projName = d.project || d.title || 'Project Milestone';
        const projCode = d.code || d.project_code || 'SIH26103';
        const dType = d.type || 'Review Deadline';
        const dStatus = d.status || d.days_remaining || 'Upcoming';
        item.innerHTML = `
            <div class="deadline-info">
                <strong>${projName} (${projCode})</strong>
                <small>${dType} &bull; ${dStatus}</small>
            </div>
            <div class="deadline-date">
                <i class="fa-regular fa-calendar"></i> ${d.deadline}
            </div>
        `;
        list.appendChild(item);
    });
}

// 4. Render Project Table
function renderProjectTable(projects) {
    const tbody = document.getElementById('dashboardProjectTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    projects.forEach(p => {
        const tr = document.createElement('tr');
        const statusClass = p.status === 'Completed' ? 'completed-status' : (p.status === 'At Risk' ? 'status' : 'progress-status');
        const statusColor = p.status === 'At Risk' ? 'style="background: #fee2e2; color: #b91c1c;"' : '';

        tr.innerHTML = `
            <td>
                <strong>${p.title}</strong><br>
                <small style="color: #64748b;">${p.project_code} &bull; ${p.department}</small>
            </td>
            <td>${p.team_count}</td>
            <td>
                <div class="table-progress">
                    <div class="bar">
                        <div class="bar-fill" style="width: ${p.progress}%"></div>
                    </div>
                    <span>${p.progress}%</span>
                </div>
            </td>
            <td>
                <span class="status ${statusClass}" ${statusColor}>${p.status}</span>
            </td>
            <td>${p.deadline}</td>
            <td>
                <button class="table-action-btn" onclick="openProjectModal(${p.id})">
                    <i class="fa-solid fa-eye"></i> View
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. Render Recent Reports
function renderRecentReports(reports) {
    const list = document.getElementById('recentReports');
    if (!list) return;

    list.innerHTML = '';
    if (!reports || reports.length === 0) {
        list.innerHTML = '<p style="color: #64748b; font-size: 0.88rem;">No recent reports submitted.</p>';
        return;
    }

    reports.forEach(r => {
        const item = document.createElement('div');
        item.className = 'report-item';
        const isPpt = (r.file_type === 'presentation') || (r.file_name && (r.file_name.endsWith('.ppt') || r.file_name.endsWith('.pptx')));
        const icon = isPpt ? 'fa-file-powerpoint' : 'fa-file-pdf';
        const iconColor = isPpt ? 'color: #ea580c;' : 'color: #ef4444;';
        const tag = isPpt ? '<span style="background: #ffedd5; color: #c2410c; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-left: 6px;">PPT Slides</span>' : '';

        item.innerHTML = `
            <div class="report-icon" style="${iconColor}">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="report-text">
                <strong>${r.title} ${tag}</strong>
                <small>Submitted ${r.submission_date || 'Recently'} &bull; Status: <span style="font-weight: 600;">${r.status}</span></small>
            </div>
            ${r.file_path ? `<a href="${r.file_path}" download="${r.file_name || 'presentation'}" target="_blank" class="table-action-btn" title="Download File" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;"><i class="fa-solid fa-download"></i></a>` : ''}
        `;
        list.appendChild(item);
    });
}

// 6. Render Recent Activity
function renderRecentActivity(activities) {
    const list = document.getElementById('activityList');
    if (!list) return;

    list.innerHTML = '';
    activities.forEach(a => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fa-solid fa-${a.icon || 'check'}"></i>
            </div>
            <div class="activity-text">
                <strong>${a.title} - ${a.project}</strong>
                <small>${a.detail} &bull; ${a.time}</small>
            </div>
        `;
        list.appendChild(item);
    });
}

// 7. Render Project Cards for "My Projects" Section
function renderProjectCards(projects) {
    const container = document.getElementById('projectList');
    if (!container) return;

    container.innerHTML = '';
    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div>
                <div class="project-card-header">
                    <div>
                        <span class="project-code-tag">${p.project_code}</span>
                        <h4>${p.title}</h4>
                    </div>
                    <span class="status ${p.status === 'Completed' ? 'completed-status' : 'progress-status'}">
                        ${p.status}
                    </span>
                </div>
                <p>${p.description}</p>
            </div>
            <div>
                <div class="table-progress" style="margin-bottom: 0.8rem;">
                    <div class="bar" style="width: 100%;">
                        <div class="bar-fill" style="width: ${p.progress}%"></div>
                    </div>
                    <strong>${p.progress}%</strong>
                </div>
                <div class="project-card-footer">
                    <small style="color: #64748b;"><i class="fa-solid fa-users"></i> ${p.team_count}</small>
                    <button class="table-action-btn" onclick="openProjectModal(${p.id})">
                        Manage Project
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 8. Project Details Modal
function openProjectModal(id) {
    selectedProjectId = id;
    const project = allProjectsData.find(p => p.id === id);
    if (!project) return;

    const modal = document.getElementById('projectDetailsModal');
    if (!modal) return;

    document.getElementById('modalProjectName').textContent = project.title;
    document.getElementById('modalProjectDescription').textContent = project.description;
    document.getElementById('modalProjectStatus').textContent = project.status;
    document.getElementById('modalProjectTeam').textContent = project.team_count;
    document.getElementById('modalProjectDeadline').textContent = project.deadline;
    document.getElementById('modalProjectProgress').textContent = `${project.progress}%`;
    document.getElementById('modalProgressText').textContent = `${project.progress}%`;
    document.getElementById('modalProgressBar').style.width = `${project.progress}%`;

    modal.style.display = 'flex';
}

function closeProjectModal() {
    const modal = document.getElementById('projectDetailsModal');
    if (modal) modal.style.display = 'none';
}

function openStudentTeams() {
    closeProjectModal();
    switchSection('students');
}

function openReports() {
    closeProjectModal();
    switchSection('reports');
}

function openFeedback() {
    closeProjectModal();
    switchSection('feedback');
}

// 9. Section Switcher
function switchSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update active content section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active-section');
    });

    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }

    // Update Topbar Title
    const titleMap = {
        'dashboard': 'Teacher Dashboard',
        'projects': 'My Assigned Projects',
        'students': 'Students & Teams',
        'progress': 'Progress Monitoring',
        'reports': 'Submitted Reports',
        'feedback': 'Student Feedback',
        'evaluation': 'Project Evaluation',
        'deadlines': 'Upcoming Deadlines',
        'notifications': 'System Notifications',
        'settings': 'Faculty Settings'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titleMap[sectionId] || 'Teacher Dashboard';

    // Section specific loaders
    if (sectionId === 'students') {
        loadStudentsSection();
    } else if (sectionId === 'reports') {
        loadReportsSection();
    } else if (sectionId === 'notifications') {
        loadNotificationsSection();
    }
}

// Students section loader
async function loadStudentsSection() {
    const container = document.getElementById('studentsSection');
    if (!container) return;

    try {
        const res = await fetch('/api/teacher/students', { headers: getTeacherAuthHeader() });
        const data = await res.json();
        if (data.students) {
            container.innerHTML = `
                <div class="panel">
                    <div class="panel-header">
                        <div>
                            <h3>Registered Students</h3>
                            <p>Assigned students and their project allocations</p>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Roll No</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Assigned Project</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.students.map(s => `
                                    <tr>
                                        <td><strong>${s.name}</strong></td>
                                        <td>${s.roll_no || 'N/A'}</td>
                                        <td>${s.department}</td>
                                        <td>${s.year}</td>
                                        <td><span class="status progress-status">${s.project_code || 'Unassigned'} - ${s.project_title}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
    }
}

// Reports section loader
async function loadReportsSection() {
    const container = document.getElementById('reportsSection');
    if (!container) return;

    try {
        const res = await fetch('/api/reports', { headers: getTeacherAuthHeader() });
        const data = await res.json();
        if (data.reports) {
            container.innerHTML = `
                <div class="panel">
                    <div class="panel-header">
                        <div>
                            <h3>Student Project Reports</h3>
                            <p>Review submitted SRS, design blueprints, and progress documents</p>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Report Title</th>
                                    <th>Submitted By</th>
                                    <th>Submission Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reports.map(r => `
                                    <tr>
                                        <td><strong>${r.title}</strong></td>
                                        <td>${r.submitter_name}</td>
                                        <td>${new Date(r.submission_date).toLocaleDateString()}</td>
                                        <td><span class="status ${r.status === 'approved' ? 'completed-status' : 'progress-status'}">${r.status}</span></td>
                                        <td>
                                            ${r.file_path ? `<a href="${r.file_path}" target="_blank" class="table-action-btn" style="text-decoration:none;"><i class="fa-solid fa-download"></i> View File</a>` : ''}
                                            <button class="table-action-btn" onclick="reviewReportPrompt(${r.id})"><i class="fa-solid fa-pen"></i> Review</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
    }
}

function showTeacherNotificationToast(msg, isSuccess = true) {
    let toast = document.getElementById('teacherToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'teacherToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.zIndex = '9999';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '10px';
        toast.style.color = '#fff';
        toast.style.fontWeight = '500';
        toast.style.fontSize = '0.92rem';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        document.body.appendChild(toast);
    }
    toast.style.background = isSuccess ? '#10b981' : '#ef4444';
    toast.innerHTML = `<i class="fa-solid fa-${isSuccess ? 'circle-check' : 'circle-exclamation'}"></i> ${msg}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 4000);
}

async function reviewReportPrompt(reportId) {
    const feedback = prompt("Enter teacher review feedback for this report:");
    if (!feedback) return;

    try {
        const res = await fetch(`/api/reports/${reportId}/review`, {
            method: 'POST',
            headers: {
                ...getTeacherAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'reviewed', feedback: feedback })
        });
        const data = await res.json();
        if (data.success) {
            showTeacherNotificationToast('Review feedback saved and student notified!');
            loadReportsSection();
        }
    } catch (e) {
        console.error(e);
        showTeacherNotificationToast('Failed to save review feedback', false);
    }
}

// Notifications section loader
async function loadNotificationsSection() {
    const container = document.getElementById('notificationsSection');
    if (!container) return;

    container.innerHTML = `
        <div class="panel" style="max-width: 600px; margin-bottom: 2rem;">
            <div class="panel-header">
                <h3>Broadcast Notification</h3>
            </div>
            <form id="sendNotifForm" onsubmit="handleSendNotification(event)">
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; font-size: 0.88rem; font-weight:600; margin-bottom: 0.4rem;">Notification Title</label>
                    <input type="text" id="notifTitle" required placeholder="e.g. Project Review Schedule" style="width: 100%; padding: 0.7rem; border: 1.5px solid #e2e8f0; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; font-size: 0.88rem; font-weight:600; margin-bottom: 0.4rem;">Message</label>
                    <textarea id="notifMessage" required rows="3" placeholder="Enter message to student teams..." style="width: 100%; padding: 0.7rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit;"></textarea>
                </div>
                <button type="submit" class="table-action-btn" style="background: #4f46e5; color: white; padding: 0.7rem 1.5rem;">
                    <i class="fa-solid fa-paper-plane"></i> Send to All Students
                </button>
            </form>
        </div>
    `;
}

async function handleSendNotification(e) {
    e.preventDefault();
    const title = document.getElementById('notifTitle').value;
    const message = document.getElementById('notifMessage').value;

    try {
        const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                ...getTeacherAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, message, type: 'alert' })
        });
        const data = await res.json();
        if (data.success) {
            showTeacherNotificationToast('Notification successfully broadcast to students!');
            document.getElementById('notifTitle').value = '';
            document.getElementById('notifMessage').value = '';
        }
    } catch (err) {
        console.error(err);
        showTeacherNotificationToast('Failed to broadcast notification', false);
    }
}

// 10. Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
    // Nav Items click handler
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (section) switchSection(section);
        });
    });

    // View All button links
    document.querySelectorAll('[data-section-link]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sec = btn.getAttribute('data-section-link');
            if (sec) switchSection(sec);
        });
    });

    // Search and filter in Projects Section
    const searchInput = document.getElementById('projectSearch');
    const filterSelect = document.getElementById('projectStatusFilter');

    function filterProjects() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const filter = filterSelect ? filterSelect.value : 'all';

        const filtered = allProjectsData.filter(p => {
            const matchesQuery = p.title.toLowerCase().includes(query) || p.project_code.toLowerCase().includes(query);
            let matchesFilter = true;
            if (filter === 'active') matchesFilter = (p.status === 'In Progress' || p.status === 'Active');
            else if (filter === 'completed') matchesFilter = (p.status === 'Completed');
            else if (filter === 'risk') matchesFilter = (p.status === 'At Risk');

            return matchesQuery && matchesFilter;
        });
        renderProjectCards(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filterProjects);
    if (filterSelect) filterSelect.addEventListener('change', filterProjects);

    // Global Top Search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                switchSection('projects');
                if (searchInput) {
                    searchInput.value = globalSearch.value;
                    filterProjects();
                }
            }
        });
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (e) {
                console.log(e);
            }
            localStorage.removeItem('teacher_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('teacher_info');
            window.location.href = 'teacher-login.html';
        });
    }

    // Load initial teacher dashboard data
    loadTeacherDashboard();
});
