import { Monster, Player, Weapon } from "@prisma/client";
import { Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React from "react";



interface IMonsterCardProps {
  monster: Monster;
}

const MonsterCard = ({ monster }: IMonsterCardProps) => {
  const [session, loading] = useSession();
  let equipement;
  if (!loading && !session) return null;

  console.log(monster, "props");

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return result;
  };

  const calculateExperience = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return result;
  };

  return (
    <React.Fragment>
      <Card
        title={monster.name}
        style={{
          width: 300,
          height: 300,
          display: "flex",
          flexDirection: "column",
        }}
        loading={loading}
      >
        <p> Level: {monster.level}</p>
        <p style={{ marginBottom: 0 }}>
          Health: {monster.health} / {monster.health}
        </p>
        <Progress
          percent={monster.health / 100 * 100}
          type="line"
          showInfo={false}
          status={
            monster.health / 100 * 100 <= 30
              ? "exception"
              : "success"
          }
        />
      </Card>
    </React.Fragment>
  );
};

export default MonsterCard;
