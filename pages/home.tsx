import { Col, Row } from "antd";
import { getSession } from "next-auth/client";
import React from "react";
import PlayerCard, { IFullPlayer } from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import prisma from "../lib/prisma";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await prisma.player?.findFirst({
      where: { userId: session?.userId },
    });

    const fullPlayer: IFullPlayer = {
      player: player,
      equipement: {
        weapon: await prisma.player
          ?.findFirst({
            where: { userId: session?.userId },
          })
          .inventory()
          .weapon(),
      },
    };

    return { props: { fullPlayer } };
  } else {
    return { props: {} };
  }
};

const HomePage = (props) => {
  return (
    <SiteLayout fullPlayer={props.fullPlayer}>
      <Row>
        <h2>Home</h2>
      </Row>
      <Row>
        <Col span={24}>
          <PlayerCard fullPlayer={props.fullPlayer} />
        </Col>
      </Row>
    </SiteLayout>
  );
};

export default HomePage;
