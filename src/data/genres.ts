export interface Genre {
  id: string;
  name: string;
  x: number; // 0 to 100 (e.g., brightness/energy)
  y: number; // 0 to 100 (e.g., organic/electronic)
  popularity: number; // 0 to 100
  connections: string[]; // IDs of related genres
}

export const GENRES: Genre[] = [
  { id: '1', name: 'SYNTHWAVE', x: 80, y: 90, popularity: 75, connections: ['2'] },
  { id: '2', name: 'RETROWAVE', x: 85, y: 85, popularity: 60, connections: ['12'] },
  { id: '3', name: 'LO-FI', x: 20, y: 30, popularity: 90, connections: ['4'] },
  { id: '4', name: 'CHILLHOP', x: 25, y: 25, popularity: 80, connections: ['5'] },
  { id: '5', name: 'BOSSA NOVA', x: 40, y: 15, popularity: 70, connections: ['6'] },
  { id: '6', name: 'SAMBA', x: 45, y: 10, popularity: 65, connections: ['9'] },
  { id: '7', name: 'MATH ROCK', x: 60, y: 50, popularity: 55, connections: ['8'] },
  { id: '8', name: 'MIDWEST EMO', x: 55, y: 45, popularity: 65, connections: ['13'] },
  { id: '9', name: 'JAZZ', x: 50, y: 20, popularity: 95, connections: ['10'] },
  { id: '10', name: 'MODAL JAZZ', x: 55, y: 25, popularity: 40, connections: [] },
  { id: '11', name: 'HARD BOP', x: 45, y: 25, popularity: 45, connections: [] },
  { id: '12', name: 'FUTURE FUNK', x: 90, y: 80, popularity: 50, connections: ['15'] },
  { id: '13', name: 'AFROBEAT', x: 70, y: 30, popularity: 85, connections: ['14'] },
  { id: '14', name: 'HIGHLIFE', x: 65, y: 25, popularity: 40, connections: ['11'] },
  { id: '15', name: 'TECHNO', x: 95, y: 95, popularity: 90, connections: ['16'] },
  { id: '16', name: 'INDUSTRIAL', x: 90, y: 98, popularity: 70, connections: ['3'] },
];
