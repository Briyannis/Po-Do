import React from "react";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";

const PreLoader1 = () => {
  return (
    <>
        <ReactLoading
          type={"bars"}
          color={"#14c91c"}
        />
    </>
  );
};

export default PreLoader1;
