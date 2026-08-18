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
 * The seven. Working lineup — names, copy and imagery are all meant to be replaced once the real
 * run is confirmed. The Suit is first because it is the piece the film is about.
 */
export const PIECES: Piece[] = [
  {
    id: 'suit',
    numeral: 'I',
    name: 'The Suit',
    material: 'Plum wool, gold crest buttons',
    note: 'The whole argument in two pieces. Worn together for the room, split apart for everything after it.',
    image: '/images/piece-suit.jpg',
  },
  {
    id: 'blazer',
    numeral: 'II',
    name: 'The Blazer',
    material: 'Cream wool, single button',
    note: 'A strong shoulder and a soft hand. Thrown over almost nothing, it does the work for you.',
    image: '/images/piece-blazer.jpg',
  },
  {
    id: 'dinner-dress',
    numeral: 'III',
    name: 'The Dinner Dress',
    material: 'Oxblood column, high neck',
    note: 'Floor-skimming and completely unbothered. The one piece in the run that raises its voice.',
    image: '/images/piece-dinner-dress.jpg',
  },
  {
    id: 'trouser',
    numeral: 'IV',
    name: 'The Trouser',
    material: 'Espresso wide-leg, sharp crease',
    note: 'High waist, endless line. Cut to be lived in rather than sat still in.',
    image: '/images/piece-trouser.jpg',
  },
  {
    id: 'shirt',
    numeral: 'V',
    name: 'The Shirt',
    material: 'Ivory poplin, deep cuff',
    note: 'Oversized, half-tucked, sleeves pushed back. The most quietly useful thing in the run.',
    image: '/images/piece-shirt.jpg',
  },
  {
    id: 'coat',
    numeral: 'VI',
    name: 'The Coat',
    material: 'Sand wool, belted',
    note: 'Below the calf, collar up. Built for the walk between one version of the day and the next.',
    image: '/images/piece-coat.jpg',
  },
  {
    id: 'waistcoat',
    numeral: 'VII',
    name: 'The Waistcoat',
    material: 'Tailored, worn alone',
    note: 'Nothing over it, nothing needed. Sharp-edged and deliberately unfinished.',
    image: '/images/piece-waistcoat.jpg',
  },
];

export const CONTENT: SiteContent = {
  launchISO: '2026-08-30T11:00:00+05:30',
  countdownEnabled: true,
  pieces: PIECES,
};
