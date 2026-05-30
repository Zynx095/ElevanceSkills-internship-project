import QuestionDetail from "@/components/QuestionDetail";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";
import React from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Mainlayout>
      <div>
        <QuestionDetail questionId={Array.isArray(id) ? id[0] : id} />
      </div>
    </Mainlayout>
  );
};

export default index;
