import React from 'react'
interface NavSectionHeaderProps {
    title: string;
}

export const NavSectionHeader: React.FC<NavSectionHeaderProps> = ({ title }) => {
    return <h3 className="italic text-sm text-stone-300">{title}</h3>

}