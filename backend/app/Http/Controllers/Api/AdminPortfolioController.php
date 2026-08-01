<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PersonalInfo;
use App\Models\Strength;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Project;
use App\Models\ContactMessage;

class AdminPortfolioController extends Controller
{
    // Update Personal Info
    public function updatePersonalInfo(Request $request)
    {
        $info = PersonalInfo::first() ?? new PersonalInfo();
        $info->fill($request->all());
        $info->save();

        return response()->json(['status' => true, 'message' => 'Personal info updated successfully', 'data' => $info]);
    }

    // Projects CRUD
    public function listProjects()
    {
        return response()->json(['status' => true, 'data' => Project::orderBy('sort_order')->get()]);
    }

    public function storeProject(Request $request)
    {
        $project = Project::create($request->all());
        return response()->json(['status' => true, 'message' => 'Project created', 'data' => $project], 201);
    }

    public function updateProject(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->all());
        return response()->json(['status' => true, 'message' => 'Project updated', 'data' => $project]);
    }

    public function deleteProject($id)
    {
        Project::destroy($id);
        return response()->json(['status' => true, 'message' => 'Project deleted']);
    }

    // Skills CRUD
    public function listSkills()
    {
        return response()->json(['status' => true, 'data' => Skill::orderBy('sort_order')->get()]);
    }

    public function storeSkill(Request $request)
    {
        $skill = Skill::create($request->all());
        return response()->json(['status' => true, 'message' => 'Skill created', 'data' => $skill], 201);
    }

    public function updateSkill(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);
        $skill->update($request->all());
        return response()->json(['status' => true, 'message' => 'Skill updated', 'data' => $skill]);
    }

    public function deleteSkill($id)
    {
        Skill::destroy($id);
        return response()->json(['status' => true, 'message' => 'Skill deleted']);
    }

    // Experiences CRUD
    public function listExperiences()
    {
        return response()->json(['status' => true, 'data' => Experience::orderBy('sort_order')->get()]);
    }

    public function storeExperience(Request $request)
    {
        $exp = Experience::create($request->all());
        return response()->json(['status' => true, 'message' => 'Experience created', 'data' => $exp], 201);
    }

    public function updateExperience(Request $request, $id)
    {
        $exp = Experience::findOrFail($id);
        $exp->update($request->all());
        return response()->json(['status' => true, 'message' => 'Experience updated', 'data' => $exp]);
    }

    public function deleteExperience($id)
    {
        Experience::destroy($id);
        return response()->json(['status' => true, 'message' => 'Experience deleted']);
    }

    // Messages Inbox
    public function listMessages()
    {
        return response()->json(['status' => true, 'data' => ContactMessage::orderBy('created_at', 'desc')->get()]);
    }

    public function markMessageRead($id)
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->update(['is_read' => true]);
        return response()->json(['status' => true, 'message' => 'Marked as read']);
    }
}
