import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import foodData from '../foodItems.json'

const SearchScreen = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expirationDays, setExpirationDays] = useState('');

    const handleSearch = (text) => {
        setQuery(text);
        if (text) {
            const results = foodData.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(results);
        } else {
            setFilteredData([]);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setExpirationDays(item.expiration.toString());
        setFilteredData([]);
        setQuery(item.name);
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Enter food item"
                value={query}
                onChangeText={handleSearch}
                style={styles.textInput}
            />
            {filteredData.length > 0 && (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectItem(item)}>
                            <Text style={styles.listItem}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    style={styles.flatList}
                />
            )}
            <TextInput
                placeholder="Enter days before expiration"
                value={expirationDays}
                onChangeText={setExpirationDays}
                keyboardType="numeric"
                style={styles.textInput}
            />
        </View>
    );
};

export default SearchScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    textInput: {
        borderBottomWidth: 1,
        marginBottom: 10,
        padding: 8,
        zIndex: 1, // Ensures TextInput stays on top when FlatList is not shown
    },
    flatList: {
        position: 'absolute',
        top: 45, // Adjust based on the position of the first TextInput
        left: 20, // Adjust based on your container's padding
        right: 20, // Adjust based on your container's padding
        backgroundColor: 'white',
        zIndex: 2, // Ensures FlatList is shown above TextInput
        maxHeight: 150, // Adjust based on how many items you want visible at once
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    listItem: {
        padding: 10,
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
})