// pages/api/publish/[id].ts

import prisma from "../../../../lib/prisma";

// PUT 
export default async function handle(req, res) {
  const result = prisma.inventory.delete({
    where: {id: parseInt(req.query.id, 10) }
  });

  res.json(result);
}
