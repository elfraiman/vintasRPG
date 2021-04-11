import { Player } from "@prisma/client";
import { Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React from "react";
import { IPlayer } from "../lib/functions";
import { WEAPONTYPES } from "../pages/fight";

interface IPlayerCardProps {
  player: IPlayer;
}

const PlayerCard = ({ player }: IPlayerCardProps) => {
  const [session, loading] = useSession();
  let playerMainhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.MAINHAND
  )?.item;
  let playerOffhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.OFFHAND
  )?.item;
  const playerTwoHanded = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.TWOHANDED
  )?.item;

  if (!player) return null;
  if (!loading && !session) return null;

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return Math.round(result);
  };

  const calculateExperience = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return Math.round(result);
  };

  const playerWeaponInfo = () => {
    let text;

    if (playerTwoHanded) {
      text = (
        <b>
          {playerTwoHanded.name} ({playerTwoHanded.minDamage}-
          {playerTwoHanded.maxDamage})
        </b>
      );
    } else {
      text = (
        <b>
          Mainhand: {playerMainhand.name} ({playerMainhand.minDamage}-
          {playerMainhand.maxDamage}) <br/> Offhand: {playerOffhand.name} (
          {playerOffhand.minDamage}-{playerOffhand.maxDamage})
        </b>
      );
    }

    return text;
  };
  return (
    <React.Fragment>
      <Card
        title={player.name}
        style={{
          width: "100%",
          minHeight: 350,
          display: "flex",
          flexDirection: "column",
        }}
        loading={loading}
      >
        <p> Level: {player.level}</p>
        <p style={{ marginBottom: 0 }}>Experience:</p>
        <Progress
          percent={calculateExperience(
            player.experience,
            player.experienceToLevelUp
          )}
          type="line"
          showInfo={true}
        />
        <p style={{ marginBottom: 0 }}>
          Health: {player.health} / {player.maxHealth}
        </p>
        <Progress
          percent={calculatePercentHealth(player.health, player.maxHealth)}
          type="line"
          showInfo={false}
          status={
            calculatePercentHealth(player.health, player.maxHealth) <= 30
              ? "exception"
              : "success"
          }
        />
        <p>{playerWeaponInfo()}</p>
      </Card>
    </React.Fragment>
  );
};

export default PlayerCard;
