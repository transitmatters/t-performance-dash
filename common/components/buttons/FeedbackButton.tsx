import React, { useState } from 'react';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faCommentDots as faCommentDotsSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export const FeedbackButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <>
      <Link
        href="mailto:labs@transitmatters.org?subject=[Data%20Dashboard%20Feedback]%20-%20"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex w-full cursor-pointer justify-center gap-x-2 rounded-md bg-stone-100 p-2  md:justify-start"
      >
        <div className="relative flex flex-row items-center text-sm text-stone-900 md:pl-1">
          <FontAwesomeIcon
            icon={hovered ? faCommentDotsSolid : faCommentDots}
            className="pr-2"
            size="lg"
          />
          <p>Feedback</p>
        </div>
      </Link>
    </>
  );
};
