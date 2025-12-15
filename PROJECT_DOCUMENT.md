# DSA Sprintt - Project Document

## 1. Solution Summary
**DSA Sprintt** is a web-based "1-Shot Day Planner" designed to eliminate decision paralysis for students helping them focus on Data Structures and Algorithms. Instead of browsing endless lists of problems, the user inputs their constraints (Time Available, Topic, Proficiency), and the application instantly generates a structured "Sprint".

The core value proposition is **Focus**. The app acts as a strict coach, providing:
- A specific timeline (broken down into minutes).
- Curated practice problems with platform links (LeetCode/HackerRank).
- "Anti-Patterns" to avoid for the specific topic.
- A strategic note on *how* to approach the session.

## 2. Technical Stack
- **Frontend**: Built with **Next.js 14** (App Router) for server-side rendering capabilities and structured routing. **TypeScript** ensures type safety for the API responses.
- **UI/UX**: **Tailwind CSS** provides a modern, dark-mode aesthetic ("Glassmorphism"), while **Framer Motion** adds fluid animations to make the planning process feel premium.
- **Backend / API**: A Next.js **Route Handler** (`/api/generate`) acts as the backend. It securely manages the Google Gemini API key and handles validation.
- **AI Integration**: Uses the **Google Generative AI SDK** (`@google/generative-ai`) to interface with the **Gemini 2.5 Flash Lite** model.
- **Caching**: Implemented an in-memory `Map` cache with a 6-hour TTL (Time-To-Live) to minimize API usage and reduce latency for repeated queries.

## 3. Prompt Engineering Strategy
The quality of the generated plan relies on "Role-Based Prompting" and "Strict Schema Enforcement".

### The System Instruction
We instruct the model to adopt a specific persona:
> "You are a strict DSA coach. Generate a practical, logic-focused study plan for today. Output ONLY valid JSON."

This prevents conversational filler and forces the model to prioritize actionable content.

### JSON Schema
We use Gemini's `response_schema` feature to guarantee the output structure. This allows us to parse the response directly into TypeScript interfaces without complex regex or error-prone string manipulation. The schema enforces strict fields for:
- `blocks`: Time-boxed activities.
- `practice`: A list of problems with difficulty levels.
- `anti_patterns`: Common mistakes to avoid.

### Temperature Control
The temperature is set to `0.3`. This low setting reduces hallucination and ensures the model produces consistent, deterministic plans suitable for study routines.
