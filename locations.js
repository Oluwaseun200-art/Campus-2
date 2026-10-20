/*
 * Prototype location/route data.
 * Coordinates and segment distances are illustrative starter values, not official
 * University of Ibadan GIS/transport data. Verify with campus authorities before use.
 */
const CAMPUS_LOCATIONS = [
 {id:"ui-gate",name:"UI Main Gate",category:"transport",description:"Main campus entrance",lat:7.4436,lng:3.9007,icon:"⌂"},
 {id:"admin",name:"Administrative Building",category:"service",description:"Central administration area",lat:7.4418,lng:3.8979,icon:"▤"},
 {id:"ken-anthony",name:"Kenneth Dike Library",category:"academic",description:"University library",lat:7.4396,lng:3.8986,icon:"▥"},
 {id:"arts",name:"Faculty of Arts",category:"academic",description:"Faculty and lecture areas",lat:7.4411,lng:3.8945,icon:"✎"},
 {id:"science",name:"Faculty of Science",category:"academic",description:"Science teaching and research area",lat:7.4380,lng:3.8954,icon:"⚗"},
 {id:"tech",name:"Faculty of Technology",category:"academic",description:"Engineering and technology area",lat:7.4364,lng:3.8929,icon:"⚙"},
 {id:"ucj",name:"University Health Centre",category:"service",description:"Campus health services",lat:7.4347,lng:3.9001,icon:"＋"},
 {id:"sport",name:"Sports Centre",category:"service",description:"Sports and recreation area",lat:7.4340,lng:3.8941,icon:"⚽"},
 {id:"independence",name:"Independence Hall",category:"residential",description:"Student residence area",lat:7.4364,lng:3.9015,icon:"⌂"},
 {id:"queen-idia",name:"Queen Idia Hall",category:"residential",description:"Student residence area",lat:7.4390,lng:3.9041,icon:"⌂"},
 {id:"mell",name:"Mellanby Hall",category:"residential",description:"Student residence area",lat:7.4426,lng:3.9028,icon:"⌂"},
 {id:"student-union",name:"Student Union Building",category:"service",description:"Student activities and services",lat:7.4402,lng:3.9021,icon:"♧"},
 {id:"zoology",name:"Zoology Department",category:"academic",description:"Departmental area",lat:7.4373,lng:3.8980,icon:"⌬"},
 {id:"bookshop",name:"University Bookshop",category:"service",description:"Books and campus supplies",lat:7.4422,lng:3.9003,icon:"▣"},
 {id:"transit-hub",name:"Campus Transport Point",category:"transport",description:"Illustrative transport interchange",lat:7.4406,lng:3.8992,icon:"▰"}
];

/* Edges are bidirectional. Costs are approximate demo kilometres. */
const CAMPUS_CONNECTIONS = [
 ["ui-gate","admin",0.45],["ui-gate","bookshop",0.25],["ui-gate","mell",0.38],
 ["admin","ken-anthony",0.32],["admin","arts",0.42],["admin","transit-hub",0.22],
 ["bookshop","mell",0.28],["bookshop","transit-hub",0.24],["mell","queen-idia",0.48],
 ["queen-idia","student-union",0.42],["student-union","transit-hub",0.20],
 ["student-union","ken-anthony",0.30],["ken-anthony","arts",0.38],
 ["ken-anthony","science",0.46],["arts","science",0.55],["arts","tech",0.62],
 ["science","zoology",0.28],["zoology","ucj",0.42],["science","sport",0.55],
 ["sport","independence",0.70],["independence","ucj",0.48],
 ["independence","tech",0.62],["transit-hub","zoology",0.52],
 ["transit-hub","queen-idia",0.44],["science","tech",0.36],["sport","tech",0.52]
];
