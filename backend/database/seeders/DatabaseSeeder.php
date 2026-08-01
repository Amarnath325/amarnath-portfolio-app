<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PersonalInfo;
use App\Models\Strength;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Education;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Personal Info
        PersonalInfo::updateOrCreate(['id' => 1], [
            'name' => 'Amarnath Chauhan',
            'title' => 'Senior Laravel & Full Stack Developer',
            'location' => 'Raipur, Chhattisgarh, India',
            'phone' => '+91-88894-36902',
            'email' => 'amarnath24081997@gmail.com',
            'github' => 'https://github.com/Amarnath325',
            'linkedin' => 'https://linkedin.com/in/amarnath-chauhan-255805183',
            'experience_years' => 5,
            'summary' => 'Full Stack Developer with 5+ years of experience specializing in scalable enterprise applications across Laravel, Magento2, and React.js. Skilled in backend engineering, secure API design, authentication (RBAC), CMS platforms, HRMS, and healthcare systems, with hands-on experience integrating AI tools (OpenAI, Claude AI, Copilot) into modern development workflows.',
            'status' => 'active',
        ]);

        // 2. Strengths
        Strength::truncate();
        $strengths = [
            ['title' => 'Authentication & RBAC', 'icon' => 'fa-shield-halved', 'desc' => 'Granular role-based access control, multi-tenant permission layers, JWT & Sanctum security implementations.', 'sort_order' => 1],
            ['title' => 'Scalable Architecture', 'icon' => 'fa-layer-group', 'desc' => 'Designing high-throughput REST APIs, database indexing, caching strategies with Redis, and modular backend code.', 'sort_order' => 2],
            ['title' => 'AWS Face Recognition', 'icon' => 'fa-face-smile', 'desc' => 'Real-time biometric validation, face detection integration, and automated attendance matching with AWS Rekognition.', 'sort_order' => 3],
            ['title' => 'AI Workflow Integration', 'icon' => 'fa-robot', 'desc' => 'Integrating OpenAI ChatGPT API, Claude AI, and prompt engineering into business platforms for process automation.', 'sort_order' => 4],
            ['title' => 'Performance Optimization', 'icon' => 'fa-gauge-high', 'desc' => 'Query optimization, async queue processing, microservices, and response time reduction for heavy ERP systems.', 'sort_order' => 5],
            ['title' => 'Cloud & DevOps', 'icon' => 'fa-cloud-arrow-up', 'desc' => 'AWS infrastructure deployment, S3 storage management, Docker containerization, and automated CI/CD pipelines.', 'sort_order' => 6],
        ];
        foreach ($strengths as $st) { Strength::create($st); }

        // 3. Skills
        Skill::truncate();
        $skills = [
            // Backend
            ['name' => 'PHP 8.x', 'category' => 'backend', 'icon' => 'fa-brands fa-php', 'is_highlighted' => true, 'sort_order' => 1],
            ['name' => 'Laravel 8-12', 'category' => 'backend', 'icon' => 'fa-brands fa-laravel', 'is_highlighted' => true, 'sort_order' => 2],
            ['name' => 'Livewire', 'category' => 'backend', 'icon' => 'fa-solid fa-bolt', 'is_highlighted' => false, 'sort_order' => 3],
            ['name' => 'Python', 'category' => 'backend', 'icon' => 'fa-brands fa-python', 'is_highlighted' => false, 'sort_order' => 4],
            ['name' => 'Django', 'category' => 'backend', 'icon' => 'fa-solid fa-cubes', 'is_highlighted' => false, 'sort_order' => 5],

            // Frontend
            ['name' => 'React.js', 'category' => 'frontend', 'icon' => 'fa-brands fa-react', 'is_highlighted' => true, 'sort_order' => 1],
            ['name' => 'JavaScript (ES6+)', 'category' => 'frontend', 'icon' => 'fa-brands fa-js', 'is_highlighted' => false, 'sort_order' => 2],
            ['name' => 'HTML5 / CSS3', 'category' => 'frontend', 'icon' => 'fa-brands fa-html5', 'is_highlighted' => false, 'sort_order' => 3],
            ['name' => 'Bootstrap', 'category' => 'frontend', 'icon' => 'fa-brands fa-bootstrap', 'is_highlighted' => false, 'sort_order' => 4],
            ['name' => 'WordPress', 'category' => 'frontend', 'icon' => 'fa-brands fa-wordpress', 'is_highlighted' => false, 'sort_order' => 5],
            ['name' => 'Magento 2', 'category' => 'frontend', 'icon' => 'fa-brands fa-magento', 'is_highlighted' => true, 'sort_order' => 6],

            // CloudDb
            ['name' => 'MySQL', 'category' => 'cloudDb', 'icon' => 'fa-solid fa-database', 'is_highlighted' => true, 'sort_order' => 1],
            ['name' => 'Redis', 'category' => 'cloudDb', 'icon' => 'fa-solid fa-memory', 'is_highlighted' => true, 'sort_order' => 2],
            ['name' => 'AWS (S3, Rekognition)', 'category' => 'cloudDb', 'icon' => 'fa-brands fa-aws', 'is_highlighted' => true, 'sort_order' => 3],
            ['name' => 'Docker', 'category' => 'cloudDb', 'icon' => 'fa-brands fa-docker', 'is_highlighted' => false, 'sort_order' => 4],
            ['name' => 'Git & CI/CD', 'category' => 'cloudDb', 'icon' => 'fa-solid fa-code-branch', 'is_highlighted' => false, 'sort_order' => 5],

            // AiSecurity
            ['name' => 'OpenAI ChatGPT API', 'category' => 'aiSecurity', 'icon' => 'fa-solid fa-brain', 'is_highlighted' => true, 'sort_order' => 1],
            ['name' => 'Claude AI & Cursor', 'category' => 'aiSecurity', 'icon' => 'fa-solid fa-robot', 'is_highlighted' => false, 'sort_order' => 2],
            ['name' => 'JWT / Sanctum / RBAC', 'category' => 'aiSecurity', 'icon' => 'fa-solid fa-key', 'is_highlighted' => false, 'sort_order' => 3],
            ['name' => 'RESTful APIs', 'category' => 'aiSecurity', 'icon' => 'fa-solid fa-network-wired', 'is_highlighted' => false, 'sort_order' => 4],
            ['name' => 'Queues & Schedulers', 'category' => 'aiSecurity', 'icon' => 'fa-solid fa-clock', 'is_highlighted' => false, 'sort_order' => 5],
        ];
        foreach ($skills as $sk) { Skill::create($sk); }

        // 4. Experiences
        Experience::truncate();
        $experiences = [
            [
                'role' => 'Laravel Developer',
                'company' => 'Fixingdots Pvt Ltd',
                'period' => 'Jan 2025 - Present',
                'points' => [
                    'Architecting scalable web applications, microservices, and robust REST API backends.',
                    'Implementing advanced authentication, multi-tenant RBAC permissions, and optimized query execution plans.',
                    'Leading attendance policy engine development, shift resolvers, and real-time device check-in synchronizations.'
                ],
                'sort_order' => 1
            ],
            [
                'role' => 'Associate Developer',
                'company' => '18th Digitech Pvt Ltd',
                'period' => 'Jan 2023 - Dec 2024',
                'points' => [
                    'Engineered high-performance e-commerce systems with seamless checkout pipelines and order tracking.',
                    'Contributed to enterprise web platforms for global brands including Prestige, Crocs, LCBO, and WhiteTeak.',
                    'Integrated payment gateways, inventory sync mechanisms, and custom Magento 2 / Laravel modules.'
                ],
                'sort_order' => 2
            ],
            [
                'role' => 'PHP Developer',
                'company' => 'Latitude Technolabs Pvt Ltd',
                'period' => 'Sep 2021 - Dec 2022',
                'points' => [
                    'Built dynamic web applications using Laravel & MySQL, improving database indexing and load time by 35%.',
                    'Designed custom CRUD controllers, reporting dashboards, and complex data import/export engines.'
                ],
                'sort_order' => 3
            ],
            [
                'role' => 'Laravel Developer',
                'company' => 'Augmentuss Automation',
                'period' => 'Jan 2021 - Aug 2021',
                'points' => [
                    'Developed membership management modules, third-party API connectors, and production-ready Laravel tools.'
                ],
                'sort_order' => 4
            ],
        ];
        foreach ($experiences as $exp) { Experience::create($exp); }

        // 5. Projects
        Project::truncate();
        $projects = [
            [
                'title' => 'FixHR - HRMS System',
                'category' => 'enterprise',
                'tag' => 'HRMS Platform',
                'icon' => 'fa-users-gear',
                'description' => 'Complete attendance and leave engine, payroll automation, shift policy calculation, and AWS Rekognition face detection integration.',
                'tech' => ['Laravel', 'AWS Rekognition', 'MySQL', 'Redis'],
                'sort_order' => 1
            ],
            [
                'title' => 'SODS - Sales Order System',
                'category' => 'enterprise',
                'tag' => 'Sales Engine',
                'icon' => 'fa-cart-shopping',
                'description' => 'Centralized platform for sales teams to manage customer records, live product inventory, multi-tier discount matrix, and order fulfillment.',
                'tech' => ['Laravel', 'REST API', 'Vue/React', 'MySQL'],
                'sort_order' => 2
            ],
            [
                'title' => 'Enterprise CRM System',
                'category' => 'enterprise',
                'tag' => 'CRM System',
                'icon' => 'fa-chart-line',
                'description' => 'Technology-driven customer interaction platform with lead pipeline automation, analytics dashboards, and retention tracking.',
                'tech' => ['PHP/Laravel', 'Bootstrap', 'Analytics', 'API'],
                'sort_order' => 3
            ],
            [
                'title' => 'IPACare - Hospital System',
                'category' => 'custom',
                'tag' => 'Healthcare',
                'icon' => 'fa-hospital',
                'description' => 'Doctor slot scheduling, automated appointment validation, patient conflict detection, and medical history backend.',
                'tech' => ['Laravel', 'REST APIs', 'MySQL'],
                'sort_order' => 4
            ],
            [
                'title' => 'Tunshey App (Backend)',
                'category' => 'custom',
                'tag' => 'Mobile Backend',
                'icon' => 'fa-mobile-screen',
                'description' => 'Scalable admin panel, multi-region payment gateway integration, JWT authentication, and RBAC permission manager.',
                'tech' => ['Laravel', 'JWT', 'Stripe/Razorpay'],
                'sort_order' => 5
            ],
            [
                'title' => 'Bewitching & Legal CMS',
                'category' => 'cms',
                'tag' => 'CMS Platform',
                'icon' => 'fa-globe',
                'description' => 'Custom CMS platforms featuring provider profiles, review engines, legal content pipelines, and corporate blog structures (Bewitching, Lores Legal, Esbamax).',
                'tech' => ['WordPress', 'Laravel', 'SEO'],
                'sort_order' => 6
            ]
        ];
        foreach ($projects as $proj) { Project::create($proj); }

        // 6. Education
        Education::truncate();
        $education = [
            ['degree' => 'B.Tech in Computer Science', 'school' => 'CSVTU Bhilai (Chhattisgarh)', 'year' => '2016 - 2020', 'icon' => 'fa-graduation-cap', 'sort_order' => 1],
            ['degree' => 'Higher Secondary (12th Science)', 'school' => 'CGBSE Board, Raipur, Chhattisgarh', 'year' => 'Passed 2016', 'icon' => 'fa-school', 'sort_order' => 2],
        ];
        foreach ($education as $edu) { Education::create($edu); }
    }
}
