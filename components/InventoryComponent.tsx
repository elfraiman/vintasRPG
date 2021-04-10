import React, { useEffect } from 'react';
import { IInventory, IItem, IPlayer } from '../lib/functions';
import Image from 'next/image';
import { Badge, Card } from 'antd';

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
  }, [player]);

  const deleteItem = async (id: number) => {
    console.log('trigger');
    await fetch(
      `http://localhost:3000/api/player/deleteInventoryItem/${id}`
    ).then((response) => {
      console.log(response);
    });
  };
  const clickItem = (slotItemClicked: IItem) => {
    if (slotItemClicked.itemType.type === 'consumable') {
      switch (slotItemClicked.itemType.subType) {
        case 'health':
          setGlobalCD(true);
          const itemInInventory = player.inventory.find(
            (itemInInv) => itemInInv.item.name === slotItemClicked.name
          );

          if (itemInInventory.itemQuantity > 0) {
            itemInInventory.itemQuantity -= 1;
            setPlayer({
              ...player,
              health: (player.health += slotItemClicked.effectAmount),
              inventory: player.inventory,
            });
          } else {
            setPlayer({
              ...player,
              health: (player.health += slotItemClicked.effectAmount),
              inventory: player.inventory.filter(
                (itemInInv) => itemInInv.item.id !== itemInInventory.item.id
              ),
            });
            console.log('delete it ')
            deleteItem(itemInInventory.id);
            break;
          }

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
            style={{ backgroundColor: '#773ee0' }}
            count={slot?.itemQuantity <= 1 ? null : slot?.itemQuantity}
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
