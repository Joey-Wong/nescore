import React, { Component } from "react";
import { Buffer } from "buffer";
import Screen from "./Screen";
import FrameTimer from "../emulator/FrameTimer";
import NES from "../../nes";
/*import NESTestLogger from "../../nes/loggers/NESTestLogger";*/
import debug from "../emulator/debug";

export default class Emulator extends Component {
	render() {
		return (
			<Screen
				ref={(screen) => {
					if (screen) this._initialize(screen);
				}}
			/>
		);
	}

	start() {
		if (this.frameTimer) this.frameTimer.start();
	}

	stop() {
		if (this.frameTimer) this.frameTimer.stop();
	}

	frame() {
		try {
			const frameBuffer = this.nes.frame();
			this.screen.setBuffer(frameBuffer);
		} catch (e) {
			this._onError(e);
		}
	}

	componentWillUnmount() {
		this.stop();
	}

	_initialize(screen) {
		const { rom /*, onLog*/ } = this.props;
		if (!rom) return;
		const bytes = Buffer.from(rom);

		this.stop();

		// TODO: Logger decreases performance and crashes SMB. Fix.
		/*const logger = new NESTestLogger();*/
		this.screen = screen;
		this.nes = new NES(/*logger*/);
		this.frameTimer = new FrameTimer(() => {
			this.frame();
			// onLog(logger.lastLog);
		});

		try {
			this.nes.load(bytes);
		} catch (e) {
			this._onError(e);
		}

		// DEBUG
		window.debug = debug(this);
	}

	_onError(e) {
		this.props.onError(e);
		this.stop();
	}
}
