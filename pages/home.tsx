import { Player } from "@prisma/client";
import { Col, Row } from "antd";
import { getSession } from "next-auth/client";
import React from "react";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import { getPlayer } from "../lib/functions";

interface IHomePageProps {
  player: Player
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player: Player = await getPlayer(session?.userId)

    return { props: { player } };
  } else {
    return { props: {} };
  }
};

const HomePage = ({player}: IHomePageProps) => {
  return (
    <SiteLayout player={player}>
      <Row>
        <h2>Home</h2>
      </Row>
      <Row>
        <Col span={24}>
          <PlayerCard player={player} />
        </Col>
      </Row>
    </SiteLayout>
  );
};

export default HomePage;
