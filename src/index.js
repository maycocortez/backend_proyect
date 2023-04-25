import app from "./app.js";
import { Server } from "socket.io";


export const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`Conectado al  host ${server.address().port}`)
);
server.on("error", (err) => {
  console.log(`Error: ${err}`);
});
export const io = new Server(server);


