/** The editable shape of the site. */

export type Piece = {
  id: string;
  /** Roman numeral shown as the index */
  numeral: string;
  name: string;
  /** Short material line */
  material: string;
  /** One sentence, in the house voice */
  note: string;
  image: string;
};

export type SiteContent = {
  /** ISO 8601 with offset. Tentative until confirmed. */
  launchISO: string;
  countdownEnabled: boolean;
  pieces: Piece[];
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Not sure yet'] as const;

/**
 * The six. Working lineup — names, copy and imagery are all meant to be replaced once the real
 * run is confirmed. The Suit is first because it is the piece the film is about.
 */
export const PIECES: Piece[] = [
  {
    id: 'suit',
    numeral: 'I',
    name: 'The Audacity Suit',
    material: 'A classic white pinstripe double-breasted suit detailed with accent gold buttons and sharp lapels.',
    note: 'The whole argument in two pieces. Worn together for the room, split apart for everything after it.',
    image: '/images/product-1.jpeg',
  },
  {
    id: 'blazer',
    numeral: 'II',
    name: 'Out of the Blue Set',
    material: 'A navy blue sleeveless waistcoat co-ord set accented with asymmetric gold buttons.',
    note: 'A strong shoulder and a soft hand. Thrown over almost nothing, it does the work for you.',
    image: '/images/product-2.jpg',
  },
  {
    id: 'dinner-dress',
    numeral: 'III',
    name: 'Its a Wrap Suit',
    material: 'A chic deep maroon tailored suit featuring a unique keyhole cutout Mandarin collar blazer.',
    note: 'Floor-skimming and completely unbothered. The one piece in the run that raises its voice.',
    image: '/images/product-3.jpeg',
  },
  {
    id: 'trouser',
    numeral: 'IV',
    name: 'Thoda Teekha Vest',
    material: 'A modern beige buckled sleeveless vest.',
    note: 'High waist, endless line. Cut to be lived in rather than sat still in.',
    image: '/images/product-4.JPG',
  },
  {
    id: 'shirt',
    numeral: 'V',
    name: 'Waist of Time Suit',
    material: 'A sophisticated charcoal grey tailored pantsuit featuring a corset structured blazer waistline.',
    note: 'Oversized, half-tucked, sleeves pushed back. The most quietly useful thing in the run.',
    image: '/images/product-5.jpeg',
  },
  {
    id: 'coat',
    numeral: 'VI',
    name: 'The Soft Spoken Shirt',
    material: 'A crisp ivory button down tailored with a signature embroidered monogram along the placket and cuff.',
    note: 'Below the calf, collar up. Built for the walk between one version of the day and the next.',
    image: '/images/product-6.jpeg',
  },
];

export const CONTENT: SiteContent = {
  launchISO: '2026-08-30T11:00:00+05:30',
  countdownEnabled: true,
  pieces: PIECES,
};
