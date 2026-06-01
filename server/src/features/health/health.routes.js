import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "API Healthy",
  });
});

export default router;