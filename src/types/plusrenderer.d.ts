declare module "@plusrenderer/renderer" {
    export class Renderer {
        static create(canvas: HTMLCanvasElement): Promise<Renderer>;
        loadPlayer(slot: number, slim: boolean): void;
        loadCosmetic(slot: number, json: string, bodySlot: string, image: ImageBitmap): void;
        loadCape(slot: number, still: ImageBitmap, sheet?: ImageBitmap, sheetName?: string): void;
        loadAnimation(slot: number, json: string): void;
        bundleParts(paths: string[]): [geometry: number, animation: number, texture: number, sheet: number];
        play(slot: number, at: number): void;
        clear(slot: number): void;
        setTexture(slot: number, image: TexImageSource): void;
        draw(camera: { yaw: number; pitch: number; distance: number; targetY: number }, seconds: number): void;
    }
}
