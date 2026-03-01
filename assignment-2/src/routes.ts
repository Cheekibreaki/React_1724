import { Router } from "express";

import paperRoutes from "./routes/papers";
import authorRoutes from "./routes/authors";

const router = Router();

// Mount the paper routes at "/papers"
router.use("/papers", paperRoutes);

// Mount the author routes at "/authors"
router.use("/authors", authorRoutes);

export default router;
