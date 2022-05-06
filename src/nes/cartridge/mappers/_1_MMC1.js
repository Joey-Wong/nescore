import Mapper from "./Mapper";
import { MemoryChunk, MemoryPadding } from "../../memory";
import { InMemoryRegister } from "../../registers";
import constants from "../../constants";
import _ from "lodash";

// TODO: FINISH

/**
 * It provides bank-switching for PRG and CHR ROM.
 * CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
 * CPU $8000-$BFFF: 16 KB PRG ROM bank, either switchable or fixed to the first bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, either fixed to the last bank or switchable
 * PPU $0000-$0FFF: 4 KB switchable CHR bank
 * PPU $1000-$1FFF: 4 KB switchable CHR bank
 * Through writes to the MMC1 control register, it is possible for the program to
 * swap the fixed and switchable PRG ROM banks or to set up 32 KB PRG bankswitching.
 */
export default class MMC1 extends Mapper {
	static get id() {
		return 1;
	}

	/** When a context is loaded. */
	onLoad({ cartridge }) {
		this.banks = _.range(0, cartridge.header.prgRomPages - 1).map((page) =>
			this._getProgramBytes(page)
		);

		const unused = new MemoryPadding(0x3fe0);
		const prgRomSelectedPage = new MemoryChunk(this.banks[0]);
		const prgRomLastPage = new MemoryChunk(
			this._getProgramBytes(cartridge.header.prgRomPages - 1)
		);

		this.defineChunks([
			//                      Address range   Size      Description
			unused, //              $4020-$7999     $3FE0     Unused space
			prgRomSelectedPage, //  $8000-$BFFF     $4000     PRG-ROM (16 KB switchable PRG-ROM bank)
			prgRomLastPage //       $C000-$FFFF     $4000     PRG-ROM (last 16 KB PRG ROM bank)
		]);
		this._chrRom = new MemoryChunk(cartridge.chrRom);
		this._prgRomSelectedPage = prgRomSelectedPage;

		prgRomSelectedPage.readOnly = true;
		prgRomLastPage.readOnly = true;
		this._chrRom.readOnly = !this.context.cartridge.usesChrRam;

		this.registers = {
			load: new LoadRegister(),
			control: new ControlRegister(),
			chrBank0Register: new CHRBank0Register(),
			chrBank1Register: new CHRBank1Register(),
			prgBankRegister: new PRGBankRegister()
		};
	}

	/** Maps a CPU write operation. */
	cpuWriteAt(address, byte) {
		if (address >= 0x8000) {
			const value = this.registers.load.write(byte);
			if (value == null) return;

			if (address >= 0x8000 && address < 0xa000) {
				this.registers.control.value = value;
			} else if (address >= 0xa000 && address < 0xc000) {
				this.registers.chrBank0Register.value = value;
			} else if (address >= 0xc000 && address < 0xe000) {
				this.registers.chrBank1Register.value = value;
			} else {
				this.registers.prgBankRegister.value = value;
			}

			// TODO: UPDATE MEMORY
		}

		this.context.cpu.memory.writeAt(address, byte);
	}

	/** Maps a PPU read operation. */
	ppuReadAt(address) {
		if (address >= 0x0000 && address < 0x2000)
			return this._chrRom.readAt(address);

		return this.context.ppu.memory.readAt(address);
	}

	/** Maps a PPU write operation. */
	ppuWriteAt(address, byte) {
		if (address >= 0x0000 && address < 0x2000)
			return this._chrRom.writeAt(address, byte);

		this.context.ppu.memory.writeAt(address, byte);
	}
}

/**
 * Load Register ($8000-$FFFF)
 * MMC1 has a quirk, where it will take 5 writes to collect all the bits for the actual write
 * that sets a bank. These 5 writes all are made to the Load register ($8000-$FFFF) that
 * consists of a shift register. Each write to the load register shifts the rightmost bit onto
 * said shift register, and on the 5th write, the whole shift register is evaluated.
 */
class LoadRegister {
	constructor() {
		this._value = 0;
		this._shiftRegister = 0;
		this._writeCounter = 0;
	}

	/** Writes a bit. Returns null 4 times, then the full value. */
	write(byte) {
		if (byte & 0b10000000) {
			// reset
			this._shiftRegister = 0b10000;
			this._writeCounter = 0;

			return null;
		} else {
			// shift 4 times, writing on the 5th

			const bit = byte & 1;
			this._shiftRegister = ((this._shiftRegister >> 1) | (bit << 4)) & 0b11111;
			this._writeCounter++;

			if (this._writeCounter === 5) {
				this._shiftRegister = 0;
				this._writeCounter = 0;
				return this._value;
			}

			return null;
		}
	}
}

/**
 * Control ($8000-$9FFF)
 * -----
 * CPPMM
 * |||||
 * |||++- Mirroring (0: one-screen, lower bank; 1: one-screen, upper bank;
 * |||               2: vertical; 3: horizontal)
 * |++--- PRG ROM bank mode (0, 1: switch 32 KB at $8000, ignoring low bit of bank number;
 * |                         2: fix first bank at $8000 and switch 16 KB bank at $C000;
 * |                         3: fix last bank at $C000 and switch 16 KB bank at $8000)
 * +----- CHR ROM bank mode (0: switch 8 KB at a time; 1: switch two separate 4 KB banks)
 */
class ControlRegister extends InMemoryRegister {
	constructor() {
		super();

		this.addField("mirroringId", 0, 2)
			.addField("prgRomBankMode", 2, 2)
			.addField("chrRomBankMode", 4);
	}

	/** Returns the mirroring type. */
	get mirroring() {
		switch (this.mirroringId) {
			case 0:
				return "ONE_SCREEN_LOWER_BANK";
			case 1:
				return "ONE_SCREEN_UPPER_BANK";
			case 2:
				return "VERTICAL";
			case 3:
			default:
				return "HORIZONTAL";
		}
	}

	/** Returns the selected size of a PRG ROM bank. */
	get prgRomBankSize() {
		return (this.prgRomBankMode <= 1 ? 32 : 16) * constants.KB;
	}

	/** Returns true if the first PRG ROM area ($8000-$BFFF) is switchable. Otherwise, it's fixed to first bank. */
	get isFirstPrgAreaSwitchable() {
		return this.prgRomBankMode !== 2;
	}

	/** Returns true if the second PRG ROM area ($C000-$FFFF) is switchable. Otherwise, it's fixed to last bank. */
	get isSecondPrgAreaSwitchable() {
		return this.prgRomBankMode !== 3;
	}

	/** Returns the selected size of a CHR ROM bank. */
	get chrRomBankSize() {
		return (this.chrRomBankMode === 0 ? 8 : 4) * constants.KB;
	}
}

/**
 * CHR bank 0 ($A000-$BFFF)
 * -----
 * CCCCC
 * |||||
 * +++++- Select 4 KB or 8 KB CHR bank at PPU $0000 (low bit ignored in 8 KB mode)
 */
class CHRBank0Register extends InMemoryRegister {}

/**
 * CHR bank 1 ($C000-$DFFF)
 * -----
 * CCCCC
 * |||||
 * +++++- Select 4 KB CHR bank at PPU $1000 (ignored in 8 KB mode)
 */
class CHRBank1Register extends InMemoryRegister {}

/**
 * PRG bank ($E000-$FFFF)
 * -----
 * RPPPP
 * |||||
 * |++++- Select 16 KB PRG ROM bank (low bit ignored in 32 KB mode)
 * +----- PRG RAM chip enable (0: enabled; 1: disabled)
 */
class PRGBankRegister extends InMemoryRegister {
	constructor() {
		super();

		this.addField("prgRomBankId", 0, 4).addField("prgRamEnable", 4);
	}
}