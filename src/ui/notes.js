import React from "react";

const BusDisclaimer = () => {
    return(
        <div className="bus-disclaimer">
            Due to data collection issues, bus data is not guaranteed to be complete for any stop or date.
            <br/>
            This may lead to inaccuracies, particularly in headway calculations.
        </div>
    )
};

export { BusDisclaimer };