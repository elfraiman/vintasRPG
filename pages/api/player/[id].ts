// pages/api/publish/[id].ts

import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
export default async function handle(req, res) {
  const player = JSON.parse(req.body);
  delete player['inventory']
  delete player['equipmenet']
  
  prisma.player
    .update({
      where: { userId: parseInt(req.query.id, 10) },
      data: {
        ...player,
        inventory: req.body.inventory, // has to be in json
        equipement: req.body.equipement // has to be in json
      },
    })
    .then((d) => res.json(d))
    .catch((error) => console.error(error));
}
