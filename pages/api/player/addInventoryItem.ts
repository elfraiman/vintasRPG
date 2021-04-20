// pages/api/publish/[id].ts

import { Inventory } from ".prisma/client";
import prisma from "../../../lib/prisma";

// PUT
export default async function handle(req, res) {
  const inventory: Inventory = JSON.parse(req.body);
  let result;

  if (inventory.id) {
    result = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        ...inventory,
        itemQuantity: {
          increment: 1,
        },
      },
    });
  } else {
    result = await prisma.inventory.create({
      data: {
        ...inventory,
      },
    });
  }

  res.json(result);
}
