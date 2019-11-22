const stations = [
    {
      "stop_id": "70094",
      "stop_name": "Ashmont",
      "line": "Red",
      "direction": "North",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70092",
      "stop_name": "Shawmut",
      "line": "Red",
      "direction": "North",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70090",
      "stop_name": "Fields Corner",
      "line": "Red",
      "direction": "North",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70088",
      "stop_name": "Savin Hill",
      "line": "Red",
      "direction": "North",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70086",
      "stop_name": "JFK/UMass",
      "line": "Red",
      "direction": "North",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70084",
      "stop_name": "Andrew",
      "line": "Red",
      "direction": "North",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70082",
      "stop_name": "Broadway",
      "line": "Red",
      "direction": "North",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70080",
      "stop_name": "South Station",
      "line": "Red",
      "direction": "North",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70078",
      "stop_name": "Downtown Crossing",
      "line": "Red",
      "direction": "North",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70076",
      "stop_name": "Park Street",
      "line": "Red",
      "direction": "North",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70074",
      "stop_name": "Charles/MGH",
      "line": "Red",
      "direction": "North",
      "stop_order": 11,
      "last_stop": "0"
    },
    {
      "stop_id": "70072",
      "stop_name": "Kendall/MIT",
      "line": "Red",
      "direction": "North",
      "stop_order": 12,
      "last_stop": "0"
    },
    {
      "stop_id": "70070",
      "stop_name": "Central",
      "line": "Red",
      "direction": "North",
      "stop_order": 13,
      "last_stop": "0"
    },
    {
      "stop_id": "70068",
      "stop_name": "Harvard",
      "line": "Red",
      "direction": "North",
      "stop_order": 14,
      "last_stop": "0"
    },
    {
      "stop_id": "70066",
      "stop_name": "Porter",
      "line": "Red",
      "direction": "North",
      "stop_order": 15,
      "last_stop": "0"
    },
    {
      "stop_id": "70064",
      "stop_name": "Davis",
      "line": "Red",
      "direction": "North",
      "stop_order": 16,
      "last_stop": "1"
    },
    {
      "stop_id": "70061",
      "stop_name": "Alewife",
      "line": "Red",
      "direction": "North",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70105",
      "stop_name": "Braintree",
      "line": "Red",
      "direction": "North",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70104",
      "stop_name": "Quincy Adams",
      "line": "Red",
      "direction": "North",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70102",
      "stop_name": "Quincy Center",
      "line": "Red",
      "direction": "North",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70098",
      "stop_name": "North Quincy",
      "line": "Red",
      "direction": "North",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70096",
      "stop_name": "JFK/UMass",
      "line": "Red",
      "direction": "North",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70061",
      "stop_name": "Alewife",
      "line": "Red",
      "direction": "South",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70063",
      "stop_name": "Davis",
      "line": "Red",
      "direction": "South",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70065",
      "stop_name": "Porter",
      "line": "Red",
      "direction": "South",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70067",
      "stop_name": "Harvard",
      "line": "Red",
      "direction": "South",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70069",
      "stop_name": "Central",
      "line": "Red",
      "direction": "South",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70071",
      "stop_name": "Kendall/MIT",
      "line": "Red",
      "direction": "South",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70073",
      "stop_name": "Charles/MGH",
      "line": "Red",
      "direction": "South",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70075",
      "stop_name": "Park Street",
      "line": "Red",
      "direction": "South",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70077",
      "stop_name": "Downtown Crossing",
      "line": "Red",
      "direction": "South",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70079",
      "stop_name": "South Station",
      "line": "Red",
      "direction": "South",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70081",
      "stop_name": "Broadway",
      "line": "Red",
      "direction": "South",
      "stop_order": 11,
      "last_stop": "0"
    },
    {
      "stop_id": "70083",
      "stop_name": "Andrew",
      "line": "Red",
      "direction": "South",
      "stop_order": 12,
      "last_stop": "0"
    },
    {
      "stop_id": "70085",
      "stop_name": "JFK/UMass",
      "line": "Red",
      "direction": "South",
      "stop_order": 13,
      "last_stop": "0"
    },
    {
      "stop_id": "70087",
      "stop_name": "Savin Hill",
      "line": "Red",
      "direction": "South",
      "stop_order": 14,
      "last_stop": "0"
    },
    {
      "stop_id": "70089",
      "stop_name": "Fields Corner",
      "line": "Red",
      "direction": "South",
      "stop_order": 15,
      "last_stop": "0"
    },
    {
      "stop_id": "70091",
      "stop_name": "Shawmut",
      "line": "Red",
      "direction": "South",
      "stop_order": 16,
      "last_stop": "0"
    },
    {
      "stop_id": "70093",
      "stop_name": "Ashmont",
      "line": "Red",
      "direction": "South",
      "stop_order": 17,
      "last_stop": "1"
    },
    {
      "stop_id": "70083",
      "stop_name": "Andrew",
      "line": "Red",
      "direction": "South",
      "stop_order": 12,
      "last_stop": "0"
    },
    {
      "stop_id": "70095",
      "stop_name": "JFK/UMass",
      "line": "Red",
      "direction": "South",
      "stop_order": 13,
      "last_stop": "0"
    },
    {
      "stop_id": "70097",
      "stop_name": "North Quincy",
      "line": "Red",
      "direction": "South",
      "stop_order": 14,
      "last_stop": "0"
    },
    {
      "stop_id": "70101",
      "stop_name": "Quincy Center",
      "line": "Red",
      "direction": "South",
      "stop_order": 15,
      "last_stop": "0"
    },
    {
      "stop_id": "70103",
      "stop_name": "Quincy Adams",
      "line": "Red",
      "direction": "South",
      "stop_order": 16,
      "last_stop": "1"
    },
    {
      "stop_id": "70105",
      "stop_name": "Braintree",
      "line": "Red",
      "direction": "South",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70036",
      "stop_name": "Oak Grove",
      "line": "Orange",
      "direction": "South",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70034",
      "stop_name": "Malden Center",
      "line": "Orange",
      "direction": "South",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70032",
      "stop_name": "Wellington",
      "line": "Orange",
      "direction": "South",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70278",
      "stop_name": "Assembly",
      "line": "Orange",
      "direction": "South",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70030",
      "stop_name": "Sullivan Square",
      "line": "Orange",
      "direction": "South",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70028",
      "stop_name": "Community College",
      "line": "Orange",
      "direction": "South",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70026",
      "stop_name": "North Station",
      "line": "Orange",
      "direction": "South",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70024",
      "stop_name": "Haymarket",
      "line": "Orange",
      "direction": "South",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70022",
      "stop_name": "State Street",
      "line": "Orange",
      "direction": "South",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70020",
      "stop_name": "Downtown Crossing",
      "line": "Orange",
      "direction": "South",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70018",
      "stop_name": "Chinatown",
      "line": "Orange",
      "direction": "South",
      "stop_order": 11,
      "last_stop": "0"
    },
    {
      "stop_id": "70016",
      "stop_name": "Tufts Medical Center",
      "line": "Orange",
      "direction": "South",
      "stop_order": 12,
      "last_stop": "0"
    },
    {
      "stop_id": "70014",
      "stop_name": "Back Bay",
      "line": "Orange",
      "direction": "South",
      "stop_order": 13,
      "last_stop": "0"
    },
    {
      "stop_id": "70012",
      "stop_name": "Massachusetts Avenue",
      "line": "Orange",
      "direction": "South",
      "stop_order": 14,
      "last_stop": "0"
    },
    {
      "stop_id": "70010",
      "stop_name": "Ruggles",
      "line": "Orange",
      "direction": "South",
      "stop_order": 15,
      "last_stop": "0"
    },
    {
      "stop_id": "70008",
      "stop_name": "Roxbury Crossing",
      "line": "Orange",
      "direction": "South",
      "stop_order": 16,
      "last_stop": "0"
    },
    {
      "stop_id": "70006",
      "stop_name": "Jackson Square",
      "line": "Orange",
      "direction": "South",
      "stop_order": 17,
      "last_stop": "0"
    },
    {
      "stop_id": "70004",
      "stop_name": "Stony Brook",
      "line": "Orange",
      "direction": "South",
      "stop_order": 18,
      "last_stop": "0"
    },
    {
      "stop_id": "70002",
      "stop_name": "Green Street",
      "line": "Orange",
      "direction": "South",
      "stop_order": 19,
      "last_stop": "1"
    },
    {
      "stop_id": "70001",
      "stop_name": "Forest Hills",
      "line": "Orange",
      "direction": "South",
      "stop_order": 20,
      "last_stop": "0"
    },
    {
      "stop_id": "70001",
      "stop_name": "Forest Hills",
      "line": "Orange",
      "direction": "North",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70003",
      "stop_name": "Green Street",
      "line": "Orange",
      "direction": "North",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70005",
      "stop_name": "Stony Brook",
      "line": "Orange",
      "direction": "North",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70007",
      "stop_name": "Jackson Square",
      "line": "Orange",
      "direction": "North",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70009",
      "stop_name": "Roxbury Crossing",
      "line": "Orange",
      "direction": "North",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70011",
      "stop_name": "Ruggles",
      "line": "Orange",
      "direction": "North",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70013",
      "stop_name": "Massachusetts Avenue",
      "line": "Orange",
      "direction": "North",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70015",
      "stop_name": "Back Bay",
      "line": "Orange",
      "direction": "North",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70017",
      "stop_name": "Tufts Medical Center",
      "line": "Orange",
      "direction": "North",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70019",
      "stop_name": "Chinatown",
      "line": "Orange",
      "direction": "North",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70021",
      "stop_name": "Downtown Crossing",
      "line": "Orange",
      "direction": "North",
      "stop_order": 11,
      "last_stop": "0"
    },
    {
      "stop_id": "70023",
      "stop_name": "State Street",
      "line": "Orange",
      "direction": "North",
      "stop_order": 12,
      "last_stop": "0"
    },
    {
      "stop_id": "70025",
      "stop_name": "Haymarket",
      "line": "Orange",
      "direction": "North",
      "stop_order": 13,
      "last_stop": "0"
    },
    {
      "stop_id": "70027",
      "stop_name": "North Station",
      "line": "Orange",
      "direction": "North",
      "stop_order": 14,
      "last_stop": "0"
    },
    {
      "stop_id": "70029",
      "stop_name": "Community College",
      "line": "Orange",
      "direction": "North",
      "stop_order": 15,
      "last_stop": "0"
    },
    {
      "stop_id": "70031",
      "stop_name": "Sullivan Square",
      "line": "Orange",
      "direction": "North",
      "stop_order": 16,
      "last_stop": "0"
    },
    {
      "stop_id": "70279",
      "stop_name": "Assembly",
      "line": "Orange",
      "direction": "North",
      "stop_order": 17,
      "last_stop": "0"
    },
    {
      "stop_id": "70033",
      "stop_name": "Wellington",
      "line": "Orange",
      "direction": "North",
      "stop_order": 18,
      "last_stop": "0"
    },
    {
      "stop_id": "70035",
      "stop_name": "Malden Center",
      "line": "Orange",
      "direction": "North",
      "stop_order": 19,
      "last_stop": "0"
    },
    {
      "stop_id": "70036",
      "stop_name": "Oak Grove",
      "line": "Orange",
      "direction": "North",
      "stop_order": 20,
      "last_stop": "1"
    },
    {
      "stop_id": "70059",
      "stop_name": "Wonderland",
      "line": "Blue",
      "direction": "South",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70057",
      "stop_name": "Revere Beach",
      "line": "Blue",
      "direction": "South",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70055",
      "stop_name": "Beachmont",
      "line": "Blue",
      "direction": "South",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70053",
      "stop_name": "Suffolk Downs",
      "line": "Blue",
      "direction": "South",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70051",
      "stop_name": "Orient Heights",
      "line": "Blue",
      "direction": "South",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70049",
      "stop_name": "Wood Island",
      "line": "Blue",
      "direction": "South",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70047",
      "stop_name": "Airport",
      "line": "Blue",
      "direction": "South",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70045",
      "stop_name": "Maverick",
      "line": "Blue",
      "direction": "South",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70043",
      "stop_name": "Aquarium",
      "line": "Blue",
      "direction": "South",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70041",
      "stop_name": "State Street",
      "line": "Blue",
      "direction": "South",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70039",
      "stop_name": "Government Center",
      "line": "Blue",
      "direction": "South",
      "stop_order": 11,
      "last_stop": "0"
    },
    {
      "stop_id": "70038",
      "stop_name": "Bowdoin",
      "line": "Blue",
      "direction": "South",
      "stop_order": 12,
      "last_stop": "1"
    },
    {
      "stop_id": "70038",
      "stop_name": "Bowdoin",
      "line": "Blue",
      "direction": "North",
      "stop_order": 1,
      "last_stop": "0"
    },
    {
      "stop_id": "70040",
      "stop_name": "Government Center",
      "line": "Blue",
      "direction": "North",
      "stop_order": 2,
      "last_stop": "0"
    },
    {
      "stop_id": "70042",
      "stop_name": "State Street",
      "line": "Blue",
      "direction": "North",
      "stop_order": 3,
      "last_stop": "0"
    },
    {
      "stop_id": "70044",
      "stop_name": "Aquarium",
      "line": "Blue",
      "direction": "North",
      "stop_order": 4,
      "last_stop": "0"
    },
    {
      "stop_id": "70046",
      "stop_name": "Maverick",
      "line": "Blue",
      "direction": "North",
      "stop_order": 5,
      "last_stop": "0"
    },
    {
      "stop_id": "70048",
      "stop_name": "Airport",
      "line": "Blue",
      "direction": "North",
      "stop_order": 6,
      "last_stop": "0"
    },
    {
      "stop_id": "70050",
      "stop_name": "Wood Island",
      "line": "Blue",
      "direction": "North",
      "stop_order": 7,
      "last_stop": "0"
    },
    {
      "stop_id": "70052",
      "stop_name": "Orient Heights",
      "line": "Blue",
      "direction": "North",
      "stop_order": 8,
      "last_stop": "0"
    },
    {
      "stop_id": "70054",
      "stop_name": "Suffolk Downs",
      "line": "Blue",
      "direction": "North",
      "stop_order": 9,
      "last_stop": "0"
    },
    {
      "stop_id": "70056",
      "stop_name": "Beachmont",
      "line": "Blue",
      "direction": "North",
      "stop_order": 10,
      "last_stop": "0"
    },
    {
      "stop_id": "70058",
      "stop_name": "Revere Beach",
      "line": "Blue",
      "direction": "North",
      "stop_order": 11,
      "last_stop": "1"
    }
  ];

export {
    stations,
};