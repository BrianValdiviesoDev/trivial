import { Trans } from "@lingui/react";

export const Resume = () => {
  return (
    <>
      <p>
        <Trans id="Resume" />
      </p>
      <button>
        <Trans id="Change language" />
      </button>
      <button>
        <Trans id="Start new quizz" />
      </button>
    </>
  );
};

export default Resume;
