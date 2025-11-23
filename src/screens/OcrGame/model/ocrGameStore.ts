import { create } from 'zustand'
import type { NameNumberPair } from '../lib/ocr'

type OcrGameState = {
	imageUri: string | null
	pairs: NameNumberPair[]
}

type OcrGameActions = {
	setOcrData: (payload: { imageUri: string; pairs: NameNumberPair[] }) => void
	resetOcrData: () => void
}

export const useOcrGameStore = create<OcrGameState & OcrGameActions>(set => ({
	imageUri: null,
	pairs: [],
	setOcrData: payload => set({ imageUri: payload.imageUri, pairs: payload.pairs }),
	resetOcrData: () => set({ imageUri: null, pairs: [] }),
}))
