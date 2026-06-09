const express =
  require("express");

const router =
  express.Router();

const {
  getLiveFixtures,
  getWorldCupFixtures,
} = require(
  "../services/footballService"
);

/* ======================================================
   LIVE
====================================================== */

router.get(
  "/live",
  async (req, res) => {
    try {
      const fixtures =
        await getLiveFixtures();

      res.json(fixtures);
    } catch (err) {
      console.error(err);

      res
        .status(500)
        .json({
          error:
            "Failed to fetch live fixtures",
        });
    }
  }
);

/* ======================================================
   WORLD CUP
====================================================== */

router.get(
  "/world-cup",
  async (req, res) => {
    try {
      const fixtures =
        await getWorldCupFixtures();

      res.json(fixtures);
    } catch (err) {
      console.error(err);

      res
        .status(500)
        .json({
          error:
            "Failed to fetch World Cup fixtures",
        });
    }
  }
);

module.exports =
  router;