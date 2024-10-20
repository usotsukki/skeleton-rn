import axios from 'axios'

const BASE_URL = 'https://icanhazdadjoke.com/'

interface JokeResponse {
	id: string
	joke: string
	status: number
}

export const fetchRandomJoke = async (): Promise<JokeResponse> => {
	const res = await axios.get(BASE_URL, {
		headers: {
			Accept: 'application/json',
		},
	})
	return res.data
}
