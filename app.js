const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running...");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//App1
app.get("/players/", async (request, response) => {
  const query = `
SELECT *
FROM cricket_team;
`;
  const dbResponse = await db.all(query);
  response.send(
    dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
//App2
app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `
INSERT INTO cricket_team(player_name,jersey_number,role)
VALUES ('${playerName}',${jerseyNumber},'${role}'); 
`;
  const dbResponse = await db.run(query);
  response.send("Player Added to Team");
});
//App3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
SELECT *
FROM cricket_team
WHERE player_id= ${playerId};
`;
  const dbResponse = await db.get(query);
  response.send(convertDbObjectToResponseObject(dbResponse));
});
//App4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `
UPDATE cricket_team
SET player_name= '${playerName}',jersey_number= ${jerseyNumber},role='${role}'
WHERE player_id= ${playerId}; 
`;
  await db.run(query);
  response.send("Player Details Updated");
});
//App5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
DELETE FROM cricket_team
WHERE player_id= ${playerId};
`;
  await db.run(query);
  response.send("Player Removed");
});
module.exports = app;
