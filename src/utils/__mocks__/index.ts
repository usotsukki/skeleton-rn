jest.mock('@expo/vector-icons', () => {
	return {
		FontAwesome5: 'FontAwesome5',
		FontAwesome6: 'FontAwesome6',
		Ionicons: 'Ionicons',
	}
})

jest.mock('@expo/vector-icons/build/Entypo', () => 'Entypo')
