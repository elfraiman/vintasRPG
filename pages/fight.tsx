import { Monster } from "@prisma/client";
import { Button, Card, Col, message, Row } from "antd";
import { getSession, useSession } from "next-auth/client";
import React, { useEffect, useRef, useState } from "react";
import MonsterCard from "../components/MonsterCard";
import PlayerCard, { IFullPlayer } from "../components/PlayerCard";
import prisma from "../lib/prisma";

export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  console.log(context.query, "query");
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

    const monster = await prisma.monster?.findFirst({
      where: { id: parseInt(context.query.monsterId, 10) },
    });

    return { props: { fullPlayer, monster } };
  } else {
    return { props: {} };
  }
};

function FightPage(props) {
  const [session, loading] = useSession();
  const [fullPlayer, setFullPlayer] = useState<IFullPlayer>(props.fullPlayer);
  const [monster, setMonster] = useState<Monster>(props.monster);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  let battleLogContainer = [];
  let dummyRef = useRef(null);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${fullPlayer.player.id}`, {
      method: "POST",
      body: JSON.stringify(fullPlayer.player),
    }).then((response) => {
      console.log(response);
    });
  };

  const playerWin = () => {
    // Player Won
    // Add experience and rewards to player for killing monster
    //
    setFullPlayer({
      equipement: fullPlayer.equipement,
      player: {
        ...fullPlayer.player,
        experience: (fullPlayer.player.experience += monster.experience),
      },
    });

    // If level  up
    if (fullPlayer.player.experience >= fullPlayer.player.experienceToLevelUp) {
      setFullPlayer({
        equipement: fullPlayer.equipement,
        player: {
          ...fullPlayer.player,
          level: (fullPlayer.player.level += 1),
        },
      });
    }
    // Saves the local obj to the backend;
    savePlayer();
    battleLogContainer.push([
      ...battleLog,
      <span>
        You have killed the {monster.name} and gained{" "}
        <span style={{ color: "#1890ff" }}>{monster.experience}</span> experience
      </span>,
    ]);
    setBattleLog([...battleLogContainer]);
    message.info(
      `You killed the ${monster.name} and gained ${monster.experience} experience`
    );
  };

  const playerLose = () => {
    const lostExp = Math.round(
      (fullPlayer.player.experience / fullPlayer.player.experienceToLevelUp) *
        100
    );

    if (fullPlayer.player.experience > 0) {
      // Player lost
      // penelty
      setFullPlayer({
        equipement: fullPlayer.equipement,
        player: {
          ...fullPlayer.player,
          experience: (fullPlayer.player.experience -= lostExp),
        },
      });
    } else {
      setFullPlayer({
        equipement: fullPlayer.equipement,
        player: {
          ...fullPlayer.player,
          experience: 0,
        },
      });
    }

    // Saves the local obj to the backend;
    savePlayer();
    battleLogContainer.push([
      ...battleLog,
      <span>
        You <b>died</b> to {monster.name} and lost{" "}
        <span style={{ color: "#1890ff" }}>{monster.experience}</span> experience
      </span>,
    ]);
    setBattleLog([...battleLogContainer]);
    message.error(
      `You died to the ${monster.name} and lost ${monster.experience} experience`
    );
  };

  const handleBattleLog = (
    playerOrMonster: "player" | "monster",
    dmg: number
  ) => {
    if (playerOrMonster === "player") {
      battleLogContainer.push([
        ...battleLog,
        <span>
          You hit the {monster.name} for
          <span style={{ color: "green" }}> {dmg}</span> damage.
        </span>,
      ]);
      setBattleLog([...battleLogContainer]);
    } else if (playerOrMonster === "monster") {
      battleLogContainer.push([
        ...battleLog,
        <span>
          The {monster.name} hit you for
          {<span style={{ color: "red" }}> {dmg}</span>} damage.
        </span>,
      ]);
      setBattleLog([...battleLogContainer]);
    }
  };

  useEffect(() => {
    dummyRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, [battleLogContainer, battleLog]);

  const doPlayerAttack = () => {
    const attackSpeed = 2000;

    const fight = setInterval(() => {
      const calculatedTotalDamage =
        fullPlayer.player.strength * STATSMULTIPLIERS.STR +
        fullPlayer.equipement.weapon.maxDamage;
      const calculatedMinimumDamage =
        fullPlayer.player.strength * STATSMULTIPLIERS.STR +
        fullPlayer.equipement.weapon.minDamage;

      const upcomingHit = Math.floor(
        Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
          calculatedMinimumDamage
      );
      if (monster.health > 0 && fullPlayer.player.health > 0) {
        handleBattleLog("player", upcomingHit);
        setMonster({
          ...monster,
          health: (monster.health -= upcomingHit),
        });
      } else if (monster.health <= 0) {
        playerWin();
        clearInterval(fight);
      }
    }, attackSpeed);
  };

  const doMonsterAttack = () => {
    const fight = setInterval(() => {
      const upcomingHit = Math.floor(
        Math.random() * (monster.maxDamage - monster.minDamage) +
          monster.minDamage
      );

      if (fullPlayer.player.health > 0 && monster.health > 0) {
        handleBattleLog("monster", upcomingHit);
        setFullPlayer({
          equipement: fullPlayer.equipement,
          player: {
            ...fullPlayer.player,
            health: (fullPlayer.player.health -= upcomingHit),
          },
        });
      } else if (fullPlayer.player.health <= 0) {
        setFullPlayer({
          equipement: fullPlayer.equipement,
          player: {
            ...fullPlayer.player,
            health: (fullPlayer.player.health = 0),
          },
        });
        playerLose();
        clearInterval(fight);
      }
    }, monster.attackSpeed * 1000);
  };

  const startFight = () => {
    if (fullPlayer.player.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
    } else {
      message.error("You are dead");
    }
  };

  return (
    <React.Fragment>
      <Row>
        <h2>Combat</h2>
      </Row>
      <Row>
        <Col span={8}>
          <PlayerCard fullPlayer={fullPlayer} />
        </Col>
        <Col span={8}>
          <Card style={{ height: 350, width: 300, overflowY: "hidden", padding: 16 }}>
            {battleLog.map((val, i) => (
              <Row key={i++}>{val}</Row>
            ))}

            <div ref={dummyRef}></div>
          </Card>
        </Col>
        <Col span={8}>
          <MonsterCard monster={monster} />
        </Col>
      </Row>

      <Button onClick={startFight}> fight </Button>
    </React.Fragment>
  );
}

export default FightPage;
