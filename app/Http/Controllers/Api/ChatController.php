<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // List active sessions
    public function sessions()
    {
        $sessions = Chat::select('session_id')
            ->selectRaw('MAX(message) as last_message')
            ->selectRaw('MAX(sender_type) as last_sender')
            ->selectRaw('MAX(created_at) as last_time')
            ->selectRaw('SUM(CASE WHEN sender_type = "student" AND is_read = 0 THEN 1 ELSE 0 END) as unread_count')
            ->groupBy('session_id')
            ->orderByRaw('MAX(created_at) DESC')
            ->get();

        // Get the actual last message per session
        $result = [];
        foreach ($sessions as $session) {
            $lastMsg = Chat::where('session_id', $session->session_id)
                ->orderBy('created_at', 'desc')->first();
            $result[] = [
                'session_id' => $session->session_id,
                'last_message' => $lastMsg ? $lastMsg->message : '',
                'last_sender' => $lastMsg ? $lastMsg->sender_type : 'student',
                'last_time' => $lastMsg ? $lastMsg->created_at : null,
                'unread_count' => (int) $session->unread_count,
            ];
        }

        return response()->json(['success' => true, 'data' => $result]);
    }

    // Get messages for a session
    public function messages($sessionId)
    {
        $messages = Chat::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')->get();
        return response()->json(['success' => true, 'data' => $messages]);
    }

    // Send message
    public function store(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|max:64',
            'sender_type' => 'required|in:student,counselor',
            'message' => 'required|string|max:5000',
        ]);

        $chat = new Chat();
        $chat->session_id = $request->session_id;
        $chat->sender_type = $request->sender_type;
        $chat->message = $request->message;
        $chat->is_read = false;
        $chat->created_at = now();
        $chat->save();

        return response()->json(['success' => true, 'data' => $chat], 201);
    }

    // Mark messages as read
    public function markRead($sessionId)
    {
        $updated = Chat::where('session_id', $sessionId)
            ->where('sender_type', 'student')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true, 'updated' => $updated]);
    }
}
