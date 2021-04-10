// pages/api/publish/[id].ts

import prisma from "../../../../lib/prisma";

// PUT 
export default async function handle(req, res) {
  console.log(req.query, 'req');
  prisma.inventory.delete({
    where: {id: parseInt(req.query.id, 10) }
  }).then(res => console.log(res))

}
