

const bytesToGBAndMiddleConverter = (bytes: number) => {
    const NoDegitInBytes = bytes.toString().length
    const Units = [
        'b',
        'kb',
        'mb',
        'gb'
    ]
    const UnitMultipliers = [
        1,
        1024,
        1024 * 1024,
        1024 * 1024 * 1024,
        1024 * 1024 * 1024 * 1024
    ]
    return `${Math.round(bytes / UnitMultipliers[Math.floor(NoDegitInBytes / 4)] * 100) / 100} ${Units[Math.floor(NoDegitInBytes / 4)]}`
}

export default bytesToGBAndMiddleConverter