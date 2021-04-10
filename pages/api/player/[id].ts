// pages/api/publish/[id].ts

import { IPlayer } from "../../../lib/functions";
import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
export default async function handle(req, res) {
  console.log(req.query, 'req');
  const player: IPlayer = JSON.parse(req.body);
  delete player['inventory']
  delete player['equipement']

  const playerObj: IPlayer = JSON.parse(req.body);

  playerObj.inventory.forEach(async slot => {
    
    await prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        ...player,
        equipement: req.body.equipement,
        inventory: {
          update: {
            where: {
              id: slot.id
            },
            data: {
              itemQuantity: slot.itemQuantity
            }
          }
        },
      },
    })
      .catch((error) => console.error(error));
  })

}
