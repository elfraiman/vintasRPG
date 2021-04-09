import { Monster, Player } from "@prisma/client";
import { Button, Card, Col, message, Row } from "antd";
import { cloneDeep } from "lodash";
import { getSession, useSession } from "next-auth/client";
import React, { useEffect, useRef, useState } from "react";
import MonsterCard from "../components/MonsterCard";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IPlayer } from "../lib/functions";
1;
import prisma from "../lib/prisma";

export enum WEAPONTYPES {
  MAINHAND = "mainhand",
  OFFHAND = "offhand",
  TWOHANDED = "twohanded",
}
export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
}

export enum MULTIPLIERS {
  LEVELUPEXPMULTIPLIER = 1.85,
}

interface IFightPageProps {
  player: IPlayer;
  monster: Monster;
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userid);

    const monster = await prisma.monster?.findFirst({
      where: { id: parseInt(context.query.monsterId, 10) },
    });

    return { props: { player, monster } };
  } else {
    return { props: {} };
  }
};

function FightPage({ player, monster }: IFightPageProps) {
  const [session, loading] = useSession();
  const [playerInState, setPlayerInState] = useState<Player>(cloneDeep(player));
  const [monsterInState, setMonster] = useState<Monster>(cloneDeep(monster));
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [fightStarted, setFightStarted] = useState<boolean>(false);

  let battleLogContainer = [];

  // Dummy ref to keep scrolling in the combat log
  //
  let dummyRef = useRef(null);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${playerInState.id}`, {
      method: "POST",
      body: JSON.stringify(playerInState),
    }).then((response) => {
      console.log(response);
    });
  };

  const lootRoll = () => {
    const dropGold = Math.floor(Math.random() * 3);
    const getMonsterGoldDrop = Math.round(
      Math.floor(Math.random() * monster.goldDrop + 1) *
        monster.currencyMultiplier
    );
    console.log(dropGold, "dropgold", getMonsterGoldDrop);
    if (dropGold === 1) {
      setPlayerInState({
        ...playerInState,
        gold: playerInState.gold += getMonsterGoldDrop,
      });

      return getMonsterGoldDrop;
    }
  };

  const playerWin = () => {
     // Saves the local obj to the backend;
     const gold = lootRoll();
    // Player Won
    // Add experience and rewards to player for killing monster
    //
    setPlayerInState({
      ...playerInState,
      experience: (playerInState.experience += monsterInState.experience),
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



    setFightStarted(false);
    setBattleLog([
      ...battleLogContainer,
      <span>
        You have killed the {monsterInState.name} and gained{" "}
        <span style={{ color: "#1890ff" }}>{monsterInState.experience}</span>{" "}
        experience{" "}
        {gold ? (
          <>
            {" "}
            and <span style={{ color: "#ffd700" }}> {gold} </span> gold.
          </>
        ) : (
          <></>
        )}
      </span>,
    ]);
    message.info(`You killed the ${monsterInState.name}.`);
    savePlayer();
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
        You <b>died</b> to {monsterInState.name} and lost{" "}
        <span style={{ color: "#1890ff" }}>{monsterInState.experience}</span>{" "}
        experience
      </span>,
    ]);
    message.error(
      `You died to the ${monsterInState.name} and lost ${monsterInState.experience} experience`
    );
  };

  const handleBattleLog = (
    playerOrMonster: "player" | "monster",
    dmg: number
  ) => {
    if (playerOrMonster === "player") {
    } else if (playerOrMonster === "monster") {
      battleLogContainer.push([
        <span>
          The {monsterInState.name} hit you for
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
    let playerMainhand = player.equipement.find(
      (equip) => equip.slot.type === WEAPONTYPES.MAINHAND
    )?.item;
    let playerOffhand = player.equipement.find(
      (equip) => equip.slot.type === WEAPONTYPES.OFFHAND
    )?.item;
    const playerTwoHanded = player.equipement.find(
      (equip) => equip.slot.type === WEAPONTYPES.TWOHANDED
    )?.item;

    const playerDuelWielding = playerMainhand && playerOffhand;

    if (playerDuelWielding) {
      // Main hand hit
      //
      const hitMainHand = setInterval(() => {
        if (monsterInState.health <= 0) {
          playerWin();
          clearInterval(hitOffhand);
          clearInterval(hitMainHand);
        }

        // If player is duel wielding we cant to create
        // more hits.
        //

        const calculatedTotalDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerMainhand.maxDamage;
        const calculatedMinimumDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerMainhand.minDamage;

        const upcomingHit = Math.floor(
          Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
            calculatedMinimumDamage
        );

        if (monsterInState.health > 0 && playerInState.health > 0) {
          // Text for display
          //
          battleLogContainer.push([
            <span>
              Your {playerMainhand.name} hit {monsterInState.name} for
              <span style={{ color: "green" }}> {upcomingHit}</span> damage.
            </span>,
          ]);
          setBattleLog(battleLogContainer);

          // Set monster stats after hit
          setMonster({
            ...monsterInState,
            health: (monsterInState.health -= upcomingHit),
          });
        }
      }, playerMainhand.attackSpeed * 1000);

      const hitOffhand = setInterval(() => {
        if (monsterInState.health <= 0) {
          playerWin();
          clearInterval(hitOffhand);
          clearInterval(hitMainHand);
        }
        // If player is duel wielding we cant to create
        // more hits.
        //

        const calculatedTotalDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerOffhand.maxDamage;
        const calculatedMinimumDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerOffhand.minDamage;

        const upcomingHit = Math.floor(
          Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
            calculatedMinimumDamage
        );

        if (monsterInState.health > 0 && playerInState.health > 0) {
          // Set offhand hit text display
          //
          battleLogContainer.push([
            <span>
              Your {playerOffhand.name} hit {monsterInState.name} for
              <span style={{ color: "green" }}> {upcomingHit} </span> damage.
            </span>,
          ]);
          setBattleLog(battleLogContainer);

          setMonster({
            ...monsterInState,
            health: (monsterInState.health -= upcomingHit),
          });
        }
      }, playerOffhand.attackSpeed * 1000);
    } else {
      // 2 handed hit
      //
      const twoHandedHit = setInterval(() => {
        if (monsterInState.health <= 0) {
          playerWin();
          clearInterval(twoHandedHit);
        }

        // If player is duel wielding we cant to create
        // more hits.
        //

        const calculatedTotalDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerTwoHanded.maxDamage;
        const calculatedMinimumDamage =
          playerInState.strength * STATSMULTIPLIERS.STR +
          playerTwoHanded.minDamage;

        const upcomingHit = Math.floor(
          Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
            calculatedMinimumDamage
        );

        if (monsterInState.health > 0 && playerInState.health > 0) {
          // Text for display
          //
          battleLogContainer.push([
            <span>
              Your {playerTwoHanded.name} hit {monsterInState.name} for
              <span style={{ color: "green" }}> {upcomingHit}</span> damage.
            </span>,
          ]);
          setBattleLog(battleLogContainer);

          // Set monster stats after hit
          setMonster({
            ...monsterInState,
            health: (monsterInState.health -= upcomingHit),
          });
        }
      }, playerTwoHanded.attackSpeed * 1000);
    }
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
        Math.random() * (monsterInState.maxDamage - monsterInState.minDamage) +
          monsterInState.minDamage
      );

      if (playerInState.health > 0 && monsterInState.health > 0) {
        handleBattleLog("monster", upcomingHit);
        setPlayerInState({
          ...playerInState,
          health: (playerInState.health -= upcomingHit),
        });
      }
    }, monsterInState.attackSpeed * 1000);
  };

  // Start fight again
  const startReFight = () => {
    setMonster({
      ...monsterInState,
      health: (monsterInState.health +=
        monsterInState.maxHealth - monsterInState.health),
    });

    startFight();
  };

  const startFight = () => {
    battleLogContainer = [];
    setBattleLog([]);
    if (playerInState.health > 0 && monsterInState.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
      setFightStarted(true);
      return;
    } else if (monsterInState.health < 0) {
      message.error("You can't kill what is already dead.");
    } else {
      message.error("You are dead.");
    }
    setFightStarted(false);
  };

  return (
    <SiteLayout player={playerInState}>
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
            ) : monsterInState.health <= 0 ? (
              <Button onClick={startReFight}>Fight Again</Button>
            ) : (
              <Button onClick={startFight}>Fight</Button>
            )}
          </Row>
        </Col>
        <Col span={8}>
          <MonsterCard monster={monsterInState} />
        </Col>
      </Row>
    </SiteLayout>
  );
}

export default FightPage;
