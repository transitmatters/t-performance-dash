import Link from 'next/link';
import React from 'react';
import { DonateButton } from '../../common/components/buttons/DonateButton';

export const ExtraMenuItems: React.FC = () => {
    return (
        <div className="flex flex-col gap-1 py-2 text-sm">
            <Link
                href="https://transitmatters.org/transitmatters-labs"
                className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
            >
                <div className="h-8 w-8" />
                About
            </Link>
            <Link
                href="https://transitmatters.org/join"
                className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
            >
                <div className="h-8 w-8" />

                Join Us
            </Link>
            <Link
                href="https://forms.gle/SKYtxgKSyCrYxM1v7"
                className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
            >
                <div className="h-8 w-8" />

                Feedback
            </Link>
            <Link
                href="https://github.com/transitmatters/t-performance-dash"
                className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
            >
                <div className="h-8 w-8" />

                Source Code
            </Link>
            <Link href="/opensource"
                className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
            >
                <div className="h-8 w-8" />

                Attributions
            </Link>
            <hr className="border-stone-600" />

            <DonateButton />
        </div>);
}