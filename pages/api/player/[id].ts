// pages/api/publish/[id].ts

import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
export default async function handle(req, res) {
  const player = JSON.parse(req.body);

 const result = prisma.player
    .update({
      where: { userId: parseInt(req.query.id, 10) },
      data: {
        ...player,
      },
    })
    .then(() => res.json(result).catch((error) => console.error(error)));
}
