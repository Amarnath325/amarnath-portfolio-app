<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\PersonalInfo;
use App\Models\Strength;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Education;
use App\Models\ContactMessage;

class PortfolioApiController
{
    /**
     * Get Complete Dynamic Portfolio Payload
     */
    public function getPortfolioData()
    {
        $personal = PersonalInfo::first() ?? $this->fallbackPersonal();
        $strengths = Strength::orderBy('sort_order', 'asc')->get();
        $skills = Skill::orderBy('sort_order', 'asc')->get();
        $experiences = Experience::orderBy('sort_order', 'asc')->get();
        $projects = Project::orderBy('sort_order', 'asc')->get();
        $education = Education::orderBy('sort_order', 'asc')->get();

        // Format skills into categories for clean React consumption
        $categorizedSkills = [
            'backend' => $skills->where('category', 'backend')->values(),
            'frontend' => $skills->where('category', 'frontend')->values(),
            'cloudDb' => $skills->where('category', 'cloudDb')->values(),
            'aiSecurity' => $skills->where('category', 'aiSecurity')->values(),
        ];

        return response()->json([
            'status' => true,
            'data' => [
                'personal' => $personal,
                'strengths' => $strengths,
                'skills' => $categorizedSkills,
                'experiences' => $experiences,
                'projects' => $projects,
                'education' => $education,
            ]
        ]);
    }

    public function getPersonalInfo()
    {
        return response()->json([
            'status' => true,
            'data' => PersonalInfo::first() ?? $this->fallbackPersonal()
        ]);
    }

    public function getStrengths()
    {
        return response()->json(['status' => true, 'data' => Strength::orderBy('sort_order')->get()]);
    }

    public function getSkills()
    {
        return response()->json(['status' => true, 'data' => Skill::orderBy('sort_order')->get()]);
    }

    public function getExperiences()
    {
        return response()->json(['status' => true, 'data' => Experience::orderBy('sort_order')->get()]);
    }

    public function getProjects()
    {
        return response()->json(['status' => true, 'data' => Project::orderBy('sort_order')->get()]);
    }

    public function getEducation()
    {
        return response()->json(['status' => true, 'data' => Education::orderBy('sort_order')->get()]);
    }

    /**
     * Handle incoming contact inquiries
     */
    public function submitContactMessage(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $msg = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
            'ip_address' => $request->ip(),
            'is_read' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Thank you! Your message has been received.',
            'data' => $msg
        ], 201);
    }

    private function fallbackPersonal()
    {
        return [
            'name' => 'Amarnath Chauhan',
            'title' => 'Senior Laravel & Full Stack Developer',
            'location' => 'Raipur, Chhattisgarh, India',
            'phone' => '+91-88894-36902',
            'email' => 'amarnath24081997@gmail.com',
            'github' => 'https://github.com/Amarnath325',
            'linkedin' => 'https://linkedin.com/in/amarnath-chauhan-255805183',
            'experience_years' => 5,
            'summary' => 'Full Stack Developer with 5+ years of experience specializing in scalable enterprise applications across Laravel, Magento2, and React.js.',
        ];
    }
}
