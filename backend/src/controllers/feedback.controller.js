import prisma from "../config/prisma.js";

// ─────────────────────────────────────────────────────────────────────────────
// submitFeedback — POST /api/feedback
// Role: HOME_USER
// Body: { requestId, rating (1-5), comment? }
// ─────────────────────────────────────────────────────────────────────────────
export const submitFeedback = async (req, res) => {
  const { requestId, rating, comment } = req.body;
  const userId = req.user.id;

  // ── Basic input validation ────────────────────────────────────────────────
  if (!requestId || rating === undefined || rating === null) {
    return res.status(400).json({ error: "requestId and rating are required." });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  try {
    // ── Verify the ScrapRequest exists ────────────────────────────────────────
    const request = await prisma.scrapRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(400).json({ error: "ScrapRequest not found." });
    }

    // ── Verify ownership ──────────────────────────────────────────────────────
    if (request.userId !== userId) {
      return res.status(403).json({ error: "Forbidden. This request does not belong to you." });
    }

    // ── Verify status is COMPLETED ────────────────────────────────────────────
    if (request.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Feedback can only be submitted for completed requests.",
      });
    }

    // ── Create Feedback record ────────────────────────────────────────────────
    const feedback = await prisma.feedback.create({
      data: {
        requestId,
        userId,
        rating: ratingNum,
        comment: comment?.trim() || null,
      },
    });

    return res.status(201).json({ feedback });
  } catch (err) {
    // ── Catch duplicate feedback (unique constraint on requestId) ─────────────
    if (
      err.code === "P2002" &&
      err.meta?.target?.includes("requestId")
    ) {
      return res
        .status(409)
        .json({ error: "You have already submitted feedback for this request." });
    }

    console.error("[submitFeedback]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getAllFeedback — GET /api/feedback
// Role: ADMIN
// Returns all Feedback records with user name + request ID, plus average rating.
// ─────────────────────────────────────────────────────────────────────────────
export const getAllFeedback = async (req, res) => {
  try {
    // ── Fetch all feedback records ────────────────────────────────────────────
    const feedbackList = await prisma.feedback.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        request: {
          select: { id: true, pickupAddress: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ── Compute average rating using Prisma aggregate ─────────────────────────
    const aggregate = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(2))
      : null;
    const totalCount = aggregate._count.rating;

    return res.status(200).json({
      averageRating,
      totalCount,
      feedback: feedbackList,
    });
  } catch (err) {
    console.error("[getAllFeedback]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
