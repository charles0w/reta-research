export const RECIPIENT_ADDRESS = "0x74e9af21c6060328371b3813689b472132f89cbd";

export const SQUARE_APP_ID = process.env.REACT_APP_SQUARE_APP_ID || '';
export const SQUARE_LOCATION_ID = process.env.REACT_APP_SQUARE_LOCATION_ID || '';

export const products = [
  { id: 1, name: "Retatrutide 5mg",  purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 50.00,  stock: true },
  { id: 2, name: "Retatrutide 10mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 85.00,  stock: true },
  { id: 3, name: "Retatrutide 15mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 100.00, stock: true },
];

export const researchFindings = [
  "Changes in body weight over the course of structured studies",
  "Modulation of appetite-related signaling",
  "Alterations in glucose and insulin-related markers",
  "Increased metabolic activity through multi-pathway receptor engagement",
];

export const faqs = [
  { q: "What is Retatrutide (LY3437943)?", a: "Retatrutide is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation." },
  { q: "What observations have been reported in published findings?", a: "In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers." },
  { q: "Is this product for human consumption?", a: "No. This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications." },
  { q: "Who can purchase?", a: "Products are available to qualified researchers, academic institutions, and licensed laboratories. By placing an order you confirm your purchase is solely for legitimate research purposes." },
];

export const SUB_TIERS = [
  { key: "quarterly", name: "Quarterly",  cadence: "Every 3 months",  discount: 0.05, popular: false },
  { key: "bimonthly", name: "Bi-monthly", cadence: "Every 2 months",  discount: 0.10, popular: true  },
  { key: "monthly",   name: "Monthly",    cadence: "Every month",     discount: 0.15, popular: false },
];

export const PARTICLES = [
  { id: 0,  size: 1.5, left: 3,  delay: 0,    dur: 10 },
  { id: 1,  size: 1,   left: 8,  delay: 2,    dur: 12 },
  { id: 2,  size: 2,   left: 13, delay: 5,    dur: 9  },
  { id: 3,  size: 1.2, left: 18, delay: 1,    dur: 14 },
  { id: 4,  size: 2.5, left: 23, delay: 3,    dur: 11 },
  { id: 5,  size: 1,   left: 28, delay: 7,    dur: 13 },
  { id: 6,  size: 1.8, left: 33, delay: 0.5,  dur: 10 },
  { id: 7,  size: 3,   left: 38, delay: 4,    dur: 15 },
  { id: 8,  size: 1.5, left: 43, delay: 8,    dur: 11 },
  { id: 9,  size: 2,   left: 48, delay: 2.5,  dur: 12 },
  { id: 10, size: 1,   left: 53, delay: 6,    dur: 9  },
  { id: 11, size: 2.5, left: 58, delay: 1.5,  dur: 14 },
  { id: 12, size: 1.8, left: 63, delay: 9,    dur: 10 },
  { id: 13, size: 1,   left: 68, delay: 3.5,  dur: 13 },
  { id: 14, size: 2,   left: 73, delay: 0,    dur: 11 },
  { id: 15, size: 3,   left: 78, delay: 5,    dur: 15 },
  { id: 16, size: 1.5, left: 83, delay: 7.5,  dur: 12 },
  { id: 17, size: 1,   left: 88, delay: 2,    dur: 10 },
  { id: 18, size: 2,   left: 93, delay: 4.5,  dur: 14 },
  { id: 19, size: 1.5, left: 97, delay: 1,    dur: 11 },
  { id: 20, size: 3.5, left: 6,  delay: 6,    dur: 16 },
  { id: 21, size: 2.5, left: 15, delay: 3,    dur: 13 },
  { id: 22, size: 4,   left: 25, delay: 8,    dur: 18 },
  { id: 23, size: 2,   left: 35, delay: 1,    dur: 11 },
  { id: 24, size: 3,   left: 45, delay: 5,    dur: 15 },
  { id: 25, size: 2.5, left: 55, delay: 0,    dur: 12 },
  { id: 26, size: 3.5, left: 65, delay: 7,    dur: 16 },
  { id: 27, size: 2,   left: 75, delay: 3.5,  dur: 13 },
  { id: 28, size: 4,   left: 85, delay: 9,    dur: 18 },
  { id: 29, size: 3,   left: 95, delay: 2,    dur: 14 },
  { id: 30, size: 1,   left: 10, delay: 10,   dur: 9  },
  { id: 31, size: 2,   left: 20, delay: 11,   dur: 12 },
  { id: 32, size: 1.5, left: 30, delay: 12,   dur: 10 },
  { id: 33, size: 2.5, left: 40, delay: 9.5,  dur: 13 },
  { id: 34, size: 1,   left: 50, delay: 10.5, dur: 11 },
  { id: 35, size: 2,   left: 60, delay: 11.5, dur: 14 },
  { id: 36, size: 1.5, left: 70, delay: 8.5,  dur: 10 },
  { id: 37, size: 3,   left: 80, delay: 4,    dur: 15 },
  { id: 38, size: 1,   left: 90, delay: 6,    dur: 12 },
  { id: 39, size: 2,   left: 50, delay: 13,   dur: 11 },
  { id: 40, size: 1.5, left: 22, delay: 14,   dur: 13 },
  { id: 41, size: 2.5, left: 44, delay: 15,   dur: 16 },
  { id: 42, size: 1,   left: 66, delay: 12.5, dur: 9  },
  { id: 43, size: 3,   left: 77, delay: 11,   dur: 17 },
  { id: 44, size: 2,   left: 89, delay: 13.5, dur: 12 },
];
