import { Device, MMKVStorage } from './schema'

export const device = new MMKVStorage<[], Device>({ id: 'device' })
