import { Player } from "@prisma/client";
import { Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React from "react";



interface IPlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: IPlayerCardProps) => {
  const [session, loading] = useSession();
  let equipement;

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

  return (
    <React.Fragment>
      <Card
        title={player.name}
        style={{
          width: 300,
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
        <p>
         {/*  {equipement.weapon.name} ({equipement.weapon.minDamage}-
          {equipement.weapon.maxDamage}) */}
        </p>
      </Card>
    </React.Fragment>
  );
};

export default PlayerCard;
