"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Onboarding() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState({
        current_year: 3,
        target_role: "SDE",
        hours_per_day: 2,
        days_per_week: 6,
        current_level_dsa: "Intermediate",
        preferred_language: "English",
        weak_topics: "",
        deadline_date: ""
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem("user_email");
        if (!storedEmail) {
            router.push("/");
        } else {
            setEmail(storedEmail);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting profile...");
        try {
            const payload = {
                email,
                ...formData,
                weak_topics: formData.weak_topics ? formData.weak_topics.split(",").map(t => t.trim()).filter(t => t) : []
            };
            console.log("Payload:", payload);

            const res = await axios.post("http://localhost:8000/profile", payload);
            console.log("Profile created:", res.data);

            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating profile:", error);
            alert("Failed to create profile. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Tell us about yourself</h1>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Current Year</label>
                            <select
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.current_year}
                                onChange={(e) => setFormData({ ...formData, current_year: parseInt(e.target.value) })}
                            >
                                <option value={1}>1st Year</option>
                                <option value={2}>2nd Year</option>
                                <option value={3}>3rd Year</option>
                                <option value={4}>4th Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">Target Role</label>
                            <select
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.target_role}
                                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                            >
                                <option value="SDE">SDE</option>
                                <option value="Data Scientist">Data Scientist</option>
                                <option value="AI/ML Engineer">AI/ML Engineer</option>
                                <option value="GenAI Engineer">GenAI Engineer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">Hours per Day</label>
                            <input
                                type="number"
                                min={1}
                                max={12}
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.hours_per_day || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, hours_per_day: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">Days per Week</label>
                            <input
                                type="number"
                                min={1}
                                max={7}
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.days_per_week || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, days_per_week: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">DSA Level</label>
                            <select
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.current_level_dsa}
                                onChange={(e) => setFormData({ ...formData, current_level_dsa: e.target.value })}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">Preferred Language</label>
                            <select
                                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                                value={formData.preferred_language}
                                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                            >
                                <option value="English">English</option>
                                <option value="Hinglish">Hinglish</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400">Weak Topics (comma separated)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                            placeholder="e.g. Graphs, DP, Tries"
                            value={formData.weak_topics}
                            onChange={(e) => setFormData({ ...formData, weak_topics: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400">Target Deadline (Optional)</label>
                        <input
                            type="date"
                            className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                            value={formData.deadline_date}
                            onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Generate My Roadmap
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
