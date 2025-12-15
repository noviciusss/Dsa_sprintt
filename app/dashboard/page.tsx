"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface WeekPlan {
    week_goal: string;
    topics: string[];
    daily_schedule: string[];
}

interface PlanJSON {
    plan_meta: any;
    weeks: WeekPlan[];
    daily_practice_templates: any;
    resources: string[];
    success_metrics: string[];
}

export default function Dashboard() {
    const router = useRouter();
    const [plan, setPlan] = useState<PlanJSON | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const email = localStorage.getItem("user_email");
        if (!email) {
            router.push("/");
            return;
        }

        // Fetch user details to get ID
        // We use a new endpoint or just try to get the plan. 
        // But we need user ID for plan fetching.
        // Let's assume we can fetch user by email via a GET or POST check.
        // Since we don't have a specific GET /user/email endpoint, we can use the POST /profile 
        // but WITHOUT updating data if we just want to check? 
        // Actually, the previous code was creating a dummy profile.
        // Let's add a proper GET /user endpoint or use the existing one carefully.
        // For now, let's try to find the user. If we can't find them, go to onboarding.

        // We'll use the same POST endpoint but we need to be careful not to overwrite with empty data if we just want to fetch.
        // The backend `create_profile` updates if exists. Sending empty/dummy data is bad.
        // We need a way to GET user by email.
        // Let's quickly add a GET /user endpoint to backend or use a workaround.
        // Workaround: The backend returns the user if we call POST. 
        // BUT it updates. 
        // Let's add GET /user/:email to backend first.

        // Wait, I can't edit backend in this tool call. 
        // I will assume I will add GET /user endpoint.
        axios.get(`http://localhost:8000/user?email=${email}`)
            .then(res => {
                setUser(res.data);
                fetchPlan(res.data.id);
            })
            .catch(err => {
                console.error("User not found", err);
                router.push("/onboarding");
            });
    }, [router]);

    const fetchPlan = async (userId: number) => {
        try {
            const res = await axios.get(`http://localhost:8000/plan/current?user_id=${userId}`);
            setPlan(res.data.plan_json);
            setLoading(false);
        } catch (error) {
            console.log("No plan found, generating...");
            generatePlan(userId);
        }
    };

    const generatePlan = async (userId: number) => {
        try {
            setLoading(true);
            const res = await axios.post("http://localhost:8000/plan/generate", { user_id: userId });
            setPlan(res.data.plan_json);
            setLoading(false);
        } catch (error) {
            console.error("Error generating plan", error);
            setLoading(false);
            alert("Failed to generate plan.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-pulse text-xl text-blue-500">Loading your personalized roadmap...</div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <p className="mb-4">No plan found.</p>
                <button
                    onClick={() => user && generatePlan(user.id)}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    Generate Plan
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            Your Roadmap
                        </h1>
                        <p className="text-gray-400">Target: {user?.target_role}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">Day 1</div>
                            <div className="text-sm text-gray-500">of {plan.plan_meta?.duration_days} days</div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("user_email");
                                router.push("/");
                            }}
                            className="px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-900/50 rounded hover:bg-red-900/20 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Plan View */}
                    <div className="lg:col-span-2 space-y-6">
                        {plan.weeks.map((week, idx) => (
                            <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-xl font-semibold mb-4 text-blue-300">Week {idx + 1}: {week.week_goal}</h2>

                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Topics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(week.topics || []).map((t, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Schedule</h3>
                                    <div className="space-y-2">
                                        {week.daily_schedule.map((day, i) => (
                                            <div key={i} className="p-3 bg-gray-900/50 rounded border border-gray-800 flex justify-between items-center">
                                                <span className="text-sm text-gray-300">{day}</span>
                                                <button
                                                    onClick={() => {
                                                        const today = new Date();
                                                        today.setDate(today.getDate() + (idx * 7) + i);
                                                        const dateStr = today.toISOString().split('T')[0];
                                                        router.push(`/practice?date=${dateStr}`);
                                                    }}
                                                    className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30"
                                                >
                                                    Start
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">Success Metrics</h3>
                            <ul className="space-y-2">
                                {plan.success_metrics.map((m, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className="text-green-500 mt-1">✓</span>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                {plan.resources.map((r, i) => (
                                    <li key={i} className="text-sm">
                                        <a href="#" className="text-blue-400 hover:underline truncate block">{r}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
