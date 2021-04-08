import { Col, Row } from "antd";
import { getSession } from "next-auth/client";
import React from "react";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import prisma from "../lib/prisma";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await prisma.player?.findFirst({
      where: { userId: session?.userId },
    });

    return { props: { player } };
  } else {
    return { props: {} };
  }
};

const HomePage = (props) => {
  return (
    <SiteLayout player={props.player}>
      <Row>
        <h2>Home</h2>
      </Row>
      <Row>
        <Col span={24}>
          <PlayerCard player={props.player} />
        </Col>
      </Row>
    </SiteLayout>
  );
};

export default HomePage;
