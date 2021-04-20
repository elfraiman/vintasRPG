import { Player } from "@prisma/client";
import { Button, Card, Col, message, Row } from "antd";
import { cloneDeep } from "lodash";
import { getSession, useSession } from "next-auth/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SiteLayout from "../components/SiteLayout";
import { getPlayer } from "../lib/functions";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session) {
    const player = await getPlayer(session.userId);

    return { props: { player } };
  } else {
    return { props: {} };
  }
};

const ChurchPage = (props) => {
  const [session, loading] = useSession();
  const [player, setPlayer] = useState<Player>(cloneDeep(props.player));
  const [priestText, setPriestText] = useState<string>();
  const [cost, setCost] = useState<number>(0);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const healPlayer = () => {
    if (player.gold < cost) {
      message.error("You don't have enough gold");
      return;
    } 


    if (player.health >= player.maxHealth) {
      message.error("You're already full health..");
    } else {
      // Heal player to his max health
      setPlayer({
        ...player,
        health: (player.health += player.maxHealth - player.health),
        gold: player.gold -= cost
      });

      savePlayer();
    }
  };

  useEffect(() => {
    // Calculate amount to heal and cost
    let amountToHeal = player.health === 0 ? player.maxHealth : player.maxHealth - player.health;

    // Heal amount cost
    //

    const costToHeal = Math.floor(amountToHeal * 1.10) + 1;
    console.log(amountToHeal, costToHeal)
    setCost(costToHeal);

    if (player.health < player.maxHealth) {
      setPriestText(
        `For my services it will cost you ${costToHeal} gold to revive you to full health.`
      );
    } else {
      setPriestText(
        `Welcome back, ${player.name}. You are full health, I have no service for you.`
      );
    }
  }, [player, props]);

  // Make a post call to the api to save the player
  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${props.player.id}`, {
      method: "POST",
      body: JSON.stringify(player),
    }).then(async () => {
      message.success(`You've been healed and payed ${cost} gold, don't let it happen again...`);
      setPriestText(
        `Good luck ${player.name}, don't try to avoid death or you'll end up avoiding life.`
      );
      // sets the player to itself to trigger a re-render
      setPlayer({ ...player });
    });
  };

  return (
    <SiteLayout player={player}>
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
