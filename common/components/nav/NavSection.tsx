import { NavSectionHeader } from "./NavSectionHeader"
import { MenuDropdown } from "./MenuDropdown"
import { SubwaySection } from "./SubwaySection"

interface NavSectionProps {
    title: string;
    content: React.ReactNode
}

export const NavSection: React.FC<NavSectionProps> = ({ title, content }) => {
    return <div className="mt-1">
        <NavSectionHeader title={title} />
        <div >
            {content}
        </div>
    </div>
}