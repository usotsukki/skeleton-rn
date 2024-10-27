import { useQuery } from '@tanstack/react-query'
import { fetchRandomJoke } from '@app/api/jokes'

const useJokes = () => {
	return useQuery({
		queryKey: ['joke'],
		queryFn: fetchRandomJoke,
		refetchOnReconnect: 'always',
		experimental_prefetchInRender: true,
	})
}

export default useJokes
