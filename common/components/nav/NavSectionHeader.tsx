import React from 'react'
interface NavSectionHeaderProps {
    title: string;
}

export const NavSectionHeader: React.FC<NavSectionHeaderProps> = ({ title }) => {
    return <h3 className="italic text-sm">{title}</h3>

}