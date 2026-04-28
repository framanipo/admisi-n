import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/portal\/increment-visits", async \(req, res\) => \{\s+try \{\s+\/\/ Ensure the table and record exist before updating in admision table\s+await pool\.query\("INSERT IGNORE INTO admision.*?;\s+await pool\.query\("UPDATE admision SET contador_visitas = contador_visitas \+ 1 WHERE id = 1"\);\s+res\.json\(\{ success: true \}\);\s+\} catch \(error\) \{\s+handleDbError\(res, error, "incrementing visits"\);\s+\}\s+\}\);/s;

const newCode = `
  let pendingVisits = 0;
  setInterval(async () => {
    if (pendingVisits > 0) {
      const visitsToFlush = pendingVisits;
      pendingVisits = 0;
      try {
        await pool.query(
          "INSERT INTO admision (id, descripcion_admision, contador_visitas) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE contador_visitas = contador_visitas + ?",
          [\`Admisión \${new Date().getFullYear()}\`, visitsToFlush, visitsToFlush]
        );
      } catch (e) {
        console.error("Error flushing visits:", e);
        pendingVisits += visitsToFlush; // Revert on failure
      }
    }
  }, 5000);

  app.post("/api/portal/increment-visits", (req, res) => {
    pendingVisits++;
    res.json({ success: true });
  });`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced");
} else {
  console.log("Not replaced");
}
