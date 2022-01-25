import { stations } from "./stations";


const createConfigPresetValue = (line, fromStationName, toStationName, date_start, date_end = undefined) => {
	const fromStation = stations[line].stations.find(s => s.stop_name === fromStationName);
	const toStation = stations[line].stations.find(s => s.stop_name === toStationName);
	const bus_mode = stations[line].type === "bus";
	return {
		bus_mode,
		line,
		date_start,
		date_end,
		from: fromStation,
		to: toStation,
	}
};

const TODAY = new Date().toISOString().split("T")[0];

export const configPresets = [
	{
		label: "Jan 12, 2022 — Red Line door problem",
		value: createConfigPresetValue("Red", "Quincy Adams", "South Station", "2022-01-12")
	},
	{
		label: "June 2021 to Present — Orange Line slow zones",
		value: createConfigPresetValue("Orange", "Downtown Crossing", "Green Street", "2021-06-01", "2022-01-23")
	},
	{
		label: "Sept 9, 2021 — Route 28 first day of school traffic",
		value: createConfigPresetValue("28", "Mattapan Station", "Nubian Station", "2021-09-09")
	},
	{
		label: "Oct 19, 2021 — Route 1 bus bunching",
		value: createConfigPresetValue("1", "Harvard", "Hynes Station", "2021-10-19")
	},
	{
		label: "Oct to Nov 2021 — Route 22 Columbus Ave bus lane",
		value: createConfigPresetValue("22", "Jackson Square Station", "Franklin Park", "2021-10-01", "2021-11-30")
	}
	/** OLD STUFF
	{
		label: "[New!] April 2021 — Orange Line slow zone",
		value: createConfigPresetValue("Orange", "Oak Grove", "Wellington", '2021-03-01', TODAY),
	},
	{
		label: "[New!] December 2020 — Orange Line slow zone",
		value: createConfigPresetValue("Orange", "Community College", "North Station", '2020-11-01', '2021-02-17'),
	},
	{
		label: "[New!] Spring 2020 — Green Line (E-branch) COVID-19 pandemic effect",
		value: createConfigPresetValue("Green", "Mission Park", "Government Center", '2020-01-01', '2020-05-31'),
	},
	{
		label: "March 30, 2021 — Red Line Power Issues",
		value: createConfigPresetValue("Red", "Andrew", "Park Street", '2021-03-30'),
	},
	{
		label: "March 16, 2021 — Orange Line Derailment",
		value: createConfigPresetValue("Orange", "Downtown Crossing", "Community College", '2021-03-16'),
	},
	{
		label: "April 2, 2021 — Blue Line Daytime Maintenance",
		value: createConfigPresetValue("Blue", "Revere Beach", "State Street", '2021-04-02'),
	},
    */
];
