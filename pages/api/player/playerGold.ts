// pages/api/publish/[id].ts

import prisma from "../../../lib/prisma";

export interface IPlayerGoldBody {
  playerId: number;
  newAmount: number;
}

// PUT
export default async function handle(req, res) {
  const body: IPlayerGoldBody = JSON.parse(req.body);

  const result = await prisma.player.update({
    where: { id: body.playerId },
    data: {
        gold: body.newAmount
    },
  });

  res.json(result);
}
