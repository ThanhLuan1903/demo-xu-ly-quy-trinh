import fs from "fs/promises"
import path from "path"

const DB_PATH = path.join(process.cwd(), "lib", "db.json")

export async function readDb() {
  const raw = await fs.readFile(DB_PATH, "utf-8")
  return JSON.parse(raw)
}

export async function writeDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
}

