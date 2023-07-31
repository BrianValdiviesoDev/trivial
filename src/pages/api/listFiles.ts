import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { directoryPath } = req.query;
  const path = `./public/${directoryPath}`;
  fs.readdir(path as string, (err, fileList) => {
    if (err) {
      console.error("Error al leer el directorio:", err);
      res.status(500).json({ error: "Error al leer el directorio" });
    } else {
      res.status(200).json({ fileList });
    }
  });
}
