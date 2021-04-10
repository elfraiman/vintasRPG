import React, { useEffect } from "react";
import { IInventory, IItem, IPlayer } from "../lib/functions";
import Image from "next/image";
import { Badge, Card } from "antd";

interface IInventoryProps {
  player: IPlayer;
  setPlayer?: React.Dispatch<React.SetStateAction<IPlayer>>;
  setGlobalCD?: React.Dispatch<React.SetStateAction<boolean>>;
}

const InventoryCard = ({ player, setPlayer, setGlobalCD }: IInventoryProps) => {
  const createInventory = () => {
    // Create empty inventory with max slots
    // add items into empty slots
    //
    const slots = player?.maxInventorySlots;

    const inventory: IInventory[] = Array.from(Array(slots));

    inventory.splice(0, player.inventory.length, ...player.inventory);

    return inventory;
  };

  useEffect(() => {
    createInventory();
  }, []);

  const clickItem = (item: IItem) => {
    if (item.itemType.type === "consumable") {
      switch (item.itemType.subType) {
        case "health":
          setGlobalCD(true);
          setPlayer({
            ...player,
            health: (player.health += item.effectAmount),
          });
          break;

        default:
          break;
      }
    }
  };

  return (
    <Card title="Inventory" style={{ maxWidth: 400, maxHeight: 350 }}>
      <div className="bag-slots">
        {createInventory().map((slot, index) => (
          <Badge
            style={{ backgroundColor: "#773ee0" }}
            count={slot?.itemQuantity === 1 ? null : slot?.itemQuantity}
            offset={[-25, 0]}
            key={index}
          >
            <div className="slot">
              {slot?.item ? (
                <Image
                  src={`/assets/items/${slot?.item?.itemType.type}/${slot?.item?.imageName}.png`}
                  width={55}
                  height={55}
                  onClick={() => clickItem(slot.item)}
                />
              ) : (
                <></>
              )}
            </div>
          </Badge>
        ))}
      </div>

      <style jsx>
        {`
          .bag-slots {
            display: grid;
            width: 100%;
            grid-template: auto / repeat(4, 1fr);
            grid-gap: 6px;
          }
          .slot {
            width: 55px;
            height: 55px;
            background-color: #e6e6e6;
            border: 1px solid #313131;
            justify-self: center;
            align-self: center;
          }
        `}
      </style>
    </Card>
  );
};

export default InventoryCard;
