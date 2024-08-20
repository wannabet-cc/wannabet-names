import { nameStoneService } from "@/lib/namestone";
import { addressSchema } from "@/lib/types/address";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      console.log("received request at /api/subname/[address]");
      const { address } = req.query;

      // parse request dynamic path
      const parsed = addressSchema.parse(address);

      // send to namestone
      const namestoneRes = await nameStoneService.getName(parsed);

      console.log("namestoneRes", namestoneRes);

      if (!namestoneRes) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "success", data: namestoneRes });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ error: "Validation failed", details: error.errors });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "unknown error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
