import database from "infra/database.js"

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;")
  const databaseVersionValue = databaseVersionResult.rows[0].server_version

  const databaseMaxConnectionResult = await database.query("SHOW max_connections;")
  const databaseMaxConnectionValue = databaseMaxConnectionResult.rows[0].max_connections

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1 AND state='active';",
    values: [databaseName]
  })
  const databaseOpenedConnectionsValue = databaseOpenedConnectionResult.rows[0].count

  response.status(200).json({
    update_at: updateAt,
    dependecies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionValue),
        opened_connections: databaseOpenedConnectionsValue,
      }
    }
  });
}

export default status;