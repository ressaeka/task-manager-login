import app from "../src/app.js";

const port = process.env.PORT || 3000;
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
