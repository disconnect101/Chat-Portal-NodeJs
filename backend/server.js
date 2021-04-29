const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 5000;
const server = app.server;

server.listen(port, () => {
  console.log(`server runing on port ${port}...`);
});
