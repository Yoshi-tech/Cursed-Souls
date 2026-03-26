import Phaser from 'phaser';

type TileKind = 'floor' | 'moss' | 'water' | 'lava';

type TileDef = {
    id: string; // also the Phaser texture key
    kind: TileKind;
    weight: number;
};

type WFCCell = { options: string[]; collapsed: boolean };

export default class GameScene extends Phaser.Scene {
    private renderMode: 'static' | 'wfc' = 'wfc';

    private tilePx = 32;
    private isoStepY = 16;

    private tiles: TileDef[] = [
        { id: 'moss_1', kind: 'moss', weight: 1 },
        { id: 'moss_2', kind: 'moss', weight: 1 },
        { id: 'moss_3', kind: 'moss', weight: 1 },

        { id: 'floor_1', kind: 'floor', weight: 30 },
        { id: 'floor_2', kind: 'floor', weight: 30 },
        { id: 'floor_3', kind: 'floor', weight: 30 },

        { id: 'water_1', kind: 'water', weight: 4 },
        { id: 'water_2', kind: 'water', weight: 4 },
        { id: 'water_3', kind: 'water', weight: 4 },
        { id: 'water_4', kind: 'water', weight: 4 },

        { id: 'lava_1', kind: 'lava', weight: 3 },
        { id: 'lava_2', kind: 'lava', weight: 3 },
        { id: 'lava_3', kind: 'lava', weight: 3 },
        { id: 'lava_4', kind: 'lava', weight: 3 }
    ];

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('mapsrc', 'assets/mapsrc.png');

        this.load.image('moss_1', 'assets/moss_1.png');
        this.load.image('moss_2', 'assets/moss_2.png');
        this.load.image('moss_3', 'assets/moss_3.png');
        this.load.image('floor_1', 'assets/floor_1.png');
        this.load.image('floor_2', 'assets/floor_2.png');
        this.load.image('floor_3', 'assets/floor_3.png');
        this.load.image('water_1', 'assets/water_1.png');
        this.load.image('water_2', 'assets/water_2.png');
        this.load.image('water_3', 'assets/water_3.png');
        this.load.image('water_4', 'assets/water_4.png');
        this.load.image('lava_1', 'assets/lava_1.png');
        this.load.image('lava_2', 'assets/lava_2.png');
        this.load.image('lava_3', 'assets/lava_3.png');
        this.load.image('lava_4', 'assets/lava_4.png');
    }

    create() {
        this.cameras.main.setBounds(0, 0, 6000, 6000);
        this.cameras.main.centerOn(500, 300);
        this.enableCameraPanAndZoom();

        if (this.renderMode === 'static') {
            this.renderStaticMap();
            return;
        }

        const model = this.buildAdjacencyModel(this.tiles);
        const grid = this.generateWFCGridWeighted(60, 40, model);
        this.growClusters(grid);
        this.enforceMinClusterSize(grid, 6);
        this.renderIsometricSprites(grid);
    }

    private renderStaticMap() {
        const map = this.add.image(480, 300, 'mapsrc').setOrigin(0.5, 0.5);
        map.setDepth(1);
        this.add.text(10, 50, 'Static map: mapsrc.png', {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'serif'
        });
    }

    private buildAdjacencyModel(tiles: TileDef[]) {
        const byId = new Map<string, TileDef>(tiles.map(t => [t.id, t]));
        const ids = tiles.map(t => t.id);

        const canTouch = (a: TileDef, b: TileDef) => {
            // water can never border lava (either direction)
            if (a.kind === 'water' && b.kind === 'lava') return false;
            if (a.kind === 'lava' && b.kind === 'water') return false;

            // floor is base: can border anything not forbidden above
            if (a.kind === 'floor' || b.kind === 'floor') return true;

            // moss is a floor variant: only borders floor/moss (floor already handled above)
            if (a.kind === 'moss') return b.kind === 'moss';
            // At this point `a.kind` is not 'floor' and not 'moss' (so water/lava),
            // meaning moss can't touch it.
            if (b.kind === 'moss') return false;

            // otherwise, same-material clusters
            return a.kind === b.kind;
        };

        const allowedNeighbors: Record<string, string[]> = {};
        for (const aId of ids) {
            const a = byId.get(aId)!;
            allowedNeighbors[aId] = ids.filter(bId => canTouch(a, byId.get(bId)!));
        }

        const weights: Record<string, number> = {};
        for (const t of tiles) weights[t.id] = t.weight;

        return { ids, allowedNeighbors, weights };
    }

    private enableCameraPanAndZoom() {
        const cam = this.cameras.main;
        cam.setZoom(1);

        let dragging = false;
        let last = new Phaser.Math.Vector2();

        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            dragging = true;
            last.set(p.x, p.y);
        });

        this.input.on('pointerup', () => {
            dragging = false;
        });

        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!dragging) return;
            const dx = p.x - last.x;
            const dy = p.y - last.y;
            cam.scrollX -= dx / cam.zoom;
            cam.scrollY -= dy / cam.zoom;
            last.set(p.x, p.y);
        });

        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _go: unknown, _dx: number, dy: number) => {
            const zoomDelta = dy > 0 ? -0.1 : 0.1;
            cam.setZoom(Phaser.Math.Clamp(cam.zoom + zoomDelta, 0.5, 2.5));
        });
    }

    private growClusters(grid: WFCCell[][]) {
        const idToKind = new Map<string, TileKind>();
        const kindToIds = new Map<TileKind, string[]>();
        for (const t of this.tiles) {
            idToKind.set(t.id, t.kind);
            kindToIds.set(t.kind, [...(kindToIds.get(t.kind) ?? []), t.id]);
        }

        const floorIds = kindToIds.get('floor') ?? ['floor_1'];
        const waterIds = kindToIds.get('water') ?? ['water_1'];
        const lavaIds = kindToIds.get('lava') ?? ['lava_1'];

        const width = grid[0]?.length ?? 0;
        const height = grid.length;
        const dirs = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0]
        ] as const;

        const pick = (ids: string[]) => ids[Math.floor(Math.random() * ids.length)] || ids[0];

        const tryGrowKind = (kind: 'water' | 'lava', iterations: number, chance: number) => {
            const ids = kind === 'water' ? waterIds : lavaIds;
            const forbidden = kind === 'water' ? 'lava' : 'water';

            for (let it = 0; it < iterations; it++) {
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const id = grid[y][x].options[0];
                        if (idToKind.get(id) !== kind) continue;
                        if (Math.random() > chance) continue;

                        const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                        const nid = grid[ny][nx].options[0];
                        const nk = idToKind.get(nid);
                        if (nk !== 'floor' && nk !== 'moss') continue;

                        // Don't grow into a cell adjacent to the forbidden kind.
                        let touchesForbidden = false;
                        for (const [adx, ady] of dirs) {
                            const ax = nx + adx;
                            const ay = ny + ady;
                            if (ax < 0 || ay < 0 || ax >= width || ay >= height) continue;
                            const aid = grid[ay][ax].options[0];
                            if (idToKind.get(aid) === forbidden) {
                                touchesForbidden = true;
                                break;
                            }
                        }
                        if (touchesForbidden) continue;

                        grid[ny][nx].options = [pick(ids)];
                        grid[ny][nx].collapsed = true;
                    }
                }
            }
        };

        // Light growth to turn speckles into blobs.
        tryGrowKind('water', 2, 0.25);
        tryGrowKind('lava', 2, 0.22);

        // Normalize any moss that ended up surrounded by non-floor into floor (keeps moss as floor speckle).
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const id = grid[y][x].options[0];
                if (idToKind.get(id) !== 'moss') continue;
                let ok = false;
                for (const [dx, dy] of dirs) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const nid = grid[ny][nx].options[0];
                    if (idToKind.get(nid) === 'floor' || idToKind.get(nid) === 'moss') {
                        ok = true;
                        break;
                    }
                }
                if (!ok) {
                    grid[y][x].options = [pick(floorIds)];
                    grid[y][x].collapsed = true;
                }
            }
        }
    }

    private enforceMinClusterSize(grid: WFCCell[][], minSize: number) {
        const idToKind = new Map<string, TileKind>();
        const floorIds = this.tiles.filter(t => t.kind === 'floor').map(t => t.id);
        for (const t of this.tiles) idToKind.set(t.id, t.kind);

        const width = grid[0]?.length ?? 0;
        const height = grid.length;
        const dirs = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0]
        ] as const;

        const pickFloor = () => floorIds[Math.floor(Math.random() * floorIds.length)] || 'floor_1';

        const visited = new Set<string>();
        const keyOf = (x: number, y: number) => `${x},${y}`;

        const flood = (sx: number, sy: number, kind: TileKind) => {
            const q: [number, number][] = [[sx, sy]];
            const cells: [number, number][] = [];
            visited.add(keyOf(sx, sy));

            while (q.length) {
                const [x, y] = q.pop()!;
                cells.push([x, y]);
                for (const [dx, dy] of dirs) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const k = keyOf(nx, ny);
                    if (visited.has(k)) continue;
                    const nid = grid[ny][nx].options[0];
                    if (idToKind.get(nid) !== kind) continue;
                    visited.add(k);
                    q.push([nx, ny]);
                }
            }
            return cells;
        };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const id = grid[y][x].options[0];
                const kind = idToKind.get(id);
                if (kind !== 'water' && kind !== 'lava') continue;
                const k = keyOf(x, y);
                if (visited.has(k)) continue;

                const component = flood(x, y, kind);
                if (component.length < minSize) {
                    for (const [cx, cy] of component) {
                        grid[cy][cx].options = [pickFloor()];
                        grid[cy][cx].collapsed = true;
                    }
                }
            }
        }
    }

    private generateWFCGridWeighted(
        width: number,
        height: number,
        model: { ids: string[]; allowedNeighbors: Record<string, string[]>; weights: Record<string, number> }
    ): WFCCell[][] {
        const allTiles = model.ids;
        const grid: WFCCell[][] = [];

        for (let y = 0; y < height; y++) {
            const row: WFCCell[] = [];
            for (let x = 0; x < width; x++) row.push({ options: [...allTiles], collapsed: false });
            grid.push(row);
        }

        let iterations = 0;
        const maxIterations = 15000;

        while (iterations < maxIterations) {
            const choice = this.getLowestEntropyCell(grid, width, height);
            if (!choice) break;

            const cell = grid[choice.y][choice.x];
            const pick = this.weightedPick(cell.options, model.weights);
            cell.options = [pick];
            cell.collapsed = true;

            const ok = this.propagate(grid, choice.x, choice.y, model.allowedNeighbors, width, height);
            if (!ok) return this.generateWFCGridWeighted(width, height, model);

            iterations++;
        }

        return grid;
    }

    private getLowestEntropyCell(
        grid: WFCCell[][],
        width: number,
        height: number
    ): { x: number; y: number; entropy: number } | null {
        const candidates: { x: number; y: number; entropy: number }[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = grid[y][x];
                if (!cell.collapsed && cell.options.length > 0) {
                    candidates.push({ x, y, entropy: cell.options.length });
                }
            }
        }

        if (candidates.length === 0) return null;
        candidates.sort((a, b) => a.entropy - b.entropy);
        const minEntropy = candidates[0].entropy;
        const filtered = candidates.filter(c => c.entropy === minEntropy);
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    private weightedPick(options: string[], weights: Record<string, number>) {
        let sum = 0;
        for (const o of options) sum += Math.max(0, weights[o] ?? 1);
        let r = Math.random() * sum;
        for (const o of options) {
            r -= Math.max(0, weights[o] ?? 1);
            if (r <= 0) return o;
        }
        return options[options.length - 1];
    }

    private propagate(
        grid: WFCCell[][],
        x: number,
        y: number,
        allowedNeighbors: Record<string, string[]>,
        width: number,
        height: number
    ): boolean {
        const stack: [number, number][] = [[x, y]];
        const visited = new Set<string>();

        while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            const key = `${cx},${cy}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const baseTile = grid[cy][cx].options[0];
            const validNeighbors = allowedNeighbors[baseTile] || [];

            const neighbors = [
                [cx, cy - 1],
                [cx + 1, cy],
                [cx, cy + 1],
                [cx - 1, cy]
            ];

            for (const [nx, ny] of neighbors) {
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                const neighbor = grid[ny][nx];
                if (neighbor.collapsed) continue;

                const newOptions = neighbor.options.filter(opt => validNeighbors.includes(opt));
                if (newOptions.length === 0) return false;

                if (newOptions.length < neighbor.options.length) {
                    neighbor.options = newOptions;
                    if (neighbor.options.length === 1) {
                        neighbor.collapsed = true;
                        stack.push([nx, ny]);
                    }
                }
            }
        }

        return true;
    }

    private renderIsometricSprites(grid: WFCCell[][]) {
        const originX = 480;
        const originY = 270;
        const sprites: Phaser.GameObjects.Image[] = [];

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const tileId = grid[y][x].options[0];
                if (!tileId) continue;

                const worldX = x * this.tilePx;
                const worldY = y * this.tilePx;

                const isoX = (worldX - worldY) * 0.5;
                const isoY = (worldX + worldY) * (this.isoStepY / this.tilePx);

                const img = this.add.image(originX + isoX, originY + isoY, tileId).setOrigin(0.5, 1);
                img.setDepth(isoY);
                sprites.push(img);
            }
        }

        sprites.sort((a, b) => a.depth - b.depth);
    }
}