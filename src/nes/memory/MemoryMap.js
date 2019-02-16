import WithComposedMemory from "./WithComposedMemory";
import MemoryChunk from "./MemoryChunk";
import { WithContext } from "../helpers";
import { Buffer } from "buffer";

const KB = 1024;
const RAM_SIZE = 2 * KB;

/** The whole system's memory. It handles absolute addresses. */
export default class MemoryḾap {
	constructor() {
		WithContext.apply(this);
		WithComposedMemory.apply(this);
	}

	/** When a context is loaded. */
	onLoad(context) {
		const ramBytes = Buffer.alloc(RAM_SIZE);

		this.defineChunks([
			new MemoryChunk(ramBytes),
			new MemoryChunk(ramBytes, 0x0800),
			new MemoryChunk(ramBytes, 0x1000),
			new MemoryChunk(ramBytes, 0x1800),
			new MemoryChunk(Buffer.alloc(0x2000), 0x2000), // PPU registers
			new MemoryChunk(Buffer.alloc(0x0018), 0x4000), // APU and I/O registers
			new MemoryChunk(Buffer.alloc(0x0008), 0x4018), // APU and I/O functionality that is normally disabled
			context.cartridge
		]);
	}

	/** When the current context is unloaded. */
	onUnload() {
		this.defineChunks(null);
		this.chunks = null;
	}
}
