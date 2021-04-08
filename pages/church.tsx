import { Button, Card, Col, Row, message } from "antd";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSession, useSession } from "next-auth/client";
import prisma from "../lib/prisma";
import { IFullPlayer } from "../components/PlayerCard";
import { Player } from "@prisma/client";
import SiteLayout from "../components/SiteLayout";

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

const ChurchPage = (props) => {
  const [session, loading] = useSession();
  const [player, setPlayer] = useState<Player>(props.player);
  const [priestText, setPriestText] = useState<string>();

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const healPlayer = () => {
    if (player.health >= player.maxHealth) {
      message.error("You're already full health..");
    } else {
      // Heal player to his max health
      setPlayer({
        ...player,
        health: (player.health += player.maxHealth - player.health),
      });

      savePlayer();
    }
  };

  useEffect(() => {
    if (player.health < player.maxHealth) {
      setPriestText(
        " For my services it will cost you X gold to revive you to full health."
      );
    } else {
      setPriestText(
        `Welcome back, ${player.name}. You are full health, I have no service for you.`
      );
    }
  }, [player]);

  // Make a post call to the api to save the player
  const savePlayer = async () => {
    console.log(player);
    await fetch(`http://localhost:3000/api/player/${player.id}`, {
      method: "POST",
      body: JSON.stringify(player),
    }).then(async (response) => {
      console.log(response);
      message.success("You've been healed, don't let it happen again...");
      setPriestText(
        `Good luck ${player.name}, don't try to avoid death or you'll end up avoiding life.`
      );
      // sets the player to itself to trigger a re-render
      setPlayer({ ...player });
    });
  };

  return (
    <SiteLayout>
      <Row>
        <h2>Church</h2>
      </Row>
      <Row>
        <Card style={{ width: "100%" }}>
          <Row justify={"center"} align={"middle"}>
            <Col
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Image src="/assets/icons/priest.svg" width={150} height={150} />

              <React.Fragment>
                <h4 style={{ marginTop: 16 }}>{priestText}</h4>
                {player.health < player.maxHealth ? (
                  <Button onClick={healPlayer}>Heal Me</Button>
                ) : (
                  <></>
                )}
              </React.Fragment>
            </Col>
          </Row>
        </Card>
      </Row>
    </SiteLayout>
  );
};

export default ChurchPage;
