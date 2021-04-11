// pages/api/publish/[id].ts

import { IPlayer } from "../../../lib/functions";
import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
export default async function handle(req, res) {
  const player: IPlayer = JSON.parse(req.body);
  delete player["inventory"];
  delete player["equipement"];

  const result = await prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      ...player,
      equipement: req.body.equipement,
      inventory: req.body.inventory,
    },
  });

  res.json(result);
}
