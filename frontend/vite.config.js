import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    host: "0.0.0.0",
    port: 3000,
    https: {
      // key: fs.readFileSync("./certs/selfsigned.key"),
      // cert: fs.readFileSync("./certs/selfsigned.crt"),
      key: fs.readFileSync("./certs/localhost+2-key.pem"),
      cert: fs.readFileSync("./certs/localhost+2.pem"),

    },
  },
})
