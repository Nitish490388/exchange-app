import { Router } from "express";

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { market } = req.query;
    // get from DB
    res.json({});
})