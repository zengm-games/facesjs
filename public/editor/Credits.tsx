import React from "react";
import { Card, CardBody, Link } from "@nextui-org/react";

export const Credits = () => {
  return (
    <Card className="text-slate-700">
      <CardBody>
        <p>
          faces.js is an{" "}
          <Link href="https://github.com/zengm-games/facesjs/">
            open source library
          </Link>{" "}
          originally made for sports simulation games by{" "}
          <Link href="https://zengm.com/">ZenGM</Link>
        </p>
      </CardBody>
    </Card>
  );
};
