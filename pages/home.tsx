import { Player } from '@prisma/client';
import { Badge, Card, Col, Row } from 'antd';
import { getSession } from 'next-auth/client';
import React, { useEffect } from 'react';
import PlayerCard from '../components/PlayerCard';
import SiteLayout from '../components/SiteLayout';
import { getPlayer, IInventory, IPlayer } from '../lib/functions';
import Image from 'next/image';

interface IHomePageProps {
  player: IPlayer;
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player: IPlayer = await getPlayer(session?.userId);

    return { props: { player } };
  } else {
    return { props: {} };
  }
};

const HomePage = ({ player }: IHomePageProps) => {
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

  console.log(player);
  return (
    <SiteLayout player={player}>
      <Row>
        <h2>Home</h2>
      </Row>
      <Row>
        <Col span={12}>
          <PlayerCard player={player} />
        </Col>
        <Col span={12}>
          <Card title="Inventory" style={{ maxWidth: 400, maxHeight: 350 }}>
            <div className="bag-slots">
              {createInventory().map((slot, index) => (
                <Badge
                  style={{ backgroundColor: '#773ee0' }}
                  count={slot?.itemQuantity === 1 ? null : slot?.itemQuantity}
                  offset={[-25, 0]}
                  key={index}
                >
                  <div className="slot">
                    <Image
                      src={`/assets/items/${slot?.item?.itemType.type}/${slot?.item?.imageName}.png`}
                      width={55}
                      height={55}
                    />
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
        </Col>
      </Row>
    </SiteLayout>
  );
};

export default HomePage;
