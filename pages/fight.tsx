import { Monster, Player } from "@prisma/client";
import { Button, Card, Col, message, Row } from "antd";
import { getSession, useSession } from "next-auth/client";
import React, { useEffect, useRef, useState } from "react";
import MonsterCard from "../components/MonsterCard";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import prisma from "../lib/prisma";
import { cloneDeep } from "lodash";

export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
}

export enum MULTIPLIERS {
  LEVELUPEXPMULTIPLIER = 1.85,
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await prisma.player?.findFirst({
      where: { userId: session?.userId },
    });

    const equip = await prisma.playerEquip?.findUnique({
      where: { playerId: player.id }
    })

    const monster = await prisma.monster?.findFirst({
      where: { id: parseInt(context.query.monsterId, 10) },
    });



    return { props: { player, equip, monster } };
  } else {
    return { props: {} };
  }
};

function FightPage(props) {
  console.log(props);
  const [session, loading] = useSession();
  const [playerInState, setPlayerInState] = useState<Player>(
    cloneDeep(props.player)
  );
  const [monster, setMonster] = useState<Monster>(cloneDeep(props.monster));
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [fightStarted, setFightStarted] = useState<boolean>(false);

  let battleLogContainer = [];

  let dummyRef = useRef(null);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${playerInState.player.id}`, {
      method: "POST",
      body: JSON.stringify(playerInState.player),
    }).then((response) => {
      console.log(response);
    });
  };

  const playerWin = () => {
    // Player Won
    // Add experience and rewards to player for killing monster
    //
    setPlayerInState({
      ...playerInState,
      experience: (playerInState.experience += monster.experience),
    });

    // If level  up
    if (playerInState.experience >= playerInState.experienceToLevelUp) {
      setPlayerInState({
        ...playerInState,
        level: (playerInState.level += 1),
        experienceToLevelUp:
          playerInState.experienceToLevelUp * MULTIPLIERS.LEVELUPEXPMULTIPLIER,
        experience: 0,
      });
    }
    // Saves the local obj to the backend;
    savePlayer();
    setFightStarted(false);
    setBattleLog([
      ...battleLogContainer,
      <span>
        You have killed the {monster.name} and gained{" "}
        <span style={{ color: "#1890ff" }}>{monster.experience}</span>{" "}
        experience
      </span>,
    ]);
    message.info(
      `You killed the ${monster.name} and gained ${monster.experience} experience`
    );
  };

  const playerLose = () => {
    const lostExp = Math.round(
      (playerInState.experience / playerInState.experienceToLevelUp) * 100
    );

    if (playerInState.experience > 0) {
      // Player lost
      // penelty
      setPlayerInState({
        ...playerInState,
        experience: (playerInState.experience -= lostExp),
      });
    } else {
      setPlayerInState({
        ...playerInState,
        experience: 0,
      });
    }

    // Saves the local obj to the backend;
    savePlayer();
    setFightStarted(false);

    setBattleLog([
      ...battleLogContainer,
      <span>
        You <b>died</b> to {monster.name} and lost{" "}
        <span style={{ color: "#1890ff" }}>{monster.experience}</span>{" "}
        experience
      </span>,
    ]);
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
        <span>
          You hit the {monster.name} for
          <span style={{ color: "green" }}> {dmg}</span> damage.
        </span>,
      ]);
      setBattleLog(battleLogContainer);
    } else if (playerOrMonster === "monster") {
      battleLogContainer.push([
        <span>
          The {monster.name} hit you for
          {<span style={{ color: "red" }}> {dmg}</span>} damage.
        </span>,
      ]);
      setBattleLog(battleLogContainer);
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
      if (monster.health <= 0) {
        playerWin();
        clearInterval(fight);
      }

/*       const calculatedTotalDamage =
        playerInState.strength * STATSMULTIPLIERS.STR +
        playerInState.equipement.weapon.maxDamage;
      const calculatedMinimumDamage =
        playerInState.strength * STATSMULTIPLIERS.STR +
        playerInState.equipement.weapon.minDamage;

      const upcomingHit = Math.floor(
        Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
          calculatedMinimumDamage
      );

      if (monster.health > 0 && playerInState.health > 0) {
        handleBattleLog("player", upcomingHit);
        setMonster({
          ...monster,
          health: (monster.health -= upcomingHit),
        });
      } */
    }, attackSpeed);
  };

  const doMonsterAttack = () => {
    const fight = setInterval(() => {
      if (playerInState.health <= 0) {
        setPlayerInState({
          ...playerInState,
          health: (playerInState.health = 0),
        });
        playerLose();
        clearInterval(fight);
      }

      const upcomingHit = Math.floor(
        Math.random() * (monster.maxDamage - monster.minDamage) +
          monster.minDamage
      );

      if (playerInState.health > 0 && monster.health > 0) {
        handleBattleLog("monster", upcomingHit);
        setPlayerInState({
          ...playerInState,
          health: (playerInState.health -= upcomingHit),
        });
      }
    }, monster.attackSpeed * 1000);
  };

  const startReFight = () => {
    setMonster({
      ...props.monster,
      health: (monster.health += monster.maxHealth - monster.health),
    });

    startFight();
  };

  const startFight = () => {
    battleLogContainer = [];
    setBattleLog([]);
    if (playerInState.player.health > 0 && monster.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
      setFightStarted(true);
      return;
    } else if (monster.health < 0) {
      message.error("You can't kill what is already dead.");
    } else {
      message.error("You are dead.");
    }
    setFightStarted(false);
  };

  return (
    <SiteLayout player={props.player}>
      <Row>
        <h2>Combat</h2>
      </Row>
      <Row>
        <Col span={8}>
          <PlayerCard player={playerInState} />
        </Col>
        <Col span={8}>
          <Card
            style={{
              height: 350,
              width: 300,
              overflowY: "hidden",
              padding: 16,
            }}
          >
            {battleLog.map((val, i) => (
              <Row key={i}>{val}</Row>
            ))}

            <div ref={dummyRef}></div>
          </Card>
          <Row style={{ marginTop: 16 }}>
            {fightStarted ? (
              <Button>Run</Button>
            ) : monster.health <= 0 ? (
              <Button onClick={startReFight}>Fight Again</Button>
            ) : (
              <Button onClick={startFight}>Fight</Button>
            )}
          </Row>
        </Col>
        <Col span={8}>
          <MonsterCard monster={monster} />
        </Col>
      </Row>
    </SiteLayout>
  );
}

export default FightPage;
