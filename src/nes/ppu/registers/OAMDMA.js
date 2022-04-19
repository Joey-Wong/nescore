import { InMemoryRegister } from "../../registers";

/**
 * OAM DMA Register (> write)
 *
 * Writing XX here will upload 256 bytes of data from CPU page $XX00-$XXFF to the internal PPU OAM.
 */
export default class OAMDMA extends InMemoryRegister {
	/** Reads nothing (write-only address). */
	readAt() {
		return 0;
	}
}
