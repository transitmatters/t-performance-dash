import { NavSectionHeader } from "./NavSectionHeader"
import { SubwayDropdown } from "./SubwayDropdown"
import { SubwaySection } from "./SubwaySection"

interface NavSectionProps {
    title: string;
    content: React.ReactNode
}

export const NavSection: React.FC<NavSectionProps> = ({ title, content }) => {
    return <div  >
        <NavSectionHeader title={title} />
        <div className="px-1 ">
            {content}
        </div>
    </div>
}