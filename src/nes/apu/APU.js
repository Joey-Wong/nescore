import { APURegisterSegment } from "./registers";
import Oscillator from "./synthesis/Oscillator";
import constants from "../constants";
import { WithContext, Byte } from "../helpers";

/** The Audio Processing Unit. It generates audio samples. */
export default class APU {
	constructor() {
		WithContext.apply(this);

		this.oscillator = new Oscillator();
		this.oscillator2 = new Oscillator();

		this.registers = null;
		this.clockCounter = 0;
		this.frameClockCounter = 0;
	}

	/** When a context is loaded. */
	onLoad(context) {
		this.registers = new APURegisterSegment(context);

		this._reset();

		// TODO: REMOVE
		this.cycle = 0;
		this.count = 0;
		this.time = 0;
	}

	/**
	 * Executes the next step (1 step = 1 PPU cycle = 0.16 APU cycles).
	 * It calls `onAudioSample` when it successfully generates a new sample.
	 */
	step(onAudioSample) {
		if (this.clockCounter % constants.PPU_CYCLES_PER_APU_CYCLE === 0) {
			this.frameClockCounter++;

			const isQuarter =
				this.frameClockCounter === 3729 ||
				this.frameClockCounter === 7457 ||
				this.frameClockCounter === 11186 ||
				this.frameClockCounter === 14916;
			const isHalf =
				this.frameClockCounter === 7457 || this.frameClockCounter === 14916;
			const isEnd = this.frameClockCounter === 14916;

			if (isEnd) this.frameClockCounter = 0;

			// quarter frame "beats" adjust the volume envelope
			if (isQuarter) {
				// pulse1_env.clock(pulse1_halt);
				// pulse2_env.clock(pulse2_halt);
				// noise_env.clock(noise_halt);
			}

			// half frame "beats" adjust the note length and frequency sweepers
			if (isHalf) {
				// pulse1_lc.clock(pulse1_enable, pulse1_halt);
				// pulse2_lc.clock(pulse2_enable, pulse2_halt);
				// noise_lc.clock(noise_enable, noise_halt);
				// pulse1_sweep.clock(pulse1_seq.reload, 0);
				// pulse2_sweep.clock(pulse2_seq.reload, 1);
			}

			// DISABLED
			// pulse1_osc.frequency = 1789773.0 / (16.0 * (double)(pulse1_seq.reload + 1));
			// pulse1_osc.amplitude = (double)(pulse1_env.output -1) / 16.0;
			// pulse1_sample = pulse1_osc.sample(dGlobalTime);

			// new sample
			this.count++; // TODO?
			this.time += 1 / 44100;
			const fCPU = 1789773; // from nesdev: f = CPU / (16 * (t + 1))

			const timer1 = Byte.to16Bit(
				this.registers.pulses[0].lclTimerHigh.timerHigh,
				this.registers.pulses[0].timerLow.value
			);
			this.oscillator.amplitude = 0.15;
			this.oscillator.harmonics = 20;
			this.oscillator.dutyCycle =
				this.registers.pulses[0].control.dutyCycle === 0
					? 0.125
					: this.registers.pulses[0].control.dutyCycle === 1
					? 0.25
					: this.registers.pulses[0].control.dutyCycle === 2
					? 0.5
					: 0.75;
			this.oscillator.frequency = fCPU / (16 * (timer1 + 1));
			const sample1 = this.oscillator.sample(this.time);

			const timer2 = Byte.to16Bit(
				this.registers.pulses[1].lclTimerHigh.timerHigh,
				this.registers.pulses[1].timerLow.value
			);
			this.oscillator2.amplitude = 0.15;
			this.oscillator2.harmonics = 20;
			this.oscillator2.dutyCycle =
				this.registers.pulses[1].control.dutyCycle === 0
					? 0.125
					: this.registers.pulses[1].control.dutyCycle === 1
					? 0.25
					: this.registers.pulses[1].control.dutyCycle === 2
					? 0.5
					: 0.75;
			this.oscillator2.frequency = fCPU / (16 * (timer2 + 1));
			const sample2 = this.oscillator2.sample(this.time);

			onAudioSample(0.5 * (sample1 + sample2));

			// if (pulse1_lc.counter > 0 && pulse1_seq.timer >= 8 && !pulse1_sweep.mute && pulse1_env.output > 2)
			// 	pulse1_output += (pulse1_sample - pulse1_output) * 0.5;
			// else
			// 	pulse1_output = 0;
		}

		// Frequency sweepers change at high frequency
		// pulse1_sweep.track(pulse1_seq.reload);
		// pulse2_sweep.track(pulse2_seq.reload);

		this.clockCounter++;

		// TODO: IMPLEMENT

		// 5369318 steps per second
		// 5369318 / 44100 = 121.75 (generate a sample every 121 cycles)

		// this.cycle++;
		// if (this.cycle >= 121) {
		// 	this.cycle = 0;
		// 	this.count++;
		// }

		// if (this.cycle === 0) {
		// 	const time = this.count / 44100;

		// 	this.oscillator.amplitude = 0.15;
		// 	this.oscillator.harmonics = 20;
		// 	this.oscillator.dutyCycle = 0.5;
		// 	this.oscillator.frequency = 440;

		// 	const sample = this.oscillator.sample(time);
		// 	onAudioSample(sample);
		// }
	}

	_reset() {
		this.clockCounter = 0;
		this.frameClockCounter = 0;
	}
}
