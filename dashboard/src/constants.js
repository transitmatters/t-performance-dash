const lines = [
    {
        name: 'Red',
        name_human_readable: 'Red Line',
        stop_ids: {'Alewife': '70061', 'Davis': '70063', 'Porter': '70065', 'Harvard': '70067', 'Central': '70069', 'Kendall/MIT': '70071', 'Charles/MGH': '70073', 'Park Street': '70075', 'Downtown Crossing': '70077', 'South Station': '70079', 'Broadway': '70081', 'Andrew': '70083', 'JFK/UMass': '70085', 'Savin Hill': '70087', 'Fields Corner': '70089', 'Shawmut': '70091', 'Ashmont': '70093', 'North Quincy': '70097', 'Quincy Center': '70101', 'Quincy Adams': '70103', 'Braintree': '70105'},
    },
    {
        name: 'Orange',
        name_human_readable: 'Orange Line',
        stop_ids: {'Oak Grove': '70036', 'Malden Center': '70034', 'Wellington': '70032', 'Assembly': '70278', 'Sullivan Square': '70030', 'Community College': '70028', 'North Station': '70026', 'Haymarket': '70024', 'State': '70022', 'Downtown Crossing': '70020', 'Chinatown': '70018', 'Tufts Medical Center': '70016', 'Back Bay': '70014', 'Massachusetts Avenue': '70012', 'Ruggles': '70010', 'Roxbury Crossing': '70008', 'Jackson Square': '70006', 'Stony Brook': '70004', 'Green Street': '70002', 'Forest Hills': '70001'},
    },
    {
        name: 'Green-B',
        name_human_readable: 'Green Line (B Branch)',
        stop_ids: {'Lechmere': '70210', 'Science Park': '70208', 'North Station': '70206', 'Haymarket': '70204', 'Government Center': '70202', 'Park Street': '70196', 'Boylston': '70159', 'Arlington': '70157', 'Copley': '70155', 'Hynes Convention Center': '70153', 'Kenmore': '71151', 'Blandford Street': '70149', 'Boston University East': '70147', 'Boston University Central': '70145', 'Boston University West': '70143', 'Saint Paul Street': '70141', 'Pleasant Street': '70139', 'Babcock Street': '70137', 'Packards Corner': '70135', 'Harvard Avenue': '70131', 'Griggs Street': '70129', 'Allston Street': '70127', 'Warren Street': '70125', 'Washington Street': '70121', 'Sutherland Road': '70117', 'Chiswick Road': '70115', 'Chestnut Hill Avenue': '70113', 'South Street': '70111', 'Boston College': '70107'},
    },
    {
        name: 'Green-C',
        name_human_readable: 'Green Line (C Branch)',
        stop_ids: {'Lechmere': '70210', 'Science Park': '70208', 'North Station': '70206', 'Haymarket': '70204', 'Government Center': '70202', 'Park Street': '70197', 'Boylston': '70159', 'Arlington': '70157', 'Copley': '70155', 'Hynes Convention Center': '70153', 'Kenmore': '70151', 'Saint Marys Street': '70211', 'Hawes Street': '70213', 'Kent Street': '70215', 'Saint Paul Street': '70217', 'Coolidge Corner': '70219', 'Summit Avenue': '70223', 'Brandon Hall': '70225', 'Fairbanks Street': '70227', 'Washington Square': '70229', 'Tappan Street': '70231', 'Dean Road': '70233', 'Englewood Avenue': '70235', 'Cleveland Circle': '70237'},
    },
    {
        name: 'Green-D',
        name_human_readable: 'Green Line (D Branch)',
        stop_ids: {'Lechmere': '70210', 'Science Park': '70208', 'North Station': '70206', 'Haymarket': '70204', 'Government Center': '70202', 'Park Street': '70198', 'Boylston': '70159', 'Arlington': '70157', 'Copley': '70155', 'Hynes Convention Center': '70153', 'Kenmore': '70151', 'Fenway': '70187', 'Longwood': '70183', 'Brookline Village': '70181', 'Brookline Hills': '70179', 'Beaconsfield': '70177', 'Reservoir': '70175', 'Chestnut Hill': '70173', 'Newton Centre': '70171', 'Newton Highlands': '70169', 'Eliot': '70167', 'Waban': '70165', 'Woodland': '70163', 'Riverside': '70161'},
    },
    {
        name: 'Green-E',
        name_human_readable: 'Green Line (E Branch)',
        stop_ids: {'Lechmere': '70210', 'Science Park': '70208', 'North Station': '70206', 'Haymarket': '70204', 'Government Center': '70202', 'Park Street': '70199', 'Boylston': '70159', 'Arlington': '70157', 'Copley': '70155', 'Prudential': '70239', 'Symphony': '70241', 'Northeastern University': '70243', 'Museum of Fine Arts': '70245', 'Longwood Medical Area': '70247', 'Brigham Circle': '70249', 'Fenwood Road': '70251', 'Mission Park': '70253', 'Riverway': '70255', 'Back of the Hill': '70257', 'Heath Street': '70260'},
    },
    {
        name: 'Blue',
        name_human_readable: 'Blue Line',
        stop_ids: {'Wonderland': '70059', 'Revere Beach': '70057', 'Beachmont': '70055', 'Suffolk Downs': '70053', 'Orient Heights': '70051', 'Wood Island': '70049', 'Airport': '70047', 'Maverick': '70045', 'Aquarium': '70043', 'State': '70041', 'Government Center': '70039', 'Bowdoin': '70838'},
    },
];

export {
    lines
};