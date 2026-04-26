import https from "https";
https.get("https://ipv4.icanhazip.com", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(data.trim()));
});
