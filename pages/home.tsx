import { Col, Row } from "antd";
import { getSession } from "next-auth/client";
import React from "react";
import InventoryCard from "../components/InventoryCard";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IPlayer } from "../lib/functions";

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
      <div style={{ display: "grid", gridTemplate: "auto / 1fr 1fr 1fr", gridGap: 16 }}>
        <PlayerCard player={player} />

        <InventoryCard player={player} />
      </div>
    </SiteLayout>
  );
};

export default HomePage;
