export function combine(buffers: Buffer[], delimiter: Buffer | string): Buffer {
    const d = Buffer.from(delimiter);

    const result = buffers.flatMap((buffer, index) => index < buffers.length - 1 ? [buffer, d] : buffer);
    return Buffer.concat(result);
}

export function split(buffer: Buffer, delimiter: Buffer | string): Buffer[] {
    const d = Buffer.from(delimiter);

    const result: Buffer[] = [];
    let position = 0;

    while (position < buffer.length) {
        let nextIndex = buffer.indexOf(d, position);

        if (nextIndex === -1) nextIndex = buffer.length;

        result.push(buffer.subarray(position, nextIndex));
        position = nextIndex + d.length;
    }
    return result;
}
