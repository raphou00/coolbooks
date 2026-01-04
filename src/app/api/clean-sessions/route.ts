import db from "@/lib/db";

export const GET = async () => {
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
    } catch (err) {
        console.error(err);
        return Response.json(
            {
                error: "Session cleanup failed",
                message: err,
            },
            { status: 500 }
        );
    } finally {
        db.$disconnect();
    }
};
