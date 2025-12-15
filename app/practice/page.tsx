"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function Practice() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<any>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState<any>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const email = localStorage.getItem("user_email");
        if (!email) {
            router.push("/");
            return;
        }

        // Fetch user to get ID
        axios.post("http://localhost:8000/profile", {
            email,
            current_year: 0, target_role: "", hours_per_day: 0, days_per_week: 0, current_level_dsa: "", preferred_language: "", weak_topics: []
        })
            .then(res => {
                setUser(res.data);
                const date = dateParam || new Date().toISOString().split('T')[0];
                fetchDailyTask(res.data.id, date);
            })
            .catch(err => {
                console.error("Error fetching user", err);
                setLoading(false);
            });
    }, [router, dateParam]);

    const fetchDailyTask = async (userId: number, date: string) => {
        try {
            const res = await axios.get(`http://localhost:8000/daily/${date}?user_id=${userId}`);
            setTask(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching task", error);
            setLoading(false);
        }
    };

    const [error, setError] = useState("");

    // ... (useEffect remains same)

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return;
        setEvaluating(true);
        setError("");

        try {
            const payload = {
                user_id: user.id,
                question_id: "daily-" + task.date,
                user_answer: userAnswer,
                problem_description: task.summary
            };

            const res = await axios.post("http://localhost:8000/attempt/evaluate", payload);
            setFeedback(res.data);
        } catch (error) {
            console.error("Error evaluating", error);
            setError("Failed to evaluate answer. Please try again.");
        } finally {
            setEvaluating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-500 rounded-full mb-4"></div>
                <div className="text-xl text-blue-400 font-semibold">Loading daily challenge...</div>
            </div>
        </div>
    );

    // ... (No tasks check remains same)

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Daily Practice: {task.date}</h1>
                    <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">Exit</button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Problem Section */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 text-blue-400">Task</h2>
                            <p className="text-lg leading-relaxed">{task.summary}</p>
                            <div className="mt-4 p-4 bg-gray-900 rounded text-sm text-gray-400">
                                Tip: Describe your approach or paste your code solution below.
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4">Your Solution</h2>
                            <textarea
                                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-md p-4 text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Type your code or explanation here..."
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                            />
                            {error && (
                                <div className="mt-2 text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900">
                                    {error}
                                </div>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={evaluating || !userAnswer.trim()}
                                className={`mt-4 w-full py-3 rounded-md font-bold transition-all ${evaluating
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    }`}
                            >
                                {evaluating ? "AI is evaluating..." : "Submit & Evaluate"}
                            </button>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="space-y-6">
                        {feedback ? (
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Feedback</h2>
                                    <div className={`text-3xl font-black ${feedback.score >= 8 ? "text-green-400" : feedback.score >= 5 ? "text-yellow-400" : "text-red-400"
                                        }`}>
                                        {feedback.score}/10
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Verdict</h3>
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${feedback.correctness === "correct" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                                            }`}>
                                            {feedback.correctness}
                                        </div>
                                    </div>

                                    {feedback.main_mistakes && feedback.main_mistakes.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Mistakes</h3>
                                            <ul className="list-disc list-inside space-y-1 text-red-300">
                                                {feedback.main_mistakes.map((m: string, i: number) => (
                                                    <li key={i}>{m}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {feedback.ideal_approach && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ideal Approach</h3>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{feedback.ideal_approach}</p>
                                        </div>
                                    )}

                                    {feedback.next_practice && feedback.next_practice.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Next Steps</h3>
                                            <ul className="space-y-2">
                                                {feedback.next_practice.map((p: string, i: number) => (
                                                    <li key={i} className="bg-gray-900 p-2 rounded text-sm text-blue-300 border border-gray-700">
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                <p>Submit your answer to see AI feedback</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
