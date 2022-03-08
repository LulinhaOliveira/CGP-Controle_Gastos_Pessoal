import { app } from "./config/config.js";
import dotenv from "dotenv";

dotenv.config();

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Servidor running on PORT ${PORT}`);
})



