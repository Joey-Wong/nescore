export default function(context, parameter, canTakeExtraCycles) {
	const address = this.getAddress(context, parameter, canTakeExtraCycles);
	return context.memoryBus.cpu.readAt(address);
}
