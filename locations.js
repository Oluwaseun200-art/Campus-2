/*
 * SAMPLE CAMPUS NETWORK
 * Replace these illustrative connections and distances with verified campus data.
 * Each connection is bidirectional and its distance is in kilometres.
 */
window.CAMPUS_NETWORK = {
  locations: [
    { id: "main-gate", name: "University Main Gate" },
    { id: "senate", name: "Senate Building" },
    { id: "library", name: "Kenneth Dike Library" },
    { id: "tech", name: "Faculty of Technology" },
    { id: "arts", name: "Faculty of Arts" },
    { id: "mell", name: "Mellanby Hall" },
    { id: "student-union", name: "Student Union Building" }
  ],
  connections: [
    { from: "main-gate", to: "senate", distance: 1.2 },
    { from: "main-gate", to: "tech", distance: 1.8 },
    { from: "senate", to: "library", distance: 0.5 },
    { from: "senate", to: "arts", distance: 0.7 },
    { from: "library", to: "student-union", distance: 0.6 },
    { from: "arts", to: "student-union", distance: 0.8 },
    { from: "tech", to: "mell", distance: 1.1 },
    { from: "mell", to: "student-union", distance: 0.9 },
    { from: "library", to: "mell", distance: 1.4 }
  ]
};
