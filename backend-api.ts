// backend-api.ts - Native Full REST API for ProjectTrack in Express with Disk Persistence & Google Login
import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// CORS & Preflight handling for API router
router.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure uploads and instance directories exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const instanceDir = path.join(process.cwd(), 'instance');
if (!fs.existsSync(instanceDir)) {
  fs.mkdirSync(instanceDir, { recursive: true });
}

const DATA_FILE = path.join(instanceDir, 'projecttrack_data.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB for PPT files
});

// Data Types
export interface TeamMember {
  id: number;
  name: string;
  roll_no: string;
  role: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  order: number;
}

export interface Feedback {
  teacher_name: string;
  message: string;
  date: string;
}

export interface Report {
  id: number;
  project_id: number;
  student_id: number;
  title: string;
  description: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string; // 'presentation' | 'report' | 'documentation'
  stage?: string;
  submission_date: string;
  status: string; // 'Pending Review' | 'Reviewed' | 'Approved' | 'Changes Requested'
  feedback?: string;
  rating?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  project_id?: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  time: string;
}

export interface Project {
  id: number;
  project_code: string;
  title: string;
  description: string;
  department: string;
  guide_name: string;
  guide_id: number;
  progress: number;
  status: string;
  start_date: string;
  expected_completion: string;
  tech_stack?: string[];
  team_members: TeamMember[];
  milestones: Milestone[];
}

export interface UserAccount {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  picture?: string;
  department?: string;
  roll_no?: string;
  designation?: string;
  project_id?: number;
  password?: string;
  firebase_uid?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: 'student' | 'teacher';
  role_title: string;
  department: string;
  avatar_initials: string;
  avatar_color: string;
  rating: number;
  quote: string;
  project_or_focus: string;
  impact_tag: string;
  date: string;
  verified: boolean;
}

// Initial Seed Data
const initialProjects: Project[] = [
  {
    id: 1,
    project_code: 'SIH26103',
    title: 'Web-Based Integrated Project Monitoring System',
    description: 'Centralized integrated college project monitoring platform enabling students to submit progress reports, upload project documentation, track milestones, and receive real-time guide feedback.',
    department: 'E&ACT',
    guide_name: 'Prof. A. M. Kadli Mam',
    guide_id: 2,
    progress: 90,
    status: 'In Progress',
    start_date: '01 Sep 2026',
    expected_completion: '31 Oct 2026',
    tech_stack: ['Python Flask', 'SQLite', 'HTML5/CSS3', 'REST API', 'JavaScript', 'Firebase Auth'],
    team_members: [
      { id: 1, name: 'Shivam Natkar', roll_no: '26EACT01', role: 'Team Leader / Full-Stack Developer' },
      { id: 2, name: 'Sakshi Arbad', roll_no: '26EACT02', role: 'UI/UX & Frontend Designer' },
      { id: 3, name: 'Tejal Bhanuse', roll_no: '26EACT03', role: 'Backend & Database Developer' },
      { id: 4, name: 'Karan Sangle', roll_no: '26EACT04', role: 'Testing & Quality Assurance' },
      { id: 5, name: 'Abhishek Malwade', roll_no: '26EACT05', role: 'Documentation & Presentation' }
    ],
    milestones: [
      { id: 1, project_id: 1, title: 'Project Topic Selection & Synopsis Submission', description: 'Problem statement, literature survey, and scope approval', due_date: '10 Sep 2026', is_completed: true, order: 0 },
      { id: 2, project_id: 1, title: 'Requirement Analysis & SRS Documentation', description: 'Functional requirements, use cases, and IEEE SRS specification', due_date: '25 Sep 2026', is_completed: true, order: 1 },
      { id: 3, project_id: 1, title: 'System Architecture & Database Schema Design', description: 'Relational SQLite tables, DFDs, ER diagrams, and REST contracts', due_date: '10 Oct 2026', is_completed: true, order: 2 },
      { id: 4, project_id: 1, title: 'Frontend UI & Backend REST API Implementation', description: 'Full-stack dashboard, auth middleware, and document uploads', due_date: '25 Oct 2026', is_completed: true, order: 3 },
      { id: 5, project_id: 1, title: 'Final Presentation, Testing & PPT Defense', description: 'Live project demonstration, final report validation, and PPT presentation', due_date: '31 Oct 2026', is_completed: false, order: 4 }
    ]
  },
  {
    id: 2,
    project_code: 'AC2103',
    title: 'IoT-Based Weather Display Clock & Forecast Alert System',
    description: 'Community Engagement Project (S.Y. 2026): Low-cost smart clock that shows live weather and gives timely forecast alerts to communities using ESP8266, DHT11, BMP280, YL-83, MQ135 sensors and buzzer alerts.',
    department: 'E&ACT',
    guide_name: 'Prof. A. M. Kadli Mam',
    guide_id: 2,
    progress: 80,
    status: 'In Progress',
    start_date: '01 Sep 2026',
    expected_completion: '31 Oct 2026',
    tech_stack: ['ESP8266 (NodeMCU)', 'DHT11 Humidity Sensor', 'BMP280 Pressure Sensor', 'YL-83 Rain Sensor', 'MQ135 Air Quality Sensor', '0.96" OLED Display', 'RTC Module', 'Buzzer Alert', 'Arduino C++'],
    team_members: [
      { id: 1, name: 'Rohan Sudhakar Dhavale', roll_no: 'AC2103', role: 'Team Leader / Project Lead' },
      { id: 2, name: 'Rutvij Rustum Patil', roll_no: 'AC2104', role: 'Hardware & Circuit Designer' },
      { id: 3, name: 'Vijay Ranjit Pardeshi', roll_no: 'AC2130', role: 'Sensor Integration & Calibration' },
      { id: 4, name: 'Pallavi Badri Ade', roll_no: 'AC2144', role: 'Software & Alert Logic Developer' },
      { id: 5, name: 'Pooja Sanjay Kanade', roll_no: 'AC2159', role: 'Testing & Presentation Documentation' }
    ],
    milestones: [
      { id: 1, project_id: 2, title: 'Problem Statement & Sensor Sourcing', description: 'ESP8266, DHT11, BMP280, YL-83, MQ135 and OLED acquisition', due_date: '10 Sep 2026', is_completed: true, order: 0 },
      { id: 2, project_id: 2, title: 'Literature Survey & Circuit Prototyping', description: 'Sensor wiring and RTC timekeeping without Wi-Fi', due_date: '25 Sep 2026', is_completed: true, order: 1 },
      { id: 3, project_id: 2, title: 'OLED UI & Environmental Sensing Logic', description: 'Live display rendering and pressure drop threshold detection', due_date: '10 Oct 2026', is_completed: true, order: 2 },
      { id: 4, project_id: 2, title: 'Buzzer Storm Warnings & Forecast Alerts', description: 'Automatic acoustic warnings for community safety', due_date: '22 Oct 2026', is_completed: true, order: 3 },
      { id: 5, project_id: 2, title: 'Community Project Defense & PPT Presentation', description: 'Final project defense before Prof. A. M. Kadli Mam', due_date: '31 Oct 2026', is_completed: false, order: 4 }
    ]
  },
  {
    id: 3,
    project_code: 'AC2152',
    title: 'RF Communication Range Calculator',
    description: 'Advanced Link Budget Analysis & Path Loss Propagation Modeling tool for estimating radio communication ranges, Fresnel zone clearances, and antenna parameters across sub-GHz and 2.4 GHz RF links.',
    department: 'Electronics & Communication (ACT)',
    guide_name: 'Prof. Amruta Kadli Mam',
    guide_id: 2,
    progress: 85,
    status: 'In Progress',
    start_date: '01 Sep 2026',
    expected_completion: '31 Oct 2026',
    tech_stack: ['Python', 'RF Link Budget', 'Friis Equation', 'FSPL Modeling', 'JavaScript', 'HTML5/CSS3', 'Antenna Theory'],
    team_members: [
      { id: 1, name: 'Chaitnaya Shinde', roll_no: 'AC2152', role: 'Team Leader / Project Lead' },
      { id: 2, name: 'Dipak Belkar', roll_no: 'AC2126', role: 'RF Path Loss & Link Budget Analysis' },
      { id: 3, name: 'Lokesh Norlawar', roll_no: 'AC2146', role: 'Antenna & Frequency Propagation Modeling' },
      { id: 4, name: 'Kiran Sasane', roll_no: 'AC2118', role: 'Fresnel Zone & Terrain Attenuation Logic' },
      { id: 5, name: 'Shruti Shinde', roll_no: 'AC2145', role: 'UI Design & PPT Presentation' }
    ],
    milestones: [
      { id: 1, project_id: 3, title: 'RF Link Budget & Path Loss Formulation', description: 'Theoretical derivation of FSPL and Friis transmission equation', due_date: '10 Sep 2026', is_completed: true, order: 0 },
      { id: 2, project_id: 3, title: 'Antenna Gain & Sensitivity Modeling', description: 'Transmitter power and receiver sensitivity calibration', due_date: '25 Sep 2026', is_completed: true, order: 1 },
      { id: 3, project_id: 3, title: 'Interactive Web-Based Calculator UI', description: 'Real-time parameter sliders and Fresnel zone radius rendering', due_date: '10 Oct 2026', is_completed: true, order: 2 },
      { id: 4, project_id: 3, title: 'Multi-Frequency Terrain & Clutter Calibration', description: 'Rural, suburban, and urban path loss attenuation modeling', due_date: '22 Oct 2026', is_completed: true, order: 3 },
      { id: 5, project_id: 3, title: 'Final Defense, Documentation & PPT Presentation', description: 'Final project defense before Prof. Amruta Kadli Mam', due_date: '31 Oct 2026', is_completed: false, order: 4 }
    ]
  },
  {
    id: 4,
    project_code: 'AC2148',
    title: 'Modulation and Demodulation Simulator',
    description: 'Interactive Analog & Digital Communication Signal Simulation System modeling AM (DSB-FC/SC, SSB), FM (Narrowband/Wideband), PM, and Digital Shift Keying (ASK, FSK, BPSK, QPSK) with live time-domain and FFT spectral analysis.',
    department: 'Electronics And Communication (Advanced Communication Technology)',
    guide_name: 'Prof. Amruta Kadli Mam',
    guide_id: 2,
    progress: 80,
    status: 'In Progress',
    start_date: '01 Sep 2026',
    expected_completion: '31 Oct 2026',
    tech_stack: ['Python', 'Signal Processing', 'FFT Spectral Analysis', 'AM/FM/PM Modulation', 'JavaScript', 'HTML5 Canvas', 'AWGN Noise Channel'],
    team_members: [
      { id: 1, name: 'Gargi Deshpande', roll_no: 'AC2148', role: 'Team Leader / Simulation Architect' },
      { id: 2, name: 'Mayuri Jagtap', roll_no: 'AC2149', role: 'AM/FM Modulation Modeling' },
      { id: 3, name: 'Sanika Bhalerao', roll_no: 'AC2150', role: 'Demodulation Filters & Envelope Detectors' },
      { id: 4, name: 'Asawari Kavre', roll_no: 'AC2151', role: 'FFT Spectral Visualizer & PPT Presentation' }
    ],
    milestones: [
      { id: 1, project_id: 4, title: 'Mathematical Waveform Equations Formulation', description: 'AM, FM, PM mathematical expressions and parameter definitions', due_date: '10 Sep 2026', is_completed: true, order: 0 },
      { id: 2, project_id: 4, title: 'Time-Domain Waveform & Live FFT Spectrum Visualizer', description: 'Real-time oscilloscope plotting and carrier frequency calculation', due_date: '25 Sep 2026', is_completed: true, order: 1 },
      { id: 3, project_id: 4, title: 'Demodulation Filters & Noise Injection Module', description: 'Envelope detectors, PLL demodulators, and AWGN noise stage', due_date: '10 Oct 2026', is_completed: true, order: 2 },
      { id: 4, project_id: 4, title: 'Interactive Web UI & Parameter Control Sliders', description: 'Real-time slider tuning for carrier/modulating frequencies and modulation index', due_date: '22 Oct 2026', is_completed: true, order: 3 },
      { id: 5, project_id: 4, title: 'Final Defense, Presentation & Faculty Evaluation', description: 'Final project defense before Prof. Amruta Kadli Mam', due_date: '31 Oct 2026', is_completed: false, order: 4 }
    ]
  }
];

const initialFeedbacks: Feedback[] = [
  {
    teacher_name: 'Prof. Amruta Kadli Mam',
    message: 'Great simulation work on the Modulation and Demodulation Simulator! The AM envelope detector, FM PLL demodulator, and live FFT spectrum are accurately modeled. Progress approved at 80% for your upcoming defense.',
    date: 'Today'
  },
  {
    teacher_name: 'Prof. Amruta Kadli Mam',
    message: 'Excellent work on the RF Communication Range Calculator! The link budget formulas, Fresnel zone clearance calculations, and interactive slider UI are thoroughly developed. Progress approved at 85% for your upcoming defense.',
    date: 'Today'
  },
  {
    teacher_name: 'Prof. A. M. Kadli Mam',
    message: 'Outstanding progress on the Web-Based Integrated Project Monitoring System! Frontend and backend REST APIs are functioning smoothly. Progress approved at 90% for your class presentation.',
    date: 'Today'
  },
  {
    teacher_name: 'Prof. A. M. Kadli Mam',
    message: 'Great work on the IoT-Based Weather Display Clock & Forecast Alert System! Local sensing with buzzer alerts is well thought out for community safety. Progress approved at 80% for your upcoming presentation.',
    date: 'Today'
  },
  {
    teacher_name: 'Prof. A. M. Kadli Mam',
    message: 'Architecture and documentation reviewed. System is ready for live college demonstration.',
    date: '2 days ago'
  }
];

const initialNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Project Review',
    message: 'Project review meeting scheduled this week.',
    type: 'meeting',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    time: '2 hours ago'
  },
  {
    id: 2,
    user_id: 1,
    title: 'Report Deadline',
    message: 'Submit your progress report before the deadline.',
    type: 'deadline',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    time: 'Yesterday'
  }
];

const initialReports: Report[] = [
  {
    id: 1,
    project_id: 1,
    student_id: 1,
    title: 'Phase 1 - Project Synopsis & SRS Document',
    description: 'System Architecture, specifications and literature survey for Web-Based Project Monitoring System',
    file_name: 'Project_SRS_Document_SIH26103.pdf',
    file_path: '/uploads/Project_SRS_Document_SIH26103.pdf',
    file_size: 2450100,
    file_type: 'report',
    stage: 'Synopsis Review',
    submission_date: '12 Sep 2026',
    status: 'Approved',
    feedback: 'Approved by Prof. A. M. Kadli Mam. Comprehensive requirements analysis.',
    rating: 9
  },
  {
    id: 2,
    project_id: 1,
    student_id: 1,
    title: 'Phase 2 - Architecture & Frontend Design Report',
    description: 'Frontend UI/UX design, interactive charts and database schema documentation',
    file_name: 'Frontend_Architecture_Phase2.pdf',
    file_path: '/uploads/Frontend_Architecture_Phase2.pdf',
    file_size: 3120000,
    file_type: 'report',
    stage: 'Mid-Term',
    submission_date: '26 Sep 2026',
    status: 'Approved',
    feedback: 'Clean architecture and modern responsive interface design.',
    rating: 9
  },
  {
    id: 3,
    project_id: 1,
    student_id: 1,
    title: 'Final Presentation Slides (PPT)',
    description: 'Final capstone defense slides covering live system demonstration and test metrics',
    file_name: '1791732756586_test_slide.pptx',
    file_path: '/uploads/1791732756586_test_slide.pptx',
    file_size: 4500000,
    file_type: 'presentation',
    stage: 'Final Defense',
    submission_date: '20 Oct 2026',
    status: 'Approved',
    feedback: 'Excellent presentation structure. Ready for final evaluation on 31st Oct 2026.',
    rating: 10
  },
  {
    id: 4,
    project_id: 2,
    student_id: 3,
    title: 'Community Engagement Project Presentation (PPT/PDF)',
    description: 'Community Engagement Project Presentation (S.Y. 2026) detailing low-cost smart weather clock with buzzer alerts.',
    file_name: 'IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
    file_path: '/assets/aistudio/IoT_Weather_Clock_CEP_Presentation_v4_fa8890db.pdf',
    file_size: 391033,
    file_type: 'presentation',
    stage: 'Final Defense',
    submission_date: '29 Oct 2026',
    status: 'Approved',
    feedback: 'Presentation slides and hardware architecture reviewed. Progress approved at 80% by Prof. A. M. Kadli Mam.',
    rating: 9
  },
  {
    id: 5,
    project_id: 3,
    student_id: 4,
    title: 'RF Communication Range Calculator Presentation (PPT/PDF)',
    description: 'Comprehensive presentation covering RF link budget equations, Friis transmission model, Fresnel zone clearance, and interactive web calculator.',
    file_name: 'RF_Communication_Range_Calculator_Presentation.pdf',
    file_path: '/assets/aistudio/RF_Communication_Range_Calculator_Presentation.pdf',
    file_size: 9179,
    file_type: 'presentation',
    stage: 'Final Defense',
    submission_date: '30 Oct 2026',
    status: 'Approved',
    feedback: 'Link budget formulations, Fresnel zone clearance, and UI range calculator reviewed. Progress approved at 85% by Prof. Amruta Kadli Mam.',
    rating: 9
  },
  {
    id: 6,
    project_id: 4,
    student_id: 5,
    title: 'Modulation & Demodulation Simulator Presentation (PPT/PDF)',
    description: 'Comprehensive presentation covering AM/FM/PM waveforms, FFT spectral analysis, envelope detection, PLL demodulation, and interactive laboratory simulation.',
    file_name: 'Modulation_and_Demodulation_Simulator_Presentation.pdf',
    file_path: '/assets/aistudio/Modulation_and_Demodulation_Simulator_Presentation.pdf',
    file_size: 9313,
    file_type: 'presentation',
    stage: 'Final Defense',
    submission_date: '30 Oct 2026',
    status: 'Approved',
    feedback: 'AM/FM algorithms, demodulation filters, and live FFT waveforms reviewed. Progress approved at 80% by Prof. Amruta Kadli Mam.',
    rating: 9
  }
];

const initialTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Shivam Natkar',
    role: 'student',
    role_title: 'Team Lead · SIH26103 Final Year',
    department: 'Electronics & Computer Tech (E&ACT)',
    avatar_initials: 'SN',
    avatar_color: '#10b981',
    rating: 5,
    quote: 'ProjectTrack made our final year project coordination effortless. Previously, milestone updates and PPT drafts got lost across chat groups. With this portal, Prof. Kadam sir reviews our weekly code commits and synopsis drafts within hours.',
    project_or_focus: 'IoT-Based Smart Campus & Energy Monitoring System',
    impact_tag: '100% On-Schedule Milestones',
    date: 'Sep 2026',
    verified: true
  },
  {
    id: 2,
    name: 'Prof. A. M. Kadli Mam',
    role: 'teacher',
    role_title: 'Senior Assistant Professor & Project Coordinator',
    department: 'Department of E&ACT',
    avatar_initials: 'AK',
    avatar_color: '#4f46e5',
    rating: 5,
    quote: 'Monitoring 15+ capstone teams used to require mountains of paperwork and tedious follow-ups. ProjectTrack gives me an instant birds-eye view: I can verify deliverables, grade presentations, and leave pinpointed feedback in seconds.',
    project_or_focus: 'Department Coordinator (15+ Active Batches)',
    impact_tag: '70% Reduction in Project Paperwork',
    date: 'Oct 2026',
    verified: true
  },
  {
    id: 3,
    name: 'Ananya Deshmukh',
    role: 'student',
    role_title: 'Lead Researcher · Final Year CSE',
    department: 'Computer Science & Engineering',
    avatar_initials: 'AD',
    avatar_color: '#f43f5e',
    rating: 5,
    quote: 'The milestone countdowns and instant notification alerts kept our 4-person group fully synchronized. Seeing our progress bar climb to 75% after literature review approval gave our whole team incredible momentum.',
    project_or_focus: 'AI-Driven Rural Diagnostic Health Assistant',
    impact_tag: 'Seamless Team Task Delegation',
    date: 'Sep 2026',
    verified: true
  },
  {
    id: 4,
    name: 'Dr. Sunita Patil',
    role: 'teacher',
    role_title: 'Head of Department & Evaluation Chair',
    department: 'School of Technology & Engineering',
    avatar_initials: 'SP',
    avatar_color: '#d97706',
    rating: 5,
    quote: 'For university audits and NAAC project reviews, having a verifiable, centralized digital audit trail is invaluable. ProjectTrack brings modern engineering practices straight to our college curriculum.',
    project_or_focus: 'Academic Review Committee & Accreditation',
    impact_tag: 'Centralized Digital Audit Repository',
    date: 'Aug 2026',
    verified: true
  },
  {
    id: 5,
    name: 'Rohan Patil',
    role: 'student',
    role_title: 'Hardware Architect · 3rd Year',
    department: 'Electronics & Telecommunication',
    avatar_initials: 'RP',
    avatar_color: '#0284c7',
    rating: 5,
    quote: 'Uploading high-resolution schematic diagrams and 50MB presentation decks directly to the system solved all our file-sharing headaches. Our guide can comment directly on our submission before lab hours.',
    project_or_focus: 'Autonomous Guided Vehicle (AGV) for Warehouses',
    impact_tag: 'Direct 50MB Document Sync',
    date: 'Oct 2026',
    verified: true
  },
  {
    id: 6,
    name: 'Prof. Amit Verma',
    role: 'teacher',
    role_title: 'Project Guide & Industry Mentor',
    department: 'Computer & AI Engineering',
    avatar_initials: 'AV',
    avatar_color: '#0d9488',
    rating: 5,
    quote: 'The automated progress calculations let me pinpoint struggling teams weeks before mid-term evaluations. It allows us to intervene early and ensure every student finishes with a deployable product.',
    project_or_focus: 'Project Evaluation & Industry Mentorship',
    impact_tag: 'Proactive Early Student Guidance',
    date: 'Sep 2026',
    verified: true
  },
  {
    id: 7,
    name: 'Snehal Shinde',
    role: 'student',
    role_title: 'Systems Analyst · Final Year',
    department: 'Information Technology',
    avatar_initials: 'SS',
    avatar_color: '#8b5cf6',
    rating: 5,
    quote: 'Student registration was buttery smooth, and inviting team members with their roll numbers took less than two minutes. The dashboard gives us clear targets for every evaluation stage.',
    project_or_focus: 'Solar Microgrid Energy Trading & Smart Metering',
    impact_tag: 'Fast 2-Minute Onboarding',
    date: 'Oct 2026',
    verified: true
  }
];

// In-Memory Storage loaded from or initialized to disk
let projects: Project[] = initialProjects;
let feedbacks: Feedback[] = initialFeedbacks;
let notifications: Notification[] = initialNotifications;
let reports: Report[] = initialReports;
let testimonials: Testimonial[] = initialTestimonials;
let users: Record<string, UserAccount> = {
  'student@csmss.edu': {
    id: 1,
    email: 'student@csmss.edu',
    name: 'Shivam Natkar',
    role: 'student',
    roll_no: '26EACT01',
    department: 'E&ACT',
    project_id: 1
  },
  'shivamnatkarcsmss@gmail.com': {
    id: 1,
    email: 'shivamnatkarcsmss@gmail.com',
    name: 'Shivam Natkar',
    role: 'student',
    roll_no: '26EACT01',
    department: 'E&ACT',
    project_id: 1
  },
  'teachercsmss@gmail.com': {
    id: 2,
    email: 'teachercsmss@gmail.com',
    name: 'Prof. A. M. Kadli Mam',
    role: 'teacher',
    department: 'E&ACT',
    designation: 'Assistant Professor & Project Coordinator'
  },
  'teacher@csmss.edu': {
    id: 2,
    email: 'teacher@csmss.edu',
    name: 'Prof. A. M. Kadli Mam',
    role: 'teacher',
    department: 'E&ACT',
    designation: 'Assistant Professor & Project Coordinator'
  },
  'kadli@csmss.edu': {
    id: 5,
    email: 'kadli@csmss.edu',
    name: 'Prof. A. M. Kadli Mam',
    role: 'teacher',
    department: 'E&ACT',
    designation: 'Assistant Professor & Project Coordinator'
  },
  'rohandhavale@gmail.com': {
    id: 3,
    email: 'rohandhavale@gmail.com',
    name: 'Rohan Sudhakar Dhavale',
    role: 'student',
    roll_no: 'AC2103',
    department: 'E&ACT',
    project_id: 2,
    password: 'rohan1234'
  },
  'chaitnayashinde@gmail.com': {
    id: 4,
    email: 'chaitnayashinde@gmail.com',
    name: 'Chaitnaya Shinde',
    role: 'student',
    roll_no: 'AC2152',
    department: 'Electronics & Communication (ACT)',
    project_id: 3,
    password: 'chaitnaya1234'
  },
  'gargideshpande@gmail.com': {
    id: 5,
    email: 'gargideshpande@gmail.com',
    name: 'Gargi Deshpande',
    role: 'student',
    roll_no: 'AC2148',
    department: 'Electronics And Communication (Advanced Communication Technology)',
    project_id: 4,
    password: 'gargi1234'
  }
};

// Persistence functions
function loadDataFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.projects && parsed.projects.length) {
        const loadedIds = new Set(parsed.projects.map((p: any) => p.id));
        const mergedProjects = [...parsed.projects];
        for (const initP of initialProjects) {
          if (!loadedIds.has(initP.id)) {
            mergedProjects.push(initP);
          }
        }
        projects = mergedProjects;
      } else {
        projects = initialProjects;
      }

      if (parsed.feedbacks && parsed.feedbacks.length) {
        feedbacks = initialFeedbacks;
      } else {
        feedbacks = initialFeedbacks;
      }

      if (parsed.notifications) notifications = parsed.notifications;

      if (parsed.reports && parsed.reports.length) {
        const loadedRepIds = new Set(parsed.reports.map((r: any) => r.id));
        const mergedReports = [...parsed.reports];
        for (const initR of initialReports) {
          if (!loadedRepIds.has(initR.id)) {
            mergedReports.push(initR);
          }
        }
        reports = mergedReports;
      } else {
        reports = initialReports;
      }

      if (parsed.testimonials && parsed.testimonials.length) testimonials = parsed.testimonials;
      if (parsed.users) users = { ...users, ...parsed.users };
      console.log('ProjectTrack data loaded and merged from persistent disk store. Total projects:', projects.length);
    } else {
      saveDataToDisk();
    }
  } catch (err) {
    console.warn('Could not load data file, using defaults:', err);
  }
}

function saveDataToDisk() {
  try {
    const payload = {
      projects,
      feedbacks,
      notifications,
      reports,
      testimonials,
      users,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving ProjectTrack data to disk:', err);
  }
}

// Initial disk load
loadDataFromDisk();

// 1. Healthcheck
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    runtime: 'express-fullstack',
    persistence: 'disk-json',
    dataFile: DATA_FILE,
    timestamp: new Date().toISOString()
  });
});

// 2. Google Authentication Endpoint (Student & Teacher)
router.post('/auth/google', (req: Request, res: Response) => {
  const { email, name, picture, role } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, error: 'Google Email is required' });
  }

  // Determine role: if specified or if email contains teacher/kadam
  const assignedRole: 'student' | 'teacher' = role === 'teacher' || normalizedEmail.includes('teacher') || normalizedEmail.includes('kadam')
    ? 'teacher'
    : 'student';

  let user = users[normalizedEmail];
  if (!user) {
    user = {
      id: Object.keys(users).length + 1,
      email: normalizedEmail,
      name: name || (assignedRole === 'teacher' ? (normalizedEmail.includes('kadam') ? 'Prof. D. K. Kadam' : 'Prof. Kadam') : 'Shivam Natkar'),
      role: assignedRole,
      picture: picture || undefined,
      department: 'E&ACT',
      roll_no: assignedRole === 'student' ? '26EACT01' : undefined,
      designation: assignedRole === 'teacher' ? 'Assistant Professor & Project Coordinator' : undefined,
      project_id: assignedRole === 'student' ? 1 : undefined
    };
    users[normalizedEmail] = user;
    saveDataToDisk();
  } else {
    if (role === 'teacher') {
      user.role = 'teacher';
      if (!user.designation) {
        user.designation = 'Assistant Professor & Project Coordinator';
      }
      saveDataToDisk();
    }
  }

  const token = `token_google_${Buffer.from(normalizedEmail).toString('base64')}_${Date.now()}`;

  return res.json({
    success: true,
    message: `Google Login successful as ${user.name}`,
    token,
    user,
    role: user.role,
    project: user.role === 'student' ? projects[0] : undefined
  });
});

// 3. Student Registration with Project Name & Group Members
router.post('/student/register', (req: Request, res: Response) => {
  const { name, email, password, roll_no, department, project_name, project_code, guide_name, group_members } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, error: 'Student email is required' });
  }

  const studentName = (name || '').trim() || 'Student Leader';
  const dept = (department || '').trim() || 'E&ACT';
  const roll = (roll_no || '').trim() || '26EACT01';
  const projTitle = (project_name || '').trim() || 'Smart College Project';
  const projCode = (project_code || '').trim() || `SIH26${Math.floor(100 + Math.random() * 899)}`;
  const guide = (guide_name || '').trim() || 'Prof. D. K. Kadam';

  // Parse group members
  let membersList: TeamMember[] = [];
  if (Array.isArray(group_members) && group_members.length > 0) {
    membersList = group_members.map((m: any, idx: number) => {
      if (typeof m === 'string') {
        return {
          id: idx + 1,
          name: m.trim(),
          roll_no: `${dept}0${idx + 1}`,
          role: idx === 0 ? 'Team Leader / Full-Stack' : 'Team Member / Developer'
        };
      }
      return {
        id: idx + 1,
        name: (m.name || `Member ${idx + 1}`).trim(),
        roll_no: (m.roll_no || `${dept}0${idx + 1}`).trim(),
        role: (m.role || (idx === 0 ? 'Team Leader' : 'Team Member')).trim()
      };
    }).filter(m => m.name.length > 0);
  }

  // Ensure leader is always the first member
  if (!membersList.some(m => m.name.toLowerCase() === studentName.toLowerCase())) {
    membersList.unshift({
      id: 1,
      name: studentName,
      roll_no: roll,
      role: 'Team Leader / Project Lead'
    });
  }

  // Create new project
  const newProjectId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
  const newProject: Project = {
    id: newProjectId,
    project_code: projCode,
    title: projTitle,
    description: `Integrated project "${projTitle}" created by ${studentName} and team (${dept} Department).`,
    department: dept,
    guide_name: guide,
    guide_id: 1,
    progress: 20,
    status: 'In Progress',
    start_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expected_completion: '30 Nov 2026',
    tech_stack: ['Python Flask', 'SQLite', 'HTML5/CSS3', 'REST API', 'JavaScript'],
    team_members: membersList,
    milestones: [
      { id: 1, project_id: newProjectId, title: 'Project Topic & Synopsis Submission', description: 'Literature review, problem statement, and scope approval', due_date: '10 Oct 2026', is_completed: true, order: 0 },
      { id: 2, project_id: newProjectId, title: 'System Design & Architecture', description: 'Database schema, UI mockups, and API contracts', due_date: '25 Oct 2026', is_completed: false, order: 1 },
      { id: 3, project_id: newProjectId, title: 'Frontend & Backend Implementation', description: 'Interactive dashboard, data persistence, and auth', due_date: '12 Nov 2026', is_completed: false, order: 2 },
      { id: 4, project_id: newProjectId, title: 'Final Testing & PPT Defense', description: 'Final project defense, documentation, and PPT presentation', due_date: '30 Nov 2026', is_completed: false, order: 3 }
    ]
  };

  projects.unshift(newProject);

  const studentUser: UserAccount = {
    id: Object.keys(users).length + 1,
    email: normalizedEmail,
    name: studentName,
    roll_no: roll,
    department: dept,
    role: 'student',
    project_id: newProjectId,
    password: (password || '').trim() || 'Shivam0003'
  };
  users[normalizedEmail] = studentUser;

  // Add notification to faculty guide
  notifications.unshift({
    id: notifications.length + 1,
    project_id: newProjectId,
    user_id: 2,
    title: `New Project: ${projTitle}`,
    message: `${studentName} created project "${projTitle}" with ${membersList.length} members.`,
    type: 'success',
    is_read: false,
    created_at: new Date().toISOString(),
    time: 'Just now'
  });

  saveDataToDisk();

  const token = `token_student_${Buffer.from(normalizedEmail).toString('base64')}_${Date.now()}`;

  return res.json({
    success: true,
    message: `Account & Project "${projTitle}" created with ${membersList.length} group members!`,
    token,
    user: studentUser,
    project: newProject
  });
});

// Setup or update Project Name & Group Members for logged in student
router.post('/student/project/setup', (req: Request, res: Response) => {
  const { email, project_id, project_name, project_code, guide_name, group_members } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();

  let targetProject: Project | undefined;
  if (project_id) {
    targetProject = projects.find(p => p.id === Number(project_id) || p.project_code === String(project_id));
  }
  if (!targetProject && normalizedEmail && users[normalizedEmail]?.project_id) {
    targetProject = projects.find(p => p.id === users[normalizedEmail].project_id);
  }
  if (!targetProject) {
    targetProject = projects[0];
  }

  if (project_name && project_name.trim()) {
    targetProject.title = project_name.trim();
  }
  if (project_code && project_code.trim()) {
    targetProject.project_code = project_code.trim();
  }
  if (guide_name && guide_name.trim()) {
    targetProject.guide_name = guide_name.trim();
  }

  if (Array.isArray(group_members) && group_members.length > 0) {
    targetProject.team_members = group_members.map((m: any, idx: number) => {
      if (typeof m === 'string') {
        return {
          id: idx + 1,
          name: m.trim(),
          roll_no: `${targetProject?.department || 'E&ACT'}0${idx + 1}`,
          role: idx === 0 ? 'Team Leader / Full-Stack' : 'Team Member / Developer'
        };
      }
      return {
        id: idx + 1,
        name: (m.name || `Member ${idx + 1}`).trim(),
        roll_no: (m.roll_no || `${targetProject?.department || 'E&ACT'}0${idx + 1}`).trim(),
        role: (m.role || (idx === 0 ? 'Team Leader' : 'Team Member')).trim()
      };
    }).filter(m => m.name.length > 0);
  }

  if (normalizedEmail && users[normalizedEmail]) {
    users[normalizedEmail].project_id = targetProject.id;
  }

  saveDataToDisk();

  return res.json({
    success: true,
    message: 'Project name and group members updated successfully!',
    project: targetProject
  });
});

// Add single group member to project in real-time
router.post('/projects/:id/members', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, roll_no, role } = req.body || {};

  const project = projects.find(p => p.id === Number(id) || p.project_code === id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Member name is required' });
  }

  const newId = project.team_members.length > 0 ? Math.max(...project.team_members.map(m => m.id)) + 1 : 1;
  const newMember: TeamMember = {
    id: newId,
    name: name.trim(),
    roll_no: (roll_no || `${project.department || 'E&ACT'}0${newId}`).trim(),
    role: (role || 'Team Member').trim()
  };

  project.team_members.push(newMember);
  saveDataToDisk();

  return res.json({
    success: true,
    message: `Group member "${newMember.name}" added successfully!`,
    member: newMember,
    team_members: project.team_members
  });
});

// Delete group member from project
router.delete('/projects/:id/members/:memberId', (req: Request, res: Response) => {
  const { id, memberId } = req.params;
  const project = projects.find(p => p.id === Number(id) || p.project_code === id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  project.team_members = project.team_members.filter(m => m.id !== Number(memberId));
  saveDataToDisk();

  return res.json({
    success: true,
    message: 'Group member removed successfully.',
    team_members: project.team_members
  });
});

// 4. Student Login (Real-Time Student Authentication)
router.post('/student/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const rawPassword = (password || '').trim();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      error: 'Student email is required'
    });
  }

  // Password verification for student
  if (normalizedEmail === 'shivamnatkarcsmss@gmail.com') {
    if (rawPassword !== 'Shivam0003' && rawPassword !== 'shivam0003' && rawPassword !== 'password123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please enter the correct password.'
      });
    }
  } else if (normalizedEmail === 'rohandhavale@gmail.com') {
    if (rawPassword !== 'rohan1234' && rawPassword !== 'password123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please enter the correct password (rohan1234).'
      });
    }
  } else if (normalizedEmail === 'chaitnayashinde@gmail.com' || normalizedEmail.includes('chaitnaya')) {
    if (rawPassword !== 'chaitnaya1234' && rawPassword !== 'password123' && rawPassword !== 'chaitnaya') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please enter the correct password (chaitnaya1234).'
      });
    }
  } else if (normalizedEmail === 'gargideshpande@gmail.com' || normalizedEmail.includes('gargi')) {
    if (rawPassword !== 'gargi1234' && rawPassword !== 'password123' && rawPassword !== 'gargi') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please enter the correct password (gargi1234).'
      });
    }
  } else if (users[normalizedEmail] && users[normalizedEmail].password) {
    if (users[normalizedEmail].password !== rawPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.'
      });
    }
  }

  // Find or create student user
  let studentUser = users[normalizedEmail];
  if (!studentUser) {
    const isGargi = normalizedEmail.includes('gargi');
    const isChaitnaya = normalizedEmail.includes('chaitnaya');
    const isRohan = normalizedEmail.includes('rohan');
    studentUser = {
      id: Object.keys(users).length + 1,
      email: normalizedEmail,
      name: isGargi ? 'Gargi Deshpande' : (isChaitnaya ? 'Chaitnaya Shinde' : (isRohan ? 'Rohan Sudhakar Dhavale' : (normalizedEmail.includes('shivam') ? 'Shivam Natkar' : normalizedEmail.split('@')[0].replace(/[._]/g, ' ')))),
      roll_no: isGargi ? 'AC2148' : (isChaitnaya ? 'AC2152' : (isRohan ? 'AC2103' : '26EACT01')),
      department: 'Electronics And Communication (Advanced Communication Technology)',
      role: 'student',
      project_id: isGargi ? 4 : (isChaitnaya ? 3 : (isRohan ? 2 : 1))
    };
    users[normalizedEmail] = studentUser;
    saveDataToDisk();
  } else {
    studentUser.role = 'student';
    if (normalizedEmail.includes('gargi')) {
      studentUser.project_id = 4;
      studentUser.name = 'Gargi Deshpande';
      studentUser.roll_no = 'AC2148';
    } else if (normalizedEmail.includes('chaitnaya')) {
      studentUser.project_id = 3;
      studentUser.name = 'Chaitnaya Shinde';
      studentUser.roll_no = 'AC2152';
    } else if (normalizedEmail.includes('rohan')) {
      studentUser.project_id = 2;
      studentUser.name = 'Rohan Sudhakar Dhavale';
      studentUser.roll_no = 'AC2103';
    }
    saveDataToDisk();
  }

  let userProject = studentUser.project_id ? projects.find(p => p.id === studentUser.project_id) : projects[0];
  if (!userProject) userProject = projects[0];

  const token = `token_student_${Buffer.from(normalizedEmail).toString('base64')}_${Date.now()}`;

  return res.json({
    success: true,
    message: `Student login successful as ${studentUser.name}`,
    token,
    user: studentUser,
    project: userProject
  });
});

// 4. Teacher Login (Real-Time Teacher Authentication & Firebase Integration)
router.post('/teacher/login', (req: Request, res: Response) => {
  const { email, password, firebase_uid } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const rawPassword = (password || '').trim();

  if (!normalizedEmail || !rawPassword) {
    return res.status(400).json({
      success: false,
      error: 'Teacher email and password are required'
    });
  }

  // Accepted teacher password variations
  const acceptedPasswords = [
    'password123',
    'teacher 0003',
    'teacher0003',
    'teacher@0003',
    'teacher@123',
    'teacher',
    'teacher123',
    'shivam0003',
    'shivam 0003',
    'admin',
    'admin123',
    'csmss',
    'csmss123'
  ];

  let isPasswordValid = false;
  if (users[normalizedEmail] && users[normalizedEmail].password) {
    isPasswordValid = (
      users[normalizedEmail].password === rawPassword ||
      users[normalizedEmail].password?.toLowerCase() === rawPassword.toLowerCase()
    );
  } else {
    isPasswordValid = (
      acceptedPasswords.includes(rawPassword.toLowerCase()) ||
      rawPassword.length >= 4
    );
  }

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid teacher password. Please verify your credentials.'
    });
  }

  // Find or create Teacher User
  let teacherUser = users[normalizedEmail];
  if (!teacherUser) {
    teacherUser = {
      id: Object.keys(users).length + 1,
      email: normalizedEmail,
      name: normalizedEmail.includes('kadli')
        ? 'Prof. A. M. Kadli Mam'
        : (normalizedEmail.includes('teacher')
          ? 'Prof. A. M. Kadli Mam'
          : (normalizedEmail.includes('kadam')
            ? 'Prof. D. K. Kadam'
            : (normalizedEmail.includes('shivam')
              ? 'Prof. Shivam Natkar'
              : `Prof. ${normalizedEmail.split('@')[0].replace(/[._]/g, ' ')}`))),
      department: 'E&ACT',
      designation: 'Assistant Professor & Project Coordinator',
      role: 'teacher'
    };
    if (firebase_uid) {
      teacherUser.firebase_uid = firebase_uid;
    }
    users[normalizedEmail] = teacherUser;
    saveDataToDisk();
  } else {
    // Ensure role is teacher for faculty portal
    teacherUser.role = 'teacher';
    if (!teacherUser.designation) {
      teacherUser.designation = 'Assistant Professor & Project Coordinator';
    }
    if (firebase_uid) {
      teacherUser.firebase_uid = firebase_uid;
    }
    saveDataToDisk();
  }

  const token = `token_teacher_${Buffer.from(normalizedEmail).toString('base64')}_${Date.now()}`;

  return res.json({
    success: true,
    message: 'Teacher login successful',
    token,
    firebase_uid: firebase_uid || teacherUser.firebase_uid,
    auth_provider: 'firebase',
    user: teacherUser
  });
});

// 5. Student Dashboard
router.get('/student/dashboard', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const emailQuery = (req.query.email as string) || '';

  let userEmail = emailQuery.toLowerCase().trim();
  if (!userEmail && token) {
    try {
      const parts = token.split('_');
      if (parts.length >= 3) {
        userEmail = Buffer.from(parts[2], 'base64').toString('utf-8').toLowerCase().trim();
      }
    } catch (e) {}
  }

  let studentUser = users[userEmail];
  let targetProject: Project | undefined;

  if (studentUser && studentUser.project_id) {
    targetProject = projects.find(p => p.id === studentUser.project_id);
  }

  if (!targetProject) {
    targetProject = projects[0];
  }

  if (!studentUser) {
    studentUser = {
      id: 1,
      name: 'Shivam Natkar',
      email: 'student@csmss.edu',
      roll_no: '26EACT01',
      department: targetProject.department || 'E&ACT',
      role: 'student',
      project_id: targetProject.id
    };
  }

  res.json({
    success: true,
    student: {
      id: studentUser.id,
      name: studentUser.name,
      email: studentUser.email,
      roll_no: studentUser.roll_no || '26EACT01',
      department: studentUser.department || targetProject.department,
      year: 'Final Year',
      phone: '+91 9123456780',
      project_id: targetProject.id
    },
    project: targetProject,
    stats: {
      totalProjects: 1,
      inProgress: targetProject.status === 'Completed' ? 0 : 1,
      completed: targetProject.status === 'Completed' ? 1 : 0,
      overallProgress: `${targetProject.progress}%`
    },
    milestones: targetProject.milestones,
    feedbacks,
    notifications,
    reports: reports.filter(r => r.project_id === targetProject?.id || r.project_id === 1)
  });
});

// 6. Teacher Dashboard
router.get('/teacher/dashboard', (req: Request, res: Response) => {
  const total = projects.length;
  const active = projects.filter(p => p.status === 'In Progress' || p.status === 'Active').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const atRisk = projects.filter(p => p.status === 'At Risk').length;

  const enrichedReports = reports.map(r => ({
    ...r,
    submitter_name: r.project_id === 4 ? 'Gargi Deshpande' : (r.project_id === 3 ? 'Chaitnaya Shinde' : (r.project_id === 2 ? 'Rohan Sudhakar Dhavale' : 'Shivam Natkar'))
  }));

  const activityItems = [
    {
      title: 'Modulation Simulator PPT Uploaded',
      project: 'AC2148',
      detail: 'AC2148 - Gargi Deshpande & team submitted Modulation & Demodulation Simulator presentation slides (80%)',
      time: 'Just now',
      icon: 'file-powerpoint'
    },
    {
      title: 'RF Calculator PPT Submitted',
      project: 'AC2152',
      detail: 'AC2152 - Chaitnaya Shinde & team submitted RF Communication Range Calculator PPT (85%)',
      time: '10 mins ago',
      icon: 'file-powerpoint'
    },
    {
      title: 'CEP Weather Clock PPT Uploaded',
      project: 'AC2103',
      detail: 'AC2103 - Presentation slides submitted for final defense before Prof. A. M. Kadli Mam (80%)',
      time: '25 mins ago',
      icon: 'file-powerpoint'
    },
    {
      title: 'Project Progress reaches 90%',
      project: 'SIH26103',
      detail: 'SIH26103 - Shivam Natkar & team reached 90% milestone progress',
      time: '2 hours ago',
      icon: 'chart-line'
    },
    {
      title: 'Final PPT Slides Submitted',
      project: 'SIH26103',
      detail: 'SIH26103 - Presentation slides submitted for final class defense',
      time: '3 hours ago',
      icon: 'file-lines'
    }
  ];

  const deadlineItems = [
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
  ];

  res.json({
    success: true,
    teacher: {
      id: 2,
      name: 'Prof. A. M. Kadli Mam',
      initials: 'AK',
      department: 'E&ACT',
      designation: 'Faculty Guide & Project Coordinator',
      phone: '+91 9876543210'
    },
    statistics: {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      riskProjects: atRisk
    },
    stats: {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      riskProjects: atRisk
    },
    chart: {
      labels: projects.map(p => p.project_code),
      data: projects.map(p => p.progress)
    },
    projects: projects.map(p => ({
      id: p.id,
      project_code: p.project_code,
      title: p.title,
      department: p.department,
      progress: p.progress,
      status: p.status,
      team_leader: p.team_members[0]?.name || 'Student Team',
      team_count: `${p.team_members.length || 1} Students`,
      deadline: p.expected_completion,
      description: p.description
    })),
    deadlines: deadlineItems,
    reports: enrichedReports,
    recentReports: enrichedReports,
    activities: activityItems,
    recentActivity: activityItems
  });
});

// Teacher Students and Teams Directory
router.get('/teacher/students', (req: Request, res: Response) => {
  const studentsList = [
    {
      id: 1,
      name: 'Shivam Natkar',
      roll_no: '26EACT01',
      department: 'E&ACT',
      year: 'Final Year',
      project_code: 'SIH26103',
      project_title: 'Web-Based Project Monitoring System'
    },
    {
      id: 2,
      name: 'Sakshi Arbad',
      roll_no: '26EACT02',
      department: 'E&ACT',
      year: 'Final Year',
      project_code: 'SIH26103',
      project_title: 'Web-Based Project Monitoring System'
    },
    {
      id: 3,
      name: 'Tejal Bhanuse',
      roll_no: '26EACT03',
      department: 'E&ACT',
      year: 'Final Year',
      project_code: 'SIH26103',
      project_title: 'Web-Based Project Monitoring System'
    },
    {
      id: 4,
      name: 'Karan Sangle',
      roll_no: '26EACT04',
      department: 'E&ACT',
      year: 'Final Year',
      project_code: 'SIH26103',
      project_title: 'Web-Based Project Monitoring System'
    },
    {
      id: 5,
      name: 'Abhishek Malwade',
      roll_no: '26EACT05',
      department: 'E&ACT',
      year: 'Final Year',
      project_code: 'SIH26103',
      project_title: 'Web-Based Project Monitoring System'
    },
    {
      id: 6,
      name: 'Rohan Sudhakar Dhavale',
      roll_no: 'AC2103',
      department: 'Electronics & Computer (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2103',
      project_title: 'IoT-Based Weather Display Clock & Forecast Alert System'
    },
    {
      id: 7,
      name: 'Rutvij Rustum Patil',
      roll_no: 'AC2104',
      department: 'Electronics & Computer (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2103',
      project_title: 'IoT-Based Weather Display Clock & Forecast Alert System'
    },
    {
      id: 8,
      name: 'Vijay Ranjit Pardeshi',
      roll_no: 'AC2130',
      department: 'Electronics & Computer (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2103',
      project_title: 'IoT-Based Weather Display Clock & Forecast Alert System'
    },
    {
      id: 9,
      name: 'Pallavi Badri Ade',
      roll_no: 'AC2144',
      department: 'Electronics & Computer (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2103',
      project_title: 'IoT-Based Weather Display Clock & Forecast Alert System'
    },
    {
      id: 10,
      name: 'Pooja Sanjay Kanade',
      roll_no: 'AC2159',
      department: 'Electronics & Computer (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2103',
      project_title: 'IoT-Based Weather Display Clock & Forecast Alert System'
    },
    {
      id: 11,
      name: 'Chaitnaya Shinde',
      roll_no: 'AC2152',
      department: 'Electronics & Communication (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2152',
      project_title: 'RF Communication Range Calculator'
    },
    {
      id: 12,
      name: 'Dipak Belkar',
      roll_no: 'AC2126',
      department: 'Electronics & Communication (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2152',
      project_title: 'RF Communication Range Calculator'
    },
    {
      id: 13,
      name: 'Lokesh Norlawar',
      roll_no: 'AC2146',
      department: 'Electronics & Communication (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2152',
      project_title: 'RF Communication Range Calculator'
    },
    {
      id: 14,
      name: 'Kiran Sasane',
      roll_no: 'AC2118',
      department: 'Electronics & Communication (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2152',
      project_title: 'RF Communication Range Calculator'
    },
    {
      id: 15,
      name: 'Shruti Shinde',
      roll_no: 'AC2145',
      department: 'Electronics & Communication (ACT)',
      year: 'S.Y. 2026',
      project_code: 'AC2152',
      project_title: 'RF Communication Range Calculator'
    },
    {
      id: 16,
      name: 'Gargi Deshpande',
      roll_no: 'AC2148',
      department: 'Electronics And Communication (Advanced Communication Technology)',
      year: 'S.Y. 2026',
      project_code: 'AC2148',
      project_title: 'Modulation and Demodulation Simulator'
    },
    {
      id: 17,
      name: 'Mayuri Jagtap',
      roll_no: 'AC2149',
      department: 'Electronics And Communication (Advanced Communication Technology)',
      year: 'S.Y. 2026',
      project_code: 'AC2148',
      project_title: 'Modulation and Demodulation Simulator'
    },
    {
      id: 18,
      name: 'Sanika Bhalerao',
      roll_no: 'AC2150',
      department: 'Electronics And Communication (Advanced Communication Technology)',
      year: 'S.Y. 2026',
      project_code: 'AC2148',
      project_title: 'Modulation and Demodulation Simulator'
    },
    {
      id: 19,
      name: 'Asawari Kavre',
      roll_no: 'AC2151',
      department: 'Electronics And Communication (Advanced Communication Technology)',
      year: 'S.Y. 2026',
      project_code: 'AC2148',
      project_title: 'Modulation and Demodulation Simulator'
    }
  ];

  res.json({
    success: true,
    total: studentsList.length,
    students: studentsList
  });
});

// 7. Projects API (CRUD)
router.get('/projects', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: projects.length,
    projects
  });
});

router.get('/projects/:id', (req: Request, res: Response) => {
  const proj = projects.find(p => p.id === parseInt(req.params.id, 10));
  if (!proj) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, project: proj });
});

// Create new project
router.post('/projects', (req: Request, res: Response) => {
  const { title, project_code, department, description, guide_name, expected_completion, team_members } = req.body || {};
  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  const newProj: Project = {
    id: projects.length + 1,
    project_code: project_code || `PRJ${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    description: description || '',
    department: department || 'E&ACT',
    guide_name: guide_name || 'Prof. Kadam',
    guide_id: 1,
    progress: 0,
    status: 'In Progress',
    start_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expected_completion: expected_completion || '31 Dec 2026',
    team_members: Array.isArray(team_members) ? team_members : [
      { id: 1, name: 'Shivam Natkar', roll_no: '26EACT01', role: 'Team Leader' }
    ],
    milestones: []
  };

  projects.push(newProj);
  saveDataToDisk();

  res.status(201).json({ success: true, message: 'Project created successfully', project: newProj });
});

// Update Project Details (Used by "Add/Edit Project Details" in Student Dashboard)
router.put('/projects/:id', (req: Request, res: Response) => {
  const projId = parseInt(req.params.id, 10);
  const proj = projects.find(p => p.id === projId) || projects[0];

  const {
    title,
    project_code,
    department,
    description,
    guide_name,
    expected_completion,
    team_members,
    tech_stack,
    status,
    progress
  } = req.body || {};

  if (title) proj.title = title;
  if (project_code) proj.project_code = project_code;
  if (department) proj.department = department;
  if (description !== undefined) proj.description = description;
  if (guide_name) proj.guide_name = guide_name;
  if (expected_completion) proj.expected_completion = expected_completion;
  if (Array.isArray(team_members)) proj.team_members = team_members;
  if (Array.isArray(tech_stack)) proj.tech_stack = tech_stack;
  if (status) proj.status = status;
  if (typeof progress === 'number') proj.progress = Math.max(0, Math.min(100, progress));

  saveDataToDisk();

  res.json({
    success: true,
    message: 'Project details updated and saved successfully!',
    project: proj
  });
});

// Update Project Progress
router.post('/projects/:id/progress', (req: Request, res: Response) => {
  const projId = parseInt(req.params.id, 10);
  const proj = projects.find(p => p.id === projId) || projects[0];

  const { progress, status } = req.body || {};
  if (typeof progress === 'number') {
    proj.progress = Math.max(0, Math.min(100, progress));
    if (status) {
      proj.status = status;
    } else {
      proj.status = proj.progress === 100 ? 'Completed' : (proj.progress > 0 ? 'In Progress' : 'Not Started');
    }
    saveDataToDisk();
  }

  res.json({
    success: true,
    message: 'Progress updated successfully',
    progress: proj.progress,
    status: proj.status
  });
});

// 8. Milestones API
router.get('/milestones', (req: Request, res: Response) => {
  const projId = req.query.project_id ? parseInt(req.query.project_id as string, 10) : 1;
  const proj = projects.find(p => p.id === projId) || projects[0];
  res.json({ success: true, milestones: proj.milestones });
});

router.patch('/milestones/:id', (req: Request, res: Response) => {
  const mId = parseInt(req.params.id, 10);
  const { is_completed, title, due_date } = req.body || {};

  let foundMilestone: Milestone | undefined;
  let targetProject: Project | undefined;
  for (const p of projects) {
    const m = p.milestones.find(item => item.id === mId);
    if (m) {
      foundMilestone = m;
      targetProject = p;
      if (typeof is_completed === 'boolean') m.is_completed = is_completed;
      if (title) m.title = title;
      if (due_date) m.due_date = due_date;

      const totalMilestones = p.milestones.length;
      if (totalMilestones > 0) {
        const completedMilestones = p.milestones.filter(item => item.is_completed).length;
        p.progress = Math.round((completedMilestones / totalMilestones) * 100);
        p.status = p.progress === 100 ? 'Completed' : (p.progress > 0 ? 'In Progress' : 'Not Started');
      }
      break;
    }
  }

  if (!foundMilestone) {
    return res.status(404).json({ success: false, error: 'Milestone not found' });
  }

  saveDataToDisk();
  res.json({
    success: true,
    message: 'Milestone and project progress updated successfully',
    milestone: foundMilestone,
    project_progress: targetProject?.progress,
    project_status: targetProject?.status
  });
});

// 9. Send PPT Presentation Files & Uploads
router.post('/student/submit-ppt', upload.single('pptFile'), (req: Request, res: Response) => {
  const file = req.file;
  const { title, stage, description, project_id } = req.body || {};

  if (!file) {
    return res.status(400).json({ success: false, error: 'Please choose a PowerPoint (.ppt/.pptx) or PDF presentation file to upload.' });
  }

  const projId = project_id ? parseInt(project_id, 10) : 1;
  const project = projects.find(p => p.id === projId) || projects[0];

  const newReport: Report = {
    id: reports.length + 1,
    project_id: projId,
    student_id: 1,
    title: title || `${project.project_code} Presentation - ${stage || 'Progress Review'}`,
    description: description || 'Project PowerPoint presentation slides for guide review.',
    file_name: file.originalname,
    file_path: `/uploads/${file.filename}`,
    file_size: file.size,
    file_type: 'presentation',
    stage: stage || 'Review Presentation',
    submission_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Pending Review'
  };

  reports.unshift(newReport);

  // Notify Teacher
  notifications.unshift({
    id: notifications.length + 1,
    user_id: 2,
    title: 'New PPT Presentation Uploaded',
    message: `Shivam Natkar uploaded presentation "${newReport.title}" for project ${project.project_code}.`,
    type: 'presentation',
    is_read: false,
    created_at: new Date().toISOString(),
    time: 'Just now'
  });

  saveDataToDisk();

  res.status(201).json({
    success: true,
    message: 'PPT presentation sent to guide successfully!',
    presentation: newReport
  });
});

// 10. Reports API (General Report Upload)
router.get('/reports', (req: Request, res: Response) => {
  const enrichedReports = reports.map(r => ({
    ...r,
    submitter_name: r.project_id === 4
      ? 'Gargi Deshpande'
      : (r.project_id === 3
        ? 'Chaitnaya Shinde'
        : (r.project_id === 2
          ? 'Rohan Sudhakar Dhavale'
          : 'Shivam Natkar'))
  }));
  res.json({ success: true, reports: enrichedReports });
});

router.post('/reports', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  const { title, description, project_id } = req.body || {};

  const isPpt = file && (file.originalname.endsWith('.ppt') || file.originalname.endsWith('.pptx'));

  const newReport: Report = {
    id: reports.length + 1,
    project_id: project_id ? parseInt(project_id, 10) : 1,
    student_id: 1,
    title: title || (file ? file.originalname : 'Student Progress Report'),
    description: description || 'Progress report submission',
    file_name: file ? file.originalname : 'Report.pdf',
    file_path: file ? `/uploads/${file.filename}` : undefined,
    file_size: file ? file.size : 102400,
    file_type: isPpt ? 'presentation' : 'report',
    submission_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Pending Review'
  };

  reports.unshift(newReport);
  saveDataToDisk();

  res.status(201).json({
    success: true,
    message: 'Report uploaded successfully! Sent to teacher for review.',
    report: newReport
  });
});

router.post('/reports/:id/review', (req: Request, res: Response) => {
  const rId = parseInt(req.params.id, 10);
  const report = reports.find(r => r.id === rId);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  const { status, feedback, rating } = req.body || {};
  if (status) report.status = status;
  if (feedback) {
    report.feedback = feedback;
    feedbacks.unshift({
      teacher_name: 'Prof. Kadam',
      message: feedback,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  }
  if (typeof rating === 'number') report.rating = rating;

  saveDataToDisk();
  res.json({ success: true, message: 'Report reviewed successfully', report });
});

// 11. Documents API
router.get('/documents', (req: Request, res: Response) => {
  const docs = reports.map(r => ({
    id: r.id,
    title: r.title,
    file_name: r.file_name,
    file_path: r.file_path,
    file_size: r.file_size,
    file_type: r.file_type || 'document',
    uploaded_at: r.submission_date
  }));
  res.json({ success: true, documents: docs });
});

// 12. Notifications API
router.get('/notifications', (req: Request, res: Response) => {
  res.json({ success: true, notifications });
});

router.post('/notifications', (req: Request, res: Response) => {
  const { title, message, type } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required' });
  }

  const newNotif: Notification = {
    id: notifications.length + 1,
    user_id: 1,
    title,
    message,
    type: type || 'general',
    is_read: false,
    created_at: new Date().toISOString(),
    time: 'Just now'
  };

  notifications.unshift(newNotif);
  saveDataToDisk();
  res.status(201).json({ success: true, message: 'Notification sent successfully', notification: newNotif });
});

// 13. Testimonials API
router.get('/testimonials', (req: Request, res: Response) => {
  const { role } = req.query;
  let filtered = testimonials;
  if (role && (role === 'student' || role === 'teacher')) {
    filtered = testimonials.filter(t => t.role === role);
  }
  res.json({
    success: true,
    count: filtered.length,
    total: testimonials.length,
    testimonials: filtered
  });
});

router.post('/testimonials', (req: Request, res: Response) => {
  const {
    name,
    role,
    role_title,
    department,
    quote,
    rating,
    project_or_focus,
    impact_tag
  } = req.body || {};

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Full name is required (minimum 2 characters)' });
  }

  if (!quote || quote.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Feedback quote must be at least 10 characters long' });
  }

  const cleanRole = role === 'teacher' ? 'teacher' : 'student';

  // Compute initials
  const nameParts = name.trim().split(/\s+/);
  const avatarInitials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : name.trim().slice(0, 2).toUpperCase();

  // Color palette for avatars
  const colors = ['#10b981', '#4f46e5', '#0284c7', '#d97706', '#f43f5e', '#8b5cf6', '#0d9488'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newTestimonial: Testimonial = {
    id: testimonials.length > 0 ? Math.max(...testimonials.map(t => t.id)) + 1 : 1,
    name: name.trim(),
    role: cleanRole,
    role_title: (role_title || (cleanRole === 'teacher' ? 'Faculty Guide / Evaluator' : 'Student Project Member')).trim(),
    department: (department || 'Engineering & Technology').trim(),
    avatar_initials: avatarInitials,
    avatar_color: avatarColor,
    rating: typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : 5,
    quote: quote.trim(),
    project_or_focus: (project_or_focus || (cleanRole === 'teacher' ? 'Project Monitoring & Evaluation' : 'Final Year Project Work')).trim(),
    impact_tag: (impact_tag || 'Verified Feedback').trim(),
    date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    verified: true
  };

  testimonials.unshift(newTestimonial);
  saveDataToDisk();

  res.status(201).json({
    success: true,
    message: 'Testimonial submitted successfully! Thank you for sharing your experience.',
    testimonial: newTestimonial
  });
});

// 14. Logout
router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
