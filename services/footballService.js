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
  const start =
    Date.now();

  console.log(
    `⚽ START: ${endpoint}`
  );

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

  console.log(
    `⚽ RESPONSE: ${endpoint} | Status ${response.status} | ${
      Date.now() - start
    }ms`
  );

  if (!response.ok) {
    throw new Error(
      `Football API Error: ${response.status}`
    );
  }

  const data =
    await response.json();

  console.log(
    `⚽ COMPLETE: ${endpoint} | ${
      Date.now() - start
    }ms`
  );

  return (
    data.response || []
  );
}

/* ======================================================
   LIVE FIXTURES
====================================================== */

async function getLiveFixtures() {
  const fixtures =
    await footballFetch(
      "fixtures?live=all"
    );

  console.log(
    `⚽ LIVE FIXTURES: ${fixtures.length}`
  );

  return fixtures.filter(
    (fixture) =>
      fixture.league?.id ===
      1
  );
}

/* ======================================================
   WORLD CUP FIXTURES
====================================================== */

async function getWorldCupFixtures() {
  const fixtures =
    await footballFetch(
      "fixtures?league=1&season=2026"
    );

  console.log(
    `⚽ WORLD CUP FIXTURES: ${fixtures.length}`
  );

  return fixtures;
}

module.exports = {
  getLiveFixtures,
  getWorldCupFixtures,
};