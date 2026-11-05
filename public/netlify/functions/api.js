// netlify/functions/api.js - Serverless Backend for Netlify Deployment

export async function handler(event, context) {
    const rawPath = (event.path || '').replace('/.netlify/functions/api', '').replace('/api', '');
    const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
    const method = event.httpMethod || 'GET';

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    };

    if (method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    let body = {};
    if (event.body) {
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            body = {};
        }
    }

    const authHeader = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
    const isGargiToken = authHeader.toLowerCase().includes('gargi');
    const isChaitnayaToken = authHeader.toLowerCase().includes('chaitnaya');
    const isRohanToken = authHeader.toLowerCase().includes('rohan');

    // 1. Teacher Login
    if (path === '/teacher/login' && method === 'POST') {
        const email = body.email || 'teachercsmss@gmail.com';
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token: 'netlify_teacher_jwt_' + Date.now(),
                user: {
                    id: 2,
                    name: 'Prof. Amruta Kadli Mam',
                    email: email,
                    role: 'teacher',
                    department: 'Electronics And Communication (ACT)',
                    designation: 'Assistant Professor & Project Coordinator',
                    initials: 'AK'
                }
            })
        };
    }

    // 2. Teacher Dashboard
    if (path === '/teacher/dashboard' && method === 'GET') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                teacher: {
                    id: 2,
                    name: 'Prof. Amruta Kadli Mam',
                    initials: 'AK',
                    department: 'Electronics And Communication (ACT)',
                    designation: 'Faculty Guide & Project Coordinator',
                    phone: '+91 9876543210'
                },
                statistics: { totalProjects: 4, activeProjects: 4, completedProjects: 0, riskProjects: 0 },
                stats: { totalProjects: 4, activeProjects: 4, completedProjects: 0, riskProjects: 0 },
                chart: { labels: ['SIH26103', 'AC2103', 'AC2152', 'AC2148'], data: [90, 80, 85, 80] },
                projects: [
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
                        description: 'Centralized integrated college project monitoring platform enabling students to submit progress reports, upload project documentation, track milestones, and receive real-time guide feedback.'
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
                        description: 'Community Engagement Project (S.Y. 2026). Low-cost IoT weather station clock displaying real-time temperature, humidity, atmospheric pressure, and rain forecast alerts using ESP8266, DHT11, BMP280, YL-83, MQ135, and 0.96" OLED display.'
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
                        description: 'Advanced Link Budget Analysis & Path Loss Propagation Modeling tool for estimating radio communication ranges, Fresnel zone clearances, and antenna parameters across sub-GHz and 2.4 GHz RF links.'
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
                        description: 'Interactive Analog & Digital Communication Signal Simulation System modeling AM (DSB-FC/SC, SSB), FM (Narrowband/Wideband), PM, and Digital Shift Keying (ASK, FSK, BPSK, QPSK) with live time-domain and FFT spectral analysis.'
                    }
                ],
                deadlines: [
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
                ],
                reports: [
                    {
                        id: 5,
                        project_id: 4,
                        title: 'Modulation & Demodulation Simulator Presentation (PPT/PDF)',
                        file_path: '/assets/aistudio/Modulation_and_Demodulation_Simulator_Presentation.pdf',
                        original_filename: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
                        file_name: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
                        status: 'Approved',
                        feedback: 'Waveform equations and FFT analysis approved at 80% progress by Prof. Amruta Kadli Mam.',
                        submission_date: '30 Oct 2026',
                        submitter_name: 'Gargi Deshpande'
                    },
                    {
                        id: 4,
                        project_id: 3,
                        title: 'RF Communication Range Calculator Presentation (PPT/PDF)',
                        file_path: '/assets/aistudio/RF_Communication_Range_Calculator_Presentation.pdf',
                        original_filename: 'RF_Communication_Range_Calculator_Presentation.pdf',
                        file_name: 'RF_Communication_Range_Calculator_Presentation.pdf',
                        status: 'Approved',
                        feedback: 'Link budget formulations and calculator UI approved at 85% progress by Prof. Amruta Kadli Mam.',
                        submission_date: '30 Oct 2026',
                        submitter_name: 'Chaitnaya Shinde'
                    },
                    {
                        id: 3,
                        project_id: 2,
                        title: 'IoT Weather Clock CEP Presentation (PPT/PDF)',
                        file_path: '/assets/aistudio/IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
                        original_filename: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
                        file_name: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
                        status: 'Approved',
                        feedback: 'Presentation slides and hardware architecture reviewed. Progress approved at 80% by Prof. A. M. Kadli Mam.',
                        submission_date: '29 Oct 2026',
                        submitter_name: 'Rohan Sudhakar Dhavale'
                    },
                    {
                        id: 2,
                        project_id: 1,
                        title: 'Final Presentation Slides (PPT)',
                        file_path: '/uploads/1791732756586_test_slide.pptx',
                        original_filename: 'Web_Based_Project_Monitoring_Presentation.pptx',
                        status: 'Under Review',
                        feedback: 'Slides submitted for final defense evaluation.',
                        submission_date: '28 Oct 2026',
                        submitter_name: 'Shivam Natkar'
                    }
                ],
                recentReports: [
                    {
                        id: 5,
                        project_id: 4,
                        title: 'Modulation & Demodulation Simulator Presentation (PPT/PDF)',
                        original_filename: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
                        file_name: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
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
                        status: 'Approved',
                        feedback: 'Presentation slides and hardware architecture reviewed. Progress approved at 80% by Prof. A. M. Kadli Mam.',
                        submission_date: '29 Oct 2026',
                        submitter_name: 'Rohan Sudhakar Dhavale'
                    }
                ],
                recentActivity: [
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
                ]
            })
        };
    }

    // 3. Student Login
    if (path === '/student/login' && method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        const isGargi = email.includes('gargi');
        const isChaitnaya = email.includes('chaitnaya');
        const isRohan = email.includes('rohan');

        if (isGargi) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token: 'netlify_student_jwt_gargi_' + Date.now(),
                    user: {
                        id: 5,
                        name: 'Gargi Deshpande',
                        email: email || 'gargideshpande@gmail.com',
                        roll_no: 'AC2148',
                        department: 'Electronics And Communication (Advanced Communication Technology)',
                        role: 'student',
                        project_id: 4
                    },
                    project: {
                        id: 4,
                        title: 'Modulation and Demodulation Simulator',
                        project_code: 'AC2148',
                        progress: 80,
                        status: 'In Progress'
                    }
                })
            };
        }

        if (isChaitnaya) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token: 'netlify_student_jwt_chaitnaya_' + Date.now(),
                    user: {
                        id: 4,
                        name: 'Chaitnaya Shinde',
                        email: email || 'chaitnayashinde@gmail.com',
                        roll_no: 'AC2152',
                        department: 'Electronics & Communication (ACT)',
                        role: 'student',
                        project_id: 3
                    },
                    project: {
                        id: 3,
                        title: 'RF Communication Range Calculator',
                        project_code: 'AC2152',
                        progress: 85,
                        status: 'In Progress'
                    }
                })
            };
        }

        if (isRohan) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token: 'netlify_student_jwt_rohan_' + Date.now(),
                    user: {
                        id: 3,
                        name: 'Rohan Sudhakar Dhavale',
                        email: email || 'rohandhavale@gmail.com',
                        roll_no: 'AC2103',
                        department: 'Electronics & Computer (ACT)',
                        role: 'student',
                        project_id: 2
                    },
                    project: {
                        id: 2,
                        title: 'IoT-Based Weather Display Clock & Forecast Alert System',
                        project_code: 'AC2103',
                        progress: 80,
                        status: 'In Progress'
                    }
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token: 'netlify_student_jwt_shivam_' + Date.now(),
                user: {
                    id: 1,
                    name: 'Shivam Natkar',
                    email: email || 'shivamnatkarcsmss@gmail.com',
                    roll_no: '26EACT01',
                    department: 'E&ACT',
                    role: 'student',
                    project_id: 1
                },
                project: {
                    id: 1,
                    title: 'Web-Based Integrated Project Monitoring System',
                    project_code: 'SIH26103',
                    progress: 90,
                    status: 'In Progress'
                }
            })
        };
    }

    // 4. Student Dashboard
    if (path === '/student/dashboard' && method === 'GET') {
        const queryParams = event.queryStringParameters || {};
        const queryEmail = (queryParams.email || '').toLowerCase();
        const isGargi = isGargiToken || queryEmail.includes('gargi');
        const isChaitnaya = isChaitnayaToken || queryEmail.includes('chaitnaya');
        const isRohan = isRohanToken || queryEmail.includes('rohan');

        if (isGargi) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    project: {
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
                    },
                    stats: { totalProjects: 1, inProgress: 1, completed: 0, overallProgress: '80%' },
                    milestones: [
                        { id: 1, title: 'Mathematical Waveform Equations Formulation', is_completed: true },
                        { id: 2, title: 'Time-Domain Waveform & Live FFT Spectrum Visualizer', is_completed: true },
                        { id: 3, title: 'Demodulation Filters & Noise Injection Module', is_completed: true },
                        { id: 4, title: 'Interactive Web UI & Parameter Control Sliders', is_completed: true },
                        { id: 5, title: 'Final Defense, Presentation & Faculty Evaluation', is_completed: false }
                    ],
                    feedbacks: [
                        {
                            teacher_name: 'Prof. Amruta Kadli Mam',
                            message: 'Great simulation work on the Modulation and Demodulation Simulator! The AM envelope detector, FM PLL demodulator, and live FFT spectrum are accurately modeled. Progress approved at 80% for your upcoming defense.',
                            date: 'Today'
                        }
                    ],
                    reports: [
                        {
                            id: 5,
                            project_id: 4,
                            title: 'Modulation & Demodulation Simulator Presentation (PPT/PDF)',
                            file_name: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
                            file_path: '/assets/aistudio/Modulation_and_Demodulation_Simulator_Presentation.pdf',
                            status: 'Approved',
                            feedback: 'AM/FM algorithms, demodulation filters, and live FFT waveforms reviewed. Progress approved at 80% by Prof. Amruta Kadli Mam.',
                            submission_date: '30 Oct 2026'
                        }
                    ],
                    notifications: [
                        {
                            id: 1,
                            title: 'Presentation Scheduled',
                            message: 'Modulation and Demodulation Simulator (AC2148) is approved at 80% progress. Final defense on 31st October 2026.',
                            type: 'success',
                            time: 'Just now'
                        }
                    ]
                })
            };
        }

        if (isChaitnaya) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    project: {
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
                    },
                    stats: { totalProjects: 1, inProgress: 1, completed: 0, overallProgress: '85%' },
                    milestones: [
                        { id: 1, title: 'RF Link Budget & Path Loss Formulation', is_completed: true },
                        { id: 2, title: 'Antenna Gain & Sensitivity Modeling', is_completed: true },
                        { id: 3, title: 'Interactive Web-Based Calculator UI', is_completed: true },
                        { id: 4, title: 'Multi-Frequency Terrain & Clutter Calibration', is_completed: true },
                        { id: 5, title: 'Final Defense, Documentation & PPT Presentation', is_completed: false }
                    ],
                    feedbacks: [
                        {
                            teacher_name: 'Prof. Amruta Kadli Mam',
                            message: 'Excellent work on the RF Communication Range Calculator! The link budget formulas, Fresnel zone clearance calculations, and interactive slider UI are thoroughly developed. Progress approved at 85% for your upcoming defense.',
                            date: 'Today'
                        }
                    ],
                    reports: [
                        {
                            id: 4,
                            project_id: 3,
                            title: 'RF Communication Range Calculator Presentation (PPT/PDF)',
                            file_name: 'RF_Communication_Range_Calculator_Presentation.pdf',
                            file_path: '/assets/aistudio/RF_Communication_Range_Calculator_Presentation.pdf',
                            status: 'Approved',
                            feedback: 'Link budget formulations, Fresnel zone clearance, and UI range calculator reviewed. Progress approved at 85% by Prof. Amruta Kadli Mam.',
                            submission_date: '30 Oct 2026'
                        }
                    ],
                    notifications: [
                        {
                            id: 1,
                            title: 'Presentation Scheduled',
                            message: 'RF Communication Range Calculator (AC2152) is approved at 85% progress. Final defense on 31st October 2026.',
                            type: 'success',
                            time: 'Just now'
                        }
                    ]
                })
            };
        }

        if (isRohan) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    project: {
                        id: 2,
                        project_code: 'AC2103',
                        title: 'IoT-Based Weather Display Clock & Forecast Alert System',
                        description: 'Community Engagement Project (S.Y. 2026). Low-cost IoT weather station clock displaying real-time temperature, humidity, atmospheric pressure, and rain forecast alerts using ESP8266, DHT11, BMP280, YL-83, MQ135, and 0.96" OLED display.',
                        department: 'Electronics & Computer (ACT)',
                        guide_name: 'Prof. A. M. Kadli Mam',
                        progress: 80,
                        status: 'In Progress',
                        start_date: '05 Sep 2026',
                        expected_completion: '31 Oct 2026',
                        team_members: [
                            { id: 1, name: 'Rohan Sudhakar Dhavale', roll_no: 'AC2103', role: 'Team Leader / Hardware & Embedded Lead' },
                            { id: 2, name: 'Rutvij Rustum Patil', roll_no: 'AC2104', role: 'Hardware & Sensor Interfacing' },
                            { id: 3, name: 'Vijay Ranjit Pardeshi', roll_no: 'AC2130', role: 'Circuit Design & Power Management' },
                            { id: 4, name: 'Pallavi Badri Ade', roll_no: 'AC2144', role: 'Firmware & Forecast Alert Logic' },
                            { id: 5, name: 'Pooja Sanjay Kanade', roll_no: 'AC2159', role: 'Documentation & PPT Presentation' }
                        ]
                    },
                    stats: { totalProjects: 1, inProgress: 1, completed: 0, overallProgress: '80%' },
                    milestones: [
                        { id: 1, title: 'Topic Selection & Sensor Calibration (DHT11/BMP280)', is_completed: true },
                        { id: 2, title: 'Literature Survey & Circuit Prototyping', is_completed: true },
                        { id: 3, title: 'OLED UI & Environmental Sensing Logic', is_completed: true },
                        { id: 4, title: 'Buzzer Storm Warnings & Forecast Alerts', is_completed: true },
                        { id: 5, title: 'Community Project Defense & PPT Presentation', is_completed: false }
                    ],
                    feedbacks: [
                        {
                            teacher_name: 'Prof. A. M. Kadli Mam',
                            message: 'Great work on the IoT-Based Weather Display Clock & Forecast Alert System! Local sensing with buzzer alerts is well thought out for community safety. Progress approved at 80% for your upcoming presentation.',
                            date: 'Today'
                        }
                    ],
                    reports: [
                        {
                            id: 3,
                            project_id: 2,
                            title: 'IoT Weather Clock CEP Presentation (PPT/PDF)',
                            file_name: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
                            file_path: '/assets/aistudio/IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
                            status: 'Approved',
                            feedback: 'Presentation slides and hardware architecture reviewed. Progress approved at 80% by Prof. A. M. Kadli Mam.',
                            submission_date: '29 Oct 2026'
                        }
                    ],
                    notifications: [
                        {
                            id: 1,
                            title: 'Class Presentation Scheduled',
                            message: 'IoT-Based Weather Display Clock (AC2103) is at 80% completion. Final defense scheduled on 31st October 2026.',
                            type: 'success',
                            time: 'Just now'
                        }
                    ]
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                project: {
                    id: 1,
                    project_code: 'SIH26103',
                    title: 'Web-Based Integrated Project Monitoring System',
                    description: 'Centralized integrated college project monitoring platform enabling students to submit progress reports, upload project documentation, track milestones, and receive real-time guide feedback.',
                    department: 'E&ACT',
                    guide_name: 'Prof. A. M. Kadli Mam',
                    progress: 90,
                    status: 'In Progress',
                    start_date: '01 Sep 2026',
                    expected_completion: '31 Oct 2026',
                    team_members: [
                        { id: 1, name: 'Shivam Natkar', roll_no: '26EACT01', role: 'Team Leader / Full-Stack Developer' },
                        { id: 2, name: 'Sakshi Arbad', roll_no: '26EACT02', role: 'UI/UX & Frontend Designer' },
                        { id: 3, name: 'Tejal Bhanuse', roll_no: '26EACT03', role: 'Backend & Database Developer' },
                        { id: 4, name: 'Karan Sangle', roll_no: '26EACT04', role: 'Testing & Quality Assurance' },
                        { id: 5, name: 'Abhishek Malwade', roll_no: '26EACT05', role: 'Documentation & Presentation' }
                    ]
                },
                stats: { totalProjects: 1, inProgress: 1, completed: 0, overallProgress: '90%' },
                milestones: [
                    { id: 1, title: 'Project Topic Selection & Synopsis Submission', is_completed: true },
                    { id: 2, title: 'Requirement Analysis & SRS Documentation', is_completed: true },
                    { id: 3, title: 'System Architecture & Database Schema Design', is_completed: true },
                    { id: 4, title: 'Frontend UI & Backend REST API Implementation', is_completed: true },
                    { id: 5, title: 'Final Presentation, Testing & PPT Defense', is_completed: false }
                ],
                feedbacks: [
                    {
                        teacher_name: 'Prof. A. M. Kadli Mam',
                        message: 'Outstanding progress on the Web-Based Integrated Project Monitoring System! Frontend and backend REST APIs are functioning smoothly. Progress approved at 90% for your class presentation.',
                        date: 'Today'
                    }
                ],
                notifications: [
                    {
                        id: 1,
                        title: 'Class Presentation Ready',
                        message: 'Web-Based Integrated Project Monitoring System has reached 90% completion and is ready for live demonstration.',
                        type: 'success',
                        time: 'Just now'
                    }
                ]
            })
        };
    }

    // 5. Projects list
    if (path === '/projects' && method === 'GET') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: 4,
                projects: [
                    {
                        id: 1,
                        project_code: 'SIH26103',
                        title: 'Web-Based Integrated Project Monitoring System',
                        department: 'E&ACT',
                        guide_name: 'Prof. A. M. Kadli Mam',
                        progress: 90,
                        status: 'In Progress',
                        expected_completion: '31 Oct 2026'
                    },
                    {
                        id: 2,
                        project_code: 'AC2103',
                        title: 'IoT-Based Weather Display Clock & Forecast Alert System',
                        department: 'Electronics & Computer (ACT)',
                        guide_name: 'Prof. A. M. Kadli Mam',
                        progress: 80,
                        status: 'In Progress',
                        expected_completion: '31 Oct 2026'
                    },
                    {
                        id: 3,
                        project_code: 'AC2152',
                        title: 'RF Communication Range Calculator',
                        department: 'Electronics & Communication (ACT)',
                        guide_name: 'Prof. Amruta Kadli Mam',
                        progress: 85,
                        status: 'In Progress',
                        expected_completion: '31 Oct 2026'
                    },
                    {
                        id: 4,
                        project_code: 'AC2148',
                        title: 'Modulation and Demodulation Simulator',
                        department: 'Electronics And Communication (Advanced Communication Technology)',
                        guide_name: 'Prof. Amruta Kadli Mam',
                        progress: 80,
                        status: 'In Progress',
                        expected_completion: '31 Oct 2026'
                    }
                ]
            })
        };
    }

    // 6. Teacher Students Directory
    if (path === '/teacher/students' && method === 'GET') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: 19,
                students: [
                    { id: 1, name: 'Shivam Natkar', roll_no: '26EACT01', department: 'E&ACT', year: 'Final Year', project_code: 'SIH26103', project_title: 'Web-Based Project Monitoring System' },
                    { id: 2, name: 'Sakshi Arbad', roll_no: '26EACT02', department: 'E&ACT', year: 'Final Year', project_code: 'SIH26103', project_title: 'Web-Based Project Monitoring System' },
                    { id: 3, name: 'Tejal Bhanuse', roll_no: '26EACT03', department: 'E&ACT', year: 'Final Year', project_code: 'SIH26103', project_title: 'Web-Based Project Monitoring System' },
                    { id: 4, name: 'Karan Sangle', roll_no: '26EACT04', department: 'E&ACT', year: 'Final Year', project_code: 'SIH26103', project_title: 'Web-Based Project Monitoring System' },
                    { id: 5, name: 'Abhishek Malwade', roll_no: '26EACT05', department: 'E&ACT', year: 'Final Year', project_code: 'SIH26103', project_title: 'Web-Based Project Monitoring System' },
                    { id: 6, name: 'Rohan Sudhakar Dhavale', roll_no: 'AC2103', department: 'Electronics & Computer (ACT)', year: 'S.Y. 2026', project_code: 'AC2103', project_title: 'IoT-Based Weather Display Clock & Forecast Alert System' },
                    { id: 7, name: 'Rutvij Rustum Patil', roll_no: 'AC2104', department: 'Electronics & Computer (ACT)', year: 'S.Y. 2026', project_code: 'AC2103', project_title: 'IoT-Based Weather Display Clock & Forecast Alert System' },
                    { id: 8, name: 'Vijay Ranjit Pardeshi', roll_no: 'AC2130', department: 'Electronics & Computer (ACT)', year: 'S.Y. 2026', project_code: 'AC2103', project_title: 'IoT-Based Weather Display Clock & Forecast Alert System' },
                    { id: 9, name: 'Pallavi Badri Ade', roll_no: 'AC2144', department: 'Electronics & Computer (ACT)', year: 'S.Y. 2026', project_code: 'AC2103', project_title: 'IoT-Based Weather Display Clock & Forecast Alert System' },
                    { id: 10, name: 'Pooja Sanjay Kanade', roll_no: 'AC2159', department: 'Electronics & Computer (ACT)', year: 'S.Y. 2026', project_code: 'AC2103', project_title: 'IoT-Based Weather Display Clock & Forecast Alert System' },
                    { id: 11, name: 'Chaitnaya Shinde', roll_no: 'AC2152', department: 'Electronics & Communication (ACT)', year: 'S.Y. 2026', project_code: 'AC2152', project_title: 'RF Communication Range Calculator' },
                    { id: 12, name: 'Dipak Belkar', roll_no: 'AC2126', department: 'Electronics & Communication (ACT)', year: 'S.Y. 2026', project_code: 'AC2152', project_title: 'RF Communication Range Calculator' },
                    { id: 13, name: 'Lokesh Norlawar', roll_no: 'AC2146', department: 'Electronics & Communication (ACT)', year: 'S.Y. 2026', project_code: 'AC2152', project_title: 'RF Communication Range Calculator' },
                    { id: 14, name: 'Kiran Sasane', roll_no: 'AC2118', department: 'Electronics & Communication (ACT)', year: 'S.Y. 2026', project_code: 'AC2152', project_title: 'RF Communication Range Calculator' },
                    { id: 15, name: 'Shruti Shinde', roll_no: 'AC2145', department: 'Electronics & Communication (ACT)', year: 'S.Y. 2026', project_code: 'AC2152', project_title: 'RF Communication Range Calculator' },
                    { id: 16, name: 'Gargi Deshpande', roll_no: 'AC2148', department: 'Electronics And Communication (Advanced Communication Technology)', year: 'S.Y. 2026', project_code: 'AC2148', project_title: 'Modulation and Demodulation Simulator' },
                    { id: 17, name: 'Mayuri Jagtap', roll_no: 'AC2149', department: 'Electronics And Communication (Advanced Communication Technology)', year: 'S.Y. 2026', project_code: 'AC2148', project_title: 'Modulation and Demodulation Simulator' },
                    { id: 18, name: 'Sanika Bhalerao', roll_no: 'AC2150', department: 'Electronics And Communication (Advanced Communication Technology)', year: 'S.Y. 2026', project_code: 'AC2148', project_title: 'Modulation and Demodulation Simulator' },
                    { id: 19, name: 'Asawari Kavre', roll_no: 'AC2151', department: 'Electronics And Communication (Advanced Communication Technology)', year: 'S.Y. 2026', project_code: 'AC2148', project_title: 'Modulation and Demodulation Simulator' }
                ]
            })
        };
    }

    // 7. Generic success
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Request processed successfully on Netlify backend.' })
    };
}
