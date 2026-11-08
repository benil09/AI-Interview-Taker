import InterviewModel from "../models/interview.model.js";

export async function seedInitialInterviews(): Promise<void> {
    try {
        const count = await InterviewModel.countDocuments();
        if (count > 0) {
            return;
        }

        console.log("[Database]: Seeding initial sample interviews...");

        await InterviewModel.create([
            {
                role: "Full Stack Engineer",
                level: "Mid-level",
                techstack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
                type: "Technical",
                finalized: false,
                coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
                questions: [
                    "How do you ensure end-to-end type safety between your Node.js backend and React frontend?",
                    "Can you explain how the Node.js event loop handles asynchronous operations?",
                    "How do you optimize React component rendering when state updates frequently?",
                    "What strategies do you use for database indexing and query optimization in PostgreSQL?",
                ],
            },
            {
                role: "Backend Architect",
                level: "Senior",
                techstack: ["Go", "Kafka", "Docker", "Redis"],
                type: "System Design",
                finalized: true,
                coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
                questions: [
                    "How would you design a distributed rate limiter for microservices?",
                    "Explain your strategy for database partitioning and handling deadlocks.",
                    "How do you handle consumer group rebalancing in high-throughput Kafka clusters?",
                    "How do you structure resilient caching and handle cache invalidation in distributed systems?",
                ],
            },
            {
                role: "Frontend Engineer",
                level: "Junior",
                techstack: ["React", "Next.js", "Tailwind CSS"],
                type: "Technical",
                finalized: false,
                coverImage: "https://images.unsplash.com/photo-1542401978-a9e4e6f02e71?w=600&auto=format&fit=crop&q=80",
                questions: [
                    "What is the difference between Server Components and Client Components in Next.js?",
                    "How does the useEffect dependency array work, and what are common pitfalls with infinite loops?",
                    "How do you manage responsive design and custom theming with Tailwind CSS utility classes?",
                ],
            },
        ]);

        console.log("[Database]: Seeded initial sample interviews successfully.");
    } catch (error) {
        console.error("[Database]: Failed to seed initial interviews:", error);
    }
}

