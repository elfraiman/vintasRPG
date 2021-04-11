// pages/api/publish/[id].ts

import { Inventory } from ".prisma/client";
import prisma from "../../../lib/prisma";

// PUT
export default async function handle(req, res) {
  const inventory: Inventory = JSON.parse(req.body);
  delete inventory["item"];
  const result = await prisma.inventory.update({
    where: { id: inventory.id },
    data: {
      ...inventory,
      itemQuantity: {
        decrement: 1,
      },
    },
  });

  res.json(result);
}
