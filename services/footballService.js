const BASE_URL =
  "https://v3.football.api-sports.io";

const API_KEY =
  process.env.API_FOOTBALL_KEY;

/* ======================================================
   GENERIC FETCH
====================================================== */

async function footballFetch(
  endpoint
) {
  const response =
    await fetch(
      `${BASE_URL}/${endpoint}`,
      {
        method: "GET",

        headers: {
          "x-apisports-key":
            API_KEY,
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `Football API Error: ${response.status}`
    );
  }

  const data =
    await response.json();

  return data.response || [];
}

/* ======================================================
   LIVE FIXTURES
====================================================== */

async function getLiveFixtures() {
  const fixtures =
    await footballFetch(
      "fixtures?live=all"
    );

  return fixtures.filter(
  (fixture) =>
    fixture.league?.id === 1
);
}

/* ======================================================
   WORLD CUP FIXTURES
====================================================== */

async function getWorldCupFixtures() {
  return footballFetch(
    "fixtures?league=1&season=2026"
  );
}

module.exports = {
  getLiveFixtures,
  getWorldCupFixtures,
};