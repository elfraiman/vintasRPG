import { Inventory } from ".prisma/client";
import { Button, Card, message, Row, Spin } from "antd";
import { getSession, useSession } from "next-auth/client";
import Image from "next/image";
import React, { useState } from "react";
import SiteLayout from "../components/SiteLayout";
import {
  getItems,
  getPlayer,
  IInventory,
  IItem,
  IPlayer,
} from "../lib/functions";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userid);
    const items = await getItems();

    return { props: { player, items } };
  }

  return;
};

interface IMarketPageProps {
  player: IPlayer;
  items: IItem[];
}

const MarketPage = ({ player, items }: IMarketPageProps) => {
  const [playerInState, setPlayerInState] = useState(player);
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

  /**
   * An inventory is 1 item type, 1 item is not 1 inventory.
   * a player has multiple inventories
   */
  const buyPotion = async (inventory: Inventory, item: IItem) => {
    setPurchaseLoad(true);

    // check if the player already has that inventory (item)
    //
    const playerAlreadyOwnsItem = playerInState.inventory.filter(
      (item) => item.itemId === inventory.itemId
    );

 
    if (playerAlreadyOwnsItem.length > 0) {
      const doesUserOwnMaxAllowed =
      playerAlreadyOwnsItem[0]?.itemQuantity < item?.maximumStack;
  
      if (!doesUserOwnMaxAllowed) {
        message.error("You cannot buy anymore of these");
        return;
      }
      // If player already owns this item in his inventory we will set
      // the incoming inventory Id to that item's inventory ID
      // for the request
      //
      inventory.id = playerAlreadyOwnsItem[0]?.id;
    } else {
      console.log("else", inventory);
      delete inventory["id"]
      console.log("else", inventory);
    }

    await fetch(`http://localhost:3000/api/player/addInventoryItem`, {
      method: "POST",
      body: JSON.stringify(inventory),
    })
      .then(() => {
        message.success({
          content: (
            <span>
              +1
              <Image
                src={`/assets/items/consumable/${item.imageName}.png`}
                width={25}
                height={25}
                layout="fixed"
              />
            </span>
          ),
          icon: <React.Fragment></React.Fragment>,
        });
        //
        // We set a +1 here on a local state player obj inventory so
        // have the same amount on the client side without realtime data
        //
        playerAlreadyOwnsItem[0].itemQuantity += 1;
        setPurchaseLoad(false);
      })
      .catch((e) => {
        setPurchaseLoad(false);
        console.error(e);
      });
  };

  return (
    <SiteLayout player={playerInState}>
      <Row>
        <h2>Market</h2>
      </Row>
      <div
        style={{
          display: "grid",
          gridTemplate: "auto / 1fr 1fr 1fr",
          gridGap: 16,
        }}
      >
        {/** Potion Shop Card */}
        <Card title="Potions">
          {items?.map((item, index) => {
            if (item?.itemType?.subType === "health") {
              return (
                <div
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    buyPotion(
                      {
                        itemId: item?.id,
                        itemQuantity: 1,
                        playerId: player?.id,
                        id: undefined, // Inventory ID,
                      },
                      item
                    )
                  }
                >
                  <Card.Grid
                    style={{
                      minHeight: "100%",
                      minWidth: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src={`/assets/items/consumable/${item.imageName}.png`}
                      width={50}
                      height={50}
                      layout="fixed"
                    />

                    <b style={{ marginTop: 16 }}>Price: {item.cost}</b>
                    <p>{item.description}</p>
                  </Card.Grid>
                </div>
              );
            }
          })}
        </Card>
      </div>
    </SiteLayout>
  );
};

export default MarketPage;
