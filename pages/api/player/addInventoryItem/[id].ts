// pages/api/publish/[id].ts

import { Inventory } from ".prisma/client";
import prisma from "../../../../lib/prisma";

// PUT
export default async function handle(req, res) {
  const inventory: Inventory = JSON.parse(req.body);
  
  const result = prisma.inventory.upsert({
    where: { id: inventory.id ?? 99999999999 },
    update: {
      ...inventory,
      itemQuantity: {
        increment: 1,
      },
    },
    create: {
      ...inventory,
      playerId: parseInt(req.query.id, 10),
    },
  });

  res.json(result);
}
