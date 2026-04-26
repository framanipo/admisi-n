import https from "https";
https.get("https://ipinfo.io", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(data));
});
