import { Row, Spin } from "antd";
import { getSession, useSession } from "next-auth/client";
import React from "react";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IPlayer } from "../lib/functions";


export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userid);
    return { props: { player } };
  }

  return;
};

interface IMarketPageProps {
  player: IPlayer;
}

const MarketPage = ({ player }: IMarketPageProps) => {
  const [session, loading] = useSession();
  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  if (loading) {
    return <Spin />;
  }

  return (
    <SiteLayout player={player}>
      <Row>
        <h2>Market</h2>
      </Row>
      <Row>

      </Row>
    </SiteLayout>
  );
};

export default MarketPage;
