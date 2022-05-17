import { WithContext } from "../helpers";

/** The Audio Processing Unit. It generates audio samples. */
export default class APU {
	constructor() {
		WithContext.apply(this);
	}

	/** When a context is loaded. */
	onLoad(context) {
		this._reset();
		this.cycle = 0;
	}

	/** Executes the next operation (1 cycle). */
	step(onAudioSample) {
		// TODO: IMPLEMENT

		this.cycle++;
		const volume = 0.15;
		onAudioSample((Math.random() * 2 - 1) * volume);
	}

	_reset() {}
}
