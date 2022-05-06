const KB = 1024;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const TILE_LENGTH = 8;
const ATTRIBUTE_TABLE_BLOCK_SIZE = 32;
const ATTRIBUTE_TABLE_REGION_SIZE = 16;

export default {
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	TOTAL_PIXELS: SCREEN_WIDTH * SCREEN_HEIGHT,
	BUTTONS: 8,
	KB,

	ROM_MAGIC_NUMBER: "NES",
	ROM_HEADER_SIZE: 16,
	ROM_TRAINER_SIZE: 512,
	PRG_ROM_PAGE_SIZE: 16 * KB,
	CHR_ROM_PAGE_SIZE: 8 * KB,
	CHR_RAM_PAGES: 1,
	CARTRIDGE_RAM_SIZE: 8 * KB,

	PPU_CYCLES_PER_CPU_CYCLE: 3,

	CPU_ADDRESSED_MEMORY: 64 * KB,
	CPU_ADDRESSED_MAPPER_SIZE: 0xbfe0,

	PPU_ADDRESSED_PALETTE_RAM_START_ADDRESS: 0x3f00,
	PPU_CYCLE_CLEAR_FLAGS: 1,
	PPU_CYCLE_VBLANK: 1,

	PPU_OAM_SIZE: 256,
	PPU_LAST_CYCLE: 340,
	PPU_LAST_SCANLINE: 260,
	PPU_RENDER_BACKGROUND_CYCLE: 256,
	PPU_RENDER_SPRITES_CYCLE: 257,
	OAMDMA_CYCLES: 513,

	TILE_LENGTH,
	TILE_SIZE: 16,
	SPRITE_WIDTH: 8,
	SPRITE_SIZE: 4,
	MAX_SPRITES: 64,
	MAX_SPRITES_PER_SCANLINE: 8,
	COLOR_TRANSPARENT: 0,

	NAME_TABLES_START_ADDRESS: 0x2000,
	NAME_TABLE_TOTAL_TILES_X: SCREEN_WIDTH / TILE_LENGTH,
	NAME_TABLE_MATRIX_LENGTH: 2,
	NAME_TABLE_SIZE: 1024,

	ATTRIBUTE_TABLE_BLOCK_SIZE,
	ATTRIBUTE_TABLE_TOTAL_BLOCKS_X: SCREEN_WIDTH / ATTRIBUTE_TABLE_BLOCK_SIZE,
	ATTRIBUTE_TABLE_REGION_SIZE,
	ATTRIBUTE_TABLE_TOTAL_REGIONS_X:
		ATTRIBUTE_TABLE_BLOCK_SIZE / ATTRIBUTE_TABLE_REGION_SIZE,
	ATTRIBUTE_TABLE_REGION_SIZE_BITS: 2,
	ATTRIBUTE_TABLE_SIZE: 64,

	PATTERN_TABLES_START_ADDRESS: 0x0000,
	PATTERN_TABLE_SIZE: 0x1000,
	PALETTE_BACKGROUND_START: 0,
	PALETTE_FOREGROUND_START: 4,
	PALETTE_SIZE: 4,

	SPRITE_BYTE_Y: 0,
	SPRITE_BYTE_TILE_ID: 1,
	SPRITE_BYTE_ATTRIBUTES: 2,
	SPRITE_BYTE_X: 3,
	SPRITE_ATTR_PALETTE_BITS_START: 0,
	SPRITE_ATTR_PALETTE_BITS_SIZE: 2,
	SPRITE_ATTR_PRIORITY_BIT: 5,
	SPRITE_ATTR_HORIZONTAL_FLIP_BIT: 6,
	SPRITE_ATTR_VERTICAL_FLIP_BIT: 7,
	SPRITE_8x16_PATTERN_TABLE_MASK: 0b1,
	SPRITE_8x16_TILE_ID_MASK: 0xfe,

	NESTEST_PATH: "./public/testroms/nestest.nes"
};