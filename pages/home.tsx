import { Player } from "@prisma/client";
import { Badge, Card, Col, Row } from "antd";
import { getSession } from "next-auth/client";
import React, { useEffect } from "react";
import InventoryCard from "../components/InventoryComponent";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IInventory, IPlayer } from "../lib/functions";

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
          <InventoryCard player={player} />
        </Col>
      </Row>
    </SiteLayout>
  );
};

export default HomePage;
