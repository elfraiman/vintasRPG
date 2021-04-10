import { Inventory } from ".prisma/client";
import { Button, Row, Spin } from "antd";
import { getSession, useSession } from "next-auth/client";
import React, { useEffect, useState } from "react";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IInventory, IItem, IPlayer } from "../lib/functions";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userid);
    return { props: { player } };
  }

  return;
};

interface IMarketPageProps {
  player: IPlayer;
}

const MarketPage = ({ player }: IMarketPageProps) => {
  const [session, loading] = useSession();
  const [purchaseLoad, setPurchaseLoad] = useState(false);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  if (loading) {
    return <Spin />;
  }

  const buyPotion = async (inventory: Inventory) => {
    setPurchaseLoad(true);
    const doesPlayerAlreadyHaveSuchItem = player.inventory.filter(
      (item) => item.itemId === inventory.itemId
    );

    if (doesPlayerAlreadyHaveSuchItem.length > 0) {
      inventory.id = doesPlayerAlreadyHaveSuchItem[0]?.id;
    }

    await fetch(
      `http://localhost:3000/api/player/addInventoryItem/${player.id}`,
      {
        method: "POST",
        body: JSON.stringify(inventory),
      }
    )
      .then(() => {
        setPurchaseLoad(false);
      })
      .catch((e) => {
        setPurchaseLoad(false);
        console.error(e);
      });
  };

  console.log(purchaseLoad);
  return (
    <SiteLayout player={player}>
      <Row>
        <h2>Market</h2>
      </Row>
      <Row>
        <Button
          disabled={purchaseLoad}
          onClick={() =>
            buyPotion({
              itemId: 2,
              itemQuantity: 1,
              playerId: player.id,
              id: undefined,
            })
          }
        >
          Buy
        </Button>
      </Row>
    </SiteLayout>
  );
};

export default MarketPage;
