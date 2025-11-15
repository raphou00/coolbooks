import db from "@/lib/db";

export async function GET() {
    try {
        console.log("Starting weekly session cleanup...");

        const result = await db.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        console.log(`Deleted ${result.count} expired sessions`);

        return Response.json({
            success: true,
            message: `Weekly session cleanup completed. Deleted ${result.count} expired sessions.`,
            deletedCount: result.count,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Session cleanup failed:", error);
        return Response.json(
            {
                error: "Session cleanup failed",
                message: error,
            },
            { status: 500 }
        );
    } finally {
        db.$disconnect();
    }
}
