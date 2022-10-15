import React from "react";

export const BusDisclaimer = () => {
    return(
        <div className="bus-disclaimer">
            Due to data collection issues, bus data is not guaranteed to be complete for any stop or date.
            <br/>
            This may lead to inaccuracies, particularly in headway calculations.
        </div>
    )
};

export const TodayDisclaimer = () => {
    return(
        <div className="today-disclaimer">
            Today's data haven't been cleaned yet and may be a little messy.
        </div>
    )
}
