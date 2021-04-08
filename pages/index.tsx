import { Col, Row } from 'antd';
import { getSession, useSession } from 'next-auth/client';
import React, { useState } from 'react';
import PlayerCard, { IFullPlayer } from '../components/PlayerCard';
import prisma from '../lib/prisma';


function HomePage(props) {
  const [session, loading] = useSession();
  const [fullPlayer,] = useState<IFullPlayer>(props.fullPlayer);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );



  return (
    <React.Fragment>
      <Row>
        <h2>Home</h2>
      </Row>
      <Row>
        <Col span={24}>
          <PlayerCard fullPlayer={fullPlayer} />
        </Col>
      </Row>

    </React.Fragment>
  );
}

// index.tsx
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

    return { props: { fullPlayer} };
  } else {
    return { props: {} };
  }
};

export default HomePage;
